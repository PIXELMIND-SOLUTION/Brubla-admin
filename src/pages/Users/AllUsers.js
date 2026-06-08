import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Users,
    Search,
    Eye,
    Edit,
    Trash2,
    Filter,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    RefreshCw,
    Shield,
    Star,
    MapPin,
    ShoppingBag
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const AllUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [roleFilter, setRoleFilter] = useState("all");
    const [verificationFilter, setVerificationFilter] = useState("all");
    const usersPerPage = 10;

    // Get token from sessionStorage
    const getToken = () => sessionStorage.getItem("adminToken");

    // Fetch all users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setUsers(response.data.users);
                setTotalUsers(response.data.count);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch users",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Delete user
    const deleteUser = async (userId, userName) => {
        const result = await Swal.fire({
            title: "Delete User?",
            text: `Are you sure you want to delete ${userName || "this user"}?`,
            icon: "warning",
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                const token = getToken();
                await axios.delete(`${API}/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                Swal.fire({
                    title: "Deleted!",
                    text: "User has been deleted successfully",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to delete user",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            }
        }
    };

    // Filter users based on search, role, and verification
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            searchTerm === "" ||
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.mobile && user.mobile.includes(searchTerm));

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesVerification =
            verificationFilter === "all" ||
            (verificationFilter === "verified" && user.isVerified) ||
            (verificationFilter === "unverified" && !user.isVerified);

        return matchesSearch && matchesRole && matchesVerification;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "Admin":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "Designer":
                return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            case "Tailor":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "Stylist":
                return "bg-pink-500/20 text-pink-400 border-pink-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "Designer":
                return <Shield size={12} />;
            case "Tailor":
                return <Star size={12} />;
            case "Stylist":
                return <Star size={12} />;
            default:
                return <UserCheck size={12} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Users size={28} className="text-[#C026D3]" />
                        All Users
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        Manage and monitor all registered users
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-200"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total Users</p>
                            <p className="text-2xl font-bold text-white">{totalUsers}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
                            <Users size={20} className="text-[#C026D3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Verified Users</p>
                            <p className="text-2xl font-bold text-white">
                                {users.filter(u => u.isVerified).length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <UserCheck size={20} className="text-emerald-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Designers & Tailors</p>
                            <p className="text-2xl font-bold text-white">
                                {users.filter(u => u.role === "Designer" || u.role === "Tailor" || u.role === "Stylist").length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Shield size={20} className="text-purple-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">With Addresses</p>
                            <p className="text-2xl font-bold text-white">
                                {users.filter(u => u.addresses && u.addresses.length > 0).length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <MapPin size={20} className="text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search by name, email or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none transition-all cursor-pointer"
                    >
                        <option value="all">All Roles</option>
                        <option value="User">Users</option>
                        <option value="Designer">Designers</option>
                        <option value="Tailor">Tailors</option>
                        <option value="Stylist">Stylists</option>
                        <option value="Admin">Admins</option>
                    </select>

                    {/* Verification Filter */}
                    <select
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none transition-all cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white font-bold">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold">{user.name || "Unnamed User"}</p>
                                                        <p className="text-[#94A3B8] text-xs">{user.email || "No email"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                                                    <Phone size={14} />
                                                    {user.mobile || "No mobile"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                    {user.role || "User"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isVerified ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        <UserCheck size={12} />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                                                        <UserX size={12} />
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                                                    <Calendar size={12} />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/users/${user._id}`)}
                                                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/users/edit/${user._id}`)}
                                                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user._id, user.name)}
                                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                                <p className="text-sm text-[#94A3B8]">
                                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-3 py-1 rounded-lg bg-[#C026D3]/20 text-white text-sm">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllUsers;