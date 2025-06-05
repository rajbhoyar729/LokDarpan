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


Router.put('/:videoId',checkAuth,async(req,res)=>{
try{
   const verified_user =  await jwt.verfy(req.header.authorization.split(" ")[1],process.env.JWT_SECRET)
   const video = await  Video.findById(req.params.videoId)
   if(video.user_id==verified_user._id){
       if (req.files){
       await cloudinary.uploader.description(video.thumbnailId)
       const updatedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
       const updatedData= {
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
        tags:req.body.tags.split(','),
        thumbnailUrl:updatedThumbnail.secure_url,
        thumbnailId:updatedThumbnail.public_id,
       }
      const update_Video_Report= await Video.findByIdAndUpdate(req.params.videoId,updatedData)
      return res.status(200).json({
        message:"video updated successfully",
        updatedData:update_Video_Report
      })
       }
       
       else{
             
          const updatedData= {
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
        tags:req.body.tags.split(','),
       }
       const updated_Data_Report = await Video.findByIdAndUpdate(req.params.videoId,updatedData)
       return res.status(200).json({
        message:"Data updated successfully",
        updatedData:updated_Data_Report 
       })

       }
   }
   else{
     return res.status(500).json({
      error:"you have the owership/permissions to make changes in to it "
     })
   }
}
catch(err){
    return res.status(500).json({error: err.message});  
}

})

Router.delete('/:videoId', checkAuth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verified_user = await jwt.verify(token, process.env.JWT_SECRET);
        const video = await Video.findById(req.params.videoId);

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        if (video.user_id.toString() === verified_user._id.toString()) {
            // Delete video and thumbnail from Cloudinary
            await cloudinary.v2.uploader.destroy(video.videoId, { resource_type: 'video' });
            await cloudinary.v2.uploader.destroy(video.thumbnailId);

            // Delete video from database
            await Video.findByIdAndDelete(req.params.videoId);

            return res.status(200).json({ message: "Video deleted successfully" });
        } else {
            return res.status(403).json({ error: "You do not have permission to delete this video" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

Router.put('/:videoId/like', checkAuth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verified_user = await jwt.verify(token, process.env.JWT_SECRET);
        const video = await Video.findById(req.params.videoId);

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        const userId = verified_user._id;

        // Check if the user has already liked the video
        if (video.likedBy.includes(userId)) {
            // User already liked, so unlike it
            video.likedBy.pull(userId);
            video.likes--;
            await video.save();
            return res.status(200).json({ message: "Video unliked successfully" });
        }

        // If user disliked the video, remove the dislike first
        if (video.dislikedBy.includes(userId)) {
            video.dislikedBy.pull(userId);
            video.dislikes--;
        }

        // Add like
        video.likedBy.push(userId);
        video.likes++;
        await video.save();

        return res.status(200).json({ message: "Video liked successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

Router.put('/:videoId/dislike', checkAuth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verified_user = await jwt.verify(token, process.env.JWT_SECRET);
        const video = await Video.findById(req.params.videoId);

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        const userId = verified_user._id;

        // Check if the user has already disliked the video
        if (video.dislikedBy.includes(userId)) {
            // User already disliked, so undislike it
            video.dislikedBy.pull(userId);
            video.dislikes--;
            await video.save();
            return res.status(200).json({ message: "Video undisliked successfully" });
        }

        // If user liked the video, remove the like first
        if (video.likedBy.includes(userId)) {
            video.likedBy.pull(userId);
            video.likes--;
        }

        // Add dislike
        video.dislikedBy.push(userId);
        video.dislikes++;
        await video.save();

        return res.status(200).json({ message: "Video disliked successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default Router;