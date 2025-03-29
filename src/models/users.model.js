import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        lowercase:true,
        trim:true,
        unique:true,
        index:true
    },
    email:{
        type:String,
        required:[true,"email is required"],
        lowercase:true,
        trim:true
    },
    fullName:{
        type:String,
        required:[true,"fullName is required"],
        trim:true,
    },
    avatar:{
        type:String, //!cloudnary url
        required:[true,"Avatar is required"],
    },
    coverImg:{
        type:String,//!cloudnary url
    },
    password:{
        type:String,
        required:[true,"password is required"],
        trim:true
    },
    refreshToken:{
        type:String,
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ]

},{timestamps:true})
userSchema.pre('save',async function(next){
    const user=this;
    if(!this.isModified("password")) return next()
    try {
        const salt=await bcrypt.genSalt(10);
        const hashedPass=await bcrypt.hash(user.password,salt);
        user.password=hashedPass;
        next()
    } catch (error) {
        next(error)
        throw error
    }
})

userSchema.methods.comparePassword=async function(userPass){
    try {
        const isMatch=await bcrypt.compare(userPass,this.password);
        return isMatch;
    } catch (error) {
        throw error
    }
}

userSchema.methods.genrateAccessToken= function() {
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.genrateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User=mongoose.model('User',userSchema);