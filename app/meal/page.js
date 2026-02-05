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
  Filter,
  DollarSign,
  CreditCard,
  Mail,
  Phone,
  Lock,
  Shield,
  Activity,
  Save,
  MapPin,
  Briefcase,
  EyeOff,
  Smartphone,
  Key,
  Upload,
  Camera,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  AlertTriangle
} from "lucide-react";
import { toast } from "react-hot-toast";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/meals';

export default function page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // User state
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
const [editForm, setEditForm] = useState({
  preference: "",
  autoRenew: false,
  note: ""
});
  // Tabs
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Meal data states
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [allMeals, setAllMeals] = useState([]); // New state for all meals
  const [myMeals, setMyMeals] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // For admin to select users
  
  // Stats - Employee specific
  const [employeeStats, setEmployeeStats] = useState({
    totalMeals: 0,
    approvedMeals: 0,
    pendingMeals: 0,
    cancelledMeals: 0
  });
  
  // Stats - Admin specific
  const [adminStats, setAdminStats] = useState({
    totalSubscriptions: 0,
    pendingApprovals: 0,
    todayMeals: 0,
    monthlyMeals: 0,
    totalEmployees: 0,
    activeSubscriptions: 0
  });
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [departments, setDepartments] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdminCreateModal, setShowAdminCreateModal] = useState(false);
  const [showAdminCreateMealModal, setShowAdminCreateMealModal] = useState(false); // New modal
  
  // Selected items
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  
  // Forms
  const [requestForm, setRequestForm] = useState({
    mealPreference: "office",
    note: "",
    date: new Date().toISOString().split('T')[0]
  });
  
  const [subscriptionForm, setSubscriptionForm] = useState({
    mealPreference: "office",
    autoRenew: true
  });
  
  const [adminCreateForm, setAdminCreateForm] = useState({
    userId: "",
    preference: "office",
    autoRenew: true,
    note: ""
  });
  
  const [adminCreateMealForm, setAdminCreateMealForm] = useState({ // New form
    userId: "",
    date: new Date().toISOString().split('T')[0],
    mealPreference: "office",
    note: ""
  });
  
  const [updateForm, setUpdateForm] = useState({
    status: "",
    preference: "",
    note: "",
    mealDays: 0
  });
  // Handle approve/reject meal 
// Handle approve/reject meal 
const handleApproveRejectMeal = async (mealId, action) => {
  try {
    setUpdating(true);
    
    const endpoint = action === 'approved' ? '/admin/meal/approve' : '/admin/meal/reject';
    
    const data = await apiCall(endpoint, 'PUT', {
      mealId,
      note: `${action} by ${user?.firstName} ${user?.lastName}`
    });
    
    if (data) {
      toast.success(`Meal ${action} successfully!`);
      fetchAllMeals();
      fetchDashboardStats();
    }
  } catch (error) {
    console.error(`Error ${action}ing meal:`, error);
    toast.error(error.message || `Failed to ${action} meal`);
  } finally {
    setUpdating(false);
  }
};

