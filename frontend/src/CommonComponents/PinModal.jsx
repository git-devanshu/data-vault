import React, { useState } from 'react'
import { HStack, PinInput, PinInputField, Button } from "@chakra-ui/react";
import axios from 'axios';
import './commonStyle.css';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import { decryptMasterKey, decryptData } from '../utils/cipherFunctions';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

export default function PinModal() {
    const navigate = useNavigate();
    const { setMasterKey, setLabels, setTrackers, setNotes, setHideRemovedLabels, setHideRemovedTrackers, setHideHighPriorityNotes, setHideNoteEditButton, setHideExpenseDeleteButton } = useAppContext();

    const [securityPin, setSecurityPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigateToHome = () =>{
        navigate('/');
    }

    const checkSecurityPin = async(e) =>{
        e.preventDefault();
        if(securityPin.length != 6){
            toast.error('enter all 6 digits');
            return;
        }

        const toastId = toast.loading('verifying pin...');
        setIsLoading(true);

        try{
            const token = getAuthToken();
            const response = await axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/verify-pin`, { securityPin }, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(response.status === 200){
                toast.success(response.data?.message, {id : toastId});
                const decryptedMasterKey = await decryptMasterKey(response.data?.pinEncryptedKey, securityPin, response.data.pinSalt, response.data.pinNonce);
                setMasterKey(decryptedMasterKey);

                const labels = await decryptData(response.data?.userPreferences?.labelList, response.data?.userPreferences?.labelNonce, decryptedMasterKey);
                setLabels(JSON.parse(labels));

                const trackers = await decryptData(response.data?.userPreferences?.trackerList, response.data?.userPreferences?.trackerNonce, decryptedMasterKey);
                setTrackers(JSON.parse(trackers));

                const notes = await decryptData(response.data?.userPreferences?.notesList, response.data?.userPreferences?.notesNonce, decryptedMasterKey);
                setNotes(JSON.parse(notes));

                setHideRemovedLabels(response.data?.userPreferences?.hideRemovedLabels);
                setHideRemovedTrackers(response.data?.userPreferences?.hideRemovedTrackers);
                setHideHighPriorityNotes(response.data?.userPreferences?.hideHighPriorityNotes);
                setHideNoteEditButton(response.data?.userPreferences?.hideNoteEditButton);
                setHideExpenseDeleteButton(response.data?.userPreferences?.hideExpenseDeleteButton);
                
                // take care of other things as per requirement
            }
            setIsLoading(false);
        }
        catch(error){
            console.log(error);
            toast.error(error.response?.data?.message || "no data found", {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <div className='modal-container'>
            <div className='security-pin-modal'>
                <h2 className="login-heading">Enter Security Pin</h2>
                <h2 style={{fontSize: '16px', fontWeight: 300, textAlign: 'center', marginTop: '0', marginBottom: '10px'}}>You need to enter your 6-digit security pin to access this data.</h2>

                <div style={{display: 'grid', placeItems: 'center', marginTop: '10px', marginBottom: '10px'}}>
                    <HStack>
                        <PinInput type="number" value={securityPin} onChange={(value) => setSecurityPin(value)}>
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                        </PinInput>
                    </HStack>
                </div>
                <a href="/reset-pin" className="forgot-password">
                    Forgot Security Pin?
                </a>
                <HStack spacing={3} style={{margin: '0 auto'}}>
                    <Button colorScheme='blue' type="submit" disabled={isLoading} onClick={checkSecurityPin}>
                        Confirm
                    </Button>
                    <Button colorScheme='red' onClick={navigateToHome}>
                        Back
                    </Button>
                </HStack>
            </div>
        </div>
    );
}
