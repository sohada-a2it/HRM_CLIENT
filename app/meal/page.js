"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Building,
  Search,
  ChevronRight,
  ChevronLeft,
  Settings,
  Bell,
  LogOut,
  User,
  History,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  FileText,
  BarChart,
  Package,
  Coffee,
  Pizza,
  Check,
  X,
  Moon,
  Sun,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
  Home,
  Menu,
  Grid,
  List,
  Star,
  Target,
  AlertCircle,
  Info,
  ExternalLink,
  Gift,
  Trash2,
  Download,
  Filter
} from "lucide-react";
import { toast } from "react-hot-toast";
import mealService from "@/service/mealService";

export default function MealPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [allRequests, setAllRequests] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalRequests: 0,
    singleRequests: 0,
    monthlySubscribers: 0,
    requested: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    adminCreated: 0,
    filteredRequests: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestForm, setRequestForm] = useState({
    mealPreference: "office",
    note: "",
    month: getCurrentMonth()
  });
  const [subscriptionForm, setSubscriptionForm] = useState({
    mealPreference: "office",
    autoRenew: true
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [myMealStatus, setMyMealStatus] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [adminCreateForm, setAdminCreateForm] = useState({
    employeeId: "",
    month: getCurrentMonth(),
    mealPreference: "office",
    note: "",
    status: "approved"
  });
  const [showAdminCreateModal, setShowAdminCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    preference: "",
    note: "",
    mealDays: 0
  });

  const router = useRouter();

  // Helper functions
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  }

  function formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  }

  function getMonthName(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const data = await mealService.getProfile();
      
      if (data.success && data.user) {
        const userData = data.user;
        setUser(userData);
        
        // Set user role
        setIsAdmin(userData.role === "admin" || userData.role === "superAdmin");
        setIsEmployee(userData.role === "employee");
        setIsModerator(userData.role === "moderator");
         
        // Eligibility check for all onsite users
        const eligible = (userData.role === 'employee' || 
                         userData.role === 'admin' || 
                         userData.role === 'moderator') && 
                         userData.workLocationType === 'onsite';
        setIsEligible(eligible);
      } else {
        toast.error("Failed to load user data");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load user data");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const data = await mealService.getDepartments();
      if (data.success && data.departments) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch all meal requests for admin
  const fetchAllMealRequests = async () => {
    if (!isAdmin && !isModerator) return;
    
    try {
      setIsLoadingData(true);
      
      const params = {
        month: selectedMonth,
        department: selectedDepartment !== 'all' ? selectedDepartment : '',
        status: filterStatus !== 'all' ? filterStatus : '',
        type: filterType !== 'all' ? filterType : '',
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const data = await mealService.getAllSubscriptions(params);
      
      if (data.success) {
        setAllRequests(data.subscriptions || []);
        setStats({
          totalRequests: data.total || 0,
          approved: data.approved || 0,
          requested: data.pending || 0,
          rejected: data.rejected || 0,
          monthlySubscribers: data.totalSubscriptions || 0,
          adminCreated: data.adminCreated || 0,
          totalEmployees: data.totalEmployees || 0
        });
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error("Failed to load meal requests");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch my meal requests
  const fetchMyMealRequests = async () => {
    if (!isEmployee && !isEligible) return;
    
    try {
      const params = {
        status: filterStatus !== 'all' ? filterStatus : '',
        month: selectedMonth
      };
      
      const data = await mealService.getMyDailyMeals(params);
      if (data.success) {
        setMyRequests(data.meals || []);
      }
    } catch (error) {
      console.error("Error fetching my requests:", error);
    }
  };

  // Fetch my meal status
  const fetchMyMealStatus = async () => {
    if (!isEmployee && !isEligible) return;
    
    try {
      const subscriptionData = await mealService.getMySubscription();
      const dashboardData = await mealService.getDashboardStats();
      
      if (subscriptionData.success || dashboardData.success) {
        const status = {
          displayStatus: subscriptionData.data?.status || 'none',
          displayPreference: subscriptionData.data?.preference || 'none',
          subscription: subscriptionData.data?.status || 'none',
          autoRenew: subscriptionData.data?.autoRenew || false,
          currentMonth: selectedMonth
        };
        
        setMyMealStatus(status);
      }
    } catch (error) {
      console.error("Error fetching meal status:", error);
    }
  };

  // Fetch monthly report for admin
  const fetchMonthlyReport = async () => {
    if (!isAdmin && !isModerator) return;
    
    try {
      setIsLoadingData(true);
      
      const params = {
        month: selectedMonth,
        department: selectedDepartment !== 'all' ? selectedDepartment : ''
      };
      
      const data = await mealService.getMonthlyReport(params);
      
      if (data.success) {
        setMonthlyReport(data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load monthly report");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const data = await mealService.getDashboardStats();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          totalRequests: data.totalRequests || 0,
          monthlySubscribers: data.monthlySubscribers || 0,
          singleRequests: data.singleRequests || 0,
          approved: data.approved || 0,
          requested: data.pending || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Handle meal request submission (single request)
  const handleSubmitMealRequest = async () => {
    try {
      const data = await mealService.requestDailyMeal({
        preference: requestForm.mealPreference,
        note: requestForm.note,
        date: new Date().toISOString().split('T')[0]
      });
      
      if (data.success) {
        toast.success("Meal request submitted successfully!");
        setShowRequestModal(false);
        setRequestForm({ mealPreference: "office", note: "", month: getCurrentMonth() });
        fetchMyMealStatus();
        fetchMyMealRequests();
        fetchDashboardStats();
      } else {
        toast.error(data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle monthly subscription setup
  const handleSetupSubscription = async () => {
    try {
      const data = await mealService.setupSubscription({
        preference: subscriptionForm.mealPreference,
        autoRenew: subscriptionForm.autoRenew
      });
      
      if (data.success) {
        toast.success("Monthly subscription activated!");
        setShowSubscriptionModal(false);
        setSubscriptionForm({ mealPreference: "office", autoRenew: true });
        fetchMyMealStatus();
        fetchMyMealRequests();
        fetchDashboardStats();
      } else {
        toast.error(data.message || "Failed to setup subscription");
      }
    } catch (error) {
      console.error("Error setting up subscription:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    
    try {
      const data = await mealService.cancelSubscription({
        reason: "Cancelled by user"
      });
      
      if (data.success) {
        toast.success("Subscription cancelled successfully");
        fetchMyMealStatus();
        fetchMyMealRequests();
        fetchDashboardStats();
      } else {
        toast.error(data.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle auto-renew update
  const handleUpdateAutoRenew = async (autoRenew) => {
    try {
      const data = await mealService.updateAutoRenew({
        autoRenew: autoRenew
      });
      
      if (data.success) {
        toast.success(`Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`);
        fetchMyMealStatus();
      } else {
        toast.error(data.message || "Failed to update auto-renew");
      }
    } catch (error) {
      console.error("Error updating auto-renew:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle admin create meal request
  const handleAdminCreateMeal = async () => {
    try {
      const data = await mealService.adminCreateSubscription({
        employeeId: adminCreateForm.employeeId,
        preference: adminCreateForm.mealPreference,
        autoRenew: true,
        status: adminCreateForm.status,
        note: adminCreateForm.note
      });
      
      if (data.success) {
        toast.success("Meal subscription created successfully!");
        setShowAdminCreateModal(false);
        setAdminCreateForm({
          employeeId: "",
          month: getCurrentMonth(),
          mealPreference: "office",
          note: "",
          status: "approved"
        });
        fetchAllMealRequests();
        fetchDashboardStats();
      } else {
        toast.error(data.message || "Failed to create meal subscription");
      }
    } catch (error) {
      console.error("Error creating meal request:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle admin approve/reject meal request
  const handleUpdateRequestStatus = async (action) => {
    try {
      const data = await mealService.adminApproveSubscription({
        subscriptionId: selectedRequest?._id,
        month: selectedRequest?.month || selectedMonth,
        status: action === 'approve' ? 'approved' : 'rejected',
        note: action === 'reject' ? 'Request processed by admin' : ''
      });
      
      if (data.success) {
        toast.success(`Request ${action}ed successfully!`);
        setShowApproveModal(false);
        setShowRejectModal(false);
        setSelectedRequest(null);
        fetchAllMealRequests();
        fetchDashboardStats();
      } else {
        toast.error(data.message || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle delete my meal request
  const handleDeleteMyMealRequest = async () => {
    try {
      const data = await mealService.cancelDailyMeal({
        mealId: selectedRequest?._id,
        reason: "Cancelled by user"
      });
      
      if (data.success) {
        toast.success("Meal request cancelled successfully!");
        setShowDeleteModal(false);
        setSelectedRequest(null);
        fetchMyMealStatus();
        fetchMyMealRequests();
        fetchDashboardStats();
      } else {
        toast.error(data.message || "Failed to cancel meal request");
      }
    } catch (error) {
      console.error("Error cancelling meal request:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle admin delete meal request
  const handleAdminDeleteMealRequest = async () => {
    try {
      // Note: You need to implement a delete endpoint in backend
      // For now, we'll use update to mark as cancelled
      const data = await mealService.adminApproveSubscription({
        subscriptionId: selectedRequest?._id,
        status: 'cancelled',
        note: 'Deleted by admin'
      });
      
      if (data.success) {
        toast.success("Meal request deleted successfully!");
        setShowDeleteModal(false);
        setSelectedRequest(null);
        fetchAllMealRequests();
        fetchDashboardStats();
      } else {
        toast.error(data.message || "Failed to delete meal request");
      }
    } catch (error) {
      console.error("Error deleting meal request:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Export meal data for payroll
  const handleExportPayrollData = async () => {
    try {
      const data = await mealService.exportPayrollData({
        month: selectedMonth
      });
      
      if (data.success && data.data) {
        // Create and download CSV
        const csvContent = convertToCSV(data.data);
        downloadCSV(csvContent, `meal-payroll-data-${selectedMonth}.csv`);
        toast.success("Data exported successfully!");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data) => {
    const headers = ["Employee ID", "Name", "Department", "Has Meal Request", "Meal Preference", "Meal Status", "Meal Days"];
    const rows = data.map(item => [
      item.employeeId,
      item.name,
      item.department,
      item.hasMealRequest ? "Yes" : "No",
      item.mealPreference || "N/A",
      item.mealStatus,
      item.currentMealDays
    ]);
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  // Helper function to download CSV
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Get available months for dropdown
  const getAvailableMonths = () => {
    const months = [];
    const current = new Date();
    
    // Last 3 months, current, and next 2 months
    for (let i = -3; i < 3; i++) {
      const date = new Date(current.getFullYear(), current.getMonth() + i, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(month);
    }
    
    return months;
  };

  // Initialize data
  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (user) {
      if (isAdmin || isModerator) {
        fetchAllMealRequests();
        fetchDashboardStats();
      }
      if (isEmployee && isEligible) {
        fetchMyMealStatus();
        fetchMyMealRequests();
        fetchDashboardStats();
      }
    }
  }, [user, selectedMonth, selectedDepartment, filterStatus, filterType, currentPage, searchQuery]);

  useEffect(() => {
    if (activeTab === "reports" && (isAdmin || isModerator)) {
      fetchMonthlyReport();
    }
  }, [activeTab, selectedMonth, selectedDepartment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse mx-auto">
              <Utensils className="text-white" size={32} />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"></div>
          </div>
          <p className="mt-6 text-purple-200 font-medium">Loading Meal Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-pink-50'}`}>
      {/* Top Navigation Bar */}
      <nav className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-lg border-purple-100'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Utensils className="text-white" size={20} />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Meal Management
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Office Meal System</p>
                </div>
              </div>
            </div>

            {/* Center - Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: <BarChart size={18} /> },
                { id: "myMeal", label: "My Meal", icon: <User size={18} />, show: isEmployee && isEligible },
                ...(isAdmin || isModerator ? [
                  { id: "requests", label: "All Requests", icon: <Users size={18} /> },
                  { id: "reports", label: "Reports", icon: <FileText size={18} /> }
                ] : []),
                { id: "history", label: "History", icon: <History size={18} />, show: isEmployee && isEligible }
              ].filter(tab => tab.show !== false).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? darkMode 
                        ? 'bg-purple-900 text-white shadow-lg shadow-purple-900/30' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === "myMeal" && myMealStatus?.hasActiveMeal && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Refresh button */}
              <button
                onClick={() => {
                  if (activeTab === "dashboard") {
                    fetchMyMealStatus();
                    fetchDashboardStats();
                  } else if (activeTab === "requests") fetchAllMealRequests();
                  else if (activeTab === "reports") fetchMonthlyReport();
                  else if (activeTab === "myMeal") {
                    fetchMyMealStatus();
                    fetchMyMealRequests();
                  }
                }}
                className="p-2 rounded-xl bg-purple-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoadingData}
              >
                <RefreshCw className={`text-purple-600 dark:text-purple-400 ${isLoadingData ? 'animate-spin' : ''}`} size={20} />
              </button>

              {/* User profile */}
              <div className="relative group">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.firstName?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-50"></div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role} • {user?.department || "No Dept"}
                    </p>
                  </div>
                </div>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-purple-50 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user?.firstName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          isAdmin 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : isModerator
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <Home size={18} />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {activeTab === "dashboard" && "Meal Dashboard"}
                {activeTab === "myMeal" && "My Meal Status"}
                {activeTab === "requests" && "Meal Requests Management"}
                {activeTab === "reports" && "Meal Reports & Analytics"}
                {activeTab === "history" && "My Meal History"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {activeTab === "dashboard" && "Overview of your meal requests and subscriptions"}
                {activeTab === "myMeal" && "Manage your meal requests and subscriptions"}
                {activeTab === "requests" && "Approve, reject, or manage meal requests"}
                {activeTab === "reports" && "View detailed meal statistics and reports"}
                {activeTab === "history" && "Your meal request history"}
              </p>
            </div>
            
            {activeTab !== "myMeal" && activeTab !== "history" && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Month:</span>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium">
                  {getMonthName(selectedMonth)}
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Total Requests</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalRequests || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Users size={24} />
                  </div>
                </div>
                <div className="text-sm opacity-90">All meal requests</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Approved</p>
                    <p className="text-3xl font-bold mt-2">{stats.approved || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <div className="text-sm opacity-90">Approved meal requests</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-yellow-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Pending</p>
                    <p className="text-3xl font-bold mt-2">{stats.requested || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Clock size={24} />
                  </div>
                </div>
                <div className="text-sm opacity-90">Awaiting approval</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Subscribers</p>
                    <p className="text-3xl font-bold mt-2">{stats.monthlySubscribers || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Package size={24} />
                  </div>
                </div>
                <div className="text-sm opacity-90">Monthly subscriptions</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Info */}
          <div className="lg:col-span-1">
            {/* Eligibility Card */}
            <div className={`rounded-2xl p-6 mb-6 ${
              isEligible 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isEligible ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {isEligible ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {isEligible ? 'Meal Benefits Active' : 'Not Eligible'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEligible 
                      ? `You are eligible for office meal benefits (${user?.role} - ${user?.workLocationType})`
                      : `Only onsite employees/admins/moderators can request meals. Your status: ${user?.role} - ${user?.workLocationType}`
                    }
                  </p>
                </div>
              </div>
              
              {isEligible && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-500 text-center mt-2">
                    * Onsite meal benefits are available for all onsite users
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="text-purple-600" size={20} />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {isEligible && (
                  <>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border border-purple-200 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <Plus className="text-white" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Request Meal</p>
                          <p className="text-sm text-gray-600">One-time meal request</p>
                        </div>
                      </div>
                      <ChevronRight className="text-purple-400" />
                    </button>

                    {(!myMealStatus || myMealStatus.subscription === 'none' || myMealStatus.subscription === 'cancelled') && (
                      <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl border border-blue-200 transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Package className="text-white" size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">Monthly Subscription</p>
                            <p className="text-sm text-gray-600">Auto-renew meal service</p>
                          </div>
                        </div>
                        <ChevronRight className="text-blue-400" />
                      </button>
                    )}
                  </>
                )}

                {(isAdmin || isModerator) && (
                  <>
                    <button
                      onClick={() => setShowAdminCreateModal(true)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-xl border border-emerald-200 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                          <Plus className="text-white" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Create Subscription</p>
                          <p className="text-sm text-gray-600">Create for any user</p>
                        </div>
                      </div>
                      <ExternalLink className="text-emerald-400" />
                    </button>

                    <button
                      onClick={handleExportPayrollData}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl border border-orange-200 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
                          <Download className="text-white" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Export Payroll Data</p>
                          <p className="text-sm text-gray-600">Export for payroll system</p>
                        </div>
                      </div>
                      <ExternalLink className="text-orange-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Meal Preference Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Coffee className="text-purple-600" size={20} />
                Meal Options
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="text-purple-600" size={18} />
                    <span className="font-medium">Office Meal</span>
                  </div>
                  <p className="text-sm text-gray-600">Prepared by office kitchen</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Pizza className="text-orange-600" size={18} />
                    <span className="font-medium">Outside Food</span>
                  </div>
                  <p className="text-sm text-gray-600">Ordered from partner restaurants</p>
                </div>

                <div className="text-xs text-gray-500 text-center mt-2">
                  Note: Meal requests must be approved by admin
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome back, {user?.firstName}!
                      </h2>
                      <p className="opacity-90">
                        {isEligible
                          ? "Manage your meal requests and subscriptions here"
                          : "View meal reports and manage requests"}
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="opacity-80" />
                          <span>{getMonthName(selectedMonth)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="opacity-80" />
                          <span>{user?.department || "No Department"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Utensils size={40} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Meal Status */}
                {isEligible && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-purple-600" size={20} />
                        My Meal Status
                      </h3>
                      {myMealStatus && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          myMealStatus.displayStatus === 'active' || myMealStatus.displayStatus === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : myMealStatus.displayStatus === 'pending' || myMealStatus.displayStatus === 'requested'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {myMealStatus.displayStatus?.toUpperCase() || 'NONE'}
                        </span>
                      )}
                    </div>

                    {isLoadingData ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600">Loading meal status...</p>
                      </div>
                    ) : myMealStatus ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Preference</p>
                              <div className="flex items-center gap-2">
                                {myMealStatus.displayPreference === 'office' ? (
                                  <Coffee className="text-purple-600" size={20} />
                                ) : (
                                  <Pizza className="text-orange-600" size={20} />
                                )}
                                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                  {myMealStatus.displayPreference || 'Not Selected'}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subscription Status</p>
                              <div className="flex items-center gap-2">
                                <Package className="text-blue-600" size={20} />
                                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                  {myMealStatus.subscription || 'None'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Auto Renew</p>
                              <div className="flex items-center gap-2">
                                {myMealStatus.autoRenew ? (
                                  <CheckCircle className="text-green-600" size={20} />
                                ) : (
                                  <XCircle className="text-red-600" size={20} />
                                )}
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {myMealStatus.autoRenew ? 'Enabled' : 'Disabled'}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Month</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="text-amber-600" size={20} />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {getMonthName(myMealStatus.currentMonth)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex gap-3">
                            <button
                              onClick={() => setActiveTab("myMeal")}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                            >
                              View Details
                            </button>
                            {myMealStatus.subscription === 'active' && (
                              <button
                                onClick={() => handleUpdateAutoRenew(!myMealStatus.autoRenew)}
                                className="px-4 py-3 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
                              >
                                {myMealStatus.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No meal status available</p>
                        <button
                          onClick={() => setShowRequestModal(true)}
                          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Request Meal
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Requests (for admin) */}
                {(isAdmin || isModerator) && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-purple-50 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Clock className="text-purple-600" size={20} />
                          Recent Meal Requests
                        </h3>
                        <button
                          onClick={() => setActiveTab("requests")}
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          View all
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {isLoadingData ? (
                        <div className="p-8 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          <p className="mt-2 text-gray-600">Loading requests...</p>
                        </div>
                      ) : allRequests.length > 0 ? (
                        allRequests.slice(0, 5).map((request, index) => (
                          <div key={index} className="p-4 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                  <span className="font-bold text-purple-600">
                                    {request.userInfo?.firstName?.charAt(0) || request.name?.charAt(0) || "U"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {request.userInfo?.firstName} {request.userInfo?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{request.userInfo?.department}</p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  request.status === 'active' || request.status === 'approved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : request.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {request.status?.toUpperCase()}
                                </span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {request.preference}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-gray-600">No meal requests found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* My Meal Tab */}
            {activeTab === "myMeal" && isEligible && (
              <div className="space-y-6">
                {/* Current Status Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-2">Your Current Meal Status</h3>
                        <p className="opacity-90">For {getMonthName(selectedMonth)}</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        {myMealStatus?.displayPreference === 'office' ? (
                          <Coffee className="text-white" size={24} />
                        ) : (
                          <Pizza className="text-white" size={24} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {isLoadingData ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600">Loading meal status...</p>
                      </div>
                    ) : myMealStatus ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</div>
                            <div className={`text-lg font-bold ${
                              myMealStatus.displayStatus === 'active' || myMealStatus.displayStatus === 'approved'
                                ? 'text-green-600'
                                : myMealStatus.displayStatus === 'pending' || myMealStatus.displayStatus === 'requested'
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                            }`}>
                              {myMealStatus.displayStatus?.toUpperCase() || 'NONE'}
                            </div>
                          </div>

                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preference</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                              {myMealStatus.displayPreference || 'NONE'}
                            </div>
                          </div>

                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Subscription</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                              {myMealStatus.subscription || 'NONE'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Calendar className="text-gray-400" size={20} />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Current Month</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {myMealStatus.currentMonth ? getMonthName(myMealStatus.currentMonth) : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <select
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(e.target.value)}
                              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              {getAvailableMonths().map(month => (
                                <option key={month} value={month}>
                                  {getMonthName(month)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {myMealStatus.subscription === 'active' && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                              <div className="flex items-center gap-3">
                                {myMealStatus.autoRenew ? (
                                  <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                  <XCircle className="text-red-500" size={20} />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">Auto Renew</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {myMealStatus.autoRenew ? 'Enabled' : 'Disabled'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUpdateAutoRenew(!myMealStatus.autoRenew)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                              >
                                {myMealStatus.autoRenew ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          )}

                          {myMealStatus.subscription === 'active' && (
                            <button
                              onClick={handleCancelSubscription}
                              className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors"
                            >
                              Cancel Subscription
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No meal status available</p>
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => setShowRequestModal(true)}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Request Meal
                          </button>
                          <button
                            onClick={() => setShowSubscriptionModal(true)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Setup Subscription
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* My Requests List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <History className="text-purple-600" size={20} />
                      My Meal Requests
                    </h3>
                    <div className="flex items-center gap-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="requested">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {isLoadingData ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="mt-2 text-gray-600">Loading requests...</p>
                    </div>
                  ) : myRequests.length > 0 ? (
                    <div className="space-y-3">
                      {myRequests.map((request, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              request.status === 'approved'
                                ? 'bg-green-100 text-green-600'
                                : request.status === 'requested'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {request.status === 'approved' ? (
                                <CheckCircle size={20} />
                              ) : request.status === 'requested' ? (
                                <Clock size={20} />
                              ) : (
                                <XCircle size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatDate(request.date)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {request.preference} • {request.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'requested' && (
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="text-red-500" size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">No meal requests found</p>
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Make Your First Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requests Tab (Admin/Moderator) */}
            {(activeTab === "requests" && (isAdmin || isModerator)) && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search by Employee ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 rounded-xl border border-purple-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-purple-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>

                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-purple-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Types</option>
                        <option value="single">Single Requests</option>
                        <option value="monthly">Monthly Subscriptions</option>
                      </select>

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-purple-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowAdminCreateModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Create Subscription
                    </button>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRequests}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.requested}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                  </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-purple-50 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Meal Subscriptions ({allRequests.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isLoadingData ? (
                    <div className="p-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading meal subscriptions...</p>
                    </div>
                  ) : allRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-purple-50 dark:bg-gray-700">
                          <tr>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Employee</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Preference</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Auto Renew</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {allRequests.map((subscription, index) => (
                            <tr key={index} className="hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-purple-600">
                                      {subscription.userInfo?.firstName?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {subscription.userInfo?.firstName} {subscription.userInfo?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{subscription.userInfo?.employeeId}</p>
                                    <p className="text-xs text-gray-500">{subscription.userInfo?.department}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                  Monthly Subscription
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {subscription.preference === 'office' ? (
                                    <Coffee className="text-purple-600" size={16} />
                                  ) : (
                                    <Pizza className="text-orange-600" size={16} />
                                  )}
                                  <span className="capitalize">{subscription.preference}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  subscription.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : subscription.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : subscription.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {subscription.status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {subscription.autoRenew ? (
                                    <CheckCircle className="text-green-500" size={16} />
                                  ) : (
                                    <XCircle className="text-red-500" size={16} />
                                  )}
                                  <span className="text-sm">{subscription.autoRenew ? 'Yes' : 'No'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(subscription.startDate)}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {subscription.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedRequest(subscription);
                                          setShowApproveModal(true);
                                        }}
                                        className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs transition-colors"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedRequest(subscription);
                                          setShowRejectModal(true);
                                        }}
                                        className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(subscription);
                                      setUpdateForm({
                                        status: subscription.status,
                                        preference: subscription.preference,
                                        note: subscription.note || '',
                                        mealDays: 0
                                      });
                                      setShowUpdateModal(true);
                                    }}
                                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="text-blue-500" size={14} />
                                  </button>
                                  {(subscription.status === 'active' || subscription.status === 'pending') && (
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(subscription);
                                        setShowDeleteModal(true);
                                      }}
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="text-red-500" size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">No meal subscriptions found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Change filters or create a new subscription
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports Tab (Admin/Moderator) */}
            {(activeTab === "reports" && (isAdmin || isModerator)) && (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Monthly Meal Report</h2>
                      <p className="opacity-90">Detailed analysis of meal subscriptions</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white focus:outline-none"
                      >
                        {getAvailableMonths().map(month => (
                          <option key={month} value={month}>
                            {getMonthName(month)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleExportPayrollData}
                        className="px-6 py-2 bg-white text-purple-600 rounded-xl hover:bg-purple-50 font-medium transition-colors flex items-center gap-2"
                      >
                        <Download size={18} />
                        Export
                      </button>
                    </div>
                  </div>

                  {isLoadingData ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <p className="mt-2 opacity-90">Loading report data...</p>
                    </div>
                  ) : monthlyReport ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="text-sm opacity-90 mb-1">Total Employees</p>
                        <p className="text-2xl font-bold">{monthlyReport?.stats?.totalEmployees || 0}</p>
                      </div>
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="text-sm opacity-90 mb-1">Active Subscriptions</p>
                        <p className="text-2xl font-bold">{monthlyReport?.stats?.activeSubscriptions || 0}</p>
                      </div>
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="text-sm opacity-90 mb-1">Office Meals</p>
                        <p className="text-2xl font-bold">{monthlyReport?.stats?.officePreference || 0}</p>
                      </div>
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="text-sm opacity-90 mb-1">Outside Food</p>
                        <p className="text-2xl font-bold">{monthlyReport?.stats?.outsidePreference || 0}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="opacity-90">No report data available</p>
                    </div>
                  )}
                </div>

                {/* Report Details */}
                {monthlyReport && monthlyReport.data && monthlyReport.data.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-purple-50 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Report</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-purple-50 dark:bg-gray-700">
                          <tr>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Employee</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Department</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Preference</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Meal Days</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {monthlyReport.data.map((item, index) => (
                            <tr key={index} className="hover:bg-purple-50 dark:hover:bg-gray-700">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-purple-600 text-sm">
                                      {item.name?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.employeeId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                                  {item.department}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : item.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {item.status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {item.preference === 'office' ? (
                                    <Coffee className="text-purple-600" size={14} />
                                  ) : (
                                    <Pizza className="text-orange-600" size={14} />
                                  )}
                                  <span className="capitalize">{item.preference}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {item.mealDays || 0}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && isEligible && (
              <div className="space-y-6">
                {/* History Header */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Meal History</h2>
                      <p className="opacity-90">Track your meal requests over time</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <History size={32} />
                    </div>
                  </div>
                </div>

                {/* History Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                  {isLoadingData ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading meal history...</p>
                    </div>
                  ) : myRequests.length > 0 ? (
                    <div className="space-y-6">
                      {myRequests.map((request, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}></div>
                            {index < myRequests.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 pb-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                  {formatDate(request.date)}
                                </h4>
                                <span className={`px-3 py-1 text-xs rounded-full ${
                                  request.status === 'approved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : request.status === 'requested'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                  {request.status?.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Meal Type</p>
                                  <p className="font-bold text-gray-900 dark:text-white capitalize">
                                    {request.mealType || 'Lunch'}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Preference</p>
                                  <p className="font-bold text-gray-900 dark:text-white capitalize">
                                    {request.preference || 'N/A'}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Cost</p>
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {request.cost ? `৳${request.cost}` : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              {request.note && (
                                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Note:</p>
                                  <p className="text-sm text-gray-900 dark:text-white">{request.note}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">No meal history available</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Your meal history will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Request Meal Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Meal Request</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meal Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRequestForm({...requestForm, mealPreference: 'office'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        requestForm.mealPreference === 'office'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Coffee className={`mb-2 ${
                          requestForm.mealPreference === 'office' ? 'text-purple-600' : 'text-gray-400'
                        }`} size={24} />
                        <span className="font-medium">Office Meal</span>
                        <span className="text-sm text-gray-500 mt-1">Office kitchen</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setRequestForm({...requestForm, mealPreference: 'outside'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        requestForm.mealPreference === 'outside'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Pizza className={`mb-2 ${
                          requestForm.mealPreference === 'outside' ? 'text-purple-600' : 'text-gray-400'
                        }`} size={24} />
                        <span className="font-medium">Outside Food</span>
                        <span className="text-sm text-gray-500 mt-1">Partner restaurants</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Daily meal requests are for current date only</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Note (Optional)
                  </label>
                  <textarea
                    value={requestForm.note}
                    onChange={(e) => setRequestForm({...requestForm, note: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitMealRequest}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Subscription</h3>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Select Meal Preference</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSubscriptionForm({...subscriptionForm, mealPreference: 'office'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        subscriptionForm.mealPreference === 'office'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Coffee className={`mb-2 ${
                          subscriptionForm.mealPreference === 'office' ? 'text-purple-600' : 'text-gray-400'
                        }`} size={24} />
                        <span className="font-medium">Office Meal</span>
                        <span className="text-sm text-gray-500 mt-1">Office kitchen</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setSubscriptionForm({...subscriptionForm, mealPreference: 'outside'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        subscriptionForm.mealPreference === 'outside'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Pizza className={`mb-2 ${
                          subscriptionForm.mealPreference === 'outside' ? 'text-purple-600' : 'text-gray-400'
                        }`} size={24} />
                        <span className="font-medium">Outside Food</span>
                        <span className="text-sm text-gray-500 mt-1">Partner restaurants</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto Renew</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically renew subscription</p>
                    </div>
                    <button
                      onClick={() => setSubscriptionForm({...subscriptionForm, autoRenew: !subscriptionForm.autoRenew})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        subscriptionForm.autoRenew ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        subscriptionForm.autoRenew ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetupSubscription}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                  >
                    Activate Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create Subscription Modal */}
      {showAdminCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Meal Subscription</h3>
                <button
                  onClick={() => setShowAdminCreateModal(false)}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={adminCreateForm.employeeId}
                    onChange={(e) => setAdminCreateForm({...adminCreateForm, employeeId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter employee ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meal Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAdminCreateForm({...adminCreateForm, mealPreference: 'office'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        adminCreateForm.mealPreference === 'office'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Coffee className={`mb-2 ${
                          adminCreateForm.mealPreference === 'office' ? 'text-purple-600' : 'text-gray-400'
                        }`} size={24} />
                        <span className="font-medium">Office Meal</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setAdminCreateForm({...adminCreateForm, mealPreference: 'outside'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        adminCreateForm.mealPreference === 'outside'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Pizza className={`mb-2 ${
                          adminCreateForm.mealPreference === 'outside' ? 'text-purple-600' : 'text-gray-400'
                        }`} size={24} />
                        <span className="font-medium">Outside Food</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Status
                  </label>
                  <select
                    value={adminCreateForm.status}
                    onChange={(e) => setAdminCreateForm({...adminCreateForm, status: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={adminCreateForm.note}
                    onChange={(e) => setAdminCreateForm({...adminCreateForm, note: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Add a note..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAdminCreateModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminCreateMeal}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                >
                  Create Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Approve Subscription</h3>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Approve subscription for {selectedRequest.userInfo?.firstName}?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This will approve their {selectedRequest.preference} meal subscription
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateRequestStatus('approve')}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                >
                  Yes, Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Subscription</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="text-red-600" size={32} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Reject subscription for {selectedRequest.userInfo?.firstName}?
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This will reject their {selectedRequest.preference} meal subscription
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateRequestStatus('reject')}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all font-medium"
                >
                  Yes, Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isAdmin || isModerator ? 'Delete Subscription' : 'Cancel Request'}
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="text-red-600" size={32} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isAdmin || isModerator 
                    ? `Delete subscription for ${selectedRequest.userInfo?.firstName}?`
                    : 'Cancel your meal request?'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {isAdmin || isModerator
                    ? `This will permanently delete the meal subscription`
                    : `This will cancel your ${selectedRequest.preference} meal request`}
                </p>
                {(selectedRequest.status === 'active' || selectedRequest.status === 'approved') && (
                  <p className="text-sm text-red-600 mt-2">
                    Warning: This is currently active!
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={isAdmin || isModerator ? handleAdminDeleteMealRequest : handleDeleteMyMealRequest}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all font-medium"
                >
                  {isAdmin || isModerator ? 'Yes, Delete' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`mt-12 border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-purple-100 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Utensils className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Meal Management System
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Office Meal Service</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Version 1.0.0
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}