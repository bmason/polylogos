import { useState, useEffect, useRef, useId } from 'react';
import Link from 'next/link';

import axios from '../lib/axios';
import Head from "next/head"
import MyEditor from "../components/mySlate"

import {toLocalISOString} from '../lib/date'

import {
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody, 
    ModalCloseButton,
    HStack,
    withDefaultColorScheme,
  } from '@chakra-ui/react'
  import {VStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid, IconButton  } from "@chakra-ui/react";
  import { useForm , Controller, } from "react-hook-form";

  //import { ErrorMessage } from "@hookform/error-message";
  import AlertPop from "../components/alertPop";
  import Select from "react-select";
  import { PhoneIcon, AddIcon, WarningIcon } from '@chakra-ui/icons'
  import { setNestedObjectValues } from 'formik';
  import { useAuth } from '../providers/Auth'
  import {useTags} from '../providers/Tag'
import MySlate from '../components/mySlate';
  


const Homepage = () => {

      const { jwt, user } = useAuth()

      const btnRef = useRef();
     
      const toast = useToast();
      const [data, setData] = useState();
      const { isOpen, onOpen, onClose } = useDisclosure();
      const [error, setError] = useState(null);
      const [tags, setTags] = useState([]);
      const Tags = useTags()

      const {
        control,
        reset,
        register,
        getValues,
        setValue,
        handleSubmit,
        formState: { errors }
      } = useForm();

      const onSubmit = (data) => {

        console.log('data', data, getValues())

        //return
        let event = {'dateTime': data.dateTime, 'description': data.description, 'note':data.note, complete: true}

        event.dateTime = new Date(event.dateTime).toISOString()


        if (data.tags) {
          event.tags = data.tags.map(e => e.id)

            event.details = {}
            Tags.allDetails(data.tags).forEach(e => {
                event.details[e.title] = data[e.title]
                if (e.type == 'currency')
                  event.details.currency = data.currency ? data.currency.id : e.defaultCurrency
                  
            })
        }
          

        event.details = JSON.stringify(event.details)
        console.log('event ', event) 

        event.userId = user.id
        event.complete = true
        
        axios
        .post('/api/events', {data: event}, {
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

    const [selectedOptions, setSelectedOptions] = useState(); 


    function details (fieldTags) { 

        return (fieldTags.map(e => {console.log(e);
           return (<HStack w='100%'  key={e.title}>  
                <Box w={e.type == 'currency' ? '70%' : '100%'} >
                    <Input
                        type={e.type == 'currency' ? 'number' : 'number'}
                        placeholder={e.title}
                        {...register(e.title, {})}

                    />
                </Box>
                {e.type == 'currency' &&
                  <Box w='30%'>
                    <Controller
                        name="currency"
                        type="select"
                        control={control}
                        
                        render={({ field }) => (
                            <Select 
                                {...field}   
                          
                                options={[{id: 'THB', label:'THB'}, {id:'USD', label:'USD'}]}
                                defaultValue={{id: e.defaultCurrency, label: e.defaultCurrency}}
                            />

                        )}
                    />
                  </Box>  
                }
            </HStack>)}))
    }

    useEffect(() => {
        Tags.getList()
        setdisplayTags([])

      }, [Tags]) 



    

    const [displayTags, setdisplayTags] = useState([])


  
    
   const openDialog = () => {
    reset()
    setdisplayTags([])
  
    onOpen()

   }


function handleTagChange(e) {
    console.log('change ', getValues(), e)
    console.log('line ', Tags.allDetails(e))
    console.log('tags', Tags.getList())
    setdisplayTags(Tags.allDetails(e))


}


    return (
      <>


        


            <Head>
       
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="manifest" href="/site.webmanifest" />

      </Head>        
 


            <main>

            </main>



      <VStack mt={4} > 

     { user &&
  
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

        </SimpleGrid> 
      }

      <MySlate></MySlate>
      {!user &&
      <Text>welcome</Text>

      }


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
              type="datetime-local"
              {...register("dateTime", {
              })}
              step="any"
              defaultValue={toLocalISOString()}
            />


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
           
            rules={{ }}
            render={({ field }) => (
              <div style={{width: '100%'}}>
                <Select {...field}   
                    onChange={e => { 
                      field.onChange(e)
                      handleTagChange(e)}
                    }
                    placeholder='tags'
                    isMulti={true}
                    options={Tags.getList()}
                />
              </div>
            )}
          />

    {details(displayTags) }

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
      <Button variant='ghost'  mr={3} onClick={() => { onClose();}}>
        Cancel
      </Button>


    </ModalFooter>


  </ModalContent>
</Modal>
    


      </VStack>

  


      </>
    )
    
}

export default Homepage;