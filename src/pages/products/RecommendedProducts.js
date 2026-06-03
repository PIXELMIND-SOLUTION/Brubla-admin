import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Star,
  Plus,
  Trash2,
  X,
  Loader,
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Eye,
  EyeOff,
  Image as ImageIcon,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingBag,
  Tag,
  ArrowUp,
  ArrowDown,
  Heart,
  Calendar,
  CheckCircle
} from "lucide-react";

import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

const API = "http://31.97.228.17:4077/api/admin";

const RecommendedProducts = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const getToken = () => sessionStorage.getItem("adminToken");

  // Fetch recommended products
  const fetchRecommendedProducts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API}/recommended`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setRecommendedProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching recommended products:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch recommended products",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all products for adding
  const fetchAllProducts = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchRecommendedProducts();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      fetchAllProducts();
    }
  }, [showAddModal, page]);

  // Add product to recommended
  const handleAddProduct = async (productId) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API}/recommended`,
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
          text: "Product added to recommended",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchRecommendedProducts();
        setShowAddModal(false);
        setSelectedProductIds([]);
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

  // Bulk add products
  const handleBulkAddProducts = async () => {
    if (selectedProductIds.length === 0) {
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
      const promises = selectedProductIds.map(productId =>
        axios.post(
          `${API}/recommended`,
          { productId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
      );

      await Promise.all(promises);

      Swal.fire({
        title: "Success!",
        text: `${selectedProductIds.length} product(s) added to recommended`,
        icon: "success",
        background: "#071236",
        color: "#FFFFFF",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchRecommendedProducts();
      setShowAddModal(false);
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Error bulk adding products:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to add products",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    }
  };

  // Remove products from recommended
  const handleRemoveProducts = async (productIds, productNames) => {
    const result = await Swal.fire({
      title: "Remove Products?",
      text: `Are you sure you want to remove ${productIds.length} product(s) from recommended?`,
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
        await axios.delete(`${API}/recommended/remove`, {
          data: { productIds },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        Swal.fire({
          title: "Removed!",
          text: "Product(s) removed from recommended",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchRecommendedProducts();
        setSelectedProductIds([]);
        setBulkMode(false);
      } catch (error) {
        console.error("Error removing products:", error);
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

  // Toggle product active status
  const handleToggleProduct = async (recommendedId, productName, currentStatus) => {
    try {
      const token = getToken();
      const response = await axios.patch(
        `${API}/recommended/${recommendedId}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: "Updated!",
          text: `${productName} is now ${!currentStatus ? 'active' : 'inactive'} on homepage`,
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchRecommendedProducts();
      }
    } catch (error) {
      console.error("Error toggling product:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update product status",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    }
  };

  // Toggle product selection for bulk operations
  const toggleProductSelection = (productId) => {
    console.log("Toggling selection for product ID:", productId);
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProductIds.length === recommendedProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(recommendedProducts.map(rp => rp.product._id));
    }
  };

  // Get available products (not already recommended)
  const availableProducts = allProducts.filter(
    product => !recommendedProducts.some(rp => rp.product?._id === product._id)
  );

  const filteredAvailableProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Stats
  const stats = {
    total: recommendedProducts.length,
    active: recommendedProducts.filter(rp => rp.isActive !== false).length,
    totalStock: recommendedProducts.reduce((acc, rp) => acc + (rp.product?.totalStock || 0), 0),
    avgPrice: recommendedProducts.reduce((acc, rp) => acc + (rp.product?.displayPrice || 0), 0) / recommendedProducts.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Star size={28} className="text-[#C026D3]" />
            Recommended Products
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Manage products displayed in the "Recommended for You" section on the homepage
          </p>
        </div>
        <div className="flex items-center gap-3">
          {bulkMode && selectedProductIds.length > 0 && (
            <button
              onClick={() => handleRemoveProducts(selectedProductIds, null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-all"
            >
              <Trash2 size={18} />
              Remove ({selectedProductIds.length})
            </button>
          )}
          {bulkMode && recommendedProducts.length > 0 && (
            <button
              onClick={toggleAllProducts}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              {selectedProductIds.length === recommendedProducts.length ? "Deselect All" : "Select All"}
            </button>
          )}
          <button
            onClick={() => {
              setBulkMode(!bulkMode);
              if (bulkMode) setSelectedProductIds([]);
            }}
            className={`p-2.5 rounded-xl transition-all ${bulkMode
                ? 'bg-[#C026D3]/20 text-[#C026D3] border border-[#C026D3]/30'
                : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
          >
            {bulkMode ? <X size={20} /> : <Check size={20} />}
          </button>
          <button
            onClick={fetchRecommendedProducts}
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
              <p className="text-[#94A3B8] text-sm">Recommended Products</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
              <Star size={22} className="text-[#C026D3]" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Active Products</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Eye size={22} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Total Stock</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalStock}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingBag size={22} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Avg. Price</p>
              <p className="text-3xl font-bold text-white mt-1">${stats.avgPrice.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSign size={22} className="text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-3 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recommendedProducts.length === 0 ? (
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-16 text-center">
          <Heart size={56} className="text-[#94A3B8] mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">No recommended products</p>
          <p className="text-[#94A3B8] text-sm mt-2">
            Click "Add Products" to add products to the recommended section
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendedProducts.map((item, index) => {
            const product = item.product;
            
            if (!product) {
              return (
                <div
                  key={item._id}
                  className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-red-500/30 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <AlertCircle size={22} className="text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Invalid Product</h3>
                        <p className="text-[#94A3B8] text-sm">This product reference is invalid or has been deleted</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProducts([item.product?._id], null)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            }

            const isSelected = bulkMode && selectedProductIds.includes(product._id);

            return (
              <div
                key={item._id}
                className={`bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border transition-all duration-200 ${
                  isSelected
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
                          checked={isSelected}
                          onChange={() => toggleProductSelection(product._id)}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#C026D3] focus:ring-[#C026D3] cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Order Number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
                      <span className="text-[#C026D3] font-bold text-lg">{index + 1}</span>
                    </div>

                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.mainImages && product.mainImages[0] ? (
                        <img
                          src={product.mainImages[0]}
                          alt={product.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
                          <Package size={32} className="text-[#94A3B8]" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                              <Tag size={12} />
                              SKU: {product.variants?.[0]?.sku || 'N/A'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              product.isActive 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.isActive !== false
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {item.isActive !== false ? 'On Homepage' : 'Hidden'}
                            </span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                              <Calendar size={12} />
                              Added: {formatDate(item.addedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            {product.displayPrice !== product.displayActualPrice ? (
                              <>
                                <span className="text-[#94A3B8] text-sm line-through">${product.displayActualPrice}</span>
                                <span className="text-white font-bold text-lg ml-2">${product.displayPrice}</span>
                              </>
                            ) : (
                              <span className="text-white font-bold text-lg">${product.displayPrice}</span>
                            )}
                            <p className="text-xs text-[#94A3B8] mt-1">
                              Stock: {product.totalStock || 0}
                            </p>
                          </div>

                          {!bulkMode && (
                            <div className="flex items-center gap-1">
                              {/* Toggle Button */}
                              <button
                                onClick={() => handleToggleProduct(item._id, product.name, item.isActive)}
                                className={`p-2 rounded-lg transition-all ${
                                  item.isActive !== false
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                    : 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400'
                                }`}
                                title={item.isActive !== false ? "Hide from homepage" : "Show on homepage"}
                              >
                                {item.isActive !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveProducts([product._id], product.name)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                title="Remove from recommended"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <p className="text-[#94A3B8] text-sm mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Variants Summary */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                            <span>Colors:</span>
                            <div className="flex gap-1">
                              {product.variants.slice(0, 3).map((variant, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-white/10">
                                  {variant.color}
                                </span>
                              ))}
                              {product.variants.length > 3 && (
                                <span className="text-[#94A3B8]">+{product.variants.length - 3}</span>
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
            );
          })}
        </div>
      )}

      {/* Add Products Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#071236] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Add Products to Recommended</h2>
                <p className="text-[#94A3B8] text-sm mt-1">
                  Select products to display in the "Recommended for You" section
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedProductIds([]);
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
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
                  />
                </div>
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={handleBulkAddProducts}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                    Add Selected ({selectedProductIds.length})
                  </button>
                )}
              </div>

              {/* Available Products List */}
              {filteredAvailableProducts.length === 0 && !loading ? (
                <div className="bg-white/5 rounded-2xl p-12 text-center">
                  <CheckCircle size={48} className="text-[#94A3B8] mx-auto mb-4" />
                  <p className="text-white text-lg">No products available</p>
                  <p className="text-[#94A3B8] text-sm mt-2">
                    {searchTerm ? "Try adjusting your search" : "All products are already in the recommended section"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailableProducts.map((product) => (
                    <div
                      key={product._id}
                      className={`bg-white/5 rounded-xl p-4 transition-all cursor-pointer hover:bg-white/10 ${
                        selectedProductIds.includes(product._id) ? 'ring-2 ring-[#C026D3] bg-[#C026D3]/10' : ''
                      }`}
                      onClick={() => toggleProductSelection(product._id)}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product._id)}
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
                            <Package size={24} className="text-[#94A3B8]" />
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

              {/* Pagination */}
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
                {selectedProductIds.length} product(s) selected
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedProductIds([]);
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAddProducts}
                  disabled={selectedProductIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Plus size={18} />
                  Add to Recommended
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendedProducts;