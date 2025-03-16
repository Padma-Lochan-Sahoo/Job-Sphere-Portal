import React, { useContext, useRef,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const JobCard = ({ job = {} }) => {

  const navigate = useNavigate();
  const { setShowUserLogin ,userToken} = useContext(AppContext)

  const cardRef = useRef(null);
  const applyButtonRef = useRef(null);
  const learnMoreButtonRef = useRef(null);

  // GSAP Scroll Effect
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%", // Animation triggers when card reaches 85% of the viewport
          toggleActions: "play none none none", // Play animation only once
        },
      }
    );
  }, []);

  return (
    <div 
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.5 , ease: "easeOut"}}
      // whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      ref={cardRef}
      className='border p-6 shadow rounded flex flex-col h-full'
      onMouseEnter={() => gsap.to(cardRef.current, { scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)", duration: 0.3 })}
      onMouseLeave={() => gsap.to(cardRef.current, { scale: 1, boxShadow: "0px 5px 10px rgba(0,0,0,0.1)", duration: 0.3 })}
      >

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

      <p className='text-gray-500 text-sm mt-4 flex-grow'>
        {job.description ? (
          <span dangerouslySetInnerHTML={{ __html: job.description.slice(0, 150) }}></span>
        ) : (
          "No description available."
        )}
      </p>
      <div className='flex mt-4 gap-4 text-sm justify-start'>
        <button
        ref={applyButtonRef}
          onClick={() => {if(userToken){
            navigate(`/apply-job/${job._id}`)
          }else{
            scrollTo(0, 0);
            setShowUserLogin(true)

          }
          }}
          // whileHover={{ scale: 1.05 }}
          // whileTap={{ scale: 0.95 }}
          className='bg-blue-600 px-4 py-2 text-white rounded'
          onMouseEnter={() => gsap.to(applyButtonRef.current, { scale: 1.1, duration: 0.2 })}
          onMouseLeave={() => gsap.to(applyButtonRef.current, { scale: 1, duration: 0.2 })}
        >
          Apply now
        </button>
        <button
        ref={learnMoreButtonRef}
          onClick={() => {if(userToken){
            navigate(`/apply-job/${job._id}`)
          }else{
            scrollTo(0, 0);
            setShowUserLogin(true)

          }
          }}
          // whileHover={{ scale: 1.05 }}
          // whileTap={{ scale: 0.95 }}
          className='text-gray-500 border border-gray-500 rounded px-4 py-2'
          onMouseEnter={() => gsap.to(learnMoreButtonRef.current, { scale: 1.1, duration: 0.2 })}
          onMouseLeave={() => gsap.to(learnMoreButtonRef.current, { scale: 1, duration: 0.2 })}
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default JobCard;
