import React, { useState } from 'react';
import axios from '../../lib/axios';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useRouter } from 'next/router';
import Link from 'next/link';


import { VStack, Input, useToast, Box, Button } from "@chakra-ui/react";

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
        formState: { errors }
      } = useForm();

    const validationSchema = Yup.object({
        identifier: Yup.string().required("Required"),
        password: Yup.string().required("Required")
    });

    const onSubmit = (values, { setSubmitting, resetForm }) => {
        setAlert();

        axios
            .post('/api/auth/local', values)
            .then(response => {
                const jwt = response.data.jwt;
                const username = response.data.user.username;

                localStorage.setItem('jwt', jwt);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', response.data.user.id);
                state.setIsLogged(true)

                push('/');
                resetForm();
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
            .finally(() => {
                setSubmitting(false);
            });
    }

    return <>
        <h1>Login</h1>
        <hr />
        {alert && (
            <div style={{ backgroundColor: "lightcoral" }}>
                <div dangerouslySetInnerHTML={{ __html: alert[1] }} />
            </div>
        )}
        <br />
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => onSubmit(values, { setSubmitting, resetForm })} >
            { ({ isSubmitting, isValid }) => (
                <Form>
                    <div>
                        <div><label htmlFor="identifier">Username or Email</label></div>
                        <Field type="text" id="identifier" name="identifier" placeholder="Username or Email" />
                        <div className="error"><ErrorMessage name="identifier" /></div>
                    </div>

                    <br />

                    <div>
                        <div><label htmlFor="password">Password</label></div>
                        <Field type="password" id="password" name="password" placeholder="Password" />
                        <div className="error"><ErrorMessage name="password" /></div>
                        <small>
                            <Link href="/api/auth/forgot-password">
                                Forgot password?
                            </Link>
                        </small>
                    </div>

                    <br />

                    <button 
                        type="submit"
                        disabled={!isValid} >
                        {!isSubmitting && "Login"}
                        {isSubmitting && "Loading..."}
                    </button>
                </Form>
            )}
        </Formik>

      <Box>  <form onSubmit={() =>console.log('sub')}>
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
<AlertPop title={'errors.password.message'} />
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
    </>;
}

export default Login;