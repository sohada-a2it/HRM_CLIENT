"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Calendar,
  Activity,
  Edit,
  Save,
  X,
  Clock,
  MapPin,
  Building,
  Briefcase,
  CreditCard,
  Eye,
  EyeOff,
  LogOut,
  History,
  Users,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Globe,
  Database,
  ShieldCheck,
  DollarSign,
  Hash,
  BadgeCheck,
  ChevronRight,
  Key
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // ইউজারের টাইপ চেক করার জন্য
  const getUserType = () => {
    if (localStorage.getItem("adminToken")) return "admin";
    if (localStorage.getItem("employeeToken")) return "employee";
    return null;
  };

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    department: "",
    designation: "",
    employeeId: "",
    salaryType: "",
    rate: "",
    joiningDate: "",
    // এডমিনের জন্য অতিরিক্ত ফিল্ড
    companyName: "",
    position: "",
    adminLevel: "",
    permissions: []
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userType = getUserType();
      const token = userType === "admin" 
        ? localStorage.getItem("adminToken") 
        : localStorage.getItem("employeeToken");
      
      if (!token) {
        router.push("/login");
        return;
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
        if (userType === "admin") {
          localStorage.removeItem("adminToken");
        } else {
          localStorage.removeItem("employeeToken");
        }
        router.push("/login");
        return;
      }

      const data = await response.json();
      
      if (data.user || (data && typeof data === 'object' && (data.email || data._id))) {
        const userData = data.user || data;
        
        // নামের জন্য fallback তৈরি করুন
        const nameParts = (userData.name || userData.email || "").split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";
        
        setUser(userData);
        
        setProfileForm({
          firstName: userData.firstName || firstName || "",
          lastName: userData.lastName || lastName || "",
          phone: userData.phone || "",
          address: userData.address || userData.address || "Dhaka, Bangladesh",
          department: userData.department || "",
          designation: userData.designation || "",
          employeeId: userData.employeeId || "",
          salaryType: userData.salaryType || "",
          rate: userData.rate || "",
          joiningDate: userData.joiningDate || "",
          // এডমিনের জন্য অতিরিক্ত ডাটা
          companyName: userType === "admin" ? (userData.companyName || "") : "",
          position: userType === "admin" ? (userData.position || "") : "",
          adminLevel: userType === "admin" ? (userData.adminLevel || "") : "",
          permissions: userType === "admin" ? (userData.permissions || []) : []
        });
      } else {
        console.error("Invalid response data:", data);
        toast.error("Failed to load user data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user sessions
  const fetchUserSessions = async () => {
    try {
      const userType = getUserType();
      const token = userType === "admin" 
        ? localStorage.getItem("adminToken") 
        : localStorage.getItem("employeeToken");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserSessions();
  }, []);

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      const userType = getUserType();
      const token = userType === "admin" 
        ? localStorage.getItem("adminToken") 
        : localStorage.getItem("employeeToken");
      
      const endpoint = userType === "admin" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/updateAdminProfile`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/updateProfile`;

      const updateData = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        address: profileForm.address,
        department: profileForm.department,
        designation: profileForm.designation,
        employeeId: profileForm.employeeId,
        salaryType: profileForm.salaryType,
        rate: profileForm.rate,
        joiningDate: profileForm.joiningDate
      };

      // শুধু এডমিনের জন্য অতিরিক্ত ফিল্ড যোগ করুন
      if (userType === "admin") {
        updateData.companyName = profileForm.companyName;
        updateData.position = profileForm.position;
        updateData.adminLevel = profileForm.adminLevel;
        updateData.permissions = profileForm.permissions;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        fetchUserProfile();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const userType = getUserType();
      const token = userType === "admin" 
        ? localStorage.getItem("adminToken") 
        : localStorage.getItem("employeeToken");
      
      const endpoint = userType === "admin" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/change-password`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // Request password reset from admin
  const handleRequestPasswordReset = async () => {
    if (!confirm("Send password reset request to admin?")) return;

    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?._id,
          reason: "Requested password reset by employee",
          requestedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset request sent to admin!");
      } else {
        toast.error(data.message || "Failed to send request");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // View reset history
  const handleViewResetHistory = async () => {
    try {
      const userType = getUserType();
      const token = userType === "admin" 
        ? localStorage.getItem("adminToken") 
        : localStorage.getItem("employeeToken");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password-reset-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Reset history:", data);
        toast.success("Reset history loaded");
      } else {
        toast.error("Failed to load reset history");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // Logout from all sessions
  const handleLogoutAllSessions = async () => {
    if (!confirm("Are you sure you want to logout from all devices?")) return;

    try {
      const userType = getUserType();
      const token = userType === "admin" 
        ? localStorage.getItem("adminToken") 
        : localStorage.getItem("employeeToken");
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Logged out from all devices");
      fetchUserSessions();
    } catch (error) {
      toast.error("Failed to logout from all sessions");
    }
  };

  // Terminate specific session
  const handleTerminateSession = async (sessionId) => {
    if (!confirm("Terminate this session?")) return;

    try {
      const userType = getUserType();
      const token = userType === "admin" 
        ? localStorage.getItem("adminToken") 
        : localStorage.getItem("employeeToken");
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/terminate-session/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Session terminated");
      fetchUserSessions();
    } catch (error) {
      toast.error("Failed to terminate session");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your personal information and security</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronRight className="rotate-180" size={18} />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-xl">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.firstName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : getUserType() === "admin" ? (
                      <Shield className="text-purple-600" size={48} />
                    ) : (
                      <User className="text-purple-600" size={48} />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {user?.firstName || user?.name?.split(' ')[0] || user?.email?.split('@')[0]} {user?.lastName || user?.name?.split(' ').slice(1).join(' ') || ''}
                  </h2>
                  <p className="text-purple-100 mt-1">{user?.email}</p>
                  <div className="mt-3">
                    <span className={`px-3 py-1 text-white rounded-full text-sm font-medium ${
                      getUserType() === "admin" 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500" 
                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                    }`}>
                      {getUserType() === "admin" ? "ADMINISTRATOR" : "EMPLOYEE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Account Status</p>
                        <p className={`text-sm font-semibold ${
                          user?.status === "active" ? "text-green-600" : "text-red-600"
                        }`}>
                          {user?.status?.toUpperCase() || "ACTIVE"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Designation</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.designation || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Department</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.department || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {getUserType() === "admin" && user?.adminLevel && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="text-indigo-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Admin Level</p>
                          <p className="text-sm font-semibold text-indigo-600 capitalize">
                            {user?.adminLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <History className="text-gray-600" size={20} />
                      <span className="font-medium text-gray-700">Session History</span>
                    </div>
                    <span className="text-sm text-gray-500">{sessions.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("security")}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="text-gray-600" size={20} />
                      <span className="font-medium text-gray-700">Security Settings</span>
                    </div>
                    <span className="text-sm text-purple-600">Update</span>
                  </button>

                  {getUserType() === "admin" && (
                    <button
                      onClick={() => router.push("/admin/users")}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="text-gray-600" size={20} />
                        <span className="font-medium text-gray-700">Manage Users</span>
                      </div>
                      <ChevronRight className="text-gray-400" size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === "personal"
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === "security"
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab("sessions")}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === "sessions"
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Sessions
                </button>
              </div>

              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                      <p className="text-gray-600 mt-1">Update your personal details</p>
                    </div>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditMode(false);
                            // Reset form to original values
                            fetchUserProfile();
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {/* View Mode - Beautiful Profile Display */}
                  {!editMode ? (
                    <div className="space-y-6">
                      {/* Basic Info Card */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <User className="text-purple-600" size={22} />
                            </div>
                            Basic Information
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Full Name</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {user?.firstName || user?.name?.split(' ')[0] || user?.email?.split('@')[0]} 
                                {user?.lastName && ` ${user.lastName}`}
                                {!user?.lastName && user?.name?.split(' ').slice(1).join(' ') && ` ${user.name.split(' ').slice(1).join(' ')}`}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Email Address</p>
                              <div className="flex items-center gap-2">
                                <Mail className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                  Verified
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                              <div className="flex items-center gap-2">
                                <Phone className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{user?.phone || "Not provided"}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 mb-1">address</p>
                              <div className="flex items-center gap-2">
                                <MapPin className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{user?.address || user?.address || "Not provided"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Information Card (শুধু এডমিন দেখতে পাবে) */}
                      {getUserType() === "admin" && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <Shield className="text-indigo-600" size={22} />
                            </div>
                            Administrator Information
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Company</p>
                                <div className="flex items-center gap-2">
                                  <Building className="text-gray-400" size={16} />
                                  <p className="text-lg font-semibold text-gray-900">
                                    {user?.companyName || "Not specified"}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Admin Position</p>
                                <div className="flex items-center gap-2">
                                  <BadgeCheck className="text-gray-400" size={16} />
                                  <p className="text-lg font-semibold text-gray-900">
                                    {user?.position || "Administrator"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Admin Level</p>
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                                  user?.adminLevel === 'super' ? 'bg-purple-50 text-purple-800' :
                                  user?.adminLevel === 'admin' ? 'bg-blue-50 text-blue-800' :
                                  user?.adminLevel === 'manager' ? 'bg-green-50 text-green-800' :
                                  'bg-gray-50 text-gray-800'
                                }`}>
                                  <ShieldCheck className={
                                    user?.adminLevel === 'super' ? 'text-purple-600' :
                                    user?.adminLevel === 'admin' ? 'text-blue-600' :
                                    user?.adminLevel === 'manager' ? 'text-green-600' :
                                    'text-gray-600'
                                  } size={18} />
                                  <p className="font-semibold capitalize">{user?.adminLevel || 'Admin'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Permissions</p>
                                <div className="flex flex-wrap gap-2">
                                  {user?.permissions?.map((perm, index) => (
                                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                                      {perm}
                                    </span>
                                  )) || (
                                    <span className="text-gray-500">No specific permissions</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Professional Info Card */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Briefcase className="text-blue-600" size={22} />
                          </div>
                          Professional Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Department</p>
                              <div className="flex items-center gap-2">
                                <Building className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{user?.department || "Not assigned"}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Designation</p>
                              <div className="flex items-center gap-2">
                                <Briefcase className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{user?.designation || "Not assigned"}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Employee ID</p>
                              <div className="flex items-center gap-2">
                                <Hash className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{user?.employeeId || "Not assigned"}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Joining Date</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{formatDate(user?.joiningDate)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Salary Info Card (এমপ্লয়ির জন্য শো করবে) */}
                      {getUserType() === "employee" && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <CreditCard className="text-green-600" size={22} />
                            </div>
                            Salary Information
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Salary Type</p>
                              <div className="flex items-center gap-2">
                                <CreditCard className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900 capitalize">{user?.salaryType || "Not set"}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Rate</p>
                              <div className="flex items-center gap-2">
                                <DollarSign className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">
                                  ৳{formatCurrency(user?.rate)} {user?.salaryType ? `/${user.salaryType}` : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Account Status Card */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <ShieldCheck className="text-gray-600" size={22} />
                          </div>
                          Account Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Account Status</p>
                              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                                user?.status === 'active' ? 'bg-green-50 text-green-800' :
                                user?.status === 'inactive' ? 'bg-red-50 text-red-800' :
                                'bg-gray-50 text-gray-800'
                              }`}>
                                {user?.status === 'active' ? (
                                  <CheckCircle className="text-green-600" size={18} />
                                ) : (
                                  <AlertCircle className="text-red-600" size={18} />
                                )}
                                <p className="font-semibold capitalize">{user?.status || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Account Role</p>
                              <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-800 rounded-xl">
                                <Shield className="text-purple-600" size={18} />
                                <p className="font-semibold capitalize">{user?.role || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Account Created</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{formatDate(user?.createdAt)}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                              <div className="flex items-center gap-2">
                                <Activity className="text-gray-400" size={16} />
                                <p className="text-lg font-semibold text-gray-900">{formatDate(user?.updatedAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode - Input Forms */
                    <div className="space-y-6">
                      {/* Basic Info Section */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email Section (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                          <Mail className="text-gray-400" size={20} />
                          <span className="text-gray-900">{user?.email}</span>
                          <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                      </div>

                      {/* Contact Info Section */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                              placeholder="+8801XXXXXXXXX"
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              address
                            </label>
                            <input
                              type="text"
                              value={profileForm.address}
                              onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                              placeholder="City, Country"
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Admin Information Section (শুধু এডমিনের জন্য) */}
                      {getUserType() === "admin" && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                            <Shield size={18} />
                            Administrator Information
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name
                              </label>
                              <input
                                type="text"
                                value={profileForm.companyName}
                                onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Position
                              </label>
                              <input
                                type="text"
                                value={profileForm.position}
                                onChange={(e) => setProfileForm({...profileForm, position: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Level
                              </label>
                              <select
                                value={profileForm.adminLevel}
                                onChange={(e) => setProfileForm({...profileForm, adminLevel: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              >
                                <option value="">Select Level</option>
                                <option value="super">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="moderator">Moderator</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Permissions
                              </label>
                              <input
                                type="text"
                                value={profileForm.permissions.join(', ')}
                                onChange={(e) => setProfileForm({...profileForm, permissions: e.target.value.split(',').map(p => p.trim())})}
                                placeholder="user:read, user:write, etc."
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                              <p className="text-xs text-gray-500 mt-1">Comma separated values</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Professional Info Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <Briefcase size={18} />
                          Professional Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Department
                            </label>
                            <input
                              type="text"
                              value={profileForm.department}
                              onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Designation
                            </label>
                            <input
                              type="text"
                              value={profileForm.designation}
                              onChange={(e) => setProfileForm({...profileForm, designation: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Employee ID
                            </label>
                            <input
                              type="text"
                              value={profileForm.employeeId}
                              onChange={(e) => setProfileForm({...profileForm, employeeId: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Joining Date
                            </label>
                            <input
                              type="date"
                              value={profileForm.joiningDate ? new Date(profileForm.joiningDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => setProfileForm({...profileForm, joiningDate: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Salary Info Section (এমপ্লয়ির জন্য) */}
                      {getUserType() === "employee" && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                            <CreditCard size={18} />
                            Salary Information
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Salary Type
                              </label>
                              <select
                                value={profileForm.salaryType}
                                onChange={(e) => setProfileForm({...profileForm, salaryType: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                              >
                                <option value="">Select Type</option>
                                <option value="monthly">Monthly</option>
                                <option value="hourly">Hourly</option>
                                <option value="weekly">Weekly</option>
                                <option value="yearly">Yearly</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rate (৳)
                              </label>
                              <input
                                type="number"
                                value={profileForm.rate}
                                onChange={(e) => setProfileForm({...profileForm, rate: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                    <p className="text-gray-600 mt-1">Manage your password and security preferences</p>
                  </div>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Lock className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Change Password</h4>
                            <p className="text-sm text-gray-600">Update your current password</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleChangePassword}
                          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Password Reset Request (এমপ্লয়ির জন্য) */}
                    {getUserType() === "employee" && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Key className="text-blue-600" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Password Reset Request</h4>
                              <p className="text-sm text-gray-600">Request admin to reset your password</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600">
                              If you've forgotten your password, you can request an administrator to reset it for you. An email notification will be sent to the admin.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                              onClick={handleRequestPasswordReset}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Shield size={18} />
                              Request Password Reset
                            </button>
                            
                            <button
                              onClick={handleViewResetHistory}
                              className="w-full border-2 border-blue-200 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <History size={18} />
                              View History
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Security Settings (এডমিনের জন্য) */}
                    {getUserType() === "admin" && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <ShieldCheck className="text-indigo-600" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Admin Security Settings</h4>
                              <p className="text-sm text-gray-600">Administrator specific security options</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => router.push("/admin/users")}
                              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Users size={18} />
                              Manage Users
                            </button>
                            
                            <button
                              onClick={() => router.push("/admin/audit-logs")}
                              className="w-full border-2 border-indigo-200 text-indigo-600 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <History size={18} />
                              View Audit Logs
                            </button>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold text-indigo-600">Note:</span> As an administrator, you have additional privileges to manage system users and security settings. Use these features responsibly.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Session Management */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <History className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Session Management</h4>
                            <p className="text-sm text-gray-600">Manage your active sessions</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Smartphone className="text-gray-400" size={20} />
                            <div>
                              <p className="font-medium text-gray-900">Current Session</p>
                              <p className="text-sm text-gray-500">This device • Just now</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        </div>

                        <button
                          onClick={handleLogoutAllSessions}
                          className="w-full py-3 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                          Logout From All Devices
                        </button>
                      </div>
                    </div>

                    {/* Password Guidelines */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Password Guidelines
                      </h5>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-green-600 mt-0.5" size={14} />
                          <p className="text-sm text-gray-600">Minimum 6 characters in length</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-green-600 mt-0.5" size={14} />
                          <p className="text-sm text-gray-600">Include numbers and special characters for better security</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-green-600 mt-0.5" size={14} />
                          <p className="text-sm text-gray-600">Avoid using personal information in passwords</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-green-600 mt-0.5" size={14} />
                          <p className="text-sm text-gray-600">Change your password every 90 days for optimal security</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === "sessions" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Session History</h3>
                      <p className="text-gray-600 mt-1">View and manage your login sessions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {sessions.filter(s => !s.logoutAt).length} active • {sessions.length} total
                      </span>
                    </div>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-700 font-medium">No session history found</p>
                      <p className="text-gray-500 text-sm mt-1">Your login sessions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session._id}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-white transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                session.logoutAt ? "bg-gray-300" : "bg-green-500 animate-pulse"
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {session.device?.substring(0, 50)}...
                                </p>
                                <p className="text-sm text-gray-500">{session.ip}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(session.loginAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(session.loginAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">
                                <Clock size={14} className="inline mr-1" />
                                Login: {new Date(session.loginAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              {session.logoutAt && (
                                <span className="text-gray-600">
                                  <Clock size={14} className="inline mr-1" />
                                  Logout: {new Date(session.logoutAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              )}
                            </div>

                            {!session.logoutAt && session._id !== sessions[0]?._id && (
                              <button
                                onClick={() => handleTerminateSession(session._id)}
                                className="px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
                              >
                                Terminate
                              </button>
                            )}
                          </div>

                          {session.activities && session.activities.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-700 mb-2">Activities:</p>
                              <div className="space-y-1">
                                {session.activities.slice(0, 3).map((activity, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                    <Activity size={12} />
                                    <span>{activity.action}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">
                                      {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </div>
                                ))}
                                {session.activities.length > 3 && (
                                  <p className="text-xs text-purple-600 mt-1">
                                    +{session.activities.length - 3} more activities
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}