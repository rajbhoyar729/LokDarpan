import mongoose from "mongoose";
import Users from "../models/Users_model.js";

const videoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{type:String,required:true},
    description:{type:String,required:true},
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    videoUrl:{type:String,required:true},
    videoId:{type:String,required:true},
    thumbnailUrl:{type:String,required:true},
    thumbnailId:{type:String,required:true},
    category:{type:String,required:true},
    tags:[{type:String,required:true}],
    likes:{type:Number,default:0},
    dislikes:{type:Number,default:0},
    likedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    dislikedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    comments:[{type:mongoose.Schema.Types.ObjectId,ref:'Comment'}],
    views:{type:Number,default:0},
    viewedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],

    


},{timestamps:true})


export default mongoose.model('Video',videoSchema); 