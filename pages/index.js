import { useState, useEffect, useRef, useId } from 'react';
import Link from 'next/link';

import axios from '../lib/axios';
import commonCode from "../components/commonTagCode";
import Head from "next/head"

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
  } from '@chakra-ui/react'
  import {VStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid, IconButton  } from "@chakra-ui/react";
  import { useForm , Controller, } from "react-hook-form";

  //import { ErrorMessage } from "@hookform/error-message";
  import AlertPop from "../components/alertPop";
  import commonTagCode from "../components/commonTagCode";
  import Select from "react-select";
  import { PhoneIcon, AddIcon, WarningIcon } from '@chakra-ui/icons'
import { setNestedObjectValues } from 'formik';


  


const Homepage = () => {




    const [isLogged, setIsLogged] = useState();

    useEffect(() => {
        setIsLogged(!!localStorage.getItem('jwt'));
    }, []);

    const flexSettings = {
        flex: "1",
        minW: "300px",
        textAlign: "center",
        color: "white",
        mx: "6",
        mb: "6"
      };
    
      const gridSettings = {
        w: "100%",
        textAlign: "center",
        color: "white",
      };



      const btnRef = useRef();
     
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
        setValue,
        handleSubmit,
        formState: { errors }
      } = useForm();

      const onSubmit = (data) => {

        console.log('data', data, getValues())

        //return
        let event = {'description': data.description, 'note':data.note, complete: true}

        if (data.tags) {
          event.tags = data.tags.map(e => e.id)

            event.details = {}
            TagUtils.withParents(data.tags).forEach(e => {
                if (e.details && e.details.fields) 
                    e.details.fields.forEach(f => {event.details[f.title] = data[f.title]
                      if (f.type == 'currency')
                        event.details.currency = data.currency ? data.currency.id : f.defaultCurrency
                    })
            })
        }
          

        event.details = JSON.stringify(event.details)
        console.log('event ', event) 

        event.userId = localStorage.getItem('userId')
        event.completed = true
        
        axios
        .post('/api/events', {data: event}, {
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


    function details (displayTags) { 

        let fieldTags = displayTags.filter(e => e.details && e.details.fields) 

        return (fieldTags.map(e => e.details.fields.map(tagField =>
            <HStack w='100%'  key={e.id+tagField.title}>  
                <Box w={tagField.type == 'currency' ? '70%' : '100%'} >
                    <Input
                        type={tagField.type == 'currency' ? 'number' : 'date'}
                        placeholder={tagField.title}
                        {...register(tagField.title, {})}
                       defaultValue = {tagField.type == 'date'  
                        ? new Date().toISOString().substring(0,10)
                        : null}
                    />
                </Box>
                {tagField.type == 'currency' &&
                  <Box w='30%'>
                    <Controller
                        name="currency"
                        type="select"
                        control={control}
                        
                        render={({ field }) => (
                            <Select 
                                {...field}   
                          
                                options={[{id: 'THB', label:'THB'}, {id:'USD', label:'USD'}]}
                                defaultValue={{id: tagField.defaultCurrency, label: tagField.defaultCurrency}}
                            />

                        )}
                    />
                  </Box>  
                }
            </HStack>))).flat()
    }

    useEffect(() => {
        TagUtils.get(setTags)
        setdisplayTags([])

     /*    axios
        .get('/api/events?filters[tags][id][$in][0]=12&filters[tags][id][$in][1]=14', {
          headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
        })
        .then(({ data }) => {console.log('events', data); 


        })
        .catch((error) => console.log(error))
*/

      }, []) 


 
    

    const [displayTags, setdisplayTags] = useState([])
    
    
   const openDialog = () => {
    reset()
    setdisplayTags([])
  
    onOpen()

   }


function handleTagChange(e) {
    console.log('change ', getValues(), e)
    console.log('line ', TagUtils.withParents(e))
    setdisplayTags(TagUtils.withParents(e))


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
           
            rules={{ }}
            render={({ field }) => (
              <div style={{width: '100%'}}>
                <Select {...field}   
                    onChange={e => { field.onChange(e)
                        handleTagChange(e)}
                    }
                    placeholder='tags'
                    isMulti={true}
                    options={TagUtils.flattenTags(tags, [])}
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
      <Button variant='ghost'  mr={3} onClick={() => { reset({description:'test', currency:{id:'THB', label: 'THB'}}); console.log('reset ', getValues());}}>
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