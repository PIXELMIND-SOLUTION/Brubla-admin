import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Tag,
  MapPin,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Hash,
  Image as ImageIcon,
  Star,
  TrendingUp
} from "lucide-react";

const API = "https://brublabackend.onrender.com/api/admin";

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => sessionStorage.getItem("adminToken");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProduct(response.data.product);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch product details",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
      navigate("/dashboard/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: `Are you sure you want to delete "${product?.name}"?`,
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
        await axios.delete(`${API}/products/${id}`, {
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
        navigate("/dashboard/products");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-[#94A3B8]">Product not found</p>
      </div>
    );
  }

  const discount = product.maxDiscount ||
    (product.displayActualPrice && product.displayPrice
      ? Math.round(((product.displayActualPrice - product.displayPrice) / product.displayActualPrice) * 100)
      : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/products")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Product Details</h1>
            <p className="text-[#94A3B8] text-sm mt-1">View complete product information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
          >
            <Edit size={16} />
            Edit Product
          </button>
          <button
            onClick={deleteProduct}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Product Images</h3>
            {product.mainImages && product.mainImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {product.mainImages.map((img, idx) => (
                  <img key={idx} src={img} alt={`Product ${idx}`} className="w-full h-32 rounded-xl object-cover" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon size={48} className="text-[#94A3B8] mx-auto mb-2" />
                <p className="text-[#94A3B8]">No images available</p>
              </div>
            )}
          </div>

          <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Total Stock</span>
                <span className="text-white font-semibold">{product.totalStock || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Available Colors</span>
                <div className="flex items-center gap-1">
                  {product.availableColors?.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Available Sizes</span>
                <span className="text-white">{product.availableSizes?.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Rating</span>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400" />
                  <span className="text-white">{product.averageRating?.toFixed(1) || "0.0"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {product.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={18} className="text-[#C026D3]" />
              Product Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#94A3B8] uppercase tracking-wider">Product Name</label>
                <p className="text-white text-lg font-semibold mt-1">{product.name}</p>
              </div>
              <div>
                <label className="text-xs text-[#94A3B8] uppercase tracking-wider">Description</label>
                <p className="text-[#94A3B8] mt-1">{product.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#94A3B8] uppercase tracking-wider">Category</label>
                  <p className="text-white mt-1">{product.categoryId?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] uppercase tracking-wider">Subcategory</label>
                  <p className="text-white mt-1">{product.subcategoryName || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#94A3B8] uppercase tracking-wider">Created By</label>
                  <p className="text-white mt-1 flex items-center gap-2">
                    <User size={14} />
                    {product.createdBy || "Admin"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] uppercase tracking-wider">Created At</label>
                  <p className="text-white mt-1 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-[#C026D3]" />
              Pricing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-[#94A3B8] text-sm">Display Price</p>
                <p className="text-2xl font-bold text-[#C026D3]">${product.displayPrice || product.variants?.[0]?.price}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-[#94A3B8] text-sm">Actual Price</p>
                <p className="text-2xl font-bold text-white">${product.displayActualPrice || product.variants?.[0]?.price}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-[#94A3B8] text-sm">Discount</p>
                <p className="text-2xl font-bold text-emerald-400">{discount}%</p>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Hash size={18} className="text-[#C026D3]" />
              Product Variants ({product.variants?.length})
            </h3>
            <div className="space-y-4">
              {product.variants?.map((variant, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">{variant.color}</h4>
                    <span className="text-xs text-[#94A3B8]">SKU: {variant.sku}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-[#94A3B8] text-xs">Price</p>
                      <p className="text-white">${variant.price}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] text-xs">Discount Price</p>
                      <p className="text-white">{variant.discountPrice ? `$${variant.discountPrice}` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] text-xs">Status</p>
                      <span className={`text-xs ${variant.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-2">Sizes & Stock</p>
                    <div className="flex flex-wrap gap-2">
                      {variant.sizes?.map((size, sIdx) => (
                        <span key={sIdx} className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm">
                          {size.size}: {size.stock} in stock
                        </span>
                      ))}
                    </div>
                  </div>
                  {variant.images && variant.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[#94A3B8] text-xs mb-2">Variant Images</p>
                      <div className="flex gap-2">
                        {variant.images.map((img, iIdx) => (
                          <img key={iIdx} src={img} alt={`${variant.color} ${iIdx}`} className="w-16 h-16 rounded-lg object-cover" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Addresses & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-[#C026D3]" />
                Delivery Locations
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.deliveryAddresses?.map((addr, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 text-white text-sm">
                    {addr}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Tag size={18} className="text-[#C026D3]" />
                Product Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags?.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg bg-[#C026D3]/10 text-[#C026D3] text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;