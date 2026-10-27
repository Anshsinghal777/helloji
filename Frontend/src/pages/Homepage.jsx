import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice.js';
import axiosInstance from '../utils/axios.js';
import { Link, useNavigate } from 'react-router';
import { ReactComponent as Logo } from '../assets/codedojo.svg'
import  UpdateProblem from './deleteAndUpdate.jsx';
import Admin from './Admin.jsx';
import { FiLogOut, FiSearch, FiUser, FiMoon, FiSun, FiCheckCircle, FiClock, FiTrash2, FiShield, FiEdit2, FiVideo, FiUploadCloud } from 'react-icons/fi';

const HomePage = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const {isAuthenticated } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [darkMode, setDarkMode] = useState(true);

  // All available tags from your backend schema
  const allTags = [
    'arrays', 'strings', 'linkedlist', 'math', 'stack', 'queue',
    'dynamicprogramming', 'greedy', 'trees', 'graphs', 'sorting', 'searching'
  ];

  useEffect(() => {
    fetchProblems();
  }, []);
  
  useEffect(() => {
    if(!isAuthenticated){
      Navigate('/signup')
    }
  }, [isAuthenticated]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/problem/');
      console.log('Problems response:', response.data);
      setProblems(response.data.problem || []);
      setError('');
    } catch (err) {
      setError('Failed to load problems');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      Navigate('/signup');
    }).catch(() => {
      console.log("tera logout nahi hua");
    });
  };

  const handleMySubmissions = () => {
    Navigate('/submissions');
  };

  const handleAdminPanel = () => {
    Navigate('/admin');
  };

  const handleVideoUpload = (problemId) => {
    console.log("video upload for problem:", problemId);
    Navigate(`/video-upload/${problemId}`);
  };

  // Handle problem update
  const handleDeleteProblem = async (problemId) => {
  try {
    console.log("Attempting to delete problem with ID:", problemId);

    const response = await axiosInstance.delete(
      `/problem/delete/${problemId}`
    );

    alert(response.data.message);

    // Optional: refresh problems list after delete
    fetchProblems();

  } catch (error) {
    console.error("Delete error:", error.response?.data || error.message);
    alert("Failed to delete problem");
  }
};

 const handleUpdateProblem = async (problemId) => {
  try {
    
console.log("Attempting to update problem with ID:", problemId);
Navigate(`/update-problem/${problemId}`);
  } catch (error) {
    console.error("update error aaya hai");
    
  }
};

  // Filter problems based on search (title only) and filters
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = searchTerm === '' || 
                         problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             problem.difficulty === selectedDifficulty;
    
    const matchesTag = selectedTag === 'all' || 
                      problem.tags?.includes(selectedTag);

    return matchesSearch && matchesDifficulty && matchesTag;
  });

  // Difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-info';
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('all');
    setSelectedTag('all');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* Navbar */}
      <div className={`navbar ${darkMode ? 'bg-gray-800 shadow-2xl border-b border-gray-700' : 'bg-white shadow-lg'} px-4 md:px-8 transition-colors duration-300`}>
        {/* Left side - Logo/Brand with Cyber Infinity Logo */}
        <div className="flex-1 flex items-center gap-4">
          {/* Cyber Infinity Logo - EXTRA LARGE SIZE */}
          <div className="w-24 h-16 md:w-32 md:h-20 lg:w-40 lg:h-24 relative flex items-center">
            {/* Use the logo like this */}
            <Logo />
          </div>
          
          {/* Brand Name - CodeDojo with big text */}
          <div className="flex flex-col">
            <span 
              className="text-[25px] md:text-[40px] lg:text-[48px] font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight"
              style={{ fontFamily: 'typo-round, sans-serif' }}
            >
              CodeDojo
            </span>
          </div>
        </div>
        
        {/* Right side - My Submissions, Admin (if admin), Theme Toggle and Profile */}
        <div className="flex-none flex items-center gap-2 md:gap-4">
          
          {/* ADMIN BUTTON - Only visible if user role is admin */}
          {user?.role === 'admin' && (
            <button
              onClick={handleAdminPanel}
              className={`
                relative group flex items-center gap-2 px-4 py-2 rounded-full
                transition-all duration-200 hover:scale-105 active:scale-95
                ${darkMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50'
                }
              `}
              style={{ fontFamily: 'typo-round, sans-serif' }}
            >
              {/* Shield Icon for Admin */}
              <FiShield className="w-4 h-4" />
              
              {/* Text - smaller size */}
              <span className="text-sm md:text-base font-medium">
                Admin Panel
              </span>
              
              {/* Optional: Small indicator that it's admin only */}
              <div className="absolute -top-1 -right-1 w-3 h-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </div>
            </button>
          )}
          
          {/* MY SUBMISSIONS BUTTON - NICE LOOKING */}
          <button
            onClick={handleMySubmissions}
            className={`
              relative group flex items-center gap-2 px-4 py-2 rounded-full
              transition-all duration-200 hover:scale-105 active:scale-95
              ${darkMode 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/50'
              }
            `}
            style={{ fontFamily: 'typo-round, sans-serif' }}
          >
            {/* Icon */}
            <FiCheckCircle className="w-4 h-4" />
            
            {/* Text - smaller size */}
            <span className="text-sm md:text-base font-medium">
              My Submissions
            </span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`btn btn-circle ${darkMode ? 'btn-ghost text-cyan-300 hover:bg-gray-700' : 'btn-ghost text-gray-700 hover:bg-gray-200'}`}
          >
            {darkMode ? <FiSun className="w-6 h-6" /> : <FiMoon className="w-6 h-6" />}
          </button>

          {/* Logout Dropdown */}
          <div className="flex items-center gap-4">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className={`btn btn-circle ${darkMode ? 'btn-ghost text-cyan-300 hover:bg-gray-700' : 'btn-ghost text-gray-700 hover:bg-gray-200'}`}>
                <FiLogOut className="w-6 h-6" />
              </div>
              <div className={`dropdown-content z-[1] menu p-2 shadow-2xl rounded-box w-80 border mt-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-4">
                  {/* Profile Section in Dropdown */}
                  <div className="flex flex-col items-center gap-3 mb-4">
                    {user?.profile_pic ? (
                      <div className="avatar">
                        <div className="w-28 h-28 rounded-full ring-4 ring-cyan-500">
                          <img 
                            src={user.profile_pic} 
                            alt="Profile" 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center rounded-full">
                                  <span class="text-white text-3xl font-bold">${user?.firstName?.charAt(0).toUpperCase()}</span>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center ring-4 ring-cyan-500">
                        <span className="text-white text-3xl font-bold">
                          {user?.firstName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Show admin badge in profile if user is admin */}
                    {user?.role === 'admin' && (
                      <div className="badge badge-warning gap-1 p-3">
                        <FiShield className="w-3 h-3" />
                        Administrator
                      </div>
                    )}
                  </div>
                  
                  {/* Edit Profile Button */}
                  <button className={`btn btn-outline btn-sm w-full mb-2 ${darkMode ? 'border-gray-600 text-cyan-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    <FiUser className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                  
                  {/* Delete Profile Button */}
                  <button 
                    className="btn btn-outline btn-sm w-full mb-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-600 transition-all duration-200"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    Delete Profile
                  </button>
                </div>
                <div className={`divider my-0 ${darkMode ? 'before:bg-gray-700 after:bg-gray-700' : ''}`}></div>
                <button 
                  onClick={handleLogout}
                  className="btn btn-error btn-sm w-full hover:bg-red-700 text-white mt-2"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8 text-center">
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: 'sans-serif' }}>
  {user?.role === 'admin' 
    ? `Welcome Mr ${user?.firstName} to your Codedojo`
    : `Welcome ${user?.firstName} `
  }
