import { isValidObjectId } from "mongoose";
import { Subscribe } from "../models/subscribe.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params
        // TODO: toggle subscription
        const userId=req.user._id;
        if(!isValidObjectId(channelId)){
            throw new ApiError(400,"Invalid channelId");
        }
        if(!isValidObjectId(userId)){
            throw new ApiError(400,"need to be logged in");
        }
        //? validate that user cannot subscribe thier own channel
        if(channelId.toString()===userId.toString()){
            throw new ApiError(401,"you cannot subscribe your own channel")
        }

        //? find the channel that user are subscribed 
        const chanel = await Subscribe.findOne({chanel:channelId,subscribe:userId});
        if(!chanel){
            const newSubscribe=await Subscribe.create({
                chanel:channelId,subscribe:userId
            })
    
            if(!newSubscribe){
                throw new ApiError(502,"Failed to subscribe");
            }
    
            return res.status(201)
            .json(
                new ApiResponce(
                    200,
                    {
                        newSubscribe,
                        subscribe:true
    
                    },
                    "subscribe successfuly"
                )
            )
        }else{
            const unSubscribe = await Subscribe.findOneAndDelete({chanel:channelId,subscribe:userId});
            if(!unSubscribe){
                throw new ApiError(502,"Failed to unSubscribe");
            }
    
            return res.status(201)
            .json(
                new ApiResponce(
                    200,
                    {
                        unSubscribe,
                        subscribe:false
    
                    },
                    "unSubscribe successfuly"
                )
            )
    
        }
    
    } catch (error) {
        console.log("Error in toggle subscribe: ",error);
        throw new ApiError(500,"Internal server error !! while toggling subscribe")        
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params;
        if(!isValidObjectId(channelId)){
            throw new ApiError(400,"Invalid channel Id");
        }

        //? find the channel documents present in the database
        const subscriberList=await Subscribe.find({chanel:channelId});
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                {
                    subscriberListcount:subscriberList?.length,
                    subscriberList
                },
                "Subscriber fetched successfuly"
            )
        )
    } catch (error) {
        console.log("Error in get user channel subscribe: ",error);
        throw new ApiError(500,"Internal server error !! while get user channel subscribe") 
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const { subscriberId } = req.params;
        if(!isValidObjectId(subscriberId)){
            throw new ApiError(400,"Invalid subscriber Id")
        }
        //? find the subscribed channel by the user
        const channelList=await Subscribe.find({subscribe:subscriberId});
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                {
                    channelListCount:channelList?.length,
                    channelList
                },
                "Channel list fetched successfuly"
            )
        )
    } catch (error) {
        console.log("Error in getSubscribedChannels: ",error);
        throw new ApiError(500,"Internal server error !! while getSubscribedChannels") 
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}