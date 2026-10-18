
import dotenv from "dotenv";
dotenv.config();
import main from "../config/db.js";
import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import { ChatGoogleGenerativeAI }
from "@langchain/google-genai";

await main();
console.log("ENV:", process.env.DB_CONNECT_STRING);
export const model =
new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: "AIzaSyBbli9rHu-DPAcLI7qxsT6Tpq_xiN3FJK8",
});   




  
 

//  console.log(result.content);

 const problems = await Problem.find();


 const prompt = `
These are DSA problems from my platform:

${JSON.stringify(problems)}

Analyze:

1. What topics are covered?
2. Difficulty distribution
3. Missing important DSA topics
4. Suggest 5 new problems to add.
`;
const response = await model.invoke(prompt);

console.log(response.content);
// console.log(problems);