</h1>
          <p className={darkMode ? 'text-cyan-200' : 'text-gray-600'} style={{ fontFamily: 'sans-serif' }}>
            Practice your coding skills with us
          </p>
        </div>

        {/* Filters Section */}
        <div className={`rounded-xl shadow-2xl p-4 md:p-6 mb-8 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search Input - Title Only */}
            <div className="flex-1 w-full">
              <label className="form-control">
                <div className="label">
                  <span className={`label-text font-medium ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>
                    Search Problems
                  </span>
                </div>
                <div className="relative">
                  <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-cyan-300' : 'text-gray-400'}`} />
                  <input 
                    type="text" 
                    className={`input w-full pl-10 border focus:border-cyan-500 ${darkMode 
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                    placeholder="Search by problem title..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Difficulty Filter */}
            <div className="form-control w-full md:w-auto">
              <div className="label">
                <span className={`label-text font-medium ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>
                  Difficulty
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  className={`select w-full focus:border-cyan-500 ${darkMode 
                    ? 'bg-gray-900 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'}`}
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="form-control w-full md:w-auto">
              <div className="label">
                <span className={`label-text font-medium ${darkMode ? 'text-cyan-200' : 'text-gray-700'}`}>
                  Tags
                </span>
              </div>
              <select 
                className={`select w-full focus:border-cyan-500 ${darkMode 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm !== '' || selectedDifficulty !== 'all' || selectedTag !== 'all') && (
              <button 
                onClick={clearFilters}
                className={`btn btn-outline btn-sm ${darkMode 
                  ? 'border-gray-600 text-cyan-300 hover:bg-gray-700 hover:border-cyan-400' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'}`}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`alert shadow-lg mb-6 ${darkMode ? 'alert-error bg-red-900 text-white' : 'alert-error'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Problems List */}
        <div className={`rounded-xl shadow-2xl overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Table Header - Desktop */}
          <div className={`hidden md:grid grid-cols-12 p-4 font-semibold border-b ${darkMode 
            ? 'bg-gray-900 text-cyan-200 border-gray-700' 
            : 'bg-gray-50 text-gray-700 border-gray-200'}`}
          >
            <div className="col-span-1"></div>
            <div className="col-span-5">Problem Title</div>
            <div className="col-span-2">Tags</div>
            <div className="col-span-1">Difficulty</div>
            {user?.role === 'admin' && <div className="col-span-3">Actions</div>}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-cyan-500"></span>
              <p className={`mt-4 ${darkMode ? 'text-cyan-200' : 'text-gray-600'}`}>Loading problems...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProblems.length === 0 && (
            <div className="p-12 text-center">
              <div className={`text-4xl mb-4 ${darkMode ? 'text-cyan-800' : 'text-gray-400'}`}>🔍</div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {problems.length === 0 ? 'No problems available' : 'No matching problems found'}
              </h3>
              <p className={`mb-4 ${darkMode ? 'text-cyan-200' : 'text-gray-600'}`}>
                {problems.length === 0 
                  ? 'Check back later for new problems'
                  : 'Try changing your search or filters'}
              </p>
              {problems.length > 0 && (
                <button 
                  onClick={clearFilters}
                  className={`btn btn-outline btn-sm mt-2 ${darkMode 
                    ? 'border-gray-600 text-cyan-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Problems List */}
          {!loading && filteredProblems.length > 0 && (
            <div className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}>
              {filteredProblems.map((problem, index) => (
                <div 
                  key={problem._id} 
                  className={`p-4 transition-all duration-200 ${darkMode 
                    ? 'hover:bg-gray-700/50' 
                    : 'hover:bg-blue-50'}`}
                >
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 items-center">
                    <div className="col-span-1">
                      <span 
                        className={`font-medium cursor-pointer hover:text-cyan-400 transition-colors ${darkMode ? 'text-cyan-300' : 'text-gray-500'}`}
                        onClick={() => Navigate(`/problem/${problem._id}`)}
                      >
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="col-span-5">
                      <h3 
                        className={`font-bold cursor-pointer hover:text-cyan-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}
                        onClick={() => Navigate(`/problem/${problem._id}`)}
                      >
                        {problem.title}
                      </h3>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className={`badge badge-outline badge-sm ${darkMode 
                            ? 'bg-gray-900 text-cyan-300 border-cyan-800' 
                            : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags?.length > 2 && (
                          <span className={`badge badge-ghost badge-sm ${darkMode ? 'text-cyan-500' : 'text-gray-500'}`}>
                            +{problem.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {user?.role === 'admin' && (
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        {/* VIDEO UPLOAD BUTTON - Now in each problem container */}
                        <button
                          onClick={() => handleVideoUpload(problem._id)}
                          className="relative inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold
                            bg-gradient-to-r from-green-500 to-emerald-600
                            text-white rounded-lg
                            hover:from-green-600 hover:to-emerald-700
                            hover:shadow-lg hover:shadow-green-500/30
                            transition-all duration-200
                            group"
                        >
                          <FiVideo className="w-3 h-3 group-hover:animate-pulse" />
                          <span>UPLOAD</span>
                        </button>

                        <button
                          onClick={() => handleUpdateProblem(problem._id)}
                          className="relative inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold
                            bg-transparent text-blue-400
                            rounded-lg border border-blue-400/50
                            hover:border-blue-400 hover:text-blue-300
                            hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]
                            hover:bg-blue-400/10
                            transition-all duration-300
                            group"
                        >
                          <FiEdit2 className="w-3 h-3 group-hover:animate-pulse" />
                          <span>EDIT</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProblem(problem._id)}
                          className="relative inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold
                            bg-transparent text-rose-400
                            rounded-lg border border-rose-400/50
                            hover:border-rose-400 hover:text-rose-300
                            hover:shadow-[0_0_10px_rgba(244,63,94,0.3)]
                            hover:bg-rose-400/10
                            transition-all duration-300
                            group"
                        >
                          <FiTrash2 className="w-3 h-3 group-hover:animate-pulse" />
                          <span>DELETE</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {!loading && filteredProblems.length > 0 && (
          <div className={`mt-6 p-4 rounded-lg border shadow-sm ${darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className={darkMode ? 'text-cyan-200' : 'text-gray-600'}>
                Showing <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {filteredProblems.length}
                </span> of{' '}
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {problems.length}
                </span> problems
              </div>
              
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className={darkMode ? 'text-cyan-200' : 'text-gray-600'}>Easy</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {problems.filter(p => p.difficulty === 'easy').length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className={darkMode ? 'text-cyan-200' : 'text-gray-600'}>Medium</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {problems.filter(p => p.difficulty === 'medium').length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className={darkMode ? 'text-cyan-200' : 'text-gray-600'}>Hard</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {problems.filter(p => p.difficulty === 'hard').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;