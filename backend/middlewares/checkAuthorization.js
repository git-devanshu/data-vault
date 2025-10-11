require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Users } = require('../models/userModel');

const checkAuthorization = async(req, res, next) =>{
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({ message : 'Access Permissions Denied' });
    }

    try{
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        if(!decoded.id || !decoded.email || !decoded.name){
            return res.status(401).json({ message : 'Access Permissions Denied' });
        }
        req.id = decoded.id;
        req.email = decoded.email;
        req.name = decoded.name;
        req.role = decoded.role;

        const existingUser = await Users.findById(req.id);
        if(existingUser.isBlocked){
            return res.status(401).json({ message : "this account is blocked" });
        }

        next();
    }
    catch(error){
        res.status(401).json({ message : 'Access Permissions Denied' });
    }
}

module.exports = {checkAuthorization};
