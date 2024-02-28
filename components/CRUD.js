import React, { useState, useEffect, useId } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody, useDisclosure,
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
import { VStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid, IconButton } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useTags } from '../providers/Tag'
import { useAuth } from '../providers/Auth'

//import { ErrorMessage } from "@hookform/error-message";
import AlertPop from "../components/alertPop";

import Select from "react-select";
import axios from '../lib/axios';
import { HamburgerIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons'
import { toLocalISOString } from "../lib/date";




export default function Crud(props) {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [error, setError] = useState(null);
    const Tags = useTags()
    const { jwt, user } = useAuth();

    const {
        control,
        reset,
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors }
    } = useForm();

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const onSubmit = (data) => {
        console.log('submit', data)
        if (opItem)
            data.id = opItem.id

        let updateItem = {description: data.description, note: data.note, dateTime: (new Date(data.dateTime)).toISOString(), details: data.details } //todo   isDirty-defaultValue  fields by type?
        axios
            .put(`/api/${props.model}/${data.id}`, { data: updateItem }, {
                headers: { 'Authorization': `bearer ${jwt}` }
            })
            .then((resp) => {
                console.log('resp', resp)
                let updatedEvent = props.items.find(e => e.id == resp.data.data.id)

                updatedEvent.details = JSON.parse(resp.data.data.attributes.details)
                //forceUpdate()
                onClose()

            })
            .catch((error) => console.log(error)) //(error) => fail(error)) 




        //setData(data);
    };



    useEffect(() => {
        Tags.getList()

    }, [])

 

    const [opItem, setOpItem] = useState();

    function deleteItem() {
        console.log(alertProps)

        axios
        .delete(`/api/${props.model}/${opItem.id}`, {
          headers: { 'Authorization': `bearer ${jwt}` }
        })
        .then(({ data }) => {console.log('del item', data); 

                //todo  refresh
        })
        .catch((error) => console.log(error))

        alertClose()
    }
    function promptDeleteItem(item) {
        setOpItem(item)
        alertOpen(true, {item: item })
    }

    function editItem(event) {
        console.log('edit', event)
        setOpItem(event)  
        //todo  class?  props?
        setValue('description', event.description)
        setValue('tags', Tags.withContext(event.tags), { shouldValidate: false, shouldDirty: false })
        setValue('details', JSON.stringify(event.details))
        setValue('dateTime', toLocalISOString(event.dateTime))
        onOpen()
    }

    const { getDisclosureProps: getAlertProps, isOpen: alertIsOpen, onOpen: alertOpen, onClose: alertClose } = useDisclosure()
    const alertProps = getAlertProps()

    const cancelRef = React.useRef()






    const openDialog = () => {
        setOpItem(null)
        reset()
        onOpen()

    }




    const itemUpdated = () => {

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

        <>


                {props.items.map((e) =>
                    <Box key={e.id} mt='6px' pos="relative" boxShadow='xs' p='6' rounded='md' bg='white'>

                        <props.displayItem item={ e }/>
                        {!e.summary && <Menu>
                            <MenuButton
                                as={IconButton}
                                aria-label='Options'
                                icon={<HamburgerIcon />}
                                variant='outline'
                                pos="absolute" top="0" right="0"
                            />
                            <MenuList>

                                <MenuItem icon={<DeleteIcon />} onClick={() => promptDeleteItem(e)}>
                                    Delete
                                </MenuItem>
                                <MenuItem icon={<EditIcon />} onClick={() => editItem(e)}>
                                    Edit
                                </MenuItem>

                            </MenuList>
                        </Menu>}



                    </Box>
                )}


            <AlertDialog
                isOpen={alertIsOpen}
                leastDestructiveRef={cancelRef}
                onClose={alertClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Item
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can&apos;t undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={alertClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={deleteItem} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>










            <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Event</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box   >
                            <props.editForm control={control}  
                                errors={errors}  
                                handleSubmit={handleSubmit}  
                                register={register}   
                                onSubmit={ onSubmit}/>

                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant='ghost' mr={3} onClick={onClose}>
                            Cancel
                        </Button>


                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>


    );
}
