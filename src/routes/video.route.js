import {Router} from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { VeryfyJWT } from "../middlewares/auth.middleware.js"
import { getAllVideos, publishAVideo } from "../controllers/video.controller.js";
const router=Router();

//? geting all video router
router.route("/getallvideos").get(getAllVideos)

router.route("/publishavideo").post(
    VeryfyJWT,
    upload.fields([
            {
                name:video,
                maxCount:1
            },
            {
                name:thumbnail,
                maxCount:1
            }
    ]),
    publishAVideo)