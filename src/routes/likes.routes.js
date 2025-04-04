import express from "express";
import { VeryfyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";

const router=express.Router();

router.route("/togglevideolike/:videId").post(VeryfyJWT,toggleVideoLike);
router.route("/togglecommentlike/:commentId").post(VeryfyJWT,toggleCommentLike);
router.route("/toggletweetlike/:tweetId").post(VeryfyJWT,toggleTweetLike);
router.route("/getlikedvideo").get(VeryfyJWT,getLikedVideos);
export default router;