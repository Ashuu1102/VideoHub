import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller"
import {verifyJWT} from "../middlewares/auth.middleware"
import { upload } from "../middlewares/multer.middleware";



const router = Router()

router.use(verifyJWT)

router.route("/")
        .get(getAllVideos)
        .post(upload.fields([
            {
                name: "vidoeFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]), publishAVideo
    )

router.route("/:videoId")
        .get(getVideoById)
        .delete(deleteVideo)
        .patch(upload.single("thumbnail"), updateVideo)



export default router