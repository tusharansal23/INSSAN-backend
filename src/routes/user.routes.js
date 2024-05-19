import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
 } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser);
router.route("/token").get(refreshAccessToken);
router.route("/change-password").put(verifyJWT, changeCurrentPassword);
router.route("/").get(verifyJWT, getCurrentUser);
router.route("/update-account").put( verifyJWT, updateAccountDetails);


export default router