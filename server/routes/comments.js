import express from 'express'
import checkAuth from "../middleware/checkAuth.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Video from "../models/Video_model.js";
import Comment from "../models/Comments.js";

const Router= express.Router();

Router.post('/:videoId/comments', checkAuth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verified_user = await jwt.verify(token, process.env.JWT_SECRET);
        const { comment_text } = req.body;
        const videoId = req.params.videoId;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            user_id: verified_user._id,
            video_id: videoId,
            comment_text: comment_text,
        });

        const savedComment = await newComment.save();

        video.comments.push(savedComment._id);
        await video.save();

        res.status(201).json({ message: "Comment added successfully", comment: savedComment });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

Router.put('/:commentId', checkAuth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verified_user = await jwt.verify(token, process.env.JWT_SECRET);
        const { comment_text } = req.body;
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.user_id.toString() !== verified_user._id.toString()) {
            return res.status(403).json({ error: "You do not have permission to update this comment" });
        }

        comment.comment_text = comment_text;
        const updatedComment = await comment.save();

        res.status(200).json({ message: "Comment updated successfully", comment: updatedComment });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

Router.delete('/:commentId', checkAuth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verified_user = await jwt.verify(token, process.env.JWT_SECRET);
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.user_id.toString() !== verified_user._id.toString()) {
            return res.status(403).json({ error: "You do not have permission to delete this comment" });
        }

        // Remove comment from video's comments array
        const video = await Video.findById(comment.video_id);
        if (video) {
            video.comments.pull(commentId);
            await video.save();
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default Router;