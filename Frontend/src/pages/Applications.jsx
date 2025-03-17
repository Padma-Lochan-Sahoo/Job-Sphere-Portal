import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { assets } from '../assets/assets'
import moment from 'moment'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from "axios";
import { useNavigate } from 'react-router-dom'


const Applications = () => {
  const navigate = useNavigate()
  const [isEdit,setIsEdit] = useState(false)
  const [resume , setResume] = useState(null)
  const { backendUrl, userData, userToken, userApplications, fetchUserApplications,fetchUserData } = useContext(AppContext);

  const updateResume = async () => {
    try {
      console.log("Resume being uploaded:", resume);

if (!(resume instanceof File)) {
  console.error("Invalid resume file:", resume);
  toast.error("Invalid file selected!");
  return;
}

      const formData = new FormData()
      formData.append('resume', resume)

      // const token = await getToken()
      console.log("Token being sent:", userToken);

      console.log("FormData content:");
for (let [key, value] of formData.entries()) {
  if (value instanceof File) {
    console.log(`Key: ${key}, File Name: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
  } else {
    console.log(`Key: ${key}, Value: ${value}`);
  }
}


      const { data } = await axios.post(backendUrl+`/api/users/update-resume`,
        formData,
        { headers:{Authorization: `Bearer ${userToken}`,
          "Content-Type": "multipart/form-data" 
      }}
      )
      console.log(data)
      if(data.success){
        toast.success(data.message)
        await fetchUserData()
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
    setIsEdit(false)
    setResume(null)
  }

  useEffect(() => {
    if (!userToken) {
      navigate("/"); // Redirect if not logged in
    } else {
      fetchUserApplications();
    }
  }, [userToken, navigate]);

  // useEffect(()=>{
  //   fetchUserApplications()
  // },[userToken])

  return (
    <>
      <Navbar/>
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        <h2 className='text-xl font-semibold'>Your Resume</h2>
        <div className='flex gap-2 mb-6 mt-3'>
          {
            isEdit || userData && userData.resume === ""?
            <>
              <label className='flex items-center' htmlFor="resumeUpload">
                <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>{resume ? resume.name : "Select Resume"}</p>
                <input 
                id='resumeUpload'
                onChange={(e)=>setResume(e.target.files[0])}
                accept='.pdf' type="file" hidden/>
                <img src={assets.profile_upload_icon} alt="" />
              </label>
              <button 
              onClick={updateResume}
              className='bg-green-100 text-green-600 rounded-lg px-4 py-2'>save</button>
            </>
            :
            
            <div className='flex gap-2'>
              {console.log("Resume URL:", userData.resume)}
              <a className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg" 
              target='_blank'
              rel="noopener noreferrer"
              // href={userData.resume ? userData.resume : '#'}
              href={userData.resume ? userData.resume.replace('view', 'preview') : '#'}

              >


                View Resume
              </a>
              <button className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'
              onClick={()=>setIsEdit(true)}
              >Edit</button>
            </div>
          }

        </div>
        <h2 className='text-xl font-semibold mb-4'>Job Applied</h2>
        <table className='min-w-full bg-white border rounded-lg'>
          <thead>
            <tr>
              <th className='py-3 px-4 border-b text-left'>Compny</th>
              <th className='py-3 px-4 border-b text-left'>Job Title</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-3 px-4 border-b text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {userApplications?.map((job,index)=> true ? (
              <tr key={index}>
                <td className='py-3 px-4 flex items-center gap-2  border-b'>
                  <img className='w-8 h-8' src={job.companyId?.image} alt="" />
                  {job.companyId?.name}
                </td>
                <td className='py-2 px-4 border-b'>{job.jobId?.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{job.jobId?.location}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                <td className='py-2 px-4 border-b'>
                  <span className={`${job.status === 'Accepted' ? 'bg-green-100' : job.status === 'Rejected' ? 'bg-red-100' : 'bg-blue-100'} px-4 py-1.5 rounded`}> {job.status}</span>
                </td>
              </tr>
            ):(null))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  )
}

export default Applications