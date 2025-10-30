import React, { useState } from 'react'
import '../CommonComponents/commonStyle.css';
import axios from 'axios';
import { Button, CloseButton, Spacer, Stack, Text } from '@chakra-ui/react';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import { PlusSquareIcon } from '@chakra-ui/icons';

export default function AddTaskPopup({setShowPopup, refresh, setRefresh}) {
    const { masterKey } = useAppContext();

    const [task, setTask] = useState('');
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const [isLoading, setIsLoading] = useState(false);

    const addTask = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity() || !task.length || !startDate || !endDate){
            toast.error('please provide valid details');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('adding task...');
        setIsLoading(true);

        try{
            const queryStart = new Date(startDate);
            const queryEnd = new Date(endDate);
            const data = {
                task,
                startDate: queryStart,
                endDate: queryEnd,
                status: 'pending'
            }
            const {encryptedData: taskData, nonce} = await encryptData(JSON.stringify(data), masterKey);

            const res = await axios.post(getBaseURL() + `/api/task/${primaryAPIVersion()}`, {taskData, nonce, queryStart, queryEnd}, {headers: {
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
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container'>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Add New Task</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>
            <form className='login-form'>
                <label className="login-label">Task Name</label>
                <input type="text" name='task' value={task} onChange={(e)=> setTask(e.target.value)} maxLength={100} required className="login-input" />

                <label className="login-label">Task Start Date</label>
                <input type="date" name='startDate' value={startDate} onChange={(e)=> setStartDate(e.target.value)} required className="login-input" />

                <label className="login-label">Task Deadline</label>
                <input type="date" name='endDate' value={endDate} onChange={(e)=> setEndDate(e.target.value)} required className="login-input" />

                <Button disabled={isLoading} type="submit" onClick={addTask} leftIcon={<PlusSquareIcon/>}>Add Task</Button>
            </form>
        </div>
        </>
    );
}
