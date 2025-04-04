import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    try {
        //TODO: get all comments for a video
        const { videoId } = req.params
        let { page, limit } = req.query
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = page&&limit ?(page - 1) * limit:0;

        //? find and return comments
        const comment = await Comment.find({ video: videoId }).skip(skip);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    {
                        page,
                        limit,
                        comment
                    },
                    "comment fetched successfuly"
                )
            )
    } catch (error) {
        console.log("Error in getting comment: ", error);
        throw new ApiError(500, "Internal Server error !! while getting comment");
    }

})

const addComment = asyncHandler(async (req, res) => {
    try {
        // TODO: add a comment to a video
        //? get from params and req.body
        const { videoId } = req.params;
        const { content } = req.body;
        const userId = req.user?._id;

        if (!(isValidObjectId(videoId) || !isValidObjectId(userId))) {
            throw new ApiError(400, "Invalid Video Id or UserID");
        }
        if (!content) {
            throw new ApiError(400, "Content is should not be empty");
        }

        //?create entry in db
        const comment = await Comment.create({
            content,
            video: videoId,
            owner: userId
        })

        if (!comment) {
            throw new ApiError(502, "Failed to add comment");
        }
        return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    comment,
                    "comment added successfuly"
                )
            )
    } catch (error) {
        console.log("Error in add comment: ", error);
        throw new ApiError(500, "Internal Server Error !! while Adding comment")
    }

})

const updateComment = asyncHandler(async (req, res) => {
    try {
        // TODO: update a comment
        //? get owner comment id;
        const { commentId, videoId } = req.params;
        const userId = req.user?._id;
        const { content } = req.body;

        if (!(isValidObjectId(commentId) || isValidObjectId(videoId) || isValidObjectId(userId))) {
            throw new ApiError(400, "owner id or video id is invalid");
        }
        //? validate that user can only update it's own account
        const isUserComment = await Comment.findById(commentId);
        if (!isUserComment) {
            throw new ApiError(404, "Comment not found");
        }
        if (isUserComment.owner.toString() !== userId.toString()) {
            throw new ApiError(401, "you can only update your own comment");
        }

        const comment = await Comment.findOneAndUpdate(
            { _id:commentId,owner: userId, video: videoId },
            {
                content
            },
            {
                new: true
            }
        );
        if (!comment) {
            throw new ApiError(502, "Failed to update comment");
        }
        return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    comment,
                    "Comment updated successfuly"
                )
            )
    } catch (error) {
        console.log("Error in update comment: ", error);
        throw new ApiError(500, "Internal Server Error !! while updating comment")
    }



})

const deleteComment = asyncHandler(async (req, res) => {
   try {
     // TODO: delete a comment
     //? get comment id and video id
     const {commentId,videoId}=req.params;
     const userId=req.user?._id;
 
     if (!(isValidObjectId(commentId) || isValidObjectId(videoId) || isValidObjectId(userId))) {
         throw new ApiError(400, "owner id or video id is invalid");
     }
     //? validate that user can only delete it's own account
     const isUserComment = await Comment.findById(commentId);
     if (!isUserComment) {
         throw new ApiError(404, "Comment not found");
     }
     if (isUserComment.owner.toString() !== userId.toString()) {
         throw new ApiError(401, "you can only delete your own comment");
     }
 
     //? find and delete the comment
     const comment=await Comment.findOneAndDelete(
         {_id:commentId,owner:userId,video:videoId},
         {new:true}
     )
 
     if (!comment) {
         throw new ApiError(502, "Failed to delete comment");
     }
     return res.status(200)
         .json(
             new ApiResponce(
                 200,
                 comment,
                 "Comment deleted successfuly"
             )
         )
   } catch (error) {
    console.log("Error in update comment: ", error);
        throw new ApiError(500, "Internal Server Error !! while updating comment")
   }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}