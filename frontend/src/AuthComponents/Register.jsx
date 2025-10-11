import React, { useState } from "react";
import "./authStyle.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { HStack, PinInput, PinInputField, Button } from "@chakra-ui/react";
import { toast } from 'react-hot-toast';
import { getBaseURL, primaryAPIVersion } from '../utils/helperFunctions';
import { encryptMasterKey, createHash, createMasterKey, encryptData } from '../utils/cipherFunctions';

export default function Register() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        email : '',
        name : '',
        password : '',
        securityPin : '',
    });

    const [isEmailAvailable, setIsUserAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setUser({
            ...user,
            [name] : value
        });
    }

    const checkEmailAvailability = (e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Checking email availability...');

        axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/check-email`, {email: user.email})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data.message, {id : toastId});
                setIsUserAvailable(res.data.isAvailable);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response.data.message, {id : toastId});
            setIsLoading(false);
        });
    }

    const registerUser = async(e) =>{
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Creating new user...');

        try{
            const hashedPassword = createHash(user.password);
            const hashedPin = createHash(user.securityPin);

            const masterKey = createMasterKey();
            const { encryptedMasterKey: passwordEncryptedKey, salt: passwordSalt, nonce: passwordNonce } = await encryptMasterKey(masterKey, user.password);
            const { encryptedMasterKey: pinEncryptedKey, salt: pinSalt, nonce: pinNonce } = await encryptMasterKey(masterKey, user.securityPin);

            const initialLabels = ["Other"];
            const { encryptedData: labelList, nonce: labelNonce } = await encryptData(JSON.stringify(initialLabels), masterKey);

            const initialTrackers = [{
                trackerName: "Other", 
                trackingAmount: 0, 
                isRemoved: false
            }];
            const { encryptedData: trackerList, nonce: trackerNonce } = await encryptData(JSON.stringify(initialTrackers), masterKey);

            const emptyNotesList = [];
            const { encryptedData: notesList, nonce: notesNonce } = await encryptData(JSON.stringify(emptyNotesList), masterKey);

            const apiData = {
                email: user.email,
                name: user.name,
                password: hashedPassword,
                securityPin: hashedPin,
                passwordEncryptedKey,
                pinEncryptedKey,
                passwordSalt,
                pinSalt,
                passwordNonce,
                pinNonce,
                labelList,
                labelNonce,
                trackerList,
                trackerNonce,
                notesList,
                notesNonce
            }

            const res = await axios.post(getBaseURL() + `/api/auth/${primaryAPIVersion()}/register`, apiData);
            if(res.status === 201){
                toast.success(res.data.message, {id : toastId});
                setTimeout(() =>{
                    navigate('/login');
                }, 1500);
                setIsLoading(false);
            }            
        }
        catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || "Registration failed", {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="app-title">DataVault</h1>
                {!isEmailAvailable && (
                    <form className="login-form">
                        <h2 className="login-heading">Register</h2>

                        <label className="login-label">Email</label>
                        <input type="email" name='email' value={user.email} onChange={handleChange} required className="login-input" />
                        <h2 style={{fontSize: '16px', fontWeight: 300, textAlign: 'center', marginTop: '0', marginBottom: '15px'}}>If the email address is already used, try another.</h2>

                        <Button disabled={isLoading} onClick={checkEmailAvailability} colorScheme="blue">
                            Next
                        </Button>
                    </form>
                )}
                {isEmailAvailable && (
                    <form className="login-form">
                        <h2 className="login-heading">Register</h2>

                        <label className="login-label">Email</label>
                        <input type="email" name='email' value={user.email} readOnly className="login-input" />

                        <label className="login-label">Name</label>
                        <input type="text" name='name' value={user.name} onChange={handleChange} required className="login-input" />
                        
                        <label className="login-label">Password</label>
                        <input type="password" name='password' value={user.password} onChange={handleChange} required minLength={8} maxLength={30} className="login-input" />
                        
                        <label className="login-label">Security Pin</label>
                        <div style={{display: 'grid', placeItems: 'center', marginTop: '10px', marginBottom: '10px'}}>
                            <HStack>
                                <PinInput type="number" value={user.securityPin} onChange={(value) => setUser({...user, securityPin : value})}>
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                </PinInput>
                            </HStack>
                        </div>
                        <h2 style={{fontSize: '16px', fontWeight: 300, textAlign: 'center', marginTop: '0'}}>This pin is required to access all your data.</h2>

                        <Button disabled={isLoading} type="submit" onClick={registerUser} colorScheme="blue" mt={3}>
                            Register
                        </Button>
                    </form>
                )}
                <p className="signup-text">
                    Already registered? <a href="/login" className="signup-link">Login</a>
                </p>
            </div>
        </div>
    );
}
