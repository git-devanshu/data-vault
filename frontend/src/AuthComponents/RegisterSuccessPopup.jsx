import React, { useEffect } from 'react'
import '../CommonComponents/commonStyle.css';
import { useNavigate } from "react-router-dom";
import { Heading, Text, Button } from '@chakra-ui/react';
import { downloadPassKeyFile } from '../utils/helperFunctions';

export default function RegisterSuccessPopup({passKey}) {
    const navigate = useNavigate();

    useEffect(() => {
        if(!passKey) return;
        downloadPassKeyFile(passKey);
    }, [passKey]);

    const navigateToLogin = () =>{
        navigate('/login', {replace: true});
    }

    return (
        <div className='parent-container'>
            <div className='popup-container'>
                <Heading color='red.400' textAlign='center' size='md' mb={4}>IMPORTANT !</Heading>

                <Text color='gray.300' textAlign='center'>
                    A file named passkey.txt has been downloaded to your device.
                    This file contains a recovery key required to reset your password in the future.
                    Store it securely and do not delete or share it.
                </Text><br/>
                <Text color='gray.300' textAlign='center'>⚠️ If you lose this file, you won't be able to reset your password by any method.</Text>

                <Button width='full' onClick={navigateToLogin} colorScheme='blue' mt={5}>I Understand</Button>
            </div>
        </div>
    );
}
