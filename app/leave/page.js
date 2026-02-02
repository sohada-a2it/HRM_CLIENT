"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  Eye,
  Search,
  FileText,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Building,
  Activity,
  Sun,
  Coffee,
  AlertTriangle,
  Home,
  Briefcase,
  Check,
  XCircle,
  User,
  List,
  Grid,
  FilterX,
  CheckSquare,
  Users,
  DownloadCloud,
  CalendarDays,
  UserPlus
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [leaveStats, setLeaveStats] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedLeaves, setSelectedLeaves] = useState([]);

  // Form state
  const [form, setForm] = useState({
    leaveType: "Sick",
    payStatus: "Paid",
    startDate: "",
    endDate: "",
    reason: "",
    employeeId: "",
    status: "Pending"
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    leaveType: "",
    payStatus: "",
    startDate: "",
    endDate: "",
    reason: "",
    status: ""
  });

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    paid: 0,
    unpaid: 0,
    halfPaid: 0
  });

  // API Base URL - FIXED
  const API_BASE_URL = useMemo(() => 
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`, 
  []);

  // Calculate days between dates - useCallback
  const calculateDays = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch (error) {
      return 0;
    }
  }, []);

  // Get auth token - useCallback
  const getAuthToken = useCallback(() => {
    const adminToken = localStorage.getItem('adminToken');
    const employeeToken = localStorage.getItem('employeeToken');
    
    if (adminToken) return adminToken;
    if (employeeToken) return employeeToken;
    return null;
  }, []);

  // Get user role - useCallback
  const getUserRole = useCallback(() => {
    const adminToken = localStorage.getItem('adminToken');
    const employeeToken = localStorage.getItem('employeeToken');
    
    if (adminToken) return 'admin';
    if (employeeToken) return 'employee';
    return null;
  }, []);

  // Calculate statistics - useCallback
  const calculateStats = useCallback((leavesData) => {
    const newStats = {
      pending: leavesData.filter(l => l.status === "Pending").length,
      approved: leavesData.filter(l => l.status === "Approved").length,
      rejected: leavesData.filter(l => l.status === "Rejected").length,
      total: leavesData.length,
      paid: leavesData.filter(l => l.payStatus === "Paid").length,
      unpaid: leavesData.filter(l => l.payStatus === "Unpaid").length,
      halfPaid: leavesData.filter(l => l.payStatus === "HalfPaid").length
    };
    setStats(newStats);
  }, []);

  // Transform leave data - useCallback
// Transform leave data - UPDATED to include all employee info
const transformLeaveData = useCallback((leave) => {
  const employeeData = leave.employee || {};
  const employeeName = leave.employeeName || 
    `${employeeData.firstName || ''} ${employeeData.lastName || ''}`.trim() || 'N/A';
  
  return {
    ...leave,
    _id: leave._id || leave.id || '',
    employeeName: employeeName,
    employeeId: leave.employeeId || employeeData.employeeId || '',
    department: leave.department || employeeData.department || 'Unknown',
    profilePicture: leave.profilePicture || employeeData.profilePicture || employeeData.avatar || employeeData.image || null,
    totalDays: leave.totalDays || calculateDays(leave.startDate, leave.endDate) || 0,
    startDate: leave.startDate,
    endDate: leave.endDate,
    leaveType: leave.leaveType || 'Other',
    reason: leave.reason || '',
    status: leave.status || 'Pending',
    appliedDate: leave.appliedDate || leave.createdAt || new Date().toISOString(),
    payStatus: leave.payStatus || 'Unpaid',
    approvedByName: leave.approvedByName || 
      (leave.approvedBy ? `${leave.approvedBy.firstName || ''} ${leave.approvedBy.lastName || ''}`.trim() : null),
    rejectedByName: leave.rejectedByName || 
      (leave.rejectedBy ? `${leave.rejectedBy.firstName || ''} ${leave.rejectedBy.lastName || ''}`.trim() : null),
    // Include full employee object for easier access
    employee: employeeData
  };
}, [calculateDays]);

  // Fetch leaves from backend - FIXED ENDPOINTS
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      
      const userRole = getUserRole();
      const token = getAuthToken();
      
      if (!token) {
        toast.error("লগইন সেশন শেষ হয়েছে");
        router.push("/");
        return;
      }

      // ✅ CORRECT ENDPOINTS
      const endpoint = userRole === 'admin' 
        ? `${API_BASE_URL}/admin/all`
        : `${API_BASE_URL}/my-leaves`;
      
      console.log("🌐 API Call:", endpoint);
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("📊 Response Status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("লগইন সেশন শেষ হয়েছে");
          localStorage.clear();
          router.push("/");
          return;
        }
        
        const errorText = await response.text();
        console.error("❌ Error Response:", errorText);
        
        throw new Error(`HTTP Error ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ API Response:", data);
      
      // Handle response based on your backend structure
      let leavesData = [];
      
      if (data.status === "success") {
        if (Array.isArray(data.data)) {
          leavesData = data.data;
        } else if (data.data?.leaves) {
          leavesData = data.data.leaves;
        } else if (Array.isArray(data.leaves)) {
          leavesData = data.leaves;
        } else if (Array.isArray(data)) {
          leavesData = data;
        }
      } else if (Array.isArray(data)) {
        leavesData = data;
      }
      
      console.log(`📈 Found ${leavesData.length} leaves`);
      
      // Transform data to match frontend format
      const transformedLeaves = leavesData.map(transformLeaveData);
      
      setLeaves(transformedLeaves);
      calculateStats(transformedLeaves);
      
      // Cache the data
      localStorage.setItem('cachedLeaves', JSON.stringify({
        data: transformedLeaves,
        timestamp: new Date().getTime()
      }));
      
    } catch (error) {
      console.error("💥 Fetch error:", error);
      toast.error("ডাটা লোড করতে সমস্যা হচ্ছে");
      
      // Fallback to cached data
      const cached = localStorage.getItem('cachedLeaves');
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          const cachedData = parsedData.data || parsedData;
          setLeaves(cachedData);
          calculateStats(cachedData);
          console.log("Loaded from cache:", cachedData.length);
        } catch (e) {
          console.error("Error parsing cache:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken, getUserRole, router, calculateStats, transformLeaveData]);

  // Fetch leave statistics - FIXED ENDPOINT
  const fetchLeaveStats = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      // ✅ CORRECT ENDPOINT
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setLeaveStats(data.data);
        }
      }
    } catch (error) {
      console.error("Fetch leave stats error:", error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch leave balance - FIXED ENDPOINT
  const fetchLeaveBalance = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      // ✅ CORRECT ENDPOINT
      const response = await fetch(`${API_BASE_URL}/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setLeaveBalance(data.data);
        }
      }
    } catch (error) {
      console.error("Fetch leave balance error:", error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch departments and employees (for admin) - FIXED ENDPOINTS
const fetchDepartmentsAndEmployees = useCallback(async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No auth token found");
    return;
  }

  try {
    console.log("=== Fetching departments ===");
    
    const deptResponse = await fetch(`${API_BASE_URL}/admin/departments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (deptResponse.ok) {
      const deptData = await deptResponse.json();
      console.log("Departments response:", deptData);
      if (deptData.status === 'success' || deptData.success) {
        setDepartments(deptData.data || deptData.departments || []);
      }
    }

    console.log("=== Fetching employees ===");
    
    const empResponse = await fetch(`${API_BASE_URL}/admin/getAll-user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Employees response status:", empResponse.status);
    
    if (empResponse.ok) {
      const empData = await empResponse.json();
      console.log("Employees API response:", empData);
      
      if (empData.success === true) {
        let employeesData = [];
        
        if (Array.isArray(empData.users)) {
          employeesData = empData.users;
        }
        
        console.log(`✅ Found ${employeesData?.length || 0} employees`);
        
        if (employeesData && employeesData.length > 0) {
          // ✅ UPDATED FILTER: Only exclude super admins or users with role 'admin'
          const formattedEmployees = employeesData
            .filter(emp => {
              // Only exclude if they are SUPER admin or have explicit admin role
              // adminLevel: 'admin' might be default for all users in your system
              const isSuperAdmin = 
                emp.adminLevel === 'super' || 
                (emp.role && emp.role.toLowerCase() === 'superadmin') ||
                emp.isSuperAdmin === true;
              
              const isExplicitAdmin = 
                emp.role && emp.role.toLowerCase() === 'admin' && 
                emp.adminLevel === 'admin';
              
              // For testing, include everyone except super admins
              return !isSuperAdmin;
            })
            .map(emp => {
              return {
                _id: emp._id || emp.id || `emp_${Date.now()}_${Math.random()}`,
                firstName: emp.firstName || emp.name?.split(' ')[0] || 'Unknown',
                lastName: emp.lastName || emp.name?.split(' ').slice(1).join(' ') || '',
                employeeId: emp.employeeId || emp.empId || emp.userId || emp._id || 'N/A',
                department: emp.department || emp.dept || emp.employeeDepartment || 'Not Assigned',
                profilePicture: emp.profilePicture || emp.avatar || emp.image || null,
                email: emp.email || '',
                role: emp.role || 'employee',
                adminLevel: emp.adminLevel // Keep this for reference
              };
            });
          
          console.log(`✅ After filtering: ${formattedEmployees.length} employees`);
          console.log("Formatted employees:", formattedEmployees);
          
          if (formattedEmployees.length === 0) {
            console.log("⚠️ Showing all employees without filtering");
            // If still empty, show all without filtering
            const allEmployees = employeesData.map(emp => ({
              _id: emp._id,
              firstName: emp.firstName || 'User',
              lastName: emp.lastName || '',
              employeeId: emp.employeeId || 'ID001',
              department: emp.department || 'General',
              profilePicture: emp.profilePicture,
              email: emp.email || '',
              role: emp.role || 'employee',
              adminLevel: emp.adminLevel
            }));
            setEmployees(allEmployees);
          } else {
            setEmployees(formattedEmployees);
          }
          
          // Cache employees
          localStorage.setItem('cachedEmployees', JSON.stringify({
            data: formattedEmployees.length > 0 ? formattedEmployees : employeesData,
            timestamp: new Date().getTime()
          }));
          
        }
      }
    }

  } catch (error) {
    console.error("❌ Fetch error:", error);
    // Load from cache
    const cached = localStorage.getItem('cachedEmployees');
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        setEmployees(parsedData.data || parsedData);
        console.log("✅ Loaded employees from cache after error");
      } catch (e) {
        console.error("Error parsing cached employees:", e);
      }
    }
  }
}, [API_BASE_URL, getAuthToken]);

  // Check authentication and load data - useEffect
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthAndLoadData = async () => {
      if (!isMounted) return;
      
      console.log("=== Initial authentication check ===");
      
      const adminToken = localStorage.getItem('adminToken');
      const employeeToken = localStorage.getItem('employeeToken');
      
      if (!adminToken && !employeeToken) {
        console.log("No tokens found, redirecting to login");
        toast.error("Please login first");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      // Set admin status based on token
      setIsAdmin(!!adminToken);
      
      // Set current user info from token
      try {
        if (adminToken) {
          // Decode admin token to get user info
          const tokenParts = adminToken.split('.');
          if (tokenParts.length === 3) {
            const tokenPayload = JSON.parse(atob(tokenParts[1]));
            setCurrentUser({
              _id: tokenPayload.id || tokenPayload._id,
              name: tokenPayload.name || tokenPayload.firstName || 'Admin User',
              employeeId: tokenPayload.employeeId || 'ADMIN001',
              department: tokenPayload.department,
              role: 'admin'
            });
          }
        } else if (employeeToken) {
          // Decode employee token to get user info
          const tokenParts = employeeToken.split('.');
          if (tokenParts.length === 3) {
            const tokenPayload = JSON.parse(atob(tokenParts[1]));
            setCurrentUser({
              _id: tokenPayload.id || tokenPayload._id,
              name: tokenPayload.name || `${tokenPayload.firstName || ''} ${tokenPayload.lastName || ''}`.trim(),
              employeeId: tokenPayload.employeeId,
              department: tokenPayload.department,
              role: 'employee'
            });
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // Fallback to basic info
        setCurrentUser({
          name: isAdmin ? 'Admin User' : 'Employee',
          employeeId: isAdmin ? 'ADMIN001' : 'EMP001',
          role: isAdmin ? 'admin' : 'employee'
        });
      }
      
      // Load cached data first for immediate display
      const cached = localStorage.getItem('cachedLeaves');
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          const cachedData = parsedData.data || parsedData;
          // Use cache if less than 5 minutes old
          if (new Date().getTime() - (parsedData.timestamp || 0) < 5 * 60 * 1000) {
            setLeaves(cachedData);
            calculateStats(cachedData);
            console.log("Loaded from cache:", cachedData.length);
          }
        } catch (e) {
          console.error("Error parsing cached leaves:", e);
        }
      }
      
      // Now fetch fresh data from API
      if (isMounted) {
        await fetchLeaves();
        await fetchLeaveStats();
        await fetchLeaveBalance();
        if (adminToken) {
          await fetchDepartmentsAndEmployees();
        }
        setInitialLoadComplete(true);
      }
    };
    
    checkAuthAndLoadData();
    
    return () => {
      isMounted = false;
    };
  }, [router, fetchLeaves, calculateStats, fetchLeaveStats, fetchLeaveBalance, fetchDepartmentsAndEmployees]);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Check if leave request is at least 24 hours before start date
  const isAtLeast24HoursBefore = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const timeDiff = start.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff >= 24;
  };

  // Request leave - FIXED ENDPOINT
  const handleRequestLeave = async (e) => {
    e.preventDefault();
    
    if (!form.startDate || !form.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }
    
    // Check if start date is in the past (for employees only)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const startDateUTC = new Date(startDate);
    startDateUTC.setUTCHours(0, 0, 0, 0);
    
    if (!isAdmin && startDateUTC < today) {
      toast.error("Cannot request leave for past dates");
      return;
    }
    
    // Check if request is made at least 24 hours before start date (for employees only)
    if (!isAdmin && !isAtLeast24HoursBefore(form.startDate)) {
      toast.error("You must request leave at least 24 hours before the start date");
      return;
    }
    
    // Admin validation for employee selection
    if (isAdmin && !form.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading(
      isAdmin ? "Creating leave request..." : "Submitting leave request..."
    );
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      const requestData = {
        leaveType: form.leaveType,
        payStatus: form.payStatus,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason
      };
      
      // Add employee ID if admin is creating for someone else
      if (isAdmin && form.employeeId) {
        requestData.employeeId = form.employeeId;
        // If admin selects Approved status, auto-approve
        if (form.status === "Approved") {
          requestData.autoApprove = true;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        
        if (isAdmin && form.status === "Approved") {
          toast.success("Leave request created and approved successfully!", {
            icon: '✅',
            duration: 3000,
          });
        } else {
          toast.success(data.message || "Leave request submitted successfully!", {
            icon: '✅',
            duration: 3000,
          });
        }
        
        // Find the selected employee info
        let selectedEmployee = null;
        if (isAdmin && form.employeeId) {
          selectedEmployee = employees.find(emp => emp._id === form.employeeId);
        }
        
        // Optimistically update UI with denormalized data
        const newLeave = data.data || data.leave;
        
        const enrichedLeave = transformLeaveData({
          ...newLeave,
          employeeName: isAdmin 
            ? `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`.trim()
            : currentUser?.name || "You",
          employeeId: isAdmin 
            ? selectedEmployee?.employeeId 
            : currentUser?.employeeId,
          department: isAdmin 
            ? selectedEmployee?.department 
            : currentUser?.department,
          profilePicture: isAdmin 
            ? selectedEmployee?.profilePicture 
            : currentUser?.profilePicture,
          // If admin created with Approved status
          ...(isAdmin && form.status === "Approved" && {
            status: "Approved",
            approvedAt: new Date().toISOString(),
            approvedByName: currentUser?.name || "Admin"
          })
        });
        
        setLeaves(prev => [enrichedLeave, ...prev]);
        
        // Update stats
        const newStatus = isAdmin ? form.status : "Pending";
        setStats(prev => ({
          ...prev,
          [newStatus.toLowerCase()]: prev[newStatus.toLowerCase()] + 1,
          total: prev.total + 1,
          paid: newLeave.payStatus === 'Paid' ? prev.paid + 1 : prev.paid,
          unpaid: newLeave.payStatus === 'Unpaid' ? prev.unpaid + 1 : prev.unpaid,
          halfPaid: newLeave.payStatus === 'HalfPaid' ? prev.halfPaid + 1 : prev.halfPaid
        }));
        
        // Reset form and close modal
        setShowRequestModal(false);
        setForm({
          leaveType: "Sick",
          payStatus: "Paid",
          startDate: "",
          endDate: "",
          reason: "",
          employeeId: "",
          status: "Pending"
        });
        
        // Refresh data from server after a short delay
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveBalance();
        }, 1000);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error submitting leave request");
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Request leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit modal
  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setEditForm({
      leaveType: leave.leaveType,
      payStatus: leave.payStatus,
      startDate: leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : "",
      endDate: leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : "",
      reason: leave.reason,
      status: leave.status
    });
    setShowEditModal(true);
  };

  // Update leave - FIXED ENDPOINT
  const handleUpdateLeave = async () => {
    if (!selectedLeave) return;
    
    if (!editForm.startDate || !editForm.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    
    const startDate = new Date(editForm.startDate);
    const endDate = new Date(editForm.endDate);
    
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }
    
    // Check if request is made at least 24 hours before start date (for employees only)
    if (!isAdmin && !isAtLeast24HoursBefore(editForm.startDate)) {
      toast.error("You must request leave at least 24 hours before the start date");
      return;
    }
    
    // Check if employee can edit this leave
    if (!isAdmin && selectedLeave?.status !== 'Pending') {
      toast.error("Only pending leaves can be edited");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Updating leave request...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      const updateData = {
        leaveType: editForm.leaveType,
        payStatus: editForm.payStatus,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        reason: editForm.reason
      };
      
      // Add status if admin is editing
      if (isAdmin && editForm.status) {
        updateData.status = editForm.status;
        // If admin is changing status to Approved
        if (editForm.status === "Approved" && selectedLeave?.status !== "Approved") {
          updateData.autoApprove = true;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/updateLeave/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        
        let successMessage = "Leave updated successfully!";
        if (isAdmin && editForm.status === "Approved" && selectedLeave?.status !== "Approved") {
          successMessage = "Leave updated and approved successfully!";
        } else if (isAdmin && editForm.status === "Rejected" && selectedLeave?.status !== "Rejected") {
          successMessage = "Leave updated and rejected successfully!";
        }
        
        toast.success(successMessage, {
          icon: '✅',
          duration: 3000,
        });
        
        // Update in state with denormalized data
        const updatedLeave = data.data || data.leave;
        const enrichedLeave = transformLeaveData({
          ...updatedLeave,
          employeeName: selectedLeave.employeeName,
          employeeId: selectedLeave.employeeId,
          department: selectedLeave.department,
          profilePicture: selectedLeave.profilePicture,
          // Update approved info if admin approved
          ...(isAdmin && editForm.status === "Approved" && selectedLeave?.status !== "Approved" && {
            approvedAt: new Date().toISOString(),
            approvedByName: currentUser?.name || "Admin"
          }),
          // Update rejected info if admin rejected
          ...(isAdmin && editForm.status === "Rejected" && selectedLeave?.status !== "Rejected" && {
            rejectedAt: new Date().toISOString(),
            rejectedByName: currentUser?.name || "Admin"
          })
        });
        
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id ? enrichedLeave : leave
        ));
        
        // Update stats if status changed
        if (selectedLeave?.status !== editForm.status) {
          setStats(prev => ({
            ...prev,
            [selectedLeave?.status.toLowerCase()]: prev[selectedLeave?.status.toLowerCase()] - 1,
            [editForm.status.toLowerCase()]: prev[editForm.status.toLowerCase()] + 1
          }));
        }
        
        // Update cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const parsedData = JSON.parse(cached);
          const cachedData = parsedData.data || parsedData;
          const updatedCache = cachedData.map(leave => 
            leave._id === selectedLeave._id ? enrichedLeave : leave
          );
          localStorage.setItem('cachedLeaves', JSON.stringify({
            data: updatedCache,
            timestamp: new Date().getTime()
          }));
        }
        
        // Close modal
        setShowEditModal(false);
        setSelectedLeave(null);
        
        // Refresh data
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveBalance();
        }, 500);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error updating leave");
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Update leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Approve leave (Admin only) - FIXED ENDPOINT
  const handleApproveLeave = async () => {
    if (!isAdmin) {
      toast.error("Only admin can approve leaves");
      return;
    }
    
    if (!selectedLeave) {
      toast.error("No leave selected");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Approving leave...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      // ✅ CORRECT ENDPOINT
      const response = await fetch(`${API_BASE_URL}/admin/approve/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payStatus: selectedLeave.payStatus
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success(data.message || "Leave approved successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        // Update in state with denormalized data
        const updatedLeave = data.data || data.leave;
        const enrichedLeave = transformLeaveData({
          ...updatedLeave,
          employeeName: selectedLeave.employeeName,
          employeeId: selectedLeave.employeeId,
          department: selectedLeave.department,
          profilePicture: selectedLeave.profilePicture,
          approvedByName: currentUser?.name || "Admin"
        });
        
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id ? enrichedLeave : leave
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          approved: prev.approved + 1
        }));
        
        // Update cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const parsedData = JSON.parse(cached);
          const cachedData = parsedData.data || parsedData;
          const updatedCache = cachedData.map(leave => 
            leave._id === selectedLeave._id ? enrichedLeave : leave
          );
          localStorage.setItem('cachedLeaves', JSON.stringify({
            data: updatedCache,
            timestamp: new Date().getTime()
          }));
        }
        
        // Close modal
        setShowApproveModal(false);
        setSelectedLeave(null);
        
        // Refresh data
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveStats();
          fetchLeaveBalance();
        }, 500);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error approving leave");
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Approve leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Reject leave (Admin only) - FIXED ENDPOINT
  const handleRejectLeave = async () => {
    if (!isAdmin) {
      toast.error("Only admin can reject leaves");
      return;
    }
    
    if (!selectedLeave) {
      toast.error("No leave selected");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Rejecting leave...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      // ✅ CORRECT ENDPOINT
      const response = await fetch(`${API_BASE_URL}/admin/reject/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: rejectionReason || "No reason provided"
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success(data.message || "Leave rejected successfully!", {
          icon: '❌',
          duration: 3000,
        });
        
        // Update in state with denormalized data
        const updatedLeave = data.data || data.leave;
        const enrichedLeave = transformLeaveData({
          ...updatedLeave,
          employeeName: selectedLeave.employeeName,
          employeeId: selectedLeave.employeeId,
          department: selectedLeave.department,
          profilePicture: selectedLeave.profilePicture,
          rejectedByName: currentUser?.name || "Admin"
        });
        
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id ? enrichedLeave : leave
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1
        }));
        
        // Update cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const parsedData = JSON.parse(cached);
          const cachedData = parsedData.data || parsedData;
          const updatedCache = cachedData.map(leave => 
            leave._id === selectedLeave._id ? enrichedLeave : leave
          );
          localStorage.setItem('cachedLeaves', JSON.stringify({
            data: updatedCache,
            timestamp: new Date().getTime()
          }));
        }
        
        // Close modal
        setShowRejectModal(false);
        setSelectedLeave(null);
        setRejectionReason("");
        
        // Refresh data
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveStats();
        }, 500);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error rejecting leave");
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Reject leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete leave - FIXED ENDPOINT
  const handleDeleteLeave = async (leaveId) => {
    if (!confirm("Are you sure you want to delete this leave request?")) {
      return;
    }
    
    const loadingToast = toast.loading("Deleting leave request...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      // ✅ CORRECT ENDPOINT
      const response = await fetch(`${API_BASE_URL}/deleteLeave/${leaveId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success(data.message || "Leave request deleted successfully!", {
          icon: '🗑️',
          duration: 3000,
        });
        
        // Remove from state
        const deletedLeave = leaves.find(l => l._id === leaveId);
        setLeaves(prev => prev.filter(leave => leave._id !== leaveId));
        
        // Update stats
        if (deletedLeave) {
          setStats(prev => ({
            ...prev,
            total: prev.total - 1,
            pending: deletedLeave.status === 'Pending' ? prev.pending - 1 : prev.pending,
            approved: deletedLeave.status === 'Approved' ? prev.approved - 1 : prev.approved,
            rejected: deletedLeave.status === 'Rejected' ? prev.rejected - 1 : prev.rejected,
            paid: deletedLeave.payStatus === 'Paid' ? prev.paid - 1 : prev.paid,
            unpaid: deletedLeave.payStatus === 'Unpaid' ? prev.unpaid - 1 : prev.unpaid,
            halfPaid: deletedLeave.payStatus === 'HalfPaid' ? prev.halfPaid - 1 : prev.halfPaid
          }));
        }
        
        // Update cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const parsedData = JSON.parse(cached);
          const cachedData = parsedData.data || parsedData;
          const updatedCache = cachedData.filter(leave => leave._id !== leaveId);
          localStorage.setItem('cachedLeaves', JSON.stringify({
            data: updatedCache,
            timestamp: new Date().getTime()
          }));
        }
        
        // Refresh data
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveBalance();
        }, 500);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error deleting leave");
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Delete leave error:", error);
    }
  };

  // View leave details - FIXED ENDPOINT
  const handleViewDetails = async (leaveId) => {
    const token = getAuthToken();
    if (!token) return;

    const loadingToast = toast.loading("Loading leave details...");

    try {
      // ✅ CORRECT ENDPOINT
      const response = await fetch(`${API_BASE_URL}/getLeave/${leaveId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const transformedLeave = transformLeaveData(data.data);
          setSelectedLeave(transformedLeave);
          setShowDetailsModal(true);
          toast.dismiss(loadingToast);
        } else {
          toast.dismiss(loadingToast);
          toast.error(data.message || "Failed to load leave details");
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to load leave details");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("View leave details error:", error);
    }
  };

  // Export leaves - FIXED ENDPOINT
  const handleExportLeaves = async () => {
    setExportLoading(true);
    const loadingToast = toast.loading("Exporting leaves...");
    
    try {
      const token = getAuthToken();
      if (!token) return;

      // ✅ CORRECT ENDPOINT
      let endpoint = `${API_BASE_URL}/admin/export`;
      const params = new URLSearchParams();
      
      if (statusFilter !== "all") params.append('status', statusFilter);
      if (typeFilter !== "all") params.append('type', typeFilter);
      if (dateRange.start && dateRange.end) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }
      
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // For JSON export, create a downloadable file
          const jsonString = JSON.stringify(data.data || [], null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `leaves_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          toast.dismiss(loadingToast);
          toast.success("Leaves exported successfully!");
        } else {
          toast.dismiss(loadingToast);
          toast.error(data.message || "Failed to export leaves");
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to export leaves");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error exporting leaves");
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Handle bulk actions - FIXED ENDPOINTS
  const handleBulkAction = async (action) => {
    if (selectedLeaves.length === 0) {
      toast.error("Please select leaves first");
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setFormLoading(true);
    const loadingToast = toast.loading(`Processing ${action}...`);

    try {
      let endpoint;
      let method = 'POST';
      
      switch(action) {
        case 'approve':
          // ✅ CORRECT ENDPOINT
          endpoint = `${API_BASE_URL}/admin/bulk-approve`;
          break;
        case 'reject':
          // ✅ CORRECT ENDPOINT
          endpoint = `${API_BASE_URL}/admin/bulk-reject`;
          method = 'POST';
          break;
        case 'delete':
          // ✅ CORRECT ENDPOINT
          endpoint = `${API_BASE_URL}/admin/bulk-delete`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leaveIds: selectedLeaves })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success(data.message || "Bulk action completed successfully!");
        
        // Refresh data
        fetchLeaves();
        fetchLeaveStats();
        fetchLeaveBalance();
        
        // Clear selection
        setSelectedLeaves([]);
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error processing bulk action");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Bulk action error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle leave selection
  const toggleLeaveSelection = (leaveId) => {
    if (selectedLeaves.includes(leaveId)) {
      setSelectedLeaves(selectedLeaves.filter(id => id !== leaveId));
    } else {
      setSelectedLeaves([...selectedLeaves, leaveId]);
    }
  };

  // Select all leaves
  const selectAllLeaves = () => {
    if (selectedLeaves.length === filteredLeaves.length) {
      setSelectedLeaves([]);
    } else {
      setSelectedLeaves(filteredLeaves.map(leave => leave._id));
    }
  };

  // Sort leaves
  const sortLeaves = useCallback((leavesArray) => {
    const sorted = [...leavesArray];
    switch(sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || b.appliedDate) - new Date(a.createdAt || a.appliedDate));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt || a.appliedDate) - new Date(b.createdAt || b.appliedDate));
      case 'startDate':
        return sorted.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      default:
        return sorted;
    }
  }, [sortBy]);

  // Filter leaves
  const filteredLeaves = useMemo(() => {
    let filtered = leaves.filter(leave => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" || 
        (leave.employeeName || "").toLowerCase().includes(searchLower) ||
        (leave.leaveType || "").toLowerCase().includes(searchLower) ||
        (leave.reason || "").toLowerCase().includes(searchLower) ||
        (leave.employeeId || "").toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === "all" || leave.status === statusFilter;
      const matchesType = typeFilter === "all" || leave.leaveType === typeFilter;
      
      // Department filter for admin
      let matchesDepartment = true;
      if (isAdmin && departmentFilter !== "all") {
        const dept = leave.department || leave.employeeDepartment;
        matchesDepartment = dept === departmentFilter;
      }

      // Date range filter
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        const leaveStart = new Date(leave.startDate);
        matchesDateRange = leaveStart >= startDate && leaveStart <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDepartment && matchesDateRange;
    });

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(leave => leave.status === activeTab);
    }

    // Apply sorting
    return sortLeaves(filtered);
  }, [leaves, searchTerm, statusFilter, typeFilter, departmentFilter, dateRange, activeTab, sortLeaves, isAdmin]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
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

  // Check if user can edit this leave
  const canEditLeave = (leave) => {
    if (isAdmin) return true;
    if (!currentUser) return false;
    const employeeId = leave.employeeId;
    return employeeId === currentUser.employeeId && leave.status === 'Pending';
  };

  // Check if user can delete this leave
  const canDeleteLeave = (leave) => {
    if (isAdmin) return true;
    if (!currentUser) return false;
    const employeeId = leave.employeeId;
    return employeeId === currentUser.employeeId && leave.status === 'Pending';
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRange({ start: "", end: "" });
    setDepartmentFilter("all");
    setEmployeeFilter("");
    setActiveTab("all");
  };

  // Get leave type options
  const leaveTypeOptions = useMemo(() => [
    { value: "Sick", label: "Sick Leave", icon: <Activity size={14} /> },
    { value: "Annual", label: "Annual Leave", icon: <Sun size={14} /> },
    { value: "Casual", label: "Casual Leave", icon: <Coffee size={14} /> },
    { value: "Emergency", label: "Emergency Leave", icon: <AlertTriangle size={14} /> },
    { value: "Maternity", label: "Maternity Leave", icon: <Home size={14} /> },
    { value: "Paternity", label: "Paternity Leave", icon: <Briefcase size={14} /> },
    { value: "Other", label: "Other", icon: <FileText size={14} /> }
  ], []);

  // Get pay status options
  const payStatusOptions = useMemo(() => [
    { value: "Paid", label: "Paid", color: "text-green-600" },
    { value: "Unpaid", label: "Unpaid", color: "text-red-600" },
    { value: "HalfPaid", label: "Half Paid", color: "text-yellow-600" }
  ], []);

  // Helper function to get employee avatar 
