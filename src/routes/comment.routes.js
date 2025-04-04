import express from "express";
import { VeryfyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router=express.Router();

router.route("/addcomment/:videoId").post(VeryfyJWT,addComment)
router.route("/getvideocomment/:videoId").get(VeryfyJWT,getVideoComments)
router.route("/updatecomment/:commentId/:videoId").put(VeryfyJWT,updateComment)
router.route("/deletecomment/:commentId/:videoId").delete(VeryfyJWT,deleteComment)

export default router;