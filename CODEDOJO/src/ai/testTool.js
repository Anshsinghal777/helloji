
import { searchProblemsTool }
from "./tools/searchProblemsTool.js";



const result =
await searchProblemsTool.invoke({
  query: "binary search"
});

console.log(result);