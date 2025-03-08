import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const navigate = useNavigate();
    
    const {
        setShowRecruiterLogin,
        setShowUserLogin,  // Function to open user login modal
        userToken, 
        setUserToken,
        userData, 
        setUserData,
        companyToken
    } = useContext(AppContext);

    return (
        <div className='shadow py-4'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
                <h1 onClick={() => navigate(`/`)} className='cursor-pointer text-lg font-bold text-gray-700'>
                    JOB SPHERE
                </h1>

                {/* If a user is logged in */}
                {userToken ? (
                    <div className='flex items-center gap-3'>
                        <Link to={'/applications'}>Applied Jobs</Link>
                        <p>|</p>
                        <p className='max-sm:hidden'>Hi, {userData?.name}</p>
                        <button 
                            onClick={() => {
                                localStorage.removeItem("userToken");
                                localStorage.removeItem("userData");
                                setUserToken(null); 
                                setUserData(null);
                                window.location.reload();// Reload page to reflect logout
                            }} 
                            className="text-gray-600"
                        >
                            Logout
                        </button>
                    </div>
                ) : companyToken ? (
                    // If a recruiter is logged in
                    <div className='flex items-center gap-3'>
                        <Link to={'/dashboard'}>Dashboard</Link>
                        <p>|</p>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('companyToken');
                                window.location.reload();
                            }} 
                            className="text-gray-600"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    // If no user is logged in
                    <div className='flex gap-4 max-sm:text-xs'>
                        <button 
                            onClick={() => setShowRecruiterLogin(true)}
                            className='text-gray-600'
                        >
                            Recruiter Login
                        </button>
                        <button 
                            onClick={() => setShowUserLogin(true)}
                            className='bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full'
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
