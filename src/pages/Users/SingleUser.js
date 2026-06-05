import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ShoppingBag,
    Heart,
    Shield,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Star,
    Home,
    Briefcase,
    Navigation,
    Clock
} from "lucide-react";

const API = "https://brublabackend.onrender.com/api/admin";

const SingleUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => sessionStorage.getItem("adminToken");

    const fetchUser = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setUser(response.data.user);
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
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "Admin":
                return "bg-red-500/20 text-red-400";
            case "Designer":
                return "bg-purple-500/20 text-purple-400";
            case "Tailor":
                return "bg-blue-500/20 text-blue-400";
            case "Stylist":
                return "bg-pink-500/20 text-pink-400";
            default:
                return "bg-gray-500/20 text-gray-400";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-[#94A3B8]">User not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard/users")}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">User Details</h1>
                        <p className="text-[#94A3B8] text-sm mt-1">View complete user information</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/dashboard/users/edit/${user._id}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                    >
                        <Edit size={16} />
                        Edit User
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white text-3xl font-bold mb-4">
                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <h2 className="text-xl font-bold text-white">{user.name || "Unnamed User"}</h2>
                            <p className="text-[#94A3B8] text-sm mt-1">User ID: {user._id}</p>
                            <div className="mt-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                                    <Shield size={14} />
                                    {user.role || "User"}
                                </span>
                            </div>
                            <div className="mt-3">
                                {user.isVerified ? (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm">
                                        <CheckCircle size={14} />
                                        Verified Account
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-red-400 text-sm">
                                        <XCircle size={14} />
                                        Unverified Account
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                            <div className="flex items-center gap-3 text-[#94A3B8]">
                                <Mail size={16} className="text-[#C026D3]" />
                                <span className="text-sm">{user.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#94A3B8]">
                                <Phone size={16} className="text-[#C026D3]" />
                                <span className="text-sm">{user.mobile || "No mobile"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#94A3B8]">
                                <Calendar size={16} className="text-[#C026D3]" />
                                <span className="text-sm">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#94A3B8]">
                                <Clock size={16} className="text-[#C026D3]" />
                                <span className="text-sm">Last Updated: {new Date(user.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {user.about && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-[#94A3B8] text-sm mb-2">About</p>
                                <p className="text-white text-sm">{user.about}</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                            <Heart size={20} className="text-[#C026D3] mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{user.wishlist?.length || 0}</p>
                            <p className="text-xs text-[#94A3B8]">Wishlist Items</p>
                        </div>
                        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                            <ShoppingBag size={20} className="text-[#C026D3] mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{user.orders?.length || 0}</p>
                            <p className="text-xs text-[#94A3B8]">Total Orders</p>
                        </div>
                        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                            <MapPin size={20} className="text-[#C026D3] mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{user.addresses?.length || 0}</p>
                            <p className="text-xs text-[#94A3B8]">Addresses</p>
                        </div>
                        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                            <Star size={20} className="text-[#C026D3] mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{user.cart?.length || 0}</p>
                            <p className="text-xs text-[#94A3B8]">Cart Items</p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Addresses */}
                    {user.addresses && user.addresses.length > 0 && (
                        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-[#C026D3]" />
                                Saved Addresses ({user.addresses.length})
                            </h3>
                            <div className="space-y-3">
                                {user.addresses.map((address, index) => (
                                    <div key={address._id || index} className="bg-white/5 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {address.type === "home" ? (
                                                    <Home size={14} className="text-emerald-400" />
                                                ) : (
                                                    <Briefcase size={14} className="text-blue-400" />
                                                )}
                                                <span className="text-white font-semibold capitalize">{address.type}</span>
                                                {address.isDefault && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[#94A3B8] text-sm">{address.fullName}</p>
                                        <p className="text-[#94A3B8] text-sm">{address.mobile}</p>
                                        <p className="text-white text-sm mt-2">{address.address}</p>
                                        <p className="text-[#94A3B8] text-sm">
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                        {address.landmark && (
                                            <p className="text-[#94A3B8] text-sm mt-1">Landmark: {address.landmark}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Location */}
                    {user.liveLocation && (
                        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Navigation size={18} className="text-[#C026D3]" />
                                Live Location
                            </h3>
                            <div className="space-y-2">
                                <p className="text-[#94A3B8] text-sm">
                                    Latitude: <span className="text-white">{user.liveLocation.latitude}</span>
                                </p>
                                <p className="text-[#94A3B8] text-sm">
                                    Longitude: <span className="text-white">{user.liveLocation.longitude}</span>
                                </p>
                                <p className="text-[#94A3B8] text-sm">
                                    Last Updated: <span className="text-white">{new Date(user.liveLocation.updatedAt).toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Wishlist Items */}
                    {user.wishlist && user.wishlist.length > 0 && (
                        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Heart size={18} className="text-[#C026D3]" />
                                Wishlist ({user.wishlist.length} items)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {user.wishlist.slice(0, 6).map((item, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-3">
                                        <p className="text-white text-sm">Product ID: {typeof item === 'string' ? item : item._id}</p>
                                        {item.addedAt && (
                                            <p className="text-[#94A3B8] text-xs mt-1">Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                ))}
                                {user.wishlist.length > 6 && (
                                    <p className="text-[#94A3B8] text-sm text-center">+{user.wishlist.length - 6} more items</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleUser;