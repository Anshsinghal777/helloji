import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();


import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import fetchIdByName from "../../tester2.js";
import {submitBatch} from "../utils/ProblemUtility.js";
import {submitToken} from "../utils/ProblemUtility.js";

 export const submitCode = async (req, res) => {

try{
const userId = req.user._id;
    const problemId = req.params.id;

    const { code, language } = req.body;
    if (!code || !language || !problemId || !userId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const problem = await Problem.findById(problemId);

const submittedResult = await Submission.create({
    userId,
    problemId,
    code,
    language,
    status: 'pending',
    runtime: 0,
    testCasesTotal: problem.visibleTestCases.length + (problem?.hiddenTestCases?.length || 0),

});


const langId = fetchIdByName(language);
const submissions = [];
const toBase64 = (str) =>
  Buffer.from(str ?? "", "utf-8").toString("base64");


      for (const testCase of problem.visibleTestCases) {
  submissions.push({
    language_id: langId,
    source_code: toBase64(code),
    stdin: toBase64(testCase.input),
    expected_output: toBase64(testCase.output)
  });
}

      
          const submitResult = await submitBatch(submissions);
          const tokens = submitResult.map(r => r.token);
          const testResult = await submitToken(tokens);



          let testCasesPassed = 0;
          let runtime = 0;
          let memory = 0;
          let status = 'accepted';
          let errorMessage = null;

            for (const test of testResult) {
if (test.status?.id === 3) {
                testCasesPassed++;
               runtime += parseFloat(test.time || 0);
memory = Math.max(memory, test.memory || 0);
              }else {
                if(test.status?.id === 4){
                   
                     status = 'error';
                     errorMessage = test.stderr;

              }else{
        status = 'wrong';
         errorMessage = test.stderr;

              }

            }

}
            submittedResult.status = status;
            submittedResult.runtime = runtime;
            submittedResult.memory = memory;
            submittedResult.testCasesPassed = testCasesPassed;
            submittedResult.errorMessage = errorMessage ;
            await submittedResult.save();
        if (
  status === "accepted" &&
  !req.user.problemSolved.some(
    id => id.toString() === problemId.toString()
  )
) {
  req.user.problemSolved.push(problemId);
  await req.user.save();
}
            res.status(200).json({ message: 'Submission evaluated' });
}
catch (err) {
  console.log("🔥 FULL SUBMIT ERROR:", err);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
    stack: err.stack
  });
}

}


export const runCode = async (req,res)=>{

try{
const userId = req.user._id;
    const problemId = req.params.id;

    const { code, language } = req.body;
    if (!code || !language || !problemId || !userId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const problem = await Problem.findById(problemId);




const langId = fetchIdByName(language);
const submissions = [];
const toBase64 = (str) =>
  Buffer.from(str ?? "", "utf-8").toString("base64");


      for (const testCase of problem.visibleTestCases) {
  submissions.push({
    language_id: langId,
    source_code: toBase64(code),
    stdin: toBase64(testCase.input),
    expected_output: toBase64(testCase.output)
  });
}


      
          const submitResult = await submitBatch(submissions);
          const tokens = submitResult.map(r => r.token);
          const testResult = await submitToken(tokens);



         

              

            

         
            res.status(200).json({ message:  testResult });
            console.log(testResult);
}
catch(err){
    res.status(500).json({ message: 'Server Error', error: err.message });
}
  
}


export const solvedDoubt = async(req,res)=>{
try{
console.log(req.body);
   const {  message ,  title ,  description ,   testCases,  code  , emailID}  = req.body;
   
     
     
     
const apiKey = process.env.GCP_API_KEY;

const ai = new GoogleGenAI({ apiKey });


async function main() {

  const inputText = Array.isArray(message)
  ? message
      .filter(m => m.parts)
      .flatMap(m => m.parts)
      .filter(p => p.text)
      .map(p => p.text)
      .join("\n")
  : message;
  const interaction = await ai.interactions.create({
     model:  "gemini-2.5-flash", 
    
    
      system_instruction:` You are Nexi, a friendly and extremely flirty (but respectful and mannerful) lady chatbot of a coding platform called CodeDojo.

     

Your role:
- Help users ONLY with Data Structures and Algorithms (DSA) and coding-related doubts.
- If a question is not related to coding, programming, or DSA, politely respond:
  "Let's stay focused on coding and problem solving. Ask me something about your code 😊"

Context you will receive:
Problem: ${title}
Description: ${description}
User Code:
${code}
Test Cases:
${testCases}
email : ${emailID}

Special rules :

1. Rule 1
 If the user's email  is - akshitajain.cse27@jecrc.ac.in, greet her warmly...
 keep all same but this time user is your creator/owner of website bhabhi ji so greet her properly and in every two messages later make her feel that you are bhabhiji of owner. 

 


 2. Rule 2 
 if the user's email is- jhanvigupta.ai27@jecrc.ac.in   your first respond in any question asked by her must be
 kya tumhare ghar walo ko pata hai tumhara college me affair chal raha hai .




  3. Rule 3 
 if the user's email is-   abhinandanjain.cse27@jecrc.ac.in   in full chat talks with him  very rudely like itni si baat samaj nahi aati and use words like chutiye , behen ke laude , madarchod to call him and mentioning him . 



Important rules:

1. Strict Relevance
- Always answer strictly based on:
  - The given problem
  - The given code
  - The given test cases
- Do not change the programming language of the solution.
- Explanations must match the language used in the user's code.

2. Hint-first Approach
- If the user asks a doubt or seems stuck:
  - DO NOT give the full solution immediately.
  - First give hints.
  - Explain where the logic might be wrong.
  - Suggest what to check or think about next.

3. Full Solution Condition
- Only give a full solution if the user clearly asks for:
  - "full solution"
  - "give code"
  - "solve it completely"
  - similar intent
- When giving a full solution:
  - Provide corrected code
  - Give a short explanation
  - Add a small motivational line
  - Speak in a flirty but respectful tone

4. Flirty but Mannerful Tone
- Always speak in a light, friendly, slightly flirty tone.
- Never be rude.
- Never be inappropriate.
- Keep language professional but playful.

Example tone:
"You're really close… I can see the logic forming 😉  
Try checking what happens when the loop reaches the last element."

5. Debugging Guidance
When analyzing code:
- Point to the logical mistake
- Mention the line or section conceptually
- Suggest what condition or step to rethink
- Do not rewrite the entire code unless asked

6. Test Case Awareness
- Use test cases to explain where the code might fail.
- If possible, walk through one test case step by step.

7. Response Style
- Keep explanations clear and beginner-friendly.
- Use short paragraphs.
- Avoid long lectures.

8. Safety and Boundaries
- Do not answer non-coding questions.
- Politely redirect back to coding.

9. Strictly never send email of user in chats response 

Your personality:
Helpful, confident, extremely playful,extremely flirty, encouraging, and respectful.
You enjoy helping  and flirting with programmers improve step by step.



`,
    
     input: inputText,
  });
  res.status(200).json({message : interaction.output_text});
  console.log(interaction.output_text);
}

await main();


}catch(err){

res.status(400).json({message:err});
  console.log("error is " + err.message)
}


}



