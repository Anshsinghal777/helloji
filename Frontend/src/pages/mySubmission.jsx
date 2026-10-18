import axiosInstance from "../utils/axios.js";
import { useEffect, useState } from "react";
import { Link } from "react-router"; // Keep this for the empty state link

function MySubmission() {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const response = await axiosInstance.get("/problem/user");
        // Backend sends { solvedProblems: [...] }
        setSolvedProblems(response.data.solvedProblems || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolvedProblems();
  }, []);

  // Different difficulty colors
  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "badge-success";
      case "medium": return "badge-warning";
      case "hard": return "badge-error";
      default: return "badge-ghost";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Problems Solved</h1>
          <p className="text-gray-400 text-sm mt-1">
            Total: {solvedProblems.length} problem{solvedProblems.length !== 1 ? 's' : ''} solved
          </p>
        </div>

        <div className="space-y-3">
         {solvedProblems.map((problem, index) => (
  <Link
    key={problem._id || index}
    to={`/mySubmissions/${problem._id}`}
    className="block"
  >
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-primary hover:bg-gray-750 transition-all cursor-pointer">

      {/* Problem Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold text-lg">
          {problem.title || "Unknown Problem"}
        </h3>

        {/* Difficulty Badge */}
        <span className={`badge ${getDifficultyClass(problem.difficulty)} badge-sm`}>
          {problem.difficulty || "Unknown"}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex gap-1">
          {problem.tags?.map((tag, i) => (
            <span
              key={i}
              className="badge badge-outline badge-sm bg-gray-900 text-gray-300 border-gray-600"
            >
              {tag}
            </span>
          ))}
          {(!problem.tags || problem.tags.length === 0) && (
            <span className="text-xs text-gray-500">No tags</span>
          )}
        </div>
      </div>

    </div>
  </Link>
))}

          {solvedProblems.length === 0 && (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-400">No problems solved yet</p>
              <p className="text-sm text-gray-500 mt-1">
               
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MySubmission;