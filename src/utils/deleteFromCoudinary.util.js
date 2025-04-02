import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_APIKEY,
    api_secret: process.env.CLOUD_SECRET
});
export const deletefromcloudinary=async(Fileurl)=>{
    try {
        if(!Fileurl){
            throw new ApiError(404,"File Url not found")
        }
        console.log("FileUrl: ",Fileurl);
        
        const urlArr=Fileurl.split("/");
        const urlIdArr=urlArr[urlArr.length-1].split(".");
        const publicId=urlIdArr[0];
        console.log("public id: ",publicId);
        let resourceType='image';
        if(Fileurl.includes('/video/')){
            resourceType='video'
        }
        
        const responce=await cloudinary.uploader.destroy(publicId,{
            resource_type:resourceType
        });
        // console.log("responce: ",responce);
        
        
        if(responce?.result !== "ok" && responce?.result !== "not found"){
            throw new ApiError(400, "Failed tp delete file")
        }
        return responce;
    } catch (error) {
        console.log("Error in cloudinary delete: ",error);
        
        throw new ApiError(500,"Internal server Error !! while deleting from the cloudinary")
    }
}