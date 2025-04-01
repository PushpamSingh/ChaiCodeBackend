import mongoose from "mongoose";

const playListSchema=new mongoose.Schema({
        name:{
            type:String,
            trim:true,
            required:[true,"PlayList name is required"]
        },
        description:{
            type:String,
            required:[true,"Enter description of playlist"]
        },
        videos:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",playListSchema)