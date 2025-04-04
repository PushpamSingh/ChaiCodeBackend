import { isValidObjectId } from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Like } from "../models/likes.model.js"
import { ApiResponce } from "../utils/ApiResponce.js"

const toggleVideoLike = asyncHandler(async(req, res) => {
 try {
       const {videoId} = req.params
       const userId=req.user?._id;
       //TODO: toggle like on video
       if(!(isValidObjectId(videoId) || isValidObjectId(userId))){
           throw new ApiError(400,"invalid video id");
       }
   
       //? find the like schema that has videoId and userId
    //    console.log("videoid: ", videoId);
       const likevideo= await Like.findOne({video:videoId,likedBy:userId});
       if(!likevideo){
           const newLike=await Like.create({
               video:videoId,
               likedBy:userId
           });
           
           if(!newLike){
               throw new ApiError(502,"Failed to like video")
           }
   
           return res.status(201)
           .json(
               new ApiResponce(
                   200,
                   newLike,
                   "video liked successfuly"
               )
           )
       }else{
         const disLike=await Like.findOneAndDelete(
           {video:videoId,likedBy:userId},
           {new:true}
          )
         if(!disLike){
           throw new ApiError(502,"Failed to dislike video")
       }
   
       return res.status(201)
       .json(
           new ApiResponce(
               200,
               disLike,
               "video disliked successfuly"
           )
       )
   
       }
 } catch (error) {
    console.log("Error in toggling video like: ",error);
    throw new ApiError(500,"Internal Server error !! while toggling video like")
    
 }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
   try {
     const {commentId} = req.params
     const userId = req.user?._id;
     //TODO: toggle like on comment
     if(!(isValidObjectId(commentId) || isValidObjectId(userId))){
        throw new ApiError(400,"invalid commentId or userId")
     }
      //? find the like schema that has commentId and userId
      const likeComment= await Like.findOne({comment:commentId,likedBy:userId});
      if(!likeComment){
        const newlike=await Like.create({
            comment:commentId,
            likedBy:userId
        });

        if(!newlike){
            throw new ApiError(502,"Failed to like comment");
        }

        return res.status(201)
        .json(
            new ApiResponce(
                200,
                newlike,
                "comment liked successfuly"
            )
        )
      }else{
        const dislike=await Like.findOneAndDelete(
            {comment:commentId,likedBy:userId},
            {new:true}
           )
        if(!dislike){
            throw new ApiError(502,"Failed to dislike comment");
        }

        return res.status(200)
        .json(
            new ApiResponce(
                200,
                dislike,
                "comment disliked successfuly"
            )
        )
      }

   } catch (error) {
    console.log("Error in toggling comment like: ",error);
    throw new ApiError(500,"Internal Server error !! while toggling comment like")
   }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
   try {
     const {tweetId} = req.params
     const userId=req.user?.id
     //TODO: toggle like on tweet
     if(!(isValidObjectId(tweetId) || isValidObjectId(userId))){
        throw new ApiError(400,"invalid tweetid or userid")
     }
       //? find the like schema that has tweetId and userId
       const likeTweet = await Like.findOne({tweet:tweetId,likedBy:userId});
       if(!likeTweet){
         const newlike=await Like.create({
             tweet:tweetId,
             likedBy:userId
         });
 
         if(!newlike){
             throw new ApiError(502,"Failed to like tweet");
         }
 
         return res.status(201)
         .json(
             new ApiResponce(
                 200,
                 newlike,
                 "tweet liked successfuly"
             )
         )
       }else{
         const dislike=await Like.findOneAndDelete(
             {tweet:tweetId,likedBy:userId},
             {new:true}
             )
         if(!dislike){
             throw new ApiError(502,"Failed to dislike tweet");
         }
 
         return res.status(200)
         .json(
             new ApiResponce(
                 200,
                 dislike,
                 "tweet disliked successfuly"
             )
         )
       }
 


   } catch (error) {
    console.log("Error in toggling tweet like: ",error);
    throw new ApiError(500,"Internal Server error !! while toggling tweet like")
   }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        //TODO: get all liked videos
        const userId=req.user?._id;
    
        if(!isValidObjectId(userId)){
            throw new ApiError(400,"invalid user id need to log in")
        }
    
        //? find the all the document has userid
        const likedVideo=await Like.find({likedBy:userId,video:{$ne:null}}).populate("video");
            if(!likedVideo){
                throw new ApiError(404,"liked Video not found");
            }
    
            return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    likedVideo,
                    "likedVideo fetched successfuly"
                )
            )
    } catch (error) {
        console.log("Error in getting likedVideo: ",error);
       throw new ApiError(500,"Internal Server error !! while getting likedVideo")
    }
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}