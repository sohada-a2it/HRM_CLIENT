"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  RefreshCw, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  CalendarDays,
  ChevronDown,
  MoreVertical,
  Eye,
  EyeOff,
  Search,
  FileText,
  ClockIcon,
  TrendingUp,
  Users,
  Activity,
  Sun,
  Moon,
  Check,
  XCircle,
  AlertTriangle,
  User,
  Briefcase,
  Home,
  Coffee,
  Shield
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    leaveType: "Sick",
    payStatus: "Paid",
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    paid: 0,
    unpaid: 0
  });

  // Mock data for demo
  const mockLeaves = [
    {
      _id: "1",
      employee: { _id: "emp1", name: "John Doe", department: "Engineering" },
      leaveType: "Sick",
      payStatus: "Paid",
      startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      reason: "Fever and cold",
      status: "Pending",
      totalDays: 2,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: "2",
      employee: { _id: "emp2", name: "Jane Smith", department: "HR" },
      leaveType: "Annual",
      payStatus: "Paid",
      startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      reason: "Vacation with family",
      status: "Approved",
      totalDays: 3,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      _id: "3",
      employee: { _id: "emp3", name: "Mike Johnson", department: "Sales" },
      leaveType: "Casual",
      payStatus: "Unpaid",
      startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 12).toISOString(),
      reason: "Personal work",
      status: "Pending",
      totalDays: 3,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      _id: "4",
      employee: { _id: "emp4", name: "Sarah Williams", department: "Marketing" },
      leaveType: "Emergency",
      payStatus: "Paid",
      startDate: new Date(Date.now() - 86400000 * 15).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 14).toISOString(),
      reason: "Family emergency",
      status: "Approved",
      totalDays: 2,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      _id: "5",
      employee: { _id: "emp5", name: "David Brown", department: "Finance" },
      leaveType: "Other",
      payStatus: "HalfPaid",
      startDate: new Date(Date.now() - 86400000 * 8).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 7).toISOString(),
      reason: "House shifting",
      status: "Rejected",
      totalDays: 2,
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    }
  ];

  // Check user role
  useEffect(() => {
    const checkUserRole = () => {
      const adminToken = localStorage.getItem('token');
      const employeeToken = localStorage.getItem('employeeToken');
      
      if (adminToken) {
        setIsAdmin(true);
      } else if (employeeToken) {
        setIsAdmin(false);
      }
    };
    
    checkUserRole();
  }, []);

  // Fetch leaves
  const fetchLeaves = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Loading leaves...");
    
    try {
      // Here you would call your actual API
      // const res = await api.get("/leaves");
      
      // For now, use mock data
      setTimeout(() => {
        setLeaves(mockLeaves);
        calculateStats(mockLeaves);
        toast.dismiss(loadingToast);
        toast.success(`Loaded ${mockLeaves.length} leave requests`, {
          icon: '📋',
          duration: 3000,
        });
      }, 1000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error loading leaves");
      console.error("Fetch leaves error:", error);
      
      // Fallback to mock data
      setLeaves(mockLeaves);
      calculateStats(mockLeaves);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (leavesData) => {
    const stats = {
      pending: leavesData.filter(l => l.status === "Pending").length,
      approved: leavesData.filter(l => l.status === "Approved").length,
      rejected: leavesData.filter(l => l.status === "Rejected").length,
      total: leavesData.length,
      paid: leavesData.filter(l => l.payStatus === "Paid").length,
      unpaid: leavesData.filter(l => l.payStatus === "Unpaid" || l.payStatus === "HalfPaid").length
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Request leave
  const handleRequestLeave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    const loadingToast = toast.loading("Submitting leave request...");
    
    try {
      // Here you would call your API
      // const res = await api.post("/leaves/request", form);
      
      // Mock API call
      setTimeout(() => {
        const newLeave = {
          _id: Date.now().toString(),
          employee: { 
            _id: "currentUser", 
            name: "Current User",
            department: localStorage.getItem('department') || "General" 
          },
          ...form,
          status: "Pending",
          totalDays: Math.ceil(
            (new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)
          ) + 1,
          createdAt: new Date().toISOString(),
        };
        
        setLeaves(prev => [newLeave, ...prev]);
        calculateStats([newLeave, ...leaves]);
        
        toast.dismiss(loadingToast);
        toast.success("Leave request submitted successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        setShowRequestModal(false);
        setForm({
          leaveType: "Sick",
          payStatus: "Paid",
          startDate: "",
          endDate: "",
          reason: ""
        });
      }, 1500);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error submitting leave request");
      console.error("Request leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Approve leave
  const handleApproveLeave = async () => {
    if (!isAdmin) {
      toast.error("Only admin can approve leaves");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Approving leave...");
    
    try {
      // Here you would call your API
      // const res = await api.patch(`/leaves/${selectedLeave._id}/approve`);
      
      // Mock API call
      setTimeout(() => {
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id 
            ? { ...leave, status: "Approved" }
            : leave
        ));
        
        calculateStats(leaves.map(leave => 
          leave._id === selectedLeave._id 
            ? { ...leave, status: "Approved" }
            : leave
        ));
        
        toast.dismiss(loadingToast);
        toast.success("Leave approved successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        setShowApproveModal(false);
        setSelectedLeave(null);
      }, 1000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error approving leave");
      console.error("Approve leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Reject leave
  const handleRejectLeave = async () => {
    if (!isAdmin) {
      toast.error("Only admin can reject leaves");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Rejecting leave...");
    
    try {
      // Here you would call your API
      // const res = await api.patch(`/leaves/${selectedLeave._id}/reject`);
      
      // Mock API call
      setTimeout(() => {
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id 
            ? { ...leave, status: "Rejected" }
            : leave
        ));
        
        calculateStats(leaves.map(leave => 
          leave._id === selectedLeave._id 
            ? { ...leave, status: "Rejected" }
            : leave
        ));
        
        toast.dismiss(loadingToast);
        toast.success("Leave rejected successfully!", {
          icon: '❌',
          duration: 3000,
        });
        
        setShowRejectModal(false);
        setSelectedLeave(null);
      }, 1000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error rejecting leave");
      console.error("Reject leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Filter leaves
  const filteredLeaves = leaves.filter(leave => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      leave.employee.name.toLowerCase().includes(searchLower) ||
      leave.leaveType.toLowerCase().includes(searchLower) ||
      leave.reason.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || leave.status === statusFilter;
    const matchesType = typeFilter === "all" || leave.leaveType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate days between dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get leave type icon
  const getLeaveTypeIcon = (type) => {
    switch(type) {
      case 'Sick': return <Activity size={16} className="text-red-500" />;
      case 'Annual': return <Sun size={16} className="text-yellow-500" />;
      case 'Casual': return <Coffee size={16} className="text-blue-500" />;
      case 'Emergency': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'Maternity': return <Home size={16} className="text-pink-500" />;
      case 'Paternity': return <Briefcase size={16} className="text-indigo-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  // Get pay status color
  const getPayStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'HalfPaid': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
                  <p className="text-gray-500 text-sm mt-1">Submit a new leave request</p>
                </div>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setForm({
                      leaveType: "Sick",
                      payStatus: "Paid",
                      startDate: "",
                      endDate: "",
                      reason: ""
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleRequestLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type *
                </label>
                <select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Status *
                </label>
                <select
                  name="payStatus"
                  value={form.payStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="HalfPaid">Half Paid</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Brief reason for leave..."
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestModal(false);
                      setForm({
                        leaveType: "Sick",
                        payStatus: "Paid",
                        startDate: "",
                        endDate: "",
                        reason: ""
                      });
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
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar size={18} />
                        Request Leave
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedLeave && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Approve Leave</h2>
                  <p className="text-gray-500 text-sm mt-1">Confirm leave approval</p>
                </div>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedLeave(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Approve this leave?</h3>
                  <p className="text-sm text-gray-500">
                    {selectedLeave.employee.name}'s {selectedLeave.leaveType} Leave
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{selectedLeave.totalDays || calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{selectedLeave.leaveType}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedLeave(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveLeave}
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Approve Leave
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedLeave && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reject Leave</h2>
                  <p className="text-gray-500 text-sm mt-1">Confirm leave rejection</p>
                </div>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedLeave(null);
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
                  <XCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reject this leave?</h3>
                  <p className="text-sm text-gray-500">
                    {selectedLeave.employee.name}'s {selectedLeave.leaveType} Leave
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  placeholder="Enter reason for rejection..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedLeave(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectLeave}
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X size={18} />
                      Reject Leave
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
                Leave Management
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin ? "Manage employee leave requests" : "Request and track your leaves"}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchLeaves}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                Request Leave
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Leaves</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1">All leave requests</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
                  <p className="text-xs text-yellow-500 mt-1">Awaiting approval</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Approved</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
                  <p className="text-xs text-green-500 mt-1">Approved leaves</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Paid Leaves</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.paid}</p>
                  <p className="text-xs text-blue-500 mt-1">With salary</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Notice */}
        {isAdmin && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Admin Mode Active</h3>
                  <p className="text-gray-600 mt-1">
                    You can approve or reject leave requests. Approving leaves will automatically update attendance records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Leaves List */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Leave Requests</h2>
                    <p className="text-gray-500 text-sm">
                      {filteredLeaves.length} of {leaves.length} requests
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search leaves..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                      >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                      >
                        <option value="all">All Types</option>
                        <option value="Sick">Sick</option>
                        <option value="Casual">Casual</option>
                        <option value="Annual">Annual</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaves List */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading leaves...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
                  </div>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                      <CalendarDays className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No leave requests found</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                        ? 'Try adjusting your search or filters' 
                        : 'Start by requesting your first leave'}
                    </p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Request Leave
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredLeaves.map((leave) => {
                    const totalDays = leave.totalDays || calculateDays(leave.startDate, leave.endDate);
                    const isUpcoming = new Date(leave.startDate) > new Date();
                    
                    return (
                      <div 
                        key={leave._id}
                        className="group p-6 hover:bg-gray-50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              leave.status === 'Approved' ? 'bg-green-100' :
                              leave.status === 'Rejected' ? 'bg-red-100' :
                              'bg-yellow-100'
                            }`}>
                              {getLeaveTypeIcon(leave.leaveType)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {leave.employee.name}
                                  {isAdmin && (
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                      ({leave.employee.department})
                                    </span>
                                  )}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                                  {leave.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPayStatusColor(leave.payStatus)}`}>
                                  {leave.payStatus}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ClockIcon size={14} />
                                  {totalDays} days
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText size={14} />
                                  {leave.leaveType} Leave
                                </span>
                              </div>
                              
                              <p className="text-gray-700 text-sm">
                                {leave.reason}
                              </p>
                              
                              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                <span>Requested: {formatDateTime(leave.createdAt)}</span>
                                {isUpcoming && leave.status === 'Approved' && (
                                  <span className="text-green-600 font-medium">• Upcoming</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {isAdmin && leave.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setShowApproveModal(true);
                                  }}
                                  className="px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                                >
                                  <Check size={16} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setShowRejectModal(true);
                                  }}
                                  className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                                >
                                  <X size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {!isAdmin && leave.status === 'Pending' && (
                              <button
                                onClick={() => toast.info("Leave request is pending approval", { icon: '⏳' })}
                                className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium"
                              >
                                Pending Approval
                              </button>
                            )}
                            
                            {leave.status === 'Approved' && (
                              <div className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium flex items-center gap-1">
                                <CheckCircle size={14} />
                                Approved
                              </div>
                            )}
                            
                            {leave.status === 'Rejected' && (
                              <div className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-1">
                                <XCircle size={14} />
                                Rejected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Leave Summary</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {isAdmin ? "Organization overview" : "Your leave balance"}
                </p>
              </div>

              <div className="p-6">
                {/* Leave Balance (For Employees) */}
                {!isAdmin && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Leave Balance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="text-gray-700">Sick Leave</span>
                        <span className="font-bold text-blue-600">14/15 days</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                        <span className="text-gray-700">Annual Leave</span>
                        <span className="font-bold text-green-600">20/20 days</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <span className="text-gray-700">Casual Leave</span>
                        <span className="font-bold text-purple-600">10/10 days</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {isAdmin ? "Organization Stats" : "Your Leave Stats"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Requests</span>
                      <span className="font-semibold text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-semibold text-yellow-600">{stats.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Approved</span>
                      <span className="font-semibold text-green-600">{stats.approved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rejected</span>
                      <span className="font-semibold text-red-600">{stats.rejected}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paid Leaves</span>
                      <span className="font-semibold text-blue-600">{stats.paid}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Unpaid Leaves</span>
                      <span className="font-semibold text-gray-600">{stats.unpaid}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Plus size={16} className="text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Request New Leave</span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 rotate-270" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Download size={16} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Download Leave Report</span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 rotate-270" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-300 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <CalendarDays size={16} className="text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">View Leave Calendar</span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 rotate-270" />
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={() => toast.info("Policy management coming soon!", { icon: '⚙️' })}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Shield size={16} className="text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Manage Leave Policies</span>
                        </div>
                        <ChevronDown size={16} className="text-gray-400 rotate-270" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Upcoming Approved Leaves */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Approved Leaves</h3>
                  <div className="space-y-3">
                    {leaves
                      .filter(l => l.status === 'Approved' && new Date(l.startDate) > new Date())
                      .slice(0, 3)
                      .map(leave => (
                        <div key={leave._id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {isAdmin ? leave.employee.name : "Your Leave"}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                              {calculateDays(leave.startDate, leave.endDate)} days
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </div>
                        </div>
                      ))}
                    
                    {leaves.filter(l => l.status === 'Approved' && new Date(l.startDate) > new Date()).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No upcoming approved leaves</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}