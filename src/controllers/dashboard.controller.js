import mongoose from "mongoose";
import {Video} from "../models/video.model.js";
import {Subscription} from "../models/subscription.model.js";
import {Like} from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const getChannelStatus=asyncHandler(async(req,res)=>{
    //todo: get the channel status like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos=asyncHandler(async(req,res)=>{
    //todo: get all the videos uploaded by the channel
})

export {
    getChannelStatus,
    getChannelVideos
}