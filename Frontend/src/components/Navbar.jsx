import React, { useContext } from 'react'
import { assets } from '../assets/assets'

import { useClerk , UserButton ,useUser} from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'


const Navbar = () => {

    const {openSignIn} = useClerk()
    const {user} = useUser(); {/* when ever user is logedIn we get user data.*/}

    const navigate = useNavigate()

    const {setShowRecruiterLogin , theme ,toggleTheme} = useContext(AppContext)

  return (
    <div className='shadow py-4'>
        <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
            {/* <img onClick={()=> navigate(`/`)} className='cursor-pointer' src={assets.logo} alt="" /> */}
            <div className='flex items-center gap-2'>
                {/* <img src={assets.logo_png} alt="" /> */}
                <h1 onClick={()=> navigate(`/`)} className='cursor-pointer text-lg font-bold text-gray-700'>JOB SPHERE</h1>
            </div>
            {/* Here we are using Ternary operator to check user is logedIn or not. */}
            {
                user
                ?<div className='flex items-center gap-3'>
                    <Link to={'/applications'}>Applied Jobs</Link>
                    <p>|</p>
                    <p className='max-sm:hidden'>Hi,{user.firstName+" "+user.lastName}</p>
                    <UserButton/>
                </div>
                :<div className='flex gap-4 max-sm:text-xs'>
                <button 
                onClick={e=>setShowRecruiterLogin(true)}
                className='text-gray-600'>Recruiter Login</button>
                <button 
                onClick={(e) => openSignIn() }
                className='bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full'>Login</button>
            </div>
            }
            
        </div>
    </div>
  )
}

export default Navbar