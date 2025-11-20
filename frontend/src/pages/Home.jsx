import React, { useEffect, useState } from 'react'
import './homeStyle.css';
import { Avatar, Heading, Text, Menu, MenuButton, Spinner, MenuList, Divider, MenuItem, Stack, Spacer, Button, Badge } from '@chakra-ui/react';
import { ArrowForwardIcon, AtSignIcon, InfoIcon, LockIcon, NotAllowedIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaSignOutAlt } from "react-icons/fa";
import { decodeToken, getAuthToken, getBaseURL, removeAuthToken } from '../utils/helperFunctions';
import { useNavigate } from 'react-router-dom';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';
import { useAppContext } from '../context/AppContext';
import Favicon from '../../public/favicon.svg'
import passwordIcon from '../../public/password.png'
import taskIcon from '../../public/tasks.png'
import expenseIcon from '../../public/expense.png'
import notebookIcon from '../../public/notebook.png'
import axios from 'axios';

export default function Home() {
    const navigate = useNavigate();
    const name = decodeToken(getAuthToken()).name;
    const role = decodeToken(getAuthToken()).role;

    const date = new Date();
    const yyyymm = `${date.getMonth() + 1}/${date.getFullYear()}`;

    const { clearMasterKey, setLabels, setTrackers, setNotes } = useAppContext();

    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    const [reload, setReload] = useState(false);
    const [error, setError] = useState(null);
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);

    const [loadingClassName, setLaodingClassName] = useState('loading');

    useEffect(()=> {
        clearMasterKey();
        setLabels([]);
        setTrackers([]);
        setNotes([]);
    }, []);

    useEffect(()=> {
        setIsCheckingHealth(true);
        setLaodingClassName('loading');
        setError(null);
        axios.get(getBaseURL() + "/health", { timeout: 120000 })
        .then(res =>{
            setLaodingClassName('success');
            if(res.status === 200){
                setTimeout(()=> setIsCheckingHealth(false), 800);
            }
        })
        .catch(error =>{
            setLaodingClassName('error');
            console.log(error);
            if (error.code === "ECONNABORTED") setError('There was a timeout! The server is taking too long to respond.');
            else setError('Failed to connect to DataVault. Please check your internet connection and try again.')
        })
    }, [reload]);

    const navigateToVault = (vaultName) =>{
        navigate(`/vault/${vaultName}`);
    }

    const navigateToAdminPage = () =>{
        navigate('/access-control');
    }

    const navigateToSettings = () =>{
        navigate('/settings');
    }

    const navigateToAbout = () =>{
        navigate('/about');
    }

    const logout = () =>{
        removeAuthToken();
        navigate('/login');
    }

    if(isCheckingHealth){
        return(
            <div className='parent-container' style={{gap:'0'}}>
                <div style={{boxShadow: 'none', backgroundColor: '#121826', height: 'auto', width: '300px', position: 'fixed', left: 'calc((100% - 300px)/2)', top: 'calc((100vh - 400px)/2)'}}>
                    {!error && <Heading textAlign='center' size='lg' mb={4} color='#eee'>Opening The Vault</Heading>}
                    {error && <Heading textAlign='center' size='lg' mb={4} color='red.600'>Failed To Open</Heading>}
                    <div className='logo-outline'>
                        <div className={`vault-door-handle-${loadingClassName}`}/>
                        <img src={Favicon} className={`side-logo-${loadingClassName}`}/>
                    </div>
                    {!error && <Text textAlign='center' fontSize={17} mt={3} color='gray.500'>We are trying to establish connection. This may take upto 2 minutes.</Text>}
                    {error && <div>
                        <Text color='red.500' textAlign='center' fontSize={17} mt={3}>{error}</Text>
                        <Button mt={5} width='full' variant='outline' colorScheme='whiteAlpha' onClick={()=> setReload(!reload)}>Try Again</Button>    
                    </div>} 
                </div>
            </div>
        )
    }

    return (
        <div className='parent-container'>
            {/* header */}
            <div className='top-header'>
                <div>
                    <img src={Favicon} style={{height: '30px'}}/>
                    <h1>DataVault</h1>
                </div>
                <Menu>
                    <MenuButton title='profile'>
                        <Avatar size="sm" name={name} />
                    </MenuButton>
                    <MenuList flexDir='column' bg="#1b2232" color='white' minWidth='160px' width='fit-content' borderColor='#222b3e' alignItems='center'>
                        <Text mx={3} my={1} textAlign='center' color='#2daaff'>{name}</Text>
                        <Divider mt={2} />
                        <MenuItem bg="#1b2232" _hover={{backgroundColor: "#222b3e"}} onClick={navigateToSettings} icon={<SettingsIcon/>}>Settings</MenuItem>
                        <MenuItem bg="#1b2232" _hover={{backgroundColor: "#222b3e"}} onClick={navigateToAbout} icon={<InfoIcon/>}>About</MenuItem>
                        <Divider />
                        <MenuItem bg="#1b2232" _hover={{backgroundColor: "#222b3e"}} onClick={()=> setShowLogoutPopup(true)} icon={<FaSignOutAlt/>}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>

            {/* grid section */}
            <div className='main-section'>
                <div>
                    <Heading textAlign='center' mb={4} color='#2daaff15'>The Vault</Heading>
                    <div className='logo-outline'>
                        <div className='vault-door-handle'/>
                        <img src={Favicon} className='side-logo'/>
                    </div>
                </div>


                <div className='module-stack'>
                    <Stack onClick={()=> navigateToVault('password')} style={{height:'140px', width:'260px', backgroundColor:'rgb(254, 187, 64)', borderRadius:'12px'}} className='card-mp'>
                        <Stack direction='row' p='15px' align='center'>
                            <img src={passwordIcon} style={{height: '40px'}}/>
                            <Spacer/>
                            <Heading color='blackAlpha.800' fontFamily='body' fontSize={22} fontWeight={700}>Password Vault</Heading>
                        </Stack>
                        <Spacer/>
                        <div style={{height: '30%', width: '100%', borderTop: '1px solid black', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', color: '#232323', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px'}}>
                            <Text color='blackAlpha.800' fontSize={14} fontWeight={500}><AtSignIcon mt='-5px' h={4} w={4}/> username</Text>
                            <Text color='blackAlpha.800' fontSize={14} fontWeight={500}><LockIcon mt='-5px' h={4} w={4}/> password</Text>
                        </div>
                    </Stack>

                    <Stack onClick={()=> navigateToVault('expense')} style={{height:'140px', width:'260px', backgroundColor:'#2daaff', borderRadius:'12px'}} className='card-mp'>
                        <Stack direction='row' p='15px' align='center'>
                            <img src={expenseIcon} style={{height: '35px'}}/>
                        </Stack>
                        <Text ml='15px' mt={-5} fontSize={20} fontFamily='serif' color='black'>**** **** **** ****</Text>
                        <Text ml='15px' mt={-5} fontSize={15} color='black'>{yyyymm}</Text>
                        <Stack direction='row' px='15px' align='center' mb={1}>
                            <Heading color='blackAlpha.800' fontFamily='body' fontSize={18} fontWeight={700}>Expense Tracker</Heading>
                            <Spacer/>
                            <Text fontStyle='italic' fontSize={20} fontWeight={900}>1DV</Text>
                        </Stack>
                    </Stack>

                    <Stack onClick={()=> navigateToVault('task')} style={{height:'140px', width:'260px', backgroundColor:'#1b2232', borderRadius:'12px', border: '1px solid gray'}} className='card-mp'>            
                        <Stack direction='row' p='10px' borderBottom='1px solid gray' align='center'>
                            <Heading color='#ddd' fontFamily='body' fontSize={20} fontWeight={700}>Task Vault</Heading>
                            <Spacer/>
                            <img src={taskIcon} style={{height: '30px', filter: 'invert(1)'}}/>
                        </Stack>
                        <Stack>
                            <div style={{height: 'auto', width: '100px', borderRadius: '7px', backgroundColor: 'orange', color: '#121826', padding: '4px', fontSize: '10px', marginLeft: '10px', fontWeight: 600}}>Task 1</div>
                            <div style={{height: 'auto', width: '170px', borderRadius: '7px', backgroundColor: '#22c55e', color: '#121826', padding: '4px', fontSize: '10px', marginLeft: '25px', fontWeight: 600}}>Task 2</div>
                        </Stack>
                    </Stack>

                    <div onClick={()=> navigateToVault('notes')} style={{height:'140px', width:'260px', backgroundColor:'#222b3e', borderRadius:'12px', borderLeft: '8px solid orange'}} className='card-mp'>
                        <Stack direction='row' p='10px' borderBottom='1px solid white' align='center'>
                            <Heading fontFamily='body' fontSize={20} fontWeight={700}>Notebook</Heading>
                            <Spacer/>
                            <img src={notebookIcon} style={{height: '30px', filter: 'invert(1)'}}/>
                        </Stack>
                        <Text ml={3} mt={1} fontFamily='body' color='gray' fontSize={15} fontWeight={500}>Your secure notebook for all your notes.</Text>
                        <Badge ml={3} mt={3}>label</Badge>
                    </div>

                    {role === "admin" && 
                    <Stack direction='row' onClick={navigateToAdminPage} style={{height:'140px', width:'260px', backgroundColor:'#FFD700', borderRadius:'12px'}} className='card-mp'>
                        <Stack>
                            <Heading color='blackAlpha.800' ml='15px' mt='15px' fontFamily='body' fontSize={20} fontWeight={700}>Block Access</Heading>
                            <Text color='blackAlpha.700' ml='15px' fontFamily='body' fontSize={15} fontWeight={500}>Block access to specific user.</Text>
                            <Spacer/>
                            <Text color='red' ml='15px' mb='15px' fontFamily='body' fontSize={16} fontWeight={600}><NotAllowedIcon mt={-1}/>Blocked</Text>
                        </Stack>
                        <Spacer/>
                        <Stack align='center' borderLeft='2px solid #121826'>
                            <Spacer/>
                            <div style={{borderRadius: '50%', margin: '10px', backgroundColor: '#121212'}}>
                                <ArrowForwardIcon color='white' stroke='AppWorkspace'm={2} h={7} w={7}/>
                            </div>
                        </Stack>
                    </Stack>}
                </div>
            </div>

            {showLogoutPopup && <ConfirmationPopup title='Confirm Logout' confirmAction={logout} confirmButtonName='Logout' confirmMsg='Are you sure you want to logout of the DataVault?' setShowPopup={setShowLogoutPopup}/>}
        </div>
    );
}
