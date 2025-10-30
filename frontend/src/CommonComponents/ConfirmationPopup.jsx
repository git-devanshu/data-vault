import React from 'react'
import './commonStyle.css';
import { Text, Button, Heading } from '@chakra-ui/react';

export default function ConfirmationPopup({confirmAction, confirmButtonName, confirmMsg, setShowPopup, actionParams1 = null, actionParams2 = null, isLoading = false, title, actionColor='red'}) {
    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container' style={{width: '300px', left: 'calc((100% - 300px)/2)', borderTop: `5px solid ${actionColor}`, borderRadius: '10px', height: 'max-content', top: '130px'}}>
            <Heading size='md' color='white' textAlign='center' mb={3}>{title}</Heading>
            <Text textAlign='center'>{confirmMsg}</Text>
            <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '15px', gap: '10px'}}>
                <Button width='full' onClick={()=>setShowPopup(false)}>Cancel</Button>
                <Button width='full' disabled={isLoading} colorScheme={actionColor} onClick={()=>confirmAction(actionParams1, actionParams2)}>{confirmButtonName}</Button>
            </div>
        </div>
        </>
    )
}
