import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Package,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Tag,
    Image,
    Layers,
    AlertCircle,
    ShoppingBag,
    Users,
    Building,
    Filter,
    CheckSquare,
    Square,
    Trash2,
    Edit,
    ChevronDown,
    ChevronUp,
    Info
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const PendingDesignerProducts = () => {
    const navigate = useNavigate();
    
    // State
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [expandedProduct, setExpandedProduct] = useState(null);
    
    const productsPerPage = 10;
    const getToken = () => sessionStorage.getItem("adminToken");

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/designer-products/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setProducts(response.data.products);
                setStats(response.data.stats);
                setTotalProducts(response.data.total || response.data.count);
                setTotalPages(response.data.pages || 1);
                setSelectedProducts([]);
                setSelectAll(false);
            }
        } catch (error) {
            console.error("Error fetching pending products:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch pending products",
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
        fetchPendingProducts();
    }, []);

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p._id));
        }
        setSelectAll(!selectAll);
    };

    const handleBulkApprove = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                title: "No Selection",
                text: "Please select at least one product to approve",
                icon: "info",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            return;
        }

        const result = await Swal.fire({
            title: `Approve ${selectedProducts.length} Products?`,
            text: `Are you sure you want to approve ${selectedProducts.length} product(s)?`,
            icon: "question",
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Yes, Approve All",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                setActionLoading(true);
                const token = getToken();
                await axios.post(
                    `${API}/designer-products/bulk-approve`,
                    { productIds: selectedProducts },
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                Swal.fire({
                    title: "Approved!",
                    text: `${selectedProducts.length} product(s) have been approved successfully`,
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 2000,
                    showConfirmButton: false,
                });

                fetchPendingProducts();
            } catch (error) {
                console.error("Error bulk approving products:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to approve products",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleBulkReject = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                title: "No Selection",
                text: "Please select at least one product to reject",
                icon: "info",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            return;
        }

        const { value: rejectionReason } = await Swal.fire({
            title: `Reject ${selectedProducts.length} Products?`,
            text: `Please provide a reason for rejecting ${selectedProducts.length} product(s)`,
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
            confirmButtonText: "Yes, Reject All",
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
                setActionLoading(true);
                const token = getToken();
                await axios.post(
                    `${API}/designer-products/bulk-reject`,
                    { 
                        productIds: selectedProducts,
                        rejectionReason 
                    },
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                Swal.fire({
                    title: "Rejected!",
                    text: `${selectedProducts.length} product(s) have been rejected`,
                    icon: "info",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 2000,
                    showConfirmButton: false,
                });

                fetchPendingProducts();
            } catch (error) {
                console.error("Error bulk rejecting products:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to reject products",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleSingleApprove = async (productId, productName) => {
        const result = await Swal.fire({
            title: "Approve Product?",
            text: `Are you sure you want to approve "${productName || "this product"}"?`,
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
                const token = getToken();
                await axios.post(
                    `${API}/designer-products/bulk-approve`,
                    { productIds: [productId] },
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                Swal.fire({
                    title: "Approved!",
                    text: "Product has been approved successfully",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchPendingProducts();
            } catch (error) {
                console.error("Error approving product:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to approve product",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            }
        }
    };

    const handleSingleReject = async (productId, productName) => {
        const { value: rejectionReason } = await Swal.fire({
            title: "Reject Product?",
            text: `Please provide a reason for rejecting "${productName || "this product"}"`,
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
                const token = getToken();
                await axios.post(
                    `${API}/designer-products/bulk-reject`,
                    { 
                        productIds: [productId],
                        rejectionReason 
                    },
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                Swal.fire({
                    title: "Rejected!",
                    text: "Product has been rejected",
                    icon: "info",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchPendingProducts();
            } catch (error) {
                console.error("Error rejecting product:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to reject product",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            }
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            searchTerm === "" ||
            (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.category?.name && product.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.creator?.name && product.creator.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.creator?.email && product.creator.email.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const pageTotal = Math.ceil(filteredProducts.length / productsPerPage);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const toggleExpand = (productId) => {
        setExpandedProduct(expandedProduct === productId ? null : productId);
    };

    // Stats Cards
    const renderStats = () => {
        if (!stats) return null;
        
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Pending Products</p>
                            <p className="text-2xl font-bold text-amber-400">{stats.totalPending}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Clock size={20} className="text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Designers with Pending</p>
                            <p className="text-2xl font-bold text-white">{stats.designersWithPending}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Users size={20} className="text-purple-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total Designers</p>
                            <p className="text-2xl font-bold text-white">{stats.totalDesigners}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Building size={20} className="text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Oldest Waiting</p>
                            <p className="text-2xl font-bold text-red-400">{stats.oldestWaiting || "N/A"}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <AlertCircle size={20} className="text-red-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Categories with Pending</p>
                            <p className="text-2xl font-bold text-white">{stats.categoriesWithPending}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Tag size={20} className="text-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Package size={28} className="text-amber-400" />
                        Pending Products
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        Review and approve products submitted by designers
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPendingProducts}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-200"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            {renderStats()}

            {/* Bulk Actions & Search */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search by product name, category, or designer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedProducts.length > 0 && (
                            <>
                                <button
                                    onClick={handleBulkApprove}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={16} />
                                    Approve ({selectedProducts.length})
                                </button>
                                <button
                                    onClick={handleBulkReject}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle size={16} />
                                    Reject ({selectedProducts.length})
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <CheckCircle size={32} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Pending Products</h3>
                                <p className="text-[#94A3B8]">All products have been reviewed and processed.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-4 py-4 text-left">
                                                    <button
                                                        onClick={handleSelectAll}
                                                        className="text-[#94A3B8] hover:text-white transition-all"
                                                    >
                                                        {selectAll ? (
                                                            <CheckSquare size={18} className="text-amber-400" />
                                                        ) : (
                                                            <Square size={18} />
                                                        )}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Designer</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Waiting</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {currentProducts.map((product) => (
                                                <>
                                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <button
                                                                onClick={() => handleSelectProduct(product._id)}
                                                                className="text-[#94A3B8] hover:text-white transition-all"
                                                            >
                                                                {selectedProducts.includes(product._id) ? (
                                                                    <CheckSquare size={18} className="text-amber-400" />
                                                                ) : (
                                                                    <Square size={18} />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {product.mainImage ? (
                                                                    <img 
                                                                        src={product.mainImage} 
                                                                        alt={product.name}
                                                                        className="w-12 h-12 rounded-lg object-cover bg-white/5"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                                                                        <Image size={20} className="text-[#94A3B8]" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-white font-semibold">{product.name}</p>
                                                                    <p className="text-[#94A3B8] text-xs truncate max-w-[150px]">
                                                                        {product.description?.substring(0, 40)}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => toggleExpand(product._id)}
                                                                        className="text-xs text-amber-400 hover:text-amber-300 mt-1 flex items-center gap-1"
                                                                    >
                                                                        {expandedProduct === product._id ? (
                                                                            <>Hide Details <ChevronUp size={12} /></>
                                                                        ) : (
                                                                            <>Show Details <ChevronDown size={12} /></>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                                <Tag size={12} />
                                                                {product.category?.name || "Uncategorized"}
                                                            </span>
                                                            {product.subcategoryName && (
                                                                <div className="text-[#94A3B8] text-xs mt-1">
                                                                    {product.subcategoryName}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="text-white font-semibold">{formatPrice(product.displayPrice)}</p>
                                                                {product.displayActualPrice && (
                                                                    <p className="text-[#94A3B8] text-xs line-through">{formatPrice(product.displayActualPrice)}</p>
                                                                )}
                                                                {product.maxDiscount > 0 && (
                                                                    <p className="text-emerald-400 text-xs">-{product.maxDiscount}%</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {product.creator ? (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                                            {product.creator.name?.charAt(0).toUpperCase() || "D"}
                                                                        </div>
                                                                        <span className="text-white text-sm">{product.creator.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                                                                        <Mail size={12} />
                                                                        {product.creator.email}
                                                                    </div>
                                                                    {product.creator.brandName && (
                                                                        <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                                                                            <Building size={12} />
                                                                            {product.creator.brandName}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-[#94A3B8] text-sm">Unknown</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-1">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                                    <Clock size={12} />
                                                                    {product.waitingTime || "Pending"}
                                                                </span>
                                                                <div className="text-[#94A3B8] text-xs">
                                                                    {new Date(product.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => navigate(`/dashboard/products/${product._id}`)}
                                                                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                                                    title="View Product"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSingleApprove(product._id, product.name)}
                                                                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSingleReject(product._id, product.name)}
                                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedProduct === product._id && (
                                                        <tr>
                                                            <td colSpan="7" className="px-6 py-4 bg-white/5">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {/* Product Details */}
                                                                    <div className="space-y-2">
                                                                        <h4 className="text-white font-semibold text-sm">Product Details</h4>
                                                                        <div className="text-[#94A3B8] text-sm space-y-1">
                                                                            <p><span className="text-white">ID:</span> {product._id}</p>
                                                                            <p><span className="text-white">Stock:</span> {product.totalStock || 0}</p>
                                                                            <p><span className="text-white">Variants:</span> {product.variantsCount || 0}</p>
                                                                            <p><span className="text-white">Tags:</span> {product.tags?.join(", ") || "None"}</p>
                                                                        </div>
                                                                    </div>
                                                                    {/* Variants */}
                                                                    {product.variants && product.variants.length > 0 && (
                                                                        <div className="space-y-2">
                                                                            <h4 className="text-white font-semibold text-sm">Variants ({product.variants.length})</h4>
                                                                            <div className="space-y-1">
                                                                                {product.variants.map((variant, idx) => (
                                                                                    <div key={idx} className="text-[#94A3B8] text-xs bg-white/5 p-2 rounded">
                                                                                        <span className="text-white">{variant.color}</span>
                                                                                        <span className="mx-2">|</span>
                                                                                        {formatPrice(variant.price)}
                                                                                        <span className="mx-2">|</span>
                                                                                        Sizes: {variant.sizes?.join(", ") || "N/A"}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {/* Delivery & Info */}
                                                                    <div className="space-y-2">
                                                                        <h4 className="text-white font-semibold text-sm">Additional Info</h4>
                                                                        <div className="text-[#94A3B8] text-sm space-y-1">
                                                                            {product.deliveryAddresses && product.deliveryAddresses.length > 0 && (
                                                                                <p><span className="text-white">Delivery:</span> {product.deliveryAddresses.join(", ")}</p>
                                                                            )}
                                                                            <p><span className="text-white">Colors:</span> {product.colors?.join(", ") || "N/A"}</p>
                                                                            <p><span className="text-white">Sizes:</span> {product.sizes?.join(", ") || "N/A"}</p>
                                                                            <p><span className="text-white">Created:</span> {new Date(product.createdAt).toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pageTotal > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                                        <p className="text-sm text-[#94A3B8]">
                                            Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
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

export default PendingDesignerProducts;