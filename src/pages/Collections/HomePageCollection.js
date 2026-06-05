import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Layers,
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
    Home,
    ArrowUp,
    ArrowDown,
    Save,
    ShoppingBag,
    Tag,
    Calendar,
    CheckCircle
} from "lucide-react";

import {
    DragDropContext,
    Droppable,
    Draggable
} from "@hello-pangea/dnd";
const API = "https://brublabackend.onrender.com/api/admin";

const HomepageCollections = () => {
    const [homepageCollections, setHomepageCollections] = useState([]);
    const [allCollections, setAllCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [orderValue, setOrderValue] = useState(0);

    const getToken = () => sessionStorage.getItem("adminToken");

    // Fetch homepage collections
    const fetchHomepageCollections = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/homepage/collections`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                // Sort by order
                const sorted = response.data.data.sort((a, b) => a.order - b.order);
                setHomepageCollections(sorted);
            }
        } catch (error) {
            console.error("Error fetching homepage collections:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch homepage collections",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch all collections for adding
    const fetchAllCollections = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${API}/collections`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setAllCollections(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching collections:", error);
        }
    };

    useEffect(() => {
        fetchHomepageCollections();
        fetchAllCollections();
    }, []);

    // Add collection to homepage
    const handleAddToHomepage = async () => {
        if (!selectedCollection) {
            Swal.fire({
                title: "Error!",
                text: "Please select a collection",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
            });
            return;
        }

        try {
            const token = getToken();
            const response = await axios.post(
                `${API}/homepage/collections`,
                {
                    collectionId: selectedCollection,
                    order: orderValue,
                },
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
                    text: "Collection added to homepage",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                setShowAddModal(false);
                setSelectedCollection(null);
                setOrderValue(0);
                fetchHomepageCollections();
            }
        } catch (error) {
            console.error("Error adding to homepage:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to add collection",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        }
    };

    // Remove collection from homepage
    const handleRemoveFromHomepage = async (homepageCollectionId, collectionTitle) => {
        const result = await Swal.fire({
            title: "Remove from Homepage?",
            text: `Are you sure you want to remove "${collectionTitle}" from the homepage?`,
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
                await axios.delete(`${API}/homepage/collections/${homepageCollectionId}`);

                Swal.fire({
                    title: "Removed!",
                    text: "Collection removed from homepage",
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchHomepageCollections();
            } catch (error) {
                console.error("Error removing from homepage:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to remove collection",
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

        const items = Array.from(homepageCollections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local order
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index,
        }));

        setHomepageCollections(updatedItems);

        // Prepare data for API
        const reorderData = updatedItems.map((item, index) => ({
            collectionId: item.collectionId?._id || item.collectionId,
            order: index,
        }));

        // Save to server
        try {
            setSaving(true);
            const token = getToken();
            const response = await axios.put(
                `${API}/homepage/collections/reorder`,
                { collections: reorderData },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                // No need to show success message for every drag
            }
        } catch (error) {
            console.error("Error reordering collections:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to reorder collections",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            // Revert to original order on error
            fetchHomepageCollections();
        } finally {
            setSaving(false);
        }
    };

    // Move collection up/down
    const moveCollection = async (index, direction) => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= homepageCollections.length) return;

        const items = Array.from(homepageCollections);
        [items[index], items[newIndex]] = [items[newIndex], items[index]];

        const updatedItems = items.map((item, idx) => ({
            ...item,
            order: idx,
        }));

        setHomepageCollections(updatedItems);

        const reorderData = updatedItems.map((item, idx) => ({
            collectionId: item.collectionId?._id || item.collectionId,
            order: idx,
        }));

        try {
            setSaving(true);
            const token = getToken();
            await axios.put(
                `${API}/homepage/collections/reorder`,
                { collections: reorderData },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error("Error reordering:", error);
            fetchHomepageCollections();
        } finally {
            setSaving(false);
        }
    };

    // Get available collections (not already on homepage)
    const availableCollections = allCollections.filter(
        collection => !homepageCollections.some(hc => hc.collectionId?._id === collection._id || hc.collectionId === collection._id)
    );

    const filteredAvailableCollections = availableCollections.filter(collection =>
        collection.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const stats = {
        total: homepageCollections.length,
        active: homepageCollections.filter(hc => hc.isActive !== false).length,
        withProducts: homepageCollections.filter(hc => hc.collectionId?.products?.length > 0).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Home size={28} className="text-[#C026D3]" />
                        Homepage Collections
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">
                        Manage collections displayed on the homepage and their display order
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
                >
                    <Plus size={18} />
                    Add to Homepage
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Homepage Collections</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
                            <Home size={22} className="text-[#C026D3]" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Active Collections</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Check size={22} className="text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">With Products</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.withProducts}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <ShoppingBag size={22} className="text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Saving Indicator */}
            {saving && (
                <div className="fixed bottom-4 right-4 bg-[#071236] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg z-50">
                    <Loader size={16} className="animate-spin text-[#C026D3]" />
                    <span className="text-white text-sm">Saving changes...</span>
                </div>
            )}

            {/* Collections List */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-3 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : homepageCollections.length === 0 ? (
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-16 text-center">
                    <AlertCircle size={56} className="text-[#94A3B8] mx-auto mb-4" />
                    <p className="text-white text-xl font-semibold">No collections on homepage</p>
                    <p className="text-[#94A3B8] text-sm mt-2">
                        Click "Add to Homepage" to add collections
                    </p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="homepage-collections">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-3"
                            >
                                {homepageCollections.map((item, index) => {
                                    const collection = item.collectionId;
                                    const isValidCollection = collection && collection._id;

                                    if (!isValidCollection) {
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
                                                            <h3 className="text-white font-semibold">Invalid Collection</h3>
                                                            <p className="text-[#94A3B8] text-sm">This collection reference is invalid or has been deleted</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveFromHomepage(item.collectionId._id, "Invalid Collection")}
                                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
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

                                                            {/* Collection Image */}
                                                            <div className="flex-shrink-0">
                                                                {collection.image ? (
                                                                    <img
                                                                        src={collection.image}
                                                                        alt={collection.title}
                                                                        className="w-20 h-20 rounded-xl object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
                                                                        <Layers size={32} className="text-[#94A3B8]" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Collection Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between flex-wrap gap-2">
                                                                    <div>
                                                                        <h3 className="text-white font-bold text-lg">
                                                                            {collection.title}
                                                                        </h3>
                                                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                            {collection.tag && (
                                                                                <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                                                                                    <Tag size={12} />
                                                                                    {collection.tag}
                                                                                </span>
                                                                            )}
                                                                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                                                                                <ShoppingBag size={12} />
                                                                                {collection.products?.length || 0} products
                                                                            </span>
                                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${collection.isActive
                                                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                                                    : 'bg-red-500/20 text-red-400'
                                                                                }`}>
                                                                                {collection.isActive ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        {/* Move Up/Down Buttons */}
                                                                        <div className="flex flex-col gap-1">
                                                                            <button
                                                                                onClick={() => moveCollection(index, "up")}
                                                                                disabled={index === 0}
                                                                                className="p-1 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                                                                                title="Move Up"
                                                                            >
                                                                                <ArrowUp size={14} className="text-[#94A3B8]" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => moveCollection(index, "down")}
                                                                                disabled={index === homepageCollections.length - 1}
                                                                                className="p-1 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                                                                                title="Move Down"
                                                                            >
                                                                                <ArrowDown size={14} className="text-[#94A3B8]" />
                                                                            </button>
                                                                        </div>

                                                                        <button
                                                                            onClick={() => handleRemoveFromHomepage(item.collectionId._id, collection.title)}
                                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                                                            title="Remove from homepage"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Description */}
                                                                {collection.description && (
                                                                    <p className="text-[#94A3B8] text-sm mt-2 line-clamp-2">
                                                                        {collection.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Add to Homepage Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#071236] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-xl font-bold text-white">Add Collection to Homepage</h2>
                                <p className="text-[#94A3B8] text-sm mt-1">
                                    Select a collection to display on the homepage
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedCollection(null);
                                    setSearchTerm("");
                                    setOrderValue(0);
                                }}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-[#94A3B8]" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Search */}
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                <input
                                    type="text"
                                    placeholder="Search collections..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                />
                            </div>

                            {/* Order Input */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={orderValue}
                                    onChange={(e) => setOrderValue(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                                    placeholder="Enter order number"
                                />
                                <p className="text-xs text-[#94A3B8] mt-1">
                                    Collections will be sorted by order (lower numbers appear first)
                                </p>
                            </div>

                            {/* Available Collections */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-3">
                                    Select Collection
                                </label>
                                {filteredAvailableCollections.length === 0 ? (
                                    <div className="bg-white/5 rounded-xl p-8 text-center">
                                        <CheckCircle size={40} className="text-[#94A3B8] mx-auto mb-3" />
                                        <p className="text-white">No collections available</p>
                                        <p className="text-[#94A3B8] text-sm mt-1">
                                            {searchTerm ? "Try adjusting your search" : "All collections are already on the homepage"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {filteredAvailableCollections.map((collection) => (
                                            <div
                                                key={collection._id}
                                                className={`p-4 rounded-xl cursor-pointer transition-all ${selectedCollection === collection._id
                                                        ? 'bg-[#C026D3]/20 border-2 border-[#C026D3]'
                                                        : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                                                    }`}
                                                onClick={() => setSelectedCollection(collection._id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {collection.image ? (
                                                        <img
                                                            src={collection.image}
                                                            alt={collection.title}
                                                            className="w-16 h-16 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                                                            <Layers size={24} className="text-[#94A3B8]" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="text-white font-semibold">{collection.title}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {collection.tag && (
                                                                <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                                                                    <Tag size={10} />
                                                                    {collection.tag}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-[#94A3B8]">
                                                                {collection.products?.length || 0} products
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${collection.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                {collection.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        {collection.description && (
                                                            <p className="text-[#94A3B8] text-xs mt-1 line-clamp-1">
                                                                {collection.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedCollection === collection._id && (
                                                        <Check size={18} className="text-[#C026D3] flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#071236]/95">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedCollection(null);
                                    setSearchTerm("");
                                    setOrderValue(0);
                                }}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToHomepage}
                                disabled={!selectedCollection}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Plus size={18} />
                                Add to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageCollections;