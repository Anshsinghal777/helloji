import { useForm } from "react-hook-form";
import { useState } from "react";
import axiosInstance from '../utils/axios.js';

function Admin() {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            title: "",
            description: "",
            difficulty: "easy",
            tags: [],
            visibleTestCases: [{ input: "", output: "", explanation: "" }],
            startCode: [{ language: "javascript", initialCode: "" }],
            referenceSolution: [{ language: "javascript", completeCode: "" }],
            bwrapp: [{ code: "" }],
            twrapp: [{ code: "" }]
        }
    });

    const availableTags = ['arrays', 'strings', 'linkedlist', 'math'];
    const languages = ['javascript', 'python', 'java', 'C++'];

    const onSubmit = async (data) => {
        try {
            console.log("Submitting:", JSON.stringify(data, null, 2));
            const response = await axiosInstance.post("/problem/create", data);
            alert("Success!");
            console.log("jai ho");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Create Problem</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-800 p-6 rounded-xl">
                    {/* Basic Info */}
                    <div>
                        <label className="block mb-2">Title *</label>
                        <input {...register("title", { required: true })} 
                               className="w-full p-2 bg-gray-700 rounded" />
                    </div>

                    <div>
                        <label className="block mb-2">Description *</label>
                        <textarea {...register("description", { required: true })} 
                                  rows="3" className="w-full p-2 bg-gray-700 rounded" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Difficulty</label>
                            <select {...register("difficulty")} className="w-full p-2 bg-gray-700 rounded">
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Tags</label>
                            <select {...register("tags", { required: true })} 
                                    multiple className="w-full p-2 bg-gray-700 rounded h-20">
                                {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Test Case */}
                    <div>
                        <label className="block mb-2">Test Case *</label>
                        <p className="text-xs text-gray-400 mb-2">Format: Enter input as space/newline separated. Output must match reference solution exactly.</p>
                     <textarea
    {...register("visibleTestCases.0.input", { required: true })}
    rows="3"
    placeholder="2 7 11 15\n11"  // Remove brackets and commas
    className="w-full p-2 mb-2 bg-gray-700 rounded"
/>
                        <input {...register("visibleTestCases.0.output", { required: true })} 
                               placeholder="Expected Output (e.g., for twoSum: 0 1)" className="w-full p-2 mb-2 bg-gray-700 rounded" />
                        <input {...register("visibleTestCases.0.explanation", { required: true })} 
                               placeholder="Explanation" className="w-full p-2 bg-gray-700 rounded" />
                    </div>

                    {/* Start Code */}
                    <div>
                        <label className="block mb-2">Start Code *</label>
                        <select {...register("startCode.0.language")} className="w-full p-2 mb-2 bg-gray-700 rounded">
                            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <textarea {...register("startCode.0.initialCode", { required: true })} 
                                  rows="3" placeholder="// code" className="w-full p-2 bg-gray-700 rounded font-mono" />
                    </div>

                    {/* Solution */}
                    <div>
                        <label className="block mb-2">Solution *</label>
                        <p className="text-xs text-gray-400 mb-2">Important: Your solution should read from stdin and print output with NO trailing newlines.</p>
                        <select {...register("referenceSolution.0.language")} className="w-full p-2 mb-2 bg-gray-700 rounded">
                            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <textarea {...register("referenceSolution.0.completeCode", { required: true })} 
                                  rows="4" placeholder="// For twoSum: Read array and target, output indices&#10;// Example (JS):&#10;const arr = require('fs').readFileSync(0,'utf-8').split('\\n')[0].split(' ').map(Number);&#10;console.log(indices.join(' '));" className="w-full p-2 bg-gray-700 rounded font-mono" />
                    </div>

                    {/* BWRAPP Code - C++ by default but not compulsory */}
                    <div>
                        <label className="block mb-2">BWRAPP Code (C++ by default)</label>
                        <p className="text-xs text-gray-400 mb-2">Optional: C++ wrapper code for before execution</p>
                        <textarea 
                            {...register("bwrapp.0.code")} 
                            rows="4" 
                            placeholder="// Optional: C++ wrapper code (not required)&#10;// Example:&#10;#include &lt;bits/stdc++.h&gt;&#10;using namespace std;&#10;&#10;int main() {&#10;    // Your before wrapper code here&#10;    return 0;&#10;}" 
                            className="w-full p-2 bg-gray-700 rounded font-mono" 
                        />
                    </div>

                    {/* TWRAPP Code - C++ by default but not compulsory */}
                    <div>
                        <label className="block mb-2">TWRAPP Code (C++ by default)</label>
                        <p className="text-xs text-gray-400 mb-2">Optional: C++ wrapper code for after execution</p>
                        <textarea 
                            {...register("twrapp.0.code")} 
                            rows="4" 
                            placeholder="// Optional: C++ wrapper code (not required)&#10;// Example:&#10;#include &lt;bits/stdc++.h&gt;&#10;using namespace std;&#10;&#10;int main() {&#10;    // Your after wrapper code here&#10;    return 0;&#10;}" 
                            className="w-full p-2 bg-gray-700 rounded font-mono" 
                        />
                    </div>

                    <button type="submit" className="w-full p-3 bg-green-600 rounded font-bold">
                        Create Problem
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Admin;