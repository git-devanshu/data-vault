import React, { useEffect, useState } from 'react'
import './homeStyle.css';
import { Avatar, Heading, Text, Menu, MenuButton, MenuList, Divider, MenuItem, Stack, Spacer, Button, ButtonGroup, Badge } from '@chakra-ui/react';
import { ArrowForwardIcon, InfoIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaSignOutAlt } from "react-icons/fa";
import { decodeToken, getAuthToken, removeAuthToken } from '../utils/helperFunctions';
import { useNavigate } from 'react-router-dom';
import ConfirmationPopup from '../CommonComponents/ConfirmationPopup';
import { useAppContext } from '../context/AppContext';
import Favicon from '../../public/favicon.svg'
import passwordIcon from '../../public/password.png'
import taskIcon from '../../public/tasks.png'
import expenseIcon from '../../public/expense.png'
import notebookIcon from '../../public/notebook.png'

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
                <div className='logo-outline'>
                    <img src={Favicon} className='side-logo'/>
                </div>


                <div className='module-stack'>
                    <Stack onClick={()=> navigateToVault('password')} style={{height:'140px', width:'260px', backgroundColor:'rgb(254, 187, 64)', borderRadius:'12px'}} className='card-mp'>
                        <Stack direction='row' p='15px' align='center'>
                            <img src={passwordIcon} style={{height: '40px'}}/>
                            <Spacer/>
                            <Heading color='blackAlpha.800' fontFamily='body' fontSize={20} fontWeight={700}>Password Vault</Heading>
                        </Stack>
                        <Spacer/>
                        <div style={{height: '40px', width: '100%', backgroundColor: 'orange', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', paddingLeft: '15px', color: '#232323', fontWeight: 600, display: 'grid', justifyContent: 'left', alignItems: 'center'}}>
                            <Text color='blackAlpha.800' fontSize={18} fontWeight={600}>Browse Labels <ArrowForwardIcon mt='-5px' h={5} w={5}/></Text>
                        </div>
                    </Stack>

                    <Stack onClick={()=> navigateToVault('expense')} style={{height:'140px', width:'260px', backgroundColor:'#2daaff', borderRadius:'12px'}} className='card-mp'>
                        <Stack direction='row' p='15px' align='center'>
                            <img src={expenseIcon} style={{height: '35px'}}/>
                        </Stack>
                        <Text ml='15px' mt={-3} fontSize={20} fontFamily='serif' color='black'>**** **** **** ****</Text>
                        <Spacer/>
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
                            <div style={{height: 'auto', width: '100px', borderRadius: '7px', backgroundColor: 'orange', color: '#121826', padding: '4px', fontSize: '10px', marginLeft: '10px'}}>Task 1</div>
                            <div style={{height: 'auto', width: '170px', borderRadius: '7px', backgroundColor: '#22c55e', color: '#121826', padding: '4px', fontSize: '10px', marginLeft: '25px'}}>Task 2</div>
                        </Stack>
                    </Stack>

                    <div onClick={()=> navigateToVault('notes')} style={{height:'140px', width:'260px', backgroundColor:'#222b3e', borderRadius:'12px', borderLeft: '8px solid orange'}} className='card-mp'>
                        <Stack direction='row' p='10px' borderBottom='1px solid white' align='center'>
                            <Heading fontFamily='body' fontSize={20} fontWeight={700}>Notebook</Heading>
                            <Spacer/>
                            <img src={notebookIcon} style={{height: '30px', filter: 'invert(1)'}}/>
                        </Stack>
                        <Text color='blackAlpha.700' ml={3} mt={1} fontFamily='body' color='gray' fontSize={15} fontWeight={500}>Store your notes securely at one place.</Text>
                        <Badge ml={3} mt={3}>label</Badge>
                    </div>

                    {role === "admin" && <div onClick={navigateToAdminPage} style={{height:'140px', width:'260px', backgroundColor:'#FFD700', borderRadius:'12px', boxShadow:'0 0 20px 10px #FFD700 inset', padding: '15px'}} className='card-mp'>
                        <Heading color='blackAlpha.800' mt={4} fontFamily='body' fontSize={20} fontWeight={700}>Block Access <ArrowForwardIcon mt='-5px' h={5} w={5}/></Heading>
                        <Text color='blackAlpha.700' mr={3} fontFamily='body' fontSize={15} fontWeight={500}>Block access to specific user.</Text>
                    </div>}
                </div>
            </div>

            {showLogoutPopup && <ConfirmationPopup title='Confirm Logout' confirmAction={logout} confirmButtonName='Logout' confirmMsg='Are you sure you want to logout of the DataVault?' setShowPopup={setShowLogoutPopup}/>}
        </div>
    );
}
