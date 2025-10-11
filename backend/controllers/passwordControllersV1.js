const { Passwords } = require('../models/passwordModel');
const { Preferences } = require('../models/preferencesModel');


// GET - /api/password/v1/:index
const fetchPasswords = async(req, res) =>{
    try{
        const index = req.params.index;
        if(!index){
            return res.status(400).json({ message : "label is missing" });
        }

        const data = await Passwords.find({userId: req.id, labelIndex: index});

        res.status(200).json(data);
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/password/v1
const addPassword = async(req, res) =>{
    try{
        const {passwordData, nonce, labelIndex} = req.body;
        if(!passwordData?.length || !nonce?.length){
            return res.status(400).json({ message : "error adding password" });
        }

        const newPassword = new Passwords({
            userId : req.id,
            passwordData,
            labelIndex,
            nonce
        });
        await newPassword.save();

        res.status(200).json({ message : "password added successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// PUT - /api/password/v1
const updatePassword = async(req, res) =>{
    try{
        const {id, passwordData, nonce, labelIndex} = req.body;
        if(!id || !passwordData?.length || !nonce?.length){
            return res.status(400).json({ message : "error updating password" });
        }

        const updatedPassword = await Passwords.findByIdAndUpdate(id, {passwordData, nonce, labelIndex});
        if(!updatedPassword){
            return res.status(404).json({ message : "password not found" });
        }

        res.status(200).json({ message : "password updated successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// DELETE - /api/password/v1/:id
const deletePassword = async(req, res) =>{
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({ message : "error deleting password" });
        }

        const deletedPassword = await Passwords.findByIdAndDelete(id);
        if(!deletedPassword){
            return res.status(404).json({ message : "password not found" });
        }

        res.status(200).json({ message : "password deleted successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// PUT - /api/password/v1/label
const updateLabels = async(req, res) =>{
    try{
        const {labelList, labelNonce} = req.body;
        if(!labelList?.length || !labelNonce?.length){
            return res.status(400).json({ message : "an error occurred" });
        }

        const updatedPreference = await Preferences.findOneAndUpdate({userId : req.id}, {labelList, labelNonce});
        if(!updatedPreference){
            return res.status(404).json({ message : "an error occurred" });
        }

        res.status(200).json({ message : "labels list updated" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


module.exports = {
    fetchPasswords,
    addPassword,
    updatePassword,
    deletePassword,
    updateLabels
};