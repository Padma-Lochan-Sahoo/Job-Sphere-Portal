import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const JobCard = ({ job = {} }) => {

  const navigate = useNavigate();
  const { setShowUserLogin ,userToken} = useContext(AppContext)

  return (
    <div className='border p-6 shadow rounded'>
      <div className='flex justify-between items-center'>
        {job.companyId?.image ? (
          <img className='h-8' src={job.companyId.image} alt="Company Logo" />
        ) : (
          <div className="h-8 w-8 bg-gray-200 flex items-center justify-center text-gray-500">
            No Logo
          </div>
        )}
      </div>
      <h4 className='font-medium text-xl mt-2'>{job.title || "Unknown Title"}</h4>
      <div className='flex items-center gap-3 mt-2 text-xs'>
        <span className='bg-blue-50 border-blue-200 px-4 py-1.5 rounded'>
          {job.location || "Location Not Available"}
        </span>
        <span className='bg-red-50 border-red-200 px-4 py-1.5 rounded'>
          {job.level || "Level Not Specified"}
        </span>
      </div>
      <p className='text-gray-500 text-sm mt-4'>
        {job.description ? (
          <span dangerouslySetInnerHTML={{ __html: job.description.slice(0, 150) }}></span>
        ) : (
          "No description available."
        )}
      </p>
      <div className='flex mt-4 gap-4 text-sm'>
        <button
          onClick={() => {if(userToken){
            navigate(`/apply-job/${job._id}`)
          }else{
            scrollTo(0, 0);
            setShowUserLogin(true)

          }
          }}
          className='bg-blue-600 px-4 py-2 text-white rounded'
        >
          Apply now
        </button>
        <button
          onClick={() => {if(userToken){
            navigate(`/apply-job/${job._id}`)
          }else{
            scrollTo(0, 0);
            setShowUserLogin(true)

          }
          }}
          className='text-gray-500 border border-gray-500 rounded px-4 py-2'
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default JobCard;
