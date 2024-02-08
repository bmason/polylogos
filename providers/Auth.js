'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import axios from '../lib/axios';

const Context = createContext({} )


export const AuthProvider =  ({ children }) => {

    const [user, setUser] = useState()
    const [jwt, setJwt] = useState()



  const logout = () => {
    setJwt(null)
    setUser(null)
  }  
  const login = (values) => {

    axios
    .post('/api/auth/local', values)
    .then(response => {
        setJwt(response.data.jwt);
        setUser({name: response.data.user.username,
          id: response.data.user.id,
          email: response.data.user.email
        })               
        //state.setIsLogged(true)
        //push('/');
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

    return (
        <Context.Provider  value={{ user, login, logout, jwt }}>
            {children}
        </Context.Provider>
     )
}


export const useAuth = () => useContext(Context)