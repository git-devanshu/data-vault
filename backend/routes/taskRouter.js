const express = require('express');
const { checkAuthorization } = require('../middlewares/checkAuthorization');
const { fetchCurrentTasks, addTask, updateTask, deleteTask } = require('../controllers/taskControllersV1');

// endpoint prefix : /api/task
const taskRouter = express.Router();

// ---------- v1 routes ----------

taskRouter.get('/v1/:queryIndex', checkAuthorization, fetchCurrentTasks);
taskRouter.post('/v1', checkAuthorization, addTask);
taskRouter.put('/v1', checkAuthorization, updateTask);
taskRouter.delete('/v1/:id', checkAuthorization, deleteTask);


module.exports = {taskRouter};
