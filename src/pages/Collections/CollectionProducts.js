import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Package,
    Plus,
    Trash2,
    X,
    Loader,
    Search,
    RefreshCw,
    AlertCircle,
    Eye,
    Check,
    ChevronLeft,
    ChevronRight,
    Layers,
    Tag,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Image as ImageIcon,
    Minus,
    CheckCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const API = "https://brublabackend.onrender.com/api/admin";

const CollectionProducts = () => {
    const { collectionId } = useParams();
    const navigate = useNavigate();
    const [collectionName, setCollectionName] = useState("");
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkMode, setBulkMode] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [collectionDetails, setCollectionDetails] = useState(null);

    const getToken = () => sessionStorage.getItem("adminToken");

    // Fetch collection details to get the name
    const fetchCollectionDetails = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${API}/collections/${collectionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setCollectionDetails(response.data.data);
                setCollectionName(response.data.data.title);
            }
        } catch (error) {
            console.error("Error fetching collection details:", error);
        }
    };

    // Fetch products in this collection
    const fetchCollectionProducts = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/collections/${collectionId}/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching collection products:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch collection products",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch all available products for adding
    const fetchAllProducts = async () => {
        try {
            setLoadingProducts(true);
            const token = getToken();
            const response = await axios.get(`${API}/products?page=${page}&limit=${itemsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setAllProducts(response.data.products);
                setTotalPages(response.data.pages || 1);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch products",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (collectionId) {
            fetchCollectionDetails();
            fetchCollectionProducts();
        }
    }, [collectionId]);

    useEffect(() => {
        if (showAddModal) {
            fetchAllProducts();
        }
    }, [showAddModal, page]);

    // Add single product to collection
    const handleAddProduct = async (productId) => {
        try {
            const token = getToken();
            const response = await axios.post(
                `${API}/collections/${collectionId}/products`,
                { productId },
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
                    text: "Product added to collection",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchCollectionProducts();
                setShowAddModal(false);
                setSelectedProducts([]);
            }
        } catch (error) {
            console.error("Error adding product:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to add product",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        }
    };

    // Bulk add products to collection
    const handleBulkAddProducts = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                title: "Error!",
                text: "Please select at least one product",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
            });
            return;
        }

        try {
            const token = getToken();
            const response = await axios.post(
                `${API}/collections/${collectionId}/products/bulk`,
                { productIds: selectedProducts },
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
                    text: `${selectedProducts.length} product(s) added to collection`,
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchCollectionProducts();
                setShowAddModal(false);
                setSelectedProducts([]);
            }
        } catch (error) {
            console.error("Error bulk adding products:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to add products",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        }
    };

    // Remove product from collection
    const handleRemoveProduct = async (productId, productName) => {
        const result = await Swal.fire({
            title: "Remove Product?",
            text: `Are you sure you want to remove "${productName}" from this collection?`,
            icon: "warning",
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Yes, remove",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                const token = getToken();
                await axios.delete(`${API}/collections/${collectionId}/products/${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                Swal.fire({
                    title: "Removed!",
                    text: "Product removed from collection",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchCollectionProducts();
            } catch (error) {
                console.error("Error removing product:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to remove product",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            }
        }
    };

    // Bulk remove products
    const handleBulkRemove = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                title: "Error!",
                text: "Please select products to remove",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
            });
            return;
        }

        const result = await Swal.fire({
            title: "Bulk Remove?",
            text: `Are you sure you want to remove ${selectedProducts.length} product(s) from this collection?`,
            icon: "warning",
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Yes, remove",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                const token = getToken();
                const promises = selectedProducts.map(productId =>
                    axios.delete(`${API}/collections/${collectionId}/products/${productId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                );

                await Promise.all(promises);

                Swal.fire({
                    title: "Removed!",
                    text: `${selectedProducts.length} product(s) removed from collection`,
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchCollectionProducts();
                setSelectedProducts([]);
                setBulkMode(false);
            } catch (error) {
                console.error("Error bulk removing products:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to remove products",
                    icon: "error",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                });
            }
        }
    };

    // Toggle product selection for bulk operations
    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleAllProducts = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p._id));
        }
    };

    // Filter products
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stats
    const stats = {
        total: products.length,
        totalStock: products.reduce((acc, p) => acc + (p.totalStock || 0), 0),
        avgPrice: products.reduce((acc, p) => acc + (p.displayPrice || 0), 0) / products.length || 0,
        totalVariants: products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)
    };

    // Available products for adding (filter out already added)
    const availableProducts = allProducts.filter(
        p => !products.some(cp => cp._id === p._id)
    );

    const filteredAvailableProducts = availableProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle back navigation
    const handleBack = () => {
        navigate("/dashboard/collections");
    };

    if (!collectionId) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <AlertCircle size={56} className="text-[#94A3B8] mx-auto mb-4" />
                    <p className="text-white text-xl">Collection not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors mb-3"
                    >
                        <ChevronLeft size={18} />
                        Back to Collections
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Layers size={28} className="text-[#C026D3]" />
                        {collectionName || "Collection"} - Products
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        Manage products in this collection
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {bulkMode && selectedProducts.length > 0 && (
                        <button
                            onClick={handleBulkRemove}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-all"
                        >
                            <Trash2 size={18} />
                            Remove ({selectedProducts.length})
                        </button>
                    )}
                    {bulkMode && products.length > 0 && (
                        <button
                            onClick={toggleAllProducts}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                        >
                            {selectedProducts.length === products.length ? "Deselect All" : "Select All"}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setBulkMode(!bulkMode);
                            if (bulkMode) setSelectedProducts([]);
                        }}
                        className={`p-2.5 rounded-xl transition-all ${bulkMode
                                ? 'bg-[#C026D3]/20 text-[#C026D3] border border-[#C026D3]/30'
                                : 'bg-white/5 hover:bg-white/10 text-white'
                            }`}
                    >
                        {bulkMode ? <X size={20} /> : <Check size={20} />}
                    </button>
                    <button
                        onClick={fetchCollectionProducts}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus size={18} />
                        Add Products
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total Products</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
                            <Package size={22} className="text-[#C026D3]" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total Stock</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.totalStock}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <ShoppingBag size={22} className="text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Avg. Price</p>
                            <p className="text-3xl font-bold text-white mt-1">${stats.avgPrice.toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <DollarSign size={22} className="text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total Variants</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.totalVariants}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp size={22} className="text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                    type="text"
                    placeholder="Search products in collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
                />
            </div>

            {/* Products List */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-3 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-16 text-center">
                    <AlertCircle size={56} className="text-[#94A3B8] mx-auto mb-4" />
                    <p className="text-white text-xl font-semibold">No products found</p>
                    <p className="text-[#94A3B8] text-sm mt-2">
                        {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Click 'Add Products' to add products to this collection"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product._id}
                            className={`bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border transition-all duration-200 ${selectedProducts.includes(product._id) && bulkMode
                                    ? 'border-[#C026D3] bg-[#C026D3]/5'
                                    : 'border-white/10 hover:border-[#C026D3]/30'
                                }`}
                        >
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Checkbox for bulk mode */}
                                    {bulkMode && (
                                        <div className="flex-shrink-0 pt-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => toggleProductSelection(product._id)}
                                                className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#C026D3] focus:ring-[#C026D3] cursor-pointer"
                                            />
                                        </div>
                                    )}

                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        {product.mainImages && product.mainImages[0] ? (
                                            <img
                                                src={product.mainImages[0]}
                                                alt={product.name}
                                                className="w-24 h-24 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center">
                                                <ImageIcon size={32} className="text-[#94A3B8]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between flex-wrap gap-2">
                                            <div>
                                                <h3 className="text-white font-bold text-lg">{product.name}</h3>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    {product.categoryId && (
                                                        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                                                            <Tag size={12} />
                                                            {typeof product.categoryId === 'object' ? product.categoryId.name : 'Category'}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-[#94A3B8]">
                                                        SKU: {product.variants?.[0]?.sku || 'N/A'}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        {product.discountPrice ? (
                                                            <>
                                                                <span className="text-[#94A3B8] text-sm line-through">${product.price}</span>
                                                                <span className="text-white font-bold text-lg">${product.discountPrice}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-white font-bold text-lg">${product.price}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#94A3B8] mt-1">
                                                        Stock: {product.totalStock || 0}
                                                    </p>
                                                </div>

                                                {!bulkMode && (
                                                    <button
                                                        onClick={() => handleRemoveProduct(product._id, product.name)}
                                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                        title="Remove from collection"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Variants Summary */}
                                        {product.variants && product.variants.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                                                    <span>Colors:</span>
                                                    <div className="flex gap-1">
                                                        {product.availableColors?.slice(0, 3).map((color, idx) => (
                                                            <span key={idx} className="px-1.5 py-0.5 rounded bg-white/10">
                                                                {color}
                                                            </span>
                                                        ))}
                                                        {product.availableColors?.length > 3 && (
                                                            <span className="text-[#94A3B8]">+{product.availableColors.length - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                                                    <span>Sizes:</span>
                                                    <div className="flex gap-1">
                                                        {product.availableSizes?.slice(0, 4).map((size, idx) => (
                                                            <span key={idx} className="px-1.5 py-0.5 rounded bg-white/10">
                                                                {size}
                                                            </span>
                                                        ))}
                                                        {product.availableSizes?.length > 4 && (
                                                            <span className="text-[#94A3B8]">+{product.availableSizes.length - 4}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Products Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#071236] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-xl font-bold text-white">Add Products to {collectionName}</h2>
                                <p className="text-[#94A3B8] text-sm mt-1">
                                    Select products to add to this collection
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedProducts([]);
                                    setSearchTerm("");
                                }}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-[#94A3B8]" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Search and Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                    <input
                                        type="text"
                                        placeholder="Search available products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                    />
                                </div>
                                {selectedProducts.length > 0 && (
                                    <button
                                        onClick={handleBulkAddProducts}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
                                    >
                                        <Plus size={18} />
                                        Add Selected ({selectedProducts.length})
                                    </button>
                                )}
                            </div>

                            {/* Available Products List */}
                            {loadingProducts ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredAvailableProducts.length === 0 ? (
                                <div className="bg-white/5 rounded-2xl p-12 text-center">
                                    <CheckCircle size={48} className="text-[#94A3B8] mx-auto mb-4" />
                                    <p className="text-white text-lg">No products available</p>
                                    <p className="text-[#94A3B8] text-sm mt-2">
                                        {searchTerm ? "Try adjusting your search" : "All products are already in this collection"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredAvailableProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className={`bg-white/5 rounded-xl p-4 transition-all cursor-pointer hover:bg-white/10 ${selectedProducts.includes(product._id) ? 'ring-2 ring-[#C026D3] bg-[#C026D3]/10' : ''
                                                }`}
                                            onClick={() => toggleProductSelection(product._id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={() => toggleProductSelection(product._id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#C026D3] focus:ring-[#C026D3] cursor-pointer flex-shrink-0 mt-1"
                                                />

                                                {product.mainImages && product.mainImages[0] ? (
                                                    <img
                                                        src={product.mainImages[0]}
                                                        alt={product.name}
                                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                                        <ImageIcon size={24} className="text-[#94A3B8]" />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between flex-wrap gap-2">
                                                        <div>
                                                            <h3 className="text-white font-semibold">{product.name}</h3>
                                                            <p className="text-[#94A3B8] text-sm line-clamp-1 mt-1">
                                                                {product.description || "No description"}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            {product.discountPrice ? (
                                                                <>
                                                                    <span className="text-[#94A3B8] text-sm line-through">${product.price}</span>
                                                                    <span className="text-white font-bold ml-2">${product.discountPrice}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-white font-bold">${product.price}</span>
                                                            )}
                                                            <p className="text-xs text-[#94A3B8] mt-1">
                                                                Stock: {product.totalStock || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination for available products */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-[#94A3B8] text-sm">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[#071236]/95">
                            <div className="text-sm text-[#94A3B8]">
                                {selectedProducts.length} product(s) selected
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedProducts([]);
                                        setSearchTerm("");
                                    }}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkAddProducts}
                                    disabled={selectedProducts.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    <Plus size={18} />
                                    Add to Collection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectionProducts;