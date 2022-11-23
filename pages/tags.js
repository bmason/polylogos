import React, { useState, useEffect, useId} from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody, useDisclosure ,
    ModalCloseButton,
  } from '@chakra-ui/react'
  import {VStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid, IconButton  } from "@chakra-ui/react";
  import { useForm , Controller, } from "react-hook-form";

  //import { ErrorMessage } from "@hookform/error-message";
  import AlertPop from "../components/AlertPop";
  import commonTagCode from "../components/commonTagCode";
  import Select from "react-select";
  import axios from '../lib/axios';
  import { PhoneIcon, AddIcon, WarningIcon } from '@chakra-ui/icons'
  
  export default function Builder() {
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
      handleSubmit,
      formState: { errors }
    } = useForm();

  

    const onSubmit = (data) => {
      TagUtils.store(data, tagUpdated, setError)
      console.log(data);

 
      //setData(data);
    };
    const [selectedOptions, setSelectedOptions] = useState(); 


    useEffect(() => {
        TagUtils.get(setTags)

      }, [])

    
    function tagHierarchy(tags) {

      //console.log('ta tags', tags)
      if (Array.isArray(tags))
      return (
         
        tags.map(({ id, name, children }) => 
          <Box key={id} mt='6px' boxShadow='xs' p='6' rounded='md' bg='white'>
            {name}
              {tagHierarchy(children)}
  
          </Box>
        )
      )
    }

    const [tabIndex, setTabIndex] = useState(0)
  
    const handleSliderChange = (event) => {
      setTabIndex(parseInt(event.target.value, 10))
    }
  
    const handleTabsChange = (index) => {
      setTabIndex(index)
    }
    
   const openDialog = () => {
    reset()
    onOpen()

   }



 

   const tagUpdated = () => {
    TagUtils.get(setTags)
    onClose()
    reset()
    toast({
      title: "Submitted!",
      status: "success",
      duration: 3000,
      isClosable: true
    });
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

{tagHierarchy(tags)}

</SimpleGrid> 


 


<Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Tag</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Box   >
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack>
            <Input
              type="text"
              placeholder="name"
              {...register("name", {
                required: "Please enter first name",
                minLength: 3,
                maxLength: 80
              })}
            />
            {errors.name && <AlertPop title={errors.name.message} />}
            <Input
              type="text"
              placeholder="description"
              {...register("description", {
                minLength: 3,
                maxLength: 100
              })}
            />
    {errors.description && <AlertPop title={errors.description.message} />}




        <Controller
            name="parent"
            control={control}
            rules={{ }}
            render={({ field }) => (
              <div style={{width: '100%'}}>
                <Select {...field}  options={TagUtils.flattenTags(tags, [])}
                />
              </div>
            )}
          />


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
      <Button variant='ghost'  mr={3} onClick={onClose}>
        Cancel
      </Button>


    </ModalFooter>
  </ModalContent>
</Modal>
    


      </VStack>
    );
  }
  