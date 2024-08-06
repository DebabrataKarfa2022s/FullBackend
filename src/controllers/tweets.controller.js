import mongoose, {isValidObjectId} from "mongoose";
import { Tweets } from "../models/tweets.moel.js";
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandeer.js";
import { text } from "express";

const createTweet=asyncHandler(async(req,res)=>{
    //TODO: create Tweet

    const {content}=req.body;

    try {
        const tweets= await Tweets.create({
            content,
            owner:req.user._id
        })

        await tweets.save();
        return res.status(200).json(
            new ApiResponse(200, tweets, "Tweets created sucessfully done")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong . Tweet not created");
    }
})

const getUserTweets=asyncHandler(async(req,res)=>{
    //TODO: get user all tweets
    try {
        const tweets= await Tweets.find({
            owner:req.user._id
        }).lean();

        return res.status(200).json(
            new ApiResponse(200, tweets, "Tweets fetched successfully done")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong. Tweets not fetched");
    }
})

const updateTweet=asyncHandler(async(req,res)=>{
    //TODO: update tweet
    const {content}=req.body;
    const {tweetId}=req.params;
    if(isValidObjectId(tweetId)){
        throw new ApiError(400, "invalid tweet id");
    }

    try {
        const tweets= await Tweets.findByIdAndUpdate({
            owner:req.user._id,
            _id:tweetId
        },{
            content:content
        },{
            new:true
        })

        return res.status(200).json(
            new ApiResponse(200, tweets, "Tweets updated successfully done")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong. tweets not updated" )
    }
})

const deleteTweet=asyncHandler(async(req,res)=>{
    //TODO: delte tweet
    const {tweetId}=req.params;
    if(isValidObjectId(tweetId)){
        throw new ApiError(400, "invalid tweets id ");
    }

    try {
        const tweets= await Tweets.findByIdAndDelete({
            _id:tweetId
        })

        if(!tweets){
            throw new ApiError(404, "Tweet not found");
        }

        return res.status(201).json(
            new ApiResponse(201,tweets, "Tweet deleted successfully done")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong. Tweet not deleted");
    }
})

export { createTweet, getUserTweets, updateTweet, deleteTweet}


