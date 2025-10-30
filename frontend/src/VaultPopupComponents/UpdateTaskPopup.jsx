import React, { useState } from 'react'
import '../CommonComponents/commonStyle.css';
import axios from 'axios';
import { Button, ButtonGroup, CloseButton, Spacer, Stack, Text } from '@chakra-ui/react';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData } from '../utils/cipherFunctions';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

export default function UpdateTaskPopup({setShowPopup, refresh, setRefresh, data}) {
    const { masterKey } = useAppContext();

    const [id, setId] = useState(data.id);
    const [task, setTask] = useState(data.task);
    const [startDate, setStartDate] = useState(data.startDate.split("T")[0]);
    const [endDate, setEndDate] = useState(data.endDate.split("T")[0]);
    const [status, setStatus] = useState(data.status);

    const [isLoading, setIsLoading] = useState(false);
    const [isChanged, setIsChanged] = useState(false);

    const [showDeleteTaskPopup, setShowDeleteTaskPopup] = useState(false);

    const updateTask = async(e) =>{
        e.preventDefault();
        if(!isChanged){
            toast.error('no changes are made');
            return;
        }
        if(!e.target.form.reportValidity() || !task.length || !startDate || !endDate){
            toast.error('please provide valid details');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('updating task...');
        setIsLoading(true);

        try{
            const queryStart = new Date(startDate);
            const queryEnd = new Date(endDate);
            const data = {
                task,
                startDate: queryStart,
                endDate: queryEnd,
                status
            }
            const {encryptedData: taskData, nonce} = await encryptData(JSON.stringify(data), masterKey);

            const res = await axios.put(getBaseURL() + `/api/task/${primaryAPIVersion()}`, {id, taskData, nonce, queryStart, queryEnd}, {headers: {
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

    const deleteTask = (taskId) =>{
        if(!taskId){
            toast.error('an error occurred!');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('deleting task...');
        setIsLoading(true);

        axios.delete(getBaseURL() + `/api/task/${primaryAPIVersion()}/${taskId}`, {headers: {
            Authorization: `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setShowPopup(false);
                setRefresh(!refresh);
                setShowDeleteTaskPopup(false);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
            setShowDeleteTaskPopup(false);
        });
    }

    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container' style={{maxHeight: '80%', overflowY: 'scroll', scrollbarWidth: 'none'}}>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' ml={1}>Update Task</Text>
                <Spacer/>
                <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
            </Stack>
            <form className='login-form'>
                <label className="login-label">Task Name</label>
                <input type="text" name='task' value={task} onChange={(e)=> {setTask(e.target.value); setIsChanged(true);}} maxLength={100} required className="login-input" />

                <label className="login-label">Task Start Date</label>
                <input type="date" name='startDate' value={startDate} onChange={(e)=> {setStartDate(e.target.value); setIsChanged(true);}} required className="login-input" />

                <label className="login-label">Task Deadline</label>
                <input type="date" name='endDate' value={endDate} onChange={(e)=> {setEndDate(e.target.value); setIsChanged(true);}} required className="login-input" />

                <label className="login-label">Status</label>
                <select className="login-input" name='status' value={status} onChange={(e)=> {setStatus(e.target.value); setIsChanged(true);}} required>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <ButtonGroup>
                    <Button colorScheme='red' width='full' disabled={isLoading} onClick={()=> setShowDeleteTaskPopup(true)} leftIcon={<DeleteIcon/>}>Delete</Button>
                    <Button width='full' disabled={!isChanged || isLoading} type="submit" onClick={updateTask} leftIcon={<EditIcon/>}>Update</Button>
                </ButtonGroup>
            </form>

            {showDeleteTaskPopup && <ConfirmationPopup title='Delete Task' confirmButtonName='Delete' confirmMsg="This action cannot be undone, are you sure to delete this task?" setShowPopup={setShowDeleteTaskPopup} confirmAction={deleteTask} actionParams1={id} isLoading={isLoading}/>}
        </div>
        </>
    );
}
