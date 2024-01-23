import React, { useState } from 'react';
import axios from '../../lib/axios';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useRouter } from 'next/router';
import Link from 'next/link';


import { VStack, Input, useToast, Box, Button, Center } from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import AlertPop from "../../components/alertPop";






const Login = ({state}) => {
    const { push } = useRouter();
    const [alert,setAlert] = useState();

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

    const onSubmit = (values, { setSubmitting, resetForm }) => { console.log('submit', values)
        setAlert();

        axios
            .post('/api/auth/local', values)
            .then(response => {
                const jwt = response.data.jwt;
                const username = response.data.user.username;

                localStorage.setItem('jwt', jwt);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('userEmail', response.data.user.email);                
                state.setIsLogged(true)

                push('/');
                //resetForm();
            })
            .catch(error => {
                if ( !error.response.data.message ) {
                    setAlert(['alert', "Something went wrong"])
                } else {
                    const messages = error.response.data.message[0].messages;

                    const list = [];
                    messages.map((message,i) => {
                        let item = "";
                        if (i === 0) item += `<ul>`;
                        
                        item += `<li>${message.id}</li>`;

                        if (i === messages.length - 1) item += `</ul>`
                        list.push(item);
                    });

                    setAlert(['alert', list]);
                }
            })

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