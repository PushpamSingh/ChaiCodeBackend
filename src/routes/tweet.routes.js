import express from "express";
import {VeryfyJWT} from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweets.controller.js";
const router=express.Router();

router.route("/getusertweet/:userId").get(VeryfyJWT,getUserTweets);
router.route("/createtweet").post(VeryfyJWT,createTweet);
router.route("/updatetweet/:tweetId").put(VeryfyJWT,updateTweet);
router.route("/deletetweet/:tweetId").delete(VeryfyJWT,deleteTweet);
export default router;