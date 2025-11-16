import React, { useEffect, useState } from 'react'
import '../CommonComponents/commonStyle.css';
import axios from 'axios';
import { Button, ButtonGroup, CloseButton, Divider, Spacer, Stack, Text, Heading, Badge, IconButton, Wrap, WrapItem } from '@chakra-ui/react';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { encryptData, decryptData } from '../utils/cipherFunctions';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';
import { DeleteIcon, EditIcon, LinkIcon } from '@chakra-ui/icons';
import Loading from '../CommonComponents/Loading';
import {
    FaUtensils,        // Food & Groceries
    FaBus,             // Transport
    FaBook,            // Education
    FaFileInvoiceDollar,            // Bills & Rent
    FaHeartbeat,       // Health
    FaFilm,            // Entertainment
    FaShoppingBag,     // Shopping
    FaChartLine,       // Investment
    FaFolderOpen,      // Other
    FaChartBar,       // analytics button 
} from "react-icons/fa";
import PriorityIcon from './PriorityIcon';

export default function UpdateTaskPopup({setShowPopup, refresh, setRefresh, data}) {
    const { masterKey, notes, hideHighPriorityNotes, trackers } = useAppContext();

    const [id, setId] = useState(data.id);
    const [task, setTask] = useState(data.task);
    const [startDate, setStartDate] = useState(data.startDate.split("T")[0]);
    const [endDate, setEndDate] = useState(data.endDate.split("T")[0]);
    const [status, setStatus] = useState(data.status);

    const [linkedNote, setLinkedNote] = useState(null);
    const [selectedTrackerIndex, setSelectedTrackerIndex] = useState();
    const [linkedExpense, setLinkedExpense] = useState(null);
    const [expenseList, setExpenseList] = useState();

    const [isLoading, setIsLoading] = useState(false);
    const [isChanged, setIsChanged] = useState(false);

    const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
    const [error, setError] = useState(null);

    const [showDeleteTaskPopup, setShowDeleteTaskPopup] = useState(false);

    // for fetching and decrypting links
    useEffect(()=>{
        const token = getAuthToken();
        setIsLoadingExpenses(true);
        axios.post(getBaseURL() + `/api/task/${primaryAPIVersion()}/links`, {linkedExpenseId: data.linkedExpenseId}, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                if(res.data.linkedExpense){
                    const decryptedLinkedExpense = JSON.parse(await decryptData(res.data.linkedExpense.expenseData, res.data.linkedExpense.nonce, masterKey));
                    decryptedLinkedExpense.id = data.linkedExpenseId;
                    decryptedLinkedExpense.trackerIndex = res.data.linkedExpense.trackerIndex;
                    setLinkedExpense(decryptedLinkedExpense);
                    setSelectedTrackerIndex(decryptedLinkedExpense.trackerIndex);
                }
            }
            if(data.linkedNoteId){
                const foundNote = notes.find(note => note.noteId === data.linkedNoteId) || null;
                setLinkedNote(foundNote);
            }
        })
        .catch(err =>{
            console.log(err);
            setError('Failed to load expenses');
        })
        .finally(()=> setIsLoadingExpenses(false));
    }, [data]);

    // for fetching expenses of selected tracker
    useEffect(()=> {
        if(!selectedTrackerIndex) return;
        setIsLoadingExpenses(true);
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/expense/${primaryAPIVersion()}/${selectedTrackerIndex}`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                const list = [];
                for(const val of res.data){
                    const decryptedData = JSON.parse(await decryptData(val.expenseData, val.nonce, masterKey));
                    decryptedData.id = val._id;
                    list.push(decryptedData);
                }
                setExpenseList(list);
            }
        })
        .catch(err =>{
            console.log(err);
            setError('Failed to load expenses');
        })
        .finally(()=> setIsLoadingExpenses(false));
    }, [selectedTrackerIndex]);

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

            const res = await axios.put(getBaseURL() + `/api/task/${primaryAPIVersion()}`, {id, taskData, nonce, queryStart, queryEnd, linkedExpenseId: linkedExpense?.id ?? "", linkedNoteId: linkedNote?.noteId ?? ""}, {headers: {
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

    const getCategoryIcon = (category) => {
        switch (category) {
            case "food & groceries":
                return <FaUtensils />;
            case "transport":
                return <FaBus />;
            case "education":
                return <FaBook />;
            case "bills & rent":
                return <FaFileInvoiceDollar />;
            case "health":
                return <FaHeartbeat />;
            case "entertainment":
                return <FaFilm />;
            case "shopping":
                return <FaShoppingBag />;
            case "investment":
                return <FaChartLine />;
            case "other":
            default:
                return <FaFolderOpen />;
        }
    };

    if(isLoadingExpenses){
        return(
            <div className='popup-container' style={{overflowY: 'scroll', scrollbarWidth: 'none', padding: 0}}>
                <Loading data='Tasks' error={error}/>
            </div>
        )
    }

    return (
        <>
        <div className="popup-overlay" onClick={() => setShowPopup(false)}></div>
        <div className='popup-container' style={{overflowY: 'scroll', scrollbarWidth: 'none'}}>
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

                {/* Linking Notes */}
                <label className="login-label">Linked Note</label>
                <select className="login-input" name="linkedNote" value={linkedNote?.noteId || ""} 
                    onChange={(e) => {
                        const noteId = e.target.value;
                        const selectedNote = notes.find(note => note.noteId === noteId) || null;
                        setLinkedNote(selectedNote);
                        setIsChanged(true);
                    }}
                >
                    <option value="">-- None --</option>
                    {notes.map((note) => {
                        if (hideHighPriorityNotes && parseInt(note.priority) === 3) return null;
                        return (
                            <option key={note.noteId} value={note.noteId}> {note.title} </option>
                        );
                    })}
                </select>


                {/* Linking Expense */}
                <label className="login-label">Tracker for Linked Expense</label>
                <select className="login-input" name='selectedTrackerIndex' value={selectedTrackerIndex} onChange={(e)=> {setSelectedTrackerIndex(e.target.value); setIsChanged(true);}}>
                    <option value="">-- None --</option>
                    {trackers.map((tracker, index) => {
                        if(tracker.isRemoved) return null;
                        return(
                            <option key={index} value={index}>{tracker.trackerName + " → " + tracker.trackingAmount}</option>
                        )
                    })}
                </select>

                <label className="login-label">Linked Expense</label>
                <select className="login-input" name="linkedExpense" value={linkedExpense?.id?.toString() || ""}
                    onChange={(e) => {
                        const id = e.target.value;
                        const foundExpense = expenseList.find(exp => exp.id.toString() == id.toString()) || null;
                        setLinkedExpense(foundExpense);
                        setIsChanged(true);
                    }}
                >
                    <option value="">-- None --</option>
                    {expenseList?.map((expense) => (
                        <option key={expense.id} value={expense.id.toString()}> {expense.spentAt} </option>
                    ))}
                </select>

                <ButtonGroup>
                    <Button colorScheme='red' width='full' disabled={isLoading} onClick={()=> setShowDeleteTaskPopup(true)} leftIcon={<DeleteIcon/>}>Delete</Button>
                    <Button width='full' disabled={!isChanged || isLoading} type="submit" onClick={updateTask} leftIcon={<EditIcon/>}>Update</Button>
                </ButtonGroup>

                <Divider my={3}/>

                <Text fontSize='xl' ml={1} mb={3} justifyContent='center'> <LinkIcon h={4} w={4}/> Links</Text>

                {/* expense */}
                {linkedExpense && <div className='password-card' style={{width: 'full', minWidth: '300px', marginBottom: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#121826', borderTopRightRadius: '16px', borderTopLeftRadius: '16px'}}>
                        <Heading size='lg'>{linkedExpense.amount}</Heading>
                        <div style={{padding: '5px', color: '#dddddd', fontSize: '20px'}}>
                            {getCategoryIcon(linkedExpense.category)}
                        </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px 15px 15px', backgroundColor: '#222b3e', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'}}>
                        <div>
                            <Text>{linkedExpense.spentAt}</Text>
                            <Badge>{linkedExpense.spentDate}</Badge>
                        </div>
                    </div>
                </div>}

                {/* note */}
                {linkedNote && <WrapItem>
                    <Stack className='password-card' style={{width: '160px', minWidth: '160px', borderLeft: `5px solid ${linkedNote.categoryColor}`, height: '200px', cursor: 'pointer', zIndex: 1, borderRadius: '10px', padding: '10px', backgroundColor: '#121826'}}>
                        <Text fontSize='16px' fontWeight={600}>{linkedNote.title.slice(0, 45)}...</Text>
                        {linkedNote.tag && <Badge colorScheme='gray' width='fit-content'>{linkedNote.tag}</Badge>}
                        <Spacer/>
                        <Stack align='center' direction='row'>
                            <PriorityIcon priority={parseInt(linkedNote.priority)}/>
                        </Stack>
                    </Stack>
                </WrapItem>}

            </form>

            {showDeleteTaskPopup && <ConfirmationPopup title='Delete Task' confirmButtonName='Delete' confirmMsg="This action cannot be undone, are you sure to delete this task?" setShowPopup={setShowDeleteTaskPopup} confirmAction={deleteTask} actionParams1={id} isLoading={isLoading}/>}
        </div>
        </>
    );
}
