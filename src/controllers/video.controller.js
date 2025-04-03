import {Video} from "../models/video.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {User} from "../models/users.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.util.js";
import { deletefromcloudinary } from "../utils/deleteFromCoudinary.util.js";
import mongoose, { isValidObjectId } from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
        try {
            //? getting all query from req.query
            
            let { page, limit, query, sortBy, sortType, userId } = req.query
            // console.log(("Helloworl"));
            //TODO: get all videos based on query, sort, pagination
            //? parse the page and the limit in int
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            
            const match={
                ...(query?{title: {$regex: query,$options:"i"}}:{}),
                ...(userId?{userId:mongoose.Types.ObjectId(userId)}:{})
            }

            const video=await Video.aggregate([
                {
                    $match:match,
                },
                {
                    $lookup:{
                        from:'User',
                        localField:'owner',
                        foreignField:'_id',
                        as:'VideosByOwner'
                    }
                },
                {
                    $project:{
                        videoFile:1,
                        thumbnail:1,
                        title:1,
                        description:1,
                        duration:1,
                        views:1,
                        isPublished:1,
                        owner:{
                            $arrayElemAt: ["$videosByOwner",2]
                        }
                    }
                },
                {
                    $sort:{
                        [sortBy]:sortType==='desc'?-1:1
                    }
                },
                {
                    $skip:(page-1)*limit
                }
            ])

            if(!video?.length){
                throw new ApiError(502,"Failed to get videos")
            }

            return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    video,
                    "Video fetched successfuly"
                )
            )
        } catch (error) {
            console.log("Error in geting all video: ",error);
            throw new ApiError(500,"Internal server Error")
        }
})

const publishAVideo = asyncHandler(async (req, res) => {
        try {
            //? get data from the req.body
            const { title, description} = req.body
            // TODO: get video, upload to cloudinary, create video
            //? validate given data
            if(!(title)){
                throw new ApiError(400,"Title are required")
            }
        
            //? get the video file and thumbnail path from req.files
            const videoLocalfilepath=req.files?.videoFile[0]?.path;
            // console.log("Video Local path: ",videoLocalfilepath);
            
            const thumbnailLocalfilepath=req.files?.thumbnail[0].path;
            // console.log("thumbnail Local path: ",thumbnailLocalfilepath);
        
            if(!(videoLocalfilepath || thumbnailLocalfilepath)){
                throw new ApiError(400,"Video or thumbnail not found")
            }
        
            //? upload on cloundinary 
            const videopath=await uploadonCloudinary(videoLocalfilepath);
            const thumbnailpath=await uploadonCloudinary(thumbnailLocalfilepath);
            // console.log("VideoPath: ",videopath.duration);
            
        
            if(!(videopath || thumbnailpath)){
                throw new ApiError(400,"Video or thumbnail are required")
            }
        
            //? Create an object entry in database
            const video = await Video.create({
                videoFile:videopath.url,
                thumbnail:thumbnailpath.url,
                title,
                description,
                owner:req.user?._id,
                duration:videopath.duration
            })
            if(!video){
                throw new ApiError(502,"Failed to upload video")
            }
            //? set ispublished of this video
            video.isPublished=true;
            await video.save({validateBeforeSave:false});
        
            //? Return the responce
            return res.status(201)
            .json(
                new ApiResponce(
                    200,
                    video,
                    "Video post successfuly"
                )
            )
        } catch (error) {
            console.log("Error in posting video: ",error);
            throw new ApiError(500,"Internal server Error")
        }
})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        //TODO: get video by id
        //? validate given id
        if(!isValidObjectId(videoId)){
            throw new ApiError(400,"Video not found or invalid video Id")
        }
    
        //? find the video using video id
        const video = await Video.findById(videoId);
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                video,
                "Video fetched successfuly"
            )
        )
    } catch (error) {
        console.log("Error in geting a video: ",error);
        throw new ApiError(500,"Internal server Error")
    }
})

