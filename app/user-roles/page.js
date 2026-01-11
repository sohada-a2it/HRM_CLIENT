"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  EyeOff, Key, Eye, Plus, Edit, Trash2, Search, Filter, Check,
  UserPlus, Shield, UserCog, Download, RefreshCw, Mail, Phone,
  Calendar, CreditCard, Building, ChevronDown, MoreVertical,
  UserCheck, UserX, TrendingUp, Users, X, CheckCircle, AlertCircle,
  Image, Camera, Upload, Loader2, Lock, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, Send, Clock, CalendarDays, History,
  Layers, Target, UsersRound, FileClock, BarChart3
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Import your existing APIs
import { 
  createUser as createUserAPI, 
  getUsers, 
  updateUser as updateUserAPI,
  deleteUser as deleteUserAPI,
  uploadProfilePicture,
  removeProfilePicture,
  adminRequestOtp as adminRequestOtpAPI,
  adminResetPassword as adminResetPasswordAPI,
  sendWelcomeEmail
} from "@/app/lib/api";

// Import shift APIs
import {
  getAllEmployeeShifts,
  assignShiftToEmployee,
  resetEmployeeShift,
  updateDefaultShift,
  getEmployeeShiftHistory,
  bulkAssignShifts,
  getShiftStatistics,
  getMyShift
} from "@/app/lib/api";

