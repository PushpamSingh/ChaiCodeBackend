import {asyncHandler} from '../utils/asyncHandler.js';
import {User} from "../models/users.model.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadonCloudinary} from "../utils/cloudinary.util.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import jwt from "jsonwebtoken"
// import {genrateRefreshToken} from"../models/users.model.js"
import dotenv from "dotenv"
dotenv.config()

const genrateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(404,"User not found")
        }

        const AccessToken=await user.genrateAccessToken();
        const RefreshToken=await user.genrateRefreshToken();

        user.refreshToken=RefreshToken;
        await user.save({validateBeforeSave:false})

        return {AccessToken,RefreshToken};
    } catch (error) {
        throw new ApiError(500,"Internal Server Error !! Something went wrong while generating access or refresh token")
    }
}
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
        // console.log("Avatar local path: ",req.files?.avatar);
        
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
        // console.log("Avatar: ",avatar);

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

const LogInUser=asyncHandler(async(req,res)=>{
    try {
        //? Get data from req.body
        //? Username or password based log in
        //? check password
        //? access and refresh token generate
        //? send cookies
    
        const {username,email,password}=req.body;
        // if(!username || !email){
        //     throw new ApiError(401,"Username or email are required")
        // }
        if(!(username || email)){
            throw new ApiError(401,"Username or email are required")
        }
        const user = await User.findOne({
            $or:[{username},{email}]
        })
    
        if(!user){
            throw new ApiError(404,"user not existed")
        }
    
        const isPasswordCheck=await user.comparePassword(password);
    
        if(!isPasswordCheck){
            throw new ApiError(402,"Password is incorrect")
        }
    
        const {AccessToken,RefreshToken}=await genrateAccessAndRefreshToken(user._id);

        const loggedInUser= await User.findById(user._id).select(
            "-password -refreshToken"
        )

        const options ={
            httpOnly:true,
            secure:true
        }
        return res
        .status(201)
        .cookie("AccessToken",AccessToken,options)
        .cookie("RefreshToken",RefreshToken,options)
        .json(
            new ApiResponce(
                200,
            {
                user:loggedInUser,AccessToken,RefreshToken
            },
            "User log in Succeessfuly"
            )
        )


    
    } catch (error) {
        console.log("Error in login: ",error);
        
        throw new ApiError(500,"Internal Server Error !! Something went wrong while log in")
    }
})


const LogOutUser=asyncHandler(async(req,res)=>{
  try {
      
          await User.findByIdAndUpdate(
              req.user._id,
              {
                  $set:{
                    refreshToken:"undefined"
                  }
              },
              {
                  new:true
              }
          )
      const options={
          httpOnly:true,
          secure:true
      }
  
      return res.status(200)
      .clearCookie("AccessToken",options)
      .clearCookie("RefreshToken",options)
      .json(
          new ApiResponce(
              300,
              {},
              "user Logged out"
          )
      )
  } catch (error) {
    throw new ApiError(500,"Internal Server Error !! Something went wrong while log out")
  }
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken=req.cookies?.RefreshToken || req.body.refreshToken;

        if(!incomingRefreshToken){
            throw new ApiError(401,`Unauthorized request: ${incomingRefreshToken}`)
        }
        console.log(incomingRefreshToken);
        
        const decodedToken=await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user=await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401,"Invalid refresh Token");
        }

        if(incomingRefreshToken!==user.refreshToken){
            throw new ApiError(401,"Refresh Token expire or used")
        }

        const {AccessToken,RefreshToken}=await genrateAccessAndRefreshToken(user._id);

        const options ={
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .cookie("AccessToken",AccessToken,options)
        .cookie("RefreshToken",RefreshToken,options)
        .json(
            new ApiResponce(
                200,
                {
                    user: AccessToken
                },
                "New Refresh Token generated successfuly"
            )
        )
    } catch (error) {
        console.log("error in refresh: ",error);
        
        throw new ApiError(500,"Internal server Error in refresh AccessToken")
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    try {
        //? Get oldpassword newpassword from the user
        const {oldPassword,newPassword}=req.body;

        //? Validate both the fields
        if(!(oldPassword || newPassword)){
            throw new ApiError(401,"oldPassword and newPassword are required")
        }

        //?find the user with the help of req.user
        const user=await User.findById(req.user?._id);
        if(!user){
            throw new ApiError(401,"Unauthorized user")
        }

        //?compare the oldPassword with database saved password
        const isPasswordMatched=await user.comparePassword(oldPassword);
        if(!isPasswordMatched){
            throw new ApiError(404,"OldPassword is wrong can not able to update")
        }

        user.password=newPassword;
        await user.save({validateBeforeSave:false});

        return res.status(200)
        .json(
            new ApiResponce(200,{},"Password changed successfully")
        )
    } catch (error) {
        throw new ApiError(500,"Internal server Error !! Something went wrong while changing password")
    }
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    try {
        //? Fetching current user from req.user
        return res.status(200)
        .json(
            new ApiResponce(200,req.user,"Current user fetched successfuly")
        )
    } catch (error) {
        throw new ApiError(500,"Internal server Error !! Something went wrong while Getting user")
    }
})

const updateUserDetailes=asyncHandler(async(req,res)=>{
    try {
        //? get the detailes what to update
        const {fullName,email}=req.body;
        //? validate both the fields
        if(!(fullName || email)){
            throw new ApiError(401,"fullName and email are required")
        }

        const user=await User.findByIdAndUpdate(
            req.user._id,
            {
               $set:{
                fullName,
                email
               }
            },
            {
                new:true
            }
        ).select("-password -refreshToken");

        if(!user){
            throw new ApiError(404,"User not found");
        }
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                user,
                "User updated successfuly"
        )
        )

    } catch (error) {
        throw new ApiError(500,"Internal server Error !! Something went wrong while Updating user")
    }
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    try {
        //? get path of new Avatar
        const avatarlocalPath=req.file?.path;

        if(!avatarlocalPath){
            throw new ApiError(401,"Avatar is required")
        }
        const avatar=await uploadonCloudinary(avatarLocalPath);
         if(!avatar){
            throw new ApiError(401,"Avatar cloudinary uploading problem")
         }

         const user=await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    avatar:avatar.url
                }
            },
           {
            new:true
           }
         ).select("-password -refreshToken")

         return res.status(200)
         .json(
            new ApiResponce(200,user,"Avatar updated successfuly")
         )
    } catch (error) {
        throw new ApiError(500,"Internal server Error !! Something went wrong while Updating Avatar user")
    }
})

const updateUserCoverImg=asyncHandler(async(req,res)=>{
    try {
        //? get file path from the of new coverImg
        let coverImgLocalPath;
        if(req.file && req.file?.path){
            coverImgLocalPath=req.file?.path;
        }

        //? upload on cloudinary
        const coverImg=await uploadonCloudinary(coverImgLocalPath);
       const user = await User.findByIdAndUpdate(
        req.user._id,
        {
           $set:{
            coverImg:coverImg.url
           }
        },
        {
            new:true
        }
       ).select("-password -refreshToken");

       return res.status(200)
       .json(
        new ApiResponce(
            200,
            {
                user
            },
            "coverImg updated successfuly"
        )
       )
        

    } catch (error) {
        throw new ApiError(500,"Internal server Error !! Something went wrong while Updating coverImg user")

    }
})
export {
    registerUser,
    LogInUser,
    LogOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetailes,
    updateUserAvatar,
    updateUserCoverImg
}