import React, { useState, useEffect, useId, useContext } from "react";
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
import {useTags} from '../providers/Tag'

//import { ErrorMessage } from "@hookform/error-message";
import AlertPop from "../components/alertPop";
import commonTagCode from "../components/commonTagCode";
import Crud from "../components/CRUD";
import Select from "react-select";
import axios from '../lib/axios';
import { HamburgerIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons'
import { Context } from  '../context/context';
import { toLocalDateTime } from '../lib/date'


function EventForm(props) {
    const TagUtils = commonTagCode()
    const [tags, setTags] = useState([]);
    
    useEffect(() => {
        TagUtils.get(setTags)

    }, [])

    const Tags = useTags()
console.log('edit props ', props)
    return      <form onSubmit={props.handleSubmit(props.onSubmit)}>
    <VStack>

        <Input
            type="text"
            placeholder="description"
            {...props.register("description", {
                minLength: 3,
                maxLength: 100
            })}
        />
        {props.errors.description && <AlertPop title={errors.description.message} />}

        <Input
            type="text"
            placeholder="details"
            {...props.register("details", {
                minLength: 0,
                maxLength: 100
            })}
        />
        <Input
            type="datetime-local"

            {...props.register("dateTime", {

            })}
        />

        {props.errors.description && <AlertPop title={errors.description.message} />}


        <Controller
            name="tags"
            control={props.control}
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
}



function DisplayItem(props) { 
    const Tags = useTags()
    if (props.item.details && props.item.details.constructor === String)
        props.item.details = JSON.parse(props.item.details)

    if (!props.item.description)
        props.item.description = props.item.details.dose + ' ' + props.item.tags[0].name     
        

    return     (
        <>
        <p>{props.item.description}</p>
        <p>{props.item.dateTime || props.item.details.date }  {props.item.details && props.item.details.currency}{props.item.details && props.item.details.amount}</p>
    
    </>  
    )}

export default function Builder() {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [error, setError] = useState(null);
    const TagUtils = commonTagCode()
    const {
        reset,
        control,
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors }
    } = useForm();

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const [selectedOptions, setSelectedOptions] = useState();
    const [events, setEvents] = useState([]);
    const [context, setContext ] = useContext(Context)

/*     useEffect(() => {
        TagUtils.get(setTags)
    }, []) */

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
                if (items[i].details.pomodoroStart && items[i].details.pomodoroStop) {
                    var itemTime = Math.floor(((new Date(items[i].details.pomodoroStop)) - (new Date(items[i].details.pomodoroStart))) / 1000)
                }
                getDatesFromItem(items[i])

                for (let ro of reportOptions) {
                    if (ro.period == 'total' || items[i].dates[ro.period] == ro.in)
                        if (ro.detail == 'amount')
                            ro.sum = itemAmount + (ro.sum ? ro.sum : 0)
                        else {
                            ro.time = itemTime + (ro.time ? ro.time : 0)
                            if (ro.pomodoro == null) ro.pomodoro = 0
                            if (ro.brokenPomodoro == null) ro.brokenPomodoro = 0
                            if (itemTime >= 25 * 60)
                                ro.pomodoro += 1 
                            else
                                ro.brokenPomodoro += 1 
                        }
                    else {
                        let lastItem = items[i]
                        if (ro.in)
                            items.splice(i++, 0, {summary: true,  id: ro.period + i, description: `${ro.label}  ${ro.in} ` +
                                (ro.detail =='amount' ? `${ro.sum}` : `${ro.time}  ${ro.pomodoro}/${ro.brokenPomodoro + ro.pomodoro}`) })
                        ro.in = lastItem.dates[ro.period]
                        if (ro.detail == 'amount')
                            ro.sum = itemAmount
                        else {
                            ro.time = itemTime
                            if (itemTime >= 25 * 60) {
                                ro.pomodoro = 1
                                ro.brokenPomodoro = 0
                            } else {
                                ro.brokenPomodoro = 1
                                ro.pomodoro = 0
                            }
                        }

                    }

                }
            }
        }

        let lastItem = items[items.length-1]

        for (let ro of reportOptions) {
            if (ro.in )
                items.splice(items.length, 0, {summary: true,  id: ro.period + 'last', description: `${ro.label}  ${ro.in} ` +
                (ro.detail =='amount' ? `${ro.sum}` : `${ro.time}  ${ro.pomodoro}/${ro.brokenPomodoro + ro.pomodoro}`)  })
            if (ro.period =='total')
                items.splice(items.length, 0, {summary: true,  id: ro.period + 'last', description: `${ro.label}  ${items[0].dates.day}-${lastItem.dates.day} ` +
                (ro.detail =='amount' ? `${ro.sum}` : `${ro.time}  ${ro.pomodoro}/${ro.brokenPomodoro + ro.pomodoro}`) })
        }
        return items
    }

    function getDatesFromItem(item) {
        if (!item.dates) {

            let itemDate

            if (item.details && item.details.date) {
                let dates = item.details.date.split('-')

                itemDate = new Date(item.details.date)
                item.dates = {   year: dates[0], month: `${dates[1]}/${dates[0].substr(2)}`, day: `${dates[1]}/${dates[2]}/${dates[0].substr(2)}`, sortDate: `${dates[0]}-${dates[1].padStart(2, '0')}-${dates[2].padStart(2, '0')}` }

            } else {
                itemDate = new Date(item.attributes.createdAt)
                let dates = itemDate.toLocaleDateString().split('/')

                item.dates = { year: dates[2], month: `${dates[0]}/${dates[2].substr(2)}`, day: `${dates[0]}/${dates[1]}/${dates[2].substr(2)}`, sortDate: `${dates[2]}-${dates[0].padStart(2, '0')}-${dates[1].padStart(2, '0')}` }
            }

            item.dates.week = (new Date(item.dates.year, itemDate.getMonth(), itemDate.getDate() + (itemDate.getDay() ? 7 : 0) - itemDate.getDay() )).toLocaleDateString()
        }

        return item.dates

    }




    const { getDisclosureProps: getAlertProps, isOpen: alertIsOpen, onOpen: alertOpen, onClose: alertClose } = useDisclosure()
    const alertProps = getAlertProps()

    const cancelRef = React.useRef()

    function eventSort(a, b, ascending=true) {
        return a.dateTimeISO < b.dateTimeISO ? -1 : (a.dateTimeISO == b.dateTimeISO ? 0 : 1) 
    }


    function find() {
        console.log('values', getValues())
 

        let qs = ''

        if (getValues().partialDescription)
            qs += `&filters[description][$contains]=${getValues().partialDescription}`

        if (getValues().afterDate) {
            qs += `&filters[createdAt][$gt]=${getValues().afterDate}`
        }   

        if (getValues().findTags) {
            let family = TagUtils.family(getValues().findTags)
            console.log('family', family)
            for (let i = 0; i < family.length; i++) {
                qs += `&filters[tags][id][$in][${i}]=${family[i].id}`
            }
        }


        axios
            .get('/api/events?populate=activity,tags&pagination[limit]=-1' + qs, {
                headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
            })
            .then(({ data }) => {



                data.data.forEach(e => { //replace with find
                    Object.assign(e, e.attributes)
                    e.details = JSON.parse(e.details) || {}
                    //e.dateTime = new Date(new Date(e.dateTime).getTime() - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, 19);                     
                    e.dateTimeISO = e.dateTime || e.details.date

                    e.dateTime = toLocalDateTime(e.dateTime)

                    e.tags = e.tags.data
                    e.tags.forEach(f => Object.assign(f, f.attributes))
                
                })
                console.log('events after process ', data.data)
                data.data.sort(eventSort)
                //data.data.sort((a, b) => getDatesFromItem(a).sortDate > getDatesFromItem(b).sortDate ? 1 : -1)
                //setEvents(spliceSummaryInto(data.data, [{ period: 'month', detail: 'amount', label: 'monthly amount' }, { period: 'total', detail: 'amount', label: 'total amount' }]))
                setEvents(data.data);  //spliceSummaryInto(data.data, [{ period: 'day', detail: 'pomodoro', label: 'daily pomodoro' },{ period: 'week', detail: 'pomodoro', label: 'weekly pomodoro' }, { period: 'total', detail: 'pomodoro', label: 'pomodoro total' }]))
            })
            .catch((error) => console.log(error)) //(error) => fail(error))



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
               

                <Input
                    type="text"
                    placeholder="partial description"
                    {...register("partialDescription", {
                        minLength: 3,
                        maxLength: 100
                    })}
                />  

                <Input
                    type="date"
                    placeholder="on or after"
                    {...register("afterDate", {

                    })}
                /> 


                <Controller
                    name="findTags"
                    control={control}
                    rules={{}}
                    render={({ field }) => (
                        <div style={{ width: '100%' }}>
                            <Select placeholder='search by tag' {...field} instanceId='findTags' options={TagUtils.optionList()}
                            />
                        </div>
                    )}
                />
                <Button onClick={() => find()}>find</Button>

               
                <Crud items={events} model='events' refreshList={find} sort={eventSort} displayItem={DisplayItem } editForm={ EventForm }/>

            </SimpleGrid>
        </VStack>
    );
}
