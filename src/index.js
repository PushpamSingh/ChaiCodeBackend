import express from "express"
import dotenv from "dotenv"
import { dbConnect } from "./db/db.js";
dotenv.config();

const app=express();

const port = process.env.PORT;

dbConnect()
app.listen(port ,()=>{
    console.log("Server runnig on ",port);
})