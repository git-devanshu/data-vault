import React, { useState, useMemo, useEffect } from 'react'
import '../VaultComponents/vaultStyle.css';
import { useAppContext } from '../context/AppContext';
import useClearOnUnmount from '../hooks/useClearOnUnmount';
import PinModal from '../CommonComponents/PinModal';
import Loading from '../CommonComponents/Loading';
import { Badge, Button, Heading, IconButton, Text, Input, InputLeftElement, InputGroup, InputRightElement } from '@chakra-ui/react';
import { CopyIcon, AtSignIcon, UnlockIcon, LockIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getAuthToken, getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import toast from 'react-hot-toast';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';

export default function AccessControlPage() {
    const { masterKey, clearMasterKey } = useAppContext();

    const [data, setData] = useState();
    const [error, setError] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [query, setQuery] = useState('');

    const [userId, setUserId] = useState(); // used for both block and unblock functions

    const [showBlockUserPopup, setShowBlockUserPopup] = useState(false);
    const [showUnblockUserPopup, setShowUnblockUserPopup] = useState(false);

    useEffect(()=>{
        if(!masterKey) return;
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/admin/${primaryAPIVersion()}/users`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                setData(res.data);
            }
        })
        .catch(err =>{
            console.log(err);
            setError('Failed to load user list');
        });
    }, [refresh, masterKey]);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    const filtered = useMemo(() => {
        if(!query.trim()) return data;
        const q = query.toLowerCase();
        return data.filter(item =>
            item.name.toLowerCase().includes(q)
        );
    }, [data, query]);

    const copyEmail = () =>{
        navigator.clipboard.writeText(data.email);
        toast.success('Email copied to clipboard');
    }

    const blockUnblockUser = async(actionType) =>{
        if(!userId){
            toast.error("something went wrong!");
            return;
        }

        const toastId = toast.loading("please wait...");
        setIsLoading(true);
        const token = getAuthToken();

        axios.post(getBaseURL() + `/api/admin/${primaryAPIVersion()}/${actionType}-user`, {id: userId}, {headers: {
            Authorization: `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                setRefresh(!refresh);
                toast.success(res.data?.message, {id : toastId});
                setUserId(null);
            }
            setIsLoading(false);
            setShowBlockUserPopup(false);
            setShowUnblockUserPopup(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
            setShowBlockUserPopup(false);
            setShowUnblockUserPopup(false);
        });
    }

    if(!masterKey){
        return <PinModal/>
    }

    if(!data){
        return <Loading data='Data' error={error}/>
    }

    return(
        <div className='vault-container'>
            <Heading className='vault-heading' color='#2daaff' size='lg'>Access Control Page</Heading>
            <input className="login-input" value={query} onChange={(e)=> setQuery(e.target.value)} placeholder='Search User' style={{marginRight: '15px', marginTop: '20px'}}/>

            {(filtered?.length === 0) && <Text color='#aaa' mt={8} textAlign='center'>No users found.</Text>}
            {filtered?.length > 0 && <div className='password-card-div'>
                {filtered.map((item, ind)=>{
                    return(
                        <div className='password-card' key={ind}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                <Heading size='md'>{item.name}</Heading>
                                <Badge colorScheme={item.isBlocked ? "red" : "green"}>{item.isBlocked ? "Blocked" : "Free"}</Badge>
                            </div>
                            <InputGroup mb={2}>
                                <InputLeftElement pointerEvents='none'>
                                    <AtSignIcon color='gray.300' />
                                </InputLeftElement>
                                <Input type='text' value={item.email} border='none' readonly/>
                                <InputRightElement>
                                    <IconButton onClick={copyEmail} icon={<CopyIcon/>} backgroundColor='transparent' color='gray' _hover={{backgroundColor: 'transparent', color: 'white'}}/>
                                </InputRightElement>
                            </InputGroup>
                            {!item.isBlocked && <Button onClick={()=> { setUserId(item._id); setShowBlockUserPopup(true) }} disabled={isLoading} colorScheme='red' leftIcon={<LockIcon/>}>Block</Button>}
                            {item.isBlocked && <Button onClick={()=> { setUserId(item._id); setShowUnblockUserPopup(true) }} disabled={isLoading} colorScheme='green' leftIcon={<UnlockIcon/>}>Unblock</Button>}
                        </div>
                    )
                })}
            </div>}

            {/* Access Control Popups */}
            {showBlockUserPopup && <ConfirmationPopup confirmAction={blockUnblockUser} confirmButtonName="Block" confirmMsg="Do you want to block this user from accessing his DataVault?" setShowPopup={setShowBlockUserPopup} actionParams1={"block"} isLoading={isLoading} title="Block User"/>}
            {showUnblockUserPopup && <ConfirmationPopup confirmAction={blockUnblockUser} confirmButtonName="Unblock" confirmMsg="Do you want to unblock this user, he will regain access to his DataVault?" setShowPopup={setShowBlockUserPopup} actionParams1={"unblock"} isLoading={isLoading} title="Unblock User"/>}
        </div>
    );
}
