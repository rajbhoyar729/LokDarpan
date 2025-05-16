import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import Video from "../models/Video_model.js";



configDotenv()
cloudinary.v2.config(
    {
        cloud_name:process.env.CLOUD_NAME,
        api_key:process.env.CLOUD_API_KEY,
        api_secret:process.env.CLOUD_API_SECRET,
        secure:true     
    }
)
const Router = express.Router();

Router.post('/upload',checkAuth , async(req, res) => {
    try{
       const token = req.headers.authorization.split(' ')[1];
       const  user = await jwt.verify(token,process.env.JWT_SECRET)
       const uploadedVideo = await cloudinary.v2.uploader.upload(req.files.video.tempFilePath,{resource_type:'video'})
       const uploadedThumbnail = await cloudinary.v2.uploader.upload(req.files.thumbnail.tempFilePath)
       const newVideo = new Video({
        _id:new mongoose.Types.ObjectId(),
        title:req.body.title,
        description:req.body.description,
            description:req.body.description,
            user_id:user._id,
            videoUrl:uploadedVideo.secure_url,
            videoId:uploadedVideo.public_id,
            thumbnailUrl:uploadedThumbnail.secure_url,
            thumbnailId:uploadedThumbnail.public_id,
            category:req.body.category,
            tags:req.body.tags.split(','),

      })

      const video = await newVideo.save();
      res.status(201).json({
        message: "Video uploaded successfully",
        videoId: video._id
      });

    }
    catch(err){
      return res.status(500).json({error: err.message});
    }

})





export default Router;