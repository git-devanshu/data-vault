const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    labelList : {type : String, default : ""},
    labelNonce : {type : String, default : ""},
    trackerList : {type : String, default : ""},
    trackerNonce : {type : String, default : ""},
    notesList : {type : String, default : ""},
    notesNonce : {type : String, default : ""},
    hideRemovedLabels : {type : Boolean, default : false}, // used in settings
    hideRemovedTrackers : {type : Boolean, default : false}, // used in settings
    hideExpenseDeleteButton : {type : Boolean, default : false}, // used in settings
    hideHighPriorityNotes : {type : Boolean, default : false}, // used in settings
    hideNoteEditButton : {type : Boolean, default : false}, // used in settings
    hideCompletedTasks : {type : Boolean, default : false}, // used in settings
});

const Preferences = mongoose.model('preferences', preferenceSchema, 'preferences');

module.exports = {Preferences};

/*

labelList []

trackerList [{
    trackerName, trackingAmount, isRemoved
}]

notesList [{
    title,
    priority,
    categoryColor,
    tag,
    noteId
}]

These arrays are stringified and then encrypted on client side

*/