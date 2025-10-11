const { Users } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendSignupMail, sendVFCodeMail, sendIssueReportEmail } = require('../utils/sendEmail');
const { generateVerificationCode } = require('../utils/helperFunctions');
const { Preferences } = require('../models/preferencesModel');

require('dotenv').config();


// POST - /api/auth/v1/check-email
const checkEmailAvailability = async(req, res) =>{
    try{
        const {email} = req.body;
        if(!email?.length){
            return res.status(400).json({ message : "email is required" });
        }

        const existingUser = await Users.findOne({email});
        if(existingUser){
            return res.status(400).json({ message : "email already exists" });
        }

        res.status(200).json({ message : "email available", isAvailable : true });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/auth/v1/register
const registerUser = async(req, res) =>{
    try{
        const { email, name, password, securityPin, passwordEncryptedKey, pinEncryptedKey, passwordSalt, pinSalt, passwordNonce, pinNonce, labelList, labelNonce, trackerList, trackerNonce, notesList, notesNonce } = req.body;

        if(!email?.length || !name?.length || !password?.length || !securityPin?.length || !passwordEncryptedKey?.length || !pinEncryptedKey?.length || !passwordSalt?.length || !pinSalt?.length || !passwordNonce?.length || !pinNonce?.length || !labelList?.length || !labelNonce?.length || !trackerList?.length || !trackerNonce?.length || !notesList?.length || !notesNonce?.length){
            return res.status(400).json({ message : "all fields required" });
        }

        const existingUser = await Users.findOne({email});
        if(existingUser){
            return res.status(400).json({ message : "email already exists" });
        }

        const newUser = await Users.create({
            email, 
            name, 
            password, 
            securityPin, 
            passwordEncryptedKey, 
            pinEncryptedKey, 
            passwordSalt, 
            pinSalt, 
            passwordNonce, 
            pinNonce
        });
        
        const newPreference = new Preferences({
            userId : newUser._id,
            labelList,
            labelNonce,
            trackerList,
            trackerNonce,
            notesList,
            notesNonce
        });
        await newPreference.save();

        sendSignupMail(email, name);
        
        res.status(201).json({ message : "user registered successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/auth/v1/login
const loginUser = async(req, res) =>{
    try{
        const { email, password } = req.body;
        if(!email?.length || !password?.length){
            return res.status(400).json({ message : "all fields are required" });
        }

        const existingUser = await Users.findOne({email});
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        if(existingUser.isBlocked){
            return res.status(401).json({ message : "this account is blocked" });
        }

        const isMatch = await bcrypt.compareSync(password, existingUser.password);
        if(!isMatch){
            return res.status(400).json({ message : "invalid password" });
        }

        const token = jwt.sign({id : existingUser._id, email : existingUser.email, name : existingUser.name, role : existingUser.privilege}, process.env.JWT_SECRET);
        res.status(200).json({ message : "login successful", token });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/auth/v1/verify-pin
const verifyPin = async(req, res) =>{
    try{
        const { securityPin } = req.body;
        if(!req.email?.length || !securityPin?.length){
            return res.status(400).json({ message : "all fields are required" });
        }

        const existingUser = await Users.findOne({email: req.email});
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        const isMatch = await bcrypt.compareSync(securityPin, existingUser.securityPin);
        if(!isMatch){
            return res.status(400).json({ message : "invalid security pin" });
        }

        const pinEncryptedKey = existingUser.pinEncryptedKey;
        const pinSalt = existingUser.pinSalt;
        const pinNonce = existingUser.pinNonce;

        const userPreferences = await Preferences.findOne({userId : req.id});
        if(!userPreferences){
            return res.status(404).json({ message : "an error occurred" });
        }

        res.status(200).json({ message : "security pin verified", pinEncryptedKey, pinSalt, pinNonce, userPreferences });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/auth/v1/settings
const saveSettings = async(req, res) =>{
    try{
        const { password, hideRemovedLabels, hideRemovedTrackers, hideHighPriorityNotes, hideNoteEditButton, hideCompletedTasks, hideExpenseDeleteButton } = req.body;
        if(!password?.length){
            return res.status(400).json({ message : "password is required to save changes" });
        }

        const existingUser = await Users.findById(req.id);
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        const isMatch = await bcrypt.compareSync(password, existingUser.password);
        if(!isMatch){
            return res.status(400).json({ message : "invalid password" });
        }

        // add other things if required to scale
        const userPreferences = await Preferences.findOneAndUpdate({userId: req.id}, { hideRemovedLabels, hideRemovedTrackers, hideHighPriorityNotes, hideNoteEditButton, hideCompletedTasks, hideExpenseDeleteButton });
        if(!userPreferences){
            return res.status(404).json({ message : "an error occurred" });
        }

        res.status(200).json({ message: "settings saved" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// GET - /api/auth/v1/settings
const fetchUserSettings = async(req, res) =>{
    try{
        const userPreferences = await Preferences.findOne({userId: req.id});
        if(!userPreferences){
            return res.status(404).json({ message : "an error occurred" });
        }

        const hideRemovedLabels = userPreferences.hideRemovedLabels;
        const hideRemovedTrackers = userPreferences.hideRemovedTrackers;
        const hideHighPriorityNotes = userPreferences.hideHighPriorityNotes;
        const hideNoteEditButton = userPreferences.hideNoteEditButton;
        const hideCompletedTasks = userPreferences.hideCompletedTasks;
        const hideExpenseDeleteButton = userPreferences.hideExpenseDeleteButton;
        // send other settings related preferences

        res.status(200).json({ hideRemovedLabels, hideRemovedTrackers, hideHighPriorityNotes, hideNoteEditButton, hideCompletedTasks, hideExpenseDeleteButton });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}

// POST - /api/auth/v1/send-vfcode
const sendVfCode = async(req, res) =>{
    try{
        const { email } = req.body;
        if(!email?.length){
            return res.status(400).json({ message : "email is required" });
        }

        const existingUser = await Users.findOne({email});
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        const vfcode = generateVerificationCode(6);
        existingUser.vfcode = vfcode;
        await existingUser.save();

        sendVFCodeMail(email, vfcode);
        res.status(200).json({ message : "verification code sent on email" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}

// POST - /api/auth/v1/verify-vfcode
const verifyVfCode = async(req, res) =>{
    try{
        const { email, vfcode } = req.body;
        if(!email?.length || !vfcode?.length){
            return res.status(400).json({ message : "all fields are required" });
        }

        const existingUser = await Users.findOne({email});
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        if(vfcode !== existingUser.vfcode && existingUser.vfcode !== "0"){
            return res.status(400).json({ message : "verification failed!" });
        }

        const pinEncryptedKey = existingUser.pinEncryptedKey;
        const pinSalt = existingUser.pinSalt;
        const pinNonce = existingUser.pinNonce;

        res.status(200).json({ message : "verification successful", pinEncryptedKey, pinSalt, pinNonce });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}

// POST - /api/auth/v1/reset-password
const resetPassword = async(req, res) =>{
    try{
        const { email, password, passwordEncryptedKey, passwordSalt, passwordNonce } = req.body;
        if(!email?.length || !password?.length || !passwordEncryptedKey?.length || !passwordSalt?.length || !passwordNonce?.length){
            return res.status(400).json({ message : "all fields are required" });
        }

        const existingUser = await Users.findOneAndUpdate({email}, {password, passwordEncryptedKey, passwordSalt, passwordNonce, vfcode: "0"});
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        res.status(200).json({ message : "password changed successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}

// POST - /api/auth/v1/verify-user
const verifyUser = async(req, res) =>{
    try{
        const { password } = req.body;
        if(!password?.length){
            return res.status(400).json({ message : "password is required" });
        }

        const existingUser = await Users.findById(req.id);
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        const isMatch = await bcrypt.compareSync(password, existingUser.password);
        if(!isMatch){
            return res.status(400).json({ message : "invalid password" });
        }

        const passwordEncryptedKey = existingUser.passwordEncryptedKey;
        const passwordSalt = existingUser.passwordSalt;
        const passwordNonce = existingUser.passwordNonce;

        res.status(200).json({ message : "verification successful", passwordEncryptedKey, passwordSalt, passwordNonce });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/auth/v1/reset-pin
const resetSecurityPin = async(req, res) =>{
    try{
        const { securityPin, pinEncryptedKey, pinSalt, pinNonce } = req.body;
        if(!securityPin?.length || !pinEncryptedKey?.length || !pinSalt?.length || !pinNonce?.length){
            return res.status(400).json({ message : "all fields are required" });
        }

        const existingUser = await Users.findByIdAndUpdate(req.id, {securityPin, pinEncryptedKey, pinSalt, pinNonce});
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }

        res.status(200).json({ message : "security pin changed successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/auth/v1/issue
const reportIssue = async(req, res) =>{
    try{
        const { title, description } = req.body;
        if(!title?.length || !description?.length){
            return res.status(400).json({ message : "all fields are required" });
        }

        sendIssueReportEmail(req.email, req.name, title, description);
        res.status(200).json({ message : "issue has be reported" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


module.exports = {
    checkEmailAvailability,
    registerUser,
    loginUser,
    verifyPin,
    fetchUserSettings,
    saveSettings,
    sendVfCode,
    verifyVfCode,
    resetPassword,
    verifyUser,
    resetSecurityPin,
    reportIssue,
}