import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ApplyJob from './pages/ApplyJob';
import Applications from './pages/Applications';
import RecruiterLogin from './components/RecruiterLogin';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import UserLogin from './components/UserLogin';  // Import User Login Modal

import { AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import ManageJobs from './pages/ManageJobs';
import ViewApplications from './pages/ViewApplications';
import 'quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const { showRecruiterLogin, showUserLogin, companyToken, userToken } = useContext(AppContext);

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      {showUserLogin && <UserLogin />}  {/* Show user login modal */}
      <ToastContainer />
      
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

        {/* User Protected Routes (only accessible if logged in as a user) */}
        <Route
          path="/apply-job/:id"
          element={userToken ? <ApplyJob /> : <Navigate to="/" replace />}
        />
        <Route
          path="/applications"
          element={userToken ? <Applications /> : <Navigate to="/" replace />}
        />

        {/* Recruiter Protected Routes */}
        <Route
          path="/dashboard"
          element={companyToken ? <Dashboard /> : <Navigate to="/" replace />}
        >
          <Route path="add-job" element={companyToken ? <AddJob /> : <Navigate to="/" replace />} />
          <Route path="manage-jobs" element={companyToken ? <ManageJobs /> : <Navigate to="/" replace />} />
          <Route path="view-applications" element={companyToken ? <ViewApplications /> : <Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
