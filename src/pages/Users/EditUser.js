import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Shield,
    CheckCircle,
    X,
    Camera
} from "lucide-react";

const API = "https://brublabackend.onrender.com/api/admin";

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "User",
        isVerified: false,
        about: ""
    });

    const getToken = () => sessionStorage.getItem("adminToken");

    const fetchUser = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${API}/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                const user = response.data.user;
                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    mobile: user.mobile || "",
                    role: user.role || "User",
                    isVerified: user.isVerified || false,
                    about: user.about || ""
                });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch user details",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            navigate("/dashboard/users");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: "Update User?",
            text: "Are you sure you want to update this user?",
            icon: "question",
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonColor: "#C026D3",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Yes, update",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const token = getToken();
                const response = await axios.put(
                    `${API}/users/${id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.data.success) {
                    Swal.fire({
                        title: "Success!",
                        text: "User has been updated successfully",
                        icon: "success",
                        background: "#071236",
                        color: "#FFFFFF",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    navigate(`/dashboard/users/${id}`);
                }
            } catch (error) {
                console.error("Error updating user:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to update user",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            } finally {
                setLoading(false);
            }
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/dashboard/users/${id}`)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Edit User</h1>
                    <p className="text-[#94A3B8] text-sm mt-1">Update user information</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                    placeholder="Enter mobile number"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                User Role
                            </label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all cursor-pointer"
                                >
                                    <option value="User">User</option>
                                    <option value="Designer">Designer</option>
                                    <option value="Tailor">Tailor</option>
                                    <option value="Stylist">Stylist</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Verification Status
                            </label>
                            <div className="relative">
                                {formData.isVerified ? (
                                    <CheckCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                                ) : (
                                    <X size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                                )}
                                <select
                                    name="isVerified"
                                    value={formData.isVerified}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all cursor-pointer"
                                >
                                    <option value={true}>Verified</option>
                                    <option value={false}>Unverified</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                            About / Bio
                        </label>
                        <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all resize-none"
                            placeholder="Enter user bio or description..."
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => navigate(`/dashboard/users/${id}`)}
                            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;