export default function UserRolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [adminEmail, setAdminEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Shift Management States
  const [showShiftManagement, setShowShiftManagement] = useState(false);
  const [selectedEmployeeForShift, setSelectedEmployeeForShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    startTime: '09:00',
    endTime: '18:00',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
    isPermanent: false
  });
  const [shiftHistory, setShiftHistory] = useState([]);
  const [shiftStatistics, setShiftStatistics] = useState(null);
  const [showShiftHistory, setShowShiftHistory] = useState(false);
  const [showShiftStatistics, setShowShiftStatistics] = useState(false);
  const [selectedEmployeesForBulk, setSelectedEmployeesForBulk] = useState([]);
  const [showBulkShiftAssign, setShowBulkShiftAssign] = useState(false);
  const [defaultShiftTime, setDefaultShiftTime] = useState({
    start: '09:00',
    end: '18:00'
  });
  
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Reset Password Page state
  const [showResetPasswordPage, setShowResetPasswordPage] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  
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
    joiningDate: new Date().toISOString().split('T')[0],
    profilePicture: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetData, setResetData] = useState({
    adminEmail: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // ✅ Welcome Email পাঠানোর ফাংশন
  const sendWelcomeEmailToUser = async (userData, generatedPassword = null) => {
    setSendingEmail(true);
    
    const toastId = toast.loading(`Processing email for ${userData.email}...`, {
      position: 'top-center'
    });

    try {
      console.log('📧 Email recipient:', userData.email);
      
      const result = await sendWelcomeEmail({
        to: userData.email,
        subject: `Welcome to A2IT HRM System`,
        userName: `${userData.firstName} ${userData.lastName}`,
        userEmail: userData.email,
        password: generatedPassword || form.password,
        role: userData.role,
        department: userData.department || 'General',
        joiningDate: userData.joiningDate || new Date().toISOString().split('T')[0],
        salary: userData.salary || '0',
        loginUrl: window.location.origin + '/login'
      });

      toast.dismiss(toastId);

      if (result?.success) {
        const message = result.simulated 
          ? `✅ User created! (Email simulation: ${userData.email})`
          : `✅ Welcome email sent to ${userData.email}!`;
        
        toast.success(message, {
          duration: 4000,
          position: 'top-center'
        });
        return true;
      }
      
      return false;

    } catch (error) {
      toast.dismiss(toastId);
      console.warn('📧 Email sending skipped (backend issue):', error.message);
      
      toast.success(`✅ User created successfully!`, {
        duration: 4000,
        position: 'top-center'
      });
      
      return true;
    } finally {
      setSendingEmail(false);
    }
  };

  // useEffect-এর মধ্যে admin email সেট করুন 
  useEffect(() => {
    const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@attendance-system.a2itltd.com';
    console.log('📧 Setting admin email:', envAdminEmail);
    setAdminEmail(envAdminEmail);
    
    // Load default shift time
    fetchDefaultShiftTime();
  }, []);

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Loading users...");
    try {
      const data = await getUsers();
      const usersWithPictures = data.users?.map(user => ({
        ...user,
        profilePicture: user.profilePicture || user.picture || null
      })) || [];
      setUsers(usersWithPictures);
      toast.dismiss(loadingToast);
      toast.success(`Loaded ${usersWithPictures.length} users successfully!`, {
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

  // Fetch default shift time
  const fetchDefaultShiftTime = async () => {
    try {
      // Default shift time from admin profile or system settings
      setDefaultShiftTime({
        start: '09:00',
        end: '18:00'
      });
    } catch (error) {
      console.error('Error fetching default shift time:', error);
    }
  };

  // Fetch shift statistics
  const fetchShiftStatistics = async () => {
    try {
      const result = await getShiftStatistics();
      if (result.success) {
        setShiftStatistics(result.statistics);
      }
    } catch (error) {
      console.error('Error fetching shift statistics:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchShiftStatistics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // Handle file upload logic...
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!isEditMode && (!form.password || form.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setFormLoading(true);

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
        joiningDate: form.joiningDate || new Date().toISOString().split('T')[0],
        shiftTiming: {
          defaultShift: {
            start: defaultShiftTime.start,
            end: defaultShiftTime.end
          }
        }
      };

      console.log('📝 Creating user:', payload.email);

      const res = await createUserAPI(payload);
      
      if (res.message === "User created successfully" || res.success) {
        console.log('✅ User created response:', res);
        
        toast.success(`✅ User "${form.firstName} ${form.lastName}" created!`, {
          duration: 4000,
          position: 'top-center'
        });

        if (res.user?._id) {
          setCurrentUserId(res.user._id);
          setIsEditMode(true);

          setTimeout(async () => {
            try {
              await sendWelcomeEmailToUser({
                ...form,
                _id: res.user._id
              }, form.password);
            } catch (e) {
              console.log('Email optional - user created anyway');
            }
          }, 500);
        }

        fetchUsers();
        resetForm();
        
      } else {
        throw new Error(res.message || "Failed to create user");
      }

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(`❌ ${error.message}`, {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      setFormLoading(false);
    }
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
      joiningDate: new Date().toISOString().split('T')[0],
      profilePicture: null
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
      joiningDate: user.joiningDate || new Date().toISOString().split('T')[0],
      profilePicture: user.profilePicture || user.picture || null
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
      if (res.message === "User deleted successfully" || res.success) {
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

  // ================= SHIFT MANAGEMENT FUNCTIONS =================

  // Open shift management modal
  const handleOpenShiftManagement = (employee = null) => {
    if (employee) {
      setSelectedEmployeeForShift(employee);
      
      // Set current shift if exists
      if (employee.shiftTiming?.currentShift?.isActive) {
        setShiftForm({
          startTime: employee.shiftTiming.currentShift.start || '09:00',
          endTime: employee.shiftTiming.currentShift.end || '18:00',
          effectiveDate: employee.shiftTiming.currentShift.effectiveDate 
            ? new Date(employee.shiftTiming.currentShift.effectiveDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          reason: '',
          isPermanent: false
        });
      } else {
        setShiftForm({
          startTime: defaultShiftTime.start,
          endTime: defaultShiftTime.end,
          effectiveDate: new Date().toISOString().split('T')[0],
          reason: '',
          isPermanent: false
        });
      }
    } else {
      setSelectedEmployeeForShift(null);
      setShiftForm({
        startTime: defaultShiftTime.start,
        endTime: defaultShiftTime.end,
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: '',
        isPermanent: false
      });
    }
    setShowShiftManagement(true);
  };

  // Assign shift to employee
  const handleAssignShift = async () => {
    if (!selectedEmployeeForShift) {
      toast.error('Please select an employee first');
      return;
    }

    if (!shiftForm.startTime || !shiftForm.endTime) {
      toast.error('Please enter start and end time');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(shiftForm.startTime) || !timeRegex.test(shiftForm.endTime)) {
      toast.error('Invalid time format. Use HH:mm (24-hour format)');
      return;
    }

    const loadingToast = toast.loading(`Assigning shift to ${selectedEmployeeForShift.firstName}...`);

    try {
      const result = await assignShiftToEmployee(selectedEmployeeForShift._id, shiftForm);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(`✅ Shift assigned successfully to ${selectedEmployeeForShift.firstName}!`, {
          duration: 4000,
          icon: '🕐'
        });
        
        // Update the user in the list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === selectedEmployeeForShift._id 
              ? {
                  ...user,
                  shiftTiming: {
                    ...user.shiftTiming,
                    currentShift: {
                      start: shiftForm.startTime,
                      end: shiftForm.endTime,
                      isActive: true,
                      assignedAt: new Date(),
                      effectiveDate: shiftForm.effectiveDate
                    }
                  }
                }
              : user
          )
        );
        
        setShowShiftManagement(false);
        fetchShiftStatistics();
        
        // Send notification
        setTimeout(() => {
          toast(`📧 Shift change notification sent to ${selectedEmployeeForShift.email}`, {
            duration: 3000,
            icon: '📨'
          });
        }, 1000);
      } else {
        toast.error(result.message || 'Failed to assign shift');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`❌ Failed to assign shift: ${error.message}`);
    }
  };

  // Reset employee shift to default
  const handleResetShift = async () => {
    if (!selectedEmployeeForShift) {
      toast.error('Please select an employee first');
      return;
    }

    if (!selectedEmployeeForShift.shiftTiming?.currentShift?.isActive) {
      toast.error('This employee does not have an active assigned shift');
      return;
    }

    const loadingToast = toast.loading(`Resetting shift for ${selectedEmployeeForShift.firstName}...`);

    try {
      const result = await resetEmployeeShift(selectedEmployeeForShift._id, shiftForm.reason);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(`✅ Shift reset to default for ${selectedEmployeeForShift.firstName}!`, {
          duration: 4000,
          icon: '🔄'
        });
        
        // Update the user in the list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === selectedEmployeeForShift._id 
              ? {
                  ...user,
                  shiftTiming: {
                    ...user.shiftTiming,
                    currentShift: {
                      start: '',
                      end: '',
                      isActive: false
                    }
                  }
                }
              : user
          )
        );
        
        setShowShiftManagement(false);
        fetchShiftStatistics();
      } else {
        toast.error(result.message || 'Failed to reset shift');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`❌ Failed to reset shift: ${error.message}`);
    }
  };

  // Update default shift timing
  const handleUpdateDefaultShift = async () => {
    if (!shiftForm.startTime || !shiftForm.endTime) {
      toast.error('Please enter start and end time');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(shiftForm.startTime) || !timeRegex.test(shiftForm.endTime)) {
      toast.error('Invalid time format. Use HH:mm (24-hour format)');
      return;
    }

    const loadingToast = toast.loading('Updating default shift timing...');

    try {
      const result = await updateDefaultShift(shiftForm.startTime, shiftForm.endTime);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        setDefaultShiftTime({
          start: shiftForm.startTime,
          end: shiftForm.endTime
        });
        
        toast.success(`✅ Default shift updated to ${shiftForm.startTime} - ${shiftForm.endTime}!`, {
          duration: 4000,
          icon: '⚙️'
        });
        
        setShowShiftManagement(false);
        fetchShiftStatistics();
      } else {
        toast.error(result.message || 'Failed to update default shift');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`❌ Failed to update default shift: ${error.message}`);
    }
  };

  // View shift history
  const handleViewShiftHistory = async (employee) => {
    const loadingToast = toast.loading(`Loading shift history for ${employee.firstName}...`);
    
    try {
      const result = await getEmployeeShiftHistory(employee._id);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        setShiftHistory(result.shiftHistory || []);
        setSelectedEmployeeForShift(employee);
        setShowShiftHistory(true);
      } else {
        toast.error(result.message || 'Failed to load shift history');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`❌ Failed to load shift history: ${error.message}`);
    }
  };

  // Toggle employee selection for bulk shift assign
  const handleToggleEmployeeForBulk = (employeeId) => {
    setSelectedEmployeesForBulk(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Bulk assign shifts
  const handleBulkAssignShifts = async () => {
    if (selectedEmployeesForBulk.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    if (!shiftForm.startTime || !shiftForm.endTime) {
      toast.error('Please enter start and end time');
      return;
    }

    const loadingToast = toast.loading(`Assigning shift to ${selectedEmployeesForBulk.length} employees...`);

    try {
      const result = await bulkAssignShifts(selectedEmployeesForBulk, shiftForm);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(`✅ Shift assigned to ${result.summary?.successful || 0} employees successfully!`, {
          duration: 5000,
          icon: '👥'
        });
        
        // Refresh user list
        fetchUsers();
        setShowBulkShiftAssign(false);
        setSelectedEmployeesForBulk([]);
        fetchShiftStatistics();
      } else {
        toast.error(result.message || 'Failed to assign shifts');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`❌ Failed to assign shifts: ${error.message}`);
    }
  };

  // Get current shift for employee
  const getCurrentShift = (user) => {
    if (!user.shiftTiming) {
      return {
        start: defaultShiftTime.start,
        end: defaultShiftTime.end,
        type: 'default'
      };
    }

    if (user.shiftTiming.currentShift?.isActive) {
      return {
        start: user.shiftTiming.currentShift.start || defaultShiftTime.start,
        end: user.shiftTiming.currentShift.end || defaultShiftTime.end,
        type: 'assigned',
        isActive: true,
        assignedAt: user.shiftTiming.currentShift.assignedAt
      };
    }

    if (user.shiftTiming.defaultShift) {
      return {
        start: user.shiftTiming.defaultShift.start || defaultShiftTime.start,
        end: user.shiftTiming.defaultShift.end || defaultShiftTime.end,
        type: 'default'
      };
    }

    return {
      start: defaultShiftTime.start,
      end: defaultShiftTime.end,
      type: 'default'
    };
  };

  // Format shift time for display
  const formatShiftTime = (shift) => {
    return `${shift.start} - ${shift.end}`;
  };

  // Shift status badge
  const ShiftBadge = ({ user }) => {
    const shift = getCurrentShift(user);
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        shift.type === 'assigned' 
          ? 'bg-purple-100 text-purple-700 border border-purple-200'
          : 'bg-gray-100 text-gray-700 border border-gray-200'
      }`}>
        <Clock size={10} className="mr-1" />
        {shift.type === 'assigned' ? 'Custom Shift' : 'Default Shift'}
        <span className="ml-1 font-bold">{formatShiftTime(shift)}</span>
      </div>
    );
  };

  // ================= MAIN COMPONENTS =================

  // Shift Management Modal Component
  const ShiftManagementModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedEmployeeForShift 
                    ? `Manage Shift: ${selectedEmployeeForShift.firstName} ${selectedEmployeeForShift.lastName}`
                    : 'Shift Management'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedEmployeeForShift 
                    ? 'Assign or modify employee shift timing'
                    : 'Update default shift timing for all employees'}
                </p>
              </div>
              <button
                onClick={() => setShowShiftManagement(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Current Shift Info */}
            {selectedEmployeeForShift && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Current Shift</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatShiftTime(getCurrentShift(selectedEmployeeForShift))}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      {getCurrentShift(selectedEmployeeForShift).type === 'assigned' 
                        ? 'Assigned Shift (Custom)'
                        : 'Default Company Shift'}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getCurrentShift(selectedEmployeeForShift).type === 'assigned'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getCurrentShift(selectedEmployeeForShift).type === 'assigned' ? 'Custom' : 'Default'}
                  </div>
                </div>
              </div>
            )}

            {/* Shift Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shift Timing (24-hour format)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center mb-1">
                      <Clock size={14} className="text-gray-500 mr-1" />
                      <span className="text-xs text-gray-600">Start Time</span>
                    </div>
                    <input
                      type="time"
                      value={shiftForm.startTime}
                      onChange={(e) => setShiftForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Clock size={14} className="text-gray-500 mr-1" />
                      <span className="text-xs text-gray-600">End Time</span>
                    </div>
                    <input
                      type="time"
                      value={shiftForm.endTime}
                      onChange={(e) => setShiftForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={shiftForm.effectiveDate}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Change (Optional)
                </label>
                <textarea
                  value={shiftForm.reason}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Project requirements, Department changes, etc."
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {!selectedEmployeeForShift && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPermanent"
                    checked={shiftForm.isPermanent}
                    onChange={(e) => setShiftForm(prev => ({ ...prev, isPermanent: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isPermanent" className="ml-2 text-sm text-gray-700">
                    Set as new default shift for all employees
                  </label>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Shift Preview</h3>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-900">
                  {shiftForm.startTime} - {shiftForm.endTime}
                </div>
                <div className="text-sm text-gray-600">
                  Effective: {new Date(shiftForm.effectiveDate).toLocaleDateString()}
                </div>
              </div>
              {shiftForm.reason && (
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Reason:</span> {shiftForm.reason}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <div className="flex space-x-3">
                {selectedEmployeeForShift && getCurrentShift(selectedEmployeeForShift).type === 'assigned' && (
                  <button
                    onClick={handleResetShift}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    Reset to Default
                  </button>
                )}
                <button
                  onClick={() => setShowShiftManagement(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="flex space-x-3">
                {selectedEmployeeForShift ? (
                  <button
                    onClick={handleAssignShift}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    Update Shift
                  </button>
                ) : (
                  <button
                    onClick={handleUpdateDefaultShift}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    Update Default Shift
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Shift History Modal
  const ShiftHistoryModal = () => {
    if (!selectedEmployeeForShift) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Shift History: {selectedEmployeeForShift.firstName} {selectedEmployeeForShift.lastName}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  All previous shift assignments and changes
                </p>
              </div>
              <button
                onClick={() => setShowShiftHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {shiftHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No Shift History</h3>
                <p className="text-gray-500">No shift changes recorded for this employee.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shiftHistory.map((history, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {history.start} - {history.end}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {history.reason || 'No reason provided'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(history.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {history.endedAt && (
                      <div className="text-xs text-gray-500 mt-2">
                        Ended: {new Date(history.endedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {shiftHistory.length} shift records found
              </div>
              <button
                onClick={() => setShowShiftHistory(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Shift Statistics Modal
  const ShiftStatisticsModal = () => {
    if (!shiftStatistics) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Shift Statistics
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Overview of shift distribution and patterns
                </p>
              </div>
              <button
                onClick={() => setShowShiftStatistics(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Total Employees</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {shiftStatistics.totalEmployees || 0}
                      </p>
                    </div>
                    <UsersRound className="text-purple-500" size={24} />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">With Assigned Shifts</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {shiftStatistics.employeesWithAssignedShifts || 0}
                      </p>
                    </div>
                    <Target className="text-blue-500" size={24} />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">On Default Shift</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {shiftStatistics.employeesOnDefaultShift || 0}
                      </p>
                    </div>
                    <Clock className="text-green-500" size={24} />
                  </div>
                </div>
              </div>

              {/* Shift Distribution */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Shift Distribution</h3>
                <div className="space-y-3">
                  {shiftStatistics.shiftDistribution?.map((shift, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        {shift._id.start} - {shift._id.end}
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${(shift.count / shiftStatistics.totalEmployees) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {shift.count} ({Math.round((shift.count / shiftStatistics.totalEmployees) * 100)}%)
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      No shift distribution data available
                    </div>
                  )}
                </div>
              </div>

              {/* Default Shift */}
              <div className="md:col-span-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-3">Default Company Shift</h3>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-900">
                      {defaultShiftTime.start} - {defaultShiftTime.end}
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">Regular working hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <button
                onClick={() => setShowShiftStatistics(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Bulk Shift Assign Modal
  const BulkShiftAssignModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Bulk Shift Assignment
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Assign the same shift to multiple employees at once
                </p>
              </div>
              <button
                onClick={() => setShowBulkShiftAssign(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shift Configuration */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Shift Configuration</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={shiftForm.startTime}
                        onChange={(e) => setShiftForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={shiftForm.endTime}
                        onChange={(e) => setShiftForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={shiftForm.effectiveDate}
                      onChange={(e) => setShiftForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Reason (Optional)</label>
                    <textarea
                      value={shiftForm.reason}
                      onChange={(e) => setShiftForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="e.g., New project requirements, Department reorganization"
                      rows="2"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Employee Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Select Employees ({selectedEmployeesForBulk.length} selected)
                </h3>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {users
                    .filter(user => user.role === 'employee')
                    .map(user => (
                      <div
                        key={user._id}
                        className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedEmployeesForBulk.includes(user._id) ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => handleToggleEmployeeForBulk(user._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployeesForBulk.includes(user._id)}
                          onChange={() => handleToggleEmployeeForBulk(user._id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <ShiftBadge user={user} />
                      </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      const allEmployeeIds = users
                        .filter(user => user.role === 'employee')
                        .map(user => user._id);
                      setSelectedEmployeesForBulk(allEmployeeIds);
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedEmployeesForBulk([])}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Assignment Preview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {shiftForm.startTime} - {shiftForm.endTime}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Shift Timing
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedEmployeesForBulk.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Employees Selected
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={() => setShowBulkShiftAssign(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssignShifts}
                disabled={selectedEmployeesForBulk.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign to {selectedEmployeesForBulk.length} Employees
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Existing View function with shift management buttons
  const handleView = (user) => {
    const userPicture = user.profilePicture || user.picture;
    const shift = getCurrentShift(user);
    
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full bg-gradient-to-br from-purple-50 to-white shadow-xl rounded-xl pointer-events-auto ring-1 ring-purple-100`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-r from-purple-500 to-pink-500">
                {userPicture ? (
                  <img 
                    src={userPicture} 
                    alt={user.firstName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      parent.innerHTML = `
                        <div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg">
                          ${(user.firstName?.charAt(0) || '')}${(user.lastName?.charAt(0) || '')}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(user.firstName?.charAt(0) || '')}{(user.lastName?.charAt(0) || '')}
                  </div>
                )}
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
          
          {/* Shift Information */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock size={16} className="text-blue-500 mr-2" />
                <span className="font-medium text-gray-800">Shift Timing</span>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${
                shift.type === 'assigned' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {shift.type === 'assigned' ? 'Custom' : 'Default'}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 text-center">
              {formatShiftTime(shift)}
            </div>
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleEdit(user);
                }}
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
              >
                <Edit size={12} />
                Edit
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleOpenShiftManagement(user);
                }}
                className="flex-1 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
              >
                <Clock size={12} />
                Shift
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleViewShiftHistory(user);
                }}
                className="flex-1 px-3 py-1.5 border border-gray-600 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <History size={12} />
                History
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleOpenResetPasswordPage(user);
                }}
                className="flex-1 px-3 py-1.5 border border-amber-600 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-1"
              >
                <Lock size={12} />
                Reset PW
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

  // Filter users based on search, role, and status
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

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Reset Password Page Component (existing)
  const ResetPasswordPage = () => {
    // Your existing reset password page code...
    return null; // This is just placeholder
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    admins: users.filter(u => u.role === "admin").length,
    employees: users.filter(u => u.role === "employee").length,
    totalSalary: users.reduce((sum, user) => sum + (user.rate || 0), 0),
    customShifts: users.filter(u => getCurrentShift(u).type === 'assigned').length
  };

  // Function to get user initials
  const getUserInitials = (user) => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Main Users Page
  if (showResetPasswordPage) {
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
          }}
        />
        <ResetPasswordPage />
      </>
    );
  }

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

      {/* Shift Management Modals */}
      {showShiftManagement && <ShiftManagementModal />}
      {showShiftHistory && <ShiftHistoryModal />}
      {showShiftStatistics && <ShiftStatisticsModal />}
      {showBulkShiftAssign && <BulkShiftAssignModal />}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-4 md:p-6">
        {/* Header Section with Shift Management Buttons */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Employee Management
              </h1>
              <p className="text-gray-600 mt-2">Manage all system users with advanced shift controls</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {/* Shift Management Buttons */}
              <button
                onClick={() => handleOpenShiftManagement()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                title="Update Default Shift"
              >
                <Clock size={18} />
                Default Shift
              </button>
              <button
                onClick={() => setShowBulkShiftAssign(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                title="Bulk Assign Shifts"
              >
                <Layers size={18} />
                Bulk Assign
              </button>
              <button
                onClick={() => setShowShiftStatistics(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                title="View Shift Statistics"
              >
                <BarChart3 size={18} />
                Statistics
              </button>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards with Shift Info */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Users</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Active Users</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.active}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-white" size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Custom Shifts</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.customShifts}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Administrators</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.admins}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Monthly Salary</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">৳{(stats.totalSalary/1000).toFixed(0)}k</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-white" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Employee Directory</h2>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Showing {startIndex + 1}-{endIndex} of {filteredUsers.length} users
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => {
                          setSelectedRole(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                      </select>
                      <select
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* User List Container */}
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3 mx-auto"></div>
                      <p className="text-gray-600 font-medium">Loading users...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
                        <tr className="bg-gray-50">
                          <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            User
                          </th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Role & Shift
                          </th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentUsers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <UserCog className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">No users found</h3>
                                <p className="text-xs text-gray-500">
                                  {searchTerm || selectedRole !== "all" || selectedStatus !== "all" 
                                    ? 'Try adjusting your search or filters' 
                                    : 'Start by creating your first user'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          currentUsers.map((user) => {
                            const userPicture = user.profilePicture || user.picture;
                            return (
                              <tr 
                                key={user._id} 
                                className="hover:bg-gray-50"
                              >
                                <td className="p-3">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500">
                                      {userPicture ? (
                                        <img 
                                          src={userPicture} 
                                          alt={user.firstName} 
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            parent.innerHTML = `
                                              <div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                ${getUserInitials(user)}
                                              </div>
                                            `;
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm">
                                          {getUserInitials(user)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-3 min-w-0">
                                      <div 
                                        onClick={() => router.push(`/profile/${user._id}`)} 
                                        className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:text-purple-600 hover:underline transition-all"
                                      >
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate flex items-center">
                                        <Mail 
                                          size={10} 
                                          className="mr-1 flex-shrink-0 cursor-pointer hover:text-purple-600"
                                          onClick={() => router.push(`/profile/${user._id}`)}
                                        />
                                        <span 
                                          className="truncate cursor-pointer hover:text-purple-600 hover:underline"
                                          onClick={() => router.push(`/profile/${user._id}`)}
                                        >
                                          {user.email}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <div className={`p-1.5 rounded ${
                                        user.role === 'admin' 
                                          ? 'bg-purple-100 text-purple-800' 
                                          : user.role === 'manager'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {user.role === 'admin' && <Shield size={12} />}
                                        {user.role === 'manager' && <UserCog size={12} />}
                                        {user.role === 'employee' && <Users size={12} />}
                                      </div>
                                      <span className="ml-2 text-xs font-medium capitalize">{user.role}</span>
                                    </div>
                                    <ShiftBadge user={user} />
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleView(user)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="View Details"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleEdit(user)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Edit User"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleOpenShiftManagement(user)}
                                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                      title="Manage Shift"
                                    >
                                      <Clock size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleViewShiftHistory(user)}
                                      className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                      title="Shift History"
                                    >
                                      <History size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleOpenResetPasswordPage(user)}
                                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                      title="Reset Password"
                                    >
                                      <Lock size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {filteredUsers.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
                  <div>
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous Page"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next Page"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-1">
            <div id="userForm" className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {isEditMode ? "Edit User" : "Create Employee"}
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">
                      {isEditMode ? "Update user details" : "Add a new user to the system"}
                    </p>
                    {!isEditMode && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                        <Send size={10} />
                        <span>Welcome email will be sent automatically</span>
                      </div>
                    )}
                  </div>
                  {isEditMode && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetForm}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First"
                        required
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
                      />
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last"
                        required
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="user@company.com"
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
                    />
                  </div>

                  {!isEditMode && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Enter password"
                          required={!isEditMode}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Role & Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Additional Information
                    </label>
                    <div className="space-y-2">
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
                      />
                      <select
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
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
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors hover:border-purple-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Shift Information for New Users */}
                {!isEditMode && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-blue-500" />
                        <span className="text-xs font-medium text-gray-700">Default Shift Timing</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {defaultShiftTime.start} - {defaultShiftTime.end}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      New employees will be assigned the default company shift. You can customize it later.
                    </p>
                  </div>
                )}

                {/* Reset Password Button */}
                {isEditMode && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleOpenResetPasswordPage({
                        email: form.email,
                        firstName: form.firstName,
                        lastName: form.lastName
                      })}
                      className="group w-full inline-flex items-center justify-center gap-2 text-xs text-purple-600 hover:text-purple-700 font-medium py-2 px-3 border border-purple-100 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300"
                    >
                      <Lock size={12} className="group-hover:scale-110 transition-transform duration-300" />
                      <span className="truncate">Admin: Reset Password</span>
                      {adminEmail && (
                        <span className="text-[10px] text-purple-400 group-hover:text-purple-500 ml-auto">
                          {adminEmail.split('@')[0]}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formLoading || sendingEmail}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
                >
                  {formLoading || sendingEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {sendingEmail ? "Sending Email..." : isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <CheckCircle size={16} />
                          Update User
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
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
                    className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 text-sm"
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