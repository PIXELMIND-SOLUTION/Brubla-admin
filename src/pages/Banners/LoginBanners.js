import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Upload,
  Trash2,
  X,
  Loader,
  RefreshCw,
  AlertCircle,
  Check,
  Image as ImageIcon,
  Video,
  Play,
  Pause,
  Eye,
  Download,
  FileVideo,
  FileImage,
  Music,
  Settings,
  Monitor
} from "lucide-react";

const API = "https://brublabackend.onrender.com/api";

const LoginBanners = () => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState(null);

  const getToken = () => sessionStorage.getItem("adminToken");

  // Fetch login screen media
  const fetchLoginMedia = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API}/users/login-screen/media`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMedia(response.data.data);
        setMediaType(response.data.data.type);
      } else {
        setMedia(null);
      }
    } catch (error) {
      console.error("Error fetching login media:", error);
      if (error.response?.status !== 404) {
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch login screen media",
          icon: "error",
          background: "#071236",
          color: "#FFFFFF",
          confirmButtonColor: "#C026D3",
        });
      }
      setMedia(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginMedia();
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
    
    if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
      Swal.fire({
        title: "Invalid File!",
        text: "Please select an image (JPEG, PNG, GIF, WEBP) or video (MP4, MPEG, MOV, WEBM) file",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
      return;
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = validVideoTypes.includes(file.type) ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        title: "File Too Large!",
        text: `${validVideoTypes.includes(file.type) ? 'Video' : 'Image'} size should be less than ${validVideoTypes.includes(file.type) ? '50MB' : '10MB'}`,
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMediaType(validVideoTypes.includes(file.type) ? 'video' : 'image');
    setIsPlaying(false);
  };

  // Upload media
  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire({
        title: "Error!",
        text: "Please select a file to upload",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
      });
      return;
    }

    // Confirm upload (will replace existing media)
    if (media) {
      const result = await Swal.fire({
        title: "Replace Media?",
        text: "This will replace the existing login screen media. Continue?",
        icon: "warning",
        showCancelButton: true,
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
        cancelButtonColor: "#64748B",
        confirmButtonText: "Yes, replace",
        cancelButtonText: "Cancel",
      });
      
      if (!result.isConfirmed) return;
    }

    const formData = new FormData();
    formData.append("media", selectedFile);

    try {
      setUploading(true);
      const token = getToken();
      const response = await axios.post(`${API}/admin/login-screen/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: `${mediaType === 'video' ? 'Video' : 'Image'} uploaded successfully`,
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        
        // Clear selection and refresh
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchLoginMedia();
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to upload media",
        icon: "error",
        background: "#071236",
        color: "#FFFFFF",
        confirmButtonColor: "#C026D3",
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete media
  const handleDelete = async () => {
    if (!media) return;

    const result = await Swal.fire({
      title: "Delete Media?",
      text: "Are you sure you want to delete the login screen media?",
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
        setDeleting(true);
        const token = getToken();
        await axios.delete(`${API}/admin/login-screen/${media.filename}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire({
          title: "Deleted!",
          text: "Login screen media deleted successfully",
          icon: "success",
          background: "#071236",
          color: "#FFFFFF",
          timer: 1500,
          showConfirmButton: false,
        });
        
        setMedia(null);
        setMediaType(null);
        fetchLoginMedia();
      } catch (error) {
        console.error("Error deleting media:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete media",
          icon: "error",
          background: "#071236",
          color: "#FFFFFF",
          confirmButtonColor: "#C026D3",
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  // Clear file selection
  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setIsPlaying(false);
  };

  // Toggle video playback
  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (mediaType === 'video') return <Video size={48} className="text-[#C026D3]" />;
    return <ImageIcon size={48} className="text-[#C026D3]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Monitor size={28} className="text-[#C026D3]" />
            Login Screen Media
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Manage the background image or video displayed on the login screen
          </p>
        </div>
        <button
          onClick={fetchLoginMedia}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Settings size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Login Screen Customization</h3>
            <p className="text-[#94A3B8] text-sm mt-1">
              Upload an image or video to be displayed as the background on the login screen.
              Supported formats: Images (JPEG, PNG, GIF, WEBP up to 10MB) | Videos (MP4, MPEG, MOV, WEBM up to 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Current Media Display */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-3 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : media ? (
        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {mediaType === 'video' ? (
                  <Video size={24} className="text-[#C026D3]" />
                ) : (
                  <ImageIcon size={24} className="text-[#C026D3]" />
                )}
                <div>
                  <h2 className="text-white font-semibold text-lg">Current Login Media</h2>
                  <p className="text-[#94A3B8] text-sm">
                    {mediaType === 'video' ? 'Video' : 'Image'} • {media.filename}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                Delete
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Media Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black/50">
              {mediaType === 'video' ? (
                <div className="relative group">
                  <video
                    ref={ref => setVideoRef(ref)}
                    src={media.url}
                    className="w-full max-h-[500px] object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    controls
                    controlsList="nodownload"
                  />
                </div>
              ) : (
                <img
                  src={media.url}
                  alt="Login Screen Background"
                  className="w-full max-h-[500px] object-contain rounded-xl"
                />
              )}
            </div>

            {/* Media Info */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[#94A3B8] text-xs">File Name</p>
                <p className="text-white text-sm font-mono mt-1">{media.filename}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[#94A3B8] text-xs">Media Type</p>
                <p className="text-white text-sm font-semibold mt-1 capitalize">{mediaType}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-12 text-center">
          <AlertCircle size={56} className="text-[#94A3B8] mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">No media uploaded</p>
          <p className="text-[#94A3B8] text-sm mt-2">
            Upload an image or video to customize the login screen background
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Upload size={20} className="text-[#C026D3]" />
            Upload New Media
          </h2>
          <p className="text-[#94A3B8] text-sm mt-1">
            {media ? "Replace the current login screen media" : "Upload media for the login screen background"}
          </p>
        </div>

        <div className="p-6">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-[#C026D3]/50 transition-all cursor-pointer"
              onClick={() => document.getElementById('file-input').click()}
            >
              <Upload size={48} className="text-[#94A3B8] mx-auto mb-4" />
              <p className="text-white font-medium">Click to select a file</p>
              <p className="text-[#94A3B8] text-sm mt-2">
                or drag and drop
              </p>
              <p className="text-[#94A3B8] text-xs mt-4">
                Supported: Images (JPEG, PNG, GIF, WEBP up to 10MB) | Videos (MP4, MPEG, MOV, WEBM up to 50MB)
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview of selected file */}
              <div className="relative rounded-xl overflow-hidden bg-black/50">
                {mediaType === 'video' ? (
                  <div className="relative group">
                    <video
                      src={previewUrl}
                      className="w-full max-h-[400px] object-contain"
                      controls
                      controlsList="nodownload"
                    />
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-[400px] object-contain"
                  />
                )}
                <button
                  onClick={clearSelection}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* File Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon()}
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-[#94A3B8] text-xs">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {mediaType === 'video' ? 'Video' : 'Image'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#C026D3] to-[#2563EB] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          {media ? "Replace Media" : "Upload Media"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-gradient-to-br from-[#071236] to-[#0a1445] rounded-2xl border border-white/10 p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Check size={18} className="text-emerald-400" />
          Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#94A3B8]">• <span className="text-white">Image Resolution:</span> 1920x1080px or higher recommended</p>
            <p className="text-[#94A3B8] mt-2">• <span className="text-white">Video Resolution:</span> 1920x1080px (16:9 aspect ratio)</p>
            <p className="text-[#94A3B8] mt-2">• <span className="text-white">Video Length:</span> Keep under 30 seconds for optimal loading</p>
          </div>
          <div>
            <p className="text-[#94A3B8]">• <span className="text-white">File Size:</span> Images: &lt;10MB | Videos: &lt;50MB</p>
            <p className="text-[#94A3B8] mt-2">• <span className="text-white">Format:</span> Use compressed formats for faster loading</p>
            <p className="text-[#94A3B8] mt-2">• <span className="text-white">Content:</span> Ensure media is appropriate for all users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBanners;