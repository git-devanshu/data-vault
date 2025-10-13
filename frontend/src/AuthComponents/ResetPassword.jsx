import React, { useState, useEffect } from 'react'
import './authStyle.css';
import { toast } from 'react-hot-toast';
import { getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import { Button, Text, PinInput, PinInputField, HStack, IconButton, Heading } from '@chakra-ui/react';
import { FaPaste } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { createHash, decryptMasterKey, encryptMasterKey } from '../utils/cipherFunctions';
import axios from 'axios';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [passKey, setPassKey] = useState("");
    const [securityPin, setSecurityPin] = useState("");
    const [password, setPassword] = useState("");

    const [pinEncryptedKey, setPinEncryptedKey] = useState("");
    const [pinSalt, setPinSalt] = useState("");
    const [pinNonce, setPinNonce] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [showVerificationField, setShowVerificationField] = useState(false); // to show pin input
    const [showResetField, setShowResetField] = useState(false); // to show new password field
    const [showNotePopup, setShowNotePopup] = useState(false); // to show the  notice popup

    const getQueryParams = (query) =>{
        return query.substring(1).split('&')
            .reduce((params, param) =>{
                const [key, value] = param.split('=');
                params[key] = value;
                return params;
            }, {});
    };

    // for managing the reset password flow using url parameters
    useEffect(()=>{
        const queryParams = getQueryParams(location.search);
        if(queryParams.key === "true"){
            setShowVerificationField(true);
            setEmail(queryParams.email);
        }
        else if(queryParams.new_password === "true"){
            setPassKey("");
            setShowVerificationField(true);
            setShowResetField(true);
            setEmail(queryParams.email);
            setPinEncryptedKey(queryParams.enc_key);
            setPinSalt(queryParams.salt);
            setPinNonce(queryParams.nonce);
        }
    }, [navigate, location]);

    const verifyEmail = (e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
        if(!email?.length){
            toast.error("email is required");
            return;
        }

        const toastId = toast.loading('verifying email...');
        setIsLoading(true);

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/check-email-exists`, {email})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setTimeout(()=>{
                    navigate(`/reset-password?key=${res.data?.isAvailable}&email=${email}`, {replace: true});
                }, 300);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        });
    }

    const verifyPassKey = (e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
        if(!passKey?.length){
            toast.error("enter recovery key properly");
            return;
        }

        const toastId = toast.loading('verifying recovery key...');
        setIsLoading(true);

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/verify-passkey`, {email, passKey})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setTimeout(()=>{
                    navigate(`/reset-password?new_password=true&email=${email}&enc_key=${res.data?.pinEncryptedKey}&salt=${res.data?.pinSalt}&nonce=${res.data?.pinNonce}`, {replace: true});
                }, 300);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        });
    }

    const setNewPassword = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
        if(!password?.length || !securityPin || securityPin.length !== 6){
            toast.error("all fields are required");
            return;
        }

        const toastId = toast.loading('please wait...');
        setIsLoading(true);

        try{
            const masterKey = await decryptMasterKey(pinEncryptedKey, securityPin, pinSalt, pinNonce);
            const { encryptedMasterKey: passwordEncryptedKey, salt: passwordSalt, nonce: passwordNonce } = await encryptMasterKey(masterKey, password);
            const hadhedPassword = createHash(password);

            const res = await axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/reset-password`, {email, password: hadhedPassword, passwordEncryptedKey, passwordSalt, passwordNonce});

            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setSecurityPin("");
                setPassword("");
                setPinEncryptedKey("");
                setPinNonce("");
                setPinNonce("");
                setShowNotePopup(true);
            }
            setIsLoading(false);
        }
        catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        }
    }

    const navigateToLogin = () =>{
        navigate('/login', {replace: true});
    }

    const pasteFromClipboard = async() => {
        try{
            const text = await navigator.clipboard.readText();
            setPassKey(text);
        }
        catch(err){
            console.error("failed to read clipboard contents: ", err);
            toast.error('failed to paste the text');
        }
    };
    

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="app-title">DataVault</h1>
                <h2 className="login-heading">Reset Password</h2>

                {!showVerificationField ? (
                    <form className="login-form">
                        <label className="login-label">Enter your email</label>
                        <input type="email" name='email' value={email} onChange={(e)=> setEmail(e.target.value)} required className="login-input" />

                        <Button onClick={verifyEmail} disabled={isLoading} type="submit" colorScheme="blue">
                            Verify Email
                        </Button>
                    </form>
                ) : !showResetField ? (
                    <form className="login-form">
                        <h2 style={{fontSize: '16px', fontWeight: 300, textAlign: 'center', marginTop: '0', marginBottom: '10px'}}>Enter your latest <span style={{color: "orange"}}>recovery key</span> correctly in the field below.</h2>

                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
                            <input type="text" name='passKey' value={passKey} onChange={(e)=> setPassKey(e.target.value)} required minLength={64} maxLength={64} className="login-input" style={{width: '100%', margin: '0'}} />
                            <IconButton onClick={pasteFromClipboard} title='paste' width='fit-content' fontSize='20px' icon={<FaPaste />} backgroundColor='transparent' color='gray' _hover={{backgroundColor: 'transparent', color: 'white'}}/>
                        </div>

                        <Button onClick={verifyPassKey} disabled={isLoading} type="submit" colorScheme="blue" mt={4}>
                            Verify Recovery Key
                        </Button>
                    </form>
                ) : (
                    <form className="login-form">
                        <h2 style={{fontSize: '16px', fontWeight: 300, textAlign: 'center', marginTop: '0', marginBottom: '10px'}}>Enter your 6-digit <span style={{color: "orange"}}>security pin</span> to reset your password.</h2>
                        <HStack justifyContent='center' mb={4}>
                            <PinInput type="number" value={securityPin} onChange={(value) => setSecurityPin(value)}>
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                            </PinInput>
                        </HStack>

                        <label className="login-label">Enter new password</label>
                        <input type="password" name='password' value={password} onChange={(e)=> setPassword(e.target.value)} required minLength={8} maxLength={30} className="login-input" />

                        <Button onClick={setNewPassword} disabled={isLoading} type="submit" colorScheme="blue">
                            Reset Password
                        </Button>
                    </form>
                )}

                <Text mt={4} textAlign='center'>Hitting back will exit from this process.</Text>
            </div>

            {showNotePopup && <div className='popup-container'>
                <Heading color='red.400' textAlign='center' size='md' mb={4}>IMPORTANT !</Heading>

                <Text color='gray.300' textAlign='center'>
                    For better security of your account, it is advised to generate new recovery key after password reset.
                    You can generate new recovery key from settings of your account.
                </Text>

                <Button width='full' onClick={navigateToLogin} colorScheme='blue' mt={5}>Okay</Button>
            </div>}
        </div>
    );
}
