import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    ArrowLeft,
    Wallet,
    Plus,
    Minus,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    RotateCcw,
    Calendar,
    FileText,
    Mail,
    Phone,
    Copy,
    Check,
    AlertCircle
} from "lucide-react";

const API = "http://31.97.228.17:4077/api/admin";

const AdminUserWallet = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [loading, setLoading] = useState(true);
    const [transactionLoading, setTransactionLoading] = useState(false);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeductModal, setShowDeductModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    
    // Form states
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [reason, setReason] = useState("");
    const [orderId, setOrderId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const getToken = () => sessionStorage.getItem("adminToken");

    const fetchWalletSummary = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${API}/wallet/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setWalletData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching wallet:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch wallet details",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (page = 1) => {
        try {
            setTransactionLoading(true);
            const token = getToken();
            const response = await axios.get(
                `${API}/wallet/${id}/transactions?page=${page}&limit=${pagination.limit}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Fix: Access transactions.data correctly
                const transactionData = response.data.data.transactions;
                setTransactions(transactionData || []);
                setPagination({
                    ...pagination,
                    total: transactionData.pagination?.total || 0,
                    pages: transactionData.pagination?.pages || 1,
                    page: page,
                    hasNextPage: transactionData.pagination?.hasNextPage || false,
                    hasPrevPage: transactionData.pagination?.hasPrevPage || false,
                    limit: transactionData.pagination?.limit || 10
                });
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch transactions",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setTransactionLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletSummary();
        fetchTransactions(1);
    }, [id]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchTransactions(newPage);
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case "credit":
                return <TrendingUp size={16} className="text-emerald-400" />;
            case "debit":
                return <TrendingDown size={16} className="text-red-400" />;
            case "refund":
                return <RotateCcw size={16} className="text-blue-400" />;
            case "cashback":
                return <RefreshCw size={16} className="text-amber-400" />;
            default:
                return <FileText size={16} className="text-[#94A3B8]" />;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case "credit":
                return "text-emerald-400";
            case "debit":
                return "text-red-400";
            case "refund":
                return "text-blue-400";
            case "cashback":
                return "text-amber-400";
            default:
                return "text-[#94A3B8]";
        }
    };

    const getTransactionBadge = (type) => {
        const styles = {
            credit: "bg-emerald-500/20 text-emerald-400",
            debit: "bg-red-500/20 text-red-400",
            refund: "bg-blue-500/20 text-blue-400",
            cashback: "bg-amber-500/20 text-amber-400"
        };
        return styles[type] || "bg-gray-500/20 text-gray-400";
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            Swal.fire({
                title: "Invalid Amount",
                text: "Please enter a valid amount",
                icon: "warning",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = getToken();
            const response = await axios.post(
                `${API}/wallet/${id}/add-money`,
                {
                    amount: parseFloat(amount),
                    description: description || "Admin credit",
                    reason: reason || "Manual addition"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: response.data.message,
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                    timer: 2000,
                    timerProgressBar: true,
                });
                setShowAddModal(false);
                resetForms();
                fetchWalletSummary();
                fetchTransactions(pagination.page);
            }
        } catch (error) {
            console.error("Error adding money:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to add money",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeductMoney = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            Swal.fire({
                title: "Invalid Amount",
                text: "Please enter a valid amount",
                icon: "warning",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            return;
        }

        if (parseFloat(amount) > walletData?.wallet?.balance) {
            Swal.fire({
                title: "Insufficient Balance",
                text: `Cannot deduct more than ₹${walletData?.wallet?.balance}`,
                icon: "warning",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = getToken();
            const response = await axios.post(
                `${API}/wallet/${id}/deduct`,
                {
                    amount: parseFloat(amount),
                    description: description || "Admin debit",
                    reason: reason || "Manual deduction"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: response.data.message,
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                    timer: 2000,
                    timerProgressBar: true,
                });
                setShowDeductModal(false);
                resetForms();
                fetchWalletSummary();
                fetchTransactions(pagination.page);
            }
        } catch (error) {
            console.error("Error deducting money:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to deduct money",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRefund = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            Swal.fire({
                title: "Invalid Amount",
                text: "Please enter a valid amount",
                icon: "warning",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            return;
        }

        if (!orderId) {
            Swal.fire({
                title: "Order ID Required",
                text: "Please enter an order ID",
                icon: "warning",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = getToken();
            const response = await axios.post(
                `${API}/wallet/${id}/refund`,
                {
                    amount: parseFloat(amount),
                    orderId: orderId,
                    description: description || "Order refund"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: response.data.message,
                    icon: "success",
                    background: "#071236",
                    color: "#FFFFFF",
                    confirmButtonColor: "#C026D3",
                    timer: 2000,
                    timerProgressBar: true,
                });
                setShowRefundModal(false);
                resetForms();
                fetchWalletSummary();
                fetchTransactions(pagination.page);
            }
        } catch (error) {
            console.error("Error processing refund:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to process refund",
                icon: "error",
                background: "#071236",
                color: "#FFFFFF",
                confirmButtonColor: "#C026D3",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForms = () => {
        setAmount("");
        setDescription("");
        setReason("");
        setOrderId("");
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderPagination = () => {
        const { page, pages } = pagination;
        if (pages <= 1) return null;

        const pageNumbers = [];
        const maxVisible = 5;
        const halfVisible = Math.floor(maxVisible / 2);

        let startPage = Math.max(1, page - halfVisible);
        let endPage = Math.min(pages, page + halfVisible);

        if (endPage - startPage < maxVisible - 1) {
            if (startPage === 1) {
                endPage = Math.min(pages, startPage + maxVisible - 1);
            } else if (endPage === pages) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }
        }

        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) pageNumbers.push("ellipsis");
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (endPage < pages) {
            if (endPage < pages - 1) pageNumbers.push("ellipsis");
            pageNumbers.push(pages);
        }

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-white/10">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={16} className="sm:size-[18px]" />
                    </button>
                    
                    {pageNumbers.map((num, index) => (
                        num === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} className="text-[#94A3B8] px-1 sm:px-2 text-sm">...</span>
                        ) : (
                            <button
                                key={num}
                                onClick={() => handlePageChange(num)}
                                className={`min-w-[30px] sm:min-w-[36px] h-[30px] sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                    page === num
                                        ? "bg-[#C026D3] text-white"
                                        : "bg-white/5 text-[#94A3B8] hover:bg-white/10"
                                }`}
                            >
                                {num}
                            </button>
                        )
                    ))}
                    
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={16} className="sm:size-[18px]" />
                    </button>
                </div>
                
                <span className="text-xs sm:text-sm text-[#94A3B8]">
                    Page {page} of {pages}
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-8 h-8 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!walletData) {
        return (
            <div className="text-center py-20">
                <p className="text-[#94A3B8]">Wallet data not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                        <ArrowLeft size={18} className="sm:size-[20px]" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Wallet Management</h1>
                        <p className="text-[#94A3B8] text-xs sm:text-sm mt-0.5 sm:mt-1">Manage user wallet and transactions</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        fetchWalletSummary();
                        fetchTransactions(pagination.page);
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] text-sm sm:text-base transition-all"
                >
                    <RefreshCw size={14} className="sm:size-[16px]" />
                    <span className="hidden xs:inline">Refresh</span>
                </button>
            </div>

            {/* User Info Card */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#C026D3] to-[#2563EB] flex items-center justify-center text-white text-base sm:text-xl font-bold flex-shrink-0">
                            {walletData.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1 sm:flex-none">
                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">{walletData.user.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#94A3B8]">
                                <span className="flex items-center gap-1 truncate">
                                    <Mail size={12} className="sm:size-[14px] flex-shrink-0" />
                                    <span className="truncate">{walletData.user.email}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone size={12} className="sm:size-[14px] flex-shrink-0" />
                                    <span className="truncate">{walletData.user.mobile}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                        <button
                            onClick={() => copyToClipboard(walletData.user.id)}
                            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] text-xs sm:text-sm transition-all w-full sm:w-auto justify-center"
                        >
                            {copied ? <Check size={12} className="sm:size-[14px]" /> : <Copy size={12} className="sm:size-[14px]" />}
                            {copied ? "Copied!" : "Copy ID"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Wallet Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-xs sm:text-sm">Balance</p>
                            <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
                                ₹{walletData.wallet.balance}
                            </p>
                        </div>
                        <Wallet size={20} className="sm:size-[24px] text-[#C026D3]" />
                    </div>
                </div>
                
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-xs sm:text-sm">Total Credits</p>
                            <p className="text-lg sm:text-2xl font-bold text-emerald-400 mt-0.5 sm:mt-1">
                                +₹{walletData.wallet.totalCredits || 0}
                            </p>
                        </div>
                        <TrendingUp size={20} className="sm:size-[24px] text-emerald-400" />
                    </div>
                </div>
                
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-xs sm:text-sm">Total Debits</p>
                            <p className="text-lg sm:text-2xl font-bold text-red-400 mt-0.5 sm:mt-1">
                                -₹{walletData.wallet.totalDebits || 0}
                            </p>
                        </div>
                        <TrendingDown size={20} className="sm:size-[24px] text-red-400" />
                    </div>
                </div>
                
                <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-xs sm:text-sm">Transactions</p>
                            <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
                                {walletData.wallet.transactionCount || 0}
                            </p>
                        </div>
                        <FileText size={20} className="sm:size-[24px] text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex-1 sm:flex-none items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all text-sm sm:text-base"
                >
                    <Plus size={16} className="sm:size-[18px] inline mr-1 sm:mr-2" />
                    Add Money
                </button>
                <button
                    onClick={() => setShowDeductModal(true)}
                    className="flex-1 sm:flex-none items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all text-sm sm:text-base"
                >
                    <Minus size={16} className="sm:size-[18px] inline mr-1 sm:mr-2" />
                    Deduct Money
                </button>
                <button
                    onClick={() => setShowRefundModal(true)}
                    className="flex-1 sm:flex-none items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all text-sm sm:text-base"
                >
                    <RotateCcw size={16} className="sm:size-[18px] inline mr-1 sm:mr-2" />
                    Process Refund
                </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-[#071236]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Transaction History</h3>
                    <span className="text-xs sm:text-sm text-[#94A3B8]">
                        {pagination.total} transactions
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] sm:min-w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Type</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Amount</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider hidden md:table-cell">Description</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider hidden sm:table-cell">Status</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider hidden lg:table-cell">Balance</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactionLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-[#94A3B8]">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#C026D3] border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-3" />
                                        <span className="text-xs sm:text-sm">Loading transactions...</span>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-[#94A3B8]">
                                        <AlertCircle size={32} className="sm:size-[40px] mx-auto mb-2 sm:mb-3 opacity-50" />
                                        <span className="text-xs sm:text-sm">No transactions found</span>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium ${getTransactionBadge(tx.type)}`}>
                                                {getTransactionIcon(tx.type)}
                                                <span className="hidden xs:inline">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
                                            </span>
                                        </td>
                                        <td className={`px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm ${getTransactionColor(tx.type)}`}>
                                            {tx.type === "debit" ? "-" : "+"}₹{tx.amount}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                            <div className="text-white text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">{tx.description}</div>
                                            {tx.referenceId && (
                                                <div className="text-[#94A3B8] text-[10px] sm:text-xs mt-0.5 truncate max-w-[120px] sm:max-w-[200px]">
                                                    Ref: {tx.referenceId}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium bg-emerald-500/20 text-emerald-400">
                                                <Check size={10} className="sm:size-[12px]" />
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-xs sm:text-sm hidden lg:table-cell">
                                            ₹{tx.balance}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] sm:text-sm">
                                                <Calendar size={12} className="sm:size-[14px] flex-shrink-0" />
                                                <span className="whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-[#94A3B8] text-[9px] sm:text-xs whitespace-nowrap">
                                                {new Date(tx.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {renderPagination()}
            </div>

            {/* Add Money Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-[#071236] rounded-2xl border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Add Money to Wallet</h3>
                        <form onSubmit={handleAddMoney}>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="Enter amount"
                                        min="1"
                                        step="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="e.g., Welcome bonus"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Reason</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="e.g., New user promotion"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForms();
                                    }}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] text-sm sm:text-base transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Processing..." : "Add Money"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deduct Money Modal */}
            {showDeductModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-[#071236] rounded-2xl border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Deduct Money from Wallet</h3>
                        <form onSubmit={handleDeductMoney}>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="Enter amount"
                                        min="1"
                                        max={walletData?.wallet?.balance}
                                        step="1"
                                        required
                                    />
                                    <p className="text-[#94A3B8] text-[10px] sm:text-xs mt-1 sm:mt-1.5">
                                        Available balance: ₹{walletData?.wallet?.balance}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="e.g., Late delivery penalty"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Reason</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="e.g., Order delayed by 2 days"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeductModal(false);
                                        resetForms();
                                    }}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] text-sm sm:text-base transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Processing..." : "Deduct Money"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-[#071236] rounded-2xl border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Process Refund</h3>
                        <form onSubmit={handleRefund}>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="Enter amount"
                                        min="1"
                                        step="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Order ID</label>
                                    <input
                                        type="text"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="Enter order ID"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[#94A3B8] text-xs sm:text-sm block mb-1 sm:mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-[#C026D3] outline-none transition-all"
                                        placeholder="e.g., Order cancellation refund"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        resetForms();
                                    }}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] text-sm sm:text-base transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Processing..." : "Process Refund"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserWallet;