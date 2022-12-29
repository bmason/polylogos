//import '../styles/globals.css';
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import customTheme from "../lib/theme";
import Layout from '../components/layout'
import { useState } from "react";
import 'react-quill/dist/quill.snow.css'



function MyApp({ Component, pageProps }) {
  const [isLogged, setIsLogged] = useState();
  return (
    <ChakraProvider theme={customTheme}>
          <Layout state={{isLogged: isLogged, setIsLogged: setIsLogged}}>

        <Component state={{isLogged: isLogged, setIsLogged: setIsLogged}} {...pageProps} />

    </Layout>
    </ChakraProvider>
  );
}

export default MyApp;