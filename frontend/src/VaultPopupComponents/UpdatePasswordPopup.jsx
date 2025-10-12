import React, { useState } from 'react'
import '../CommonComponents/commonStyle.css';
import axios from 'axios';
import { Button, CloseButton, Spacer, Stack, Text } from '@chakra-ui/react';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import { EditIcon } from '@chakra-ui/icons';

export default function UpdatePasswordPopup({setShowPopup, refresh, setRefresh, passwordDataObj}) {
    const {labels, masterKey} = useAppContext();

    const [data, setData] = useState({
        platform : passwordDataObj.platform,
        username : passwordDataObj.username,
        password : passwordDataObj.password,
        label : passwordDataObj.label
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

    const updatePassword = async(e) => {
        e.preventDefault();
        if(!e.target.form.reportValidity() || data.platform.length === 0 || data.username.length === 0 || data.password.length === 0 || data.label.length === 0) {
            toast.error('please provide valid details');
            return;
        }
        if(data.platform === passwordDataObj.platform && data.username === passwordDataObj.username && data.password === passwordDataObj.password && data.label === passwordDataObj.label){
            toast.error("no changes made");
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('updating Password...');
        setIsLoading(true);

        const {encryptedData: passwordData, nonce} = await encryptData(JSON.stringify(data), masterKey);

        axios.put(getBaseURL() + `/api/password/${primaryAPIVersion()}`, {id: passwordDataObj.id, passwordData, nonce, labelIndex}, {headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data.message, {id : toastId});
                setShowPopup(false);
                setRefresh(!refresh);
            }
            setIsLoading(false);
        })
        .catch(err => {
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        });
    }

    return (
        <div className='popup-container'>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Update Password</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>
            <form className='login-form'>
                <label className="login-label">Platfrom</label>
                <input type="text" name='platform' value={data.platform} onChange={handleChange} required maxLength={60} className="login-input" />

                <label className="login-label">Updated Username</label>
                <input type="text" name='username' value={data.username} onChange={handleChange} required className="login-input" />

                <label className="login-label">Updated Password</label>
                <input type="text" name='password' value={data.password} onChange={handleChange} required className="login-input" />

                <label className="login-label" style={{color: 'orange'}}>Reselect You Label</label>
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

                <Button disabled={isLoading} type="submit" onClick={updatePassword} leftIcon={<EditIcon/>}>Update Password</Button>
            </form>
        </div>
    )
}
