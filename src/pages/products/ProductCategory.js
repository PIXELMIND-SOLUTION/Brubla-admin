import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  FolderPlus,
  Image as ImageIcon,
  Loader,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Tag,
  Grid3x3,
  List,
  AlertCircle,
  ChevronRight
} from "lucide-react";

const API = "https://brublabackend.onrender.com/api/admin";

const ProductCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or cards
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIsActive, setCategoryIsActive] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  
  // Subcategory modal states
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryImage, setSubcategoryImage] = useState(null);
  const [subcategoryImagePreview, setSubcategoryImagePreview] = useState("");
  const [subcategoryIsActive, setSubcategoryIsActive] = useState(true);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);

  const getToken = () => sessionStorage.getItem("adminToken");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch categories",
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
    fetchCategories();
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Category CRUD operations
  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Category name is required",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    try {
      setCategoryLoading(true);
      const token = getToken();
      const response = await axios.post(
        `${API}/categories`,
        { name: categoryName, isActive: categoryIsActive },
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
          text: "Category added successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        resetCategoryModal();
        fetchCategories();
      }
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add category",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryName.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Category name is required",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    try {
      setCategoryLoading(true);
      const token = getToken();
      const response = await axios.put(
        `${API}/categories/${editingCategory._id}`,
        { name: categoryName, isActive: categoryIsActive },
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
          text: "Category updated successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        resetCategoryModal();
        fetchCategories();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update category",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: `Are you sure you want to delete "${category.name}"? All subcategories will also be deleted.`,
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
        await axios.delete(`${API}/categories/${category._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire({
          title: "Deleted!",
          text: "Category deleted successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete category",
          icon: "error",
          background: "#071236",
          color: "#FFFFFF",
          confirmButtonColor: "#C026D3",
        });
      }
    }
  };

  // Subcategory CRUD operations
  const handleAddSubcategory = async () => {
    if (!subcategoryName.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Subcategory name is required",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", subcategoryName);
    if (subcategoryImage) {
      formData.append("image", subcategoryImage);
    }

    try {
      setSubcategoryLoading(true);
      const token = getToken();
      const response = await axios.post(
        `${API}/categories/${selectedCategory._id}/subcategories`,
        formData,
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
          text: "Subcategory added successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        resetSubcategoryModal();
        fetchCategories();
      }
    } catch (error) {
      console.error("Error adding subcategory:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add subcategory",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setSubcategoryLoading(false);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!subcategoryName.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Subcategory name is required",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", subcategoryName);
    if (subcategoryImage) {
      formData.append("image", subcategoryImage);
    }

    try {
      setSubcategoryLoading(true);
      const token = getToken();
      const response = await axios.put(
        `${API}/categories/${selectedCategory._id}/subcategories/${editingSubcategory._id}`,
        formData,
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
          text: "Subcategory updated successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        resetSubcategoryModal();
        fetchCategories();
      }
    } catch (error) {
      console.error("Error updating subcategory:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update subcategory",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setSubcategoryLoading(false);
    }
  };

  const handleDeleteSubcategory = async (category, subcategory) => {
    const result = await Swal.fire({
      title: "Delete Subcategory?",
      text: `Are you sure you want to delete "${subcategory.name}"?`,
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
        await axios.delete(
          `${API}/categories/${category._id}/subcategories/${subcategory._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire({
          title: "Deleted!",
          text: "Subcategory deleted successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchCategories();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete subcategory",
          icon: "error",
          background: "#071236",
          color: "#FFFFFF",
          confirmButtonColor: "#C026D3",
        });
      }
    }
  };

  // Modal helpers
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryIsActive(true);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIsActive(category.isActive);
    setShowCategoryModal(true);
  };

  const openAddSubcategoryModal = (category) => {
    setSelectedCategory(category);
    setEditingSubcategory(null);
    setSubcategoryName("");
    setSubcategoryImage(null);
    setSubcategoryImagePreview("");
    setSubcategoryIsActive(true);
    setShowSubcategoryModal(true);
  };

  const openEditSubcategoryModal = (category, subcategory) => {
    setSelectedCategory(category);
    setEditingSubcategory(subcategory);
    setSubcategoryName(subcategory.name);
    setSubcategoryIsActive(subcategory.isActive);
    setSubcategoryImagePreview(subcategory.image);
    setSubcategoryImage(null);
    setShowSubcategoryModal(true);
  };

  const resetCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryIsActive(true);
    setCategoryLoading(false);
  };

  const resetSubcategoryModal = () => {
    setShowSubcategoryModal(false);
    setSelectedCategory(null);
    setEditingSubcategory(null);
    setSubcategoryName("");
    setSubcategoryImage(null);
    setSubcategoryImagePreview("");
    setSubcategoryIsActive(true);
    setSubcategoryLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubcategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubcategoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table View Component
  const TableView = () => (
    <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Subcategories</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCategories.map((category) => (
              <>
                <tr key={category._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCategory(category._id)}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {expandedCategories[category._id] ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center">
                        <FolderTree size={14} className="text-white" />
                      </div>
                      <span className="text-white font-medium">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      category.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#94A3B8] text-sm">{category.subcategories?.length || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditCategoryModal(category)}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openAddSubcategoryModal(category)}
                        className="p-2 rounded-lg bg-[#C026D3]/10 hover:bg-[#C026D3]/20 text-[#C026D3] transition-all"
                      >
                        <FolderPlus size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedCategories[category._id] && category.subcategories && category.subcategories.length > 0 && (
                  <tr className="bg-white/5">
                    <td colSpan="4" className="px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {category.subcategories.map((sub) => (
                          <div key={sub._id} className="bg-black/20 rounded-xl p-3 flex items-center justify-between group">
                            <div className="flex items-center gap-3 flex-1">
                              {sub.image ? (
                                <img
                                  src={sub.image}
                                  alt={sub.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                  <ImageIcon size={16} className="text-[#94A3B8]" />
                                </div>
                              )}
                              <div>
                                <p className="text-white text-sm font-medium">{sub.name}</p>
                                <span className={`text-xs ${sub.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {sub.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditSubcategoryModal(category, sub)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(category, sub)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Cards View Component
  const CardsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {filteredCategories.map((category) => {
        const isExpanded = expandedCategories[category._id];
        const subcategoryCount = category.subcategories?.length || 0;
        
        return (
          <div key={category._id} className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {/* Category Header */}
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center">
                  <FolderTree size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  <p className="text-xs text-[#94A3B8]">{subcategoryCount} subcategories</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${category.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => openEditCategoryModal(category)}
                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => openAddSubcategoryModal(category)}
                  className="p-2 rounded-lg bg-[#C026D3]/10 hover:bg-[#C026D3]/20 text-[#C026D3] transition-all"
                >
                  <FolderPlus size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {isExpanded && category.subcategories && category.subcategories.length > 0 && (
              <div className="border-t border-white/10 p-4 bg-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {category.subcategories.map((sub) => (
                    <div key={sub._id} className="bg-black/20 rounded-xl p-3 flex items-center justify-between group">
                      <div className="flex items-center gap-3 flex-1">
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <ImageIcon size={16} className="text-[#94A3B8]" />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{sub.name}</p>
                          <span className={`text-xs ${sub.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditSubcategoryModal(category, sub)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(category, sub)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FolderTree size={28} className="text-[#C026D3]" />
            Product Categories
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Manage categories and subcategories for your products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-2"
          >
            {viewMode === "table" ? <Grid3x3 size={18} /> : <List size={18} />}
            <span className="text-sm hidden sm:inline">
              {viewMode === "table" ? "Cards View" : "Table View"}
            </span>
          </button>
          <button
            onClick={fetchCategories}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openAddCategoryModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C026D3]/50 transition-all"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Total Categories</p>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#C026D3]/20 flex items-center justify-center">
              <FolderTree size={20} className="text-[#C026D3]" />
            </div>
          </div>
        </div>
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Active Categories</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Check size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm">Total Subcategories</p>
              <p className="text-2xl font-bold text-white">
                {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Tag size={20} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories View */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
          <AlertCircle size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <p className="text-white text-lg">No categories found</p>
          <p className="text-[#94A3B8] text-sm mt-2">Click "Add Category" to create your first category</p>
        </div>
      ) : viewMode === "table" ? (
        <TableView />
      ) : (
        <CardsView />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#071236] rounded-2xl border border-white/10 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={resetCategoryModal}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-[#94A3B8]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryIsActive}
                    onChange={(e) => setCategoryIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#C026D3] focus:ring-[#C026D3]"
                  />
                  <span className="text-white text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={resetCategoryModal}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                disabled={categoryLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {categoryLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {editingCategory ? <Edit size={16} /> : <Plus size={16} />}
                    {editingCategory ? "Update" : "Create"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#071236] rounded-2xl border border-white/10 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {editingSubcategory ? "Edit Subcategory" : `Add Subcategory to ${selectedCategory?.name}`}
              </h2>
              <button
                onClick={resetSubcategoryModal}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-[#94A3B8]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C026D3]/50 transition-all"
                  placeholder="Enter subcategory name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Subcategory Image
                </label>
                <div className="flex items-center gap-4">
                  {subcategoryImagePreview && (
                    <img
                      src={subcategoryImagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <label className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-center cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {subcategoryImage ? "Change Image" : "Upload Image"}
                  </label>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subcategoryIsActive}
                    onChange={(e) => setSubcategoryIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#C026D3] focus:ring-[#C026D3]"
                  />
                  <span className="text-white text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={resetSubcategoryModal}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingSubcategory ? handleUpdateSubcategory : handleAddSubcategory}
                disabled={subcategoryLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {subcategoryLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {editingSubcategory ? <Edit size={16} /> : <Plus size={16} />}
                    {editingSubcategory ? "Update" : "Create"}
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

export default ProductCategory;