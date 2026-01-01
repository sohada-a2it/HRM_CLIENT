"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  X,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Settings,
  Percent,
  Award,
  Coffee,
  Moon,
  Sun,
  Zap
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function SalaryRulesPage() {
  const router = useRouter();
  const [salaryRules, setSalaryRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [form, setForm] = useState({
    title: "",
    salaryType: "monthly",
    rate: 0,
    overtimeRate: 0,
    bonus: 0,
    leaveRule: {
      paidLeave: 0,
      unpaidLeave: 0,
      sickLeave: 0,
      casualLeave: 0
    },
    lateRule: {
      deductionPerLate: 0,
      maxLateMinutes: 30,
      gracePeriod: 10
    },
    isActive: true
  });
  
  // User role state
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);

  // Helper function to get user type
  const getUserType = () => {
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("adminToken");
      const employeeToken = localStorage.getItem("employeeToken");
      
      if (adminToken) return "admin";
      if (employeeToken) return "employee";
    }
    return null;
  };

  // Get token
  const getToken = () => {
    const userType = getUserType();
    if (userType === "admin") {
      return localStorage.getItem("adminToken");
    } else if (userType === "employee") {
      return localStorage.getItem("employeeToken");
    }
    return null;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userType = getUserType();
      const token = getToken();
      
      if (!token) {
        router.push("/login");
        return { role: "employee", isAdmin: false, userData: null };
      }

      const endpoint = userType === "admin" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/getAdminProfile`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/getProfile`;

      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("employeeToken");
        router.push("/login");
        return { role: "employee", isAdmin: false, userData: null };
      }

      const data = await response.json();
      
      if (data.user || (data && typeof data === 'object' && (data.email || data._id))) {
        const userData = data.user || data;
        return { 
          role: userType, 
          isAdmin: userType === "admin", 
          userData 
        };
      }
      
      return { role: "employee", isAdmin: false, userData: null };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { role: "employee", isAdmin: false, userData: null };
    }
  };

  // Fetch salary rules
const fetchSalaryRules = async () => {
  setLoading(true);
  const loadingToast = toast.loading("Loading salary rules...");
  
  try {
    const token = getToken();
    
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user profile first
    const userProfile = await fetchUserProfile();
    if (userProfile) {
      setUserRole(userProfile.role);
      setIsAdmin(userProfile.isAdmin);
      setUserData(userProfile.userData);
    }

    // Both admin and employee can view salary rules
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getSalary`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    if (data.status === "success") {
      setSalaryRules(data.rules || []);
      toast.dismiss(loadingToast);
      toast.success(`Loaded ${data.rules?.length || 0} salary rules`, {
        icon: '💰',
        duration: 3000,
      });
    } else {
      toast.dismiss(loadingToast);
      toast.error(data.message || "Failed to load salary rules");
    }
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error("Error loading salary rules");
    console.error("Fetch salary rules error:", error);
  } finally {
    setLoading(false);
  }
};

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("leaveRule.")) {
      const field = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        leaveRule: {
          ...prev.leaveRule,
          [field]: type === "number" ? parseFloat(value) || 0 : value
        }
      }));
    } else if (name.startsWith("lateRule.")) {
      const field = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        lateRule: {
          ...prev.lateRule,
          [field]: type === "number" ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : 
                type === "number" ? parseFloat(value) || 0 : 
                value
      }));
    }
  };

  // Add new salary rule
  const handleAddSalaryRule = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error("Only admin can create salary rules");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Creating salary rule...");
    
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createSalary`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      
      if (response.status === 403) {
        toast.error("Only admin can create salary rules");
        return;
      }
      
      if (data.status === "success") {
        toast.dismiss(loadingToast);
        toast.success("Salary rule created successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        setShowAddModal(false);
        resetForm();
        fetchSalaryRules();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Failed to create salary rule");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error creating salary rule");
      console.error("Add salary rule error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Update salary rule
  const handleUpdateSalaryRule = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error("Only admin can update salary rules");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Updating salary rule...");
    
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/updateSalary/${selectedRule._id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      
      if (response.status === 403) {
        toast.error("Only admin can update salary rules");
        return;
      }
      
      if (data.status === "success") {
        toast.dismiss(loadingToast);
        toast.success("Salary rule updated successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        setShowEditModal(false);
        setSelectedRule(null);
        resetForm();
        fetchSalaryRules();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Failed to update salary rule");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error updating salary rule");
      console.error("Update salary rule error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete salary rule
  const handleDeleteSalaryRule = async () => {
    if (!isAdmin) {
      toast.error("Only admin can delete salary rules");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Deleting salary rule...");
    
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deleteSalary/${selectedRule._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      
      if (response.status === 403) {
        toast.error("Only admin can delete salary rules");
        return;
      }
      
      if (data.status === "success") {
        toast.dismiss(loadingToast);
        toast.success("Salary rule deleted successfully!", {
          icon: '🗑️',
          duration: 3000,
        });
        
        setShowDeleteModal(false);
        setSelectedRule(null);
        fetchSalaryRules();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Failed to delete salary rule");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error deleting salary rule");
      console.error("Delete salary rule error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Edit rule click
  const handleEditClick = (rule) => {
    if (!isAdmin) {
      toast.error("Only admin can edit salary rules");
      return;
    }
    
    setSelectedRule(rule);
    setForm({
      title: rule.title || "",
      salaryType: rule.salaryType || "monthly",
      rate: rule.rate || 0,
      overtimeRate: rule.overtimeRate || 0,
      bonus: rule.bonus || 0,
      leaveRule: rule.leaveRule || {
        paidLeave: 0,
        unpaidLeave: 0,
        sickLeave: 0,
        casualLeave: 0
      },
      lateRule: rule.lateRule || {
        deductionPerLate: 0,
        maxLateMinutes: 30,
        gracePeriod: 10
      },
      isActive: rule.isActive !== undefined ? rule.isActive : true
    });
    setShowEditModal(true);
  };

  // Delete rule click
  const handleDeleteClick = (rule) => {
    if (!isAdmin) {
      toast.error("Only admin can delete salary rules");
      return;
    }
    
    setSelectedRule(rule);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      salaryType: "monthly",
      rate: 0,
      overtimeRate: 0,
      bonus: 0,
      leaveRule: {
        paidLeave: 0,
        unpaidLeave: 0,
        sickLeave: 0,
        casualLeave: 0
      },
      lateRule: {
        deductionPerLate: 0,
        maxLateMinutes: 30,
        gracePeriod: 10
      },
      isActive: true
    });
  };

  // Filter rules
  const filteredRules = salaryRules.filter(rule => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      rule.title.toLowerCase().includes(searchLower);
    
    const matchesType = selectedType === "all" || rule.salaryType === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get salary type label
  const getSalaryTypeLabel = (type) => {
    switch(type) {
      case 'monthly': return 'Monthly';
      case 'hourly': return 'Hourly';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-Weekly';
      case 'yearly': return 'Yearly';
      default: return type;
    }
  };

  // Get salary type color
  const getSalaryTypeColor = (type) => {
    switch(type) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'hourly': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-purple-100 text-purple-800';
      case 'biweekly': return 'bg-yellow-100 text-yellow-800';
      case 'yearly': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchSalaryRules();
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Add Salary Rule Modal */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create Salary Rule</h2>
                  <p className="text-gray-500 text-sm mt-1">Define new salary calculation rules</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddSalaryRule} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="E.g., Manager Salary Rule"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Type *
                  </label>
                  <select
                    name="salaryType"
                    value={form.salaryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              
              {/* Rate Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Rate *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      name="rate"
                      value={form.rate}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overtime Rate (per hour)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      name="overtimeRate"
                      value={form.overtimeRate}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus Amount
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      name="bonus"
                      value={form.bonus}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              
              {/* Leave Rules */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-500" />
                  Leave Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Leave (days)
                    </label>
                    <input
                      type="number"
                      name="leaveRule.paidLeave"
                      value={form.leaveRule.paidLeave}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unpaid Leave (days)
                    </label>
                    <input
                      type="number"
                      name="leaveRule.unpaidLeave"
                      value={form.leaveRule.unpaidLeave}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sick Leave (days)
                    </label>
                    <input
                      type="number"
                      name="leaveRule.sickLeave"
                      value={form.leaveRule.sickLeave}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Casual Leave (days)
                    </label>
                    <input
                      type="number"
                      name="leaveRule.casualLeave"
                      value={form.leaveRule.casualLeave}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              
              {/* Late Rules */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-yellow-500" />
                  Late Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deduction per Late ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        name="lateRule.deductionPerLate"
                        value={form.lateRule.deductionPerLate}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Late Minutes
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        name="lateRule.maxLateMinutes"
                        value={form.lateRule.maxLateMinutes}
                        onChange={handleChange}
                        min="0"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grace Period (minutes)
                    </label>
                    <div className="relative">
                      <Coffee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        name="lateRule.gracePeriod"
                        value={form.lateRule.gracePeriod}
                        onChange={handleChange}
                        min="0"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                    <p className="text-gray-500 text-sm mt-1">Set rule as active or inactive</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Create Rule
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Salary Rule Modal */}
      {showEditModal && selectedRule && isAdmin && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Salary Rule</h2>
                  <p className="text-gray-500 text-sm mt-1">Update salary calculation rules</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRule(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateSalaryRule} className="p-6 space-y-6">
              {/* Same form structure as Add Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Type *
                  </label>
                  <select
                    name="salaryType"
                    value={form.salaryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              
              {/* Same form fields as Add Modal */}
              {/* ... [Rest of the form fields] ... */}
              
              <div className="pt-6 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRule(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit size={18} />
                        Update Rule
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRule && isAdmin && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Salary Rule</h2>
                  <p className="text-gray-500 text-sm mt-1">This action cannot be undone</p>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRule(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Are you sure?</h3>
                  <p className="text-sm text-gray-500">
                    You are about to delete "{selectedRule.title}"
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRule(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSalaryRule}
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Rule
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Salary Rules Management
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">Define and manage salary calculation rules</p>
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isAdmin 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' 
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                  }`}>
                    {isAdmin ? <Shield size={12} /> : <User size={12} />}
                    {userRole.toUpperCase()}
                    {!isAdmin && " (View Only)"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchSalaryRules}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              
              {/* Admin only - Add Rule button */}
              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  Add Rule
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Rules</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{salaryRules.length}</p>
                  <p className="text-xs text-gray-400 mt-1">All salary rules</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Rules</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {salaryRules.filter(r => r.isActive).length}
                  </p>
                  <p className="text-xs text-green-500 mt-1">Currently active</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Monthly Rules</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {salaryRules.filter(r => r.salaryType === 'monthly').length}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Monthly salary</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Hourly Rules</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {salaryRules.filter(r => r.salaryType === 'hourly').length}
                  </p>
                  <p className="text-xs text-yellow-500 mt-1">Hourly wage</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Salary Rules</h2>
                <p className="text-gray-500 text-sm">
                  {filteredRules.length} of {salaryRules.length} rules
                  {!isAdmin && " (View Only)"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                  >
                    <option value="all">All Types</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Rules List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading salary rules...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
              </div>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No salary rules found</h3>
                <p className="text-gray-500 max-w-md">
                  {searchTerm || selectedType !== "all" 
                    ? 'Try adjusting your search or filters' 
                    : 'Start by creating your first salary rule'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Add Salary Rule
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRules.map((rule) => (
                <div 
                  key={rule._id}
                  className="group p-6 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Rule Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                          {rule.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSalaryTypeColor(rule.salaryType)}`}>
                            {getSalaryTypeLabel(rule.salaryType)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rule.isActive 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Rate Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="text-sm text-blue-700 font-medium">Base Rate</div>
                          <div className="text-xl font-bold text-blue-900">{formatCurrency(rule.rate)}</div>
                          <div className="text-xs text-blue-600">
                            {rule.salaryType === 'hourly' ? 'per hour' : 
                             rule.salaryType === 'weekly' ? 'per week' : 
                             rule.salaryType === 'monthly' ? 'per month' : 
                             rule.salaryType === 'yearly' ? 'per year' : ''}
                          </div>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="text-sm text-green-700 font-medium">Overtime Rate</div>
                          <div className="text-xl font-bold text-green-900">{formatCurrency(rule.overtimeRate || 0)}</div>
                          <div className="text-xs text-green-600">per hour</div>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="text-sm text-yellow-700 font-medium">Bonus</div>
                          <div className="text-xl font-bold text-yellow-900">{formatCurrency(rule.bonus || 0)}</div>
                          <div className="text-xs text-yellow-600">additional</div>
                        </div>
                      </div>
                      
                      {/* Rule Details */}
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-blue-500" />
                          <span>Leave: Paid {rule.leaveRule?.paidLeave || 0} days</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-yellow-500" />
                          <span>Late: {formatCurrency(rule.lateRule?.deductionPerLate || 0)} deduction</span>
                        </div>
                        {rule.createdBy && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={14} className="text-purple-500" />
                            <span>Created by: {rule.createdBy.name || 'Admin'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons - Admin only */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleEditClick(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Rule"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rule)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Rule"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Guide */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            How Salary Rules Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-500" />
                <span className="font-medium text-gray-700">Base Salary</span>
              </div>
              <p className="text-sm text-gray-600">
                The basic rate applied based on salary type (monthly, hourly, etc.)
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-yellow-500" />
                <span className="font-medium text-gray-700">Overtime & Late</span>
              </div>
              <p className="text-sm text-gray-600">
                Extra pay for overtime work and deductions for late arrivals
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-medium text-gray-700">Leave Rules</span>
              </div>
              <p className="text-sm text-gray-600">
                Configure paid, unpaid, sick, and casual leave allowances
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}