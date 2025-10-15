import React, { useState } from 'react'
import { Badge, Button, Heading, IconButton, Input, InputLeftElement, InputGroup, InputRightElement } from '@chakra-ui/react';
import { DeleteIcon, EditIcon, CopyIcon, AtSignIcon, LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import toast from 'react-hot-toast';

export default function PasswordCard({item, setPasswordToBeUpdated, setPasswordIdToRemove, setShowUpdatePasswordPopup, setShowDeletePasswordPopup}) {
    const [showPassword, setShowPassword] = useState(false);

    const copyUsername = () =>{
        navigator.clipboard.writeText(item.username);
        toast.success('Username copied to clipboard');
    }

    const copyPassword = () =>{
        navigator.clipboard.writeText(item.password);
        toast.success('Password copied to clipboard');
    }

    return (
        <div className='password-card'>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px'}}>
                <Heading size='md'>{item.platform}</Heading>
                <Badge>{item.label}</Badge>
            </div>
            <div style={{padding: '0 10px 0 10px'}}>
                <InputGroup>
                    <InputLeftElement pointerEvents='none'>
                        <AtSignIcon color='gray.300' />
                    </InputLeftElement>
                    <Input type='text' value={item.username} border='none' readonly/>
                    <InputRightElement>
                        <IconButton title='copy' onClick={copyUsername} icon={<CopyIcon/>} backgroundColor='transparent' color='gray' _hover={{backgroundColor: 'transparent', color: 'white'}}/>
                    </InputRightElement>
                </InputGroup>
                <InputGroup>
                    <InputLeftElement pointerEvents='none'>
                        <LockIcon color='gray.300' />
                    </InputLeftElement>
                    <Input type={showPassword ? "text" : "password"} value={item.password} border='none' readonly/>
                    <InputRightElement width='fit-content'>
                        <IconButton title={showPassword ? "Hide" : "Show"} onClick={() => setShowPassword(!showPassword)} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} backgroundColor="transparent" color="gray" _hover={{ backgroundColor: "transparent", color: "white" }} />
                        <IconButton title='copy' onClick={copyPassword} icon={<CopyIcon/>} backgroundColor='transparent' color='gray' _hover={{backgroundColor: 'transparent', color: 'white'}}/>
                    </InputRightElement>
                </InputGroup>
            </div>
            <div style={{display: 'flex', marginTop: '10px', backgroundColor: '#222b3e', padding: '10px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'}}>
                <Button width='full' onClick={()=>{ setPasswordIdToRemove(item.id); setShowDeletePasswordPopup(true); }} colorScheme='red' leftIcon={<DeleteIcon/>}>Delete</Button>
                <Button width='full' onClick={()=> { setPasswordToBeUpdated(item); setShowUpdatePasswordPopup(true); }} ml={3} leftIcon={<EditIcon/>}>Edit</Button>
            </div>
        </div>
    );
}
