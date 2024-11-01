import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const matchCriteria = {}
    if(query){
        matchCriteria.title = {$regex: query, $options: "i"} // case insensitive search
    }
    if( userId && isValidObjectId(userId)){
        matchCriteria.owner = userId
    }

    const sortCriteria = {[sortBy]: sortType === "desc" ? -1 : 1}

    const options = {
        page: parseInt(page, 1),
        limit: parseInt(limit, 10),
        sort: sortCriteria
    }

    const videos = await Video.aggregatePaginate(
        Video.aggregate([
            {$match: matchCriteria}
        ]), options
    )

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    // TODO: get video, upload to cloudinary, create video

    const videoFiles = req.files["videoFile"]
    const thumbnailFiles = req.files["thumbnail"]

    if(!videoFiles || !videoFiles.length){
        throw new ApiError(400, "No video file uploaded")
    }
    if(!thumbnailFiles || !thumbnailFiles.length){
        throw new ApiError(400, "No thumbnail file uploaded")
    }

    const uploadedVideo = await uploadOnCloudinary(videoFiles[0].path, "video")

    if (!uploadedVideo) {
        throw new ApiError(404, "Video upload failed");
    }
    const thumbnail = thumbnailFiles[0].path || uploadedVideo.url

    const video = new Video({
        videoFile: uploadedVideo.url,
        thumbnail,
        title,
        description,
        duration: uploadedVideo.duration,
        owner: req.user._id
    })

    await video.save()

    return res
        .status(200)
        .json(200, video, "Video Published Successfully")
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id")
    }

    const video = await Video.findById(videoId).populate("owner", "fullName, email")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const {title, description, thumbnail} = req.body

    const updates = {title, description}

    if(thumbnail) updates.thumbnail = thumbnail

    const video = await Video.findOneAndUpdate(
        {_id: videoId, owner: req.user._id},
        updates,
        {new: true}
    )

    if (!video) {
        throw new ApiError(404, "Video not found or user not authorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Updated successfully!"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findOneAndDelete(
        {_id: videoId, owner: req.user._id}
    )
    if(!video){
        throw new ApiError(404, "Video not found or user not authorized")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Vidoe deletd successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findOne({_id: videoId, owner: req.user._id})

    if (!video) {
        throw new ApiError(404, "video not found or user not authorized")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, {isPublished: video.isPublished}, "Publish status updated"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}