import express from "express";
import { VeryfyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router=express.Router();

router.route("/getchannelstats").get(VeryfyJWT,getChannelStats);
router.route("/getchannelvideos/:channelId").get(VeryfyJWT,getChannelVideos);

export default router;