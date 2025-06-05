import express from "express";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import userRoute  from "./routes/user.js";
import commentRoute from "./routes/comments.js";
import videoRoute from "./routes/video.js";
import bodyParser from "body-parser";
import expressfileUpload from "express-fileupload";
import cors from 'cors';
import helmet from 'helmet';

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

app.use(cors());
app.use(helmet());

app.use('/user',userRoute)
app.use('/video',videoRoute)
app.use('/comment',commentRoute)

app.use((error, req, res, next) => {
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

export default app; 