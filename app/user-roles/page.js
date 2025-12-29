"use client";

import React, { useState, useEffect, useRef } from "react";
import { EyeOff, Key, Eye } from 'lucide-react';
import { 
  createUser as createUserAPI, 
  getUsers, 
  updateUser as updateUserAPI,
  deleteUser as deleteUserAPI 
} from "@/app/lib/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Check,
  UserPlus,
  Shield,
  UserCog,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Building,
  ChevronDown,
  MoreVertical,
  UserCheck,
  UserX,
  TrendingUp,
  Users,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "employee",
    salary: "",
    status: "active",
    department: "IT",
    phone: "",
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetData, setResetData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Loading users...");
    try {
      const data = await getUsers();
      setUsers(data.users || []);
      toast.dismiss(loadingToast);
      toast.success(`Loaded ${data.users?.length || 0} users successfully!`, {
        icon: '👥',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
        }
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to load users!", {
        icon: '❌',
        duration: 4000,
      });
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const loadingMessage = isEditMode ? "Updating user..." : "Creating user...";
    const loadingToast = toast.loading(loadingMessage, {
      duration: Infinity,
    });

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        salaryType: "monthly",
        rate: Number(form.salary),
        status: form.status,
        department: form.department,
        phone: form.phone,
        joiningDate: new Date().toISOString().split('T')[0]
      };

      let res;
      
      if (isEditMode) {
        // Update existing user
        res = await updateUserAPI(currentUserId, payload);
        if (res.message === "User updated successfully") {
          toast.dismiss(loadingToast);
          toast.success("User updated successfully!", {
            icon: '✅',
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            }
          });
        }
      } else {
        // Create new user
        res = await createUserAPI(payload);
        if (res.message === "User created successfully") {
          toast.dismiss(loadingToast);
          toast.success("User created successfully!", {
            icon: '🎉',
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            }
          });
        }
      }

      if (res.message?.includes("successfully")) {
        resetForm();
        fetchUsers();
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.message || "Something went wrong!", {
          icon: '⚠️',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error: " + error.message, {
        icon: '❌',
        duration: 5000,
      });
    }

    setFormLoading(false);
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "employee",
      salary: "",
      status: "active",
      department: "IT",
      phone: "",
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setIsEditMode(false);
    setCurrentUserId(null);
    
    toast.success("Form reset successfully!", {
      duration: 2000,
    });
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setCurrentUserId(user._id);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
      role: user.role || "employee",
      salary: user.rate || "",
      status: user.status || "active",
      department: user.department || "IT",
      phone: user.phone || "",
      joiningDate: user.joiningDate || new Date().toISOString().split('T')[0]
    });
    
    toast("Edit mode activated. Scroll to form.", {
      icon: '✏️',
      duration: 2000,
    });
    
    setTimeout(() => {
      document.getElementById("userForm")?.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  const handleDelete = async (userId, userName) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Delete User
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete <span className="font-semibold">{userName}</span>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(userId, userName);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'top-center',
    });
  };

  const confirmDelete = async (userId, userName) => {
    const loadingToast = toast.loading(`Deleting ${userName}...`);
    
    try {
      const res = await deleteUserAPI(userId);
      if (res.message === "User deleted successfully") {
        toast.dismiss(loadingToast);
        toast.success(`${userName} deleted successfully!`, {
          icon: '🗑️',
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          }
        });
        fetchUsers();
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.message || "Failed to delete user", {
          icon: '❌',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error deleting user: " + error.message, {
        icon: '❌',
        duration: 5000,
      });
    }
  };

  const handleView = (user) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full bg-gradient-to-br from-purple-50 to-white shadow-xl rounded-xl pointer-events-auto ring-1 ring-purple-100`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user.role?.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Mail className="w-4 h-4 mr-3 text-purple-500" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Phone className="w-4 h-4 mr-3 text-blue-500" />
              <span>{user.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Building className="w-4 h-4 mr-3 text-green-500" />
              <span>{user.department || "Not assigned"}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <CreditCard className="w-4 h-4 mr-3 text-yellow-500" />
              <span>৳{(user.rate || 0).toLocaleString()}/month</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.status?.toUpperCase()}
              </span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleEdit(user);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-right',
    });
  };

  // Reset password functionality
  const handleResetPassword = async () => {
    if (resetStep === 1) {
      if (!resetData.email || !resetData.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      console.log('Sending OTP to:', resetData.email);
      setFormLoading(true);
      setTimeout(() => {
        setFormLoading(false);
        setResetStep(2);
        toast.success(`OTP sent to ${resetData.email}`);
      }, 1000);
    } else if (resetStep === 2) {
      if (!resetData.otp) {
        toast.error('Please enter OTP');
        return;
      }
      console.log('Verifying OTP:', resetData.otp);
      setFormLoading(true);
      setTimeout(() => {
        setFormLoading(false);
        setResetStep(3);
      }, 1000);
    } else if (resetStep === 3) {
      if (resetData.newPassword !== resetData.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }
      console.log('Updating password...');
      setFormLoading(true);
      setTimeout(() => {
        setFormLoading(false);
        toast.success('Password updated successfully!');
        setIsResetPasswordMode(false);
        setResetStep(1);
        setResetData({
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: ''
        });
      }, 1000);
    }
  };

  // Password input component with show/hide
  const PasswordInput = ({ 
    name, 
    value, 
    onChange, 
    placeholder, 
    required,
    show,
    toggleShow
  }) => (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 pr-12"
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );

  // Reset Password Modal
  const ResetPasswordModal = () => {
    const emailInputRef = useRef(null);
    
    useEffect(() => {
      if (resetStep === 1 && emailInputRef.current) {
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 100);
      }
    }, [resetStep]);

    const handleModalInputChange = (e) => {
      const { name, value } = e.target;
      setResetData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Reset Password
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {resetStep === 1 && "Enter your email to receive OTP"}
                  {resetStep === 2 && "Enter the OTP sent to your email"}
                  {resetStep === 3 && "Enter your new password"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsResetPasswordMode(false);
                  setResetStep(1);
                  setResetData({
                    email: '',
                    otp: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {resetStep === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  value={resetData.email}
                  onChange={handleModalInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
            )}

            {resetStep === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={resetData.otp}
                  onChange={handleModalInputChange}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                />
                <p className="text-sm text-gray-500 mt-2">
                  OTP sent to: {resetData.email}
                </p>
              </div>
            )}

            {resetStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <PasswordInput
                    name="newPassword"
                    value={resetData.newPassword}
                    onChange={handleModalInputChange}
                    placeholder="Enter new password"
                    required
                    show={showNewPassword}
                    toggleShow={() => setShowNewPassword(!showNewPassword)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={resetData.confirmPassword}
                    onChange={handleModalInputChange}
                    placeholder="Confirm new password"
                    required
                    show={showConfirmPassword}
                    toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResetPassword}
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Key size={20} />
                    {resetStep === 1 ? "Send OTP" : 
                     resetStep === 2 ? "Verify OTP" : 
                     "Update Password"}
                  </>
                )}
              </button>

              {resetStep > 1 && (
                <button
                  type="button"
                  onClick={() => setResetStep(resetStep - 1)}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower);

    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    admins: users.filter(u => u.role === "admin").length,
    employees: users.filter(u => u.role === "employee").length,
    totalSalary: users.reduce((sum, user) => sum + (user.rate || 0), 0)
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#8B5CF6',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Employee Management
              </h1>
              <p className="text-gray-600 mt-2">Manage all system users with advanced controls</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1">All system users</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    Currently active
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Administrators</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.admins}</p>
                  <p className="text-xs text-blue-500 mt-1">Full access users</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Monthly Salary</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">৳{stats.totalSalary.toLocaleString()}</p>
                  <p className="text-xs text-yellow-500 mt-1">Total monthly payout</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* User List Table */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
                    <p className="text-gray-500 text-sm">
                      {filteredUsers.length} of {users.length} users found
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading users...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          User
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-16 px-6 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                <UserCog className="text-gray-400" size={32} />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
                              <p className="text-gray-500 max-w-md">
                                {searchTerm || selectedRole !== "all" || selectedStatus !== "all" 
                                  ? 'Try adjusting your search or filters' 
                                  : 'Start by creating your first user'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="font-semibold text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <Mail size={12} className="mr-1" />
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : user.role === 'manager'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {user.role === 'admin' && <Shield size={16} />}
                                  {user.role === 'manager' && <UserCog size={16} />}
                                  {user.role === 'employee' && <Users size={16} />}
                                </div>
                                <span className="ml-2 font-medium capitalize">{user.role}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                                bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border border-emerald-200">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleView(user)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                                  title="Edit User"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Delete User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredUsers.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(filteredUsers.length, 10)} of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      Previous
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                      1
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-1">
            {isResetPasswordMode && <ResetPasswordModal />}
            
            <div id="userForm" className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isEditMode ? "Edit User" : "Create Employee"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {isEditMode ? "Update user details" : "Add a new user to the system"}
                    </p>
                  </div>
                  {isEditMode && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetForm}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First"
                        required
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      />
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last"
                        required
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="user@company.com"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    />
                  </div>

                  {!isEditMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <PasswordInput
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required={!isEditMode}
                        show={showPassword}
                        toggleShow={() => setShowPassword(!showPassword)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role & Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                      </select>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                    </label>
                    <div className="space-y-3">
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      />
                      <select
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      >
                        <option value="IT">IT Department</option>
                        <option value="HR">Human Resources</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                      </select>
                      <input
                        name="salary"
                        type="number"
                        value={form.salary}
                        onChange={handleChange}
                        placeholder="Monthly Salary (৳)"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset Password Button - শুধুমাত্র Edit mode-এ */}
                {isEditMode && form.email && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setResetData(prev => ({ ...prev, email: form.email }));
                        setIsResetPasswordMode(true);
                      }}
                      className="group w-full inline-flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium py-2.5 px-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300"
                    >
                      <Key size={16} className="group-hover:scale-110 transition-transform duration-300" />
                      <span className="truncate max-w-[180px]">Reset Password</span>
                      <span className="text-xs text-purple-400 group-hover:text-purple-500 ml-auto">
                        {form.email.split('@')[0]}
                      </span>
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <CheckCircle size={20} />
                          Update User
                        </>
                      ) : (
                        <>
                          <UserPlus size={20} />
                          Create Employee
                        </>
                      )}
                    </>
                  )}
                </button>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}