import express from "express";
import bcrypt from 'bcrypt';
import cloudinary from 'cloudinary';
import { configDotenv } from "dotenv";
import User from '../models/Users_model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
configDotenv()

cloudinary.v2.config(
    {
        cloud_name:process.env.CLOUD_NAME,
        api_key:process.env.CLOUD_API_KEY,
        api_secret:process.env.CLOUD_API_SECRET,
        secure:true     
    }
)
const Router  = express.Router();

Router.post('/signup', async (req, res) => {
   try {
        const email= await User.find({email:req.body.email})
        const channelName= await User.find({channelName:req.body.channelName})

        if(email.length > 0|| channelName.length > 0){   
            if(email.length > 0){   
          return res.status(500).json({
            error:'email already exists'
          })
        }
        else{
            return res.status(500).json({
                error:'channel name already exists'
              })
        }
        }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const uploaded= await cloudinary.v2.uploader.upload(req.files.logo.tempFilePath)
      const newUser = new User({
        _id:new mongoose.Types.ObjectId(),
        channelName:req.body.channelName,
        email:req.body.email,
        phone:req.body.phone,
        password:hashedPassword,
        logoUrl:uploaded.secure_url,
        logoId:uploaded.public_id,
      })
      const user = await newUser.save()
      res.status(201).json({newUser:user})
        
         


   }
   catch (err) {
    console.log(err);
    res.status(500).json({error:err.message})   
   } 
     
});

Router.post('/login', async (req, res) => {
 try{
    const user = await User.find({email:req.body.email})
    if(user.length==0){
       return res.status(500).json({
        error:'user not found'
       })
    }

   const isValid = await bcrypt.compare(req.body.password,user[0].password)
   if(!isValid) {
    return res.status(500).json({
        error:'invalid password'
    })
    
   }

   const token = jwt.sign({
    _id:user[0]._id,
    channelName:user[0].channelName,
    email:user[0].email,
    phone:user[0].phone,
    logoId:user[0].logoId
    
   },  
   'this is a secret key$$$??//876777',
   {
    expiresIn:'365d'
   }
)
   res.status(200).json({
    _id:user[0]._id,
    channelName:user[0].channelName,
    email:user[0].email,
    phone:user[0].phone,
    logoId:user[0].logoId,
    logoUrl:user[0].logoUrl,
    token:token,
    subscribers:user[0].subscribers,
    subscribersCount:user[0].subscribersCount
    
   })


 }
 catch(err){        
    console.log(err);
    res.status(500).json({error:err.message})   
 }

})


export default Router;