const express = require('express');
const { checkAuthorization } = require('../middlewares/checkAuthorization');
const { addExpense, deleteExpense, fetchExpenes, updateTrackers } = require('../controllers/expenseControllersV1');

// endpoint prefix : /api/expense
const expenseRouter = express.Router();

// ---------- v1 routes ----------

expenseRouter.get('/v1/:index', checkAuthorization, fetchExpenes);
expenseRouter.post('/v1', checkAuthorization, addExpense);
expenseRouter.delete('/v1/:id', checkAuthorization, deleteExpense);

expenseRouter.put('/v1/tracker', checkAuthorization, updateTrackers);

module.exports = {expenseRouter};
