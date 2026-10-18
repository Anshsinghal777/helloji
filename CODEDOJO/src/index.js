
import dotenv from 'dotenv';
dotenv.config();
console.log('DB_CONNECT_STRING:', process.env.DB_CONNECT_STRING);

import express from 'express';

import main from './config/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/userAuth.js';
import redisClient from './config/redis.js';
import problemRouter from './routes/problemCreator.js';
import submitRouter from './routes/submit.js';
import cors from 'cors';
import userMiddleware from './middleware/userMiddleware.js';
import { solvedDoubt } from './controllers/userSubmission.js';
import videoRouter from './routes/videoSolution.js';





const app = express();
app.use(cors({
    origin : ['http://localhost:5173', 'http://localhost:5174'],
    credentials : true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.post("/chat/ai" , userMiddleware , solvedDoubt)
app.use('/video' ,videoRouter )

const InitializeConnections = async () => {
    try{
       await Promise.allSettled([
        main(),
        redisClient.connect().catch(err => {
            console.log("Redis connection failed, continuing without Redis:", err.message);
        })
       ]);
       console.log("All connections established successfully");
         app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });


    }    catch(err){
        console.log("Failed to connect", err);
       
    }

}
InitializeConnections();


// git status
// git add .
// git commit -m "updated UI and fixed navbar"
// git push



// pcsk_3xavHU_PvVyasHZ1P8oNKM1r77pcYpfjJeeeZscSUk5N8xeZUmvnQgbgWtFE9khkL7N4Xc



// pcsk_4oPd6X_KHiCQrF5MguP1YtgeqwzpWt533wKfkgJ65YU8RoNgvbonPPthbS5eqBsA1iMACG



// import { Pinecone } from '@pinecone-database/pinecone';

// const pc = new Pinecone({
//   apiKey: '******************'
// });
// const index = pc.index('quickstart');


