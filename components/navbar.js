import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'
import { useRouter } from 'next/router';


import {
  Box,
  Center,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';


const Links = [{label:'Dashboard', href: '/'}, {label:'Activities', href:'activities'}, {label:'Tags', href:'/tags'}];

const NavLink = ({ children }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={children.href}>
    {children.label}
  </Link>
);

export default function Simple({state, children}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { colorMode, toggleColorMode } = useColorMode()

  useEffect(() => {
      state.setIsLogged(!!localStorage.getItem('jwt'));
  }, []);
  const { push } = useRouter();
  return (
    <>
    
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>

      {state.isLogged === null &&
        <Center width={'100vw'}>  <Spinner />  </Center>
      }

      {state.isLogged === false &&      
                <HStack style={{ display: "flex", columnGap: "20px", justifyContent: "end" }}>
                    {state.isLogged === false && 
                        <Button>
                            <Link href="/auth/register">
                                <a>Register</a>
                            </Link>
                        </Button>
                    }
                     {state.isLogged === false && 
                                  <Button>
                              
                                  <Link href="/auth/login">
                                      <a>Login</a>
                                  </Link>
                                  
                                    </Button>
                    }

                </HStack>
           }
           <Box style={{ display: "flex", columnGap: "20px", float:"right" }}>
       <IconButton mt={4} aria-label="Toggle Mode" onClick={toggleColorMode}>
          { colorMode === 'light' ? <MoonIcon/> : <SunIcon/> }
        </IconButton>
        </Box>
        {state.isLogged && <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>

          
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Box><img src="https://myally.co/sites/common/polylogos/PLLogo.png" /></Box>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link.href}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            { state.isLogged && <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  src={
                    'https://www.gravatar.com/avatar/14949f3e63e99a01eb444d7416e7a1409&s=100'
                  }
                />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => {


                      
                          localStorage.removeItem('jwt');
                          localStorage.removeItem('username');
                          state.setIsLogged(false)
                          push('/');}}>
                  Logoff
                </MenuItem>
                <MenuItem>Profile</MenuItem>
                <MenuDivider />
                <MenuItem>Link 3</MenuItem>
              </MenuList>
            </Menu>
            }
          </Flex>
        </Flex>}

        {isOpen ? (
          <Box onClick={isOpen ? onClose : onOpen} pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.href}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>

      {children}
    </>
  );
}