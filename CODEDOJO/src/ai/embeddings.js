import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBbli9rHu-DPAcLI7qxsT6Tpq_xiN3FJK8"
});

const response = await ai.models.embedContent({
  model: "gemini-embedding-2",
  contents: "Binary Search problem on sorted arrays"
});

console.log(
  response.embeddings[0].values.length
);