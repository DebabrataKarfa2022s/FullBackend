import { Router } from "express";
import 
{ 
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikeVideos

} from "../controllers/like.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();
router.use(verifyJWT)// apply verifyjwt middlewear to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikeVideos);

export default router