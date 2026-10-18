import { useParams } from "react-router";
import axiosInstance from "../utils/axios";
import { useEffect, useState } from "react";

function ProblemSubmissions() {
  const { problemId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axiosInstance.get(`/submission/${problemId}`);
        setSubmissions(res.data || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-400";
      case "wrong":
        return "text-red-400";
      case "error":
        return "text-yellow-400";
      default:
        return "text-gray-400";
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
      <div className="max-w-4xl mx-auto">

        <h2 className="text-white text-2xl font-bold mb-6">
          My Submissions
        </h2>

        {submissions.length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-semibold ${getStatusColor(sub.status)}`}>
                    {sub.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm text-gray-300 space-y-1">
                  <p>Runtime: {sub.runtime} ms</p>
                  <p>Memory: {sub.memory} kb</p>
                  <p>
                    Testcases: {sub.testCasesPassed} / {sub.testCasesTotal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default ProblemSubmissions;