import React, { useState } from 'react'
import '../CommonComponents/commonStyle.css';
import axios from 'axios';
import { Button, CloseButton, Spacer, Stack, Text } from '@chakra-ui/react';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import { PlusSquareIcon } from '@chakra-ui/icons';

export default function AddPasswordPopup({setShowPopup, refresh, setRefresh}) {
    const {labels, masterKey} = useAppContext();

    const [data, setData] = useState({
        platform : '',
        username : '',
        password : '',
        label : ''
    });
    const [labelIndex, setLabelIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if(name === 'label'){
            const [label, index] = value.split('|');
            setData(prev =>({
                ...prev,
                label: label
            }));
            setLabelIndex(parseInt(index));
        } 
        else{
            setData(prev =>({
                ...prev,
                [name]: value
            }));
        }
    };

    const addPassword = async(e) => {
        e.preventDefault();
        if(!e.target.form.reportValidity() || data.platform.length === 0 || data.username.length === 0 || data.password.length === 0 || data.label.length === 0) {
            toast.error('please provide valid details');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('adding Password...');
        setIsLoading(true);

        try{
            const {encryptedData: passwordData, nonce} = await encryptData(JSON.stringify(data), masterKey);

            const res = await axios.post(getBaseURL() + `/api/password/${primaryAPIVersion()}`, {passwordData, nonce, labelIndex}, {headers: {
                Authorization: `Bearer ${token}`
            }});

            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setShowPopup(false);
                setRefresh(!refresh);
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
                <Text fontSize='xl' ml={1}>Add New Password</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>
            <form className='login-form'>
                <label className="login-label">Platfrom</label>
                <input type="text" name='platform' value={data.platform} onChange={handleChange} required className="login-input" />

                <label className="login-label">Username</label>
                <input type="text" name='username' value={data.username} onChange={handleChange} required className="login-input" />

                <label className="login-label">Password</label>
                <input type="text" name='password' value={data.password} onChange={handleChange} required className="login-input" />

                <label className="login-label">Label</label>
                <select className="login-input" name='label' value={`${data.label}|${labelIndex}`} onChange={handleChange} required>
                    <option value="|">-- Select Label --</option>
                    {labels.map((label, index) => {
                        if(!label.startsWith("*d*")){
                            return(
                                <option key={index} value={`${label}|${index}`}>{label}</option>
                            )
                        }
                    })}
                </select>

                <Button type="submit" disabled={isLoading} onClick={addPassword} leftIcon={<PlusSquareIcon/>}>Add Password</Button>
            </form>
        </div>
    )
}
