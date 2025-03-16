import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const {
        showRecruiterLogin,
        setShowRecruiterLogin,
        showUserLogin,
        setShowUserLogin,
        userToken, 
        setUserToken,
        userData, 
        setUserData,
        companyToken
    } = useContext(AppContext);

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        setUserToken(null); 
        setUserData(null);
        setShowDropdown(false);
        window.location.reload(); 
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className='shadow-lg py-4 bg-white relative top-0 z-50'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
                
                {/* Logo */}
                <h1 
                    onClick={() => navigate(`/`)} 
                    className='cursor-pointer text-xl font-extrabold text-gray-800 hover:text-blue-700 transition-all duration-300'
                >
                    JOB <span className="text-blue-600">SPHERE</span>
                </h1>

                {userToken ? (
                    <div className='flex items-center gap-6 relative'>
                        
                        {/* Styled "Applied Jobs" Link with Cool Animation */}
                        <Link 
                            to={'/applications'} 
                            className="relative text-lg font-semibold text-gray-700 hover:text-blue-700 transition-all duration-300"
                        >
                            Applied Jobs
                            <span className="absolute left-0 bottom-0 w-0 h-[3px] bg-blue-500 rounded-full transition-all duration-300 hover:w-full"></span>
                        </Link>

                        <p className="text-gray-400">|</p>
                        <p className='max-sm:hidden text-gray-700 font-medium'>Hi, {userData?.name}</p>

                        {/* Profile Image Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <img 
                                src={userData?.image || "/default-avatar.png"} 
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full cursor-pointer border border-gray-300 hover:border-blue-500 transition duration-300 shadow-sm"
                                onClick={() => setShowDropdown(!showDropdown)}
                            />

                            {/* Dropdown Menu with Smooth Animation */}
                            {showDropdown && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden"
                                >
                                    <ul className="py-2">
                                        <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700 font-medium transition-all">
                                            <Link to="/profile">👤 Manage Profile</Link>
                                        </li>
                                        <li 
                                            className="px-4 py-3 hover:bg-red-100 cursor-pointer text-red-500 font-medium transition-all"
                                            onClick={handleLogout}
                                        >
                                            🚪 Logout
                                        </li>
                                    </ul>
                                </motion.div>
                            )}
                        </div>
                    </div>
                ) : companyToken ? (
                    <div className='flex items-center gap-3'>
                        <Link 
                            to={'/dashboard'} 
                            className="text-gray-700 font-medium hover:text-blue-600 transition duration-300"
                        >
                            Dashboard
                        </Link>
                        <p>|</p>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('companyToken');
                                window.location.reload();
                            }} 
                            className="text-gray-600 hover:text-red-500 transition duration-300"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className='flex gap-4 max-sm:text-xs'>
                        <button 
                            onClick={() => {
                                if(showUserLogin){
                                    setShowUserLogin(false);
                                    setShowRecruiterLogin(true);
                                }else{
                                    setShowRecruiterLogin(true);
                                }
                            }}
                            className='text-gray-600 font-medium hover:text-blue-600 transition duration-300'
                        >
                            Recruiter Login
                        </button>
                        <button 
                            onClick={() => {
                                if(showRecruiterLogin){
                                    setShowRecruiterLogin(false);
                                    setShowUserLogin(true);
                                }else{
                                    setShowUserLogin(true);
                                }
                            }}
                            className='bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full hover:bg-blue-700 transition duration-300'
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
