const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    passwordData : {type : String, required : true},
    labelIndex : {type : Number, required : true},
    nonce : {type : String, required : true}
});

const Passwords = mongoose.model('passwords', passwordSchema, 'passwords');

module.exports = {Passwords};

/*

passwordData {
    platform,
    username,
    password,
    label
}

This object is stringified and then encrypted on client side

*/