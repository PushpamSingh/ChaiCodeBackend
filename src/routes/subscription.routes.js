import express from "express";
import { VeryfyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = express.Router();

router.route("/togglesubscription/:channelId").post(VeryfyJWT,toggleSubscription);
router.route("/getuserchannelsubscriber/:channelId").get(VeryfyJWT,getUserChannelSubscribers);
router.route("/getsubscribedchannel/:subscriberId").get(VeryfyJWT,getSubscribedChannels);

export default router;