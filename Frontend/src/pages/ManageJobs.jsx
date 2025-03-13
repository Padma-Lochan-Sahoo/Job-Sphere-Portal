import React, { useState,useContext, useEffect } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ManageJobs = () => {

    const navigate = useNavigate()

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const { backendUrl , companyToken} = useContext(AppContext)

    // Function to fetch company job Applications
    const fetchCompanyJobs = async () => {

        try {
            setLoading(true);

            const { data } = await axios.get(
                backendUrl + '/api/company/job-list',
                { headers: { Authorization: `Bearer ${companyToken}` } }
            );

            if (data.success) {
                setJobs(data.jobsData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error.response?.data || error.message);
            toast.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };
    
    // Function to change job visibility
    const changeJobVisibility = async (id) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/company/change-visibility",
                { id },
                { headers: { Authorization: `Bearer ${companyToken}` } } // ✅ Fixed
            );

        if(data.success){
            toast.success(data.message)
            fetchCompanyJobs()
        }else{
            toast.error(data.message)
        }
        } catch (error) {
            toast.error('Failed to change job visibility');
        }
    }

    

    useEffect(() => {
        if (companyToken) {
            fetchCompanyJobs();
        }
    }, [companyToken]);
    

    return (
        <div className="container p-4 max-w-5xl">
            {loading ? (
                <div className="flex justify-center items-center h-screen w-full">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500 border-opacity-75"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 max-sm:text-sm">
                            <thead>
                                <tr>
                                    <th className="py-2 border-b text-left max-sm:hidden">#</th>
                                    <th className="py-2 border-b text-left">Job Title</th>
                                    <th className="py-2 border-b text-left max-sm:hidden">Date</th>
                                    <th className="py-2 border-b text-left max-sm:hidden">Location</th>
                                    <th className="py-2 border-b text-center">Applicants</th>
                                    <th className="py-2 border-b text-left">Visible</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job, index) => (
                                    <tr key={index} className="text-gray-700">
                                        <td className="py-2 px-4 border-b max-sm:hidden">{index + 1}</td>
                                        <td className="py-2 px-4 border-b">{job.title}</td>
                                        <td className="py-2 px-4 border-b max-sm:hidden">{moment(job.date).format('ll')}</td>
                                        <td className="py-2 px-4 border-b max-sm:hidden">{job.location}</td>
                                        <td className="py-2 px-4 border-b text-center">{job.applicants}</td>
                                        <td className="py-2 px-4 border-b">
                                            <input
                                                onChange={() => changeJobVisibility(job._id)}
                                                className="scale-125 ml-4"
                                                type="checkbox"
                                                checked={job.visible}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => navigate('/dashboard/add-job')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                        >
                            Add New Job
                        </button>
                    </div>
                </>
            )}
        </div>
    );
    
}

export default ManageJobs