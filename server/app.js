import express from "express";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import userRoute  from "./routes/user.js";
//import commentRoute from "./routes/comment.js";
import videoRoute from "./routes/video.js";
import bodyParser from "body-parser";
import expressfileUpload from "express-fileupload";

configDotenv()
const app = express();

(async ()=>{
try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("database connections has been initiated ...")

}
catch(err){
    console.error("MongoDB connection error:",err);
}
})();

app.use(bodyParser.json());
app.use(expressfileUpload(
        {
            useTempFiles:true,
        }
));


app.use('/user',userRoute)
app.use('/video',videoRoute)
//app.use('/comment',commentRoute)


export default app; 