import { useState, useEffect, useRef, useId } from 'react';
import Link from 'next/link';
import Select from "react-select";
import useSWR from "swr";
import axios from '../lib/axios';
import commonCode from "../components/commonTagCode";


import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Input,useColorMode,
    Button,
    useDisclosure,
    Stack,CircularProgress,
    CircularProgressLabel,
    Progress,
    Spinner,
    Textarea
  } from "@chakra-ui/react";

  
 // const fetcher = (url) => fetch(url).then((res) => res.json());
  

 const TagUtils = commonCode()

const Homepage = () => {

    const [error, setError] = useState(null);
    const [tags, setTags] = useState([]);

    const optionList = [
        { value: "red", label: "Red" },
        { value: "green", label: "Green" },
        { value: "yellow", label: "Yellow" },
        { value: "blue", label: "Blue" },
        { value: "white", label: "White" }
      ];
      const [selectedOptions, setSelectedOptions] = useState();


    let [progress, update] = useState(0)

    const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)


    const [isLogged, setIsLogged] = useState();

    useEffect(() => {
        setIsLogged(!!localStorage.getItem('jwt'));
    }, []);

    const flexSettings = {
        flex: "1",
        minW: "300px",
        textAlign: "center",
        color: "white",
        mx: "6",
        mb: "6"
      };
    
      const gridSettings = {
        w: "100%",
        textAlign: "center",
        color: "white",
      };


      const { isOpen, onOpen, onClose } = useDisclosure();
      const btnRef = useRef();
      const { colorMode, toggleColorMode } = useColorMode()


    return (
        <>

            <h1 style={{ textAlign: "center" }}>Homepage 🏡</h1>
            <hr />
 
            <nav>
                <ul style={{ display: "flex", columnGap: "20px", justifyContent: "end" }}>
                    {!isLogged && ( 
                        <li>
                            <Link href="/auth/register">
                                <a>Register</a>
                            </Link>
                        </li>
                    )}
                    <li>
                        {!isLogged ? (
                            <Link href="/auth/login">
                                <a>Login</a>
                            </Link>
                        ) : (
                            <Link href="/auth/logout">
                                <a>Logout</a>
                            </Link>
                        )}
                    </li>
                </ul>
            </nav>
            <hr />
            <main>
                {isLogged ? (
                    <p>👋🏼 &nbsp;Welcome back, <b>{localStorage.username}</b>!</p>
                ) : (
                    <>
                        <p>You are not logged in, yet.</p>
                        <p>Log in to see something here.</p>
                    </>
                )}
            </main>
            <Button onClick={toggleColorMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
      </Button>
            <Button ref={btnRef} color="teal" border="none" onClick={onOpen}>
        Sign Up
      </Button>
      <Drawer
        isOpen={isOpen} placement="bottom"
        onClose={onClose} finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>

          <DrawerCloseButton border="none" />
          <DrawerHeader>Sign up Now</DrawerHeader>

          {/* Form */}
          <DrawerBody >
            <Stack height="30vh">
              <Input w="98%" placeholder="Name" />
              <Input w="98%" placeholder="Email" />
              <Textarea w="98%" h="100%" placeholder="Message" />
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Button color="red" border="none" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button color="blue" border="none">Save</Button>
          </DrawerFooter>

        </DrawerContent>
      </Drawer>
      <Stack>
        <CircularProgress color="green" isIndeterminate>

        </CircularProgress>

      </Stack>

      <Select
          options={optionList}
          placeholder="Select color"
          value={selectedOptions}
          isSearchable={true}
          instanceId={useId()}
          isMulti
        />

<ul>
        {tags.map(({ id, name }) => <li  key={id}>{name}</li>)}
      </ul>

        </>
    )
}

export default Homepage;