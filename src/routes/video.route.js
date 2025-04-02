import {Router} from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { VeryfyJWT } from "../middlewares/auth.middleware.js"
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
const router=Router();


//! secure routes
router.route("/getallvideos").get(VeryfyJWT,getAllVideos)
router.route("/getvideobyid/:videoId").get(VeryfyJWT,getVideoById)
router.route("/publishavideo").post(
    VeryfyJWT,
    upload.fields([
            {
                name:"videoFile",
                maxCount:1
            },
            {
                name:"thumbnail",
                maxCount:1
            }
    ]),
    publishAVideo
);

router.route("/updatevideo/:videoId").put(
    VeryfyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    updateVideo
)

router.route("/deletevideo/:videoId").delete(VeryfyJWT,deleteVideo);
router.route("/togglepublishstatus/:videoId").put(VeryfyJWT,togglePublishStatus)




export default router;