// Handle update subscription
const handleUpdateSubscription = async () => {
  try {
    if (!selectedSubscription) return;
    
    const data = await apiCall(`/admin/subscription/update/${selectedSubscription._id}`, 'PUT', {
      preference: editForm.preference || selectedSubscription.preference,
      autoRenew: editForm.autoRenew !== undefined ? editForm.autoRenew : selectedSubscription.autoRenew,
      note: editForm.note || ''
    });
    
    if (data) {
      toast.success("Subscription updated successfully!");
      setShowEditModal(false);
      setEditForm({
        preference: "",
        autoRenew: false,
        note: ""
      });
      fetchAllSubscriptions();
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
    toast.error(error.message || "Failed to update subscription");
  }
};

// Add to the edit button click handler
const handleEditClick = (subscription) => {
  setSelectedSubscription(subscription);
  setEditForm({
    preference: subscription.preference || "",
    autoRenew: subscription.autoRenew || false,
    note: ""
  });
  setShowEditModal(true);
};
  // UI states
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [updating, setUpdating] = useState(false);
  
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

  function getMonthName(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function getAvailableMonths() {
    const months = [];
    const current = new Date();
    
    for (let i = -3; i < 3; i++) {
      const date = new Date(current.getFullYear(), current.getMonth() + i, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(month);
    }
    
    return months;
  }

  // Get current token
  const getCurrentToken = () => {
    if (typeof window === 'undefined') return null;
    if (localStorage.getItem("adminToken")) return localStorage.getItem("adminToken");
    if (localStorage.getItem("employeeToken")) return localStorage.getItem("employeeToken");
    if (localStorage.getItem("moderatorToken")) return localStorage.getItem("moderatorToken");
    return null;
  };

  // API call helper
  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const token = getCurrentToken();
    if (!token) {
      toast.error("Authentication required");
      router.push('/');
      return null;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const config = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = getCurrentToken();
      
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/getProfile`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        router.push("/");
        return;
      }

      const data = await response.json();
      
      if (data.user || (data && typeof data === 'object' && data._id)) {
        const userData = data.user || data;
        
        setUser(userData);
        setIsAdmin(userData.role === "admin" || userData.role === "superAdmin");
        setIsEmployee(userData.role === "employee");
        setIsModerator(userData.role === "moderator");
        
        const eligible = (userData.role === 'employee' || 
                         userData.role === 'admin' || 
                         userData.role === 'moderator') && 
                         userData.workLocationType === 'onsite';
        setIsEligible(eligible);
      } else {
        toast.error("Failed to load user data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users for admin (for dropdown)
  const fetchAllUsers = async () => {
    if (!isAdmin && !isModerator) return;
    
    try {
      const token = getCurrentToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getAll-user`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          setAllUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch all subscriptions (admin/moderator)
  const fetchAllSubscriptions = async () => {
    if (!isAdmin && !isModerator) return;
    
    try {
      setIsLoadingData(true);
      
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      if (selectedMonth) params.append('month', selectedMonth);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      const data = await apiCall(`/admin/subscriptions/all?${params.toString()}`);
      
      if (data) {
        setAllSubscriptions(data.subscriptions || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalItems(data.pagination?.total || 0);
        
        // Update admin stats
        setAdminStats(prev => ({
          ...prev,
          totalSubscriptions: data.pagination?.total || 0,
          activeSubscriptions: data.subscriptions?.filter(s => s.status === 'active').length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch all meals (admin/moderator)
  const fetchAllMeals = async () => {
    if (!isAdmin && !isModerator) return;
    
    try {
      setIsLoadingData(true);
      
      // You'll need to create this endpoint in backend
      const params = new URLSearchParams();
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
      }
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      
      // This is a temporary implementation - you need to create this endpoint
      const data = await apiCall(`/admin/meals/all?${params.toString()}`);
      
      if (data) {
        setAllMeals(data.meals || []);
        
        // Update admin stats for meals
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = data.meals?.filter(meal => 
          meal.date && meal.date.split('T')[0] === today
        ).length || 0;
        
        setAdminStats(prev => ({
          ...prev,
          todayMeals,
          monthlyMeals: data.meals?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching all meals:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch my subscription
  const fetchMySubscription = async () => {
    if (!isEmployee && !isEligible) return;
    
    try {
      const data = await apiCall('/subscription/my-details');
      if (data) {
        setMySubscription(data);
      }
    } catch (error) {
      console.error('Error fetching my subscription:', error);
    }
  };

  // Fetch my meals and calculate stats
  const fetchMyMeals = async () => {
    if (!isEmployee && !isEligible) return;
    
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (selectedMonth) params.append('month', selectedMonth);
      params.append('page', 1);
      params.append('limit', 100); // Get more for stats calculation
      
      const data = await apiCall(`/daily/my-meals?${params.toString()}`);
      if (data) {
        const meals = data.data || [];
        setMyMeals(meals);
        
        // Calculate employee stats
        const totalMeals = meals.length;
        const approvedMeals = meals.filter(meal => meal.status === 'approved').length;
        const pendingMeals = meals.filter(meal => meal.status === 'pending').length;
        const cancelledMeals = meals.filter(meal => meal.status === 'cancelled').length;
        
        setEmployeeStats({
          totalMeals,
          approvedMeals,
          pendingMeals,
          cancelledMeals
        });
      }
    } catch (error) {
      console.error('Error fetching my meals:', error);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const data = await apiCall('/dashboard/stats');
      if (data) {
        if (isAdmin || isModerator) {
          setAdminStats(prev => ({
            ...prev,
            ...data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const data = await apiCall('/departments');
      if (data) {
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch monthly report
  const fetchMonthlyReport = async () => {
    if (!isAdmin && !isModerator) return;
    
    try {
      setIsLoadingData(true);
      
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      
      const data = await apiCall(`/admin/monthly-report?${params.toString()}`);
      if (data) {
        setMonthlyReport(data);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle meal request submission  
const handleSubmitMealRequest = async () => {
  try {
    // Check subscription status
    if (mySubscription?.hasSubscription && mySubscription.data?.status === 'active') {
      // Check auto-renew status
      if (mySubscription.data?.autoRenew) {
        toast.error("You have auto-renew subscription. Please wait for automatic approval or cancel subscription first.");
        return;
      }
      
      // Check if this month is already approved
      const currentMonth = getCurrentMonth();
      if (mySubscription.data?.currentMonth === currentMonth && 
          mySubscription.data?.currentStatus === 'approved') {
        toast.error("You already have an approved subscription for this month.");
        return;
      }
    }
    
    const data = await apiCall('/daily/request', 'POST', {
      mealPreference: requestForm.mealPreference,
      date: requestForm.date,
      note: requestForm.note
    });
    
    if (data) {
      toast.success("Meal request submitted successfully!");
      setShowRequestModal(false);
      setRequestForm({
        mealPreference: "office",
        note: "",
        date: new Date().toISOString().split('T')[0]
      });
      fetchMyMeals();
      if (isAdmin || isModerator) fetchAllMeals();
    }
  } catch (error) {
    console.error("Error submitting request:", error);
    toast.error(error.message || "Failed to submit meal request");
  }
};

  // Handle subscription setup
// Handle subscription setup
const handleSetupSubscription = async () => {
  try {
    // Check if user had a cancelled subscription before
    if (mySubscription?.hasSubscription && mySubscription.data?.status === 'cancelled') {
      toast.info("Your previous subscription was cancelled. New subscription requires admin approval.");
      
      // Force auto-renew to false
      subscriptionForm.autoRenew = false;
    }
    
    const data = await apiCall('/subscription/setup', 'POST', {
      preference: subscriptionForm.mealPreference,
      autoRenew: subscriptionForm.autoRenew,
      note: mySubscription?.data?.status === 'cancelled' ? 
        "New subscription after cancellation - Requires admin approval" : 
        "New subscription"
    });
    
    if (data) {
      if (mySubscription?.data?.status === 'cancelled') {
        toast.success("Subscription requested! Waiting for admin approval.");
      } else {
        toast.success("Monthly subscription activated!");
      }
      
      setShowSubscriptionModal(false);
      setSubscriptionForm({ mealPreference: "office", autoRenew: true });
      fetchMySubscription();
      if (isAdmin || isModerator) fetchAllSubscriptions();
    }
  } catch (error) {
    console.error("Error setting up subscription:", error);
    toast.error(error.message || "Failed to setup subscription");
  }
};

  // Handle cancel subscription
// Handle cancel subscription - Updated
const handleCancelSubscription = async () => {
  if (!window.confirm("Are you sure you want to cancel your subscription? It will be immediately removed.")) return;
  
  try {
    const data = await apiCall('/subscription/cancel', 'POST', {
      reason: "Cancelled by user"
    });
    
    if (data) {
      toast.success("Subscription cancelled and removed from list!");
      
      // Immediate removal from ALL states
      
      // For employee view
      setMySubscription(null);
      
      // For admin/moderator view
      if (isAdmin || isModerator) {
        setAllSubscriptions(prev => 
          prev.filter(sub => sub.userInfo?._id !== user?._id)
        );
        
        setAdminStats(prev => ({
          ...prev,
          activeSubscriptions: prev.activeSubscriptions - 1,
          totalSubscriptions: prev.totalSubscriptions - 1
        }));
      }
      
      // Show message for next subscription
      toast.info("For new subscription, you need to request again with admin approval.");
    }
  } catch (error) {
    console.error("Error cancelling subscription:", error);
  }
};

  // Handle update auto-renew
  const handleUpdateAutoRenew = async (autoRenew) => {
    try {
      const data = await apiCall('/subscription/update-auto-renew', 'PUT', {
        autoRenew: autoRenew
      });
      
      if (data) {
        toast.success(`Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`);
        fetchMySubscription();
      }
    } catch (error) {
      console.error("Error updating auto-renew:", error);
    }
  };

  // Handle admin create subscription
 // Admin create subscription - force pending for cancelled users
const handleAdminCreateSubscription = async () => {
  if (!adminCreateForm.userId) {
    toast.error("Please select an employee");
    return;
  }
  
  try {
    // Check if user had cancelled subscription
    const selectedUser = allUsers.find(u => u._id === adminCreateForm.userId);
    const userSubscriptions = allSubscriptions.filter(s => 
      s.userInfo?._id === adminCreateForm.userId
    );
    
    const hadCancelled = userSubscriptions.some(sub => sub.status === 'cancelled');
    
    const data = await apiCall('/admin/subscription/create', 'POST', {
      userId: adminCreateForm.userId,
      preference: adminCreateForm.preference,
      autoRenew: hadCancelled ? false : adminCreateForm.autoRenew, // Force false if cancelled
      note: hadCancelled ? 
        `New subscription after cancellation - ${adminCreateForm.note || ''}` : 
        adminCreateForm.note,
      forcePending: hadCancelled // Send flag to backend
    });
    
    if (data) {
      if (hadCancelled) {
        toast.success("Subscription created! Requires approval.");
      } else {
        toast.success("Meal subscription created successfully!");
      }
      setShowAdminCreateModal(false);
      setAdminCreateForm({
        userId: "",
        preference: "office",
        autoRenew: true,
        note: ""
      });
      fetchAllSubscriptions();
      fetchDashboardStats();
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
  }
};

  // Handle admin create meal (single meal)
  const handleAdminCreateMeal = async () => {
    if (!adminCreateMealForm.userId) {
      toast.error("Please select an employee");
      return;
    }
    
    try {
      // First, check if user exists
      const user = allUsers.find(u => u._id === adminCreateMealForm.userId);
      if (!user) {
        toast.error("Selected employee not found");
        return;
      }
      
      // Use the same endpoint as daily request but as admin
      const data = await apiCall('/admin/create-meal', 'POST', {
        userId: adminCreateMealForm.userId,
        mealPreference: adminCreateMealForm.mealPreference,
        date: adminCreateMealForm.date,
        note: adminCreateMealForm.note
      });
      
      if (data) {
        toast.success("Meal created successfully!");
        setShowAdminCreateMealModal(false);
        setAdminCreateMealForm({
          userId: "",
          date: new Date().toISOString().split('T')[0],
          mealPreference: "office",
          note: ""
        });
        fetchAllMeals();
        fetchDashboardStats();
      }
    } catch (error) {
      console.error("Error creating meal:", error);
    }
  };

  // Handle approve/reject subscription
  const handleUpdateSubscriptionStatus = async (action) => {
    try {
      const data = await apiCall('/admin/subscription/approve', 'PUT', {
        subscriptionId: selectedSubscription?._id,
        month: selectedMonth,
        action: action,
        note: updateForm.note || ''
      });
      
      if (data) {
        toast.success(`Subscription ${action}ed successfully!`);
        setShowApproveModal(false);
        setShowRejectModal(false);
        setSelectedSubscription(null);
        fetchAllSubscriptions();
        fetchDashboardStats();
      }
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error);
    }
  };

  // Handle delete subscription
// Handle delete subscription - Admin side
const handleDeleteSubscription = async () => {
  if (!selectedSubscription) return;
  
  if (!window.confirm(`Are you sure you want to delete subscription for ${selectedSubscription.userInfo?.firstName} ${selectedSubscription.userInfo?.lastName}? It will be immediately removed.`)) return;
  
  try {
    const data = await apiCall(`/admin/subscription/${selectedSubscription._id}`, 'DELETE');
    
    if (data) {
      toast.success("Subscription deleted and removed from list!");
      setShowDeleteModal(false);
      
      // Immediate removal from UI
      setAllSubscriptions(prev => 
        prev.filter(sub => sub._id !== selectedSubscription._id)
      );
      
      // Update stats
      setAdminStats(prev => ({
        ...prev,
        totalSubscriptions: prev.totalSubscriptions - 1,
        activeSubscriptions: prev.activeSubscriptions - 
          (selectedSubscription.status === 'active' ? 1 : 0)
      }));
      
      setSelectedSubscription(null);
    }
  } catch (error) {
    console.error("Error deleting subscription:", error);
  }
};

  // Handle cancel meal request
  const handleCancelMealRequest = async () => {
    if (!selectedMeal) return;
    
    try {
      const data = await apiCall('/daily/cancel', 'POST', {
        mealId: selectedMeal._id,
        reason: "Cancelled by user"
      });
      
      if (data) {
        toast.success("Meal request cancelled successfully!");
        setShowDeleteModal(false);
        setSelectedMeal(null);
        fetchMyMeals();
        if (isAdmin || isModerator) fetchAllMeals();
      }
    } catch (error) {
      console.error("Error cancelling meal request:", error);
    }
  };
// Add Edit Modal UI after other modals
{/* Edit Subscription Modal */}
{showEditModal && selectedSubscription && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-purple-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Subscription</h3>
          <button
            onClick={() => setShowEditModal(false)}
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
                onClick={() => setEditForm({...editForm, preference: 'office'})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  editForm.preference === 'office'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <Coffee className={`mb-2 ${
                    editForm.preference === 'office' ? 'text-purple-600' : 'text-gray-400'
                  }`} size={24} />
                  <span className="font-medium">Office Meal</span>
                </div>
              </button>

              <button
                onClick={() => setEditForm({...editForm, preference: 'outside'})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  editForm.preference === 'outside'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <Pizza className={`mb-2 ${
                    editForm.preference === 'outside' ? 'text-purple-600' : 'text-gray-400'
                  }`} size={24} />
                  <span className="font-medium">Outside Food</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto Renew</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {editForm.autoRenew 
                    ? 'Automatically continues each month'
                    : 'Need monthly approval'
                  }
                </p>
              </div>
              <button
                onClick={() => setEditForm({...editForm, autoRenew: !editForm.autoRenew})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  editForm.autoRenew ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  editForm.autoRenew ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Update Note (Optional)
            </label>
            <textarea
              value={editForm.note}
              onChange={(e) => setEditForm({...editForm, note: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add update note..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowEditModal(false)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateSubscription}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
          >
            Update Subscription
          </button>
        </div>
      </div>
    </div>
  </div>
)}
  // Initialize
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchDepartments();
      
      if (isAdmin || isModerator) {
        fetchAllUsers();
        fetchAllSubscriptions();
        fetchAllMeals();
      }
      
      if (isEmployee && isEligible) {
        fetchMySubscription();
        fetchMyMeals();
      }
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin || isModerator) {
      fetchAllSubscriptions();
      fetchAllMeals();
    }
  }, [selectedMonth, selectedDepartment, filterStatus, currentPage, searchQuery]);

  useEffect(() => {
    if (activeTab === "reports" && (isAdmin || isModerator)) {
      fetchMonthlyReport();
    }
    
    if (activeTab === "allMeals" && (isAdmin || isModerator)) {
      fetchAllMeals();
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
            {/* Logo */}
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

            {/* Center Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: <BarChart size={18} /> },
                { id: "myMeal", label: "My Meal", icon: <User size={18} />, show: isEmployee && isEligible },
                ...(isAdmin || isModerator ? [
                  { id: "subscriptions", label: "Subscriptions", icon: <Package size={18} /> },
                  { id: "allMeals", label: "All Meals", icon: <Utensils size={18} /> },
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
                </button>
              ))}
            </div>

            {/* Right side actions */}
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
                  if (activeTab === "dashboard") fetchDashboardStats();
                  else if (activeTab === "subscriptions") fetchAllSubscriptions();
                  else if (activeTab === "allMeals") fetchAllMeals();
                  else if (activeTab === "reports") fetchMonthlyReport();
                  else if (activeTab === "myMeal") {
                    fetchMySubscription();
                    fetchMyMeals();
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
                      onClick={() => {
                        localStorage.clear();
                        router.push("/");
                      }}
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
                {activeTab === "myMeal" && "My Meal"}
                {activeTab === "subscriptions" && "Meal Subscriptions"}
                {activeTab === "allMeals" && "All Meal Requests"}
                {activeTab === "reports" && "Meal Reports"}
                {activeTab === "history" && "My Meal History"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {activeTab === "dashboard" && "Overview of meal requests and subscriptions"}
                {activeTab === "myMeal" && "Manage your meal requests and subscriptions"}
                {activeTab === "subscriptions" && "Manage all meal subscriptions"}
                {activeTab === "allMeals" && "View and manage all meal requests"}
                {activeTab === "reports" && "View detailed meal statistics and reports"}
                {activeTab === "history" && "Your meal request history"}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Month:</span>
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium">
                {getMonthName(selectedMonth)}
              </div>
            </div>
          </div>

          {/* Stats Cards for Dashboard */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isAdmin || isModerator ? (
                <>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">Total Subscriptions</p>
                        <p className="text-3xl font-bold mt-2">{adminStats.totalSubscriptions || 0}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Package size={24} />
                      </div>
                    </div>
                    <div className="text-sm opacity-90">Active meal subscriptions</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-yellow-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">Pending Approvals</p>
                        <p className="text-3xl font-bold mt-2">{adminStats.pendingApprovals || 0}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Clock size={24} />
                      </div>
                    </div>
                    <div className="text-sm opacity-90">Awaiting approval</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">Today's Meals</p>
                        <p className="text-3xl font-bold mt-2">{adminStats.todayMeals || 0}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Utensils size={24} />
                      </div>
                    </div>
                    <div className="text-sm opacity-90">Meals for today</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">Active Subscriptions</p>
                        <p className="text-3xl font-bold mt-2">{adminStats.activeSubscriptions || 0}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Users size={24} />
                      </div>
                    </div>
                    <div className="text-sm opacity-90">Currently active</div>
                  </div>
                </>
              ) : (
                // Employee stats
                <>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">Total Meals</p>
                        <p className="text-3xl font-bold mt-2">{employeeStats.totalMeals || 0}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Utensils size={24} />
                      </div>
                    </div>
                    <div className="text-sm opacity-90">All your meals</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">Approved</p>
                        <p className="text-3xl font-bold mt-2">{employeeStats.approvedMeals || 0}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <CheckCircle size={24} />
                      </div>
                    </div>
                    <div className="text-sm opacity-90">Approved meals</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-yellow-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">Pending</p>
                        <p className="text-3xl font-bold mt-2">{employeeStats.pendingMeals || 0}</p>
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
                        <p className="text-sm opacity-90">Subscription</p>
                        <p className="text-3xl font-bold mt-2">
                          {mySubscription?.hasSubscription ? (mySubscription.data?.status === 'active' ? 'Active' : 'Inactive') : 'None'}
                        </p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Package size={24} />
                      </div>
                    </div>
                    <div className="text-sm opacity-90">Your subscription status</div>
                  </div>
                </>
              )}
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

                    {(!mySubscription || !mySubscription.hasSubscription || mySubscription.data?.status === 'cancelled') && (
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
                          <p className="text-sm text-gray-600">Create for employee</p>
                        </div>
                      </div>
                      <ExternalLink className="text-emerald-400" />
                    </button>

                    <button
                      onClick={() => setShowAdminCreateMealModal(true)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl border border-orange-200 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
                          <Utensils className="text-white" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Create Meal</p>
                          <p className="text-sm text-gray-600">Single meal for employee</p>
                        </div>
                      </div>
                      <ExternalLink className="text-orange-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* My Subscription Status */}
            {isEligible && mySubscription && mySubscription.hasSubscription && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">My Subscription</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      mySubscription.data?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mySubscription.data?.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Preference:</span>
                    <span className="font-medium">{mySubscription.data?.preference}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auto Renew:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      mySubscription.data?.autoRenew 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mySubscription.data?.autoRenew ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Month:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      mySubscription.data?.currentStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : mySubscription.data?.currentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mySubscription.data?.currentStatus || 'None'}
                    </span>
                  </div>
                  {mySubscription.data?.status === 'active' && (
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full mt-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            )}

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

                {/* My Meal Status (for eligible users) */}
                {isEligible && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-purple-600" size={20} />
                        My Meal Status
                      </h3>
                      {mySubscription?.hasSubscription && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          mySubscription.data?.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {mySubscription.data?.status?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {isLoadingData ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600">Loading meal status...</p>
                      </div>
                    ) : mySubscription?.hasSubscription ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                              <p className="text-sm text-gray-600 mb-1">Current Preference</p>
                              <div className="flex items-center gap-2">
                                {mySubscription.data?.preference === 'office' ? (
                                  <Coffee className="text-purple-600" size={20} />
                                ) : (
                                  <Pizza className="text-orange-600" size={20} />
                                )}
                                <p className="text-lg font-bold text-gray-900 capitalize">
                                  {mySubscription.data?.preference}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                              <p className="text-sm text-gray-600 mb-1">Current Month Status</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="text-blue-600" size={20} />
                                <p className="text-lg font-bold text-gray-900 capitalize">
                                  {mySubscription.data?.currentStatus || 'none'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                              <p className="text-sm text-gray-600 mb-1">Auto Renew</p>
                              <div className="flex items-center gap-2">
                                {mySubscription.data?.autoRenew ? (
                                  <CheckCircle className="text-green-600" size={20} />
                                ) : (
                                  <XCircle className="text-red-600" size={20} />
                                )}
                                <p className="text-lg font-bold text-gray-900">
                                  {mySubscription.data?.autoRenew ? 'Enabled' : 'Disabled'}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                              <p className="text-sm text-gray-600 mb-1">Start Date</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="text-amber-600" size={20} />
                                <p className="text-lg font-bold text-gray-900">
                                  {formatDate(mySubscription.data?.startDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex gap-3">
                            <button
                              onClick={() => setActiveTab("myMeal")}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                            >
                              View Details
                            </button>
                            {mySubscription.data?.status === 'active' && (
                              <button
                                onClick={() => handleUpdateAutoRenew(!mySubscription.data?.autoRenew)}
                                className="px-4 py-3 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
                              >
                                {mySubscription.data?.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No active subscription</p>
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
                )}

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-purple-50 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-purple-600" size={20} />
                        Recent Activity
                      </h3>
                      <button
                        onClick={() => setActiveTab(isAdmin || isModerator ? "allMeals" : "history")}
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
                        <p className="mt-2 text-gray-600">Loading activity...</p>
                      </div>
                    ) : (isAdmin || isModerator) ? (
                      allMeals.slice(0, 5).map((meal, index) => (
                        <div key={index} className="p-4 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-purple-600">
                                  {meal.userInfo?.firstName?.charAt(0) || "U"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {meal.userInfo?.firstName} {meal.userInfo?.lastName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(meal.date)} • {meal.preference}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                meal.status === 'approved'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : meal.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {meal.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : myMeals.length > 0 ? (
                      myMeals.slice(0, 5).map((meal, index) => (
                        <div key={index} className="p-4 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                meal.status === 'approved'
                                  ? 'bg-green-100 text-green-600'
                                  : meal.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {meal.status === 'approved' ? (
                                  <CheckCircle size={20} />
                                ) : meal.status === 'pending' ? (
                                  <Clock size={20} />
                                ) : (
                                  <XCircle size={20} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(meal.date)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                  {meal.preference} • {meal.status}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-600">No recent activity found</p>
                      </div>
                    )}
                  </div>
                </div>
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
                        <h3 className="text-xl font-bold mb-2">Your Meal Management</h3>
                        <p className="opacity-90">For {getMonthName(selectedMonth)}</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        {mySubscription?.data?.preference === 'office' ? (
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
                    ) : mySubscription?.hasSubscription ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-2">Status</div>
                            <div className={`text-lg font-bold ${
                              mySubscription.data?.status === 'active'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {mySubscription.data?.status?.toUpperCase()}
                            </div>
                          </div>

                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-2">Preference</div>
                            <div className="text-lg font-bold text-gray-900 capitalize">
                              {mySubscription.data?.preference || 'NONE'}
                            </div>
                          </div>

                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-2">Auto Renew</div>
                            <div className="text-lg font-bold text-gray-900">
                              {mySubscription.data?.autoRenew ? 'YES' : 'NO'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Calendar className="text-gray-400" size={20} />
                              <div>
                                <p className="font-medium text-gray-900">Current Month</p>
                                <p className="text-sm text-gray-600">
                                  {mySubscription.data?.currentMonth ? getMonthName(mySubscription.data.currentMonth) : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              mySubscription.data?.currentStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : mySubscription.data?.currentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {mySubscription.data?.currentStatus?.toUpperCase() || 'NONE'}
                            </span>
                          </div>

                          {mySubscription.data?.status === 'active' && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                {mySubscription.data?.autoRenew ? (
                                  <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                  <XCircle className="text-red-500" size={20} />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">Auto Renew</p>
                                  <p className="text-sm text-gray-600">
                                    {mySubscription.data?.autoRenew ? 'Enabled' : 'Disabled'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUpdateAutoRenew(!mySubscription.data?.autoRenew)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                              >
                                {mySubscription.data?.autoRenew ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          )}

                          {mySubscription.data?.status === 'active' && (
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
                        <p className="text-gray-600">No subscription active</p>
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

                {/* My Meal Requests */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <History className="text-purple-600" size={20} />
                      My Meal Requests
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        + New Request
                      </button>
                    </div>
                  </div>

                  {isLoadingData ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="mt-2 text-gray-600">Loading meal requests...</p>
                    </div>
                  ) : myMeals.length > 0 ? (
                    <div className="space-y-3">
                      {myMeals.map((meal, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              meal.status === 'approved'
                                ? 'bg-green-100 text-green-600'
                                : meal.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {meal.status === 'approved' ? (
                                <CheckCircle size={20} />
                              ) : meal.status === 'pending' ? (
                                <Clock size={20} />
                              ) : (
                                <XCircle size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatDate(meal.date)}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {meal.preference} • {meal.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {meal.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setSelectedMeal(meal);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                title="Cancel Request"
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
                      <p className="text-gray-600">No meal requests found</p>
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

            {/* Subscriptions Tab (Admin/Moderator) */}
            {activeTab === "subscriptions" && (isAdmin || isModerator) && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search by name or ID..."
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
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-purple-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-green-600">{allSubscriptions.filter(s => s.status === 'active').length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{allSubscriptions.filter(s => s.status === 'pending').length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pages</p>
                    <p className="text-2xl font-bold text-blue-600">{currentPage}/{totalPages}</p>
                  </div>
                </div>

                {/* Subscriptions Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-purple-50 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Meal Subscriptions ({totalItems})
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
                      <p className="mt-4 text-gray-600">Loading subscriptions...</p>
                    </div>
                  ) : allSubscriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-purple-50 dark:bg-gray-700">
                          <tr>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Employee</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Preference</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Auto Renew</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
{allSubscriptions
  .filter(subscription => subscription.status !== 'cancelled') // Filter out cancelled subscriptions
  .map((subscription, index) => {
    // CORRECTED: Show approve/reject if subscription is pending OR if current month status is pending
    const shouldShowApproveReject = 
      subscription.status === 'pending' || 
      (subscription.status === 'active' && subscription.currentMonthStatus === 'pending');
    
    return (
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
          {/* Show BOTH overall status AND current month status */}
          <div className="flex flex-col gap-1">
            {/* Overall subscription status */}
            <span className={`px-2 py-1 text-xs rounded-full font-medium text-center ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : subscription.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              Subscription: {subscription.status?.toUpperCase()}
            </span>
            
            {/* Current month status - Only show if exists */}
            {subscription.currentMonthStatus && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium text-center ${
                subscription.currentMonthStatus === 'approved'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : subscription.currentMonthStatus === 'pending'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                This Month: {subscription.currentMonthStatus?.toUpperCase()}
              </span>
            )}
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            {subscription.autoRenew ? (
              <CheckCircle className="text-green-500" size={16} />
            ) : (
              <XCircle className="text-red-500" size={16} />
            )}
            <span className="text-sm">{subscription.autoRenew ? 'Yes' : 'No'}</span>
            {subscription.autoRenew && (
              <span className="text-xs text-gray-500">(Auto-continues)</span>
            )}
          </div>
        </td>
        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
          {formatDate(subscription.startDate)}
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            {shouldShowApproveReject ? (
              <>
                <button
                  onClick={() => {
                    setSelectedSubscription(subscription);
                    setShowApproveModal(true);
                  }}
                  className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs transition-colors flex items-center gap-1 font-medium"
                >
                  <Check size={12} />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedSubscription(subscription);
                    setShowRejectModal(true);
                  }}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs transition-colors flex items-center gap-1 font-medium"
                >
                  <X size={12} />
                  Reject
                </button>
              </>
            ) : subscription.currentMonthStatus === 'approved' ? (
              <span className="text-xs text-green-600 px-3 py-1.5 bg-green-50 rounded-lg font-medium">
                ✓ Approved
              </span>
            ) : subscription.autoRenew ? (
              <span className="text-xs text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg">
                Auto-renew enabled
              </span>
            ) : (
              <span className="text-xs text-gray-400 px-3 py-1.5">No request</span>
            )}
            
            {/* Edit button - Only for active/pending subscriptions */}
            {(subscription.status === 'active' || subscription.status === 'pending') && (
              <button
                onClick={() => handleEditClick(subscription)}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="text-blue-500" size={14} />
              </button>
            )}
            
            {/* Delete button - Only for active/pending subscriptions */}
            {(subscription.status === 'active' || subscription.status === 'pending') && (
              <button
                onClick={() => {
                  setSelectedSubscription(subscription);
                  setShowDeleteModal(true);
                }}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="text-red-500" size={14} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">No subscriptions found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Change filters or create a new subscription
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* All Meals Tab (Admin/Moderator) */}
            {activeTab === "allMeals" && (isAdmin || isModerator) && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search by employee name..."
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
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-purple-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-purple-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {getAvailableMonths().map(month => (
                          <option key={month} value={month}>{getMonthName(month)}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => setShowAdminCreateMealModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Create Meal
                    </button>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Meals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{allMeals.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{allMeals.filter(m => m.status === 'approved').length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{allMeals.filter(m => m.status === 'pending').length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-blue-600">{allMeals.filter(m => {
                      const mealDate = new Date(m.date);
                      const mealMonth = `${mealDate.getFullYear()}-${String(mealDate.getMonth() + 1).padStart(2, '0')}`;
                      return mealMonth === selectedMonth;
                    }).length}</p>
                  </div>
                </div>

                {/* All Meals Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-purple-50 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        All Meal Requests ({allMeals.length})
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getMonthName(selectedMonth)}
                      </div>
                    </div>
                  </div>

                  {isLoadingData ? (
                    <div className="p-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading meals...</p>
                    </div>
                  ) : allMeals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-purple-50 dark:bg-gray-700">
                          <tr>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Employee</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Preference</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {allMeals.map((meal, index) => (
                            <tr key={index} className="hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-purple-600">
                                      {meal.userInfo?.firstName?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {meal.userInfo?.firstName} {meal.userInfo?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{meal.userInfo?.department}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(meal.date)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {meal.mealType === 'dinner' ? 'Dinner' : 'Lunch'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {meal.preference === 'office' ? (
                                    <Coffee className="text-purple-600" size={16} />
                                  ) : (
                                    <Pizza className="text-orange-600" size={16} />
                                  )}
                                  <span className="capitalize">{meal.preference}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  meal.status === 'approved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : meal.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : meal.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {meal.status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {/* In All Meals Tab - Actions buttons */}
                                {meal.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveRejectMeal(meal._id, 'approved')}
                                      className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleApproveRejectMeal(meal._id, 'rejected')}
                                      className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                  {(meal.status === 'pending' || meal.status === 'approved') && (
                                    <button
                                      onClick={() => {
                                        setSelectedMeal(meal);
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
                        <Utensils className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">No meals found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Change filters or create a new meal request
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (isAdmin || isModerator) && (
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
                        onClick={() => {
                          if (monthlyReport?.data) {
                            const csvContent = "data:text/csv;charset=utf-8," 
                              + "Employee ID,Name,Department,Subscription Status,Preference,Approved Meals\n"
                              + monthlyReport.data.map(row => 
                                `${row.employeeId},${row.name},${row.department},${row.subscription},${row.preference},${row.approvedMeals}`
                              ).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `meal-report-${selectedMonth}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success("Report exported successfully!");
                          }
                        }}
                        className="px-6 py-2 bg-white text-purple-600 rounded-xl hover:bg-purple-50 font-medium transition-colors flex items-center gap-2"
                      >
                        <Download size={18} />
                        Export CSV
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
                        <p className="text-sm opacity-90 mb-1">With Subscription</p>
                        <p className="text-2xl font-bold">{monthlyReport?.stats?.withSubscription || 0}</p>
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
                                  item.subscription === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : item.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {item.subscription?.toUpperCase()}
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
                                  {item.approvedMeals || 0}
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
                  ) : myMeals.length > 0 ? (
                    <div className="space-y-6">
                      {myMeals.map((meal, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                            }`}></div>
                            {index < myMeals.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 pb-6">
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-900">
                                  {formatDate(meal.date)}
                                </h4>
                                <span className={`px-3 py-1 text-xs rounded-full ${
                                  meal.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : meal.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {meal.status?.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">Meal Type</p>
                                  <p className="font-bold text-gray-900 capitalize">
                                    {meal.mealType || 'Lunch'}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">Preference</p>
                                  <p className="font-bold text-gray-900 capitalize">
                                    {meal.preference || 'N/A'}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">Cost</p>
                                  <p className="font-bold text-gray-900">
                                    {meal.cost ? `৳${meal.cost}` : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              {meal.notes && (
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                  <p className="text-sm text-gray-600">Note:</p>
                                  <p className="text-sm text-gray-900">{meal.notes}</p>
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
                      <p className="text-gray-600">No meal history available</p>
                      <p className="text-sm text-gray-500 mt-1">
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
 <div className="fixed inset-0 bg-black/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="p-6 border-b border-purple-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Meal Request</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit your meal preference</p>
          </div>
          <button
            onClick={() => setShowRequestModal(false)}
            className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Meal Preference
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRequestForm({...requestForm, mealPreference: 'office'})}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                  requestForm.mealPreference === 'office'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`p-3 rounded-lg mb-2 ${
                  requestForm.mealPreference === 'office' 
                    ? 'bg-purple-100 dark:bg-purple-900/30' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Coffee className={
                    requestForm.mealPreference === 'office' 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  } size={24} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Office Meal</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Prepared in office kitchen</span>
              </button>

              <button
                onClick={() => setRequestForm({...requestForm, mealPreference: 'outside'})}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                  requestForm.mealPreference === 'outside'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`p-3 rounded-lg mb-2 ${
                  requestForm.mealPreference === 'outside' 
                    ? 'bg-purple-100 dark:bg-purple-900/30' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Pizza className={
                    requestForm.mealPreference === 'outside' 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  } size={24} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Outside Food</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">From partner restaurants</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={requestForm.date}
                onChange={(e) => setRequestForm({...requestForm, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Select a future date for your meal</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Note <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={requestForm.note}
              onChange={(e) => setRequestForm({...requestForm, note: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Any dietary restrictions, allergies, or special requirements..."
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Max 500 characters</p>
              <span className={`text-xs ${requestForm.note.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {requestForm.note.length}/500
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-start">
              <Info className="text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" size={18} />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Note for office meals</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Office meals must be requested at least 2 hours in advance. Outside food orders require 30 minutes advance notice.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={() => setShowRequestModal(false)}
            className="flex-1 px-4 py-3.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitMealRequest}
            disabled={!requestForm.mealPreference || !requestForm.date}
            className={`flex-1 px-4 py-3.5 rounded-xl font-medium transition-all ${
              !requestForm.mealPreference || !requestForm.date
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
            }`}
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
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
{/* In subscription modal */}
{showSubscriptionModal && (
  <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
      <div className="p-6 border-b border-purple-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {mySubscription?.data?.status === 'cancelled' ? 
              'New Subscription Request' : 
              'Monthly Subscription'
            }
          </h3>
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
          {/* Meal Preference Selection */}
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

          {/* ========== ADD THIS SECTION HERE ========== */}
          {/* Cancelled User Warning */}
          {mySubscription?.data?.status === 'cancelled' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="flex items-start">
                <AlertTriangle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Previous subscription cancelled
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    New subscription requires admin approval. Auto-renew disabled.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* =========================================== */}

          {/* ========== REPLACE AUTO-RENEW SECTION ========== */}
          {/* Auto-renew toggle with forced false for cancelled */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto Renew</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mySubscription?.data?.status === 'cancelled' ? 
                    'Disabled for cancelled subscriptions' : 
                    'Automatically renew subscription'
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  if (mySubscription?.data?.status !== 'cancelled') {
                    setSubscriptionForm({...subscriptionForm, autoRenew: !subscriptionForm.autoRenew});
                  }
                }}
                disabled={mySubscription?.data?.status === 'cancelled'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  (mySubscription?.data?.status === 'cancelled') ? 
                    'bg-gray-300 cursor-not-allowed' :
                    subscriptionForm.autoRenew ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  (mySubscription?.data?.status === 'cancelled') ? 
                    'translate-x-1' :
                    subscriptionForm.autoRenew ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
          {/* ================================================= */}

          {/* Action Buttons */}
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
              {mySubscription?.data?.status === 'cancelled' ? 
                'Request Subscription' : 
                'Activate Subscription'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Auto-renew toggle with forced false for cancelled */}
<div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-gray-900 dark:text-white">Auto Renew</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {mySubscription?.data?.status === 'cancelled' ? 
          'Disabled for cancelled subscriptions' : 
          'Automatically renew subscription'
        }
      </p>
    </div>
    <button
      onClick={() => {
        if (mySubscription?.data?.status !== 'cancelled') {
          setSubscriptionForm({...subscriptionForm, autoRenew: !subscriptionForm.autoRenew});
        }
      }}
      disabled={mySubscription?.data?.status === 'cancelled'}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
        (mySubscription?.data?.status === 'cancelled') ? 
          'bg-gray-300 cursor-not-allowed' :
          subscriptionForm.autoRenew ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        (mySubscription?.data?.status === 'cancelled') ? 
          'translate-x-1' :
          subscriptionForm.autoRenew ? 'translate-x-6' : 'translate-x-1'
      }`} />
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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      {/* Header - More Compact */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Subscription</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create meal plan for employee</p>
          </div>
          <button
            onClick={() => setShowAdminCreateModal(false)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="text-gray-500 dark:text-gray-400" size={20} />
          </button>
        </div>
      </div>

      {/* Form Content - More Compact */}
      <div className="p-5">
        <div className="space-y-4">
          {/* Employee Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Employee
            </label>
            <select
              value={adminCreateForm.userId}
              onChange={(e) => setAdminCreateForm({...adminCreateForm, userId: e.target.value})}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">Select employee</option>
              {allUsers.map(user => (
                <option key={user._id} value={user._id} className="text-sm">
                  {user.firstName} {user.lastName} ({user.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Meal Preference - More Compact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Meal Preference
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAdminCreateForm({...adminCreateForm, preference: 'office'})}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  adminCreateForm.preference === 'office'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <Coffee className={`${
                  adminCreateForm.preference === 'office' ? 'text-purple-600' : 'text-gray-400'
                }`} size={18} />
                <span className="text-sm font-medium">Office</span>
              </button>

              <button
                onClick={() => setAdminCreateForm({...adminCreateForm, preference: 'outside'})}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  adminCreateForm.preference === 'outside'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <Pizza className={`${
                  adminCreateForm.preference === 'outside' ? 'text-purple-600' : 'text-gray-400'
                }`} size={18} />
                <span className="text-sm font-medium">Outside</span>
              </button>
            </div>
          </div>

          {/* Auto Renew - More Compact */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Auto Renew</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Auto renew subscription</p>
              </div>
              <button
                onClick={() => setAdminCreateForm({...adminCreateForm, autoRenew: !adminCreateForm.autoRenew})}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  adminCreateForm.autoRenew ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  adminCreateForm.autoRenew ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Note - More Compact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Note <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={adminCreateForm.note}
              onChange={(e) => setAdminCreateForm({...adminCreateForm, note: e.target.value})}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="Add note..."
            />
          </div>
        </div>

        {/* Action Buttons - More Compact */}
        <div className="mt-5 flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowAdminCreateModal(false)}
            className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAdminCreateSubscription}
            className="flex-1 px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium shadow-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Admin Create Meal Modal */}
      {showAdminCreateMealModal && (
  <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
      <div className="p-6 border-b border-purple-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Meal Request</h3>
          <button
            onClick={() => setShowAdminCreateMealModal(false)}
            className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Employee
              </label>
              <select
                value={adminCreateMealForm.userId}
                onChange={(e) => setAdminCreateMealForm({...adminCreateMealForm, userId: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select an employee</option>
                {allUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.employeeId}) - {user.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meal Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAdminCreateMealForm({...adminCreateMealForm, mealPreference: 'office'})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    adminCreateMealForm.mealPreference === 'office'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Coffee className={`mb-2 ${
                      adminCreateMealForm.mealPreference === 'office' ? 'text-purple-600' : 'text-gray-400'
                    }`} size={24} />
                    <span className="font-medium">Office Meal</span>
                    <span className="text-sm text-gray-500 mt-1">Office kitchen</span>
                  </div>
                </button>

                <button
                  onClick={() => setAdminCreateMealForm({...adminCreateMealForm, mealPreference: 'outside'})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    adminCreateMealForm.mealPreference === 'outside'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Pizza className={`mb-2 ${
                      adminCreateMealForm.mealPreference === 'outside' ? 'text-purple-600' : 'text-gray-400'
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
                value={adminCreateMealForm.date}
                onChange={(e) => setAdminCreateMealForm({...adminCreateMealForm, date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Note (Optional)
              </label>
              <textarea
                value={adminCreateMealForm.note}
                onChange={(e) => setAdminCreateMealForm({...adminCreateMealForm, note: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Any special requirements or notes..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-3">
          <button
            onClick={() => setShowAdminCreateMealModal(false)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdminCreateMeal}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all font-medium"
          >
            Create Meal
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Approve Modal */}
      {showApproveModal && selectedSubscription && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-xs">
      {/* Minimal Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Approve</h3>
        <button
          onClick={() => setShowApproveModal(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={14} />
        </button>
      </div>
      
      {/* Super Compact Content */}
      <div className="p-3">
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          Approve for <span className="font-medium">{selectedSubscription.userInfo?.firstName}</span>?
        </p>
        
        {/* Tiny Note Input */}
        <div className="mb-3">
          <textarea
            rows={1}
            className="w-full px-2.5 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
            placeholder="Note (optional)..."
            onChange={(e) => setUpdateForm({...updateForm, note: e.target.value})}
          />
        </div>
        
        {/* Tight Buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowApproveModal(false)}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => handleUpdateSubscriptionStatus('approve')}
            className="flex-1 px-2 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium"
          >
            ✓ Approve
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Reject Modal */}
      {showRejectModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Subscription</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to reject subscription for {selectedSubscription.userInfo?.firstName} {selectedSubscription.userInfo?.lastName}?
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Required)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter rejection reason..."
                    onChange={(e) => setUpdateForm({...updateForm, note: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateSubscriptionStatus('reject')}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (selectedSubscription || selectedMeal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-purple-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedSubscription ? 'Delete Subscription' : 'Cancel Meal Request'}
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedSubscription 
                  ? `Are you sure you want to delete subscription for ${selectedSubscription.userInfo?.firstName} ${selectedSubscription.userInfo?.lastName}?`
                  : `Are you sure you want to cancel meal request for ${formatDate(selectedMeal?.date)}?`
                }
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedSubscription ? handleDeleteSubscription : handleCancelMealRequest}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                >
                  {selectedSubscription ? 'Delete' : 'Cancel'}
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