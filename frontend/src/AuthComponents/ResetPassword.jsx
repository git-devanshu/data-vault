import React, { useState, useEffect } from 'react'
import './authStyle.css';
import { toast } from 'react-hot-toast';
import { getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import { Button, Text, PinInput, PinInputField, HStack } from '@chakra-ui/react';
import { useNavigate, useLocation } from "react-router-dom";
import { createHash, decryptMasterKey, encryptMasterKey } from '../utils/cipherFunctions';
import axios from 'axios';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [vfcode, setVfcode] = useState("");
    const [securityPin, setSecurityPin] = useState("");
    const [password, setPassword] = useState("");

    const [pinEncryptedKey, setPinEncryptedKey] = useState("");
    const [pinSalt, setPinSalt] = useState("");
    const [pinNonce, setPinNonce] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [showVerificationField, setShowVerificationField] = useState(false); //to show pin input
    const [showResetField, setShowResetField] = useState(false); //to show new password field

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
        if(queryParams.code === "true"){
            setShowVerificationField(true);
            setEmail(queryParams.email);
        }
        else if(queryParams.new_password === "true"){
            setVfcode("");
            setShowVerificationField(true);
            setShowResetField(true);
            setEmail(queryParams.email);
            setPinEncryptedKey(queryParams.enc_key);
            setPinSalt(queryParams.salt);
            setPinNonce(queryParams.nonce);
        }
    }, [navigate, location]);

    const getVfCode = (e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
        if(!email?.length){
            toast.error("email is required");
            return;
        }

        const toastId = toast.loading('verifying user...');
        setIsLoading(true);

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/send-vfcode`, {email})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setTimeout(()=>{
                    navigate(`/reset-password?code=true&email=${email}`, {replace: true});
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

    const verifyVfCode = (e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
        if(!vfcode || vfcode.length !== 6){
            toast.error("enter verification code");
            return;
        }

        const toastId = toast.loading('verifying code...');
        setIsLoading(true);

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/verify-vfcode`, {email, vfcode})
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
                setTimeout(()=>{
                    navigate(`/login`, {replace: true});
                }, 300);
            }
            setIsLoading(false);
        }
        catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="app-title">DataVault</h1>
                <h2 className="login-heading">Reset Password</h2>

                {!showVerificationField ? (
                    <form className="login-form">
                        <label className="login-label">Enter your email</label>
                        <input type="email" name='email' value={email} onChange={(e)=> setEmail(e.target.value)} required className="login-input" />

                        <Button onClick={getVfCode} disabled={isLoading} type="submit" colorScheme="blue">
                            Get Verification Code
                        </Button>
                    </form>
                ) : !showResetField ? (
                    <form className="login-form">
                        <h2 style={{fontSize: '16px', fontWeight: 300, textAlign: 'center', marginTop: '0', marginBottom: '10px'}}>Enter the 6-digit <span style={{color: "orange"}}>verification code</span> sent on your registered email id.</h2>
                        <HStack justifyContent='center'>
                            <PinInput type="number" value={vfcode} onChange={(value) => setVfcode(value)}>
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                            </PinInput>
                        </HStack>

                        <Button onClick={verifyVfCode} disabled={isLoading} type="submit" colorScheme="blue" mt={4}>
                            Verify
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
        </div>
    );
}
