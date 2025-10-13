const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email : {type : String, required : true, unique : true},
    name : {type : String, required : true},
    password : {type : String, required : true},
    securityPin : {type : String, required : true},
    passKey : {type : String, default : '0'},
    newPassKeyGenerated : {type : Number, default : 0},
    passwordEncryptedKey : {type : String, required : true},
    pinEncryptedKey : {type : String, required : true},
    passwordSalt : {type : String, required : true},
    pinSalt : {type : String, required : true},
    passwordNonce : {type : String, required : true},
    pinNonce : {type : String, required : true},
    isBlocked : {type : Boolean, default : false},
    privilege : {type : String, default : 'user'}
});

const Users = mongoose.model('users', userSchema, 'users');

module.exports = {Users};
