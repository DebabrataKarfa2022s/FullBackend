import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js"
import { Subscription } from "../models/subscription.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId} =req.params;
    //TODO: toggle like on comment
})

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    //todo: toggle like on video
})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    //todo: toggle on tweet
})

const getLikeVideos=asyncHandler(async(req, res)=>{
    //todo: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikeVideos
}