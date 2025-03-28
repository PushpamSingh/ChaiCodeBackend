import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import dotenv  from "dotenv";
import { User } from "../models/users.model.js";
dotenv.config();
export const VeryfyJWT=asyncHandler(async(req,_,next)=>{
   try {
     const token = req.cookies?.AccessToken || req.headers("Authorization").replace("Bearer ","")
 
     if(!token){
         throw new ApiError(401,"UnAuthorized User")
     }
 
     const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
 
     const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
         throw new ApiError(401,"Invalid Access Token")
     }
     req.user=user;
     next();
   } catch (error) {
    throw new ApiError(500,"Internal Server Error")
   }
})