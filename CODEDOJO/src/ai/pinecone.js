// pinecone.js
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from "dotenv"; // Import dotenv here as well if PINECONE_API_KEY is in .env
dotenv.config();

const pc = new Pinecone({
  apiKey: "pcsk_4oPd6X_KHiCQrF5MguP1YtgeqwzpWt533wKfkgJ65YU8RoNgvbonPPthbS5eqBsA1iMACG", // It's better to use process.env for API keys
   
});

// Get a reference to your specific index by name
const index = pc.index("codedojo"); // Pass only the index name here

// console.log(index);
export default index;