import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Image,
    Video,
    Youtube,
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
    Play,
    Pause,
    Link,
    Calendar,
    Move,
    Save,
    ArrowUp,
    ArrowDown,
    Globe
} from "lucide-react";
import {
    DragDropContext,
    Droppable,
    Draggable
} from "@hello-pangea/dnd";
import { BsYoutube } from "react-icons/bs";

const API = "https://brublabackend.onrender.com/api/admin";

const HeroBanners = () => {
    const [heroItems, setHeroItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        type: "image",
        url: "",
        order: 0,
        isActive: true
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const getToken = () => sessionStorage.getItem("adminToken");

    // Fetch hero items
    const fetchHeroItems = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/homepage/hero`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                // Sort by order
                const sorted = response.data.data.sort((a, b) => a.order - b.order);
                setHeroItems(sorted);
            }
        } catch (error) {
            console.error("Error fetching hero items:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch hero banners",
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
        fetchHeroItems();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Handle file upload for image/video
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

        if (formData.type === 'image' && !validImageTypes.includes(file.type)) {
            Swal.fire({
                title: "Invalid File!",
                text: "Please select an image file (JPEG, PNG, GIF, WEBP)",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
            });
            return;
        }

        if (formData.type === 'video' && !validVideoTypes.includes(file.type)) {
            Swal.fire({
                title: "Invalid File!",
                text: "Please select a video file (MP4, MPEG, MOV, WEBM)",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
            });
            return;
        }

        // Validate file size (50MB for videos, 10MB for images)
        const maxSize = formData.type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            Swal.fire({
                title: "File Too Large!",
                text: `${formData.type === 'video' ? 'Video' : 'Image'} size should be less than ${formData.type === 'video' ? '50MB' : '10MB'}`,
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
            });
            return;
        }

        setUploadFile(file);
        const previewUrl = URL.createObjectURL(file);
        setUploadPreview(previewUrl);
    };

    // Add hero item
    const handleAddHero = async () => {
        if (!formData.url && !uploadFile) {
            Swal.fire({
                title: "Error!",
                text: "Please provide a URL or upload a file",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
            });
            return;
        }

        const submitData = new FormData();
        submitData.append("type", formData.type);
        submitData.append("order", formData.order.toString());

        if (formData.type === 'youtube' || formData.type === 'link') {
            submitData.append("url", formData.url);
        } else if (uploadFile) {
            submitData.append("media", uploadFile);
        } else if (formData.url) {
            submitData.append("url", formData.url);
        }

        try {
            setSubmitting(true);
            const token = getToken();
            const response = await axios.post(`${API}/homepage/hero/add`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: "Hero banner added successfully",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                resetModal();
                fetchHeroItems();
            }
        } catch (error) {
            console.error("Error adding hero:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to add hero banner",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Update hero item order
    const handleUpdateOrder = async (id, newOrder) => {
        try {
            const token = getToken();
            await axios.put(
                `${API}/homepage/hero/${id}`,
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

    // Toggle active status using PATCH endpoint
    const handleToggleActive = async (id, currentStatus) => {
        try {
            const token = getToken();
            const response = await axios.patch(
                `${API}/homepage/hero/${id}/toggle`,
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
                    text: `Hero banner is now ${!currentStatus ? 'active' : 'inactive'}`,
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchHeroItems();
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to update banner status",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        }
    };

    // Delete hero item
    const handleDeleteHero = async (id, type) => {
        const result = await Swal.fire({
            title: "Delete Hero Banner?",
            text: "Are you sure you want to delete this hero banner?",
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
                await axios.delete(`${API}/homepage/hero/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                Swal.fire({
                    title: "Deleted!",
                    text: "Hero banner deleted successfully",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchHeroItems();
            } catch (error) {
                console.error("Error deleting hero:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to delete hero banner",
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

        const items = Array.from(heroItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local order
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index,
        }));

        setHeroItems(updatedItems);

        // Save order to server
        try {
            setSaving(true);
            for (let i = 0; i < updatedItems.length; i++) {
                await handleUpdateOrder(updatedItems[i]._id, i);
            }
        } catch (error) {
            console.error("Error saving reorder:", error);
            fetchHeroItems();
        } finally {
            setSaving(false);
        }
    };

    // Move item up/down
    const moveItem = async (index, direction) => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= heroItems.length) return;

        const items = Array.from(heroItems);
        [items[index], items[newIndex]] = [items[newIndex], items[index]];

        const updatedItems = items.map((item, idx) => ({
            ...item,
            order: idx,
        }));

        setHeroItems(updatedItems);

        try {
            setSaving(true);
            for (let i = 0; i < updatedItems.length; i++) {
                await handleUpdateOrder(updatedItems[i]._id, i);
            }
        } catch (error) {
            console.error("Error reordering:", error);
            fetchHeroItems();
        } finally {
            setSaving(false);
        }
    };

    // Reset modal
    const resetModal = () => {
        setShowAddModal(false);
        setEditingItem(null);
        setFormData({
            type: "image",
            url: "",
            order: heroItems.length,
            isActive: true
        });
        setUploadFile(null);
        setUploadPreview(null);
    };

    // Get type icon
    const getTypeIcon = (type) => {
        switch (type) {
            case 'image': return <Image size={18} className="text-blue-400" />;
            case 'video': return <Video size={18} className="text-purple-400" />;
            case 'youtube': return <BsYoutube size={18} className="text-red-400" />;
            default: return <Globe size={18} className="text-green-400" />;
        }
    };

    // Get YouTube embed URL
    const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    // Stats
    const stats = {
        total: heroItems.length,
        active: heroItems.filter(item => item.isActive).length,
        types: {
            image: heroItems.filter(item => item.type === 'image').length,
            video: heroItems.filter(item => item.type === 'video').length,
            youtube: heroItems.filter(item => item.type === 'youtube').length,
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Image size={28} className="text-[#C026D3]" />
                        Hero Banners
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        Manage homepage hero carousel banners (images, videos, or YouTube embeds)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchHeroItems}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus size={18} />
                        Add Hero Banner
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
                            <p className="text-[#94A3B8] text-sm">Images/Videos</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {stats.types.image} Images / {stats.types.video} Videos
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Video size={22} className="text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">YouTube Embeds</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.types.youtube}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <BsYoutube size={22} className="text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Saving Indicator */}
            {saving && (
                <div className="fixed bottom-4 right-4 bg-[#071236] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg z-50">
                    <Loader size={16} className="animate-spin text-[#C026D3]" />
                    <span className="text-white text-sm">Saving order...</span>
                </div>
            )}

            {/* Hero Items List */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-3 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : heroItems.length === 0 ? (
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-16 text-center">
                    <AlertCircle size={56} className="text-[#94A3B8] mx-auto mb-4" />
                    <p className="text-white text-xl font-semibold">No hero banners</p>
                    <p className="text-[#94A3B8] text-sm mt-2">
                        Click "Add Hero Banner" to create your first hero banner
                    </p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="hero-items">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                            >
                                {heroItems.map((item, index) => (
                                    <Draggable key={item._id} draggableId={item._id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border transition-all duration-200 ${snapshot.isDragging
                                                        ? 'border-[#C026D3] shadow-2xl scale-[1.02]'
                                                        : 'border-white/10 hover:border-[#C026D3]/30'
                                                    }`}
                                            >
                                                <div className="p-5">
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
                                                            <span className="text-[#C026D3] font-bold text-lg">{index + 1}</span>
                                                        </div>

                                                        {/* Media Preview */}
                                                        <div className="flex-shrink-0">
                                                            {item.type === 'image' && item.url && (
                                                                <img
                                                                    src={item.url}
                                                                    alt="Hero banner"
                                                                    className="w-24 h-24 rounded-xl object-cover"
                                                                />
                                                            )}
                                                            {item.type === 'video' && item.url && (
                                                                <video
                                                                    src={item.url}
                                                                    className="w-24 h-24 rounded-xl object-cover"
                                                                    muted
                                                                />
                                                            )}
                                                            {item.type === 'youtube' && (
                                                                <div className="w-24 h-24 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                                    <BsYoutube size={32} className="text-red-400" />
                                                                </div>
                                                            )}
                                                            {!item.url && item.type !== 'youtube' && (
                                                                <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center">
                                                                    {getTypeIcon(item.type)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Item Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between flex-wrap gap-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        {getTypeIcon(item.type)}
                                                                        <h3 className="text-white font-bold text-lg capitalize">
                                                                            {item.type} Banner
                                                                        </h3>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive
                                                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                                                : 'bg-red-500/20 text-red-400'
                                                                            }`}>
                                                                            {item.isActive ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                        {item.url && (
                                                                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                                                                                <Link size={12} />
                                                                                {item.url.substring(0, 50)}...
                                                                            </span>
                                                                        )}
                                                                        {item.filename && (
                                                                            <span className="text-xs text-[#94A3B8]">
                                                                                File: {item.filename}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {/* Move Up/Down Buttons */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <button
                                                                            onClick={() => moveItem(index, "up")}
                                                                            disabled={index === 0}
                                                                            className="p-1 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                                                                            title="Move Up"
                                                                        >
                                                                            <ArrowUp size={14} className="text-[#94A3B8]" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => moveItem(index, "down")}
                                                                            disabled={index === heroItems.length - 1}
                                                                            className="p-1 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                                                                            title="Move Down"
                                                                        >
                                                                            <ArrowDown size={14} className="text-[#94A3B8]" />
                                                                        </button>
                                                                    </div>

                                                                    {/* Toggle Active Button - Using PATCH */}
                                                                    <button
                                                                        onClick={() => handleToggleActive(item._id, item.isActive)}
                                                                        className={`p-2 rounded-lg transition-all ${item.isActive
                                                                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                                                                : 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400'
                                                                            }`}
                                                                        title={item.isActive ? "Deactivate" : "Activate"}
                                                                    >
                                                                        {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                    </button>

                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={() => handleDeleteHero(item._id, item.type)}
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
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Add Hero Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#071236] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-[#071236] flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-xl font-bold text-white">Add Hero Banner</h2>
                                <p className="text-[#94A3B8] text-sm mt-1">
                                    Add a new banner to the homepage hero carousel
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
                            {/* Media Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-3">
                                    Media Type
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'image', label: 'Image', icon: Image, color: 'blue' },
                                        { value: 'video', label: 'Video', icon: Video, color: 'purple' },
                                        { value: 'youtube', label: 'YouTube', icon: BsYoutube, color: 'red' }
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, type: type.value, url: "" }));
                                                setUploadFile(null);
                                                setUploadPreview(null);
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.type === type.value
                                                    ? `border-${type.color}-500 bg-${type.color}-500/10`
                                                    : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <type.icon size={24} className={`mx-auto mb-2 text-${type.color}-400`} />
                                            <p className="text-white text-sm font-medium">{type.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* URL or File Upload based on type */}
                            {formData.type === 'youtube' ? (
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        YouTube URL
                                    </label>
                                    <input
                                        type="text"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                        placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
                                    />
                                    {formData.url && (
                                        <div className="mt-3 rounded-xl overflow-hidden">
                                            <iframe
                                                src={getYouTubeEmbedUrl(formData.url)}
                                                title="YouTube Preview"
                                                className="w-full h-48"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        {formData.type === 'image' ? 'Image File or URL' : 'Video File or URL'}
                                    </label>

                                    {/* File Upload */}
                                    <div className="mb-4">
                                        <div
                                            className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#C026D3]/50 transition-all cursor-pointer"
                                            onClick={() => document.getElementById('media-upload').click()}
                                        >
                                            <Upload size={32} className="text-[#94A3B8] mx-auto mb-2" />
                                            <p className="text-white text-sm">Click to upload {formData.type} file</p>
                                            <p className="text-[#94A3B8] text-xs mt-1">
                                                Max size: {formData.type === 'image' ? '10MB' : '50MB'}
                                            </p>
                                            <input
                                                id="media-upload"
                                                type="file"
                                                accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    {uploadPreview && (
                                        <div className="mb-4">
                                            <p className="text-white text-sm mb-2">Preview:</p>
                                            <div className="rounded-xl overflow-hidden bg-black/50">
                                                {formData.type === 'image' ? (
                                                    <img src={uploadPreview} alt="Preview" className="w-full max-h-48 object-contain" />
                                                ) : (
                                                    <video src={uploadPreview} className="w-full max-h-48 object-contain" controls />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* OR Divider */}
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-[#071236] text-[#94A3B8]">OR</span>
                                        </div>
                                    </div>

                                    {/* URL Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">
                                            {formData.type === 'image' ? 'Image URL' : 'Video URL'}
                                        </label>
                                        <input
                                            type="text"
                                            name="url"
                                            value={formData.url}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                            placeholder={`Enter ${formData.type} URL`}
                                        />
                                    </div>
                                </div>
                            )}

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
                                onClick={handleAddHero}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        Add Banner
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

export default HeroBanners;