import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AppContext = createContext();

const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [searchFilter, setSearchFilter] = useState({
        title: "",
        location: ""
    });

    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);  // Added for user login modal

    // Recruiter states
    const [companyToken, setCompanyToken] = useState(null);
    const [companyData, setCompanyData] = useState(null);

    // User states
    const [userToken, setUserToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userApplications, setUserApplications] = useState(null);

    // Fetch Jobs
    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/jobs`);
            const data = response.data;

            if (data.success) {
                setJobs(data.jobs);
            } else {
                toast.error(data.message || "Failed to fetch jobs");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch Recruiter Data
    const fetchCompanyData = async () => {
        try {
            if (!companyToken) return;
            const { data } = await axios.get(`${backendUrl}/api/company/company`, {
                headers: { Authorization: `Bearer ${companyToken}` }
            });
    

            if (data.success) {
                setCompanyData(data.company);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch User Data
    const fetchUserData = async () => {
        try {
            if (!userToken) {
                return;
            }
    
            const { data } = await axios.get(`${backendUrl}/api/users/user`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (data.success) {
                setUserData(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching user data:", error.response?.data || error.message);
            toast.error(error.message);
        }
    };
    
    

    // Fetch User Applications
    const fetchUserApplications = async () => {
        try {
            if (!userToken) return;
            const { data } = await axios.get(`${backendUrl}/api/users/applications`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (data.success) {
                setUserApplications(data.applications);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // User Login Function
    const loginUser = async (email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/users/login`, { email, password });
            if (data.success) {
                // This data.token generate undefined

                localStorage.setItem("userToken", data.token); // Store token in localStorage
                setUserToken(data.token);
                setUserData(data.user);
                setShowUserLogin(false);
                toast.success("Login successful!");

            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed.");
        }
    };

    // User Registration Function
    const registerUser = async (formData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/users/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            if (data.success) {
                setUserData(data.user);
                setUserToken(data.token);
                localStorage.setItem("userToken", data.token);
                toast.success("Registration successful!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed.");
        }
    };
    

    // Logout User
    const logoutUser = () => {
        setUserToken(null);
        setUserData(null);
        localStorage.removeItem("userToken");
        toast.success("Logged out successfully!");
    };

    useEffect(() => {
        fetchJobs();
        
        // Load stored recruiter token
        const storedCompanyToken = localStorage.getItem("companyToken");
        if (storedCompanyToken) setCompanyToken(storedCompanyToken);

        // Load stored user token
        const storedUserToken = localStorage.getItem("userToken");
        if (storedUserToken) setUserToken(storedUserToken);
    }, []);

    useEffect(() => {
        if (companyToken) fetchCompanyData();
    }, [companyToken]);

    
    

    useEffect(() => {
        if (userToken) {
            fetchUserData();
            fetchUserApplications();
        }
    }, [userToken]);
    

    const value = {
        searchFilter, setSearchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        showUserLogin, setShowUserLogin,  // Added for user login modal
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        userToken, setUserToken,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications,
        loginUser, registerUser, logoutUser,  // Added authentication functions
        backendUrl
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export { AppContext, AppContextProvider };
