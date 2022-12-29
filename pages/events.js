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

//import { ErrorMessage } from "@hookform/error-message";
import AlertPop from "../components/alertPop";
import commonTagCode from "../components/commonTagCode";
import Select from "react-select";
import axios from '../lib/axios';
import { HamburgerIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons'




export default function Builder() {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [error, setError] = useState(null);
    const [tags, setTags] = useState([]);
    const TagUtils = commonTagCode()
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
        if (opTag)
            data.id = opTag.id

        let updateEvent = { details: data.details }
        axios
            .put(`/api/events/${data.id}`, { data: updateEvent }, {
                headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
            })
            .then((resp) => {
                console.log('resp', resp)
                let updatedEvent = events.find(e => e.id == resp.data.data.id)

                updatedEvent.details = JSON.parse(resp.data.data.attributes.details)
                //forceUpdate()
                onClose()

            })
            .catch((error) => console.log(error)) //(error) => fail(error)) 




        //setData(data);
    };
    const [selectedOptions, setSelectedOptions] = useState();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        TagUtils.get(setTags)

    }, [])

    function spliceSummaryInto(items, options) {
        //let inDay =  inWeek = false
        //let daySum = weekSum = 
        let total = 0, monthSum = 0, inMonth = false

        let reportOptions = [...options]; //console.log('report', reportOptions)

        for (let i = 0; i < items.length; i++) {

            if (items[i].details) {
                if (items[i].details.amount) {
                    let multiplier = items[i].details.currency == 'USD' ? 36 : 1
                    var itemAmount = items[i].details.amount * multiplier
                }
                if (items[i].details.startPomodoro && items[i].details.stopPomodoro) {
                    itemTime = Math.floor(((new Date(items[i].details.stopPomodoro)) - (new Date(items[i].details.startPomodoro))) / 1000)
                }
                getDatesFromItem(items[i])

                for (let ro of reportOptions) {
                    if (ro.period == 'total' || items[i].dates[ro.period] == ro.in)
                        if (ro.detail == 'amount')
                            ro.sum = itemAmount + (ro.sum ? ro.sum : 0)
                        else {
                            ro.time = itemTime + (ro.time ? ro.time : 0)
                            if (itemTime > 25 * 60)
                                ro.pomodoro = 1 + (ro.pomodoro ? ro.pomodoro : 0)
                            else
                                ro.brokenPomodoro = 1 + (ro.brokenPomodoro ? ro.brokenPomodoro : 0)
                        }
                    else {
                        let lastItem = items[i]
                        if (ro.in)
                            items.splice(i++, 0, { id: ro.period + i, description: `${ro.label}  ${ro.in} ${ro.sum}` })
                        ro.in = lastItem.dates[ro.period]
                        if (ro.detail == 'amount')
                            ro.sum = itemAmount
                        else {
                            ro.time = itemTime
                            if (itemTime >= 25 * 60)
                                ro.pomodoro = 1
                            else
                                ro.brokenPomodoro = 1
                        }

                    }


                }
            }
        }

        let lastItem = items[items.length-1]

        for (let ro of reportOptions) {
            if (ro.in )
                items.splice(items.length, 0, { id: ro.period + 'last', description: `${ro.label}  ${ro.in} ${ro.sum}` })
            if (ro.period =='total')
                items.splice(items.length, 0, { id: ro.period + 'last', description: `${ro.label}  ${items[0].dates.day}-${lastItem.dates.day} ${ro.sum}` })
        }
        return items
    }

    function getDatesFromItem(item) {
        if (!item.dates) {


            if (item.details && item.details.date) {
                let dates = item.details.date.split('-')
                item.dates = { year: dates[0], month: `${dates[1]}/${dates[0].substr(2)}`, day: `${dates[1]}/${dates[2]}/${dates[0].substr(2)}`, sortDate: `${dates[0]}-${dates[1].padStart(2, '0')}-${dates[2].padStart(2, '0')}` }

            } else {

                let dates = (new Date(item.attributes.createdAt).toLocaleDateString()).split('/')
                item.dates = { year: dates[2], month: `${dates[0]}/${dates[2].substr(2)}`, day: `${dates[0]}/${dates[1]}/${dates[2].substr(2)}`, sortDate: `${dates[2]}-${dates[0].padStart(2, '0')}-${dates[1].padStart(2, '0')}` }
            }

            let currentDate = new Date();
            let startDate = new Date(1970, 0, 1);
            var days = Math.floor((currentDate - startDate) /
                (24 * 60 * 60 * 1000));

            item.dates.week = Math.ceil(days / 7);
        }

        return item.dates

    }

    const [opTag, setOpTag] = useState();

    function deleteTag() {
        console.log(alertProps)
        TagUtils.delete(opTag.id, setTags)
        alertClose()
    }
    function promptDeleteTag(tag) {
        setOpTag(tag)
        alertOpen(true, { tag: tag })
    }

    function editTag(event) {
        console.log('edit', event)
        setOpTag(event)
        setValue('description', event.description)
        setValue('tags', TagUtils.withContext(event.tags, TagUtils.flattenTags(tags, [])), { shouldValidate: false, shouldDirty: false })
        setValue('details', JSON.stringify(event.details))
        onOpen()
    }

    const { getDisclosureProps: getAlertProps, isOpen: alertIsOpen, onOpen: alertOpen, onClose: alertClose } = useDisclosure()
    const alertProps = getAlertProps()

    const cancelRef = React.useRef()






    const openDialog = () => {
        setOpTag(null)
        reset()
        onOpen()

    }


    function find() {
        console.log('values', getValues(), tags)


        let family = TagUtils.family(getValues().findTags, tags)
        let qs = ''
        for (let i = 0; i < family.length; i++) {
            qs += `&filters[tags][id][$in][${i}]=${family[i].id}`
        }


        axios
            .get('/api/events?populate=activity,tags&pagination[limit]=-1' + qs, {
                headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
            })
            .then(({ data }) => {
                console.log('events', data)


                data.data.forEach(e => { //replace with find
                    Object.assign(e, e.attributes)
                    e.details = JSON.parse(e.details)
                    e.tags = e.tags.data

                })

                data.data.sort((a, b) => getDatesFromItem(a).sortDate > getDatesFromItem(b).sortDate ? 1 : -1)
                setEvents(spliceSummaryInto(data.data, [{ period: 'month', detail: 'amount', label: 'monthly amount' }, { period: 'total', detail: 'amount', label: 'total amount' }]))

            })
            .catch((error) => console.log(error)) //(error) => fail(error))



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

                <Controller
                    name="findTags"
                    control={control}
                    rules={{}}
                    render={({ field }) => (
                        <div style={{ width: '100%' }}>
                            <Select placeholder='search by tag' {...field} instanceId='findTags' options={TagUtils.flattenTags(tags, [])}
                            />
                        </div>
                    )}
                />
                <Button onClick={() => find()}>find</Button>

                {events.map((e) =>
                    <Box key={e.id} mt='6px' pos="relative" boxShadow='xs' p='6' rounded='md' bg='white'>
                        {e.description}
                        {TagUtils.format(e, e.tags)}

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

                            </MenuList>
                        </Menu>



                    </Box>
                )}

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
                                            minLength: 3,
                                            maxLength: 100
                                        })}
                                    />
                                    {errors.description && <AlertPop title={errors.description.message} />}

                                    <Input
                                        type="text"
                                        placeholder="details"
                                        {...register("details", {
                                            minLength: 0,
                                            maxLength: 100
                                        })}
                                    />
                                    {errors.description && <AlertPop title={errors.description.message} />}


                                    <Controller
                                        name="tags"
                                        control={control}
                                        rules={{}}
                                        render={({ field }) => (
                                            <div style={{ width: '100%' }}>
                                                <Select {...field} options={TagUtils.flattenTags(tags, [])}
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
                        <Button variant='ghost' mr={3} onClick={onClose}>
                            Cancel
                        </Button>


                    </ModalFooter>
                </ModalContent>
            </Modal>



        </VStack>
    );
}
