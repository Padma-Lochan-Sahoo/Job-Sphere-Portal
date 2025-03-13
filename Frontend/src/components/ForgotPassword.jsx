import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from './Loading';

const ForgotPassword = () => {
    const { backendUrl } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetLinkSent, setIsResetLinkSent] = useState(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send email to a generic endpoint
            const endpoint = `${backendUrl}/api/company/forgot-password`;
            const { data } = await axios.post(endpoint, { email });

            if (data.success) {
                setIsResetLinkSent(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset link");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
                {isResetLinkSent && (
                    <p className="text-sm text-center text-gray-600 mb-6">
                        A reset link has been sent to your email. Please use it to reset your password.
                    </p>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter your email:
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Reset Password"}
                    </button>
                </form>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full text-center text-blue-600 mt-4 hover:underline focus:outline-none"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;