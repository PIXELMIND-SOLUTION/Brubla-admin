import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Package,
    Search,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Filter,
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
    Grid,
    List,
    AlertCircle,
    ShoppingBag,
    Users,
    Building
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const DesignerProducts = () => {
    const { designerId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("table"); // table | grid
    const [designerInfo, setDesignerInfo] = useState(null);

    const productsPerPage = 10;
    const getToken = () => sessionStorage.getItem("adminToken");

    // Get designer info from URL param or query param
    const targetDesignerId = designerId || searchParams.get("designerId");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = getToken();
            let url = `${API}/designer-products`;

            if (targetDesignerId) {
                url += `?designerId=${targetDesignerId}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setProducts(response.data.products);
                setStats(response.data.stats);
                setTotalProducts(response.data.total || response.data.count);
                setTotalPages(response.data.pages || 1);

                if (
                    targetDesignerId &&
                    response?.data?.products?.length > 0 &&
                    response?.data?.products?.[0]?.creator
                ) {
                    setDesignerInfo(response.data.products[0].creator);
                } else {
                    setDesignerInfo(null);
                }
            }
        } catch (error) {
            console.error("Error fetching designer products:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch products",
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
        fetchProducts();
    }, [targetDesignerId]);

    const deleteProduct = async (productId, productName) => {
        const result = await Swal.fire({
            title: "Delete Product?",
            text: `Are you sure you want to delete "${productName || "this product"}"?`,
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
                await axios.delete(`${API}/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                Swal.fire({
                    title: "Deleted!",
                    text: "Product has been deleted successfully",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to delete product",
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
            (product.creator?.name && product.creator.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "all" || product.approvalStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const pageTotal = Math.ceil(filteredProducts.length / productsPerPage);

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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Stats Cards
    const renderStats = () => {
        if (!stats) return null;

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
                            <Package size={20} className="text-[#C026D3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Approved</p>
                            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle size={20} className="text-emerald-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Pending</p>
                            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Clock size={20} className="text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Rejected</p>
                            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <XCircle size={20} className="text-red-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Active</p>
                            <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Tag size={20} className="text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Designer Info Card
    const renderDesignerInfo = () => {
        if (!designerInfo) return null;

        return (
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white font-bold text-lg">
                        {designerInfo.name ? designerInfo.name.charAt(0).toUpperCase() : "D"}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold">{designerInfo.name || "Unknown Designer"}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#94A3B8]">
                            <span className="flex items-center gap-1"><Mail size={14} /> {designerInfo.email || "No email"}</span>
                            <span className="flex items-center gap-1"><Phone size={14} /> {designerInfo.mobile || "No mobile"}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/dashboard/designers/${designerInfo._id}`)}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm transition-all"
                    >
                        View Designer
                    </button>
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
                        <Package size={28} className="text-[#C026D3]" />
                        {targetDesignerId ? "Designer Products" : "All Designer Products"}
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        {targetDesignerId
                            ? `Manage products for this designer`
                            : `View and manage all products from all designers`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchProducts}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-200"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    {targetDesignerId && (
                        <button
                            onClick={() => navigate("/dashboard/designers")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-200"
                        >
                            <Users size={16} />
                            All Designers
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            {renderStats()}

            {/* Designer Info (if filtering by designer) */}
            {renderDesignerInfo()}

            {/* Filters & Search */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search by product name, category, or designer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none transition-all cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-[#C026D3]/20 text-[#C026D3]" : "text-[#94A3B8] hover:text-white"}`}
                                title="Table View"
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#C026D3]/20 text-[#C026D3]" : "text-[#94A3B8] hover:text-white"}`}
                                title="Grid View"
                            >
                                <Layers size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Display */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto rounded-full bg-[#C026D3]/20 flex items-center justify-center mb-4">
                                    <Package size={32} className="text-[#C026D3]" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
                                <p className="text-[#94A3B8]">
                                    {targetDesignerId
                                        ? "This designer hasn't added any products yet."
                                        : "No products have been added yet."}
                                </p>
                            </div>
                        ) : viewMode === "table" ? (
                            // Table View
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Price</th>
                                            {!targetDesignerId && (
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Designer</th>
                                            )}
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Variants</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {currentProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-white/5 transition-colors">
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
                                                            <p className="text-[#94A3B8] text-xs truncate max-w-[200px]">
                                                                {product.description?.substring(0, 60)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                        <Tag size={12} />
                                                        {product.category?.name || "Uncategorized"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-white font-semibold">{formatPrice(product.displayPrice)}</p>
                                                        {product.displayActualPrice && (
                                                            <p className="text-[#94A3B8] text-xs line-through">{formatPrice(product.displayActualPrice)}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                {!targetDesignerId && (
                                                    <td className="px-6 py-4">
                                                        {product.creator ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold">
                                                                    {product.creator.name?.charAt(0).toUpperCase() || "D"}
                                                                </div>
                                                                <span className="text-white text-sm">{product.creator.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[#94A3B8] text-sm">Unknown</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(product.approvalStatus)}
                                                    {product.isActive && (
                                                        <span className="block text-emerald-400 text-xs mt-1">Active</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                        <Layers size={12} />
                                                        {product.variantsCount || 0}
                                                    </span>
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
                                                            onClick={() => navigate(`/dashboard/products/edit   /${product._id}`)}
                                                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                                                            title="Edit Product"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProduct(product._id, product.name)}
                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                            title="Delete Product"
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
                        ) : (
                            // Grid View
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {currentProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all border border-white/5 hover:border-[#C026D3]/30"
                                        >
                                            {product.mainImage ? (
                                                <img
                                                    src={product.mainImage}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-white/5 flex items-center justify-center">
                                                    <Package size={48} className="text-[#94A3B8]" />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <h4 className="text-white font-semibold truncate">{product.name}</h4>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div>
                                                        <p className="text-white font-bold">{formatPrice(product.displayPrice)}</p>
                                                        {product.displayActualPrice && (
                                                            <p className="text-[#94A3B8] text-xs line-through">{formatPrice(product.displayActualPrice)}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-[#94A3B8]">
                                                        {product.variantsCount || 0} variants
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-[#94A3B8]">
                                                            {product.category?.name || "Uncategorized"}
                                                        </span>
                                                    </div>
                                                    {getStatusBadge(product.approvalStatus)}
                                                </div>
                                                {!targetDesignerId && product.creator && (
                                                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold">
                                                            {product.creator.name?.charAt(0).toUpperCase() || "D"}
                                                        </div>
                                                        <span className="text-[#94A3B8] text-xs truncate">{product.creator.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/products/${product._id}`)}
                                                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                                        title="View Product"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                                                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                                                        title="Edit Product"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProduct(product._id, product.name)}
                                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    <span className="px-3 py-1 rounded-lg bg-[#C026D3]/20 text-white text-sm">
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
            </div>
        </div>
    );
};

export default DesignerProducts;