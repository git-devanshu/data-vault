const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    taskData : {type : String, required : true},
    nonce : {type : String, required : true},
    queryStart : {type : Date, required : true},
    queryEnd : {type : Date, required : true},
});

const Tasks = mongoose.model('tasks', taskSchema, 'tasks');

module.exports = {Tasks};

/*

taskData {
    task,
    startDate,
    endDate,
    status
}

queryIndex is the start month number and start year concatenated together

*/