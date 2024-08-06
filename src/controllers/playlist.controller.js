import mongoose, {isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description} = req.body;
    // TODO: create playlist

})

const getUserPlaylist=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    //TODO: get user playlist
})

const getplaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}= req.params;
    //TODO: get playlist by id
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId, videoId}= req.params;
    //TODO:add video in the playlist
})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId, videoId}=req.params;
    //TODO: remove video from the playlist
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    //TODO: delete the playlist
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    const {name, description}=req.body;
    //TODO: update name and description 
})

export {
    createPlaylist,
    getUserPlaylist,
    getplaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist

}