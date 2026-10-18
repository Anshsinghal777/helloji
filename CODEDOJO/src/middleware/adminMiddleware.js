
import User from "../models/user.js";
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js';



const adminMiddleware =  async (req, res, next) => {


try{
const { token } = req.cookies;
        if(!token){
            throw new Error('No token found');
        }
      const payload =  jwt.verify(token, process.env.JWT_SECRET_KEY);
           const id = payload.emailID;
           const user = await User.findOne({emailID : id});
                   if(!user){
                       throw new Error('User not found');
                   }
                     if(user.role !== 'admin'){
                        throw new Error('Access denied. Admins only');
                     }
                   const IsBlocked =  await redisClient.exists(`token-${token}`);
                   if(IsBlocked){
                    throw new Error('token is blocked');
                   }
                     req.user = user;




                   next();



    }    catch(err){
        res.status(401).json({message : "Unauthorized", error : err.message});
    }


}
export default adminMiddleware;