const { Users } = require("../models/userModel");

// GET - /api/admin/v1/users
const getAllUsers = async(req, res) =>{
    try{
        const data = await Users.find({privilege: "user"}).select("email name isBlocked newPassKeyGenerated"); // _id is included by default
        res.status(200).json(data);
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/admin/v1/block-user
const blockUserAccess = async(req, res) =>{
    try{
        const { id } = req.body;

        const existingUser = await Users.findById(id);
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }
        if(existingUser.isBlocked){
            return res.status(400).json({ message : "user is already blocked" });
        }

        existingUser.isBlocked = true;
        await existingUser.save();
        res.status(200).json({ message : "user access blocked" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/admin/v1/unblock-user
const unblockUserAccess = async(req, res) =>{
    try{
        const { id } = req.body;

        const existingUser = await Users.findById(id);
        if(!existingUser){
            return res.status(404).json({ message : "user not found" });
        }
        if(!existingUser.isBlocked){
            return res.status(400).json({ message : "user is not blocked" });
        }

        existingUser.isBlocked = false;
        await existingUser.save();
        res.status(200).json({ message : "user unblocked" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


module.exports = {
    getAllUsers,
    blockUserAccess,
    unblockUserAccess
};