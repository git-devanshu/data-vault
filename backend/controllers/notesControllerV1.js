const { Notes } = require("../models/notesModel");
const { Preferences } = require("../models/preferencesModel");


// GET - /api/notes/v1/:noteId
const viewNote = async(req, res) =>{
    try{
        const noteId = req.params.noteId;
        if(!noteId?.length){
            return res.status(400).json({ message : "an error occurred!" });
        }

        const data = await Notes.findOne({noteId, userId: req.id});
        if(!data){
            return res.status(404).json({ message : "note not found" });
        }

        res.status(200).json(data);
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/notes/v1
const addNote = async(req, res) =>{
    try{
        const { noteId, note, nonce, notesList, notesNonce } = req.body;
        if(!noteId?.length || !note?.length || !nonce?.length || !notesList?.length || !notesNonce?.length){
            return res.status(400).json({ message : "an error occurred!" });
        }

        const userPreference = await Preferences.findOne({userId: req.id});
        if(!userPreference){
            return res.status(404).json({ message : "error adding note!" });
        }

        const newNote = new Notes({
            userId: req.id,
            noteId,
            note,
            nonce
        });
        await newNote.save();

        userPreference.notesList = notesList;
        userPreference.notesNonce = notesNonce;
        await userPreference.save();

        res.status(200).json({ message : "note added successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// PUT - /api/notes/v1
const updateNote = async(req, res) =>{
    try{
        const { noteId, note, nonce, notesList, notesNonce } = req.body;
        if(!noteId?.length || !note?.length || !nonce?.length || !notesList?.length || !notesNonce?.length){
            return res.status(400).json({ message : "an error occurred!" });
        }

        const userPreference = await Preferences.findOne({userId: req.id});
        if(!userPreference){
            return res.status(404).json({ message : "error updating note!" });
        }

        const updatedNote = await Notes.findOneAndUpdate({noteId}, {note, nonce});
        if(!updatedNote){
            return res.status(404).json({ message : "note not found" });
        }

        userPreference.notesList = notesList;
        userPreference.notesNonce = notesNonce;
        await userPreference.save();

        res.status(200).json({ message : "note updated successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// PUT - /api/notes/v1/remove
const deleteNote = async(req, res) =>{
    try{
        const { noteId, notesList, notesNonce } = req.body;
        if(!noteId?.length || !notesList?.length || !notesNonce?.length){
            return res.status(400).json({ message : "an error occurred!" });
        }

        const userPreference = await Preferences.findOneAndUpdate({userId: req.id}, {notesList, notesNonce});
        if(!userPreference){
            return res.status(404).json({ message : "error deleting note!" });
        }

        const deletedNote = await Notes.findOneAndDelete({noteId, userId: req.id});
        if(!deletedNote){
            return res.status(404).json({ message : "note not found" });
        }

        res.status(200).json({ message : "note deleted successfully" });
    }
    catch(error){
        console.log('Server error', error);
        res.status(500).json({ message : "something went wrong!" });
    }
}


// POST - /api/auth/v1/register
// const registerUser = async(req, res) =>{
//     try{

//     }
//     catch(error){
//         console.log('Server error', error);
//         res.status(500).json({ message : "something went wrong!" });
//     }
// }


module.exports = {
    viewNote,
    addNote,
    updateNote,
    deleteNote
};