const getEmployeeAvatar = (leave) => {
  // Try multiple sources for profile picture
  const profilePicture = leave.profilePicture || 
                        leave.employee?.profilePicture || 
                        leave.employee?.avatar || 
                        leave.employee?.image;
  
  const employeeName = leave.employeeName || "NA";
  const employeeId = leave.employeeId || leave.employee?.employeeId;
  
  if (profilePicture) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        <img 
          src={profilePicture} 
          alt={employeeName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                ${getInitials(employeeName)}
              </div>
            `;
          }}
        />
      </div>
    );
  } else {
    // Fallback to initials
    const initials = getInitials(employeeName);
    
    // Generate consistent color based on employee ID or name
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-red-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    
    const text = employeeId || employeeName;
    const colorIndex = text 
      ? text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
      : 0;
    
    return (
      <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
        {initials}
      </div>
    );
  }
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name || name === 'NA') return 'NA';
  return name.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

  // Get employee info from leave
  const getEmployeeInfo = (leave) => {
    return {
      name: leave.employeeName,
      employeeId: leave.employeeId,
      department: leave.employeeDepartment || leave.department,
      profilePicture: leave.employeeProfilePicture || leave.profilePicture
    };
  };

  // Modal components
  const RequestLeaveModal = () => {
  const [localForm, setLocalForm] = useState({
    leaveType: "Sick",
    payStatus: "Paid",
    startDate: "",
    endDate: "",
    reason: "",
    employeeId: "",
    status: "Pending"
  });

  // Calculate minimum date (24 hours from now for employees)
  const calculateMinDate = () => {
    if (isAdmin) {
      return new Date().toISOString().split('T')[0];
    }
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Local form change handler
  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    console.log(`Request Form - Changing ${name}: ${value}`);
    setLocalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submit
  const handleLocalRequestLeave = async (e) => {
    e.preventDefault();
    
    if (!localForm.startDate || !localForm.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    
    const startDate = new Date(localForm.startDate);
    const endDate = new Date(localForm.endDate);
    
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }
    
    // Check if start date is in the past (for employees only)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const startDateUTC = new Date(startDate);
    startDateUTC.setUTCHours(0, 0, 0, 0);
    
    if (!isAdmin && startDateUTC < today) {
      toast.error("Cannot request leave for past dates");
      return;
    }
    
    // Check if request is made at least 24 hours before start date (for employees only)
    const isAtLeast24HoursBefore = (startDate) => {
      const now = new Date();
      const start = new Date(startDate);
      const timeDiff = start.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff >= 24;
    };
    
    if (!isAdmin && !isAtLeast24HoursBefore(localForm.startDate)) {
      toast.error("You must request leave at least 24 hours before the start date");
      return;
    }
    
    // Admin validation for employee selection
    if (isAdmin && !localForm.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading(
      isAdmin ? "Creating leave request..." : "Submitting leave request..."
    );
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      const requestData = {
        leaveType: localForm.leaveType,
        payStatus: localForm.payStatus,
        startDate: localForm.startDate,
        endDate: localForm.endDate,
        reason: localForm.reason
      };
      
      // Add employee ID if admin is creating for someone else
      if (isAdmin && localForm.employeeId) {
        requestData.employeeId = localForm.employeeId;
        // If admin selects Approved status, auto-approve
        if (localForm.status === "Approved") {
          requestData.autoApprove = true;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        
        if (isAdmin && localForm.status === "Approved") {
          toast.success("Leave request created and approved successfully!", {
            icon: '✅',
            duration: 3000,
          });
        } else {
          toast.success(data.message || "Leave request submitted successfully!", {
            icon: '✅',
            duration: 3000,
          });
        }
        
        // Find the selected employee info
        let selectedEmployee = null;
        if (isAdmin && localForm.employeeId) {
          selectedEmployee = employees.find(emp => emp._id === localForm.employeeId);
        }
        
        // Optimistically update UI with denormalized data
        const newLeave = data.data || data.leave;
        
        const enrichedLeave = transformLeaveData({
          ...newLeave,
          employeeName: isAdmin 
            ? `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`.trim()
            : currentUser?.name || "You",
          employeeId: isAdmin 
            ? selectedEmployee?.employeeId 
            : currentUser?.employeeId,
          department: isAdmin 
            ? selectedEmployee?.department 
            : currentUser?.department,
          profilePicture: isAdmin 
            ? selectedEmployee?.profilePicture 
            : currentUser?.profilePicture,
          // If admin created with Approved status
          ...(isAdmin && localForm.status === "Approved" && {
            status: "Approved",
            approvedAt: new Date().toISOString(),
            approvedByName: currentUser?.name || "Admin"
          })
        });
        
        setLeaves(prev => [enrichedLeave, ...prev]);
        
        // Update stats
        const newStatus = isAdmin ? localForm.status : "Pending";
        setStats(prev => ({
          ...prev,
          [newStatus.toLowerCase()]: prev[newStatus.toLowerCase()] + 1,
          total: prev.total + 1,
          paid: newLeave.payStatus === 'Paid' ? prev.paid + 1 : prev.paid,
          unpaid: newLeave.payStatus === 'Unpaid' ? prev.unpaid + 1 : prev.unpaid,
          halfPaid: newLeave.payStatus === 'HalfPaid' ? prev.halfPaid + 1 : prev.halfPaid
        }));
        
        // Reset form and close modal
        setShowRequestModal(false);
        setLocalForm({
          leaveType: "Sick",
          payStatus: "Paid",
          startDate: "",
          endDate: "",
          reason: "",
          employeeId: "",
          status: "Pending"
        });
        
        // Refresh data from server after a short delay
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveBalance();
        }, 1000);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error submitting leave request");
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Request leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowRequestModal(false);
    setLocalForm({
      leaveType: "Sick",
      payStatus: "Paid",
      startDate: "",
      endDate: "",
      reason: "",
      employeeId: "",
      status: "Pending"
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isAdmin ? "Create Leave Request" : "Request Leave"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isAdmin ? "Create leave request for employee" : "Submit a new leave request"}
              </p>
              {!isAdmin && (
                <div className="mt-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    <strong>Note:</strong> You must request leave at least 24 hours before the start date
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleLocalRequestLeave} className="p-6 space-y-4">
          {/* Employee Selection for Admin */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee *
              </label>
              
              {/* Loading State */}
              {employees.length === 0 && (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Loading employees...</p>
                  </div>
                </div>
              )}
              
              {/* Employee Selection */}
              {employees.length > 0 && (
                <>
                  <div className="relative">
                    <select
                      name="employeeId"
                      value={localForm.employeeId || ""}
                      onChange={handleLocalChange}
                      required={isAdmin}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 appearance-none"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} - {emp.employeeId} ({emp.department})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={20} className="text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Selected Employee Preview */}
                  {localForm.employeeId && (() => {
                    const selectedEmp = employees.find(emp => emp._id === localForm.employeeId);
                    if (!selectedEmp) return null;
                    
                    return (
                      <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          {getEmployeeAvatar({
                            employeeName: `${selectedEmp.firstName} ${selectedEmp.lastName}`,
                            profilePicture: selectedEmp.profilePicture
                          })}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">
                                {selectedEmp.firstName} {selectedEmp.lastName}
                              </h4>
                              <button
                                type="button"
                                onClick={() => setLocalForm({...localForm, employeeId: ""})}
                                className="text-gray-400 hover:text-gray-600"
                                title="Clear selection"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                ID: {selectedEmp.employeeId}
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {selectedEmp.department}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {employees.length} employee(s) available
                  </p>
                </>
              )}
              
              {/* No Employees Found */}
              {employees.length === 0 && !loading && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <p className="text-sm text-yellow-700">
                      No employees found. Please check if users exist in the system.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Status Selection for Admin */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={localForm.status || "Pending"}
                onChange={handleLocalChange}
                required={isAdmin}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              {localForm.status === "Approved" && (
                <p className="text-xs text-green-600 mt-1">
                  This leave will be automatically approved upon creation
                </p>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={localForm.leaveType}
              onChange={handleLocalChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
            >
              {leaveTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Status *
            </label>
            <select
              name="payStatus"
              value={localForm.payStatus}
              onChange={handleLocalChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
            >
              {payStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
                value={localForm.startDate}
                onChange={handleLocalChange}
                required
                min={calculateMinDate()}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 24 hours from now
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={localForm.endDate}
                onChange={handleLocalChange}
                required
                min={localForm.startDate || new Date().toISOString().split('T')[0]}
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
              value={localForm.reason}
              onChange={handleLocalChange}
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
                onClick={handleCloseModal}
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
                    {isAdmin ? "Creating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    {isAdmin ? <UserPlus size={18} /> : <Calendar size={18} />}
                    {isAdmin ? "Create Leave" : "Request Leave"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

 const EditLeaveModal = () => {
  const [localEditForm, setLocalEditForm] = useState({
    leaveType: "",
    payStatus: "",
    startDate: "",
    endDate: "",
    reason: "",
    status: ""
  });

  // Admin can edit any leave, employees can only edit pending leaves
  const canEdit = isAdmin || (selectedLeave?.status === 'Pending' && 
    selectedLeave?.employeeId === currentUser?.employeeId);

  // Calculate minimum date (24 hours from now for employees)
  const calculateMinDate = () => {
    if (isAdmin) {
      return new Date().toISOString().split('T')[0];
    }
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // যখন modal খুলবে, তখন selectedLeave থেকে ডাটা লোড করবে
  useEffect(() => {
    if (showEditModal && selectedLeave) {
      console.log("Loading leave data into edit form:", selectedLeave);
      
      setLocalEditForm({
        leaveType: selectedLeave.leaveType || "",
        payStatus: selectedLeave.payStatus || "",
        startDate: selectedLeave.startDate ? new Date(selectedLeave.startDate).toISOString().split('T')[0] : "",
        endDate: selectedLeave.endDate ? new Date(selectedLeave.endDate).toISOString().split('T')[0] : "",
        reason: selectedLeave.reason || "",
        status: selectedLeave.status || "Pending"
      });
    }
  }, [showEditModal, selectedLeave]);

  // Local form change handler
  const handleLocalEditChange = (e) => {
    const { name, value } = e.target;
    console.log(`Editing ${name}: ${value}`);
    
    setLocalEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update leave with local form data
  const handleLocalUpdateLeave = async () => {
    if (!selectedLeave) return;
    
    if (!localEditForm.startDate || !localEditForm.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    
    const startDate = new Date(localEditForm.startDate);
    const endDate = new Date(localEditForm.endDate);
    
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }
    
    // Check if employee can edit this leave
    if (!isAdmin && selectedLeave?.status !== 'Pending') {
      toast.error("Only pending leaves can be edited");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Updating leave request...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }
      
      const updateData = {
        leaveType: localEditForm.leaveType,
        payStatus: localEditForm.payStatus,
        startDate: localEditForm.startDate,
        endDate: localEditForm.endDate,
        reason: localEditForm.reason
      };
      
      // Add status if admin is editing
      if (isAdmin && localEditForm.status) {
        updateData.status = localEditForm.status;
        // If admin is changing status to Approved
        if (localEditForm.status === "Approved" && selectedLeave?.status !== "Approved") {
          updateData.autoApprove = true;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/updateLeave/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        
        let successMessage = "Leave updated successfully!";
        if (isAdmin && localEditForm.status === "Approved" && selectedLeave?.status !== "Approved") {
          successMessage = "Leave updated and approved successfully!";
        } else if (isAdmin && localEditForm.status === "Rejected" && selectedLeave?.status !== "Rejected") {
          successMessage = "Leave updated and rejected successfully!";
        }
        
        toast.success(successMessage, {
          icon: '✅',
          duration: 3000,
        });
        
        // Update in state with denormalized data
        const updatedLeave = data.data || data.leave;
        const enrichedLeave = transformLeaveData({
          ...updatedLeave,
          employeeName: selectedLeave.employeeName,
          employeeId: selectedLeave.employeeId,
          department: selectedLeave.department,
          profilePicture: selectedLeave.profilePicture,
          // Update approved info if admin approved
          ...(isAdmin && localEditForm.status === "Approved" && selectedLeave?.status !== "Approved" && {
            approvedAt: new Date().toISOString(),
            approvedByName: currentUser?.name || "Admin"
          }),
          // Update rejected info if admin rejected
          ...(isAdmin && localEditForm.status === "Rejected" && selectedLeave?.status !== "Rejected" && {
            rejectedAt: new Date().toISOString(),
            rejectedByName: currentUser?.name || "Admin"
          })
        });
        
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id ? enrichedLeave : leave
        ));
        
        // Update stats if status changed
        if (selectedLeave?.status !== localEditForm.status) {
          setStats(prev => ({
            ...prev,
            [selectedLeave?.status.toLowerCase()]: prev[selectedLeave?.status.toLowerCase()] - 1,
            [localEditForm.status.toLowerCase()]: prev[localEditForm.status.toLowerCase()] + 1
          }));
        }
        
        // Update cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const parsedData = JSON.parse(cached);
          const cachedData = parsedData.data || parsedData;
          const updatedCache = cachedData.map(leave => 
            leave._id === selectedLeave._id ? enrichedLeave : leave
          );
          localStorage.setItem('cachedLeaves', JSON.stringify({
            data: updatedCache,
            timestamp: new Date().getTime()
          }));
        }
        
        // Close modal
        setShowEditModal(false);
        setSelectedLeave(null);
        
        // Refresh data
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveBalance();
        }, 500);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Error updating leave");
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error("Update leave error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedLeave(null);
  };

  if (!canEdit && !isAdmin) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cannot Edit Leave</h3>
              <p className="text-gray-600 mb-6">
                {selectedLeave?.status === 'Approved' 
                  ? "Approved leaves cannot be edited. Please contact admin for changes."
                  : "You don't have permission to edit this leave."}
              </p>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isAdmin ? "Admin Edit Leave" : "Edit Leave"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isAdmin 
                  ? "Edit leave request details (admin override)"
                  : "Update leave request details"}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Admin can edit status */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={localEditForm.status || selectedLeave?.status}
                onChange={handleLocalEditChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              {localEditForm.status === "Approved" && selectedLeave?.status !== "Approved" && (
                <p className="text-xs text-green-600 mt-1">
                  This leave will be automatically approved
                </p>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={localEditForm.leaveType}
              onChange={handleLocalEditChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
            >
              {leaveTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Status *
            </label>
            <select
              name="payStatus"
              value={localEditForm.payStatus}
              onChange={handleLocalEditChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
            >
              {payStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
                value={localEditForm.startDate}
                onChange={handleLocalEditChange}
                required
                min={calculateMinDate()}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 24 hours from now
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={localEditForm.endDate}
                onChange={handleLocalEditChange}
                required
                min={localEditForm.startDate}
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
              value={localEditForm.reason}
              onChange={handleLocalEditChange}
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
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLocalUpdateLeave}
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
                    <Check size={18} />
                    Update Leave
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const ApproveLeaveModal = () => (
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
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
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
                {selectedLeave?.employeeName || 'Employee'}'s {selectedLeave?.leaveType} Leave
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Period:</span>
              <span className="font-medium">
                {formatDate(selectedLeave?.startDate)} - {formatDate(selectedLeave?.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{selectedLeave?.totalDays || calculateDays(selectedLeave?.startDate, selectedLeave?.endDate)} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{selectedLeave?.leaveType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pay Status:</span>
              <span className="font-medium">{selectedLeave?.payStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Employee:</span>
              <span className="font-medium">{selectedLeave?.employeeName} ({selectedLeave?.employeeId})</span>
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
  );

  const RejectLeaveModal = () => (
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
                setRejectionReason("");
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
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
                {selectedLeave?.employeeName || 'Employee'}'s {selectedLeave?.leaveType} Leave
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
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
                setRejectionReason("");
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
  );

  const LeaveDetailsModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Leave Details</h2>
              <p className="text-gray-500 text-sm mt-1">Complete information about this leave</p>
            </div>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedLeave(null);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Employee Information</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getEmployeeAvatar(selectedLeave)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{getEmployeeInfo(selectedLeave).name || 'N/A'}</h4>
                      <p className="text-sm text-gray-600">{getEmployeeInfo(selectedLeave).employeeId || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{getEmployeeInfo(selectedLeave).department || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Leave Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leave Type:</span>
                    <span className="font-medium flex items-center gap-1">
                      {getLeaveTypeIcon(selectedLeave?.leaveType)}
                      {selectedLeave?.leaveType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLeave?.status)}`}>
                      {selectedLeave?.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pay Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPayStatusColor(selectedLeave?.payStatus)}`}>
                      {selectedLeave?.payStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{selectedLeave?.totalDays || calculateDays(selectedLeave?.startDate, selectedLeave?.endDate)} days</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatDate(selectedLeave?.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{formatDate(selectedLeave?.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested On:</span>
                    <span className="font-medium">{formatDateTime(selectedLeave?.createdAt || selectedLeave?.appliedDate)}</span>
                  </div>
                  {selectedLeave?.approvedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved On:</span>
                      <span className="font-medium">{formatDateTime(selectedLeave?.approvedAt)}</span>
                    </div>
                  )}
                  {selectedLeave?.rejectedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rejected On:</span>
                      <span className="font-medium">{formatDateTime(selectedLeave?.rejectedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedLeave?.approvedBy && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Approved By</h3>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="font-medium">{selectedLeave?.approvedByName || 'Admin'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedLeave?.rejectedBy && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rejected By</h3>
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-600" />
                      <span className="font-medium">{selectedLeave?.rejectedByName || 'Admin'}</span>
                    </div>
                    {selectedLeave?.rejectionReason && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {selectedLeave?.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Reason for Leave</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedLeave?.reason}</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 mt-6">
            <div className="flex gap-3">
              {canEditLeave(selectedLeave) && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditLeave(selectedLeave);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit Leave
                </button>
              )}
              
              {canDeleteLeave(selectedLeave) && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDeleteLeave(selectedLeave?._id);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Leave
                </button>
              )}
              
              {isAdmin && selectedLeave?.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedLeave(selectedLeave);
                      setShowApproveModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedLeave(selectedLeave);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Modals */}
      {showRequestModal && <RequestLeaveModal />}
      {showEditModal && <EditLeaveModal />}
      {showApproveModal && <ApproveLeaveModal />}
      {showRejectModal && <RejectLeaveModal />}
      {showDetailsModal && <LeaveDetailsModal />}

      {/* Main Page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin ? "Manage employee leave requests" : "Request and track your leaves"}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0"> 
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isAdmin ? <UserPlus size={18} /> : <Plus size={18} />}
                <span className="hidden md:inline">
                  {isAdmin ? "Create Leave" : "Request Leave"}
                </span>
                <span className="md:hidden">
                  {isAdmin ? "Create" : "New"}
                </span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Total</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1">All requests</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Pending</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.pending}</p>
                  <p className="text-xs text-yellow-500 mt-1">Awaiting</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Approved</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.approved}</p>
                  <p className="text-xs text-green-500 mt-1">Approved</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-white" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Rejected</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.rejected}</p>
                  <p className="text-xs text-red-500 mt-1">Rejected</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <XCircle className="text-white" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Paid</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.paid}</p>
                  <p className="text-xs text-blue-500 mt-1">With salary</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Unpaid</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.unpaid}</p>
                  <p className="text-xs text-gray-500 mt-1">Without salary</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                  <TrendingDown className="text-white" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Half Paid</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.halfPaid}</p>
                  <p className="text-xs text-yellow-500 mt-1">Partial salary</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="text-white" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Notice */}
        {isAdmin && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 border border-purple-100">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Admin Mode Active</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    You can create leaves for employees, approve, reject, edit, and delete leave requests. 
                    Approving leaves will automatically update attendance records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === "all" 
                    ? "bg-white text-purple-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("Pending")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === "Pending" 
                    ? "bg-white text-yellow-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("Approved")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === "Approved" 
                    ? "bg-white text-green-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setActiveTab("Rejected")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === "Rejected" 
                    ? "bg-white text-red-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Rejected
              </button>
            </div>

            {/* View Mode and Sort */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "list" 
                      ? "bg-white text-purple-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "bg-white text-purple-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid size={18} />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="startDate">Start Date</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search leaves by employee name, ID, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                >
                  <FilterX size={16} />
                  <span className="hidden md:inline">Clear Filters</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                >
                  <option value="all">All Types</option>
                  {leaveTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeaves.length > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 md:p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckSquare className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedLeaves.length} leaves selected</h3>
                    <p className="text-sm text-gray-600">Perform actions on all selected leaves</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleBulkAction('approve')}
                        disabled={formLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Check size={16} />
                        Approve Selected
                      </button>
                      <button
                        onClick={() => handleBulkAction('reject')}
                        disabled={formLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                      >
                        <X size={16} />
                        Reject Selected
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={formLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedLeaves([])}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Leaves List */}
          <div className={`${viewMode === 'grid' ? 'lg:col-span-3' : 'lg:col-span-6'}`}>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Leave Requests</h2>
                    <p className="text-gray-500 text-sm">
                      {filteredLeaves.length} of {leaves.length} requests
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && filteredLeaves.length > 0 && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="selectAll"
                          checked={selectedLeaves.length === filteredLeaves.length && filteredLeaves.length > 0}
                          onChange={selectAllLeaves}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                        
                        <label htmlFor="selectAll" className="ml-2 text-sm text-gray-600">
                          Select All
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Leaves List */}
              {loading ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading leaves...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
                  </div>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                      <CalendarDays className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">No leave requests found</h3>
                    <p className="text-gray-500 max-w-md text-sm md:text-base">
                      {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateRange.start || dateRange.end
                        ? 'Try adjusting your search or filters' 
                        : isAdmin
                        ? 'No leave requests submitted yet'
                        : 'Start by requesting your first leave'}
                    </p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {isAdmin ? "Create Leave" : "Request Leave"}
                    </button>
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateRange.start || dateRange.end) && (
                      <button
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
                  {filteredLeaves.map((leave) => {
                    const totalDays = leave.totalDays || calculateDays(leave.startDate, leave.endDate);
                    const canEdit = isAdmin || (leave.status === 'Pending' && leave.employeeId === currentUser?.employeeId);
                    const canDelete = isAdmin || (leave.status === 'Pending' && leave.employeeId === currentUser?.employeeId);
                    
                    return (
                      <div 
                        key={leave._id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-4">
                          {/* Header with Employee Avatar */}
                          {/* Leave List Item - Grid View (লাইন ~1660 এর কাছাকাছি) */}
<div className="flex items-start justify-between mb-4">
  <div className="flex items-center gap-3">
    {/* Profile Picture with Employee Info */}
    <div className="flex items-center gap-3">
      {getEmployeeAvatar(leave)}
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">
          {isAdmin ? (
            <>
              {leave.employeeName}
              {leave.employeeId && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({leave.employeeId})
                </span>
              )}
            </>
          ) : (
            currentUser?.name || "Your Leave"
          )}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
            {leave.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPayStatusColor(leave.payStatus)}`}>
            {leave.payStatus}
          </span>
        </div>
      </div>
    </div>
  </div>
  
  {isAdmin && (
    <input
      type="checkbox"
      checked={selectedLeaves.includes(leave._id)}
      onChange={() => toggleLeaveSelection(leave._id)}
      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 mt-2"
    />
  )}
