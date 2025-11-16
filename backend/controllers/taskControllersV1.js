const { Expenses } = require("../models/expenseModel");
const { Notes } = require("../models/notesModel");
const { Tasks } = require("../models/taskModel");


// GET - /api/task/v1/:queryIndex
const fetchCurrentTasks = async(req, res) =>{
    try{
        const queryIndex = req.params.queryIndex;
        if(!queryIndex?.length){
            return res.status(400).json({ message : "select valid month" });
        }

        const [year, month] = queryIndex.split('-');
        const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));

        const data = await Tasks.find({
            userId: req.id,
            queryStart: { $lte: monthEnd },
            queryEnd: { $gte: monthStart },
        });

        res.status(200).json(data);
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/task/v1
const addTask = async(req, res) =>{
    try{
        const { taskData, nonce, queryStart, queryEnd } = req.body;
        if(!taskData?.length || !nonce?.length){
            return res.status(400).json({ message : "an error occurred!" });
        }

        const newTask = new Tasks({
            userId : req.id,
            taskData,
            nonce,
            queryStart,
            queryEnd
        });
        await newTask.save();

        res.status(200).json({ message : "task added successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// PUT - /api/task/v1
const updateTask = async(req, res) =>{
    try{
        const { id, taskData, nonce, queryStart, queryEnd, linkedExpenseId, linkedNoteId } = req.body;
        if(!taskData?.length || !nonce?.length){
            return res.status(400).json({ message : "an error occurred!" });
        }

        const updatedTask = await Tasks.findByIdAndUpdate(id, {taskData, nonce, queryStart, queryEnd, linkedExpenseId, linkedNoteId});
        if(!updatedTask){
            return res.status(404).json({ message : "task not found" });
        }

        res.status(200).json({ message : "task updated successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// DELETE - /api/task/v1/:id
const deleteTask = async(req, res) =>{
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({ message : "an error occurred!" });
        }

        const deletedTask = await Tasks.findByIdAndDelete(id);
        if(!deletedTask){
            return res.status(404).json({ message : "task not found" });
        }

        res.status(200).json({ message : "task deleted successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/task/v1/links
const getTaskLinks = async(req, res) =>{
    try{
        const {linkedExpenseId} = req.body;
        var data = {};

        if(linkedExpenseId){
            const linkedExpense = await Expenses.findById(linkedExpenseId);
            if(linkedExpense) data.linkedExpense = linkedExpense;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/task/v1
// const  = async(req, res) =>{
//     try{

//     }
//     catch(error){
//         console.log('Server error', error);
//         res.status(500).json({ message : "something went wrong!" });
//     }
// }


module.exports = {
    fetchCurrentTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskLinks,
}