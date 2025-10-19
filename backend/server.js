const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToDB } = require('./configs/dbConfig');

// import routers
const { authRouter } = require('./routes/authRouter');
const { passwordRouter } = require('./routes/passwordRouter');
const { adminRouter } = require('./routes/adminRouter');
const { expenseRouter } = require('./routes/expenseRouter');
const { notesRouter } = require('./routes/notesRouter');
const { taskRouter } = require('./routes/taskRouter');

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded());


// database connection
connectToDB();


// use routers
app.use('/api/auth', authRouter);
app.use('/api/password', passwordRouter);
app.use('/api/admin', adminRouter);
app.use('/api/expense', expenseRouter);
app.use('/api/notes', notesRouter);
app.use('/api/task', taskRouter);

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


app.listen(process.env.PORT, ()=>{
    console.log('Server is listening on PORT', process.env.PORT);
});