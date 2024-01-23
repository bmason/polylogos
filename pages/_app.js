//import '../styles/globals.css';
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import customTheme from "../lib/theme";
import Layout from '../components/layout';
import { useState } from "react";
import 'react-quill/dist/quill.snow.css';
import { Context } from  '../context/context';
import { TagProvider } from '../providers/Tag'


function MyApp({ Component, pageProps }) {
  const [isLogged, setIsLogged] = useState();
  const [context, setContext] = useState({treeTags: [], listTags: []});

  return (
    <Context.Provider value={[context, setContext]}>
    <ChakraProvider theme={customTheme}>
      <TagProvider>
        <Layout state={{isLogged: isLogged, setIsLogged: setIsLogged}}>
          <Component state={{isLogged: isLogged, setIsLogged: setIsLogged}} {...pageProps} />
        </Layout>
      </TagProvider>
    </ChakraProvider>
    </Context.Provider>
  );
}

export default MyApp;