// First implemented forget password page


import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from './Loading'

const ForgotPassword = () => {
    const { backendUrl } = useContext(AppContext)
    const [email, setEmail] = useState('')
    const [loading,setLoading] = useState(false);


    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            console.log(email,backendUrl)
            const { data } = await axios.post(`${backendUrl}/api/company/forgot-password`,{ email })
            console.log(data)

            if(data.success){
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset link");
        }
        setLoading(false);
    };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
    <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

    {loading ? (
        <Loading/>
    ):<form onSubmit={handleForgotPassword} className="w-96 bg-white shadow-md p-6 rounded">
        <label className="block mb-2">Enter your email:</label>
        <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
        />
        <button 
            type="submit"
            className="w-full bg-blue-500 text-white mt-4 py-2 rounded"
            disabled={loading}
        >
            {loading ? "Sending..." : "Send Reset Link"}
        </button>
    </form>}
    
</div>
  )
}

export default ForgotPassword