
import fetchIdByName from "../../tester2.js";
import Problem from "../models/problem.js";
import {submitBatch} from "../utils/ProblemUtility.js";
import {submitToken} from "../utils/ProblemUtility.js";
import User from "../models/user.js";
 export const createProblem = async (req, res) => {
  try {
    const toBase64 = (str) =>
  Buffer.from(str, "utf-8").toString("base64");

      const {title,description,difficulty,tags, 
visibleTestCases, hiddenTestCases, startCode, referenceSolution , problemCreator ,bwrapp, twrapp
         } =             req.body;


        if (
  !title ||
  !description ||
  !difficulty ||
  !tags ||
  !visibleTestCases?.length ||
  !startCode?.length ||
  !referenceSolution?.length
)
 {
           return res.status(400).json({ message: "All fields are required" });
         }
    const submissions = [];

    for (const solution of referenceSolution) {
      const langId = fetchIdByName(solution.language);
      if (!langId) throw new Error("Unsupported language");

      for (const testCase of visibleTestCases) {
        if (!testCase.input || !testCase.output) {
          throw new Error("Test case input and output cannot be empty");
        }
      submissions.push({
  language_id: langId,
  source_code: toBase64(solution.completeCode),
  stdin: toBase64(String(testCase.input).trim()),
  expected_output: toBase64(String(testCase.output).trim())
});
      }
    }

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map(r => r.token);
    const testResult = await submitToken(tokens);
    
for (const test of testResult) {
  console.log("Full test result:", test); // Add this line
  if (test.status?.id !== 3) {
    console.log("Compile error:", test.compile_output);
    console.log("Stderr:", test.stderr);
    return res.status(400).json({
      message: "Reference solution failed test cases",
      error: test.compile_output || test.stderr
    });
  }
}

    await Problem.create({
      ...req.body,
      problemCreator: req.user._id
    });

    res.status(201).json({ message: "Problem created successfully" });

  } catch (err) {
    console.error("Create problem error:", err);
    res.status(500).json({ error: err.message });
  }
}




export const updateProblem = async (req, res) => {

  const    {id} = req.params;
        const {title,description,difficulty,tags, 
visibleTestCases, hiddenTestCases, startCode, referenceSolution , problemCreator ,bwrapp, twrapp 
         } =             req.body;

     if (
  !title ||
  !description ||
  !difficulty ||
  !tags ||
  !visibleTestCases?.length ||
  !startCode?.length ||
  !referenceSolution?.length
)
 {
           return res.status(400).json({ message: "All fields are required" });
         }

         if(!id){
          return res.status(400).json({ message: "Problem ID is required" });
         }

         const dsaproblem =  await Problem.findById(id);
         if(!dsaproblem){
          return res.status(404).json({ message: "Problem not found" });
         }


  try{
    const submissions = [];

    for (const solution of referenceSolution) {
      const langId = fetchIdByName(solution.language);
      if (!langId) throw new Error("Unsupported language");

      for (const testCase of visibleTestCases) {
        if (!testCase.input || !testCase.output) {
          throw new Error("Test case input and output cannot be empty");
        }



        submissions.push({
  language_id: langId,
  source_code: Buffer.from(solution.completeCode).toString("base64"),
  stdin: Buffer.from(String(testCase.input).trim()).toString("base64"),
  expected_output: Buffer.from(String(testCase.output).trim() + "\n").toString("base64")
});
      }
    }

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map(r => r.token);
    const testResult = await submitToken(tokens);

        
for (const test of testResult) {
  console.log("Full test result:", test); // Add this line
  if (test.status?.id !== 3) {
    console.log("Compile error:", test.compile_output);
    console.log("Stderr:", test.stderr);
    return res.status(400).json({
      message: "Reference solution failed test cases",
      error: test.compile_output || test.stderr
    });
  }
}


   const updatedProblem = await Problem.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
);
    // new: true gives the old document in return value 
    res.status(200).json({ message: "Problem updated successfully" });

  }

  catch(err){

    console.error("Update problem error:", err);
    res.status(500).json({ error: err.message });
  }




}


export const deleteProblem = async (req, res) => {

const {id} = req.params;
  if(!id){
    return res.status(400).json({ message: "Problem ID is required" });
  }
try{
  const dsaproblem =  await Problem.findByIdAndDelete(id);
  if(!dsaproblem){
    return res.status(404).json({ message: "Problem not found" });
  }
  res.status(200).json({ message: "Problem deleted successfully" });

}
  catch(err){
    res.status(500).json({ error: err.message });


}
}


export const getProblemById = async (req, res) => {
const {id} = req.params;
  if(!id){
    return res.status(400).json({ message: "Problem ID is required" });
  }
try{
  const dsaproblem =  await Problem.findById(id).select('-hiddenTestCases -problemCreator'); 
  if(!dsaproblem){
    return res.status(404).json({ message: "Problem not found" });
  }
  res.status(200).json({ problem : dsaproblem });

}
  catch(err){
    res.status(500).json({ error: err.message });


}


}


export const getAllProblem = async (req, res) => {

try{
  const problems =  await Problem.find({}).select(' _id title tags difficulty');
  if(!problems.length){
    return res.status(404).json({ message: "No problems found" });
  }

  res.status(200).json({ problem : problems  });
}
  catch(err){
    res.status(500).json({ error: err.message });
}
}


export const solvedProblemsByUser = async (req, res) => {
try{
  const userId = req.user._id;
  if(!userId){
      res.status(400).json({ error: "user id nahi mil rahi" });
  }
  console.log(userId)
  const user = await User.findById(userId).populate('problemSolved', '_id title difficulty tags');

  return res.status(200).json({ solvedProblems: user.problemSolved });

} catch(err){
    res.status(500).json({ error: err.message });
}

}

































// const submissions= [
//     {
//       "language_id": 46,
//       "source_code": "echo hello from Bash",
//       "stdin": "world",
//        "expected_output": "hello, world"

//     },
//     {
//       "language_id": 123456789,
//       "source_code": "print(\"hello from Python\")",
//        "stdin": "world",
//        "expected_output": "hello, world"


//     },
//     {
//       "language_id": 72,
//       "source_code": "",
//        "stdin": "world",
//        "expected_output": "hello, world"


//     }
//   ]

