import React, {useState} from 'react'
import '../CommonComponents/commonStyle.css';
import { CloseButton, Spacer, Stack, Text, Button } from '@chakra-ui/react';
import axios from 'axios';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import toast from 'react-hot-toast';
import { PlusSquareIcon } from '@chakra-ui/icons';

export default function AddTrackerPopup({setShowPopup}) {
    const { trackers, setTrackers, masterKey } = useAppContext();

    const [trackerName, setTrackerName] = useState('');
    const [trackingAmount, setTrackingAmount] = useState();

    const [isLoading, setIsLoading] = useState(false);

    const createTracker = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity() || !trackerName?.length || trackingAmount <= 0){
            toast.error('please provide valid details');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('creating tracker...');
        setIsLoading(true);

        try{
            const newTracker = {
                trackerName, trackingAmount, isRemoved: false
            }
            const updatedTrackers = [...trackers, newTracker];
            const {encryptedData: trackerList, nonce: trackerNonce} = await encryptData(JSON.stringify(updatedTrackers), masterKey);

            const res = await axios.put(getBaseURL() + `/api/expense/${primaryAPIVersion()}/tracker`, {trackerList, trackerNonce}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setTrackerName('');
                setTrackingAmount(null);
                setShowPopup(false);
                setTrackers(updatedTrackers);
            }
            setIsLoading(false);
        }
        catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <div className='popup-container'>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Create New Tracker</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>

            <form className='login-form'>
                <label className="login-label">Tracker Name</label>
                <input type="text" name='trackerName' value={trackerName} onChange={(e)=>setTrackerName(e.target.value)} required maxLength={100} className="login-input" />

                <label className="login-label">Amount to be tracked</label>
                <input type="number" name='trackingAmount' value={trackingAmount} onChange={(e)=>setTrackingAmount(e.target.value)} required className="login-input" />

                <Button disabled={isLoading} onClick={createTracker} leftIcon={<PlusSquareIcon/>}>Create Tracker</Button>
            </form>
        </div>
    );
}
