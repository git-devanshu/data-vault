import React from 'react'
import './commonStyle.css';
import { Spacer, Text, CloseButton, Stack } from '@chakra-ui/react';

export default function HelpPopup({title, helpText, setShowPopup}) {
    return (
        <div className='help-popup-container' style={{width: '320px', left: 'calc((100% - 320px)/2)', borderTop: "5px solid #2daaff"}}>
            <Stack direction='row' mb={5} alignItems='center'>
                <Text fontSize='xl' color='white'>{title}</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>
            <Text color='gray.200' whiteSpace="pre-line">{helpText}</Text>
        </div>
    );
}
