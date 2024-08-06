import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    deleteVideo,
    getAllVideos,
    getVideoId,
    publishAVideo,
    togglePublishStatus,
    updateVideoDetails,
} from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJWT); // apply verifyJWT middlewear to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoId)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideoDetails);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
