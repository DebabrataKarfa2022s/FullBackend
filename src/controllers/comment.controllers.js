import mongoose, {isValidObjectId} from "mongoose";
import {Comment} from "../models/comment.model.js";
import { Subscription } from "../models/subscription.model.js";
import {ApiError} from "./utils/ApiError.js"
import {ApiResponse} from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {page=1, limit=10}=req.body;
    //todo: get all comments for a video
})

const addComment=asyncHandler(async(req,res)=>{
    const {userId} =req.params;
    // todo : add a comment to a video
})

const updateComment=asyncHandler(async(req,res)=>{
    // todo: update a comment
})

const deleteComment=asyncHandler(async(req,res)=>{
    //todo: delete a comment
})

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}