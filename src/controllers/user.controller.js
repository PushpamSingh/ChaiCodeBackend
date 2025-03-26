import {asyncHandler} from '../utils/asyncHandler.js';
import {User} from "../models/users.model.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadonCloudinary} from "../utils/cloudinary.util.js"
import {ApiResponce} from "../utils/ApiResponce.js"
// import {genrateRefreshToken} from"../models/users.model.js"

const registerUser=asyncHandler(async (req,res)=>{
    try {
       //! Get details from frontend 
        const {username,email,fullName,password}=req.body;
       //! validation - not empty
       if([username,email,fullName,password].some((fields)=>fields?.trim()==="")){
        throw new ApiError(400,"All data fields are required")
       }
       //! check if user already exists : Username , email
        const existedUser=await User.findOne({
            $or:[{username},{email}]
        })
        if(existedUser){
            throw new ApiError(409,"User already existed")
        }
       //! check for image avatar,coverimg
       //! Upload img on cloudinary
        const avatarLocalPath=req.files?.avatar[0]?.path;
        let coverImgLocalPath;
        if(req.files && Array.isArray(req.files?.coverImg) && req.files?.coverImg.length>0){
            coverImgLocalPath=req?.files?.coverImg[0]?.path;  
        }else{
            coverImgLocalPath=""
        }
        
        if(!avatarLocalPath){
            throw new ApiError(400,"avatar is required heelo")
        }

        const avatar=await uploadonCloudinary(avatarLocalPath);
        const coverImg=await uploadonCloudinary(coverImgLocalPath);

        if(!avatar){
            throw new ApiError(400,"avatar is required")
        }


       //! Create User object , Create entry in db
       const user=await User.create({
        fullName,
        username:username.toLowerCase(),
        email,
        avatar:avatar.url,
        coverImg:coverImg.url || "",
        password,
       })
       //? generate and save refereshtoken
    user.refreshToken=await user.genrateRefreshToken();
    user.save()

       //! remove password and refresh token from responce
       const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
       )

       //! check for the user creation 
       
       if(!createdUser){
           console.log(createdUser);
        throw new ApiError(500,"Something went wrong while registring the user")
       }

       //! return res
       return res.status(201).json(
        new ApiResponce(200,createdUser,"User register succesfuly")
       )
        
       }
     catch (error) {
        res.status(500).json({
            message:`${error}`
        })
    }
})

const deleteUser=asyncHandler(async(req,res)=>{
    try{
        //! get the id from url parameter using req.params
        const id=req.params.id;

        //! find the user in User model using that id and delete
        const user=await User.findByIdAndDelete(id);

        //! send the responce to the user
        res.status(200).json({
            message:"user deleted",
            user
        })
    }catch(error){
        res.status(500).json({
            message:`${error}`
        })
    }
})

export {registerUser,deleteUser}