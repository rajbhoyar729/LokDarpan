import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    comment_text: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
