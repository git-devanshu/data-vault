import React, { useEffect, useState, useMemo } from 'react'
import './vaultStyle.css';
import { useAppContext } from '../context/AppContext';
import useClearOnUnmount from '../hooks/useClearOnUnmount';
import PinModal from '../CommonComponents/PinModal';
import Loading from '../CommonComponents/Loading';
import { primaryAPIVersion, getAuthToken, getBaseURL, getCurrentDate } from '../utils/helperFunctions';
import { decryptData } from '../utils/cipherFunctions';
import { taskVaultHelpText } from '../utils/helpTextForModules';
import { Button, ButtonGroup, Heading, IconButton, Text} from '@chakra-ui/react';
import { PlusSquareIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import axios from 'axios';
import HelpPopup from '../CommonComponents/HelpPopup';
import TaskTimeline from '../VaultPopupComponents/TaskTimeline';
import TaskStatusDonut from '../VaultPopupComponents/TaskStatusDonut';
import AddTaskPopup from '../VaultPopupComponents/AddTaskPopup';
import UpdateTaskPopup from '../VaultPopupComponents/UpdateTaskPopup';

export default function TaskVault() {
    const { masterKey, clearMasterKey, hideCompletedTasks } = useAppContext();

    const [queryIndex, setQueryIndex] = useState(getCurrentDate(6)); 'YYYY-MM format'

    const [data, setData] = useState();
    const [error, setError] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [query, setQuery] = useState('');

    const [taskToUse, setTaskToUse] = useState(null);

    const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
    const [showUpdateTaskPopup, setShowUpdateTaskPopup] = useState(false);

    const [showHelp, setShowHelp] = useState(false);

    useEffect(()=> {
        if(!masterKey) return;
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/task/${primaryAPIVersion()}/${queryIndex}`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                const taskList = [];
                for(const val of res.data){
                    const decryptedData = JSON.parse(await decryptData(val.taskData, val.nonce, masterKey));
                    decryptedData.id = val._id;
                    val.linkedExpenseId ? decryptedData.linkedExpenseId = val.linkedExpenseId : null;
                    val.linkedNoteId ? decryptedData.linkedNoteId = val.linkedNoteId : null;
                    taskList.push(decryptedData);
                }
                setData(taskList);
            }
        })
        .catch(err =>{
            console.log(err);
            setError('Failed to load tasks');
        });
    }, [refresh, queryIndex, masterKey]);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    const filtered = useMemo(() => {
        if(!query.trim()) return data;
        const q = query.toLowerCase();
        return data.filter(item =>
            item.task.toLowerCase().includes(q)
        );
    }, [data, query]);

    const taskClickAction = (task) =>{
        setShowUpdateTaskPopup(true);
        setTaskToUse(task);
    }

    if(!masterKey){
        return <PinModal/>
    }

    if(!data){
        return <Loading data='Task List' error={error}/>
    }

    return (
        <div className='vault-container'>
            <Heading className='vault-heading' color='#2daaff' size='lg'>Task Vault</Heading>
            <ButtonGroup mt={6}>
                <Button title='add task' onClick={()=> setShowAddTaskPopup(true)} leftIcon={<PlusSquareIcon />}>Task</Button>
                <IconButton title='vault guide' onClick={()=> setShowHelp(true)} icon={<InfoOutlineIcon w={5} h={5} color='white'/>} border='none' background='transparent' _hover={{bgColor: 'transparent'}}/>
            </ButtonGroup>

            <div className='vault-grid'>
                <div className='grid-inner-left'>
                    <div className='label-list-div' style={{display: 'flex', flexDirection: 'column'}}>
                        <label className="login-label">Select Month to View Tasks</label>
                        <input className="login-input" type="month" value={queryIndex} onChange={(e) => setQueryIndex(e.target.value)} placeholder='Select Month'/>
                        
                        <input className="login-input" value={query} onChange={(e)=> setQuery(e.target.value)} placeholder='Search Tasks'/>
                        
                        <Text fontFamily='revert' fontSize='18px' mb={5} fontWeight={500} color='gray' textAlign='center'>Tasks by Status</Text>
                        <TaskStatusDonut tasks={filtered} hideCompletedTasks={hideCompletedTasks}/>
                    </div>
                </div>

                <div className='grid-inner-right' style={{overflowX: 'scroll', scrollbarWidth: 'none'}}>
                    <TaskTimeline tasks={filtered} selectedMonth={parseInt(queryIndex.substring(5, 7))} queryIndex={new Date(queryIndex + '-01')} clickAction={taskClickAction}/>
                </div>
            </div>

            {/* Task Popups */}
            {showAddTaskPopup && <AddTaskPopup setShowPopup={setShowAddTaskPopup} refresh={refresh} setRefresh={setRefresh}/>}
            {showUpdateTaskPopup && <UpdateTaskPopup setShowPopup={setShowUpdateTaskPopup} refresh={refresh} setRefresh={setRefresh} data={taskToUse}/>}
        
            {/* Help Popup */}
            {showHelp && <HelpPopup title="Task Vault Guide" helpText={taskVaultHelpText} setShowPopup={setShowHelp}/>}
        </div>
    );
}
