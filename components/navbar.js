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
  Text,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAuth} from '../providers/Auth'
import { useTags } from '../providers/Tag'


const Links = [{label:'Dashboard', href: '/'}, {label:'Activities', href:'activities'},{label:'Events', href:'/events'} ,{label:'Tags', href:'/tags'}];

const NavLink = ({ children, fs }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    cursor={'pointer'}
    href={children.href}
    legacyBehavior>
    <Text fontSize={fs ? '2xl' : null}>{children.label}</Text>
  </Link>
);

export default function Simple({state, children}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  var md5 = require('md5');

  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useAuth()
  const { resetTags } = useTags()

  const { push } = useRouter();
  return <>
  
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>



    {!user &&     
              <HStack style={{ display: "flex", columnGap: "20px", justifyContent: "end" }}>
                  {!user && 
                      <Button>
                          <Link href="/auth/register">
                              Register
                          </Link>
                      </Button>
                  }
                   {!user && 
                                <Button>
                            
                                <Link href="/auth/login">
                                    Login
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
      {user && <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>

        
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box><Image width="155" height="67" src="/PLLogo.png" /></Box>
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
          { user && <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}>
              <Avatar
                size={'sm'}
                name = {`user image ${user.name}`}
                src={
                  `https://www.gravatar.com/avatar/${md5(user.email)}?size=100)`
                }
              />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => {



                       logout()
                        push('/');
                        resetTags()}}>
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
              <NavLink fs='xl' key={link.href}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>

    {children}
  </>;
}