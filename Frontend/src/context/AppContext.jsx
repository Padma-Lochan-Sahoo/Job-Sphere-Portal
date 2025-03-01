import { createContext, useEffect, useState } from "react";
import { jobsData } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

const AppContext = createContext();

const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const { user }=useUser()
    // console.log(user);
    
    const { getToken } = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title: "",
        location: ""
    });
    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);


    // for recruiter login
    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    const [userData ,setUserData] = useState(null)
    const [ userApplications ,setUserApplications] = useState(null)


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
    
    
    
    
        


    // Function to fetch company data
    const fetchCompanyData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/company/company',{headers: {token: companyToken}})

            if(data.success){
                setCompanyData(data.company)
                console.log(data);
                
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to fetch user data
    const fetchUserData = async () => {
        try {
            const token = await getToken()
            
            const { data } = await axios.get(`${backendUrl}/api/users/user`,
                {headers: {Authorization: `Bearer ${token}`}}
            )
            console.log(data);
            
            if(data.success){
                setUserData(data.user)
                console.log(data);
            }else{
                toast.error(data.message)
                console.log(data.message);
                
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
        fetchJobs();
        const storedCompanyToken = localStorage.getItem('companyToken')
        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken)
        }
    }, []);

    useEffect(() => {
        if(companyToken){
            fetchCompanyData()
        }
    }, [companyToken])
    
    useEffect(() => {
        if(user){
            fetchUserData()
        }
    },[user])
    const value = {
        searchFilter, setSearchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken,setCompanyToken,
        companyData,setCompanyData,
        backendUrl
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export { AppContext, AppContextProvider };
