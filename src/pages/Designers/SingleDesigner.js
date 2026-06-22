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
    Package,
    CheckCircle,
    XCircle,
    Clock,
    ShoppingBag,
    Eye,
    Edit,
    Trash2,
    AlertCircle
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const SingleDesigner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [designer, setDesigner] = useState(null);
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => sessionStorage.getItem("adminToken");

    const fetchDesigner = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/designers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setDesigner(response.data.designer);
                setStats(response.data.stats);
                setProducts(response.data.products || []);
            }
        } catch (error) {
            console.error("Error fetching designer:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch designer details",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            navigate("/dashboard/designers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesigner();
    }, [id]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle size={12} /> Approved</span>;
            case "pending":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30"><Clock size={12} /> Pending</span>;
            case "rejected":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30"><XCircle size={12} /> Rejected</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!designer) {
        return (
            <div className="text-center py-20">
                <p className="text-[#94A3B8]">Designer not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard/designers")}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Designer Details</h1>
                        <p className="text-[#94A3B8] text-sm mt-1">View complete designer information</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/dashboard/designers/edit/${designer.id}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                    >
                        <Edit size={16} />
                        Edit Designer
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white text-3xl font-bold mb-4">
                                {designer.name ? designer.name.charAt(0).toUpperCase() : "D"}
                            </div>
                            <h2 className="text-xl font-bold text-white">{designer.name || "Unnamed Designer"}</h2>
                            <p className="text-[#94A3B8] text-sm mt-1">Designer ID: {designer.id}</p>
                            <div className="mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    <User size={14} />
                                    Designer
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                            <div className="flex items-center gap-3 text-[#94A3B8]">
                                <Mail size={16} className="text-[#C026D3]" />
                                <span className="text-sm">{designer.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#94A3B8]">
                                <Phone size={16} className="text-[#C026D3]" />
                                <span className="text-sm">{designer.mobile || "No mobile"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#94A3B8]">
                                <Calendar size={16} className="text-[#C026D3]" />
                                <span className="text-sm">Joined: {new Date(designer.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {designer.about && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-[#94A3B8] text-sm mb-2">About</p>
                                <p className="text-white text-sm">{designer.about}</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                                <Package size={20} className="text-[#C026D3] mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                                <p className="text-xs text-[#94A3B8]">Total Products</p>
                            </div>
                            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                                <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">{stats.approved}</p>
                                <p className="text-xs text-[#94A3B8]">Approved</p>
                            </div>
                            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                                <Clock size={20} className="text-amber-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                                <p className="text-xs text-[#94A3B8]">Pending</p>
                            </div>
                            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                                <XCircle size={20} className="text-red-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">{stats.rejected}</p>
                                <p className="text-xs text-[#94A3B8]">Rejected</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Products */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-[#C026D3]" />
                            Products ({products.length})
                        </h3>

                        {products.length === 0 ? (
                            <p className="text-[#94A3B8] text-center py-8">No products added yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <div key={product._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div className="flex-1">
                                                <h4 className="text-white font-semibold">{product.name}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-sm">
                                                    <span className="text-[#94A3B8]">₹{product.displayPrice}</span>
                                                    <span className="text-[#94A3B8]">|</span>
                                                    <span className="text-[#94A3B8]">Stock: {product.totalStock ?? 0}</span>
                                                    <span className="text-[#94A3B8]">|</span>
                                                    <span className="text-[#94A3B8]">Colors: {product.availableColors?.length || 0}</span>
                                                    <span className="text-[#94A3B8]">|</span>
                                                    <span className="text-[#94A3B8]">Sizes: {product.availableSizes?.length || 0}</span>
                                                </div>
                                                {product.rejectionReason && (
                                                    <div className="mt-2 flex items-center gap-1 text-red-400 text-sm">
                                                        <AlertCircle size={14} />
                                                        <span>Rejection reason: {product.rejectionReason}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div>{getStatusBadge(product.approvalStatus)}</div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/products/${product._id}`)}
                                                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                                        title="View Product"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-[#94A3B8] text-xs flex items-center gap-4">
                                            <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                                            <span>Status: {product.isActive ? "Active" : "Inactive"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleDesigner;