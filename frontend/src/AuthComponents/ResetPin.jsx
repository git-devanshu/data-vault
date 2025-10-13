import React, { useState, useEffect } from 'react'
import './authStyle.css';
import { toast } from 'react-hot-toast';
import { getBaseURL, primaryAPIVersion, getAuthToken } from '../utils/helperFunctions';
import { Button, Text, PinInput, PinInputField, HStack } from '@chakra-ui/react';
import { useNavigate, useLocation } from "react-router-dom";
import { createHash, decryptMasterKey, encryptMasterKey } from '../utils/cipherFunctions';
import axios from 'axios';

export default function ResetPin() {
    const navigate = useNavigate();
    const location = useLocation();

    const [securityPin, setSecurityPin] = useState("");
    const [password, setPassword] = useState("");

    const [passwordEncryptedKey, setPasswordEncryptedKey] = useState("");
    const [passwordSalt, setPasswordSalt] = useState("");
    const [passwordNonce, setPasswordNonce] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [showResetField, setShowResetField] = useState(false); //to show new security pin field

    const getQueryParams = (query) =>{
        return query.substring(1).split('&')
            .reduce((params, param) =>{
                const [key, value] = param.split('=');
                params[key] = value;
                return params;
            }, {});
    };

    // for managing the reset security pin flow using url parameters
    useEffect(()=>{
        const queryParams = getQueryParams(location.search);
        if(queryParams.new_pin === "true"){
            setShowResetField(true);
            setPassword(queryParams.password);
            setPasswordEncryptedKey(queryParams.enc_key);
            setPasswordSalt(queryParams.salt);
            setPasswordNonce(queryParams.nonce);
        }
    }, [navigate, location]);

    const verifyUser = (e) =>{
        e.preventDefault();
        if(!password?.length){
            toast.error("password is required");
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('verifying...');
        setIsLoading(true);

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/verify-user`, {password}, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setTimeout(()=>{
                    navigate(`/reset-pin?new_pin=true&enc_key=${res.data?.passwordEncryptedKey}&salt=${res.data?.passwordSalt}&nonce=${res.data?.passwordNonce}&password=${password}`, {replace: true});
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

    const setNewSecurityPin = async(e) =>{
        e.preventDefault();
        if(!securityPin || securityPin.length !== 6){
            toast.error("enter your new security pin");
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('please wait...');
        setIsLoading(true);

        try{
            const masterKey = await decryptMasterKey(passwordEncryptedKey, password, passwordSalt, passwordNonce);
            const { encryptedMasterKey: pinEncryptedKey, salt: pinSalt, nonce: pinNonce } = await encryptMasterKey(masterKey, securityPin);
            const hashedPin = createHash(securityPin);

            const res = await axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/reset-pin`, {securityPin: hashedPin, pinEncryptedKey, pinSalt, pinNonce}, {headers : {
                Authorization : `Bearer ${token}`
            }});

            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setSecurityPin("");
                setPassword("");
                setPasswordEncryptedKey("");
                setPasswordNonce("");
                setPasswordSalt("");
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
                <h2 className="login-heading">Reset Security Pin</h2>

                {!showResetField ? (
                    <form className="login-form">
                        <label className="login-label">Enter password</label>
                        <input type="password" name='password' value={password} onChange={(e)=> setPassword(e.target.value)} required minLength={8} maxLength={30} className="login-input" />

                        <Button onClick={verifyUser} disabled={isLoading} type="submit" colorScheme="blue">
                            Verify User
                        </Button>
                    </form>
                ) : (
                    <form className="login-form">
                        <h2 style={{fontSize: '16px', fontWeight: 300, textAlign: 'center', marginTop: '0', marginBottom: '10px'}}>Enter your <span style={{color: "orange"}}>new 6-digit security pin</span> below.</h2>
                        <HStack justifyContent='center'>
                            <PinInput type="number" value={securityPin} onChange={(value) => setSecurityPin(value)}>
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                            </PinInput>
                        </HStack>

                        <Button onClick={setNewSecurityPin} disabled={isLoading} type="submit" colorScheme="blue" mt={4}>
                            Reset Security Pin
                        </Button>
                    </form>
                )}

                <Text mt={4} textAlign='center'>Hitting back will exit from this process.</Text>
            </div>
        </div>
    );
}
