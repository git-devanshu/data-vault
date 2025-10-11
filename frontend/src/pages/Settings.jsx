import React, { useEffect, useState } from 'react'
import '../VaultComponents/vaultStyle.css';
import { Button, Switch, Heading, Text, Stack, Spacer, Divider, ButtonGroup } from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();
    const { hideRemovedLabels, setHideRemovedLabels, hideRemovedTrackers, setHideRemovedTrackers, hideHighPriorityNotes, setHideHighPriorityNotes, hideNoteEditButton, setHideNoteEditButton, hideCompletedTasks, setHideCompletedTasks, hideExpenseDeleteButton, setHideExpenseDeleteButton } = useAppContext();

    const [password, setPassword] = useState('');

    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=> {
        const toastId = toast.loading("loading settings...");
        setIsLoading(true);
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/auth/${primaryAPIVersion()}/settings`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success("settings loaded", {id : toastId});
                setHideRemovedLabels(res.data?.hideRemovedLabels);
                setHideRemovedTrackers(res.data?.hideRemovedTrackers);
                setHideHighPriorityNotes(res.data?.hideHighPriorityNotes);
                setHideNoteEditButton(res.data?.hideNoteEditButton);
                setHideCompletedTasks(res.data?.hideCompletedTasks);
                setHideExpenseDeleteButton(res.data?.hideExpenseDeleteButton);
                // take care of other settings as needed
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "failed to load settings", {id : toastId});
            setIsLoading(false);
        })
    }, [refresh]);

    const saveSettings = (e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity() || !password?.length){
            toast.error("password is required to save settings");
            return;
        }

        const toastId = toast.loading("updating settings...");
        setIsLoading(true);
        const token = getAuthToken();
        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/settings`, {password, hideRemovedLabels, hideRemovedTrackers, hideHighPriorityNotes, hideNoteEditButton, hideCompletedTasks, hideExpenseDeleteButton}, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setRefresh(!refresh);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        });
    }

    const navigateToHome = () =>{
        navigate('/');
    }

    return (
        <div className='vault-container'>
            <Heading className='vault-heading' color='#2daaff' size='lg'>Settings</Heading>
            <div className='vault-grid'>
                <div className='grid-inner-left'>
                    <form className="login-form">
                        <Heading size='md'>Password Vault</Heading>
                        <Stack direction='row' my={5}>
                            <Text>Hide Removed Labels</Text>
                            <Spacer/>
                            <Switch isChecked={hideRemovedLabels} onChange={(e) => setHideRemovedLabels(e.target.checked)} />
                        </Stack>

                        <Divider mb={4}/>

                        <Heading size='md'>Expense Vault</Heading>
                        <Stack direction='row' my={5}>
                            <Text>Hide Removed Trackers</Text>
                            <Spacer/>
                            <Switch isChecked={hideRemovedTrackers} onChange={(e) => setHideRemovedTrackers(e.target.checked)} />
                        </Stack>
                        <Stack direction='row' mb={5}>
                            <Text>Hide Expense Delete Button</Text>
                            <Spacer/>
                            <Switch isChecked={hideExpenseDeleteButton} onChange={(e) => setHideExpenseDeleteButton(e.target.checked)} />
                        </Stack>

                        <Divider mb={4}/>

                        <Heading size='md'>Notes Vault</Heading>
                        <Stack direction='row' my={5}>
                            <Text>Hide High Priority Notes</Text>
                            <Spacer/>
                            <Switch isChecked={hideHighPriorityNotes} onChange={(e) => setHideHighPriorityNotes(e.target.checked)} />
                        </Stack>
                        <Stack direction='row' mb={5}>
                            <Text>Hide Note Edit Button</Text>
                            <Spacer/>
                            <Switch isChecked={hideNoteEditButton} onChange={(e) => setHideNoteEditButton(e.target.checked)} />
                        </Stack>

                        <Divider mb={4}/>

                        <Heading size='md'>Task Vault</Heading>
                        <Stack direction='row' my={5}>
                            <Text>Hide Completed Tasks</Text>
                            <Spacer/>
                            <Switch isChecked={hideCompletedTasks} onChange={(e) => setHideCompletedTasks(e.target.checked)} />
                        </Stack>

                        <Divider mb={4}/>

                        <label className="login-label" style={{color: 'orange'}}>Enter Password to Save Changes</label>
                        <input type="password" name='password' value={password} onChange={(e)=> setPassword(e.target.value)} required minLength={8} maxLength={30} className="login-input" />

                        <ButtonGroup>
                            <Button onClick={navigateToHome} >Back</Button>
                            <Button onClick={saveSettings} disabled={isLoading} colorScheme='blue' width='min-content'>Save Settings</Button>
                        </ButtonGroup>
                    </form>
                </div>

                <div className='grid-inner-right'></div>
            </div>
        </div>
    );
}
