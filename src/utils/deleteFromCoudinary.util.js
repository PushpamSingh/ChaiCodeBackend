import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError";
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
        const urlArr=Fileurl.split("/");
        const urlIdArr=urlArr[7].split(".");
        const publicId=urlIdArr[0];
        const responce=await cloudinary.uploader.destroy(publicId);

        if(responce?.result !== "ok"){
            throw new ApiError(400, "Failed tp delete file")
        }
        return responce;
    } catch (error) {
        throw new ApiError(500,"Internal server Error !! while deleting from the cloudinary")
    }
}