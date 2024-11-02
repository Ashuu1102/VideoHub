import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id")
    }

    const options = {
        page: parseInt(page, 1),
        limit: parseInt(limit, 10),
        populate: [{path: "owner", select: "username"}]
    }

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match:  {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            }
        ]), options
    )

    if (!comments) {
        throw new ApiError(404, "Unabel to fetch comments")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully!"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params
    const {content} = req.body
    const ownerId = req.user._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    if (!content || content.trim() == "") {
        throw new ApiError(400, "Comment cannot be empty")
    }

    const newComment = new Comment(
        {
            content,
            video: videoId,
            owner: ownerId
        }
    )
    await newComment.save()

    return res
        .status(200)
        .json(new ApiResponse(200, newComment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId} = req.params
    const {content} = req.body
    const ownerId = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }

    if (!content || content.trim() == "") {
        throw new ApiError(400, "Comment cannot be empty")
    }

    const comment = await Comment.findOneAndUpdate(
        {_id: commentId, owner: ownerId},
        {content},
        {new: true}
    )

    if (!comment) {
        throw new ApiError(404, "Comment not updated")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment Updated successfully!"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params
    const ownerId = req.user._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findOneAndDelete(
        {_id: commentId, owner: ownerId}    
    )
    if (!comment) {
        throw new ApiError(404, "Comment not deleted")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment deleted successfully!"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }