import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new mongoose.Schema({
    videoFile:{
        type:String, //?Cloudnary url
        required:[true,"Video file is required"]
    },
    thumbnail:{
        type:String, //?Cloudnary url
        required:[true,"thumbnail file is required"]
    },
    title:{
        type:String,
        required:[true,"title file is required"]
    },
    description:{
        type:String,
    },
    duration:{
        type:Number,
    },
    views:{ 
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})
mongoose.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)