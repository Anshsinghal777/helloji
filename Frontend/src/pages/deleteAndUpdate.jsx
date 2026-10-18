// UpdateProblem.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosInstance from '../utils/axios.js';

// Fixed tags array
const AVAILABLE_TAGS = ['arrays', 'strings', 'linkedlist', 'math', 'stack', 'queue', 
  'dynamicprogramming', 'greedy', 'trees', 'graphs', 'sorting', 'searching'];

const UpdateProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: [],
    visibleTestCases: [{ input: '', output: '' }],
    startCode: [{ language: 'C++', initialCode: '' }],
    referenceSolution: [{ language: 'C++', completeCode: '' }],
    bwrapp: [{ code: '' }],
    twrapp: [{ code: '' }]
  });

  // Fetch problem data on component mount using GET /problem/:id
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setFetchLoading(true);
        const response = await axiosInstance.get(`/problem/${id}`);
        const problemData = response.data.problem;
        
        console.log('Fetched problem data:', problemData);
        
        setFormData({
          title: problemData.title || '',
          description: problemData.description || '',
          difficulty: problemData.difficulty || 'easy',
          tags: problemData.tags || [],
          visibleTestCases: problemData.visibleTestCases?.length ? 
            problemData.visibleTestCases : [{ input: '', output: '' }],
          startCode: problemData.startCode?.length ? 
            problemData.startCode : [{ language: 'cpp', initialCode: '' }],
          referenceSolution: problemData.referenceSolution?.length ? 
            problemData.referenceSolution : [{ language: 'cpp', completeCode: '' }],
          bwrapp: problemData.bwrapp?.length ? 
            problemData.bwrapp : [{ code: '' }],
          twrapp: problemData.twrapp?.length ? 
            problemData.twrapp : [{ code: '' }]
        });
      } catch (err) {
        setError('Failed to fetch problem data');
        console.error('Fetch error:', err);
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Handle visible test cases with textareas
  const addVisibleTestCase = () => {
    setFormData(prev => ({
      ...prev,
      visibleTestCases: [...prev.visibleTestCases, { input: '', output: '' }]
    }));
  };

  const removeVisibleTestCase = (index) => {
    if (formData.visibleTestCases.length > 1) {
      setFormData(prev => ({
        ...prev,
        visibleTestCases: prev.visibleTestCases.filter((_, i) => i !== index)
      }));
    }
  };

  const handleVisibleTestCaseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      visibleTestCases: prev.visibleTestCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const handleStartCodeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      startCode: prev.startCode.map((code, i) => 
        i === index ? { ...code, [field]: value } : code
      )
    }));
  };

  const handleReferenceSolutionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      referenceSolution: prev.referenceSolution.map((sol, i) => 
        i === index ? { ...sol, [field]: value } : sol
      )
    }));
  };

  const handleBwrappChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      bwrapp: prev.bwrapp.map((item, i) => 
        i === index ? { code: value } : item
      )
    }));
  };

  const handleTwrappChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      twrapp: prev.twrapp.map((item, i) => 
        i === index ? { code: value } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title || !formData.description || !formData.difficulty || 
          formData.tags.length === 0 || formData.visibleTestCases.length === 0 ||
          formData.startCode.length === 0 || formData.referenceSolution.length === 0) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      const invalidVisibleTestCases = formData.visibleTestCases.some(
        tc => !tc.input.trim() || !tc.output.trim()
      );
      if (invalidVisibleTestCases) {
        setError('Visible test cases input and output cannot be empty');
        setLoading(false);
        return;
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags,
        visibleTestCases: formData.visibleTestCases,
        startCode: formData.startCode,
        referenceSolution: formData.referenceSolution,
        bwrapp: formData.bwrapp.length ? formData.bwrapp : [{ code: '' }],
        twrapp: formData.twrapp.length ? formData.twrapp : [{ code: '' }]
      };

      console.log('Submitting data:', submitData);

      const response = await axiosInstance.put(`/problem/update/${id}`, submitData);
      
      if (response.status === 200) {
        alert('Problem updated successfully!');
        navigate(`/problem/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update problem');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-300">Loading problem data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Problem
            </h2>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter problem title"
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter problem description"
                    rows="6"
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 resize-y"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Difficulty <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                    required
                  >
                    <option value="easy" className="bg-gray-700">Easy</option>
                    <option value="medium" className="bg-gray-700">Medium</option>
                    <option value="hard" className="bg-gray-700">Hard</option>
                  </select>
                </div>
              </div>

              {/* Tags - Checkbox Grid */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Tags <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                  {AVAILABLE_TAGS.map((tag) => (
                    <label key={tag} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-primary bg-gray-600 border-gray-500 rounded focus:ring-primary focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300 capitalize group-hover:text-white transition-colors">
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.tags.length === 0 && (
                  <p className="text-sm text-red-400 mt-1">Please select at least one tag</p>
                )}
              </div>

              {/* Visible Test Cases - Updated to Textareas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Visible Test Cases <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {formData.visibleTestCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-400">Test Case #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVisibleTestCase(index)}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={formData.visibleTestCases.length === 1}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Input:</label>
                          <textarea
                            value={testCase.input}
                            onChange={(e) => handleVisibleTestCaseChange(index, 'input', e.target.value)}
                            placeholder="Enter test case input"
                            rows="3"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 font-mono text-sm resize-y"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Output:</label>
                          <textarea
                            value={testCase.output}
                            onChange={(e) => handleVisibleTestCaseChange(index, 'output', e.target.value)}
                            placeholder="Enter expected output"
                            rows="3"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 font-mono text-sm resize-y"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVisibleTestCase}
                    className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Test Case
                  </button>
                </div>
              </div>

              {/* Start Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Start Code (C++) <span className="text-red-400">*</span>
                </label>
                {formData.startCode.map((code, index) => (
                  <div key={index} className="space-y-2">
                    <textarea
                      value={code.initialCode || code.code || ''}
                      onChange={(e) => handleStartCodeChange(index, 'initialCode', e.target.value)}
                      placeholder="// Write your start code here"
                      rows="6"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 font-mono text-sm resize-y"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Reference Solution */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Reference Solution (C++) <span className="text-red-400">*</span>
                </label>
                {formData.referenceSolution.map((solution, index) => (
                  <div key={index} className="space-y-2">
                    <textarea
                      value={solution.completeCode}
                      onChange={(e) => handleReferenceSolutionChange(index, 'completeCode', e.target.value)}
                      placeholder="// Write your reference solution here"
                      rows="6"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 font-mono text-sm resize-y"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* BWRAPP and TWRAPP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">BWRAPP Code (C++)</label>
                  {formData.bwrapp.map((item, index) => (
                    <textarea
                      key={index}
                      value={item.code}
                      onChange={(e) => handleBwrappChange(index, e.target.value)}
                      placeholder="// Enter BWRAPP code"
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 font-mono text-sm resize-y"
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">TWRAPP Code (C++)</label>
                  {formData.twrapp.map((item, index) => (
                    <textarea
                      key={index}
                      value={item.code}
                      onChange={(e) => handleTwrappChange(index, e.target.value)}
                      placeholder="// Enter TWRAPP code"
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 font-mono text-sm resize-y"
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.tags.length === 0}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-focus text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Update Problem
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProblem;