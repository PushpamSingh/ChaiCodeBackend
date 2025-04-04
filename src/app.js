import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
export const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    optionsSuccessStatus: 204,
    credentials:true
}))
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser());

//router import 
import userRoute from './routes/user.routes.js';
import videoRoute from './routes/video.route.js';
import tweetRoute from './routes/tweet.routes.js';
import subscriptionroute from './routes/subscription.routes.js';
import playlistroute from './routes/plalist.routes.js';
import commentroute from './routes/comment.routes.js';
import likeroute from './routes/likes.routes.js';
import dashboardroute from './routes/dashboard.routes.js';

//router declare
app.use('/api/v1/user',userRoute);
app.use('/api/v1/video',videoRoute);
app.use('/api/v1/tweet',tweetRoute);
app.use('/api/v1/subscribe',subscriptionroute);
app.use('/api/v1/playlist',playlistroute);
app.use('/api/v1/comment',commentroute);
app.use('/api/v1/like',likeroute);
app.use('/api/v1/dashboard',dashboardroute);