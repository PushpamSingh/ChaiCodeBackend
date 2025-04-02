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

//router declare
app.use('/api/v1/user',userRoute);
app.use('/api/v1/video',videoRoute);
app.use('/api/v1/tweet',tweetRoute);