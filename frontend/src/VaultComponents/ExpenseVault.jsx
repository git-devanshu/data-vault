import React, { useEffect, useState, useMemo } from 'react'
import './vaultStyle.css';
import { useAppContext } from '../context/AppContext';
import useClearOnUnmount from '../hooks/useClearOnUnmount';
import PinModal from '../CommonComponents/PinModal';
import Loading from '../CommonComponents/Loading';
import { primaryAPIVersion, getAuthToken, getBaseURL } from '../utils/helperFunctions';
import { decryptData, encryptData } from '../utils/cipherFunctions';
import { expenseVaultHelpText } from '../utils/helpTextForModules';
import toast from 'react-hot-toast';
import { Badge, Button, ButtonGroup, Heading, IconButton, Text } from '@chakra-ui/react';
import { PlusSquareIcon, DeleteIcon, RepeatIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import axios from 'axios';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';
import HelpPopup from '../CommonComponents/HelpPopup';
import AddTrackerPopup from '../VaultPopupComponents/AddTrackerPopup';
import AddExpensePopup from '../VaultPopupComponents/AddExpensePopup';
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
import ExpenseAnalyticsPopup from '../VaultPopupComponents/ExpenseAnalyticsPopup';

export default function ExpenseVault() {
    const { masterKey, clearMasterKey, trackers, setTrackers, hideRemovedTrackers, hideExpenseDeleteButton } = useAppContext();

    const [trackerIndex, setTrackerIndex] = useState(0);

    const [data, setData] = useState();
    const [error, setError] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [query, setQuery] = useState('');

    const [trackerIndexToUse, setTrackerIndexToUse] = useState(); // used for removing or recovering tracker
    const [expenseIdToRemove, setExpenseIdToRemove] = useState();

    const [showAddTrackerPopup, setShowAddTrackerPopup] = useState(false);
    const [showRemoveTrackerPopup, setShowRemoveTrackerPopup] = useState(false);
    const [showRecoverTrackerPopup, setShowRecoverTrackerPopup] = useState(false);

    const [showAddExpensePopup, setShowAddExpensePopup] = useState(false);
    const [showDeleteExpensePopup, setShowDeleteExpensePopup] = useState(false);

    const [showHelp, setShowHelp] = useState(false);

    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(()=> {
        if(!masterKey) return;
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/expense/${primaryAPIVersion()}/${trackerIndex}`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                const expenseList = [];
                for(const val of res.data){
                    const decryptedData = JSON.parse(await decryptData(val.expenseData, val.nonce, masterKey));
                    decryptedData.id = val._id;
                    expenseList.push(decryptedData);
                }
                setData(expenseList);
            }
        })
        .catch(err =>{
            console.log(err);
            setError('Failed to load expenses');
        });
    }, [refresh, trackerIndex, masterKey]);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    const filtered = useMemo(() => {
        if(!query.trim()) return data;
        const q = query.toLowerCase();
        return data.filter(item =>
            item.spentAt.toLowerCase().includes(q)
        );
    }, [data, query]);

    // remove = true --> remove tracker and remove = false --> recover tracker
    const removeOrRecoverTracker = async(trackerIndexToUse, remove = true) =>{
        if(!trackerIndexToUse){
            toast.error("something went wrong!");
            return;
        }
        const token = getAuthToken();
        const toastId = toast.loading('updating trackers...');
        setIsLoading(true);

        try{
            const updatedTrackers = [...trackers];
            if(remove){
                updatedTrackers[trackerIndexToUse].isRemoved = true;
            }
            else {
                updatedTrackers[trackerIndexToUse].isRemoved = false;
            }
            
            const {encryptedData: trackerList, nonce: trackerNonce} = await encryptData(JSON.stringify(updatedTrackers), masterKey);

            const res = await axios.put(getBaseURL() + `/api/expense/${primaryAPIVersion()}/tracker`, {trackerList, trackerNonce}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setTrackers(updatedTrackers);
                setShowRemoveTrackerPopup(false);
                setShowRecoverTrackerPopup(false);
            }
            setIsLoading(false);
        }
        catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
            setShowRemoveTrackerPopup(false);
            setShowRecoverTrackerPopup(false);
        }
    }

    const deleteExpense = async(expenseId) =>{
        if(!expenseId){
            toast.error("something went wrong");
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('deleting expense...');
        setIsLoading(true);

        axios.delete(getBaseURL() + `/api/expense/${primaryAPIVersion()}/${expenseId}`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setShowDeleteExpensePopup(false);
                setExpenseIdToRemove(null);
                setRefresh(!refresh);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
            setShowDeleteExpensePopup(false);
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

    if(!masterKey){
        return <PinModal/>
    }

    if(!data){
        return <Loading data='Expense List' error={error}/>
    }

    return (
        <div className='vault-container'>
            <Heading className='vault-heading' color='#2daaff' size='lg'>Expense Vault</Heading>
            <ButtonGroup mt={6}>
                <Button title='add expense' onClick={()=> setShowAddExpensePopup(true)} leftIcon={<PlusSquareIcon />}>Expense</Button>
                <Button title='create tracker' onClick={()=> setShowAddTrackerPopup(true)} variant='outline' color='white' _hover={{bgColor: 'transparent'}} leftIcon={<PlusSquareIcon />}>Tracker</Button>
                <IconButton title='vault guide' onClick={()=> setShowHelp(true)} icon={<InfoOutlineIcon w={5} h={5} color='white'/>} border='none' background='transparent' _hover={{bgColor: 'transparent'}}/>
            </ButtonGroup>

            <div className='vault-grid'>
                <div className='grid-inner-left'>
                    <div className='label-list-div'>
                    <Text fontFamily='revert' fontSize='18px' mb={5} textAlign='center' fontWeight={500}>TRACKERS</Text>
                        {trackers?.length !== 0 && trackers.map((item, ind)=>{
                            if(!item.isRemoved){
                                return(
                                    <div key={ind} className={trackerIndex === ind ? 'label-item-selected' : 'label-item'}>
                                        <div title={item.trackerName} onClick={()=> setTrackerIndex(ind)} style={{display: "grid", alignItems: 'center'}}>
                                            <Text fontSize='16px' color='#aaaaaa' fontWeight={600}>{item.trackerName}</Text>
                                            <Text fontSize='16px' color='#aaaaaa'>{item.trackingAmount}</Text>
                                        </div>
                                        {ind !== 0 && <IconButton title='remove' onClick={()=> {setTrackerIndexToUse(ind); setShowRemoveTrackerPopup(true)}} variant='outline' colorScheme='red' _hover={{bgColor: 'transparent'}} icon={<DeleteIcon />} />}
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {!hideRemovedTrackers && <div className='label-list-div' style={{marginTop: '10px'}}>
                        <Text fontFamily='revert' fontSize='18px' mt={2} mb={2} textAlign='center' fontWeight={500}>REMOVED TRACKERS</Text>

                        {trackers?.length !== 0 && trackers.map((item, ind)=>{
                            if(item.isRemoved){
                                return(
                                    <div key={ind} className='label-item'>
                                        <div title={item.trackerName} style={{display: "grid", alignItems: 'center'}}>
                                            <Text fontSize='18px' color='#aaaaaa'>{item.trackerName}</Text>
                                            <Text fontSize='17px' color='#aaaaaa' fontWeight={500}>{item.trackingAmount}</Text>
                                        </div>
                                        {<IconButton title='recover' onClick={()=> {setShowRecoverTrackerPopup(true); setTrackerIndexToUse(ind); }} variant='outline' colorScheme='green' _hover={{bgColor: 'transparent'}} icon={<RepeatIcon />} />}
                                    </div>
                                );
                            }
                        })}
                    </div>}
                </div>

                <div className='grid-inner-right'>
                    <input className="login-input" value={query} onChange={(e)=> setQuery(e.target.value)} placeholder='Search Expense' style={{marginRight: '15px'}}/>
                    <IconButton title='analytics' onClick={()=> {setShowAnalytics(true); }} variant='solid' icon={<FaChartBar />} />
                    
                    {(filtered?.length === 0) && <Text color='#aaa' mt={8} textAlign='center'>No Expenses Added.</Text>}
                    
                    {filtered?.length > 0 && <div className='password-card-div'>
                        {filtered.map((item, ind)=>{
                            return(
                                <div className='password-card' key={ind}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px'}}>
                                        <Heading size='lg'>{item.amount}</Heading>
                                        <div style={{padding: '5px', color: '#dddddd', fontSize: '20px'}}>
                                            {getCategoryIcon(item.category)}
                                        </div>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px 15px 15px', backgroundColor: '#222b3e', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'}}>
                                        <div>
                                            <Text>{item.spentAt}</Text>
                                            <Badge>{item.spentDate}</Badge>
                                        </div>
                                        {!hideExpenseDeleteButton && <IconButton title='delete' onClick={()=> {setShowDeleteExpensePopup(true); setExpenseIdToRemove(item.id)}} variant='outline' colorScheme='red' _hover={{bgColor: 'transparent'}} icon={<DeleteIcon />} />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>}
                </div>
            </div>

            {/* Tracker Popups */}
            {showAddTrackerPopup && <AddTrackerPopup setShowPopup={setShowAddTrackerPopup}/>}
            {showRemoveTrackerPopup && <ConfirmationPopup title='Remove Tracker' confirmButtonName='Remove' confirmMsg="Please note that the expenses under this tracker (if any) will NOT be deleted and the tracker can be recovered." setShowPopup={setShowRemoveTrackerPopup} confirmAction={removeOrRecoverTracker} actionParams1={trackerIndexToUse} actionParams2={true} isLoading={isLoading}/>}
            {showRecoverTrackerPopup && <ConfirmationPopup title='Recover Tracker' confirmButtonName='Recover' confirmMsg="If you have undeleted expenses under this tracker, they will become accessible again if you recover this tracker." setShowPopup={setShowRecoverTrackerPopup} confirmAction={removeOrRecoverTracker} actionParams1={trackerIndexToUse} actionParams2={false} isLoading={isLoading} actionColor='blue'/>}

            {/* Expense Popups */}
            {showAddExpensePopup && <AddExpensePopup setShowPopup={setShowAddExpensePopup} setRefresh={setRefresh} refresh={refresh} trackerIndex={trackerIndex}/>}
            {showDeleteExpensePopup && <ConfirmationPopup title='Delete Expense' confirmButtonName='Delete' confirmMsg="This action cannot be undone, are you sure to delete this expense?" setShowPopup={setShowDeleteExpensePopup} confirmAction={deleteExpense} actionParams1={expenseIdToRemove} isLoading={isLoading}/>}

            {/* Analytics Popup */}
            {showAnalytics && <ExpenseAnalyticsPopup setShowPopup={setShowAnalytics} data={data} trackingAmount={trackers[trackerIndex].trackingAmount} trackerName={trackers[trackerIndex].trackerName} />}

            {/* Help Popup */}
            {showHelp && <HelpPopup title="Expense Vault Guide" helpText={expenseVaultHelpText} setShowPopup={setShowHelp}/>}
        </div>
    );
}
