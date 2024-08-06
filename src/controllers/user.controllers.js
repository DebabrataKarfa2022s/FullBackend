import { asyncHandler } from "../utils/asyncHandeer.js";
import {ApiError} from "./utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "./utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenAndRefreshTokens= async(userId)=>{
    try {
        const user= await User.findById(userId);
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({ validateBeforeSave:false })

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating tokens")
    }

   
}

const registerUser=asyncHandler(async(req,res)=>{
    //    get user details from frontend
    //   validtion - not empty
    // check if user already exits with help of: username,email
    //check for images, check for avatar
    // create user object -create entry in db 
    // remove password and refresh token field froom response 
    // check for user creation 
    // return response 

    // this is for get details from users 
    const {fullName, userName, email, password}=req.body

    console.log("email", email);

    // if(fullName===""){
    //     throw new ApiError(400, "fullName is required");
    // }
    //  this is for validation with empty string 
    if(
        [fullName, userName, email, password].some((field)=> 
        field?.trim()==="")
    ){
        throw new ApiError(400, "all fields are required")
    }

    // this is for find and check user is alredy exits or not 
    const exitsedUser= await User.findOne({
        $or:[{ userName },{ email }]
    });
    if(exitsedUser){
        throw new ApiError(409,"this account is already exits");
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath= req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required");
    }

    // upload on cloudinary 
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "avatar is required");
    }

    const user = await User.create({
        userName:userName.toLowerCase(),
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // this is for not select this field when return in createdUser
    );

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")

    )


});

const loginUser=asyncHandler(async(req,res)=>{
    // collect the data from user ... req.body->data
    // username, email 
    // find the user
    // check password 
    // generate access and refresh token 
    // send cookie 

    const{userName, email, password}=req.body;
    if(!userName && !email){
        throw new ApiError(400, "username or email is reqired for login")
    }

    const user= await User.findOne({$or: [{userName}, {email}]})
    // console.log(user);

    if(!user){
        throw new ApiError(400,"user does not exits for login")
    }

    const isPasswordValid=await user.isPasswordCorrect(password);
    console.log(isPasswordValid);
    if(!isPasswordValid){
        throw new ApiError(401, "password is incorrect for login")
    }

    const {accessToken, refreshToken}=await generateAccessTokenAndRefreshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user logged In Successfully"
        )
    )


})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken", options).json(200,{},"user logged out seccessfully done")
})

const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incommingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incommingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

   try {
     const decodedToken= jwt.verify(incommingRefreshToken, process.eventNames.REFRESH_TOKEN_SECRET)
 
     const user= await User.findById(decodedToken?._id)
 
     if(!user){
         throw new ApiError(401,"Invalid refresh token")
     }
 
     if(incommingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Refresh token is expired or used")
     }
 
     const options={
         httpOnly:true,
         secure:true
     }
 
     const {accessToken, NewrefreshToken}=await generateAccessTokenAndRefreshTokens(user._id)
 
     res.status(200).cookie("accesstoken", accessToken,options).cookie("refreshToken",NewrefreshToken,options).json(
         new ApiResponse(200,
             {accessToken, NewrefreshToken},
             "Access token refresh")
     )
 
   } catch (error) {
    throw new ApiError(400,error?.message || "Invalid refreshToken")
   }
})

const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword}=req.body;

    const user= await User.findById(req.user?._id);//! error should happen

    const isPasswordRight=await user.isPasswordCorrect(oldPassword);

    if(!isPasswordRight){
        throw new ApiError(400,"Invalid old password for changing password")
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
         new ApiResponse(200, {}, "Password change successfully")
    )

})

const getCurrentUser=asyncHandler(async(req,res)=>[
    res.status(200).json(new ApiResponse(200,req.user,"current user fetched successfully"))
])

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;
    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email, // email:email
            }
        },
        {new:true}

    ).select("-password")

    return req.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))

})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(200,"Avatar file is missing")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar for updating")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            
            $set:{
                avatar:avatar.url
            }
            
        },{new:true}
    )
    res.status(200).json(new ApiResponse(200,user,"avatar image update successfully"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"cover image is missing")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading cover image on cloudinary for updating cover image")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },{new:true}
    ).select("-password")

    res.status(200).json(new ApiResponse(200,user,"Cover image update successfully"))

})

const getUserChannelProfile= asyncHandler(async(req,res)=>{
    const {userName}=req.params;
    if(!userName?.trim()){
        throw new ApiError(400,"UserName is missing in getUserChannelProfile")
    }

    const channel=await User.aggregate([
        {
            $match:{
                userName:userName?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400,"channel does not exists in getUserChannelProfile")
    }

    return res.status(200).json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )

})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, 
            user[0].watchHistory,
            "watch history fetched successfully"
            )
    )
})

export {registerUser, loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile, getWatchHistory};