'use client'

import React, { useState, useEffect, useId} from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody, useDisclosure ,
    ModalCloseButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,   
   
  } from '@chakra-ui/react'
  import {VStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid, IconButton  } from "@chakra-ui/react";
  import { useForm , Controller} from "react-hook-form";

  //import { ErrorMessage } from "@hookform/error-message";
  import AlertPop from "../components/alertPop";
  import Select from "react-select";
  import axios from '../lib/axios';
  import { HamburgerIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons'
  import {useTags} from '../providers/Tag'
  


  export default function Builder() {
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
      handleSubmit,
      setValue,
      formState: { errors }
    } = useForm();

    const onSubmit = (data) => { console.log('submit', data)
      if(opTag)
        data.id = opTag.id
   //   TagUtils.store(data, tagUpdated, setError)


 
      //setData(data);
    };
    const [selectedOptions, setSelectedOptions] = useState(); 


    useEffect(() => {
        console.log('getLIST', Tags.getList())
    //    TagUtils.get(setTags)

      }, [Tags])

    const [opTag, setOpTag] = useState();

function deleteTag(){ console.log(alertProps)
  //TagUtils.delete(opTag.id, setTags)
  alertClose()
}
function promptDeleteTag(tag) { 
  setOpTag(tag) 
  alertOpen(true, {tag:tag})
}

function editTag(tag) {
  setOpTag(tag) 
  setValue('name', tag.name)
  setValue('description', tag.description)
  let isolatedTag = Object.assign({}, tag.parent)
  delete (isolatedTag.children)
  delete (isolatedTag.parent)
  setValue('parent', isolatedTag, { shouldValidate: false, shouldDirty: false })
  onOpen()
}

const { getDisclosureProps: getAlertProps, isOpen: alertIsOpen, onOpen: alertOpen, onClose: alertClose } = useDisclosure()
const alertProps = getAlertProps()

const cancelRef = React.useRef()

    function tagHierarchy(tags) {

      //console.log('ta tags', tags)
      if (Array.isArray(tags))
      return (
         
        tags.map((e) => 
          <Box key={e.id} mt='6px' pos="relative" boxShadow='xs' p='6' rounded='md' bg='white'>
            {e.name}
              {tagHierarchy(e.children)}

              <Menu>
  <MenuButton
    as={IconButton}
    aria-label='Options'
    icon={<HamburgerIcon />}
    variant='outline'
    pos="absolute" top="0" right="0"
  />
  <MenuList>

    <MenuItem icon={<DeleteIcon />} onClick={() =>promptDeleteTag(e)}>
      Delete
    </MenuItem>
    <MenuItem icon={<EditIcon />} onClick={() =>editTag(e)}>
      Edit
    </MenuItem>
  </MenuList>
</Menu>              
  
          </Box>
        )
      )
    }

  

    
   const openDialog = () => {
    setOpTag(null)
    reset()
    onOpen()

   }



 

   const tagUpdated = () => {
    //TagUtils.get(setTags)
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

{tagHierarchy(Tags.getTree())}

</SimpleGrid> 

<AlertDialog
        isOpen={alertIsOpen}
        leastDestructiveRef={cancelRef}
        onClose={alertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Customer
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can&apos;t undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={alertClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={deleteTag} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
 


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
                required: "Please enter name",
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
                <Select {...field}  options={Tags.getList()}
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
  