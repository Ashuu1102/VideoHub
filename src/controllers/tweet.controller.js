import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const userId = req.user._id

    if(!content){
        throw new ApiError(400, "Tweet cannot be empty")
    }
    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(404, "User not found")
    }
    const tweet = await Tweet.create({
        content,
        owner: userId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    
    if(isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {owner: mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "user.fullName": 1,
                "user.username": 1
            }
        }
    ])

    if(!tweets.length){
        throw new ApiError(404, tweets, "No tweets found")
    }

    return res 
        .status(200)
        .json(new ApiResponse(200, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Updated content is required")
    }

    const tweet = await Tweet.findOneAndUpdate(
        {_id: tweetId, owner: req.user._id},
        {content},
        {new: true}
    )

    if(!tweet){
        throw new ApiError(404, "Tweet not found or user not authorized")
    }

    return res  
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params

    const tweet = await Tweet.findOneAndDelete(
        {_id: tweetId, owner: req.user._id}
    )

    if(!tweet){
        throw new ApiError(404, "Tweet not found or user not authorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet deletd successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}