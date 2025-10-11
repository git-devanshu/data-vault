import React, { useEffect, useState, useMemo } from 'react'
import './vaultStyle.css';
import { useAppContext } from '../context/AppContext';
import useClearOnUnmount from '../hooks/useClearOnUnmount';
import PinModal from '../CommonComponents/PinModal';
import Loading from '../CommonComponents/Loading';
import { primaryAPIVersion, getAuthToken, getBaseURL } from '../utils/helperFunctions';
import { decryptData, encryptData } from '../utils/cipherFunctions';
import { passwordVaultHelpText } from '../utils/helpTextForModules';
import toast from 'react-hot-toast';
import { Badge, Button, ButtonGroup, Heading, IconButton, Text, Input, InputLeftElement, InputGroup, InputRightElement } from '@chakra-ui/react';
import { PlusSquareIcon, DeleteIcon, EditIcon, CopyIcon, AtSignIcon, LockIcon, RepeatIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import axios from 'axios';
import AddLabelPopup from '../VaultPopupComponents/AddLabelPopup';
import AddPasswordPopup from '../VaultPopupComponents/AddPasswordPopup';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';
import HelpPopup from '../CommonComponents/HelpPopup';
import UpdatePasswordPopup from '../VaultPopupComponents/UpdatePasswordPopup';

export default function PasswordVault() {
    const { masterKey, clearMasterKey, labels, setLabels, hideRemovedLabels } = useAppContext();

    const [labelIndex, setLabelIndex] = useState(0);

    const [data, setData] = useState();
    const [error, setError] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [query, setQuery] = useState('');

    const [labelIndexToUse, setLableIndexToUse] = useState(); // for removing and recovering labels
    const [passwordToBeUpdated, setPasswordToBeUpdated] = useState();
    const [passwordIdToRemove, setPasswordIdToRemove] = useState();

    const [showAddLabelPopup, setShowAddLabelPopup] = useState(false);
    const [showRemoveLabelPopup, setShowRemoveLabelPopup] = useState(false);
    const [showRecoverLabelPopup, setShowRecoverLabelPopup] = useState(false);

    const [showAddPasswordPopup, setShowAddPasswordPopup] = useState(false);
    const [showUpdatePasswordPopup, setShowUpdatePasswordPopup] = useState(false);
    const [showDeletePasswordPopup, setShowDeletePasswordPopup] = useState(false);

    const [showHelp, setShowHelp] = useState(false);

    useEffect(()=> {
        if(!masterKey) return;
        const token = getAuthToken();
        axios.get(getBaseURL() + `/api/password/${primaryAPIVersion()}/${labelIndex}`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(async res =>{
            if(res.status === 200){
                const passwordList = [];
                for(const val of res.data){
                    const decryptedData = JSON.parse(await decryptData(val.passwordData, val.nonce, masterKey));
                    decryptedData.id = val._id;
                    passwordList.push(decryptedData);
                }
                setData(passwordList);
            }
        })
        .catch(err =>{
            console.log(err);
            setError('Failed to load passwords');
        });
    }, [refresh, labelIndex, masterKey]);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    const filtered = useMemo(() => {
        if(!query.trim()) return data;
        const q = query.toLowerCase();
        return data.filter(item =>
            item.platform.toLowerCase().includes(q)
        );
    }, [data, query]);

    const copyUsername = () =>{
        navigator.clipboard.writeText(data.username);
        toast.success('Username copied to clipboard');
    }

    const copyPassword = () =>{
        navigator.clipboard.writeText(data.password);
        toast.success('Password copied to clipboard');
    }

    // remove = true --> remove label and remove = false --> recover label
    const removeOrRecoverLabel = async(labelIndexToUse, remove = true) =>{
        if(!labelIndexToUse){
            toast.error("something went wrong!");
            return;
        }
        const token = getAuthToken();
        const toastId = toast.loading('updating labels...');
        setIsLoading(true);

        try{
            const updatedLabels = [...labels];
            if(remove){
                updatedLabels[labelIndexToUse] = `*d*${updatedLabels[labelIndexToUse]}`;
            } 
            else {
                updatedLabels[labelIndexToUse] = updatedLabels[labelIndexToUse].slice(3);
            }
            
            const {encryptedData: labelList, nonce: labelNonce} = await encryptData(JSON.stringify(updatedLabels), masterKey);

            const res = await axios.put(getBaseURL() + `/api/password/${primaryAPIVersion()}/label`, {labelList, labelNonce},{headers : {
                Authorization : `Bearer ${token}`
            }})

            if(res.status === 200){
                toast.success(res.data.message, {id : toastId});
                setLabels(updatedLabels);
                setShowRemoveLabelPopup(false);
                setShowRecoverLabelPopup(false);
            }
            setIsLoading(false);
        }
        catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
            setShowRemoveLabelPopup(false);
            setShowRecoverLabelPopup(false);
        }
    }

    const deletePassword = async(passwordId) =>{
        if(!passwordId){
            toast.error("something went wrong");
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('deleting password...');
        setIsLoading(true);

        axios.delete(getBaseURL() + `/api/password/${primaryAPIVersion()}/${passwordId}`, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data.message, {id : toastId});
                setShowDeletePasswordPopup(false);
                setPasswordIdToRemove(null);
                setRefresh(!refresh);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
            setShowDeletePasswordPopup(false);
        });
    }

    if(!masterKey){
        return <PinModal/>
    }

    if(!data){
        return <Loading data='Password List' error={error}/>
    }

    return (
        <div className='vault-container'>
            <Heading className='vault-heading' color='#2daaff' size='lg'>Password Vault</Heading>
            <ButtonGroup mt={6}>
                <Button title='add password' onClick={()=> setShowAddPasswordPopup(true)} leftIcon={<PlusSquareIcon />}>Password</Button>
                <Button title='create label' onClick={()=> setShowAddLabelPopup(true)} variant='outline' color='white' _hover={{bgColor: 'transparent'}} leftIcon={<PlusSquareIcon />}>Label</Button>
                <IconButton title='vault guide' onClick={()=> setShowHelp(true)} icon={<InfoOutlineIcon w={5} h={5} color='white'/>} border='none' background='transparent' _hover={{bgColor: 'transparent'}}/>
            </ButtonGroup>

            <div className='vault-grid'>
                <div className='grid-inner-left'>
                    <div className='label-list-div'>
                    <Text fontFamily='revert' fontSize='18px' mb={5} textAlign='center' fontWeight={500}>LABELS</Text>
                        {labels.length !== 0 && labels?.map((item, ind)=>{
                            if(!item.startsWith("*d*")){
                                return(
                                    <div key={ind} className={labelIndex === ind ? 'label-item-selected' : 'label-item'}>
                                        <div onClick={()=> setLabelIndex(ind)} style={{display: "grid", alignItems: 'center'}}>
                                            <Text fontSize='18px' color='#aaaaaa'>{item}</Text>
                                        </div>
                                        {ind !== 0 && <IconButton title='remove' onClick={()=> { setShowRemoveLabelPopup(true); setLableIndexToUse(ind); }} variant='outline' colorScheme='red' _hover={{bgColor: 'transparent'}} h='34px' icon={<DeleteIcon />} />}
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {!hideRemovedLabels && <div className='label-list-div' style={{marginTop: '10px'}}>
                        <Text fontFamily='revert' fontSize='18px' mt={2} mb={2} textAlign='center' fontWeight={500}>REMOVED LABELS</Text>

                        {labels.length !== 0 && labels?.map((item, ind)=>{
                            if(item.startsWith("*d*")){
                                return(
                                    <div key={ind} className='label-item' style={{cursor: 'default'}}>
                                        <div style={{display: "grid", alignItems: 'center'}}>
                                            <Text fontSize='18px' color='#aaaaaa'>{item.slice(3)}</Text>
                                        </div>
                                        {<IconButton title='recover' onClick={()=> { setShowRecoverLabelPopup(true); setLableIndexToUse(ind); }} variant='outline' colorScheme='green' _hover={{bgColor: 'transparent'}} h='34px' icon={<RepeatIcon />} />}
                                    </div>
                                );
                            }
                        })}
                    </div>}
                </div>

                <div className='grid-inner-right'>
                    <input className="login-input" value={query} onChange={(e)=> setQuery(e.target.value)} placeholder='Search Password' style={{marginRight: '15px'}}/>
                    
                    {(filtered?.length === 0) && <Text color='#aaa' mt={8} textAlign='center'>No Passwords Added.</Text>}
                    
                    {filtered?.length > 0 && <div className='password-card-div'>
                        {filtered.map((item, ind)=>{
                            return(
                                <div className='password-card' key={ind}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px'}}>
                                        <Heading size='md'>{item.platform}</Heading>
                                        <Badge>{item.label}</Badge>
                                    </div>
                                    <div style={{padding: '0 10px 0 10px'}}>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents='none'>
                                                <AtSignIcon color='gray.300' />
                                            </InputLeftElement>
                                            <Input type='text' value={item.username} border='none' readonly/>
                                            <InputRightElement>
                                                <IconButton title='copy' onClick={copyUsername} icon={<CopyIcon/>} backgroundColor='transparent' color='gray' _hover={{backgroundColor: 'transparent', color: 'white'}}/>
                                            </InputRightElement>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents='none'>
                                                <LockIcon color='gray.300' />
                                            </InputLeftElement>
                                            <Input type='text' value={item.password} border='none' readonly/>
                                            <InputRightElement>
                                                <IconButton title='copy' onClick={copyPassword} icon={<CopyIcon/>} backgroundColor='transparent' color='gray' _hover={{backgroundColor: 'transparent', color: 'white'}}/>
                                            </InputRightElement>
                                        </InputGroup>
                                    </div>
                                    <div style={{display: 'flex', marginTop: '10px', backgroundColor: '#222b3e', padding: '10px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'}}>
                                        <Button width='full' onClick={()=> { setPasswordToBeUpdated(item); setShowUpdatePasswordPopup(true); }} leftIcon={<EditIcon/>}>Edit</Button>
                                        <Button width='full' onClick={()=>{ setPasswordIdToRemove(item.id); setShowDeletePasswordPopup(true); }} colorScheme='red' ml={3} leftIcon={<DeleteIcon/>}>Delete</Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>}
                </div>
            </div>

            {/* Label Popups */}
            {showAddLabelPopup && <AddLabelPopup setShowPopup={setShowAddLabelPopup}/>}
            {showRemoveLabelPopup && <ConfirmationPopup title='Delete Label' confirmButtonName='Remove' confirmMsg="Please note that passwords under this label (if any) will NOT be deleted and the label can be recovered." setShowPopup={setShowRemoveLabelPopup} confirmAction={removeOrRecoverLabel} actionParams1={labelIndexToUse} actionParams2={true} isLoading={isLoading}/>}
            {showRecoverLabelPopup && <ConfirmationPopup title='Recover Label' confirmButtonName='Recover' confirmMsg="If you have undeleted passwords under this label, they will become accessible again if you recover this label." setShowPopup={setShowRecoverLabelPopup} confirmAction={removeOrRecoverLabel} actionParams1={labelIndexToUse} actionParams2={false} isLoading={isLoading} actionColor='green'/>}

            {/* Password Popups */}
            {showAddPasswordPopup && <AddPasswordPopup refresh={refresh} setRefresh={setRefresh} setShowPopup={setShowAddPasswordPopup}/>}
            {showUpdatePasswordPopup && <UpdatePasswordPopup refresh={refresh} setRefresh={setRefresh} setShowPopup={setShowUpdatePasswordPopup} passwordDataObj={passwordToBeUpdated}/>}
            {showDeletePasswordPopup && <ConfirmationPopup title='Delete Password' confirmButtonName='Delete' confirmMsg="This action cannot be undone, are you sure to delete this password?" setShowPopup={setShowDeletePasswordPopup} confirmAction={deletePassword} actionParams1={passwordIdToRemove} isLoading={isLoading}/>}

            {/* Help Popup */}
            {showHelp && <HelpPopup title="Password Vault Guide" helpText={passwordVaultHelpText} setShowPopup={setShowHelp}/>}
        </div>
    );
}
