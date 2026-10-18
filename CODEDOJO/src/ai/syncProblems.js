import dotenv from "dotenv";
dotenv.config();

import { Pinecone } from "@pinecone-database/pinecone";
import index from "./pinecone.js"; // Assuming this exports a Pinecone Index instance

const pc = new Pinecone({
  apiKey: 'pcsk_4oPd6X_KHiCQrF5MguP1YtgeqwzpWt533wKfkgJ65YU8RoNgvbonPPthbS5eqBsA1iMACG'
});

import main from "../config/db.js";
import Problem from "../models/problem.js";

await main();

console.log("MongoDB Connected");

const problems = await Problem.find();

console.log("Problems Found:", problems.length);

if (problems.length === 0) {
    console.log("No problems found in the database. Exiting.");
    process.exit(0); // Exit if no problems to process
}

// const firstProblem = problems[0];

const records = [];

for (const problem of problems) {

  const text = `
Title: ${problem.title}

Difficulty: ${problem.difficulty}

Tags: ${problem.tags.join(", ")}

Description:
${problem.description}
`;

  const embeddingResponse = await pc.inference.embed({
    model: "multilingual-e5-large",
    inputs: [text],
    parameters: {
      input_type: "passage",
    },
  });

  const vector = embeddingResponse.data[0].values;

  records.push({
    id: problem._id.toString(),
    values: vector,
    metadata: {
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
    }
  });

  console.log(`Prepared: ${problem.title}`);
}

console.log("Records Prepared:", records.length);

await index.upsert({
  records
});

console.log("All Problems Uploaded Successfully");

// console.log("Problem ID:", firstProblem._id.toString());