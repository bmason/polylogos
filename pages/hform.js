import { Tabs, TabList, TabPanels, Tab, TabPanel,VStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import AlertPop from "../components/AlertPop";
import Common from "../components/commonCode";

export default function Builder() {
  const toast = useToast();
  const [data, setData] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const onSubmit = (data) => {
    //console.log(data);
    toast({
      title: "Submitted!",
      status: "success",
      duration: 3000,
      isClosable: true
    });

    setData(data);
  };

  console.log(data);
  console.log(errors)
  function Feature({ title, desc, ...rest }) {
    return (
      <Box m={1} p={5} shadow='md' borderWidth='1px' {...rest}>
        <Heading fontSize='xl'>{title}</Heading>
        <Text mt={4}>{desc}</Text>
      </Box>
    )
  }
  
  function StackEx() {
    return (
      <Stack spacing={8} direction='row'>
        <Feature
          title='Plan Money'
          desc='The future can be even brighter but a goal without a plan is just a wish'
        />
        <Feature
   
          title='Save Money'
          desc='You deserve good things. With a whooping 10-15% interest rate per annum, grow your savings on your own terms with our completely automated process'
        />
      </Stack>
    )
  }
  const [tabIndex, setTabIndex] = useState(0)

  const handleSliderChange = (event) => {
    setTabIndex(parseInt(event.target.value, 10))
  }

  const handleTabsChange = (index) => {
    setTabIndex(index)
  }
  
  
 
  return (

    <VStack mt={4} > 

     return (
    <Box>
      <input
        type='range'
        min='0'
        max='2'
        value={tabIndex}
        onChange={handleSliderChange}
      />

      <Tabs index={tabIndex} onChange={handleTabsChange}>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>Click the tabs or pull the slider around</p>
          </TabPanel>
          <TabPanel>
            <p>Yeah yeah. What's up?</p>
          </TabPanel>
          <TabPanel>
            <p>Oh, hello there.</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
  
    
    <SimpleGrid
  bg='gray.50'
  columns={{ sm: 2, md: 4 }}
  spacing='8'
  p='10'
  textAlign='center'
  rounded='lg'
  color='gray.400'
>
  <Box boxShadow='xs' p='6' rounded='md' bg='white'>
    xs
  </Box>
  <Box boxShadow='sm' p='6' rounded='md' bg='white'>
    sm
  </Box>
  <Box boxShadow='base' p='6' rounded='md' bg='white'>
    Base
  </Box>
  <Box boxShadow='md' p='6' rounded='md' bg='white'>
    md
  </Box>
  <Box boxShadow='lg' p='6' rounded='md' bg='white'>
    lg
  </Box>
  <Box boxShadow='xl' p='6' rounded='md' bg='white'>
    xl
  </Box>
  <Box boxShadow='dark-lg' p='6' rounded='md' bg='white'>
    2xl
  </Box>
  <Box boxShadow='dark-lg' p='6' rounded='md' bg='white'>
    Dark lg
  </Box>
  <Box boxShadow='outline' p='6' rounded='md' bg='white'>
    Outline
  </Box>
  <Box boxShadow='inner' p='6' rounded='md' bg='white'>
    Inner
  </Box>
</SimpleGrid>
<Box   >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack>
          <Input
            type="text"
            placeholder="First name"
            {...register("firstname", {
              required: "Please enter first name",
              minLength: 3,
              maxLength: 80
            })}
          />
          {errors.firstname && <AlertPop title={errors.firstname.message} />}
          <Input
            type="text"
            placeholder="Last name"
            {...register("lastname", {
              required: "Please enter Last name",
              minLength: 3,
              maxLength: 100
            })}
          />
  {errors.lastname && <AlertPop title={errors.lastname.message} />}
          <Input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Please enter Password",
              minLength: { value: 8, message: "Too short" }
            })}
          />
          {errors.password && <AlertPop title={errors.password.message} />}

          <Button
            borderRadius="md"
            bg="cyan.600"
            _hover={{ bg: "cyan.200" }}
            variant="ghost"
            type="submit"
          >
            Submit
          </Button>
        </VStack>
      </form>
  
    </Box>
    </VStack>
  );
}
