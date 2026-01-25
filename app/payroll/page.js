"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  FileText,
  TrendingUp,
  Banknote,
  Calculator,
  UserCheck,
  Search,
  BarChart3,
  Shield,
  CreditCard,
  Receipt,
  Building,
  BarChart,
  PieChart,
  UserPlus,
  Loader2,
  AlertTriangle,
  Users as UsersIcon,
  CalendarDays,
  Briefcase,
  Settings,
  Bell,
  User,
  MoreVertical,
  Printer,
  Mail,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Target,
  Server,
  Wifi,
  Check,
  ExternalLink,
  CheckSquare,
  UserX,
  FileSpreadsheet,
  DownloadCloud,
  Percent,
  FileDown,
  CalendarRange,
  FilterX,
  Wallet,
  EyeOff,
  FileBarChart,
  Grid,
  List,
  Layers
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function PayrollPage() {
  const router = useRouter();
  
  // State Management
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeSalaries, setEmployeeSalaries] = useState({});
  const [loading, setLoading] = useState({
    payrolls: false,
    employees: true,
    action: false,
    calculation: false,
    generate: false,
    accept: false,
    create: false,
    myPayrolls: false,
    allView: false
  });
  
  const [apiConnected, setApiConnected] = useState(false);
  const [isEmployeeView, setIsEmployeeView] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  
  // NEW STATE: Employee acceptance status
  const [employeeAcceptedStatus, setEmployeeAcceptedStatus] = useState({});
  
  // NEW STATE: Real-time updates
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAllPayrollsModal, setShowAllPayrollsModal] = useState(false);
  
  // Selected Items
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  
  // All Payrolls View
  const [allPayrollsView, setAllPayrollsView] = useState([]);
  const [viewType, setViewType] = useState('table'); // table, grid, grouped
  const [groupedBy, setGroupedBy] = useState('month'); // month, department, employee
  
  // Forms
  const [createForm, setCreateForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthlySalary: "",
    overtime: "0",
    bonus: "0",
    allowance: "0",
    notes: ""
  });
  
  const [calculateForm, setCalculateForm] = useState({
    employeeId: "",
    month: "",
    year: "",
    monthlySalary: ""
  });
  
  const [bulkForm, setBulkForm] = useState({
    month: "",
    year: ""
  });
  
  // Stats
  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalPaid: 0,
    totalRejected: 0,
    monthlyExpense: 0,
    totalNetPayable: 0,
    totalDeductions: 0,
    averageSalary: 0
  });

  // ==================== HELPER FUNCTIONS ====================
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://a2itserver.onrender.com/api/v1';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0).replace('BDT', '৳');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMonthName = (monthNumber) => {
    return monthNames[monthNumber - 1] || '';
  };

  const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown Employee';
    if (typeof employee === 'string') return employee;
    if (employee.firstName || employee.lastName) {
      return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    }
    if (employee.name) return employee.name;
    if (employee.employeeName) return employee.employeeName;
    if (employee.employee && employee.employee.firstName) {
      return `${employee.employee.firstName || ''} ${employee.employee.lastName || ''}`.trim();
    }
    return 'Unknown Employee';
  };

  const getStatusColor = (status) => {
    if (!status) return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> };
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid') || statusLower.includes('approved')) {
      return { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: <CheckCircle size={14} /> 
      };
    } else if (statusLower.includes('pending')) {
      return { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: <Clock size={14} /> 
      };
    } else if (statusLower.includes('draft')) {
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: <FileText size={14} /> 
      };
    } else if (statusLower.includes('rejected') || statusLower.includes('cancelled')) {
      return { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: <AlertCircle size={14} /> 
      };
    } else {
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: <FileText size={14} /> 
      };
    }
  };

  // ==================== AUTHENTICATION ====================
  const getUserType = () => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("adminToken")) return "admin";
      if (localStorage.getItem("employeeToken")) return "employee";
    }
    return "employee";
  };

  const getToken = () => {
    const userType = getUserType();
    const token = userType === "admin" 
      ? localStorage.getItem("adminToken") 
      : localStorage.getItem("employeeToken");
    return token || null;
  };

  // ==================== API FUNCTIONS ====================
  const apiRequest = async (method, endpoint, data = null) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method,
      headers,
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('userData');
        toast.error('Session expired. Please login again.');
        setTimeout(() => router.push('/login'), 1000);
        return null;
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  };

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const initApp = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      
      const adminToken = localStorage.getItem('adminToken');
      const employeeToken = localStorage.getItem('employeeToken');
      
      if (adminToken) {
        setUserRole('admin');
        setIsEmployeeView(false);
      } else if (employeeToken) {
        setUserRole('employee');
        setIsEmployeeView(true);
      }
      
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData);
          setUserData(parsed);
          setUserName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim());
          setUserId(parsed._id);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      await checkApiConnection();
      if (userRole === 'admin') {
        await loadEmployees();
      }
      await loadPayrolls();
      
      // Load employee accepted status from localStorage
      loadEmployeeAcceptedStatus();
    };
    
    initApp();
  }, [userRole]);

  useEffect(() => {
    // Set up periodic refresh for admin
    if (userRole === 'admin') {
      const interval = setInterval(() => {
        refreshAdminPayrolls();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [userRole, employeeAcceptedStatus]);

  // NEW FUNCTION: Load employee acceptance status from localStorage
  const loadEmployeeAcceptedStatus = () => {
    try {
      const savedStatus = localStorage.getItem('employeeAcceptedStatus');
      if (savedStatus) {
        setEmployeeAcceptedStatus(JSON.parse(savedStatus));
      }
    } catch (error) {
      console.error('Error loading employee acceptance status:', error);
    }
  };

  // NEW FUNCTION: Save employee acceptance status to localStorage
// NEW FUNCTION: Save employee acceptance status to localStorage
const saveEmployeeAcceptedStatus = (payrollId, status) => {
  try {
    const acceptedAt = new Date().toISOString();
    const updatedStatus = {
      ...employeeAcceptedStatus,
      [payrollId]: status,
      [payrollId + '_date']: acceptedAt // Store acceptance date separately
    };
    
    setEmployeeAcceptedStatus(updatedStatus);
    localStorage.setItem('employeeAcceptedStatus', JSON.stringify(updatedStatus));
    
    // Also update payroll in localStorage for persistence
    const payrollsData = localStorage.getItem('payrolls_backup');
    if (payrollsData) {
      try {
        const parsed = JSON.parse(payrollsData);
        const updated = parsed.map(p => 
          p._id === payrollId ? {
            ...p,
            status: 'Paid',
            employeeAccepted: { accepted: true, acceptedAt },
            payment: {
              ...p.payment,
              paymentDate: acceptedAt,
              paymentMethod: 'Employee Accepted'
            }
          } : p
        );
        localStorage.setItem('payrolls_backup', JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating payrolls backup:', e);
      }
    }
    
  } catch (error) {
    console.error('Error saving employee acceptance status:', error);
  }
};

// NEW FUNCTION: Handle employee acceptance (with server API)
// NEW FUNCTION: Handle employee acceptance (with server API)
const handleEmployeeAccept = async (payrollId) => {
  if (userRole !== 'employee') {
    toast.error("Only employees can accept payrolls");
    return;
  }
  
  setLoading(prev => ({ ...prev, accept: true }));
  
  try {
    // First, save locally immediately for better UX
    saveEmployeeAcceptedStatus(payrollId, 'accepted');
    
    // Update local state immediately
    const updatedPayrolls = payrolls.map(p => 
      p._id === payrollId ? { 
        ...p, 
        status: 'Paid',
        employeeAccepted: {
          accepted: true,
          acceptedAt: new Date().toISOString()
        },
        payment: {
          ...p.payment,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'Employee Accepted'
        }
      } : p
    );
    
    setPayrolls(updatedPayrolls);
    calculateStats(updatedPayrolls);
    
    // Try server API
    try {
      const response = await apiRequest('PUT', `/payroll/${payrollId}/employee-accept`, {});
      
      if (response && response.status === 'success') {
        toast.success('Payroll accepted successfully! Status updated to "Paid".', {
          icon: '✅',
          duration: 4000,
        });
        
        // Update with server response
        if (response.data) {
          const serverUpdatedPayrolls = payrolls.map(p => 
            p._id === payrollId ? { 
              ...p, 
              ...response.data,
              status: 'Paid', // Ensure status is Paid
              employeeAccepted: {
                accepted: true,
                acceptedAt: response.data.employeeAccepted?.acceptedAt || new Date().toISOString()
              }
            } : p
          );
          
          setPayrolls(serverUpdatedPayrolls);
        }
        
      } else {
        // If server fails, still keep local acceptance
        toast.success('Payroll accepted locally!', {
          icon: '✅',
          duration: 4000,
        });
      }
      
    } catch (serverError) {
      console.error('Server acceptance error:', serverError);
      // Still show success message for local acceptance
      toast.success('Payroll accepted locally! Admin will see status after refresh.', {
        icon: '✅',
        duration: 4000,
      });
    }
    
    // Broadcast to admin
    broadcastToAdmin(payrollId);
    
  } catch (error) {
    console.error('Accept payroll error:', error);
    toast.error('Failed to accept payroll. Please try again.');
  } finally {
    setLoading(prev => ({ ...prev, accept: false }));
  }
};

// Load payrolls function আপডেট করুন:
const loadAllPayrolls = async () => {
  try {
    const params = new URLSearchParams();
    if (selectedYear) params.append('year', selectedYear);
    if (selectedMonth && selectedMonth !== "all") params.append('month', selectedMonth);
    if (selectedStatus !== "all") params.append('status', selectedStatus);
    if (selectedDepartment !== "all") params.append('department', selectedDepartment);
    if (searchTerm) params.append('search', searchTerm);
    params.append('page', '1');
    params.append('limit', '100');
    
    const queryString = params.toString();
    const endpoint = '/payroll/all';
    
    const response = await apiRequest('GET', endpoint);
    
    if (response && response.status === 'success') {
      let payrollsData = [];
      
      if (response.data && Array.isArray(response.data.payrolls)) {
        payrollsData = response.data.payrolls;
      } else if (Array.isArray(response.data)) {
        payrollsData = response.data;
      } else if (Array.isArray(response.payrolls)) {
        payrollsData = response.payrolls;
      }
      
      // Check employee acceptance status - server-side data ব্যবহার করুন
      const enrichedPayrolls = payrollsData.map(payroll => {
        // Server থেকে employeeAccepted data থাকলে use করবে
        const isServerAccepted = payroll.employeeAccepted?.accepted === true;
        // Fallback: localStorage থেকে check করবে
        const isLocalAccepted = employeeAcceptedStatus[payroll._id] === 'accepted';
        
        const isAccepted = isServerAccepted || isLocalAccepted;
        
        return {
          ...payroll,
          employeeName: payroll.employeeName || getEmployeeName(employee) || getEmployeeName(payroll),
          department: payroll.department || employee?.department || 'General',
          designation: payroll.designation || employee?.designation || 'Employee',
          employeeId: payroll.employeeId || employee?.employeeId || 'N/A',
          // Server-side status use করবে, যদি employee accept করে থাকে
          status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
          employeeAccepted: {
            accepted: isAccepted,
            acceptedAt: isAccepted ? (payroll.employeeAccepted?.acceptedAt || new Date().toISOString()) : null
          }
        };
      });
      
      setPayrolls(enrichedPayrolls);
      calculateStats(enrichedPayrolls);
      
      toast.success(`Loaded ${enrichedPayrolls.length} payrolls`);
    } else {
      console.log('⚠️ No payrolls found for admin');
      setPayrolls([]);
      calculateStats([]);
      toast.info('No payroll records found');
    }
  } catch (error) {
    console.error('❌ Error loading all payrolls:', error);
    setPayrolls([]);
    calculateStats([]);
    toast.error('Failed to load payrolls');
  }
};

  // NEW FUNCTION: Simulate broadcasting to admin
  const broadcastToAdmin = (payrollId) => {
    // This simulates real-time notification to admin
    console.log(`Broadcasting payroll ${payrollId} acceptance to admin...`);
    
    // In a real app, you would use WebSocket or Server-Sent Events here
    // For now, we'll update localStorage which admin will check periodically
    const broadcastData = {
      type: 'PAYROLL_ACCEPTED',
      payrollId,
      timestamp: new Date().toISOString(),
      acceptedBy: userName || 'Employee'
    };
    
    localStorage.setItem('payroll_broadcast', JSON.stringify(broadcastData));
  };

  // NEW FUNCTION: Check for broadcasts
  const checkForBroadcasts = () => {
    try {
      const broadcastData = localStorage.getItem('payroll_broadcast');
      if (broadcastData) {
        const data = JSON.parse(broadcastData);
        if (data.type === 'PAYROLL_ACCEPTED') {
          // Update local state
          const updatedPayrolls = payrolls.map(p => 
            p._id === data.payrollId ? { 
              ...p, 
              status: 'Paid',
              employeeAccepted: true,
              acceptedAt: data.timestamp
            } : p
          );
          
          if (JSON.stringify(payrolls) !== JSON.stringify(updatedPayrolls)) {
            setPayrolls(updatedPayrolls);
            toast.info(`Employee accepted payroll: ${data.acceptedBy}`);
          }
          
          // Clear broadcast
          localStorage.removeItem('payroll_broadcast');
        }
      }
    } catch (error) {
      console.error('Error checking broadcasts:', error);
    }
  };

  // NEW FUNCTION: Refresh admin payrolls with acceptance status
  // Admin auto-refresh function
const refreshAdminPayrolls = async () => {
  if (loading.payrolls || userRole !== 'admin') return;
  
  try {
    const response = await apiRequest('GET', '/payroll/all');
    
    if (response && response.status === 'success') {
      let payrollsData = [];
      
      if (response.data && Array.isArray(response.data.payrolls)) {
        payrollsData = response.data.payrolls;
      } else if (Array.isArray(response.data)) {
        payrollsData = response.data;
      } else if (Array.isArray(response.payrolls)) {
        payrollsData = response.payrolls;
      }
      
      // Employee acceptance status check (server-side data)
      const enrichedPayrolls = payrollsData.map(payroll => {
        const isAccepted = payroll.employeeAccepted?.accepted === true;
        
        return {
          ...payroll,
          // CRITICAL: If employee accepted, status should be "Paid"
          status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
          employeeAccepted: payroll.employeeAccepted || { accepted: false }
        };
      });
      
      // Only update if there are changes
      if (JSON.stringify(payrolls) !== JSON.stringify(enrichedPayrolls)) {
        setPayrolls(enrichedPayrolls);
        calculateStats(enrichedPayrolls);
        setLastUpdated(new Date());
        
        // Show notification if new acceptances
        const newAcceptances = enrichedPayrolls.filter(p => 
          p.employeeAccepted?.accepted && 
          !payrolls.find(op => 
            op._id === p._id && 
            op.employeeAccepted?.accepted
          )
        );
        
        if (newAcceptances.length > 0) {
          toast.info(`${newAcceptances.length} payroll(s) accepted by employees`);
        }
      }
    }
  } catch (error) {
    console.error('Auto-refresh error:', error);
  }
};

  const checkApiConnection = async () => {
    try {
      const response = await fetch(API_BASE_URL, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setApiConnected(true);
        return true;
      }
    } catch (error) {
      setApiConnected(false);
      console.error('API Connection Error:', error);
      return false;
    }
  };

  // ==================== DATA LOADING ====================
  const loadEmployees = async () => {
    if (userRole !== 'admin') return;
    
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const response = await apiRequest('GET', '/admin/getAll-user');
      
      if (response && (response.users || response.data)) {
        let employeesData = [];
        
        if (response.users && Array.isArray(response.users)) {
          employeesData = response.users;
        } else if (response.data && Array.isArray(response.data)) {
          employeesData = response.data;
        }
        
        const activeEmployees = employeesData.filter(emp => {
          if (!emp || !emp._id) return false;
          return emp.status !== 'Inactive' && emp.status !== 'Terminated';
        });
        
        setEmployees(activeEmployees);
        
        const salaryMap = {};
        activeEmployees.forEach(emp => {
          if (emp._id) {
            salaryMap[emp._id] = {
              salary: emp.salary || emp.monthlySalary || emp.basicSalary || 23000,
              designation: emp.designation || emp.role || emp.position || 'Employee',
              department: emp.department || emp.departmentName || 'General',
              name: getEmployeeName(emp),
              email: emp.email || 'N/A',
              phone: emp.phone || emp.mobile || 'N/A',
              employeeId: emp.employeeId || emp.employeeCode || emp._id.substring(0, 8)
            };
          }
        });
        
        setEmployeeSalaries(salaryMap);
        
        toast.success(`Loaded ${activeEmployees.length} employees`);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const loadPayrolls = async () => {
  setLoading(prev => ({ ...prev, payrolls: true }));
  
  try {
    if (isEmployeeView) {
      await loadEmployeePayrolls();
    } else {
      await loadAllPayrolls();
    }
  } catch (error) {
    console.error('Error loading payrolls:', error);
    toast.error('Failed to load payrolls');
  } finally {
    setLoading(prev => ({ ...prev, payrolls: false }));
  }
};

 

  const loadEmployeePayrolls = async () => {
    try {
      let response = await apiRequest('GET', '/my-payrolls');
      
      if (response && response.status === 'success') {
        let payrollsData = [];
        
        if (Array.isArray(response.data)) {
          payrollsData = response.data;
        } else if (response.data && Array.isArray(response.data.payrolls)) {
          payrollsData = response.data.payrolls;
        } else if (Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        } else if (response.data && Array.isArray(response.data)) {
          payrollsData = response.data;
        }
        
        // Check employee acceptance status for each payroll
        const processedPayrolls = payrollsData.map(payroll => {
          const isAccepted = employeeAcceptedStatus[payroll._id] === 'accepted';
          return {
            ...payroll,
            employeeName: payroll.employeeName || getEmployeeName(payroll.employee) || userData?.firstName || 'Unknown',
            department: payroll.department || userData?.department || 'General',
            designation: payroll.designation || userData?.designation || 'Employee',
            employeeId: payroll.employeeId || userData?.employeeId || 'N/A',
            // If employee accepted, update status to "Paid" locally
            status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
            employeeAccepted: isAccepted
          };
        });
        
        setPayrolls(processedPayrolls);
        calculateStats(processedPayrolls);
        
        toast.success(`Loaded ${processedPayrolls.length} of your payrolls`);
        return;
      }
      
      console.log('⚠️ No payrolls found for employee');
      setPayrolls([]);
      calculateStats([]);
      
      toast.info('No payroll records found for your account. Contact HR if you believe this is an error.');
      
    } catch (error) {
      console.error('❌ Error loading employee payrolls:', error);
      setPayrolls([]);
      calculateStats([]);
      
      if (error.message?.includes('403') || error.message?.includes('401')) {
        toast.error('Access denied. Please contact administrator.');
      } else {
        toast.error('Failed to load your payrolls. Please try again.');
      }
    }
  }; 

  const loadAllPayrollsForView = async () => {
    setLoading(prev => ({ ...prev, allView: true }));
    try {
      console.log('🔍 Loading all payrolls for comprehensive view...');
      
      const response = await apiRequest('GET', '/payroll/all');
      
      if (response) {
        console.log('✅ All payrolls response:', response);
        
        let payrollsData = [];
        
        if (Array.isArray(response)) {
          payrollsData = response;
        } else if (Array.isArray(response.data)) {
          payrollsData = response.data;
        } else if (response.data && Array.isArray(response.data.payrolls)) {
          payrollsData = response.data.payrolls;
        } else if (Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        } else if (response.payrolls && Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        }
        
        console.log(`✅ Found ${payrollsData.length} total payrolls`);
        
        const processedPayrolls = payrollsData.map(payroll => {
          const employee = employees.find(e => e._id === payroll.employee) || payroll.employee;
          const isAccepted = employeeAcceptedStatus[payroll._id] === 'accepted';
          
          return {
            ...payroll,
            _id: payroll._id || payroll.id,
            employeeName: payroll.employeeName || 
                         (employee && getEmployeeName(employee)) || 
                         getEmployeeName(payroll) || 
                         'Unknown Employee',
            department: payroll.department || 
                       (employee && employee.department) || 
                       (payroll.employee && payroll.employee.department) || 
                       'General',
            designation: payroll.designation || 
                        (employee && employee.designation) || 
                        (payroll.employee && payroll.employee.designation) || 
                        'Employee',
            employeeId: payroll.employeeId || 
                       (employee && employee.employeeId) || 
                       (payroll.employee && payroll.employee.employeeId) || 
                       'N/A',
            monthName: getMonthName(payroll.month),
            netPayable: payroll.summary?.netPayable || 
                       payroll.netSalary || 
                       payroll.earnings?.total || 
                       0,
            status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
            statusColor: getStatusColor(isAccepted ? 'Paid' : (payroll.status || 'Pending')),
            employeeAccepted: isAccepted
          };
        });
        
        const sortedPayrolls = processedPayrolls.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          if (a.month !== b.month) return b.month - a.month;
          return a.employeeName.localeCompare(b.employeeName);
        });
        
        setAllPayrollsView(sortedPayrolls);
        toast.success(`Loaded ${sortedPayrolls.length} payroll records`);
      } else {
        setAllPayrollsView([]);
        toast.info('No payroll records found');
      }
    } catch (error) {
      console.error('❌ Error loading all payrolls view:', error);
      setAllPayrollsView([]);
      toast.error('Failed to load all payrolls');
    } finally {
      setLoading(prev => ({ ...prev, allView: false }));
    }
  };

  const calculateStats = (payrollData) => {
    const totalPayroll = payrollData.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    const totalDeductions = payrollData.reduce((sum, p) => {
      return sum + (p.deductions?.total || 0);
    }, 0);
    
    const totalProcessed = payrollData.length;
    const totalPending = payrollData.filter(p => p.status?.toLowerCase() === 'pending').length;
    const totalPaid = payrollData.filter(p => p.status?.toLowerCase() === 'paid').length;
    const totalRejected = payrollData.filter(p => p.status?.toLowerCase() === 'rejected' || p.status?.toLowerCase() === 'cancelled').length;
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentMonthPayrolls = payrollData.filter(p => {
      try {
        return p.month === currentMonth && p.year === currentYear;
      } catch (e) {
        return false;
      }
    });
    
    const monthlyExpense = currentMonthPayrolls.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    setStats({
      totalPayroll,
      totalDeductions,
      totalEmployees: isEmployeeView ? 1 : employees.length,
      totalProcessed,
      totalPending,
      totalPaid,
      totalRejected,
      monthlyExpense,
      totalNetPayable: totalPayroll,
      averageSalary: totalProcessed > 0 ? totalPayroll / totalProcessed : 0
    });
  };

  // ==================== PAYROLL OPERATIONS ====================
  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    
    if (userRole !== 'admin') {
      toast.error("Only admin can create payrolls");
      return;
    }
    
    setLoading(prev => ({ ...prev, create: true }));
    
    try {
      const employee = employees.find(emp => emp._id === createForm.employeeId);
      if (!employee) {
        toast.error('Selected employee not found');
        setLoading(prev => ({ ...prev, create: false }));
        return;
      }
      
      const salaryData = employeeSalaries[createForm.employeeId] || {};
      const monthlySalary = salaryData.salary || parseInt(createForm.monthlySalary) || 30000;
      
      const payrollData = {
        employeeId: createForm.employeeId,
        month: parseInt(createForm.month),
        year: parseInt(createForm.year),
        monthlySalary: monthlySalary,
        overtime: parseInt(createForm.overtime) || 0,
        bonus: parseInt(createForm.bonus) || 0,
        allowance: parseInt(createForm.allowance) || 0,
        notes: createForm.notes || `Payroll for ${monthNames[createForm.month - 1]} ${createForm.year}`
      };
      
      console.log('Creating payroll with data:', payrollData);
      
      const response = await apiRequest('POST', '/payroll/create', payrollData);
      
      if (response && response.status === 'success') {
        toast.success(response.message || 'Payroll created successfully!', {
          icon: '✅',
          duration: 3000,
        });
        
        await loadPayrolls();
        
        setCreateForm({
          employeeId: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          monthlySalary: "",
          overtime: "0",
          bonus: "0",
          allowance: "0",
          notes: ""
        });
        
        setShowCreateModal(false);
        
      } else {
        const errorMsg = response?.message || 'Failed to create payroll';
        
        if (errorMsg.includes('Payroll already exists')) {
          toast.error('❌ Payroll already exists for this employee and month!');
        } else if (errorMsg.includes('Net payable amount is 0')) {
          toast.error('❌ Cannot create payroll. Net payable amount would be 0 BDT.');
        } else {
          toast.error(`❌ ${errorMsg}`);
        }
      }
      
    } catch (error) {
      console.error('Create payroll error:', error);
      toast.error('Failed to create payroll. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const handleCalculatePayroll = async (e) => {
    e.preventDefault();
    
    if (!calculateForm.employeeId || !calculateForm.month || !calculateForm.year) {
      toast.error('Please select employee, month and year');
      return;
    }
    
    setLoading(prev => ({ ...prev, calculation: true }));
    
    try {
      const employee = employees.find(e => e._id === calculateForm.employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      const salaryData = employeeSalaries[calculateForm.employeeId] || {};
      const monthlySalary = salaryData.salary || calculateForm.monthlySalary || 30000;
      
      const month = parseInt(calculateForm.month);
      const year = parseInt(calculateForm.year);
      
      const response = await apiRequest('POST', '/payroll/calculate', {
        employeeId: calculateForm.employeeId,
        month: month,
        year: year,
        monthlySalary: monthlySalary
      });
      
      if (response && response.status === 'success') {
        const calculation = response.data;
        
        setCalculationResult({
          employeeDetails: {
            name: getEmployeeName(employee),
            employeeId: employee.employeeId || employee._id,
            department: calculation.employeeDetails?.department || salaryData.department,
            designation: calculation.employeeDetails?.designation || salaryData.designation
          },
          month: month,
          year: year,
          periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
          periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
          monthlySalary: monthlySalary,
          basicPay: calculation.calculations?.basicPay || 0,
          dailyRate: calculation.rates?.dailyRate || 0,
          hourlyRate: calculation.rates?.hourlyRate || 0,
          presentDays: calculation.attendance?.presentDays || 0,
          totalWorkingDays: calculation.attendance?.totalWorkingDays || 23,
          attendancePercentage: calculation.attendance?.attendancePercentage || 0,
          earnings: {
            basicPay: calculation.calculations?.basicPay || 0,
            overtime: calculation.calculations?.overtime?.amount || 0,
            bonus: calculation.calculations?.bonus || 0,
            allowance: calculation.calculations?.allowance || 0,
            total: calculation.calculations?.totals?.earnings || 0
          },
          deductions: {
            lateDeduction: calculation.calculations?.deductions?.late?.amount || 0,
            absentDeduction: calculation.calculations?.deductions?.absent?.amount || 0,
            leaveDeduction: calculation.calculations?.deductions?.leave?.amount || 0,
            halfDayDeduction: calculation.calculations?.deductions?.halfDay?.amount || 0,
            total: calculation.calculations?.deductions?.total || 0
          },
          summary: {
            grossEarnings: calculation.calculations?.totals?.earnings || 0,
            totalDeductions: calculation.calculations?.deductions?.total || 0,
            netPayable: calculation.calculations?.totals?.netPayable || 0
          }
        });
        
        toast.success(`Payroll calculated for ${monthNames[month - 1]} ${year}!`);
      } else {
        throw new Error(response?.message || 'Calculation failed');
      }
      
    } catch (error) {
      console.error('Calculate payroll error:', error);
      toast.error(error.message || 'Failed to calculate payroll');
    } finally {
      setLoading(prev => ({ ...prev, calculation: false }));
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    
    if (userRole !== 'admin') {
      toast.error("Only admin can bulk generate payrolls");
      return;
    }
    
    setLoading(prev => ({ ...prev, generate: true }));
    
    try {
      const month = parseInt(bulkForm.month);
      const year = parseInt(bulkForm.year);
      
      const response = await apiRequest('POST', '/payroll/bulk-generate', {
        month: month,
        year: year
      });
      
      if (response && response.status === 'success') {
        toast.success(`Created ${response.data?.summary?.created || 0} payrolls for ${monthNames[month - 1]} ${year}`);
        
        await loadPayrolls();
        
        setShowBulkModal(false);
        setBulkForm({ month: '', year: '' });
      } else {
        throw new Error(response?.message || 'Bulk generation failed');
      }
      
    } catch (error) {
      console.error('Bulk generate error:', error);
      toast.error(error.message || 'Bulk generation failed');
    } finally {
      setLoading(prev => ({ ...prev, generate: false }));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (userRole !== 'admin') {
      toast.error("Only admin can update payroll status");
      return;
    }
    
    if (!window.confirm(`Change status to ${status}?`)) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const response = await apiRequest('PUT', `/update-payroll/${id}/status`, { status });
      
      if (response && response.status === 'success') {
        const updatedPayrolls = payrolls.map(p => 
          p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
        );
        
        setPayrolls(updatedPayrolls);
        toast.success('Status updated successfully!');
      } else {
        throw new Error(response?.message || 'Update failed');
      }
      
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeletePayroll = async (id) => {
    if (userRole !== 'admin') {
      toast.error("Only admin can delete payrolls");
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this payroll?')) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const response = await apiRequest('DELETE', `/delete-payroll/${id}`);
      
      if (response && response.status === 'success') {
        const updatedPayrolls = payrolls.filter(p => p._id !== id);
        setPayrolls(updatedPayrolls);
        
        // Also remove from employeeAcceptedStatus
        const updatedStatus = { ...employeeAcceptedStatus };
        delete updatedStatus[id];
        setEmployeeAcceptedStatus(updatedStatus);
        localStorage.setItem('employeeAcceptedStatus', JSON.stringify(updatedStatus));
        
        toast.success('Payroll deleted successfully!');
        setShowDeleteModal(false);
        setSelectedPayroll(null);
      } else {
        throw new Error(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete payroll');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleExport = async () => {
    if (userRole !== 'admin') {
      toast.error("Only admin can export payroll data");
      return;
    }
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const month = selectedMonth === "all" ? new Date().getMonth() + 1 : selectedMonth;
      const year = selectedYear;
      
      let endpoint = `/payroll/export/monthly?month=${month}&year=${year}&format=${exportFormat}`;
      
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      
      if (response.ok) {
        if (exportFormat === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payrolls_${month}_${year}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast.success('CSV export downloaded successfully!', {
            icon: '📥',
            duration: 3000,
          });
        } else {
          const data = await response.json();
          const dataStr = JSON.stringify(data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(dataBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payrolls_${month}_${year}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast.success('JSON export downloaded successfully!', {
            icon: '📥',
            duration: 3000,
          });
        }
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting data');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setShowExportModal(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    await loadPayrolls();
    if (userRole === 'admin') {
      await loadEmployees();
    }
    // Check for broadcasts
    checkForBroadcasts();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth("all");
    setSelectedStatus("all");
    setSelectedDepartment("all");
  };

  // ==================== FILTERED PAYROLLS ====================
  const filteredPayrolls = payrolls.filter(payroll => {
    const employeeName = (payroll.employeeName || getEmployeeName(payroll)).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase()) || 
                         (payroll.employeeId && payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || payroll.status === selectedStatus;
    const matchesDepartment = selectedDepartment === "all" || payroll.department === selectedDepartment;
    const matchesMonth = selectedMonth === "all" || payroll.month === parseInt(selectedMonth);
    const matchesYear = !selectedYear || payroll.year === parseInt(selectedYear);
    
    if (isEmployeeView) {
      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    }
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesMonth && matchesYear;
  });

  // ==================== GROUPED PAYROLLS FOR ALL VIEW ====================
  const groupedPayrolls = allPayrollsView.reduce((groups, payroll) => {
    let key;
    if (groupedBy === 'month') {
      key = `${payroll.year}-${String(payroll.month).padStart(2, '0')}`;
    } else if (groupedBy === 'department') {
      key = payroll.department || 'Unknown Department';
    } else {
      key = payroll.employeeId || 'Unknown Employee';
    }
    
    if (!groups[key]) {
      groups[key] = {
        key,
        payrolls: [],
        total: 0,
        count: 0,
        employees: new Set()
      };
    }
    
    groups[key].payrolls.push(payroll);
    groups[key].total += payroll.netPayable || 0;
    groups[key].count += 1;
    groups[key].employees.add(payroll.employeeId);
    
    return groups;
  }, {});

  // ==================== RENDER MODALS ====================
  const renderCreateModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Payroll</h2>
              <p className="text-gray-500 text-sm mt-1">Auto-calculated with 23 Days Month</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(false)} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleCreatePayroll} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
            <select
              value={createForm.employeeId}
              onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">Choose an employee</option>
              {employees.map((emp) => {
                const salaryData = employeeSalaries[emp._id] || {};
                return (
                  <option key={emp._id} value={emp._id}>
                    {getEmployeeName(emp)} • {formatCurrency(salaryData.salary || 30000)}/month
                  </option>
                );
              })}
            </select>
          </div>

          {createForm.employeeId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                <select
                  value={createForm.month}
                  onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Month</option>
                  {monthNames.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <select
                  value={createForm.year}
                  onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          )}

          {createForm.employeeId && createForm.month && createForm.year && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Payroll Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <span className="text-xs text-gray-600">Monthly Salary</span>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(employeeSalaries[createForm.employeeId]?.salary || 30000)}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <span className="text-xs text-gray-600">Month</span>
                  <p className="text-lg font-bold text-gray-900">
                    {monthNames[parseInt(createForm.month) - 1]}
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <span className="text-xs text-gray-600">Year</span>
                  <p className="text-lg font-bold text-gray-900">{createForm.year}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <span className="text-xs text-gray-600">Daily Rate</span>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(Math.round((employeeSalaries[createForm.employeeId]?.salary || 30000) / 23))}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overtime (৳)</label>
              <input
                type="number"
                name="overtime"
                value={createForm.overtime}
                onChange={(e) => setCreateForm({ ...createForm, overtime: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bonus (৳)</label>
              <input
                type="number"
                name="bonus"
                value={createForm.bonus}
                onChange={(e) => setCreateForm({ ...createForm, bonus: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowance (৳)</label>
              <input
                type="number"
                name="allowance"
                value={createForm.allowance}
                onChange={(e) => setCreateForm({ ...createForm, allowance: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              placeholder="Additional notes (optional)"
              rows="3"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              disabled={loading.create}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.create}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.create ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Payroll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCalculateModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Calculate Payroll</h2>
              <p className="text-gray-500 text-sm mt-1">Preview calculation without saving</p>
            </div>
            <button 
              onClick={() => {
                setShowCalculateModal(false);
                setCalculationResult(null);
              }} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleCalculatePayroll} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
            <select
              value={calculateForm.employeeId}
              onChange={(e) => setCalculateForm({ ...calculateForm, employeeId: e.target.value })}
              required
              disabled={loading.employees}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
            >
              <option value="">Choose an employee</option>
              {employees.map((emp) => {
                const salaryData = employeeSalaries[emp._id] || {};
                return (
                  <option key={emp._id} value={emp._id}>
                    {getEmployeeName(emp)} • {formatCurrency(salaryData.salary || 30000)}/month
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <select
                value={calculateForm.month}
                onChange={(e) => setCalculateForm({ ...calculateForm, month: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Month</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <select
                value={calculateForm.year}
                onChange={(e) => setCalculateForm({ ...calculateForm, year: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          {calculateForm.employeeId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary (৳)</label>
              <input
                type="number"
                value={calculateForm.monthlySalary || employeeSalaries[calculateForm.employeeId]?.salary || 30000}
                onChange={(e) => setCalculateForm({ ...calculateForm, monthlySalary: e.target.value })}
                placeholder="Enter monthly salary"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
              />
              <p className="text-xs text-gray-500 mt-2">
                Default salary: {formatCurrency(employeeSalaries[calculateForm.employeeId]?.salary || 30000)}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowCalculateModal(false);
                setCalculationResult(null);
              }}
              disabled={loading.calculation}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.calculation}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.calculation ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={18} />
                  Calculate Now
                </>
              )}
            </button>
          </div>
        </form>

        {calculationResult && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Result</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <h4 className="text-sm font-medium text-green-700 mb-2">Employee Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-600">Name</span>
                    <p className="font-medium">{calculationResult.employeeDetails.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Department</span>
                    <p className="font-medium">{calculationResult.employeeDetails.department}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Month</span>
                    <p className="font-medium">{monthNames[calculationResult.month - 1]} {calculationResult.year}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Working Days</span>
                    <p className="font-medium">{calculationResult.presentDays}/{calculationResult.totalWorkingDays}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Basic Pay</span>
                      <span className="font-medium">{formatCurrency(calculationResult.earnings.basicPay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overtime</span>
                      <span className="font-medium">{formatCurrency(calculationResult.earnings.overtime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Bonus</span>
                      <span className="font-medium">{formatCurrency(calculationResult.earnings.bonus)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Total Earnings</span>
                      <span className="font-bold text-blue-600">{formatCurrency(calculationResult.earnings.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                  <h4 className="text-sm font-medium text-red-700 mb-2">Deductions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Late</span>
                      <span className="font-medium">{formatCurrency(calculationResult.deductions.lateDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Absent</span>
                      <span className="font-medium">{formatCurrency(calculationResult.deductions.absentDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Leave</span>
                      <span className="font-medium">{formatCurrency(calculationResult.deductions.leaveDeduction)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Total Deductions</span>
                      <span className="font-bold text-red-600">{formatCurrency(calculationResult.deductions.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-purple-700">Net Payable</h4>
                    <p className="text-xs text-gray-500">After all calculations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(calculationResult.summary.netPayable)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCreateForm({
                    employeeId: calculateForm.employeeId,
                    month: calculateForm.month,
                    year: calculateForm.year,
                    monthlySalary: calculateForm.monthlySalary || employeeSalaries[calculateForm.employeeId]?.salary || "30000",
                    overtime: "0",
                    bonus: "0",
                    allowance: "0",
                    notes: `Calculated payroll for ${monthNames[calculateForm.month - 1]} ${calculateForm.year}`
                  });
                  setShowCalculateModal(false);
                  setShowCreateModal(true);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Create Payroll from Calculation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderBulkModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Generate Payrolls</h2>
              <p className="text-gray-500 text-sm mt-1">Generate payrolls for all active employees</p>
            </div>
            <button 
              onClick={() => setShowBulkModal(false)} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleBulkGenerate} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <select
                value={bulkForm.month}
                onChange={(e) => setBulkForm({ ...bulkForm, month: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">Select Month</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <select
                value={bulkForm.year}
                onChange={(e) => setBulkForm({ ...bulkForm, year: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <h4 className="text-sm font-medium text-green-700 mb-2">Generation Info</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Will create payrolls for {employees.length} active employees
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Existing payrolls will be skipped
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Uses 23 days fixed calculation basis
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Automatic attendance calculation
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              disabled={loading.generate}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.generate}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.generate ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Generate All
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderExportModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Payroll Data</h2>
              <p className="text-gray-500 text-sm mt-1">Download payroll records</p>
            </div>
            <button 
              onClick={() => setShowExportModal(false)} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-4 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${exportFormat === 'json' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <FileText size={18} />
                JSON
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-4 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${exportFormat === 'csv' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <FileSpreadsheet size={18} />
                CSV
              </button>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <h4 className="text-sm font-medium text-orange-700 mb-2">Export Details</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Selected Month:</span>
                <span className="font-medium">{selectedMonth === "all" ? "All Months" : monthNames[selectedMonth - 1]}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Year:</span>
                <span className="font-medium">{selectedYear}</span>
              </div>
              <div className="flex justify-between">
                <span>Records:</span>
                <span className="font-medium">{filteredPayrolls.length} payrolls</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              disabled={loading.action}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading.action}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.action ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsModal = () => {
    if (!selectedPayroll) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {getMonthName(selectedPayroll.month)} {selectedPayroll.year} • {selectedPayroll.employeeName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayroll.status).bg} ${getStatusColor(selectedPayroll.status).text}`}>
                  {selectedPayroll.status}
                </span>
                {selectedPayroll.employeeAccepted && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Accepted by Employee
                  </span>
                )}
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-3">Employee Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="font-medium">{selectedPayroll.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Employee ID</span>
                    <span className="font-medium">{selectedPayroll.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="font-medium">{selectedPayroll.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Designation</span>
                    <span className="font-medium">{selectedPayroll.designation}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <h3 className="text-sm font-medium text-purple-700 mb-3">Payroll Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Period</span>
                    <span className="font-medium">
                      {getMonthName(selectedPayroll.month)} {selectedPayroll.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Working Days</span>
                    <span className="font-medium">
                      {selectedPayroll.attendance?.presentDays || 23}/{selectedPayroll.attendance?.totalWorkingDays || 23}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Salary</span>
                    <span className="font-medium">
                      {formatCurrency(selectedPayroll.salaryDetails?.monthlySalary || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">Net Payable</span>
                    <span className="text-lg font-bold text-purple-600">
                      {formatCurrency(selectedPayroll.summary?.netPayable || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-3">Earnings</h3>
                <div className="space-y-2 p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Basic Pay</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.basicPay || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overtime</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.overtime?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bonus</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.bonus?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Allowance</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.allowance?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(selectedPayroll.summary?.grossEarnings || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-red-700 mb-3">Deductions</h3>
                <div className="space-y-2 p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Late Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.lateDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Absent Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.absentDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Leave Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.leaveDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Half Day Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.halfDayDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">Total Deductions</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(selectedPayroll.deductions?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Attendance Details</h3>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Total Days</span>
                    <p className="text-lg font-bold text-gray-900">{selectedPayroll.attendance?.totalWorkingDays || 23}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Present Days</span>
                    <p className="text-lg font-bold text-green-600">{selectedPayroll.attendance?.presentDays || 23}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Absent Days</span>
                    <p className="text-lg font-bold text-red-600">{selectedPayroll.attendance?.absentDays || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Attendance %</span>
                    <p className="text-lg font-bold text-blue-600">{selectedPayroll.attendance?.attendancePercentage || 100}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Close
              </button>
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-300 flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!selectedPayroll) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Payroll</h2>
                <p className="text-gray-500 text-sm mt-1">This action cannot be undone</p>
              </div>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayroll(null);
                }} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-600">
                You are about to delete payroll for <span className="font-semibold">{selectedPayroll.employeeName}</span> 
                ({getMonthName(selectedPayroll.month)} {selectedPayroll.year})
              </p>
              <p className="text-sm text-gray-500 mt-2">Amount: {formatCurrency(selectedPayroll.summary?.netPayable || 0)}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayroll(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePayroll(selectedPayroll._id)}
                disabled={loading.action}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading.action ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Payroll
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAllPayrollsModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Payroll Records</h2>
              <p className="text-gray-500 text-sm mt-1">
                Total {allPayrollsView.length} payroll records • {employees.length} employees
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAllPayrollsModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
              <div className="text-sm text-blue-600 font-medium">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="text-sm text-green-600 font-medium">Paid Payrolls</div>
              <div className="text-2xl font-bold text-gray-900">
                {allPayrollsView.filter(p => p.status?.toLowerCase() === 'paid').length}
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-gray-900">
                {allPayrollsView.filter(p => p.status?.toLowerCase() === 'pending').length}
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <div className="text-sm text-purple-600 font-medium">Avg per Payroll</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(allPayrollsView.length > 0 ? 
                  allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0) / allPayrollsView.length : 0
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search employee, department or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                />
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Years</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Months</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                {statusOptions.slice(1).map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewType('table')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${viewType === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                <List size={18} />
                Table View
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${viewType === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                <Grid size={18} />
                Grid View
              </button>
              <button
                onClick={() => setViewType('grouped')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${viewType === 'grouped' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                <Layers size={18} />
                Grouped View
              </button>
            </div>
            
            {viewType === 'grouped' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setGroupedBy('month')}
                  className={`px-3 py-1 rounded-lg ${groupedBy === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  By Month
                </button>
                <button
                  onClick={() => setGroupedBy('department')}
                  className={`px-3 py-1 rounded-lg ${groupedBy === 'department' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  By Department
                </button>
                <button
                  onClick={() => setGroupedBy('employee')}
                  className={`px-3 py-1 rounded-lg ${groupedBy === 'employee' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  By Employee
                </button>
              </div>
            )}
          </div>

          {loading.allView ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading all payroll records...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
              </div>
            </div>
          ) : allPayrollsView.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FileText className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records found</h3>
                <p className="text-gray-500">Try adjusting your filters or create new payrolls</p>
              </div>
            </div>
          ) : viewType === 'table' ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary Details
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Payable
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {allPayrollsView.map((payroll) => (
                      <tr key={payroll._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">{payroll.employeeName}</div>
                            <div className="text-sm text-gray-500">{payroll.designation}</div>
                            <div className="text-xs text-gray-400">{payroll.employeeId}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.monthName} {payroll.year}
                          </div>
                          <div className="text-xs text-gray-500">
                            Days: {payroll.attendance?.presentDays || 0}/{payroll.attendance?.totalWorkingDays || 23}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {payroll.department}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="text-gray-600">Basic: {formatCurrency(payroll.earnings?.basicPay || 0)}</div>
                            <div className="text-gray-600">Overtime: {formatCurrency(payroll.earnings?.overtime?.amount || 0)}</div>
                            <div className="text-gray-600">Bonus: {formatCurrency(payroll.earnings?.bonus?.amount || 0)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                            {getStatusColor(payroll.status).icon}
                            {payroll.status}
                          </span>
                          {payroll.employeeAccepted && (
                            <div className="text-xs text-green-600 mt-1">
                              ✓ Accepted by employee
                            </div>
                          )}
                          {payroll.payment?.paymentDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Paid: {formatDate(payroll.payment.paymentDate)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900 text-lg">
                            {formatCurrency(payroll.netPayable)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Deductions: {formatCurrency(payroll.deductions?.total || 0)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDetailsModal(true);
                                setShowAllPayrollsModal(false);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPayrollsView.map((payroll) => (
                <div key={payroll._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{payroll.employeeName}</h4>
                      <p className="text-sm text-gray-500">{payroll.designation}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                      {payroll.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Period</span>
                      <span className="font-medium">{payroll.monthName} {payroll.year}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="font-medium">{payroll.department}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Working Days</span>
                      <span className="font-medium">{payroll.attendance?.presentDays || 0}/{payroll.attendance?.totalWorkingDays || 23}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Net Payable</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(payroll.netPayable)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Basic: {formatCurrency(payroll.earnings?.basicPay || 0)}</span>
                      <span>Deductions: {formatCurrency(payroll.deductions?.total || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPayroll(payroll);
                        setShowDetailsModal(true);
                        setShowAllPayrollsModal(false);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPayrolls).map(([key, group]) => (
                <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {groupedBy === 'month' 
                          ? `${getMonthName(parseInt(key.split('-')[1]))} ${key.split('-')[0]}`
                          : key}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {group.count} payrolls • {group.employees.size} employees • Total: {formatCurrency(group.total)}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {formatCurrency(group.total)}
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Employee</th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Amount</th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.payrolls.map((payroll) => (
                          <tr key={payroll._id} className="border-t border-gray-100">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{payroll.employeeName}</div>
                                <div className="text-xs text-gray-500">{payroll.designation}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{formatCurrency(payroll.netPayable)}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                                {payroll.status}
                              </span>
                              {payroll.employeeAccepted && (
                                <div className="text-xs text-green-600 mt-1">
                                  ✓ Accepted
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setShowDetailsModal(true);
                                  setShowAllPayrollsModal(false);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Records</div>
                <div className="text-2xl font-bold text-gray-900">{allPayrollsView.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Payable Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Average per Employee</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(allPayrollsView.length > 0 ? 
                    allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0) / allPayrollsView.length : 0
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {allPayrollsView.length} records
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const csvData = [
                      ['Employee Name', 'Employee ID', 'Department', 'Month', 'Year', 'Basic Salary', 'Overtime', 'Bonus', 'Allowance', 'Deductions', 'Net Payable', 'Status', 'Payment Date', 'Employee Accepted'],
                      ...allPayrollsView.map(p => [
                        p.employeeName,
                        p.employeeId,
                        p.department,
                        p.monthName,
                        p.year,
                        p.earnings?.basicPay || 0,
                        p.earnings?.overtime?.amount || 0,
                        p.earnings?.bonus?.amount || 0,
                        p.earnings?.allowance?.amount || 0,
                        p.deductions?.total || 0,
                        p.netPayable || 0,
                        p.status,
                        p.payment?.paymentDate ? formatDate(p.payment.paymentDate) : 'N/A',
                        p.employeeAccepted ? 'Yes' : 'No'
                      ])
                    ];
                    
                    const csvContent = csvData.map(row => row.join(',')).join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `all_payrolls_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    
                    toast.success('CSV exported successfully');
                  } catch (error) {
                    toast.error('Failed to export CSV');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 flex items-center gap-2"
              >
                <FileSpreadsheet size={16} />
                Export as CSV
              </button> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  const months = [
    { value: "all", label: "All Months" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return year;
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Paid", label: "Paid" },
    { value: "Processing", label: "Processing" },
    { value: "Rejected", label: "Rejected" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    { value: "IT", label: "IT Department" },
    { value: "HR", label: "Human Resources" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" },
    { value: "Admin", label: "Administration" },
    { value: "Accounts", label: "Accounts" },
    { value: "Production", label: "Production" }
  ];

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Render Modals */}
      {showCreateModal && renderCreateModal()}
      {showCalculateModal && renderCalculateModal()}
      {showBulkModal && renderBulkModal()}
      {showDetailsModal && renderDetailsModal()}
      {showDeleteModal && renderDeleteModal()}
      {showExportModal && renderExportModal()}
      {showAllPayrollsModal && renderAllPayrollsModal()}
      
      {/* Main Page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Payroll Management
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">Manage and process employee payrolls</p>
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    userRole === 'admin' 
                      ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800' 
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                  }`}>
                    <Shield size={12} />
                    {userRole === 'admin' ? 'ADMIN' : 'EMPLOYEE'}
                    {userRole !== 'admin' && " (View Only)"}
                  </span>
                )}
                {apiConnected && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                    <Server size={10} /> API Connected
                  </span>
                )}
                {userRole === 'admin' && lastUpdated && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    Auto-refresh: 10s
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={loading.payrolls}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading.payrolls ? "animate-spin" : ""} />
                Refresh
              </button>
              
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={async () => {
                      setShowAllPayrollsModal(true);
                      await loadAllPayrollsForView();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Eye size={18} />
                    View All Payrolls
                  </button> 
                </>
              )}
            </div>
          </div>

          {isEmployeeView && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <UserCheck size={20} /> Employee Payroll View
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    {payrolls.length > 0 
                      ? `You have ${payrolls.length} payroll record(s)` 
                      : 'No payroll records found. Contact HR if you believe this is an error.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-gray-500">Employee ID: {userData?.employeeId || userId?.substring(0, 8) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Receipt size={16} /> {isEmployeeView ? 'My Payrolls' : 'Total Payrolls'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {payrolls.length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedMonth !== "all" ? getMonthName(selectedMonth) : "All Months"} {selectedYear}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Banknote size={16} /> {isEmployeeView ? 'My Total Payable' : 'Total Payable'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.totalNetPayable)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">Net amount</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Banknote className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Clock size={16} /> {isEmployeeView ? 'Pending' : 'Pending'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalPending}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(stats.totalPending / Math.max(payrolls.length, 1)) * 100 || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round((stats.totalPending / Math.max(payrolls.length, 1)) * 100) || 0}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <BarChart size={16} /> {isEmployeeView ? 'My Monthly' : 'Monthly Expense'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.monthlyExpense)}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Current month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <BarChart className="text-white" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between group"
            >
              <div className="text-left">
                <p className="font-semibold">Create Payroll</p>
                <p className="text-sm opacity-90">Single employee</p>
              </div>
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <button 
              onClick={() => setShowCalculateModal(true)} 
              disabled={loading.employees} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between group disabled:opacity-50"
            >
              <div className="text-left">
                <p className="font-semibold">Calculate</p>
                <p className="text-sm opacity-90">Preview calculation</p>
              </div>
              {loading.employees ? <Loader2 size={24} className="animate-spin" /> : <Calculator size={24} className="group-hover:scale-110 transition-transform duration-300" />}
            </button>

            <button 
              onClick={() => setShowBulkModal(true)} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between group"
            >
              <div className="text-left">
                <p className="font-semibold">Bulk Generate</p>
                <p className="text-sm opacity-90">All employees</p>
              </div>
              <UsersIcon size={24} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <h3 className="font-medium text-gray-700">Filters</h3>
              {(searchTerm || selectedMonth !== "all" || selectedStatus !== "all" || selectedDepartment !== "all" || selectedYear !== new Date().getFullYear()) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                >
                  <FilterX size={12} />
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={isEmployeeView ? "Search your payrolls..." : "Search employees or ID..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full transition-all duration-300"
                />
              </div>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[120px]"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[140px]"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              
              {!isEmployeeView && (
                <>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[140px]"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[160px]"
                  >
                    {departmentOptions.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEmployeeView ? 'My Payrolls' : 'Payroll Records'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Showing {filteredPayrolls.length} of {payrolls.length} records
                  {!isEmployeeView && (
                    <span className="ml-2 text-blue-600 font-medium">
                      {userRole === 'admin' ? '(Admin View)' : '(View Only)'}
                    </span>
                  )}
                </p>
              </div> 
            </div>
          </div>

          {loading.payrolls ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading payroll data...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
              </div>
            </div>
          ) : filteredPayrolls.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FileText className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {isEmployeeView ? 'No payroll records found' : 'No payroll records available'}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {searchTerm || selectedStatus !== 'all' || selectedDepartment !== 'all'
                    ? 'Try adjusting your search or filters' 
                    : isEmployeeView 
                      ? 'You have no payroll records yet. Contact HR for assistance.'
                      : 'Get started by creating your first payroll'}
                </p>
                {userRole === 'admin' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Create Payroll
                    </button>
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Users size={18} />
                      Bulk Generate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        Employee
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {userRole === 'admin' && (
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                            <User className="text-blue-600" size={18} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {payroll.employeeName || getEmployeeName(payroll)}
                            </div>
                            <div className="text-sm text-gray-500">{payroll.department}</div>
                            <div className="text-xs text-gray-400">{payroll.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 font-medium">
                          {getMonthName(payroll.month)} {payroll.year}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payroll.periodStart ? formatDate(payroll.periodStart) : 'N/A'} - {payroll.periodEnd ? formatDate(payroll.periodEnd) : 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(payroll.summary?.netPayable || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Basic: {formatCurrency(payroll.earnings?.basicPay || 0)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 w-fit ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                            {getStatusColor(payroll.status).icon}
                            {payroll.status}
                          </span>
                          {payroll.employeeAccepted && (
                            <div className="text-xs text-green-600 font-medium">
                              ✓ Accepted by employee
                            </div>
                          )}
                          {payroll.payment?.paymentDate && (
                            <div className="text-xs text-gray-500">
                              Paid: {formatDate(payroll.payment.paymentDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      {userRole === 'admin' && (
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {payroll.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(payroll._id, 'Approved')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                                  title="Mark as Paid"
                                >
                                  <Banknote size={18} />
                                </button>
                              </>
                            )}
                            {payroll.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateStatus(payroll._id, 'Cancelled')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                      {/* Employee View Actions */} 
{isEmployeeView && payroll.status === 'Pending' && (
  <td className="py-4 px-6">
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEmployeeAccept(payroll._id)}
        disabled={loading.accept}
        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
      >
        {loading.accept ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Accepting...
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            Accept Payroll
          </>
        )}
      </button>
    </div>
  </td>
)}
{isEmployeeView && payroll.status === 'Paid' && payroll.employeeAccepted?.accepted && (
  <td className="py-4 px-6">
    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
      ✓ Accepted on {formatDate(payroll.employeeAccepted.acceptedAt)}
    </span>
  </td>
)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Employees</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Processed This Month</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProcessed}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Average Salary</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageSalary)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Deductions</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalDeductions)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}