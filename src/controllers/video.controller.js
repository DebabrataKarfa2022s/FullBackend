import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "./utils/apiError.js";
import { ApiResponse } from "./utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandeer.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId,
    } = req.query;

    //TODO: get all videos based on query, srot,pagination
    if (isValidObjectId(req.user._id)) {
        throw new ApiError(400, "Invalid user");
    }

    try {
        const videos = Video.aggregate([
            {
                $match: {
                    owner: req.user?._id,
                    title: { $regex: query, $option: "i" },
                },
            },
        ]).sort({
            [`${sortType}`]: `${sortBy}`,
        });

        const options = {
            page,
            limit,
        };

        const data = await Video.aggregatePaginate(
            videos,
            options,
            (err, result) => {
                if (err) {
                    throw new ApiError(400, "videos pagination failed!");
                }
                return result;
            }
        );
        return res
            .status(200)
            .json(
                new ApiResponse(200, data, "videos fetched Sucessfully done")
            );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "something went wrong. Video not fetched!!"
        );
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    //TODO: get video, upload to cloudinary, create video
    const { videoFile, thumbnail } = req?.files;

    const [{ path: videoPath }] = videoFile;
    const [{ path: thumbnailPath }] = thumbnail;

    if (isValidObjectId(req.user._id)) {
        throw new ApiError(400, "invalid User for publish a video");
    }

    if (!videoPath || !thumbnailPath) {
        throw new ApiError(400, "Invalid file paths for published a video");
    }

    try {
        const videoFileResponse = await uploadOnCloudinary(videoPath);
        const thumbnailResponse = await uploadOnCloudinary(thumbnailPath);

        const video = await Video.create({
            title,
            description,
            videoFile: videoFileResponse.url,
            thumbnail: thumbnailResponse.url,
            duration: videoFileResponse.duration,
            owner: req.user._id,
        });
        await video.save();

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    video,
                    "video published successfully done "
                )
            );
    } catch (err) {
        throw new ApiError(
            500,
            err?.message || "something went wrong. Video not published"
        );
    }
});

const getVideoId = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    if (isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    try {
        const video = await Video.findById({ _id: videoId });
        return res
            .status(200)
            .json(new ApiResponse(200, video, "video fetched successfully"));
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "something went wrong, vidoe not fetched"
        );
    }
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const { path: thumbnailPath } = req.file || {};

    if (isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id for updating");
    }

    const thumbnailResponse = await uploadOnCloudinary(thumbnailPath);

    try {
        const video = await Video.findByIdAndUpdate(
            { _id: videoId },
            {
                title,
                description,
                thumbnail: thumbnailPath && thumbnailResponse.url,
            },
            {
                new: true,
            }
        );

        return res.status(201).json(new ApiResponse(
            201, video, "video updated Successfully done"
        ));
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong. Video not updated!");
    }
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete the video

    if(isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id for deleted");
    }

    try {
        const video= await Video.findByIdAndDelete({_id:videoId});

        if(!video){
            throw new ApiError(404, "video not found");
        }

        return res.status(201).json(
            new ApiResponse(201, video, "video deleted Sucessfully done")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong. Vidoe not deleted!");
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: if video published then do Unpublished else published

    if(isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id");
    }

    const {isPublished} =await Video.findById({_id:videoId}).lean();

    try {
        const video= await Video.findOneAndUpdate({_id:videoId}, {
            isPublished: !isPublished
        },{
            new:true
        })

        return res.status(200).json(
            new ApiResponse(200, video, "video isPublished updated Successfully done")
        );
    } catch (error) {
        throw new ApiError(500,error?.message || "something went wrong. Video isPublished not updated!");
    }
});

export {
    getAllVideos,
    publishAVideo,
    getVideoId,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus,
};