const updateVideo = asyncHandler(async (req, res) => {
        try {
            //? get the videoid from req.param
            const { videoId } = req.params
            //TODO: update video details like title, description, thumbnail
            //? get details like title, description from the req.body
            const {title,description}=req.body;
            const userId=req.user?._id;
            //? validate these details
            if(!(title)){
                throw new ApiError(400,"Title is required")
            }
            if(!isValidObjectId(userId)){
                throw new ApiError(400,"Need to be logged in")
            }
        
            //? get the videofile and thumbnail file from req.files and validate
            const videoLocalPath=req.files?.videoFile[0]?.path;
            // console.log("Video for update: ",videoLocalPath);
            
            const thumbnailLocalPath=req.files?.thumbnail[0].path;
            // console.log("thumbnail for update: ",thumbnailLocalPath);


        
            if(!(videoLocalPath || thumbnailLocalPath)){
                throw new ApiError(400,"video or thumbnails are required");
            }
        
            //? delete the old files from cloudinary before upload new
            const video=await Video.findById(videoId)
            // console.log("video: ",video.videoFile);
            //? validate that owner is updating video
            if(!video){
                throw new ApiError(404,"Invalid video Id !! not found")
            }
            if(video.owner.toString()!==userId.toString()){
                throw new ApiError(400,"you can only update your own video")
            }
            
            const deletedvideo=await deletefromcloudinary(video.videoFile);
            // console.log("deleted video responce: ",deletedvideo);
            
            const deletedthumbnail=await deletefromcloudinary(video.thumbnail);
            // console.log("deleted thumbnail responce: ",deletedthumbnail);
        
            if(!deletedvideo){
                throw new ApiError(400,"Failed to delete video path");
            }
            if(!deletedthumbnail){
                throw new ApiError(400,"Failed to delete thumbnail path");
            }
        
            //? upload on cloudinary
            const uploadedvideo=await uploadonCloudinary(videoLocalPath);
            const uploadthumbnail=await uploadonCloudinary(thumbnailLocalPath);
        
            if(!uploadedvideo){
                throw new ApiError(400,"Failed to upload video path");
            }
            if(!uploadthumbnail){
                throw new ApiError(400,"Failed to upload thumbnail path");
            }
        
            const updateVideo=await Video.findByIdAndUpdate(
                videoId,
                {
                    title,
                    description,
                    videoFile:uploadedvideo.url,
                    thumbnail:uploadthumbnail.url,
                    duration:uploadedvideo.duration
                }
            )
        
            if(!updateVideo){
                throw new ApiError(404,"Video not found")
            }
            return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    updateVideo,
                    "Video updated successfuly"
                )
            )
        } catch (error) {
            console.log("Error in updating video: ",error);
            
            throw new ApiError(500,"Internal server error while updating video")
        }


})

const deleteVideo = asyncHandler(async (req, res) => {
   try {
     const { videoId } = req.params
     //TODO: delete video
     const userId=req.user?._id;
 
     //? validate video id
     if(!isValidObjectId(videoId)){
       throw new ApiError(400,"Video id not found !! invalid id");
     }
     if(!isValidObjectId(userId)){
       throw new ApiError(400,"need to be logged in");
     }
     //? first delete the video from cludinary
     const video=await Video.findById(videoId);
     //? validate that owner is deleting video
     if(!video){
        throw new ApiError(404,"Video not found");
     }
     if(video.owner.toString()!==userId.toString()){
        throw new ApiError(400,"you can only delete your own video");
     }
     const deletedVideo=await deletefromcloudinary(video.videoFile);
     const deletethumbnail=await deletefromcloudinary(video.thumbnail);
 
     if(!(deletedVideo)){
         throw new ApiError(400,"Faild to delete video path")
     }
     if(!(deletethumbnail)){
         throw new ApiError(400,"Faild to delete video thumbnail path")
     }

 
     const deletedDocument=await Video.findByIdAndDelete(videoId);
 
     if(!deletedDocument){
         throw new ApiError(400,"video not found to delete")
     }
     return res.status(200)
     .json(
         new ApiResponce(
             200,
             deletedDocument,
             "Video deleted successfuly"
         )
     )
   } catch (error) {
    console.log("Error in deleting video: ",error);
    
    throw new ApiError(500,"Internal server error while deleting video")
   }

})

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
      const { videoId } = req.params
      const userId=req.user._id;
      //? validate video id
      if(!isValidObjectId(videoId)){
          throw new ApiError(400,"Video id not found || invalid id");
      }
      //? find the video to toggle
      const video=await Video.findOne({_id:videoId});
      if(!video){
          throw new ApiError(400,"video not found")
      }
      //? validate owner is toggling
      if(video.owner.toString()!== userId.toString()){
        throw new ApiError(400,"you can only toggle your own video")
      }
      video.isPublished=!video.isPublished;
      await video.save({validateBeforeSave:false})
  
      return res.status(200)
      .json(
          new ApiResponce(
              200,
              video,
              "isPublished toggled successfuly"
          )
      )
  } catch (error) {
    console.log("Error in toggle isPublished: ",error);
    
    throw new ApiError(500,"Internal server error while toggling video isPublished")
  }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}