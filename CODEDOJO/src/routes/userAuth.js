import express from 'express';
import { register, login ,logout , adminRegister, deleteProfile, submittedProblem} from '../controllers/userAuthent.js';

import userMiddleware from '../middleware/userMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const authRouter = express.Router();



// register


authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.post('/admin/register',adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile',userMiddleware, deleteProfile);
authRouter.get('/submittedProblem/:pid', userMiddleware, submittedProblem);
authRouter.get('/check' , userMiddleware, (req,res)=>{
     try {
        const reply = {
            emailID : req.user.emailID,
            firstName : req.user.firstName,
            _id : req.user._id
            
        }
       res.status(200).json({user : reply,
            message : "valid user"});
       } catch(err){
   res.status(401).json({message : `user not authenticated ${err}`})
       }
})
// authRouter.get('/getprofile', getProfile);
// login
// logout
// getProfile

export default authRouter;