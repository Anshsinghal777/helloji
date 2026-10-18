
import { useEffect } from 'react'
import {Routes, Route, Navigate}  from 'react-router'
import HomePage from './pages/Homepage.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ProblemID from './pages/ProblemID.jsx'
import Admin from './pages/Admin.jsx'
import { useDispatch,useSelector} from "react-redux";
import { checkAuth } from './authSlice.js';
import MySubmission from './pages/mySubmission.jsx'
import UpdateProblem from "./pages/deleteAndUpdate.jsx";
import VideoUpload from './pages/videoUpload.jsx';
import ProblemSubmissions from './pages/totalSubmission.jsx';

function App(){

  const dispatch = useDispatch();
  const {isAuthenticated, loading ,user}   = useSelector((state)=>state.auth)
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Don't render routes until initial auth check completes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <span className="loading loading-spinner loading-lg text-cyan-500"></span>
      </div>
    );
  }

  return (


    <>
    <Routes>
      <Route path='/' element={isAuthenticated? <HomePage></HomePage>: <Navigate to="/signup"/> } />
      <Route path='/login' element={ isAuthenticated?<Navigate to="/"/>:<Login></Login> } />
      <Route path='/signup' element={isAuthenticated?<Navigate to="/"/>: <Signup></Signup> } />
      <Route path ="/problem/:id" element={isAuthenticated?<ProblemID></ProblemID>: <Navigate to="/signup"/>}/>
         <Route path ="/submissions" element={isAuthenticated?<MySubmission></MySubmission>: <Navigate to="/signup"/>}/>
         <Route path ="/admin" element={isAuthenticated && user?.role === 'admin' ?<Admin></Admin>: <Navigate to="/signup"/>}/>
         <Route path ="/update-problem/:id" element={isAuthenticated && user?.role === 'admin' ?<UpdateProblem></UpdateProblem>: <Navigate to="/signup"/>}/>
         <Route path ="/video-upload/:problemId" element={isAuthenticated && user?.role === 'admin' ?<VideoUpload></VideoUpload>: <Navigate to="/signup"/>}/>
         <Route path ="mySubmissions/:problemId" element={isAuthenticated?<ProblemSubmissions></ProblemSubmissions>: <Navigate to="/signup"/>}/>
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl">404 Not Found</h1></div>} />
    </Routes>
    </>
  )
}

export default App

