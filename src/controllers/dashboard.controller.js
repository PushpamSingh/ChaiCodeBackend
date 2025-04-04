import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Subscribe } from "../models/subscribe.model.js";
import { Like } from "../models/likes.model.js";
import { Playlist } from "../models/playlists.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
try {
        // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
        const userId=req.user?._id;
        if(!isValidObjectId(userId)){
            throw new ApiError(400,"Invalid user id !! need to log in")
        }
        //?find that video whose owner is this user and sum all views
    
        const videoforFindViews=await Video.aggregate([
            {
                $match:{owner:userId}
            },
            {
                $group:{
                    _id:"$owner",
                    totalVideosViews:{$sum:"$views"},
                    totalVideos:{$sum:1},
                    videos:{
                        $push:{
                            videoFile:"$videoFile",
                            thumbnail:"$thumbnail",
                            title:"$title",
                            description:"$description",
                            duration:"$duration",
                            views:"$views",
                            isPublished:"$isPublished",
                            owner:"$owner"
                        }
                    }
                }
            }
        ])
        if(!videoforFindViews){
            throw new ApiError(502,"failed to find total views")
        }
        // console.log("Views: ",videoforFindViews[0].videos);

        //?find the document from subscribe that has this user chenel
        const totalSubscriber=await Subscribe.find({chanel:userId});
        // console.log("totalSubscriber: ",totalSubscriber?.length);

        //? find the document from like that has this user id on video
        const totalVideoLikes=await Like.find({likedBy:userId,video:{$exists:true}})
        // console.log("totalvideoLikes: ",totalVideoLikes?.length);

        //? find the document from like that has this user id on comment
        const totalCommentLikes=await Like.find({likedBy:userId,comment:{$exists:true}})
        // console.log("totalCommentLikes: ",totalCommentLikes?.length);

        //? find the document from like that has this user id on tweet
        const totalTweetLikes=await Like.find({likedBy:userId,tweet:{$exists:true}}).populate('tweet')
        // console.log("totalTweetLikes: ",totalTweetLikes?.length,totalTweetLikes);
        
        //? find the document from playList that has this user id owner
        const totalPlalist=await Playlist.find({owner:userId});
        // console.log("totalPlaylist: ",totalPlalist);
        
        
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                {
                    totalVideosViews:videoforFindViews[0]?.totalVideosViews,
                    totalVideosCount:videoforFindViews[0]?.totalVideos,
                    totalVideos:videoforFindViews[0]?.videos,
                    totalSubscriber:totalSubscriber?.length,
                    totalVideoLikes:totalVideoLikes?.length,
                    totalCommentLikes:totalCommentLikes?.length,
                    totalTweetLikes:totalTweetLikes?.length,
                    totalTweets:totalTweetLikes,
                    totalPlayListCount:totalPlalist?.length,
                    totalPlalist

                },
                "Total views calculated"
            )
        )
} catch (error) {
    console.log("Error in channel stats: ",error);
    throw new ApiError(500,"Internal Server Error !! while getting chanel stats")
    
}
})

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        // TODO: Get all the videos uploaded by the channel
        const {channelId}=req.params;
        if(!isValidObjectId(channelId)){
            throw new ApiError(400,"Invalid channel id")
        };
        const channelVideo=await Video.find({owner:channelId});
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                channelVideo,
                "Channel video fetched successfuly"
            )
        )
    } catch (error) {
        console.log("Error in channel video: ",error);
        throw new ApiError(500,"Internal Server Error !! while getting chanel video")
    }
})

export {
    getChannelStats, 
    getChannelVideos
}