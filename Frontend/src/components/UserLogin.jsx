import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserLogin = () => {
    const navigate = useNavigate();
    const [state, setState] = useState('Login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const { setShowUserLogin, loginUser, registerUser, setRole,userData } = useContext(AppContext);

    const handleImageUpload = (e) => {
        setImage(e.target.files[0]);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!email || !password || (state === 'Sign Up' && !username)) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            let userDataResponse
            if (state === 'Login') {
                userDataResponse = await loginUser(email, password);
            } else {
                const formData = new FormData();
                formData.append('name', username);
                formData.append('email', email);
                formData.append('password', password);
                if (image) formData.append('profileImage', image);

                userDataResponse = await registerUser(formData);
            }
            console.log('User Data Response:', userDataResponse);  // ✅ Debugging
            if (userDataResponse) {
                localStorage.setItem('user', JSON.stringify(userDataResponse.user));
                toast.success(`Welcome, ${userDataResponse.user.name}!`);
                setShowUserLogin(false);

                // Add a slight delay before navigating for better UX
                setTimeout(() => navigate('/'), 1000);
            }
            // setRole('user'); // Set role to user
            // setShowUserLogin(false);
            // navigate('/');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false); // 🔵 Stop loading after request completes
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className='absolute top-0 bottom-0 left-0 right-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
            <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500 w-[90%] sm:w-[400px]'>
                <h1 className='text-center text-2xl text-neutral-700 font-medium'>User {state}</h1>
                <p className='text-sm'>Welcome back! Please sign in to continue</p>
                {state !== 'Login' && (
                    <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                        <img src={assets.person_icon} alt='' />
                        <input
                            className='outline-none text-sm w-full'
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type='text'
                            placeholder='Full Name'
                            required
                        />
                    </div>
                )}
                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 w-full'>
                    <img src={assets.email_icon} alt='' />
                    <input
                        className='outline-none text-sm w-full flex-1'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type='email'
                        placeholder='Email Id'
                        required
                    />
                </div>
                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                    <img src={assets.lock_icon} alt='' />
                    <input
                        className='outline-none text-sm w-full'
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        type='password'
                        placeholder='Password'
                        required
                    />
                </div>
                {state === 'Sign Up' && (
                    <div className='mt-5'>
                        <label className='text-sm font-medium'>Upload Profile Picture:</label>
                        <input type='file' accept='image/*' onChange={handleImageUpload} className='mt-2 w-full' />
                    </div>
                )}
                {state === 'Login' && <p className='text-sm text-blue-600 cursor-pointer mt-4'
                onClick={() => {
                    setShowUserLogin(false);
                    navigate('/users/forgot-password');
                }}
                >Forgot Password?</p>}
                <button 
                className='bg-blue-600 w-full text-white px-5 py-2 rounded-full mt-4 text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center' 
                disabled={loading}
                type='submit'>
                    {loading ? (
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'>
                        </div>
                    ) : (
                        state === 'Login' ? 'Login' : 'Sign Up'
                    )}
                </button>
                {state === 'Login' ? (
                    <p className='mt-5 text-center'>
                        Don't have an account?{' '}
                        <span className='text-blue-600 cursor-pointer' onClick={() => setState('Sign Up')}>
                            Sign Up
                        </span>
                    </p>
                ) : (
                    <p className='mt-5 text-center'>
                        Already have an account?{' '}
                        <span className='text-blue-600 cursor-pointer' onClick={() => setState('Login')}>
                            Login
                        </span>
                    </p>
                )}
                <img
                    src={assets.cross_icon}
                    onClick={() => setShowUserLogin(false)}
                    className='absolute top-5 right-5 cursor-pointer'
                    alt=''
                />
            </form>
        </div>
    );
};

export default UserLogin;