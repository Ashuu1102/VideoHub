import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { application } from "express"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    const subscriberId = req.user._id

    if(!isValidObjectId(channelId) || (!isValidObjectId(subscriberId))){
        throw new ApiError(400, "Invalid Channel ID or subscriber ID")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if(existingSubscription){
        await existingSubscription.deleteOne()
        return res
            .status(200)
            .json(new ApiResponse(200, "Unsubscribed successfully!"))
    }else{
        const newSubscription = new Subscription({
            subscriber: subscriberId,
            channel: channelId
        })
        await newSubscription.save()
        
        return res
            .status(200)
            .json(new ApiResponse(200, "Subscribed successfully!"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channelId")
    }

    const subscribers = await Subscription.find({channel: channelId})
            .populate("subscriber", "username email")
            .exec()
    
    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscriber list fetched!"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }

    const subscriptions = await Subscription.find({subscriber: subscriberId})
            .populate("channel", "username email")
            .exec()

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Channel list fetched sucessfully!"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}