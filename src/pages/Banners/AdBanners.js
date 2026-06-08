import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Image,
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
  Upload,
  Tag,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Edit,
  Save,
  ShoppingBag,
  Percent,
  Clock,
  TrendingUp
} from "lucide-react";
import {
    DragDropContext,
    Droppable,
    Draggable
} from "@hello-pangea/dnd";

const API = "http://31.97.228.17:4077/api/admin";

const AdBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    tag: "",
    buttonText: "Shop Now",
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => sessionStorage.getItem("adminToken");

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API}/homepage/banner`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Sort by order
        const sorted = response.data.data.sort((a, b) => a.order - b.order);
        setBanners(sorted);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch ad banners",
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
    fetchBanners();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      Swal.fire({
        title: "Invalid File!",
        text: "Please select an image file (JPEG, PNG, GIF, WEBP)",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        title: "File Too Large!",
        text: "Image size should be less than 10MB",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Add banner
  const handleAddBanner = async () => {
    if (!formData.title.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Title is required",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    if (!imageFile && !editingBanner?.image) {
      Swal.fire({
        title: "Error!",
        text: "Please select an image",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("subtitle", formData.subtitle);
    submitData.append("tag", formData.tag);
    submitData.append("buttonText", formData.buttonText);
    submitData.append("order", formData.order.toString());
    if (imageFile) {
      submitData.append("image", imageFile);
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await axios.post(`${API}/homepage/banner/add`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Banner added successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        resetModal();
        fetchBanners();
      }
    } catch (error) {
      console.error("Error adding banner:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add banner",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update banner
  const handleUpdateBanner = async () => {
    if (!formData.title.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Title is required",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("subtitle", formData.subtitle);
    submitData.append("tag", formData.tag);
    submitData.append("buttonText", formData.buttonText);
    submitData.append("order", formData.order.toString());
    if (imageFile) {
      submitData.append("image", imageFile);
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await axios.put(
        `${API}/homepage/banner/${editingBanner._id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Banner updated successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        resetModal();
        fetchBanners();
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update banner",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update banner order
  const handleUpdateOrder = async (id, newOrder) => {
    try {
      const token = getToken();
      await axios.put(
        `${API}/homepage/banner/${id}`,
        { order: newOrder },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  };

  // Toggle banner status
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = getToken();
      await axios.put(
        `${API}/homepage/banner/${id}`,
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchBanners();
      
      Swal.fire({
        title: "Updated!",
        text: `Banner is now ${!currentStatus ? 'active' : 'inactive'}`,
        icon: "success",
        background: "#071236",
        color: "#FFFFFF",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error toggling status:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update banner status",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id, title) => {
    const result = await Swal.fire({
      title: "Delete Banner?",
      text: `Are you sure you want to delete "${title}"?`,
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
        await axios.delete(`${API}/homepage/banner/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire({
          title: "Deleted!",
          text: "Banner deleted successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete banner",
          icon: "error",
          background: "#071236",
          color: "#FFFFFF",
          confirmButtonColor: "#C026D3",
        });
      }
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setBanners(updatedItems);

    // Save order to server
    try {
      setSaving(true);
      for (let i = 0; i < updatedItems.length; i++) {
        await handleUpdateOrder(updatedItems[i]._id, i);
      }
    } catch (error) {
      console.error("Error saving reorder:", error);
      fetchBanners();
    } finally {
      setSaving(false);
    }
  };

  // Move banner up/down
  const moveBanner = async (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const items = Array.from(banners);
    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    const updatedItems = items.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setBanners(updatedItems);

    try {
      setSaving(true);
      for (let i = 0; i < updatedItems.length; i++) {
        await handleUpdateOrder(updatedItems[i]._id, i);
      }
    } catch (error) {
      console.error("Error reordering:", error);
      fetchBanners();
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      tag: banner.tag || "",
      buttonText: banner.buttonText || "Shop Now",
      order: banner.order,
      isActive: banner.isActive
    });
    setImagePreview(banner.image);
    setImageFile(null);
    setShowAddModal(true);
  };

  // Reset modal
  const resetModal = () => {
    setShowAddModal(false);
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      tag: "",
      buttonText: "Shop Now",
      order: banners.length,
      isActive: true
    });
    setImageFile(null);
    setImagePreview("");
    setSubmitting(false);
  };

  // Filter banners
  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.tag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: banners.length,
    active: banners.filter(b => b.isActive).length,
    inactive: banners.filter(b => !b.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Image size={28} className="text-[#C026D3]" />
            Advertisement Banners
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Manage homepage advertisement banners with images and promotional content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Add Banner
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Total Banners</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
              <Image size={22} className="text-[#C026D3]" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Active Banners</p>
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
              <p className="text-[#94A3B8] text-sm">Inactive Banners</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
              <EyeOff size={22} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-white mt-1">{banners.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp size={22} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search banners by title or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
        />
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-[#071236] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg z-50">
          <Loader size={16} className="animate-spin text-[#C026D3]" />
          <span className="text-white text-sm">Saving order...</span>
        </div>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-3 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-16 text-center">
          <AlertCircle size={56} className="text-[#94A3B8] mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">No banners found</p>
          <p className="text-[#94A3B8] text-sm mt-2">
            {searchTerm 
              ? "Try adjusting your search criteria" 
              : "Click 'Add Banner' to create your first advertisement banner"}
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="banners">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {filteredBanners.map((banner, index) => (
                  <Draggable key={banner._id} draggableId={banner._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border transition-all duration-200 overflow-hidden ${
                          snapshot.isDragging
                            ? 'border-[#C026D3] shadow-2xl scale-[1.02]'
                            : 'border-white/10 hover:border-[#C026D3]/30'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Image Section */}
                          <div className="md:w-64 h-48 md:h-auto relative">
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md ${
                                banner.isActive 
                                  ? 'bg-emerald-500/80 text-white' 
                                  : 'bg-red-500/80 text-white'
                              }`}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-5">
                            <div className="flex items-start gap-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <GripVertical size={20} className="text-[#94A3B8]" />
                              </div>

                              {/* Order Number */}
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
                                <span className="text-[#C026D3] font-bold text-lg">{banner.order}</span>
                              </div>

                              {/* Banner Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                  <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg">
                                      {banner.title}
                                    </h3>
                                    
                                    {banner.subtitle && (
                                      <p className="text-[#94A3B8] text-sm mt-1">
                                        {banner.subtitle}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                      {banner.tag && (
                                        <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-[#C026D3]/20 text-[#C026D3]">
                                          <Tag size={12} />
                                          {banner.tag}
                                        </span>
                                      )}
                                      <span className="text-xs flex items-center gap-1 text-[#94A3B8]">
                                        <ShoppingBag size={12} />
                                        {banner.buttonText || 'Shop Now'}
                                      </span>
                                      <span className="text-xs flex items-center gap-1 text-[#94A3B8]">
                                        <Calendar size={12} />
                                        {new Date(banner.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Move Up/Down Buttons */}
                                    <div className="flex flex-col gap-1">
                                      <button
                                        onClick={() => moveBanner(index, "up")}
                                        disabled={index === 0}
                                        className="p-1 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                                        title="Move Up"
                                      >
                                        <ArrowUp size={14} className="text-[#94A3B8]" />
                                      </button>
                                      <button
                                        onClick={() => moveBanner(index, "down")}
                                        disabled={index === filteredBanners.length - 1}
                                        className="p-1 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                                        title="Move Down"
                                      >
                                        <ArrowDown size={14} className="text-[#94A3B8]" />
                                      </button>
                                    </div>

                                    {/* Edit Button */}
                                    <button
                                      onClick={() => openEditModal(banner)}
                                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                                      title="Edit Banner"
                                    >
                                      <Edit size={16} />
                                    </button>

                                    {/* Toggle Active Button */}
                                    <button
                                      onClick={() => handleToggleActive(banner._id, banner.isActive)}
                                      className={`p-2 rounded-lg transition-all ${
                                        banner.isActive
                                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                          : 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400'
                                      }`}
                                      title={banner.isActive ? "Deactivate" : "Activate"}
                                    >
                                      {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      onClick={() => handleDeleteBanner(banner._id, banner.title)}
                                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add/Edit Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#071236] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#071236] flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingBanner ? "Edit Banner" : "Add New Banner"}
                </h2>
                <p className="text-[#94A3B8] text-sm mt-1">
                  {editingBanner 
                    ? "Update the banner details" 
                    : "Create a new advertisement banner for the homepage"}
                </p>
              </div>
              <button
                onClick={resetModal}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-[#94A3B8]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Banner Image *
                </label>
                <div className="flex items-start gap-4">
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-xl object-cover border border-white/10"
                      />
                      <button
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <label className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Upload size={20} className="mx-auto mb-2" />
                    {imagePreview ? "Change Image" : "Upload Image"}
                    <p className="text-xs text-[#94A3B8] mt-1">
                      JPEG, PNG, GIF, WEBP (Max 10MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Subtitle
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all resize-none"
                  placeholder="e.g., Get up to 50% off on all items"
                />
              </div>

              {/* Tag and Button Text Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Tag
                  </label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                    placeholder="e.g., New Arrivals, Limited Offer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                    placeholder="Shop Now"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                  placeholder="Order number (lower appears first)"
                />
                <p className="text-xs text-[#94A3B8] mt-1">
                  Banners will be displayed in ascending order
                </p>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#C026D3] focus:ring-[#C026D3]"
                  />
                  <span className="text-white text-sm">Active (visible on homepage)</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#071236] flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={resetModal}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingBanner ? handleUpdateBanner : handleAddBanner}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    {editingBanner ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {editingBanner ? <Save size={18} /> : <Plus size={18} />}
                    {editingBanner ? "Update Banner" : "Add Banner"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBanners;