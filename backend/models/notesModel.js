const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    note : {type : String, required : true},
    nonce : {type : String, required : true},
    noteId : {type : String, required : true}, // crypto.randomUUID();
});

const Notes = mongoose.model('notes', notesSchema, 'notes');

module.exports = {Notes};

/*

the _id of notes is not being used anywhere, the noteId is used for everything

*/