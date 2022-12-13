import React, { useState, useEffect, useId } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody, useDisclosure,
  ModalCloseButton,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { VStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid, IconButton } from "@chakra-ui/react";
import { useForm, Controller, } from "react-hook-form";
import { GiTomato } from 'react-icons/Gi';

//import { ErrorMessage } from "@hookform/error-message";
import AlertPop from "../components/alertPop";
import commonTagCode from "../components/commonTagCode";
import Select from "react-select";
import axios from '../lib/axios';
import { HamburgerIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons'
import { CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH } from "next/dist/shared/lib/constants";

export default function Builder({ state }) {
  const toast = useToast();
  const [data, setData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const TagUtils = commonTagCode()
  const {
    control,
    reset,
    register,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm();



  const onSubmit = (data) => {
    let event = { 'description': data.description, 'note': data.note }

    console.log('data', data)

    if (data.tags) {
      event.tags = data.tags.map(e => e.id)

      event.details = {}
      TagUtils.withParents(data.tags).forEach(e => {
        if (e.details && e.details.fields)
          e.details.fields.forEach(f => event.details[f.title] = data[f.title])
      })
    }

    event.details = JSON.stringify(event.details)
    console.log('event ', event)

    event.userId = localStorage.getItem('userId')
    event.completed = true

    axios
      .post('http://localhost:1337/api/events', { data: event }, {
        headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
      })
      .then(({ data }) => {//console.log('tags', data); 
        onClose()
        reset()
        toast({
          title: `${event.description} saved`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      })
      .catch((error) => console.log(error)) //(error) => fail(error))
  };

  const [selectedOptions, setSelectedOptions] = useState();

  let openEvent = null

  function details(displayTags) {

    let fieldTags = displayTags.filter(e => e.details && e.details.fields)

    return (fieldTags.map(e =>
      <HStack w='100%' key={e.id}>
        <Box w='100%' >
          <Input
            type={e.details.fields[0].type}
            placeholder={e.details.fields[0].title}
            {...register(e.details.fields[0].title, {})}
          />
        </Box>
      </HStack>))
  }

  useEffect(() => {  //console.log('log', state.isLogged)

    if (1) {//!window.Notification
      console.log('Browser does not support notifications.')
    } else {
      // check if permission is already granted
      if (Notification.permission === 'granted') {
        console.log('granted')
      } else {
        // request permission from the user
        Notification.requestPermission()
          .then(function (p) {
            if (p === 'granted') {
              console.log('requesed - granted')
            } else {
              console.log('User blocked notifications.')
            }
          })
          .catch(function (err) {
            console.error(err)
          })
      }
    }

    TagUtils.get(setTags)

    axios
      .get('/api/activities?populate=tags', {
        headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
      })
      .then(({ data }) => {     //console.log('act', data)    
        data.data.forEach(e => Object.assign(e, e.attributes))
        setData(data.data)

      })
      .catch((error) => console.log(error)) //(error) => fail(error))



  }, [])

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [timerString, setTimerString] = useState()

  const [displayTags, setdisplayTags] = useState([])


  const openDialog = () => {
    reset()
    setdisplayTags([])
    onOpen()

  }

  function pomodoro(e) {
    let event = {tags: e.tags.data, details: {pomodoroStart: (new Date()).toISOString()}}
    openEvent = event
    e.openEvent = event
    console.log(e)
    timerStart()
    forceUpdate()
  }
  
  function timerStart() {
    displayTime()
    setInterval(displayTime , 1000)

  } 

function displayTime() {
  if(openEvent && openEvent.details.pomodoroStart) {
    let timeElapsed = (new Date()).getTime() - (new Date(openEvent.details.pomodoroStart)).getTime() 
//console.log(timeElapsed,(new Date()).getSeconds(),(new Date(openEvent.details.pomodoroStart)).getSeconds() );
    setTimerString(TagUtils.displayTime(25*60 - Math.floor(timeElapsed/1000)))
  }
}


  function handleTagChange(e) {
    console.log('change ', getValues(), e)
    console.log('line ', TagUtils.withParents(e))
    setdisplayTags(TagUtils.withParents(e))
  }

  function displayActivities(activities) {

    if (Array.isArray(activities))
      return (
        activities.map((e) =>
          <Box key={e.id} mt='6px' pos="relative" boxShadow='xs' p='6' rounded='md' bg='white'>
            {e.name}


            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<HamburgerIcon />}
                variant='outline'
                pos="absolute" top="0" right="0"
              />
              <MenuList>

                <MenuItem icon={<DeleteIcon />} onClick={() => promptDeleteTag(e)}>
                  Delete
                </MenuItem>
                <MenuItem icon={<EditIcon />} onClick={() => editTag(e)}>
                  Edit
                </MenuItem>
                <MenuItem  icon={<GiTomato color='red'/>} onClick={() => pomodoro(e)}>
                  Pomodoro
                </MenuItem>
              </MenuList>
            </Menu>

            {e.openEvent && 
              <Box key={e.openEvent.id} mt='6px' pos="relative" boxShadow='xs' p='6' rounded='md' bg='white'>
                {new Date(e.openEvent.details.pomodoroStart).toLocaleTimeString()}
              </Box>
            }

          </Box>
        )
      )
  }


  return (

    <VStack mt={4} >

      <SimpleGrid w='500px'
        bg='gray.50'
        columns='1'
        spacing='8'
        p='10'
        textAlign='center'
        rounded='lg'
        color='gray.400'
      >
        <IconButton width='10px' onClick={openDialog} icon={<AddIcon />} />

        {timerString &&
          <Box>
            {timerString} 
          </Box> 
        }

        {displayActivities(data)}
        
      </SimpleGrid>









      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Event</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box   >
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack>
                  <Input
                    type="text"
                    placeholder="description"
                    {...register("description", {

                      maxLength: 80
                    })}
                  />
                  {errors.name && <AlertPop title={errors.name.message} />}
                  <Input
                    type="text"
                    placeholder="note"
                    {...register("note", {
                      minLength: 3,
                      maxLength: 100
                    })}
                  />
                  {errors.description && <AlertPop title={errors.description.message} />}




                  <Controller
                    name="tags"
                    type="select"
                    control={control}

                    rules={{}}
                    render={({ field }) => (
                      <div style={{ width: '100%' }}>
                        <Select {...field}
                          onChange={e => {
                            field.onChange(e)
                            handleTagChange(e)
                          }
                          }
                          placeholder='tags'
                          isMulti={true}
                          options={TagUtils.flattenTags(tags, [])}
                        />
                      </div>
                    )}
                  />

                  {details(displayTags)}

                </VStack>
                <Button
                  borderRadius="md"
                  bg="cyan.600"
                  _hover={{ bg: "cyan.200" }}
                  type="submit"
                >
                  Save
                </Button>
              </form>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>


          </ModalFooter>


        </ModalContent>
      </Modal>



    </VStack>
  );
}
