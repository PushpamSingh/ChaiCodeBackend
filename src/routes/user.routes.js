import { Router } from "express";
import {LogInUser, LogOutUser, registerUser } from "../controllers/user.controller.js";
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


export default router