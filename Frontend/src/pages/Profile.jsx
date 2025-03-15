import React, { useState, useContext,useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Profile = () => {
    const { userData, setUserData, userToken, backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [name, setName] = useState(userData?.name || "");
    const [email, setEmail] = useState(userData?.email || "");
    const [profileImage, setProfileImage] = useState(userData?.image || "");
    const [loading, setLoading] = useState(false);
    const [newImageFile, setNewImageFile] = useState(null);


        // 🚀 Redirect to Home if userData is missing
        useEffect(() => {
            if (!userData) {
                navigate("/");
            }
        }, [userData, navigate]); 

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setProfileImage(URL.createObjectURL(file)); // Show preview
        }
    };

    // Handle Profile Update
    const handleUpdate = async () => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            if (newImageFile) formData.append("profileImage", newImageFile);

            const response = await axios.put(
                `${backendUrl}/api/users/update-profile/${userData._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                setUserData(response.data.user);
                localStorage.setItem("userData", JSON.stringify(response.data.user));
                setProfileImage(response.data.user.image);
                setNewImageFile(null);
                navigate("/");
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Profile update failed!");
        } finally {
            setLoading(false);
        }
    };

    if (!userData) {
        return null; // Prevent rendering while redirecting
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <motion.div
                className="p-8 w-full max-w-lg bg-white rounded-2xl shadow-lg text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold mb-6">Update Profile</h2>

                {/* Profile Image Upload */}
                <div className="flex flex-col items-center">
                    <motion.img
                        src={profileImage || "/default-avatar.png"}
                        alt="Profile"
                        className="w-32 h-32 rounded-full mb-4 border shadow-md"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    />

                    <label className="cursor-pointer bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold text-sm hover:bg-gray-400 transition">
                        Choose File
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                            className="hidden"
                        />
                    </label>

                    {loading && (
                        <motion.div
                            className="text-blue-500 text-sm mt-2"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            Uploading...
                        </motion.div>
                    )}
                </div>

                {/* Name Input */}
                <label className="block mt-6 text-left">
                    <span className="text-gray-700 font-medium">Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                    />
                </label>

                {/* Email Input */}
                <label className="block mt-4 text-left">
                    <span className="text-gray-700 font-medium">Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                    />
                </label>

                {/* Update Button */}
                <motion.button
                    onClick={handleUpdate}
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg w-full text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                >
                    {loading ? (
                        <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></motion.div>
                    ) : (
                        "Update Profile"
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Profile;
