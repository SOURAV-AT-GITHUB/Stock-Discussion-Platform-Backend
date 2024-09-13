const express = require('express')
require('dotenv').config()
const port = process.env.PORT
const DBConnection = require('./config/connection')


const app = express()
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("Health Check, Server Running Fine")
})







app.listen(port,async()=>{
    try {
        await DBConnection
        console.log("Server started and DB is Connected");
        
    } catch (error) {
        console.log(error);
    }
})