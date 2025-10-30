import React from 'react'
import './commonStyle.css';
import { Spacer, Text, CloseButton, Stack } from '@chakra-ui/react';

export default function HelpPopup({title, helpText, setShowPopup}) {
    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='help-popup-container' style={{ borderTop: "5px solid #2daaff"}}>
            <Stack direction='row' mb={5} alignItems='center'>
                <Text fontSize='xl' color='white'>{title}</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>
            <Text color='gray.200' whiteSpace="pre-line">{helpText}</Text>
        </div>
        </>
    );
}
