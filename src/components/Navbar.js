import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Settings, LogOut, User, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import { Maximize, Minimize } from "lucide-react";

// Dummy notifications data
const dummyNotifications = [
  {
    _id: "1",
    title: "New User Registration",
    message: "John Doe has registered as a new user",
    type: "user",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    vendorId: null
  },
  {
    _id: "2",
    title: "Hostel Booking Confirmed",
    message: "Booking #12345 has been confirmed for Sunshine Hostel",
    type: "booking",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    relatedId: "12345"
  },
  {
    _id: "3",
    title: "New Hostel Listed",
    message: "Green Valley Hostel has been listed on the platform",
    type: "hostel",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    relatedId: "67890",
    vendorId: { name: "Vendor Name" }
  },
  {
    _id: "4",
    title: "Payment Received",
    message: "Payment of ₹5,000 has been received for booking #12345",
    type: "payment",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    vendorId: null
  },
  {
    _id: "5",
    title: "User Feedback Submitted",
    message: "New 5-star rating received for Sunshine Hostel",
    type: "feedback",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    vendorId: { name: "Sunshine Hostel" }
  }
];

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Calculate unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  // Simulate loading effect
  useEffect(() => {
    setLoadingNotifications(true);
    const timer = setTimeout(() => {
      setLoadingNotifications(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      background: '#071236',
      color: '#FFFFFF',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-gradient-to-r from-[#C026D3] to-[#A020B0] text-white px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'bg-[#1E293B] text-white px-6 py-2 rounded-xl font-semibold'
      }
    });

    if (result.isConfirmed) {
      // Clear auth
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("user");
      sessionStorage.clear();

      showAlert('success', 'Logged Out!', 'You have been logged out successfully', 1500);

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  };

  const handleSettings = () => {
    navigate('/dashboard/settings');
    setOpen(false);
  };

  const handleProfile = () => {
    navigate('/dashboard/profile');
    setOpen(false);
  };

  const handleNotificationClick = (notification) => {
    // Handle notification click - navigate to relevant page
    if (notification.type === 'hostel' && notification.relatedId) {
      navigate(`/dashboard/hostels/${notification.relatedId}`);
    } else if (notification.type === 'booking' && notification.relatedId) {
      navigate(`/dashboard/bookings/${notification.relatedId}`);
    } else if (notification.type === 'user') {
      navigate('/dashboard/customers');
    } else if (notification.type === 'feedback') {
      navigate('/dashboard/feedback');
    } else if (notification.type === 'payment') {
      navigate('/dashboard/payments');
    }
    setNotificationsOpen(false);
  };

  const markAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification._id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const showAlert = (icon, title, text, timer) => Swal.fire({
    icon, title, text, timer,
    background: '#071236',
    color: '#FFFFFF',
    showConfirmButton: false,
    customClass: {
      popup: 'rounded-2xl',
    }
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'hostel': return '🏨';
      case 'booking': return '📅';
      case 'user': return '👤';
      case 'payment': return '💰';
      case 'feedback': return '⭐';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'hostel': return 'border-[#C026D3]/30 bg-[#C026D3]/5';
      case 'booking': return 'border-[#2563EB]/30 bg-[#2563EB]/5';
      case 'user': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'payment': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'feedback': return 'border-orange-500/30 bg-orange-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="bg-[#071236]/90 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] px-4 md:px-6 py-3 flex items-center justify-between gap-4 border-b border-white/10 sticky top-0 z-50">

        {/* Left section - Mobile Menu Button + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo / Brand */}
          <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C026D3] to-[#A020B0] flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg">Brubla Admin</h1>
              <p className="text-[10px] text-[#C026D3]">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-xl hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors duration-200"
            aria-label="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C026D3] animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Menu */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 md:w-96 bg-[#071236] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[1000]"
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell size={14} className="text-[#C026D3]" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="text-xs bg-[#C026D3]/20 text-[#C026D3] px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-[#C026D3] hover:text-[#D946EF] transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded-lg hover:bg-white/10 text-[#94A3B8] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => {
                            handleNotificationClick(notification);
                            if (!notification.isRead) markAsRead(notification._id);
                          }}
                          className={`p-4 hover:bg-white/5 transition-colors duration-200 cursor-pointer border-b border-white/5 last:border-0 ${!notification.isRead ? 'bg-[#C026D3]/5' : ''
                            } ${getNotificationColor(notification.type)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-white truncate">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-[#C026D3] flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-[#94A3B8] line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-[#64748B] mt-2">
                                {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {notification.vendorId && (
                                <p className="text-xs text-[#C026D3] mt-1">
                                  Vendor: {notification.vendorId.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bell size={32} className="text-[#64748B] mx-auto mb-2" />
                        <p className="text-sm text-[#94A3B8]">No notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-white/10 rounded-xl px-2.5 py-1.5 transition-colors duration-200"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C026D3] to-[#A020B0] flex items-center justify-center text-white text-sm font-black overflow-hidden">
                <img src={logo} alt="Admin" className="w-full h-full object-cover" />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-white">Brubla Admin</p>
              </div>

              <ChevronDown
                size={14}
                className={`text-[#94A3B8] hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-[#071236] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[1000]"
                >
                  {/* User Info Header */}
                  <div onClick={() => navigate('/dashboard')} className="px-4 py-3 border-b border-white/10 bg-white/5 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C026D3] to-[#A020B0] flex items-center justify-center text-white font-bold overflow-hidden">
                        <img src={logo} alt="Admin" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Brubla Admin</p>
                        <p className="text-xs text-[#94A3B8]">Administrator</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleProfile}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      onClick={handleSettings}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-white/10" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;