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
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Calendar,
    RefreshCw,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    User,
    ShoppingBag,
    Shirt
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const AllDesigners = () => {
    const navigate = useNavigate();
    const [designers, setDesigners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalDesigners, setTotalDesigners] = useState(0);
    const designersPerPage = 10;

    const getToken = () => sessionStorage.getItem("adminToken");

    const fetchDesigners = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/alldesigners`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setDesigners(response.data.designers);
                setTotalDesigners(response.data.count);
            }
        } catch (error) {
            console.error("Error fetching designers:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch designers",
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
        fetchDesigners();
    }, []);

    const deleteDesigner = async (designerId, designerName) => {
        const result = await Swal.fire({
            title: "Delete Designer?",
            text: `Are you sure you want to delete ${designerName || "this designer"}?`,
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
                await axios.delete(`${API}/users/${designerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                Swal.fire({
                    title: "Deleted!",
                    text: "Designer has been deleted successfully",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchDesigners();
            } catch (error) {
                console.error("Error deleting designer:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to delete designer",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            }
        }
    };

    const filteredDesigners = designers.filter((designer) => {
        const matchesSearch =
            searchTerm === "" ||
            (designer.name && designer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (designer.email && designer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (designer.mobile && designer.mobile.includes(searchTerm));

        return matchesSearch;
    });

    const indexOfLastDesigner = currentPage * designersPerPage;
    const indexOfFirstDesigner = indexOfLastDesigner - designersPerPage;
    const currentDesigners = filteredDesigners.slice(indexOfFirstDesigner, indexOfLastDesigner);
    const totalPages = Math.ceil(filteredDesigners.length / designersPerPage);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Users size={28} className="text-[#C026D3]" />
                        All Designers
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        Manage and monitor all registered designers
                    </p>
                </div>
                <button
                    onClick={fetchDesigners}
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
                            <p className="text-[#94A3B8] text-sm">Total Designers</p>
                            <p className="text-2xl font-bold text-white">{totalDesigners}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
                            <Users size={20} className="text-[#C026D3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">With Products</p>
                            <p className="text-2xl font-bold text-white">
                                {designers.filter(d => d.productStats?.total > 0).length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Package size={20} className="text-purple-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total Products</p>
                            <p className="text-2xl font-bold text-white">
                                {designers.reduce((sum, d) => sum + (d.productStats?.total || 0), 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <ShoppingBag size={20} className="text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Pending Approvals</p>
                            <p className="text-2xl font-bold text-white">
                                {designers.reduce((sum, d) => sum + (d.productStats?.pending || 0), 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Clock size={20} className="text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <div className="flex flex-col md:flex-row gap-4">
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
                </div>
            </div>

            {/* Designers Table */}
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Designer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Products</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Approvals</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentDesigners.map((designer) => (
                                        <tr key={designer._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white font-bold">
                                                        {designer.name ? designer.name.charAt(0).toUpperCase() : "D"}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold">{designer.name || "Unnamed"}</p>
                                                        <p className="text-[#94A3B8] text-xs">{designer.email || "No email"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                                                    <Phone size={14} />
                                                    {designer.mobile || "No mobile"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                    <Package size={12} />
                                                    {designer.productStats?.total || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        <CheckCircle size={12} />
                                                        {designer.productStats?.approved || 0}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                        <Clock size={12} />
                                                        {designer.productStats?.pending || 0}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                                        <XCircle size={12} />
                                                        {designer.productStats?.rejected || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                                                    <Calendar size={12} />
                                                    {new Date(designer.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/designers-products/${designer._id}`)}
                                                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Shirt size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/designer/${designer._id}`)}
                                                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/designers/edit/${designer._id}`)}
                                                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                                                        title="Edit Designer"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteDesigner(designer._id, designer.name)}
                                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                        title="Delete Designer"
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
                                    Showing {indexOfFirstDesigner + 1} to {Math.min(indexOfLastDesigner, filteredDesigners.length)} of {filteredDesigners.length} designers
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

export default AllDesigners;