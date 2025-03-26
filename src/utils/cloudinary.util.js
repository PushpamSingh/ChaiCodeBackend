import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_APIKEY,
    api_secret:process.env.CLOUD_SECRET
})

export const uploadonCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        
        //!Uploading file on cloudinary
       const responce= await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        }) 

        //?File successfuly uploaded 
        console.log("File successfuly uploaded: ",responce.url);
        return responce

    } catch (error) {
        fs.unlinkSync(localFilePath) //!remove the local saved temporary file
        return null;
    }
}