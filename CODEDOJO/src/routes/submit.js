

import express from 'express';
import userMiddleware from '../middleware/userMiddleware.js';
import { submitCode , runCode} from '../controllers/userSubmission.js';


import Submission from '../models/submission.js';





const submitRouter = express.Router();



submitRouter.post('/submit/:id',userMiddleware, submitCode);
submitRouter.post('/run/:id',userMiddleware, runCode);
submitRouter.post('/solvedoubt', userMiddleware, submitCode);
submitRouter.get('/:problemId', userMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;

    const submissions = await Submission.find({ problemId })
      .select('problemId status runtime memory testCasesPassed testCasesTotal')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);

  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

export default submitRouter;
