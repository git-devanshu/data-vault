import React from 'react'
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { getAuthToken, decodeToken } from './utils/helperFunctions';
import { AppContextProvider } from './context/AppContext';

// import components
import NotFound from './pages/NotFound';
import Register from './AuthComponents/Register';
import Login from './AuthComponents/Login';

import Home from './pages/Home';
import AccessControlPage from './pages/AccessControlPage';
import PasswordVault from './VaultComponents/PasswordVault';
import Settings from './pages/Settings';
import ResetPassword from './AuthComponents/ResetPassword';
import ResetPin from './AuthComponents/ResetPin';
import ExpenseVault from './VaultComponents/ExpenseVault';
import NotesVault from './VaultComponents/NotesVault';
import TaskVault from './VaultComponents/TaskVault';
import About from './pages/About';

export default function App() {
    return (
        <ChakraProvider>
        <AppContextProvider>
            
            <BrowserRouter>
                <Routes>
                    {/* Authentication Routes */}
                    <Route path='/register' element={<CheckRegister />} />
                    <Route path='/login' element={<CheckLogin />} />
                    <Route path='/reset-password' element={<ResetPassword />} />
                    <Route path='/reset-pin' element={<ProtectedComponent component={<ResetPin />} />} />
                    {/* <Route path='/' element={</>} /> */}

                    {/* Main Routes */}
                    <Route path='/' element={<ProtectedComponent component={<Home />} />} />
                    <Route path='/vault/password' element={<ProtectedComponent component={<PasswordVault />} />} />
                    <Route path='/vault/notes' element={<ProtectedComponent component={<NotesVault />} />} />
                    <Route path='/vault/expense' element={<ProtectedComponent component={<ExpenseVault />} />} />
                    <Route path='/vault/task' element={<ProtectedComponent component={<TaskVault />} />} />
                    <Route path='/access-control' element={<ProtectedAdminComponent component={<AccessControlPage />} />} />
                    <Route path='/settings' element={<ProtectedComponent component={<Settings />} />} />
                    <Route path='/about' element={<ProtectedComponent component={<About />} />} />
                    {/* <Route path='/' element={</>} /> */}

                    {/* Fallback Route */}
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </BrowserRouter> 

            <Toaster
                position='top-right'
                toastOptions={{
                    style: {background: "linear-gradient(to left, #454545, #1a202f)", color: "white", fontSize: "15px", height: '55px', width: '400px', borderRadius: '2px', borderLeft: '5px solid #666'},
                    success: {style: { borderLeft: "5px solid #22c55e" }},
                    error: {style: { borderLeft: "5px solid #ef4444" }},
                    loading : {style: {borderLeft: "5px solid #d1d5db"}}
                }}
            />

        </AppContextProvider>
        </ChakraProvider>
    )
}


const CheckRegister = () =>{
    const decodedToken = decodeToken(getAuthToken());
    if(decodedToken && decodedToken.id){
        return <Navigate to='/' />
    }
    else{
        return <Register/>
    }
}

const CheckLogin = () =>{
    const decodedToken = decodeToken(getAuthToken());
    if(decodedToken && decodedToken.id){
        return <Navigate to='/' />
    }
    else{
        return <Login/>
    }
}

const ProtectedComponent = ({component}) =>{
    const decodedToken = decodeToken(getAuthToken());
    if(decodedToken && decodedToken.id){
        return component;
    }
    else{
        return <Navigate to='/login' />
    }
}

const ProtectedAdminComponent = ({component}) =>{
    const decodedToken = decodeToken(getAuthToken());
    if(decodedToken && decodedToken.id && decodedToken.role === "admin"){
        return component;
    }
    else{
        return <Navigate to='/login' />
    }
}
