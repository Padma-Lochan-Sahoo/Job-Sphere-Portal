import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const UserResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { id, token } = useParams(); // Get id and token from URL
    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContext);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Log the id and token for debugging
            console.log("ID:", id);
            console.log("Token:", token);

            // Call the backend to reset the password
            const endpoint = `${backendUrl}/api/users/reset-password/${id}/${token}`;
            console.log("Endpoint:", endpoint);

            const { data } = await axios.post(endpoint, { newPassword: password });
            console.log("Response Data:", data);

            if (data.success) {
                toast.success('Password reset successfully');
                navigate('/'); // Redirect to login page after successful reset
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            // Log the full error for debugging
            console.error("Error in resetPassword:", error);

            // Display a meaningful error message
            const errorMessage = error.response?.data?.message || "Error resetting password";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
                <form onSubmit={onSubmitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserResetPassword;