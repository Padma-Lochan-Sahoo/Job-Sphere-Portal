import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [applicants, setApplicants] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Fetch company job applications data
  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/applicants`, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });

      if (data.success) {
        // Reverse so latest applications appear first
        setApplicants(data.applications.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Update job application status
  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/company/change-status`,
        { id, status },
        { headers: { Authorization: `Bearer ${companyToken}` } }
      );

      if (data.success) {
        setApplicants((prevApplicants) =>
          prevApplicants.map((applicant) =>
            applicant._id === id ? { ...applicant, status } : applicant
          )
        );
        toast.success(`Application ${status}`);
        setRefresh((prev) => !prev);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplications();
    } else {
      console.log("No companyToken found");
    }
  }, [companyToken, refresh]);

  return applicants ? (
    applicants.length === 0 ? (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-xl sm:text-2xl">No Applications Available</p>
      </div>
    ) : (
      <div className="container mx-auto p-4">
        <table className="w-full max-w-4xl bg-white border border-gray-200 max-sm:text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left px-4">#</th>
              <th className="py-2 text-left px-4">User Name</th>
              <th className="py-2 text-left px-4 max-sm:hidden">Job Title</th>
              <th className="py-2 text-left px-4 max-sm:hidden">Location</th>
              <th className="py-2 text-left px-4">Resume</th>
              <th className="py-2 text-left px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {applicants
              .filter((item) => item.jobId && item.userId)
              .map((applicant, index) => (
                
                <tr key={index} className="text-gray-700">
                  <td className="py-2 px-4 border-b text-center">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 border-b text-center flex items-center">
                    <img
                      className="w-10 h-10 rounded-full mr-3 max-sm:hidden"
                      src={applicant.userId.image}
                      alt=""
                    />
                    <span>{applicant.userId.name}</span>
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {applicant.jobId.title}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {applicant.jobId.location}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <a
                      className="bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex gap-2 items-center"
                      href={applicant.userId.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Resume
                      <img src={assets.resume_download_icon} alt="" />
                    </a>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {/* If status is already set (Accepted/Rejected), show it as static */}
                    {/* If status is already set (Accepted/Rejected), show it as static */}
                    

                    {applicant.status === "Accepted" || applicant.status === "Rejected" ? (
                      <span
                        className={`px-2 py-1 rounded font-bold ${
                          applicant.status === "Accepted"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {applicant.status}
                      </span>
                    ) : (
                      // Otherwise, show the action dropdown
                      <div className="relative inline-block text-left group">
                        <button className="text-gray-500 action-button">
                          ...
                        </button>
                        <div className="z-10 hidden absolute right-0 left-0 top-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow group-hover:block">
                          <button
                            onClick={() =>
                              changeJobApplicationStatus(
                                applicant._id,
                                "Accepted"
                              )
                            }
                            className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              changeJobApplicationStatus(
                                applicant._id,
                                "Rejected"
                              )
                            }
                            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )
  ) : (
    <Loading />
  );
};

export default ViewApplications;
