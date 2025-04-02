import { Tweet } from "../models/tweets.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
   try {
     //TODO: create tweet
     //? get the data from req.body
     const {content} = req.body;
     const ownerId= req.user._id;
    //  console.log("content: ",content);
     
     if(!content){
         throw new ApiError(401,"Content is required")
     }
 
     //? create an object with content and entry in database 
     const tweet=await Tweet.create({
         content,
         owner:ownerId
     })
 
     if(!tweet){
         throw new ApiError(502,"Failed to tweet")
     }
 
     return res.status(201)
     .json(
         new ApiResponce(
             200,
             tweet,
             "Message posted successfuly"
         )
     )
   } catch (error) {
    console.log("Error in posting tweet: ",error);
    throw new ApiError(500,"Internal server error !! while posting tweet")
    
   }
})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
            // TODO: get user tweets
            //?get user id from req.params
            const {userId} = req.params;
            if(!userId){
                throw new ApiError(401,"invalild userId or not found");
            }
        
            const tweets=await Tweet.find({owner:userId}).sort({createdAt:-1});
        
            if(!tweets){
                throw new ApiError(502,"Tweet not found")
            }
        
            return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    tweets,
                    "All tweets fetched successfully"
                )
            )
    } catch (error) {
        console.log("Error in getting tweet: ",error);
        throw new ApiError(500,"Internal server error !! while getting tweet")
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    try {
        //TODO: update tweet
        //? get content to update and tweet id to be update
        const {tweetId}=req.params;
        const {content}=req.body;
        const userId=req.user._id;
    
        if(!tweetId){
            throw new ApiError(400,"tweet id is required");
        }
        if(!content){
            throw new ApiError(400,"content is required");
        }

        //? find tweet and validate that owner are updating
        const tweet = await Tweet.findById(tweetId);

        if(!tweet){
            throw new ApiError(404,"Tweet not found")
        }
        if(tweet.owner.toString() !== userId.toString()){
            throw new ApiError(402,"You can only update your own tweet")
        }

    
        const updatetweet=await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set:{
                    content
                }
            },
            {new:true}
        );
    
        if(!updatetweet){
            throw new ApiError(502,"failed to update tweet")
        }
    
        return res.status(200)
        .json(
         new ApiResponce(
            200,
            updatetweet,
            "Tweet updated suuccessfuly"
         )
        )
    } catch (error) {
        console.log("Error in updating tweet: ",error);
        throw new ApiError(500,"Internal server error !! while updating tweet")
    }

})

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        //TODO: delete tweet
        //? get tweetid to be delete
        const {tweetId}=req.params;
        const userId=req.user._id;


        if(!isValidObjectId(tweetId)){
            throw new ApiError(401,"Tweet id is required");
        }

        //? find tweet and validate that owner is deleting tweet
        const tweet=await Tweet.findById(tweetId);
        if(!tweet){
            throw new ApiError(404,"Tweet not found");
        }
        if(tweet.owner.toString()!==userId.toString()){
            throw new ApiError(401,"you can only delete your own tweet")
        }

        const deletetweet=await Tweet.findByIdAndDelete(
            tweetId,
            {
                new:true
            }
        )
        if(!deletetweet){
            throw new ApiError(502,"failed to delete tweet");
        }
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                deletetweet,
                "tweet deleted successfuly"
            )
        )
        
    } catch (error) {
        console.log("Error in deleting tweet: ",error);
        throw new ApiError(500,"Internal server error !! while deleting tweet")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}