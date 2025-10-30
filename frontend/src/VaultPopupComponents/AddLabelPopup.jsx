import React, {useState} from 'react'
import '../CommonComponents/commonStyle.css';
import { CloseButton, Spacer, Stack, Text, Button } from '@chakra-ui/react';
import axios from 'axios';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import { PlusSquareIcon } from '@chakra-ui/icons';

export default function AddLabelPopup({setShowPopup}) {
    const { labels, setLabels, masterKey } = useAppContext();

    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const createLabel = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity() || label.length === 0 || label.startsWith("*d*")){
            toast.error('this label cannot be created');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('creating label...');
        setIsLoading(true);

        try{
            const updatedLabels = [...labels, label];
            const {encryptedData: labelList, nonce: labelNonce} = await encryptData(JSON.stringify(updatedLabels), masterKey);

            const res = await axios.put(getBaseURL() + `/api/password/${primaryAPIVersion()}/label`, {labelList, labelNonce}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(res.status === 200){
                toast.success(res.data.message, {id : toastId});
                setLabel('');
                setShowPopup(false);
                setLabels(updatedLabels);
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
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container'>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Create New Label</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>

            <form className='login-form'>
                <label className="login-label">Label Name</label>
                <input type="text" name='labelName' value={label} onChange={(e)=>setLabel(e.target.value)} required maxLength={100} className="login-input" />

                <Button disabled={isLoading} type="submit" onClick={createLabel} leftIcon={<PlusSquareIcon/>}>Create Label</Button>
            </form>
        </div>
        </>
    )
}
