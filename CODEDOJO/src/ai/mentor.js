import main from "../config/db.js";
import { Pinecone } from '@pinecone-database/pinecone';
import Submission from "../models/submission.js";
import index from "./pinecone.js";
await main();


const pc = new Pinecone({
  apiKey: 'pcsk_4oPd6X_KHiCQrF5MguP1YtgeqwzpWt533wKfkgJ65YU8RoNgvbonPPthbS5eqBsA1iMACG'
});



const query = "binary search";

const embedding = await pc.inference.embed({
  model: "multilingual-e5-large",
  inputs: [query],
  parameters: {
    input_type: "query",
  },
});

console.log(
  embedding.data[0].values.length
);

const vector = embedding.data[0].values;

const results = await index.query({
  vector,
  topK: 3,
  includeMetadata: true,
});

results.matches.forEach(match => {
  console.log(match.metadata.title);
});

