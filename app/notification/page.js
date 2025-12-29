"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Lock,
  Filter,
  Search,
  MoreVertical,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  Check,
  X,
  Send,
  MessageSquare
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Password Reset Request State
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);
  const [pendingResetRequests, setPendingResetRequests] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tempPassword, setTempPassword] = useState("");

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        
        // Calculate stats
        const stats = {
          total: data.notifications?.length || 0,
          pending: data.notifications?.filter(n => n.status === 'pending')?.length || 0,
          approved: data.notifications?.filter(n => n.status === 'approved')?.length || 0,
          rejected: data.notifications?.filter(n => n.status === 'rejected')?.length || 0
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch password reset requests
  const fetchPasswordResetRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/password-reset-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPasswordResetRequests(data.requests || []);
        setPendingResetRequests(data.requests?.filter(r => r.status === 'pending')?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch reset requests:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchPasswordResetRequests();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchPasswordResetRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter notifications based on active tab and search
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab !== "all" && notification.type !== activeTab) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.message?.toLowerCase().includes(searchLower) ||
        notification.user?.name?.toLowerCase().includes(searchLower) ||
        notification.user?.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Filter password reset requests
  const filteredResetRequests = passwordResetRequests.filter(request => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.user?.firstName?.toLowerCase().includes(searchLower) ||
        request.user?.lastName?.toLowerCase().includes(searchLower) ||
        request.user?.email?.toLowerCase().includes(searchLower) ||
        request.user?.department?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Handle notification action
  const handleNotificationAction = async (notificationId, action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notifications/${notificationId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success(`Notification ${action}ed successfully`);
        fetchNotifications();
      } else {
        toast.error(`Failed to ${action} notification`);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // Handle password reset request action
  const handleResetRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem("token");
      
      if (action === 'approve') {
        // Show modal for password generation
        const request = passwordResetRequests.find(r => r._id === requestId);
        setSelectedRequest(request);
        setShowResetModal(true);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reject-password-reset/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: "Rejected by admin" })
      });

      if (response.ok) {
        toast.success("Request rejected successfully");
        fetchPasswordResetRequests();
        fetchNotifications();
      } else {
        toast.error("Failed to reject request");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // Handle approve with password
  const handleApproveWithPassword = async () => {
    if (!tempPassword) {
      toast.error("Please enter a temporary password");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/approve-password-reset/${selectedRequest._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: tempPassword })
      });

      if (response.ok) {
        toast.success("Password reset approved successfully");
        setShowResetModal(false);
        setTempPassword("");
        setSelectedRequest(null);
        fetchPasswordResetRequests();
        fetchNotifications();
      } else {
        toast.error("Failed to approve request");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(password);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notifications/mark-all-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notifications/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("All notifications cleared");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Bell className="text-white" size={24} />
                </div>
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">Manage system notifications and requests</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Check size={16} />
                Mark All as Read
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Notifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingResetRequests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Rejected</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Password Reset Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Lock className="text-red-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Password Reset Requests</h3>
                      <p className="text-gray-600 text-sm">Approve or reject employee password reset requests</p>
                    </div>
                  </div>
                  {pendingResetRequests > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {pendingResetRequests} Pending
                    </span>
                  )}
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Filter size={16} />
                    Filter
                  </button>
                </div>

                {filteredResetRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-700 font-medium">No password reset requests</p>
                    <p className="text-gray-500 text-sm mt-1">All requests are handled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResetRequests.map((request) => (
                      <div
                        key={request._id}
                        className={`bg-gray-50 rounded-xl p-4 border transition-all hover:shadow-md ${
                          request.status === 'pending' 
                            ? 'border-yellow-200 hover:border-yellow-300' 
                            : request.status === 'approved'
                            ? 'border-green-200 hover:border-green-300'
                            : 'border-red-200 hover:border-red-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="text-blue-600" size={20} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.user?.firstName} {request.user?.lastName}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                  <Mail size={14} />
                                  {request.user?.email}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                  <Building size={14} />
                                  {request.user?.department}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              request.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status?.toUpperCase()}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Designation</p>
                            <p className="font-medium text-gray-900">{request.user?.designation || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                            <p className="font-medium text-gray-900">{request.user?.phone || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Request Reason</p>
                          <p className="text-gray-900">{request.reason || 'Forgot password'}</p>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleResetRequestAction(request._id, 'approve')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleResetRequestAction(request._id, 'reject')}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}

                        {request.status === 'approved' && request.approvedAt && (
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Approved on {new Date(request.approvedAt).toLocaleDateString()}</span>
                            <span>Temporary password sent via email</span>
                          </div>
                        )}

                        {request.status === 'rejected' && request.rejectedAt && (
                          <div className="text-sm text-gray-600">
                            Rejected on {new Date(request.rejectedAt).toLocaleDateString()}
                            {request.rejectionReason && (
                              <p className="text-red-600 mt-1">Reason: {request.rejectionReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bell className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                      <p className="text-gray-600 text-sm">System notifications and alerts</p>
                    </div>
                  </div>
                </div>

                {/* Notification Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 py-2 text-center text-sm font-medium ${
                      activeTab === "all"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("system")}
                    className={`flex-1 py-2 text-center text-sm font-medium ${
                      activeTab === "system"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    System
                  </button>
                  <button
                    onClick={() => setActiveTab("user")}
                    className={`flex-1 py-2 text-center text-sm font-medium ${
                      activeTab === "user"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    User
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="text-gray-400 mx-auto mb-3" size={32} />
                      <p className="text-gray-700 font-medium">No notifications</p>
                      <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 rounded-lg border ${
                          notification.unread
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'system' 
                              ? 'bg-purple-100 text-purple-600'
                              : notification.type === 'user'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {notification.type === 'system' ? (
                              <Bell size={16} />
                            ) : notification.type === 'user' ? (
                              <User size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 text-sm">
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            {notification.user && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <User size={12} />
                                <span>{notification.user.name}</span>
                                {notification.user.email && (
                                  <>
                                    <span>•</span>
                                    <Mail size={12} />
                                    <span>{notification.user.email}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Approval Modal */}
      {showResetModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Lock className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Approve Password Reset</h3>
                  <p className="text-gray-600 text-sm">Set temporary password for {selectedRequest.user?.firstName}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
                  <User className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.user?.firstName} {selectedRequest.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedRequest.user?.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-32"
                      placeholder="Generate or enter password"
                    />
                    <button
                      onClick={generateRandomPassword}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This password will be sent to the employee via email
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Important Notice</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        The employee will receive this temporary password via email. 
                        They must use it to login and immediately change their password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setTempPassword("");
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveWithPassword}
                  disabled={!tempPassword}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Password & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}