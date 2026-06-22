import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Users,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Calendar,
    RefreshCw,
    UserCheck,
    UserX,
    Clock,
    Package,
    AlertCircle,
    Shield,
    User,
    Building,
    Wallet
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const PendingDesigners = () => {
    const navigate = useNavigate();
    const [pendingDesigners, setPendingDesigners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPending, setTotalPending] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState({});
    const designersPerPage = 10;

    const getToken = () => sessionStorage.getItem("adminToken");

    const fetchPendingDesigners = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/pendingdesigners`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setPendingDesigners(response.data.pendingDesigners);
                setTotalPending(response.data.total || response.data.count);
                setTotalPages(response.data.pages || 1);
            }
        } catch (error) {
            console.error("Error fetching pending designers:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch pending designers",
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
        fetchPendingDesigners();
    }, []);

    const handleApprove = async (designerId, designerName) => {
        const result = await Swal.fire({
            title: "Approve Designer?",
            text: `Are you sure you want to approve ${designerName || "this designer"}?`,
            icon: "question",
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Yes, Approve",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                setActionLoading(prev => ({ ...prev, [designerId]: "approve" }));
                const token = getToken();
                await axios.patch(
                    `${API}/designers/${designerId}/approve`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                Swal.fire({
                    title: "Approved!",
                    text: "Designer has been approved successfully",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchPendingDesigners();
            } catch (error) {
                console.error("Error approving designer:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to approve designer",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            } finally {
                setActionLoading(prev => ({ ...prev, [designerId]: null }));
            }
        }
    };

    const handleReject = async (designerId, designerName) => {
        const { value: rejectionReason } = await Swal.fire({
            title: "Reject Designer?",
            text: `Please provide a reason for rejecting ${designerName || "this designer"}`,
            icon: "warning",
            input: "textarea",
            inputPlaceholder: "Enter rejection reason...",
            inputAttributes: {
                "aria-label": "Rejection reason",
            },
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Yes, Reject",
            cancelButtonText: "Cancel",
            inputValidator: (value) => {
                if (!value || value.trim() === "") {
                    return "Please provide a rejection reason";
                }
                return null;
            },
        });

        if (rejectionReason) {
            try {
                setActionLoading(prev => ({ ...prev, [designerId]: "reject" }));
                const token = getToken();
                await axios.patch(
                    `${API}/designers/${designerId}/reject`,
                    { rejectionReason },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                Swal.fire({
                    title: "Rejected!",
                    text: "Designer has been rejected successfully",
                    icon: "info",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchPendingDesigners();
            } catch (error) {
                console.error("Error rejecting designer:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to reject designer",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            } finally {
                setActionLoading(prev => ({ ...prev, [designerId]: null }));
            }
        }
    };

    const filteredDesigners = pendingDesigners.filter((designer) => {
        const matchesSearch =
            searchTerm === "" ||
            (designer.name && designer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (designer.email && designer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (designer.mobile && designer.mobile.includes(searchTerm)) ||
            (designer.brandName && designer.brandName.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    const indexOfLastDesigner = currentPage * designersPerPage;
    const indexOfFirstDesigner = indexOfLastDesigner - designersPerPage;
    const currentDesigners = filteredDesigners.slice(indexOfFirstDesigner, indexOfLastDesigner);
    const pageTotal = Math.ceil(filteredDesigners.length / designersPerPage);

    const getWaitingDaysText = (days) => {
        if (days === 0) return "Today";
        if (days === 1) return "1 day";
        return `${days} days`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Clock size={28} className="text-amber-400" />
                        Pending Designers
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        Review and approve designer registration requests
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPendingDesigners}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-200"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Pending Approvals</p>
                            <p className="text-2xl font-bold text-white">{totalPending}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Clock size={20} className="text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">With Brand Name</p>
                            <p className="text-2xl font-bold text-white">
                                {pendingDesigners.filter(d => d.brandName && d.brandName.trim() !== "").length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Building size={20} className="text-purple-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Verified Accounts</p>
                            <p className="text-2xl font-bold text-white">
                                {pendingDesigners.filter(d => d.isVerified).length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <UserCheck size={20} className="text-emerald-400" />
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
                            placeholder="Search by name, email, mobile or brand name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Pending Designers Table */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {pendingDesigners.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <CheckCircle size={32} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Pending Approvals</h3>
                                <p className="text-[#94A3B8]">All designers have been reviewed and processed.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Designer</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Contact</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Brand</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Waiting</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {currentDesigners.map((designer) => (
                                                <tr key={designer._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                                                {designer.name ? designer.name.charAt(0).toUpperCase() : "D"}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-semibold">{designer.name || "Unnamed"}</p>
                                                                <p className="text-[#94A3B8] text-xs flex items-center gap-1">
                                                                    <Shield size={10} />
                                                                    Designer
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                                                                <Mail size={14} />
                                                                {designer.email || "No email"}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                                                                <Phone size={14} />
                                                                {designer.mobile || "No mobile"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {designer.brandName ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                                <Building size={12} />
                                                                {designer.brandName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[#94A3B8] text-xs">Not specified</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                                <Clock size={12} />
                                                                Pending Approval
                                                            </span>
                                                            {designer.isVerified && (
                                                                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                                                    <UserCheck size={12} />
                                                                    Verified
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                                                            <Calendar size={12} />
                                                            {getWaitingDaysText(designer.waitingDays || 0)}
                                                        </div>
                                                        <div className="text-[#94A3B8] text-xs mt-1">
                                                            {new Date(designer.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/dashboard/designers/${designer._id}`)}
                                                                className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                                                title="View Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleApprove(designer._id, designer.name)}
                                                                disabled={actionLoading[designer._id] === "approve" || actionLoading[designer._id] === "reject"}
                                                                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Approve Designer"
                                                            >
                                                                {actionLoading[designer._id] === "approve" ? (
                                                                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <CheckCircle size={16} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(designer._id, designer.name)}
                                                                disabled={actionLoading[designer._id] === "approve" || actionLoading[designer._id] === "reject"}
                                                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Reject Designer"
                                                            >
                                                                {actionLoading[designer._id] === "reject" ? (
                                                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <XCircle size={16} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pageTotal > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                                        <p className="text-sm text-[#94A3B8]">
                                            Showing {indexOfFirstDesigner + 1} to {Math.min(indexOfLastDesigner, filteredDesigners.length)} of {filteredDesigners.length} pending designers
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-white text-sm">
                                                {currentPage} / {pageTotal}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageTotal))}
                                                disabled={currentPage === pageTotal}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PendingDesigners;