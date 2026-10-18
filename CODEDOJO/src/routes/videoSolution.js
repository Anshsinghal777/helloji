import express from 'express';
import adminMiddleware from '../middleware/userMiddleware.js';
const videoRouter =  express.Router();
import {generateUploadSignature,saveVideoMetadata,deleteVideo}  from "../controllers/videoSection.js"
import userMiddleware from '../middleware/userMiddleware.js';
import SolutionVideo from '../models/solutionVideo.js';

videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete/:problemId",adminMiddleware,deleteVideo);
videoRouter.get("/fetch/:problemId", userMiddleware, (req, res) => {
  const problemId = req.params.problemId;
  
  SolutionVideo.findOne({ problemId: problemId })  // Use findOne to get single video
    .then((video) => {
      if (!video) {
        return res.status(404).json({ message: "No video found for this problem" });
      }
      
      // Return only the secureUrl for frontend display
      res.json({ 
        secureUrl: video.secureUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        videoId: video._id
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching video", error: error.message });
    });
});


export default videoRouter;