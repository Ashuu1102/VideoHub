import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/v/:videoId").post(toggleVideoLike)
router.route("/c/:commentId").post(toggleCommentLike)
router.route("/t/:tweetId").post(toggleTweetLike)
router.route("/liked-videos").get(getLikedVideos)

export default router