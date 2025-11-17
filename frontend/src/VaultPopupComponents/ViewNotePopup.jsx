import React, { useEffect, useState } from 'react'
import '../CommonComponents/commonStyle.css';
import '../AuthComponents/authStyle.css';
import { Heading, Stack, Spacer, CloseButton, Box, Badge, Button } from '@chakra-ui/react';
import PriorityIcon from './PriorityIcon';
import axios from 'axios';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import Loading from '../CommonComponents/Loading';
import { useAppContext } from '../context/AppContext';
import { decryptData } from '../utils/cipherFunctions';

export default function ViewNotePopup({setShowPopup, data}) {
    const { masterKey } = useAppContext();

    const [note, setNote] = useState();
    const [error, setError] = useState();

    useEffect(()=>{
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/notes/${primaryAPIVersion()}/${data.noteId}`, {headers : {
            Authorization: `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                const decryptedNote = await decryptData(res.data?.note, res.data?.nonce, masterKey);
                setNote(decryptedNote);
            }
        })
        .catch(err =>{
            console.log(err);
            setError(err.response?.data?.message || "failed to load the note");
        });
    }, [data]);

    if(!note){
        return(
            <div className='popup-container' style={{maxHeight: '98%', height: '98%', width: '98%', top: '1%', left: '1%', overflowY: 'scroll', scrollbarWidth: 'none', padding: 0}}>
                <Loading data='Note' error={error}/>
                <Button colorScheme='red' mt={3} onClick={()=> setShowPopup(false)}>Back</Button>
            </div>
        );
    }

    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container' style={{ height: '100%', width: '100%', top: '1%', left: '1%', overflowY: 'scroll', scrollbarWidth: 'none', borderTop: `8px solid ${data.categoryColor}`}}>
            <Stack direction='row' mb={5} alignItems='center'>
                <Heading size='md'>{data.title}</Heading>
                <Spacer/>
                <CloseButton title='close' color='white' onClick={()=> setShowPopup(false)}/>
            </Stack>

            <div className='login-form'>
                <Stack direction='row' align='center'>
                    <PriorityIcon priority={parseInt(data.priority)}/>
                    <Badge colorScheme='gray' width='fit-content'>{data.tag}</Badge>
                </Stack>
                <Box whiteSpace='pre-wrap' mt={6}>{note}</Box>
            </div>
        </div>
        </>
    );
}
