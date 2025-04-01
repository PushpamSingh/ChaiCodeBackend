import {Video} from "../models/video.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError, APiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {User} from "../models/users.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.util.js";
import { deletefromcloudinary } from "../utils/deleteFromCoudinary.util.js";

const getAllVideos = asyncHandler(async (req, res) => {
        try {
            //? getting all query from req.query
            const { page, limit, query, sortBy, sortType, userId } = req.query
            //TODO: get all videos based on query, sort, pagination
            //? parse the page and the limit in int
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            
            //? calculate the skip for pagination
            const skip=(page-1)*10;

            //? create a empty object filter based on query
            let filter={};
            if(query){
                filter.$or=[
                    {title:{$regex:query,$options:"i"}},
                    {description:{$regex:query,$options:"i"}}
                ]
            }

            //? if userId provided then filter with userID
            if(userId){
                filter._id=userId;
            }

            //?sort the data based on sortType
            if(sortBy){
                sort[sortBy]=sortType==="desc"?-1:1;
            }else{
                sort["createdAt"]=-1;
            }

            //? fetch all the video on all query given above
            const videos=await Video.find(filter).sort(sort).skip(skip).limit(limit)

            //? send the res to the user
            return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    {
                        page,
                        limit,
                        total:await Video.countDocuments(filter),//!count all the document present in the Video db
                        data:videos//! limited data sending to the user
                    },
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
            const videoLocalfilepath=req.files?.video[0]?.path;
            const thumbnailLocalfilepath=req.files?.thumbnail[0].path;
        
            if(!(videoLocalfilepath || thumbnailLocalfilepath)){
                throw new ApiError(400,"Video or thumbnail not found")
            }
        
            //? upload on cloundinary 
            const videopath=await uploadonCloudinary(videoLocalfilepath);
            const thumbnailpath=await uploadonCloudinary(thumbnailLocalfilepath);
        
            if(!(videopath || thumbnailpath)){
                throw new ApiError(400,"Video or thumbnail are required")
            }
        
            //? Create an object entry in database
            const video = await Video.create({
                videoFile:videopath.url,
                thumbnail:thumbnailpath.url,
                title,
                description
            })
        
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
        if(!videoId){
            throw new APiError(400,"Videoid not found")
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
            //? validate these details
            if(!(title)){
                throw new ApiError(400,"Title is required")
            }
        
            //? get the videofile and thumbnail file from req.files and validate
            const videoLocalPath=req.files?.video[0]?.path;
            const thumbnailLocalPath=req.files?.thumbnail[0].path;
        
            if(!(videoLocalPath || thumbnailLocalPath)){
                throw new ApiError(400,"video or thumbnails are required");
            }
        
            //? delete the old files from cloudinary before upload new
            const video=await Video.findOne({videoId})
            const deletedvideo=await deletefromcloudinary(video.videoFile);
            const deletedthumbnail=await deletefromcloudinary(video.thumbnail);
        
            if(!(deletedvideo || deletedthumbnail)){
                throw new ApiError(400,"Failed to delete path");
            }
        
            //? upload on cloudinary
            const uploadedvideo=await uploadonCloudinary(videoLocalPath);
            const uploadthumbnail=await uploadonCloudinary(thumbnailLocalPath);
        
            if(!(uploadedvideo || uploadthumbnail)){
                throw new ApiError(400,"Failed to upload path");
            }
        
            const updateVideo=await Video.findByIdAndUpdate(
                videoId,
                {
                    title,
                    description,
                    videoFile:uploadedvideo.url,
                    thumbnail:uploadthumbnail.url
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
            throw new ApiError(500,"Internal server error while updating video")
        }


})

const deleteVideo = asyncHandler(async (req, res) => {
   try {
     const { videoId } = req.params
     //TODO: delete video
 
     //? validate video id
     if(!videoId){
         throw new ApiError(400,"Video id not found");
     }
     //? first delete the video from cludinary
     const video=await Video.findOne({videoId});
     const deletedVideo=await deletefromcloudinary(video.videoFile);
 
     if(!deletedVideo){
         throw new ApiError(400,"Faild to delete video in deleteVideo")
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
    throw new ApiError(500,"Internal server error while deleting video")
   }

})

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
      const { videoId } = req.params
      //? validate video id
      if(!videoId){
          throw new ApiError(400,"Video id not found");
      }
      //? find the video to toggle
      const video=await Video.findOne({videoId});
      if(!video){
          throw new ApiError(400,"video not found")
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