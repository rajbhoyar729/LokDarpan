import jwt from 'jsonwebtoken';
import Configdotenv from 'dotenv';
Configdotenv.config();

export default  async(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(' ')[1];
         await jwt.verify(token,process.env.JWT_SECRET)
         next();


            
    }

    catch(err){
        return res.this.status(500).json({
            error:err.message
        })
    }
   
}

   