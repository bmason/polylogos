import React, { useState } from 'react';
import axios from '../../lib/axios';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../providers/Auth'

import { VStack, Input, useToast, Box, Button, Center } from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import AlertPop from "../../components/alertPop";






const Login = ({state}) => {
    const { push } = useRouter();
    const [alert,setAlert] = useState();
    const { jwt,user,login } = useAuth();

    const initialValues = {
        identifier: "",
        password: ""
    }

    const {
        register,
        handleSubmit,
        values,
        formState: { errors }
      } = useForm();

    const validationSchema = Yup.object({
        identifier: Yup.string().required("Required"),
        password: Yup.string().required("Required")
    });

    const  onSubmit = async (values) => { console.log('submit', values)
        setAlert();

      await login(values)
      console.log (jwt, user)
      push('/');
    }

    return <>


    <Center >
      <Box maxW='sm' padding='5px' borderWidth='2px' borderRadius='lg' overflow='hidden'>  

      <form onSubmit={handleSubmit(onSubmit)}>
    <VStack>

      <Input
        type="text"
        placeholder="Username or Email"
        {...register("identifier", {
          required: "Please enter Username or Email",
          minLength: 3,
          maxLength: 100
        })}
      />
      {errors.identifier && <AlertPop title={errors.lastname.message} />}
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
        Login
      </Button>
    </VStack>
  </form>     
  </Box>     
  </Center>  
    </>;
}

export default Login;