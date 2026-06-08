import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Package,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Tag,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Grid3x3,
  List,
  TrendingUp,
  Star
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const productsPerPage = 12;

  const getToken = () => sessionStorage.getItem("adminToken");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProducts(response.data.products);
        setTotalProducts(response.data.total || response.data.count);
        setTotalPages(response.data.pages || Math.ceil(response.data.count / productsPerPage));
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (productId, productName) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: `Are you sure you want to delete "${productName}"?`,
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire({
          title: "Deleted!",
          text: "Product deleted successfully",
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

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const paginatedTotalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Product Card Component
  const ProductCard = ({ product }) => {
    const mainImage = product.mainImages?.[0] || product.variants?.[0]?.images?.[0] || null;
    const discount = product.maxDiscount || 
      (product.displayActualPrice && product.displayPrice 
        ? Math.round(((product.displayActualPrice - product.displayPrice) / product.displayActualPrice) * 100)
        : 0);

    return (
      <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-[#C026D3]/30 transition-all group">
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#020617] to-[#071236]">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={48} className="text-[#94A3B8]" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white text-xs font-bold px-2 py-1 rounded-lg">
              {discount}% OFF
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/dashboard/products/${product._id}`)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => deleteProduct(product._id, product.name)}
              className="p-2 rounded-xl bg-white/20 hover:bg-red-500/80 text-white transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[#94A3B8] text-sm mb-2 line-clamp-2">
            {product.description?.substring(0, 80)}...
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8] text-xs">Category:</span>
              <span className="text-white text-xs font-semibold">
                {product.categoryId?.name || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400" />
              <span className="text-white text-xs">{product.averageRating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {product.displayPrice ? (
                <>
                  <span className="text-[#C026D3] font-bold text-lg">
                    ${product.displayPrice}
                  </span>
                  <span className="text-[#94A3B8] text-sm line-through ml-2">
                    ${product.displayActualPrice}
                  </span>
                </>
              ) : (
                <span className="text-white font-bold text-lg">
                  ${product.variants?.[0]?.price || "N/A"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[#94A3B8] text-xs">
              <ShoppingBag size={12} />
              <span>{product.totalStock || 0} in stock</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.availableColors?.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.availableColors?.length > 3 && (
                <span className="text-[#94A3B8] text-xs">+{product.availableColors.length - 3}</span>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-lg ${product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
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
            <Package size={28} className="text-[#C026D3]" />
            All Products
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            {viewMode === "grid" ? <List size={18} /> : <Grid3x3 size={18} />}
          </button>
          <button
            onClick={fetchProducts}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => navigate("/dashboard/products/create")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{totalProducts}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
              <Package size={20} className="text-[#C026D3]" />
            </div>
          </div>
        </div>
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Active Products</p>
              <p className="text-2xl font-bold text-white">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ShoppingBag size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Total Stock</p>
              <p className="text-2xl font-bold text-white">
                {products.reduce((acc, p) => acc + (p.totalStock || 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Tag size={20} className="text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Avg. Discount</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(products.reduce((acc, p) => acc + (p.maxDiscount || 0), 0) / (products.length || 1))}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
        />
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
          <AlertCircle size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <p className="text-white text-lg">No products found</p>
          <p className="text-[#94A3B8] text-sm mt-2">Click "Add Product" to create your first product</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentProducts.map((product) => (
                <tr key={product._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.mainImages?.[0] ? (
                        <img src={product.mainImages[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Package size={16} className="text-[#94A3B8]" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">{product.name}</p>
                        <p className="text-[#94A3B8] text-xs">{product._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{product.categoryId?.name || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-[#C026D3] font-semibold">${product.displayPrice || product.variants?.[0]?.price}</span>
                      {product.displayActualPrice && (
                        <span className="text-[#94A3B8] text-xs line-through ml-2">${product.displayActualPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{product.totalStock || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/products/${product._id}`)}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id, product.name)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
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
      )}

      {/* Pagination */}
      {paginatedTotalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4">
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
              {currentPage} / {paginatedTotalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginatedTotalPages))}
              disabled={currentPage === paginatedTotalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;