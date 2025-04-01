import mongoose from "mongoose";

const subscribeSchema=new mongoose.Schema(
        {
            subscribe:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            chanel:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        },
{timestamps:true})

export const Subscribe=mongoose.model("Subscribe",subscribeSchema)