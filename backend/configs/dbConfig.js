const mongoose = require('mongoose');
require('dotenv').config();

const connectToDB = async () =>{
    const conn = mongoose.connection;

    conn.once('open', ()=>{
        console.log('Connected to database');
    });

    conn.on('disconnected', ()=>{
        console.log('Database disconnected');
    });

    conn.on('reconnected', ()=>{
        console.log('Database reconnected');
    });

    conn.on('error', (error)=>{
        console.error('Error connecting to database', error);
    })

    try{
        await mongoose.connect(process.env.MONGO_URI);
    }
    catch(error){
        console.log("Error connecting to Database", error);
    }
}

module.exports = {connectToDB};