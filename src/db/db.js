import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const dbConnect=async()=>{
    try{
       const connectionInstances=await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
       console.log(`MongoDB connected Successfully !! host:  ${connectionInstances.connection.host}`);
       
    }catch(error){
        console.log("ERROR: ", error);
        throw error;
    }
}