</div>
                          
                          {/* Details */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Period:</span>
                              <span className="font-medium">
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium">{totalDays} days</span>
                            </div>
                            {isAdmin && getEmployeeInfo(leave).department && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Department:</span>
                                <span className="font-medium text-purple-600">{getEmployeeInfo(leave).department}</span>
                              </div>
                            )}
                            <div className="text-sm">
                              <p className="text-gray-600 mb-1">Reason:</p>
                              <p className="text-gray-700 line-clamp-2">{leave.reason}</p>
                            </div>
                          </div>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              {formatDateTime(leave.createdAt || leave.appliedDate)}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* View Button - Always visible for all users */}
                              <button
                                onClick={() => handleViewDetails(leave._id)}
                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              
                              {/* Edit Button */}
                              {canEdit && (
                                <button
                                  onClick={() => handleEditLeave(leave)}
                                  className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Leave"
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                              
                              {/* Delete Button */}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteLeave(leave._id)}
                                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Leave"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                              
                              {/* Admin can approve/reject PENDING leaves */}
                              {isAdmin && leave.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedLeave(leave);
                                      setShowApproveModal(true);
                                    }}
                                    className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedLeave(leave);
                                      setShowRejectModal(true);
                                    }}
                                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredLeaves.map((leave) => {
                    const totalDays = leave.totalDays || calculateDays(leave.startDate, leave.endDate);
                    const canEdit = isAdmin || (leave.status === 'Pending' && leave.employeeId === currentUser?.employeeId);
                    const canDelete = isAdmin || (leave.status === 'Pending' && leave.employeeId === currentUser?.employeeId);
                    const employeeInfo = getEmployeeInfo(leave);
                    
                    return (
                      <div 
                        key={leave._id}
                        className="group p-4 md:p-6 hover:bg-gray-50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 md:gap-4 flex-1">
                            {isAdmin && (
                              <div className="mt-2">
                                <input
                                  type="checkbox"
                                  checked={selectedLeaves.includes(leave._id)}
                                  onChange={() => toggleLeaveSelection(leave._id)}
                                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                                />
                              </div>
                            )}
                            
                          
              {/* Profile Picture - এখানে বসাবেন */}
              {getEmployeeAvatar(leave)}
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base flex items-center gap-2">
                    {isAdmin ? (
                      <>
                        {leave.employeeName}
                        {leave.employeeId && (
                          <span className="text-sm font-normal text-gray-500">
                            ({leave.employeeId})
                          </span>
                        )}
                      </>
                    ) : (
                      currentUser?.name || "Your Leave"
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPayStatusColor(leave.payStatus)}`}>
                      {leave.payStatus}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {totalDays} days
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {leave.leaveType} Leave
                  </span>
                  {isAdmin && employeeInfo.department && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <Building size={12} />
                      {employeeInfo.department}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 text-sm line-clamp-2 md:line-clamp-1 mb-3">
                  {leave.reason}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-gray-500">
                  <span>Requested: {formatDateTime(leave.createdAt || leave.appliedDate)}</span>
                  {!isAdmin && leave.status === 'Pending' && (
                    <span className="text-yellow-600">
                      (Editable until approved)
                    </span>
                  )}
                </div>
              </div>
            </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                            {/* View Button - Always visible */}
                            <button
                              onClick={() => handleViewDetails(leave._id)}
                              className="p-1.5 md:p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            
                            {/* Edit Button */}
                            {canEdit && (
                              <button
                                onClick={() => handleEditLeave(leave)}
                                className="p-1.5 md:p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Leave"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                            
                            {/* Delete Button */}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteLeave(leave._id)}
                                className="p-1.5 md:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Leave"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            
                            {/* Admin Approve/Reject Buttons - Only for PENDING leaves */}
                            {isAdmin && leave.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setShowApproveModal(true);
                                  }}
                                  className="p-1.5 md:p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setShowRejectModal(true);
                                  }}
                                  className="p-1.5 md:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <X size={14} />
                                </button>
                              </>
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
        </div>
      </div>
    </>
  );
}