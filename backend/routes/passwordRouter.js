const express = require('express');
const { checkAuthorization } = require('../middlewares/checkAuthorization');
const { fetchPasswords, addPassword, updatePassword, deletePassword, updateLabels } = require('../controllers/passwordControllersV1');

// endpoint prefix : /api/password
const passwordRouter = express.Router();

// ---------- v1 routes ----------

passwordRouter.get('/v1/:index', checkAuthorization, fetchPasswords);
passwordRouter.post('/v1', checkAuthorization, addPassword);
passwordRouter.put('/v1', checkAuthorization, updatePassword);
passwordRouter.delete('/v1/:id', checkAuthorization, deletePassword);

passwordRouter.put('/v1/label', checkAuthorization, updateLabels);

module.exports = {passwordRouter};
