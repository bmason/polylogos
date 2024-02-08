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
import { GiTomato } from 'react-icons/gi';
import { TfiWrite } from 'react-icons/tfi';
import { IoStop } from 'react-icons/io5';

//import { ErrorMessage } from "@hookform/error-message";
import AlertPop from "../components/alertPop";
import Select from "react-select";
import axios from '../lib/axios';
import dateUtils from '../lib/date'
import { HamburgerIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons'
import { CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH } from "next/dist/shared/lib/constants";
import { useTags } from '../providers/Tag'
import { useAuth } from '../providers/Auth'

export default function Builder({ state }) {
  const toast = useToast();
  const [data, setData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [error, setError] = useState(null);
  const Tags = useTags()
  const { jwt, user } = useAuth();

  const {
    control,
    reset,
    register,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [selectedOptions, setSelectedOptions] = useState();

  let openEvent
  const [oneOpenEvent, setOneOpenEvent] = useState();

  const onSubmit = (data) => {
    let event = { 'description': data.description, 'note': data.note }

    console.log('data', data)

    if (data.tags) {
      event.tags = data.tags.map(e => e.id)

      event.details = {}
      Tags.allDetails(data.tags).forEach(e => {
        if (e.details && e.details.fields)
          e.details.fields.forEach(f => event.details[f.title] = data[f.title])
      })
    }

    event.details = JSON.stringify(event.details)
    console.log('event ', event)

    event.userId = user.id
    event.complete = true

    axios
      .post('http://localhost:1337/api/events', { data: event }, {
        headers: { 'Authorization': `bearer ${jwt}` }
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

    if (!window.Notification) {
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




    Tags.getList()

    axios
      .get('/api/activities?populate=tags,events', {
        headers: { 'Authorization': `bearer ${jwt}` }
      })
      .then(({ data }) => {     console.log('act', data)    


        data.data.forEach(e => { //replace with find
          Object.assign(e, e.attributes)
          e.events = e.events.data
          if(e.events) e.events.forEach(f => {
            Object.assign(f, f.attributes)
            f.details = JSON.parse(f.details)
            if(!f.complete && f.details && f.details.pomodoroStart) {
                reset({'description': f})
                pomodoro(e, f)
            }
          })

        })
        setData(data.data)

      })
      .catch((error) => console.log(error)) //(error) => fail(error))



  }, [])

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [timerString, setTimerString] = useState()

  const [displayTags, setdisplayTags] = useState([])

  let remindOnce = false

  const openDialog = () => {
    reset()
    setdisplayTags([])
    onOpen()

  }


  function playSound(soundfile_mp) {
    if ("Audio" in window) {
        var a = new Audio();

        if (!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/,
                '')))
            a.src = soundfile_mp;

        a.autoplay = true;
    //setTimeout(function (){a.pause()}, 10000);
        return;
  }
}



  function pomodoro(e, startedEvent=null) {

    let event
    if (!startedEvent) {
      event = {activity: e.id, userId: user.id ,tags: e.tags.data.map(f=>f.id), complete: false, details: {pomodoroStart: (new Date()).toISOString()}}

    let updateEvent = {...event}
    updateEvent.details = JSON.stringify(event.details)
console.log('update', updateEvent)
    axios
    .post('/api/events',{data: updateEvent}, {
      headers: { 'Authorization': `bearer ${jwt}` }
    })
    .then(({ data }) => {  console.log('event', data)    
      event.id = data.data.id
  
  
    })
    .catch((error) => console.log(error)) //(error) => fail(error)) 
  } else event = startedEvent


    setOneOpenEvent(event)
    e.openEvent = event
    openEvent = event
    remindOnce = true


    timerStart()
    forceUpdate()
    console.log('activity',e)
  }
  
  function timerStart() {
    displayTime()

    if (!openEvent.timerID) {    //console.log('openEvent', openEvent)

      let tid = setInterval(displayTime, 1000)
      openEvent.timerID = tid
    }
  } 

function displayTime() { 
  if(openEvent && openEvent.details.pomodoroStart) {
    let timeElapsed = (new Date()).getTime() - (new Date(openEvent.details.pomodoroStart)).getTime() 
//console.log(timeElapsed,(new Date()).getSeconds(),(new Date(openEvent.details.pomodoroStart)).getSeconds() );

    let timeRemaining = 25*60 - Math.floor(timeElapsed/1000)

    if (remindOnce && (timeRemaining <= 0)) {
      remindOnce = false
      playSound('https://myally.co/sites/common/Alarm-Fast.mp3');
      spawnNotification('break time 🏖', '/favicon.ico', 'Pomodoro')
    }

    let newTime = displayTime(timeRemaining)
    document.title = (newTime.negative ? '🏖': '🖥️') + newTime.timeString
    newTime.timeString = document.title
    setTimerString(newTime)
  }
}

function spawnNotification(body, icon, title) {
  var options = {
      body: body,
      icon: icon
  };
  
	try { 
		var n = new Notification(title, options);
		n.onclick = () =>{ 
      window.focus();
      n.close()
    }
	} catch(err) {
		Notification.requestPermission(function(result) {
		  if (result === 'granted') {
			navigator.serviceWorker.ready.then(function(registration) {
			  n = registration.showNotification(title, options);
			  n.onclick = () =>{          
          window.focus();
        }
			});
		  }
		});
  
	}
   
}	

  function pomodoroStopAndWrite(activity) { 
    clearInterval(activity.openEvent.timerID)
    delete activity.openEvent.timerID
    activity.openEvent.details.pomodoroStop = (new Date()).toISOString()
    console.log('event', activity.openEvent)
    setOneOpenEvent(null)
    setTimerString(null)

    pomodoroWrite(activity)    
    data.forEach(e=> {if(e.openEvent) delete e.openEvent})
    forceUpdate()


    document.title = 'Activities'
  }

function pomodoroWrite (activity) {  //console.log('act', activity)

  let updateEvent = {description: getValues().description}
  if (activity.openEvent.details.pomodoroStop) {
    updateEvent.details = JSON.stringify(activity.openEvent.details)
    updateEvent.complete = true
  }

  axios
  .put(`/api/events/${activity.openEvent.id}`,{data: updateEvent}, {
    headers: { 'Authorization': `bearer ${jwt}` }
  })
  .then(({ data }) => {  //console.log('event', data)    



  })
  .catch((error) => console.log(error)) //(error) => fail(error)) 


}


  function handleTagChange(e) {
    //console.log('change ', getValues(), e)
    //console.log('line ', TagUtils.withParents(e))
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
                {!oneOpenEvent && <MenuItem  icon={<GiTomato color='red'/>} onClick={() => pomodoro(e)}>
                  Pomodoro
                </MenuItem>}
              </MenuList>
            </Menu>

            {e.openEvent && 
              <Box key={e.openEvent.id} mt='6px' pos="relative" boxShadow='xs' p='6' rounded='md' bg='white'>
                {new Date(e.openEvent.details.pomodoroStart).toLocaleTimeString()}


              <form >
                <VStack>
                  <Input
                    type="text"
                    placeholder="description"
                    {...register("description", {

                      maxLength: 80
                    })}
                  />

                </VStack>

              </form>
              <HStack>
              <Button  onClick={()=>pomodoroWrite(e)}  rightIcon={<TfiWrite />}></Button>

                <Button  onClick={()=>pomodoroStopAndWrite(e)}  leftIcon={ <IoStop/>} rightIcon={<TfiWrite />}  ></Button>
              </HStack>
              
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
          <Box color={timerString.negative ? 'pink' : 'black'}>
            {timerString.timeString}
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
