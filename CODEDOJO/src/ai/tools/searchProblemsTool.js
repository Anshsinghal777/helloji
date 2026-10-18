import { Pinecone } from "@pinecone-database/pinecone";
import index from "../pinecone.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const pc = new Pinecone({
  apiKey: 'pcsk_4oPd6X_KHiCQrF5MguP1YtgeqwzpWt533wKfkgJ65YU8RoNgvbonPPthbS5eqBsA1iMACG'
});




export const searchProblemsTool = tool(
  async ({ query }) => {

   const embedding = await pc.inference.embed({
  model: "multilingual-e5-large",
  inputs: [query],
  parameters: {
    input_type: "query",
  },
});

const vector = embedding.data[0].values;

const results = await index.query({
  vector,
  topK: 3,
  includeMetadata: true,
});

const titles = results.matches.map(
  match => match.metadata.title
);

return titles.join("\n");

  },
  {
    name: "search_problems",
    description:
      "Search CodeDojo problems using a topic or keyword",

    schema: z.object({
      query: z.string()
    })
  }
);






