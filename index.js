const express = require('express')
require('dotenv').config()
const port = process.env.PORT || 3000
const DBConnection = require('./config/connection')
const authRouter = require("./routes/authRoutes")
const userRouter = require('./routes/userRoutes')


const app = express()

app.use(express.json())
app.use('/auth',authRouter)
app.use("/user",userRouter)

app.get('/',(req,res)=>{
  return  res.status(200).send("Health Check, Server Running Fine")
})

app.listen(port,async()=>{
    try {
        await DBConnection
        console.log("Server started and DB is Connected");
        
    } catch (error) {
        console.log(error);
    }
})