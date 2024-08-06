import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const healthcheck=asyncHandler(async(req,res)=>{
    //todo: build a helthcheck response that simply returns the OK staus as json with a message
})

export { healthcheck }
