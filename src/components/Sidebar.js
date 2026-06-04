import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Building2, Users, UserCircle,
    MessageSquare, X, Menu, ChevronDown,
    List, PlusCircle, Eye, Star, Briefcase, UserPlus,
    ChevronLeft, ChevronRight,
    ImagesIcon,
    BookMarked,
    Bell,
    ArrowBigLeft,
    LogOut,
    DollarSign,
    Boxes,
    Apple,
    Leaf,
    Carrot
} from "lucide-react";
import { BsGenderNeuter } from "react-icons/bs";
import logo from "../assets/logo.png"
import { FaPercentage } from "react-icons/fa";
import Swal from "sweetalert2";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
        to: "/dashboard/users",
        label: "Users",
        icon: Users,
        children: [
            { to: "/dashboard/users", label: "Today Users", icon: List },
        ],
    },
    {
        to: "/dashboard/productcategory",
        label: "Products",
        icon: Boxes,
        children: [
            { to: "/dashboard/productcategory", label: "All Categories", icon: List },
            { to: "/dashboard/products/create", label: "Create Product", icon: PlusCircle },
            { to: "/dashboard/products", label: "All Products", icon: Eye },
            { to: "/dashboard/products/recommended", label: "Recommended Products", icon: Star },
        ],
    },
    {
        to: "/dashboard/collections",
        label: "Collections",
        icon: BookMarked,
        children: [
            { to: "/dashboard/collections", label: "All Collections", icon: List },
            { to: "/dashboard/collections/homepage", label: "Homepage Collections", icon: Star },
        ],
    },
    {
        to: "/dashboard/login-banners",
        label: "Banners",
        icon: ImagesIcon,
        children: [
            { to: "/dashboard/login-banners", label: "Login  Banners", icon: List },
            { to: "/dashboard/hero-banners", label: "Hero Banner", icon: PlusCircle },
            { to: "/dashboard/ad-banners", label: "Ad Banners", icon: Eye },
            // { to: "/dashboard/user-banners", label: "User Banners", icon: Star },
        ],
    },
];


