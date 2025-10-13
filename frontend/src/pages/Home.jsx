import React, { useEffect, useState } from 'react'
import './homeStyle.css';
import { HiOutlineLockClosed } from 'react-icons/hi';
import { Avatar, Heading, Text, Menu, MenuButton, MenuList, Button, Stack, Divider, MenuItem, MenuDivider } from '@chakra-ui/react';
import { ArrowForwardIcon, InfoIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaSignOutAlt } from "react-icons/fa";
import { decodeToken, getAuthToken, removeAuthToken } from '../utils/helperFunctions';
import { useNavigate } from 'react-router-dom';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';
import { useAppContext } from '../context/AppContext';

export default function Home() {
    const navigate = useNavigate();
    const name = decodeToken(getAuthToken()).name;
    const role = decodeToken(getAuthToken()).role;

    const { clearMasterKey, setLabels, setTrackers, setNotes } = useAppContext();

    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    useEffect(()=>{
        clearMasterKey();
        setLabels([]);
        setTrackers([]);
        setNotes([]);
    }, []);

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

    return (
        <div className='parent-container'>
            {/* header */}
            <div className='top-header'>
                <div>
                    <HiOutlineLockClosed size={24} color='#2daaff'/>
                    <h1>DataVault</h1>
                </div>
                <Menu>
                    <MenuButton title='profile'>
                        <Avatar size="sm" name={name} />
                    </MenuButton>
                    <MenuList flexDir='column' bg="#1b2232"ccolor='white' minWidth='160px' borderColor='#222b3e' width='50px' alignItems='center'>
                        <Text mx={3} my={1} textAlign='center' color='#2daaff'>{name}</Text>
                        <Divider mt={2} />
                        <MenuItem bg="#1b2232" _hover={{backgroundColor: "#222b3e"}} onClick={navigateToSettings} icon={<SettingsIcon/>}>Settings</MenuItem>
                        <MenuItem bg="#1b2232" _hover={{backgroundColor: "#222b3e"}} onClick={navigateToAbout} icon={<InfoIcon/>}>About</MenuItem>
                        <Divider />
                        <MenuItem bg="#1b2232" _hover={{backgroundColor: "#222b3e"}} onClick={()=> setShowLogoutPopup(true)} icon={<FaSignOutAlt/>}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>

            {/* main section */}
            <div className='main-section'>
                <div>
                    <h1>A Secure Place for your Personal Data</h1>
                </div>
                <HiOutlineLockClosed size='55%' className='side-logo'/>
            </div>

            {/* modules */}
            <div className='module-stack'>
                <div onClick={()=> navigateToVault('password')} style={{height:'110px', width:'250px', backgroundColor:'rgb(254, 187, 64)', borderRadius:'15px', padding: '10px'}} className='card-mp'>
                    <Heading color='blackAlpha.800' mt={4} fontFamily='body' fontSize={20} fontWeight={700}>Passwords <ArrowForwardIcon mt='-5px' h={5} w={5}/></Heading>
                    <Text color='blackAlpha.700' mr={3} fontFamily='body' fontSize={15} fontWeight={500}>Store all your passwords securely.</Text>
                </div>
                <div onClick={()=> navigateToVault('expense')} style={{height:'110px', width:'250px', backgroundColor:'rgb(97, 177, 226)', borderRadius:'15px', padding: '10px'}} className='card-mp'>            
                    <Heading color='blackAlpha.800' mt={4} fontFamily='body' fontSize={20} fontWeight={700}>Expenses <ArrowForwardIcon mt='-5px' h={5} w={5}/></Heading>
                    <Text color='blackAlpha.700' mr={3} fontFamily='body' fontSize={15} fontWeight={500}>Track all your expenses categorically.</Text>
                </div>
                <div onClick={()=> navigateToVault('task')} style={{height:'110px', width:'250px', backgroundColor:'rgba(255, 255, 255, 0.100)', borderRadius:'15px', boxShadow:'0 0 20px 10px rgb(210, 210, 210, 0.200) inset', padding: '10px'}} className='card-mp'>            
                    <Heading color='blackAlpha.800' mt={4} fontFamily='body' fontSize={20} fontWeight={700}>Tasks <ArrowForwardIcon mt='-5px' h={5} w={5}/></Heading>
                    <Text color='blackAlpha.700' mr={3} fontFamily='body' fontSize={15} fontWeight={500}>List all your secret tasks.</Text>
                </div>
                <div onClick={()=> navigateToVault('notes')} style={{height:'110px', width:'250px', backgroundColor:'rgba(255, 255, 255, 0.100)', borderRadius:'15px', boxShadow:'0 0 20px 10px rgb(210, 210, 210, 0.200) inset', padding: '10px'}} className='card-mp'>
                    <Heading color='blackAlpha.800' mt={4} fontFamily='body' fontSize={20} fontWeight={700}>Notebook <ArrowForwardIcon mt='-5px' h={5} w={5}/></Heading>
                    <Text color='blackAlpha.700' mr={3} fontFamily='body' fontSize={15} fontWeight={500}>Keep notes of your data securely.</Text>
                </div>
                {role === "admin" && <div onClick={navigateToAdminPage} style={{height:'110px', width:'250px', backgroundColor:'#FFD700', borderRadius:'15px', boxShadow:'0 0 20px 10px #FFD700 inset', padding: '10px'}} className='card-mp'>
                    <Heading color='blackAlpha.800' mt={4} fontFamily='body' fontSize={20} fontWeight={700}>Block Access <ArrowForwardIcon mt='-5px' h={5} w={5}/></Heading>
                    <Text color='blackAlpha.700' mr={3} fontFamily='body' fontSize={15} fontWeight={500}>Block access to specific user.</Text>
                </div>}
            </div>

            {/* about section */}
            {/* <div className='about-section'>
                <Text color='gray' textAlign='center'>
                    The Vault is a secure data storage that allows you to store your personal data including your 
                    passwords, your daily experiences, general notes and tasks, all protected by a 6 digit pin adding an extra layer of security.
                    The sensitive data is stored on the cloud completely encrypted to ensure privacy.
                </Text>
            </div> */}

            {showLogoutPopup && <ConfirmationPopup title='Confirm Logout' confirmAction={logout} confirmButtonName='Logout' confirmMsg='Are you sure you want to logout of the DataVault?' setShowPopup={setShowLogoutPopup}/>}
        </div>
    );
}
