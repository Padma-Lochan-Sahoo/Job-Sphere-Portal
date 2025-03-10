import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const RecruiterLogin = () => {

    const navigate = useNavigate()

    const [state,setState] = useState('Login')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email,setEmail] = useState('')

    const[image,setImage] = useState()

    const [isTextDataSubmited,setIsTextDataSubmited] = useState(false)

    const {setShowRecruiterLogin , backendUrl , setCompanyToken , setCompanyData} = useContext(AppContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // extra not in  project
        if (!email || !password) {
            toast.error("Please fill in all fields.");
            return;
        }


        if (state === "Sign Up" && !isTextDataSubmited) {
                return setIsTextDataSubmited(true);
        }
        
    try {
        if (state === "Login") {
            // Attempt the POST request
            const { data } = await axios.post(backendUrl + '/api/company/login', { email, password });

            // If successful, process the response
            if (data.success) {
                console.log(data);
                
                setCompanyData(data.company);
                setCompanyToken(data.token);

                localStorage.setItem('companyToken', data.token);
                setShowRecruiterLogin(false);
                navigate('/dashboard');

                toast.success("Login successful!");
            }
        }else{
            const formData = new FormData();
            formData.append('name',username)
            formData.append('password',password)
            formData.append('email',email)
            formData.append('image',image)

            const { data } = await axios.post(backendUrl+'/api/company/register',formData)
            if (data.success) {

                setCompanyData(data.company);
                setCompanyToken(data.token);

                localStorage.setItem('companyToken', data.token);
                setShowRecruiterLogin(false);
                navigate('/dashboard');

                toast.success("Login successful!");
            } else {
                toast.error(data.message);
            }
        }
    } catch (error) {
        // Handle the error response from Axios
        if (error.response) {
            // Extract error message from backend response
            const errorMessage = error.response.data.message || "Invalid ..... or password.";
            toast.error(errorMessage);
        } else if (error.request) {
            // No response from the server
            toast.error("No response from server. Please check your network.");
        } else {
            // Unexpected error
            toast.error("An unexpected error occurred. Please try again.");
        }
    }
};

    
    useEffect(()=>{
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }

    },[])


  return (
    <div className='absolute top-0 bottom-0 left-0 right-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center '>
        <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500'>
            <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
            <p className='text-sm'>Welcome back ! Please Sign In to Continue</p>
            {
    state === 'Sign Up' && isTextDataSubmited ? 
        <>
        <div
        className='flex items-center gap-4 my-10'
        >
            <label 
            htmlFor='image'
            className="block text-sm font-medium text-neutral-700">
                <input 
                    type="file" 
                    id="image" 
                    hidden 
                    onChange={e => setImage(e.target.files[0])} 
                />
                <img 
                className='w-16 h-16 rounded-full object-cover border'
                src={image ? URL.createObjectURL(image) :assets.upload_area} alt="Upload Logo" />
            </label>
            <p>Upload Company <br /> logo</p>
        </div>
        </>
     : (
        <>
            {state !== 'Login' && (
                <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
                    <img src={assets.person_icon} alt="" />
                    <input
                        className="outline-none text-sm"
                        onChange={e => setUsername(e.target.value)}
                        value={username}
                        type="text"
                        placeholder="Company Name"
                        required
                    />
                </div>
            )}
            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
                <img src={assets.email_icon} alt="" />
                <input
                    className="outline-none text-sm"
                    onChange={e => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    placeholder="Email Id"
                    required
                />
            </div>
            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
                <img src={assets.lock_icon} alt="" />
                <input
                    className="outline-none text-sm"
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    placeholder="Password"
                    required
                />
            </div>
        </>
    )
}

            {state === 'Login' && <p className='text-sm text-blue-600 cursor-pointer mt-4'>Forgot Password</p>}


            <button 
            className='bg-blue-600 w-full text-white py-2 rounded-full mt-4'
            type="submit">{state === 'Login' ? 'Login': isTextDataSubmited ? 'Create Account' : 'Next'}</button>
            {
                state === 'Login'
                ?<p className='mt-5 text-center'>Don't have an account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState('Sign Up')}>Sign Up</span></p>
                :<p className='mt-5 text-center'>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState('Login')}>Login</span></p>
            }

            <img src={assets.cross_icon}
            onClick={e=>setShowRecruiterLogin(false)}
            className='absolute top-5 right-5 cursor-pointer'
            alt="" />
        </form>
    </div>
  )
}

export default RecruiterLogin

