const express = require('express');
const { checkAuthorization } = require('../middlewares/checkAuthorization');
const { addNote, updateNote, deleteNote, viewNote } = require('../controllers/notesControllerV1');

// endpoint prefix : /api/notes
const notesRouter = express.Router();

// ---------- v1 routes ----------

notesRouter.get('/v1/:noteId', checkAuthorization, viewNote);
notesRouter.post('/v1', checkAuthorization, addNote);
notesRouter.put('/v1', checkAuthorization, updateNote);
notesRouter.put('/v1/remove', checkAuthorization, deleteNote);

module.exports = {notesRouter};
