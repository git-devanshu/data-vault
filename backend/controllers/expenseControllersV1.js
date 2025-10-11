const { Expenses } = require("../models/expenseModel");
const { Preferences } = require('../models/preferencesModel');


// GET - /api/expense/v1/:index
const fetchExpenes = async(req, res) =>{
    try{
        const index = req.params.index;
        if(!index){
            return res.status(400).json({ message : "tracker is missing" });
        }

        const data = await Expenses.find({userId: req.id, trackerIndex: index});

        res.status(200).json(data);
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/expense/v1
const addExpense = async(req, res) =>{
    try{
        const {expenseData, nonce, trackerIndex} = req.body;
        if(!expenseData?.length || !nonce?.length){
            return res.status(400).json({ message : "error adding expense" });
        }

        const newExpense = new Expenses({
            userId : req.id,
            expenseData,
            trackerIndex,
            nonce
        });
        await newExpense.save();

        res.status(200).json({ message : "expense added successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// DELETE - /api/expense/v1/:id
const deleteExpense = async(req, res) =>{
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({ message : "error deleting expense" });
        }

        const deletedExpense = await Expenses.findByIdAndDelete(id);
        if(!deletedExpense){
            return res.status(404).json({ message : "expense not found" });
        }

        res.status(200).json({ message : "expense deleted successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// PUT - /api/expense/v1/tracker
const updateTrackers = async(req, res) =>{
    try{
        const {trackerList, trackerNonce} = req.body;
        if(!trackerList?.length || !trackerNonce?.length){
            return res.status(400).json({ message : "an error occurred" });
        }

        const updatedPreference = await Preferences.findOneAndUpdate({userId : req.id}, {trackerList, trackerNonce});
        if(!updatedPreference){
            return res.status(404).json({ message : "an error occurred" });
        }

        res.status(200).json({ message : "trackers list updated" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/expense/v1/
// const  = async(req, res) =>{
//     try{

//     }
//     catch(error){
//         console.log('Server error', error);
//         res.status(500).json({ message : "something went wrong!" });
//     }
// }


module.exports = {
    addExpense,
    fetchExpenes,
    deleteExpense,
    updateTrackers
};