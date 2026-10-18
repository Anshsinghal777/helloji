
import User from '../models/user.js';
import validate from '../utils/validator.js';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js';
import Submission from '../models/submission.js';
const register = async (req, res) => {

    try{

        validate(req.body);
        req.body.password = await bcrypt.hash(req.body.password, 10);
        req.body.role = 'user';

        
        const user = await User.create(req.body);
     const token =    jwt.sign({ emailID : req.body.emailID , role : "user"}, process.env.JWT_SECRET_KEY, {expiresIn : '1h'});
        res.cookie('token', token,  {maxAge : 60*60*1000});
         const reply = {
            emailID : user.emailID,
            firstName : user.firstName,
            _id : user._id,
            profile_pic : user.profilePicture,
            role :  user.role
            
        }
        res.status(200).json({user : reply,
            message : "User registered successfully"});
    }

    catch(err){
        res.status(400).json({message : "Internal Server Error", error : err.message});
    }


}


const login = async (req, res) => {

    try{
        const {emailID, password} = req.body;
        if(!emailID || !password){

            throw new Error('invalid credentials');
        }    

        const user = await User.findOne({emailID : emailID});
        if(!user){
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            throw new Error('Invalid credentials');
        }
        const token =    jwt.sign({ emailID : req.body.emailID , role : user.role}, process.env.JWT_SECRET_KEY, {expiresIn : '1h'});
        res.cookie('token', token,  {maxAge : 60*60*1000});
        const reply = {
            emailID : user.emailID,
            firstName : user.firstName,
            _id : user._id,
             profile_pic : user.profilePicture,
               role :  user.role
            
        }
        res.status(200).json({user : reply,
            message : "User logged in successfully"});

    }


    catch(err){
        res.status(400).json({message : "Internal Server Error", error : err.message});
    }
}

const logout = async (req, res) => {

    try{

        const { token } = req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token-${token}`, 'blocked');
            await redisClient.expireAt(`token-${token}`, payload.exp);
        res.clearCookie('token');
        res.status(200).json({message : "User logged out successfully"});
        


    }
    catch(err){
        res.status(400).json({message : "Internal Server Error", error : err.message});
}

}

const adminRegister = async (req, res) => {
  try{

        validate(req.body);
        req.body.password = await bcrypt.hash(req.body.password, 10);
        req.body.role = 'admin';

        
        const user = await User.create(req.body);
     const token =    jwt.sign({ emailID : req.body.emailID , role : "admin"}, process.env.JWT_SECRET_KEY, {expiresIn : '1h'});
        res.cookie('token', token,  {maxAge : 60*60*1000});
        res.status(201).json({message : "admin registered successfully"});
    }

    catch(err){
        res.status(400).json({message : "Internal Server Error", error : err.message});
    }
    


}


const deleteProfile = async (req, res) => {
try{

const id = req.user._id;
await User.findByIdAndDelete(id);
await Submission.deleteMany({userId : id});
res.status(200).json({message : "Profile deleted successfully"});



}

    catch(err){

res.status(400).json({message : "Internal Server Error", error : err.message});
    }



}

const submittedProblem = async (req, res) => {
try{

    const userId = req.user._id;
    const problemId =  req.params.pid;
    const ans = await Submission.find({userId  ,  problemId});
    res.status(200).json({submissions : ans} );
    if( ans.length === 0){
        return res.status(404).json({message : "No submissions found for this problem"});
    }
}

    catch(err){
res.status(400).json({message : "Internal Server Error", error : err.message});
    }
}


export { register, login , logout , adminRegister , deleteProfile, submittedProblem}; 