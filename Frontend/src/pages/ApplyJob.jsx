import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard'
import { toast } from "react-toastify";
import axios from 'axios'

const ApplyJob = () => {
  const { id } = useParams()

  // const {getToken } = useAuth()
  const navigate = useNavigate()
  const [jobData,setJobData] = useState(null)
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)
  const { jobs,backendUrl,userData, userApplications,fetchUserApplications,userToken } = useContext(AppContext)

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`);
      if (data.success) {
        setJobData(data.job); 
      }else{
        toast.error(data.message || "Failed to fetch job");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error(error.message)
    }
  } 

  // later
  const applyHandler = async () => {
    try {
      if (!userData) {
        return toast.error('Login to apply for jobs')
      }
      if(!userData.resume){
        navigate('/applications')
        return toast.error('Upload your resume to apply')
      }
      // const token = await getToken()
      const { data } = await axios.post(backendUrl+`/api/users/apply`,
        {jobId: jobData._id},
        {headers: {Authorization: `Bearer ${userToken}`}}
      )
      if(data.success){
        toast.success(data.message)
        fetchUserApplications()
      } else {
        toast.error(data.message || "Failed to apply for job")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some( item => item.jobId._id === jobData._id)
    setIsAlreadyApplied(hasApplied)
  }

  useEffect(()=>{
      fetchJob()
  },[id])
  useEffect(() => {
    if(userApplications.length > 0 && jobData){
      checkAlreadyApplied()
    }
  }, [jobData,userApplications,id])
  
  return jobData ?(
    <>
      <Navbar />

      <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
        <div className='bg-white text-black rounded-lg w-full'>
          <div className='flex justify-cente md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl'>
            <div className='flex flex-col md:flex-row items-center'>
              <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={jobData.companyId.image} alt="" />
              <div className='text-center md:text-left text-neutral-700'>
                <h1 className='text-2xl sm:text-4xl font-medium'>{jobData.title}</h1>
                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
                  <span className='flex items-center gap-1'>
                    <img src={assets.suitcase_icon} alt="" />
                    {jobData.companyId.name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.location_icon} alt="" />
                    {jobData.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.person_icon} alt="" />
                    {jobData.level}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(jobData.salary)}
                  </span>
                </div>
              </div>
            </div>
              {/* apply Now button and timeing of job posts */}
              <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center'>
                <button onClick={applyHandler} 
                className={`bg-blue-600 p-2.5 px-10 text-white rounded ${isAlreadyApplied ? 'bg-gray-400 cursor-not-allowed':'bg-blue-600'}`}
                disabled={isAlreadyApplied}
                >{isAlreadyApplied?`Already Applied`:`Apply Now`}</button>
{console.log(jobData)}
<p className='mt-1 text-gray-600'>Posted {moment(jobData.date).fromNow()}</p>


              </div>

          </div>
            {/* Job Description part */}
            <div className='flex flex-col lg:flex-row justify-between items-start'>
              <div className='w-full lg:w-2/3'>
                <h2 className='text-2xl font-bold text-neutral-700 mb-4'>Job Description</h2>
                <div className='rich-text' dangerouslySetInnerHTML={{__html:jobData.description}}></div>
                <button onClick={applyHandler} 
                className={`bg-blue-600 p-2.5 px-10 text-white rounded ${isAlreadyApplied ? 'bg-gray-400 cursor-not-allowed':'bg-blue-600'}`}
                disabled={isAlreadyApplied}
                >{isAlreadyApplied?`Already Applied`:`Apply Now`}</button>
              </div>
              {/* Right Section for more Jobs */}
              <div className='w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5'>
                <h2>More Jobs from {jobData.companyId.name}</h2>
                {jobs.filter( (job) => job._id !== jobData._id && job.companyId._id === jobData.companyId._id)
                .filter( job => {
                  // set of Applied JobIds
                  const appliedJobIds = new Set(userApplications.map(app => app.jobId && app.jobId._id))
                  // return true if the user has not already applied for this jobs
                  return !appliedJobIds.has(job._id)
                })
                .slice(0,4)
                .map((job,index)=> <JobCard key={index} job={job}/>)}
              </div>

            </div>

        </div>
      </div>
      
      <Footer/>
    </>
  ):(
    <Loading />
  )
}

export default ApplyJob
