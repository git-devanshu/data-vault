import React, { useState } from 'react'
import '../CommonComponents/commonStyle.css';
import { useNavigate } from "react-router-dom";
import { Heading, Text, Button, Spinner } from '@chakra-ui/react';
import { downloadPassKeyFile, getAuthToken, getBaseURL, primaryAPIVersion, decodeToken } from '../utils/helperFunctions';
import { createHash, createPassKey } from '../utils/cipherFunctions';
import axios from 'axios';
import { sendNewKeyGenerationEmail } from '../utils/sendEmails';

export default function NewKeyGenerationPopup({setShowPopup}) {
    const email = decodeToken(getAuthToken()).email;

    const navigate = useNavigate();

    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const generateNewRecoveryKey = () =>{
        setIsLoading(true);
        const passKey = createPassKey();
        const hashedPassKey = createHash(passKey);

        const token = getAuthToken();

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/new-passkey`, {passKey: hashedPassKey}, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                setIsLoading(false);
                setShowDetails(true);
                await sendNewKeyGenerationEmail(email);
                downloadPassKeyFile(passKey);
            }
        })
        .catch(err =>{
            console.log(err.response?.data?.message || 'error generating new recovery key');
            setError(err.response?.data?.message || 'error generating new recovery key');
        })
    }

    const navigateToHome = () =>{
        navigate('/', {replace: true});
    }

    if(isLoading){
        return (
            <div className='popup-container' style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Heading textAlign='center' size='md' mb={4}>Generating New Key</Heading>
                {!error && <Spinner size='lg' my={10}/>}
                {error && <div>
                    <Text color='red.300'>{error}</Text>
                    <Button mt={5} width='full' onClick={()=> setShowPopup(false)}>Back</Button>    
                </div>}  
            </div>
        )
    }

    return (
        <div className='parent-container'>
            {!showDetails && <div className='popup-container'>
                <Heading color='red.400' textAlign='center' size='md' mb={4}>New Recovery Key</Heading>
                <Text textAlign='center' mb={6}>
                    On generating new recovery key, your previous keys will not work. Do you want to proceed ?
                </Text>
                <div style={{display: 'flex', justifyContent: 'space-around', gap: '10px'}}>
                    <Button colorScheme='red' width='full' onClick={()=> setShowPopup(false)}>Cancel</Button>
                    <Button width='full' onClick={generateNewRecoveryKey}>Generate</Button>
                </div>
            </div>}

            {showDetails && <div className='popup-container'>
                <Heading color='red.400' textAlign='center' size='md' mb={4}>New Key Generated !</Heading>

                <Text color='gray.300' textAlign='center'>
                    A new file named passkey.txt has been downloaded to your device.
                    This is your new recovery key that can be used to reset your password in future.
                    If you have generated multiple keys, only the latest one is valid.
                </Text><br/>
                <Text color='gray.300' textAlign='center'>⚠️ If you lose this file, you won't be able to recover your data by any method.</Text>

                <Button width='full' onClick={navigateToHome} colorScheme='blue' mt={5}>I Understand</Button>
            </div>}
        </div>
    );
}
