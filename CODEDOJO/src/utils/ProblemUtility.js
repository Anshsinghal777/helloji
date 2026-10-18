import axios from 'axios';

const waiting = async (joy)=>{
    return new Promise(resolve => setTimeout(resolve, joy));
}

  export const submitBatch = async (submissions)=>{


const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'true'
  },
  headers: {
    'x-rapidapi-key': 'ab99c6ec42mshfd636ec7c6687efp1b9043jsna684835b0591',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error("submitBatch API Error:", error.response?.data || error.message);
		throw new Error(`Judge0 Batch API Error: ${error.response?.data?.message || error.message}`);
	}
}

 return await fetchData();

}




 export const submitToken = async(resultToken)=>{

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'true',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': 'ab99c6ec42mshfd636ec7c6687efp1b9043jsna684835b0591',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error("submitToken API Error:", error.response?.data || error.message);
		throw new Error(`Judge0 Token API Error: ${error.response?.data?.message || error.message}`);
	}
}


 while(true){

 const result =  await fetchData();

  if(!result || !result.submissions) {
    throw new Error("Invalid response from Judge0 API - no submissions data");
  }

  const IsResultObtained =  result.submissions.every((r)=>r.status_id>2);

 if (IsResultObtained) {

  const fromBase64 = (str) =>
    str ? Buffer.from(str, "base64").toString("utf-8") : null;

  result.submissions.forEach((r) => {
    r.stdout = fromBase64(r.stdout);
    r.stderr = fromBase64(r.stderr);
    r.compile_output = fromBase64(r.compile_output);
  });

  return result.submissions;
}


  
  await waiting(1000);
}



}




