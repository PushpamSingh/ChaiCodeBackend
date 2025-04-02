import { Router } from "express";
import {changeCurrentPassword,
        getCurrentUser, 
        getUserChanelProfile, 
        getWatchHistory, 
        LogInUser, 
        LogOutUser, 
        refreshAccessToken, 
        registerUser, 
        updateUserAvatar, 
        updateUserCoverImg, 
        updateUserDetailes } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { VeryfyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

//? Register Router
router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImg",
            maxCount:1
        }
    ]),
    registerUser
)

//? Login Router
router.route("/login").post(
    LogInUser
)

//? secured logOut user
router.route("/logout").post(VeryfyJWT,LogOutUser)
router.route("/refreshaccesstoken").post(refreshAccessToken)

router.route("/changecurrentpassword").put(VeryfyJWT,changeCurrentPassword)
router.route("/getcurrentuser").get(VeryfyJWT,getCurrentUser)
router.route("/updateuserdetailes").put(VeryfyJWT,updateUserDetailes)
router.route("/updateuseravatar").put(
    VeryfyJWT,
    upload.single("avatar"),
    updateUserAvatar
)

router.route("/updateusercoverimage").put(
    VeryfyJWT,
    upload.single("coverImg"),
    updateUserCoverImg
)

router.route("/chanel/:username").get(getUserChanelProfile)
router.route("/getwatchhistory").get(VeryfyJWT,getWatchHistory)
export default router