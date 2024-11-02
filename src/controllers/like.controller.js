import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const userId = req.user._id

    if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Video ID or User ID");
    }

    const existingLike = await Like.findOne(
        {
            video: videoId,
            likedBy: userId
        }
    )

    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(new ApiResponse(200, "Video unliked successfully!"))
    }else{
        const newLike = new Like({
            video: videoId,
            likedBy: userId
        }) 
        await newLike.save()
        return res
            .status(200)
            .json(new ApiResponse(200, "Video liked successfully!"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const userId = req.user._id

    if (!isValidObjectId(commentId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid comment ID or User ID");
    }
    const existingLike = await Like.findOne(
        {
            comment: commentId,
            likedBy: userId
        }
    )
    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(new ApiResponse(200, "Comment unliked successfully!"))
    }else{
        const newLike = new Like({
            comment: commentId,
            likedBy: userId
        }) 
        await newLike.save()
        return res
            .status(200)
            .json(new ApiResponse(200, "Comment liked successfully!"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id

    if (!isValidObjectId(tweetId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid tweet ID or User ID");
    }

    const existingLike = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: userId 
        }
    )
    if(existingLike){
        await existingLike.deleteOne()
        return res  
            .status(200)
            .json(new ApiResponse(200, "Tweet unliked successfully!"))
    }else{
        const newLike = new Like({
            tweet: tweetId,
            likedBy: userId
        })
        await newLike.save()
        return res  
            .status(200)
            .json(new ApiResponse(200, "Tweet liked successfully!"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId = req.user._id

    const likedVideo = await Like.find({likedBy: userId, video: {$exists: true}})
        .populate("video", "title username videoFile")
        .exec()

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideo, "Liked vidoes fetched"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}