// ── Dropdown ───────────────────────────────────────────────────────
const DropdownItem = ({ to, item, setMobileOpen, collapsed }) => {
    const [open, setOpen] = useState(false);

    // Check if any child route is active
    const isChildActive = (children) => {
        const currentPath = window.location.pathname;
        return children.some(child => currentPath === child.to);
    };

    const hasActiveChild = isChildActive(item.children);

    const navigate = useNavigate();

    return (
        <div className="relative group">
            <button
                onClick={() => {
                    if (!collapsed) {
                        setOpen(!open);
                    }
                    navigate(to);
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
          ${collapsed ? "justify-center" : ""}
          ${open && !collapsed ? "bg-white/20" : ""}
          ${hasActiveChild && !collapsed && !open ? "bg-white/10 ring-1 ring-[#C026D3]/30" : ""}
          hover:bg-white/20`}
            >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                    <>
                        <span className="flex-1 text-left tracking-wide text-white">{item.label}</span>
                        <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 opacity-70 text-[#94A3B8] ${open ? "rotate-180" : ""}`}
                        />
                    </>
                )}
            </button>

            {/* Collapsed flyout */}
            {collapsed && (
                <div className="absolute left-full top-0 ml-3 z-50 hidden group-hover:block">
                    <div className="bg-gradient-to-br from-[#071236] via-[#020617] to-[#020617] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 w-48 border border-white/20 backdrop-blur-sm">
                        <p className="px-4 py-2 text-[10px] font-black text-[#C026D3] uppercase tracking-widest border-b border-white/20 mb-1">
                            {item.label}
                        </p>
                        {item.children.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all
                  ${isActive
                                        ? "bg-[#C026D3]/30 text-white border-l-2 border-[#C026D3]"
                                        : "text-[#94A3B8] hover:text-white hover:bg-white/10"}`
                                }
                            >
                                <Icon size={13} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* Expanded inline */}
            {!collapsed && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out
          ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                >
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-white/20 pl-3 pb-1">
                        {item.children.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                  ${isActive
                                        ? "bg-[#C026D3]/30 text-white border-l-2 border-[#C026D3]"
                                        : "text-[#94A3B8] hover:text-white hover:bg-white/10"
                                    }`
                                }
                            >
                                <Icon size={13} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Sidebar ───────────────────────────────────────────────────
const Sidebar = ({ mobileOpen, setMobileOpen }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to logout?",
            icon: "question",
            showCancelButton: true,
            background: "#071236",
            color: "#FFFFFF",
            confirmButtonText: "Yes, Logout",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "rounded-3xl",
                confirmButton: "bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-semibold mr-3",
                cancelButton: "bg-[#1E293B] text-white px-6 py-2 rounded-xl font-semibold",
            },
        });

        if (result.isConfirmed) {
            sessionStorage.removeItem("adminToken");
            sessionStorage.removeItem("user");
            sessionStorage.clear();

            await Swal.fire({
                title: "Logged Out!",
                text: "You have been logged out successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                background: "#071236",
                color: "#FFFFFF",
                customClass: {
                    popup: "rounded-3xl",
                },
            });

            window.location.href = "/";
        }
    };

    const sidebarContent = (isCollapsed) => (
        <div className="flex flex-col h-full bg-gradient-to-br from-[#071236] via-[#020617] to-[#020617] text-white shadow-xl">

            {/* Logo */}
            <div className={`flex items-center flex-shrink-0 border-b border-white/10
        ${isCollapsed ? "justify-center p-4" : "justify-between px-5 py-[18px]"}`}
            >
                {!isCollapsed && (
                    <div onClick={() => navigate('/dashboard')} className="flex items-center gap-2.5 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={logo}
                                alt="Brando Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div>
                            <span className="text-base font-black tracking-tight text-white">
                                Brubla
                            </span>
                            <span className="block text-[10px] text-[#C026D3] font-medium -mt-0.5 tracking-widest uppercase">
                                Admin Panel
                            </span>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={logo}
                            alt="Brando Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(!isCollapsed)}
                    className="hidden md:flex items-center justify-center w-7 h-7 rounded-full
            bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 text-white hover:scale-110"
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {navItems.map((item) =>
                    item.children ? (
                        <DropdownItem
                            key={item.label}
                            to={item.to}
                            item={item}
                            setMobileOpen={setMobileOpen}
                            collapsed={isCollapsed}
                        />
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/dashboard"}
                            onClick={() => setMobileOpen(false)}
                            title={isCollapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold tracking-wide
                ${isCollapsed ? "justify-center" : ""}
                ${isActive
                                    ? "bg-[#C026D3]/30 text-white ring-1 ring-[#C026D3]/50"
                                    : "text-[#94A3B8] hover:text-white hover:bg-white/10"
                                }`
                            }
                        >
                            <item.icon size={18} className="flex-shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    )
                )}
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide
                        ${collapsed ? "justify-center" : ""}
                        text-red-400 hover:bg-red-500/10 transition-all`}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </nav>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-white/10 p-3">
                <div className={`flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-2.5
          ${isCollapsed ? "justify-center" : ""} hover:bg-white/10 transition-colors`}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#C026D3] to-[#A020B0] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <img src={logo} className="w-8 h-8 rounded-xl object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold leading-tight truncate text-white">Brubla Admin</p>
                            <p className="text-[10px] text-[#94A3B8] truncate">Administrator</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl text-white bg-gradient-to-r from-[#C026D3] to-[#A020B0] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div className={`
        fixed top-0 left-0 h-full w-64 z-40 md:hidden
        transform transition-transform duration-300 ease-in-out
        shadow-2xl
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                {sidebarContent(false)}
            </div>

            {/* Desktop: fixed panel */}
            <div className={`
        hidden md:flex flex-col fixed top-0 left-0 h-screen z-20
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
      `}>
                {sidebarContent(collapsed)}
            </div>

            {/* Desktop: spacer */}
            <div className={`
        hidden md:block flex-shrink-0 transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `} />

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </>
    );
};

export default Sidebar;