import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Package,
  Tag,
  MapPin,
  Hash,
  DollarSign,
  Percent,
  Check,
  AlertCircle
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const CreateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    isActive: true,
    deliveryAddresses: [],
    tags: [],
    variants: []
  });
  
  const [newAddress, setNewAddress] = useState("");
  const [newTag, setNewTag] = useState("");
  const [currentVariant, setCurrentVariant] = useState({
    color: "",
    price: "",
    discountPrice: "",
    sizes: [],
    images: []
  });
  const [currentSize, setCurrentSize] = useState({ size: "", stock: "" });
  const [variantImages, setVariantImages] = useState([]);
  const [variantImagePreviews, setVariantImagePreviews] = useState([]);

  const getToken = () => sessionStorage.getItem("adminToken");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch product for edit mode
  const fetchProduct = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const product = response.data.product;
        setFormData({
          name: product.name,
          description: product.description,
          categoryId: product.categoryId._id || product.categoryId,
          subcategoryId: product.subcategoryId,
          isActive: product.isActive,
          deliveryAddresses: product.deliveryAddresses || [],
          tags: product.tags || [],
          variants: product.variants || []
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch product details",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      navigate("/dashboard/products");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    } else {
      setFetching(false);
    }
  }, [id]);

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c._id === formData.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle addresses
  const addAddress = () => {
    if (newAddress.trim()) {
      setFormData(prev => ({
        ...prev,
        deliveryAddresses: [...prev.deliveryAddresses, newAddress.trim()]
      }));
      setNewAddress("");
    }
  };

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      deliveryAddresses: prev.deliveryAddresses.filter((_, i) => i !== index)
    }));
  };

  // Handle tags
  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Handle variant sizes
  const addSize = () => {
    if (currentSize.size && currentSize.stock) {
      setCurrentVariant(prev => ({
        ...prev,
        sizes: [...prev.sizes, { size: currentSize.size, stock: parseInt(currentSize.stock) }]
      }));
      setCurrentSize({ size: "", stock: "" });
    }
  };

  const removeSize = (index) => {
    setCurrentVariant(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  // Handle variant images
  const handleVariantImages = (e) => {
    const files = Array.from(e.target.files);
    setVariantImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setVariantImagePreviews(previews);
  };

  // Add variant
  const addVariant = () => {
    if (!currentVariant.color || !currentVariant.price) {
      Swal.fire({
        title: "Error!",
        text: "Please fill color and price",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        color: currentVariant.color,
        price: parseFloat(currentVariant.price),
        discountPrice: currentVariant.discountPrice ? parseFloat(currentVariant.discountPrice) : null,
        sizes: currentVariant.sizes,
        images: variantImages
      }]
    }));

    // Reset variant form
    setCurrentVariant({
      color: "",
      price: "",
      discountPrice: "",
      sizes: [],
      images: []
    });
    setVariantImages([]);
    setVariantImagePreviews([]);
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || formData.variants.length === 0) {
      Swal.fire({
        title: "Error!",
        text: "Please fill required fields (name, category, and at least one variant)",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("categoryId", formData.categoryId);
    if (formData.subcategoryId) submitData.append("subcategoryId", formData.subcategoryId);
    submitData.append("isActive", formData.isActive);
    submitData.append("deliveryAddresses", JSON.stringify(formData.deliveryAddresses));
    submitData.append("tags", JSON.stringify(formData.tags));
    
    // Handle variants with images
    formData.variants.forEach((variant, vIndex) => {
      const variantData = {
        color: variant.color,
        price: variant.price,
        discountPrice: variant.discountPrice,
        sizes: variant.sizes
      };
      submitData.append(`variants`, JSON.stringify(variantData));
      
      if (variant.images && variant.images.length > 0) {
        variant.images.forEach((image, iIndex) => {
          submitData.append(`variant_${vIndex}_images`, image);
        });
      }
    });

    try {
      setLoading(true);
      const token = getToken();
      const url = isEditMode ? `${API}/products/${id}` : `${API}/products`;
      const method = isEditMode ? axios.put : axios.post;

      const response = await method(url, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: `Product ${isEditMode ? "updated" : "created"} successfully`,
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dashboard/products");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} product`,
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/products")}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isEditMode ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {isEditMode ? "Update product information" : "Add a new product to your catalog"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={18} className="text-[#C026D3]" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Subcategory
              </label>
              <select
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#C026D3] focus:ring-[#C026D3]"
                />
                <span className="text-white text-sm">Product Active</span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all resize-none"
              placeholder="Enter product description"
            />
          </div>
        </div>

        {/* Delivery Addresses */}
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-[#C026D3]" />
            Delivery Addresses
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
              placeholder="Enter delivery city/address"
              onKeyPress={(e) => e.key === "Enter" && addAddress()}
            />
            <button
              type="button"
              onClick={addAddress}
              className="px-4 py-2.5 rounded-xl bg-[#C026D3]/20 hover:bg-[#C026D3]/30 text-[#C026D3] transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.deliveryAddresses.map((addr, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white text-sm">
                {addr}
                <button
                  type="button"
                  onClick={() => removeAddress(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Tag size={18} className="text-[#C026D3]" />
            Product Tags
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
              placeholder="Enter tag (e.g., winter, premium)"
              onKeyPress={(e) => e.key === "Enter" && addTag()}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 rounded-xl bg-[#C026D3]/20 hover:bg-[#C026D3]/30 text-[#C026D3] transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C026D3]/10 text-[#C026D3] text-sm">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Hash size={18} className="text-[#C026D3]" />
            Product Variants
          </h2>
          
          {/* Add Variant Form */}
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <h3 className="text-white font-semibold mb-3">Add New Variant</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Color *"
                value={currentVariant.color}
                onChange={(e) => setCurrentVariant({ ...currentVariant, color: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50"
              />
              <input
                type="number"
                placeholder="Price *"
                value={currentVariant.price}
                onChange={(e) => setCurrentVariant({ ...currentVariant, price: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50"
              />
              <input
                type="number"
                placeholder="Discount Price"
                value={currentVariant.discountPrice}
                onChange={(e) => setCurrentVariant({ ...currentVariant, discountPrice: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50"
              />
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <label className="text-sm text-[#94A3B8] mb-2 block">Sizes & Stock</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Size (S, M, L, XL)"
                  value={currentSize.size}
                  onChange={(e) => setCurrentSize({ ...currentSize, size: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={currentSize.stock}
                  onChange={(e) => setCurrentSize({ ...currentSize, stock: e.target.value })}
                  className="w-32 px-4 py-2 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentVariant.sizes.map((size, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-white text-sm">
                    {size.size}: {size.stock} in stock
                    <button
                      type="button"
                      onClick={() => removeSize(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="mb-4">
              <label className="text-sm text-[#94A3B8] mb-2 block">Variant Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleVariantImages}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#C026D3] file:text-white hover:file:bg-[#A020B0] cursor-pointer"
              />
              {variantImagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {variantImagePreviews.map((preview, idx) => (
                    <img key={idx} src={preview} alt={`Preview ${idx}`} className="w-16 h-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
            >
              Add Variant
            </button>
          </div>

          {/* Existing Variants List */}
          {formData.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Added Variants</h3>
              {formData.variants.map((variant, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{variant.color}</p>
                    <p className="text-[#94A3B8] text-sm">
                      Price: ${variant.price} | Discount: ${variant.discountPrice || "N/A"}
                    </p>
                    <p className="text-[#94A3B8] text-sm">
                      Sizes: {variant.sizes.map(s => `${s.size}(${s.stock})`).join(", ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/products")}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditMode ? "Update Product" : "Create Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;