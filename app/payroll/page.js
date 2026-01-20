// app/payroll/page.js
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
  Home,
  Settings,
  LogOut,
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
  Percent
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
    myPayrolls: false
  });
  
  const [apiConnected, setApiConnected] = useState(false);
  const [isEmployeeView, setIsEmployeeView] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showMonthYearViewModal, setShowMonthYearViewModal] = useState(false);
  const [showMonthYearDetails, setShowMonthYearDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Selected Items
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedMonthYearForView, setSelectedMonthYearForView] = useState({ month: '', year: '' });
  const [monthYearPayrolls, setMonthYearPayrolls] = useState([]);
  const [employeePayrolls, setEmployeePayrolls] = useState([]);
  
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
  
  const [selectedMonthYear, setSelectedMonthYear] = useState({ month: '', year: '' });
  const [exportFormat, setExportFormat] = useState('json');
  
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
    } else if (statusLower.includes('rejected')) {
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
        // Token expired
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
      // Check authentication
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Set user role
      const adminToken = localStorage.getItem('adminToken');
      const employeeToken = localStorage.getItem('employeeToken');
      
      if (adminToken) {
        setUserRole('admin');
        setIsEmployeeView(false);
      } else if (employeeToken) {
        setUserRole('employee');
        setIsEmployeeView(true);
      }
      
      // Get user info
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
      
      // Load data
      await checkApiConnection();
      if (userRole === 'admin') {
        await loadEmployees();
      }
      await loadPayrolls();
    };
    
    initApp();
  }, [userRole]);

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
        
        // Filter active employees
        const activeEmployees = employeesData.filter(emp => {
          if (!emp || !emp._id) return false;
          // Accept employees with any status except Inactive
          return emp.status !== 'Inactive' && emp.status !== 'Terminated';
        });
        
        setEmployees(activeEmployees);
        
        // Create salary map
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

  // ==================== FIXED: LOAD PAYROLLS FOR EMPLOYEE ====================
  const loadPayrolls = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    
    try {
      if (isEmployeeView) {
        // Employee view: Load only their payrolls
        await loadEmployeePayrolls();
      } else {
        // Admin view: Load all payrolls
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
      console.log('🔍 Loading payrolls for employee view...');
      
      // Option 1: Try the my-payrolls endpoint
      let response = await apiRequest('GET', '/my-payrolls');
      
      if (response && response.status === 'success') {
        console.log('✅ My payrolls response:', response);
        
        let payrollsData = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          payrollsData = response.data;
        } else if (response.data && Array.isArray(response.data.payrolls)) {
          payrollsData = response.data.payrolls;
        } else if (Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        } else if (response.data && Array.isArray(response.data)) {
          payrollsData = response.data;
        }
        
        console.log(`✅ Found ${payrollsData.length} payrolls for employee`);
        
        // Ensure each payroll has required fields
        const processedPayrolls = payrollsData.map(payroll => ({
          ...payroll,
          employeeName: payroll.employeeName || getEmployeeName(payroll.employee) || userData?.firstName || 'Unknown',
          department: payroll.department || userData?.department || 'General',
          designation: payroll.designation || userData?.designation || 'Employee',
          employeeId: payroll.employeeId || userData?.employeeId || 'N/A'
        }));
        
        setPayrolls(processedPayrolls);
        calculateStats(processedPayrolls);
        
        toast.success(`Loaded ${processedPayrolls.length} of your payrolls`);
        return;
      }
      
      // Option 2: If my-payrolls fails, try to get employee ID and use employee endpoint
      if (userId) {
        console.log('🔄 Trying employee-specific endpoint with ID:', userId);
        response = await apiRequest('GET', `/payroll/employee/${userId}`);
        
        if (response && response.status === 'success') {
          let payrollsData = [];
          
          if (Array.isArray(response.data)) {
            payrollsData = response.data;
          } else if (response.data && Array.isArray(response.data.payrolls)) {
            payrollsData = response.data.payrolls;
          } else if (Array.isArray(response.payrolls)) {
            payrollsData = response.payrolls;
          }
          
          console.log(`✅ Found ${payrollsData.length} payrolls via employee endpoint`);
          
          const processedPayrolls = payrollsData.map(payroll => ({
            ...payroll,
            employeeName: payroll.employeeName || getEmployeeName(payroll.employee) || userData?.firstName || 'Unknown',
            department: payroll.department || userData?.department || 'General',
            designation: payroll.designation || userData?.designation || 'Employee'
          }));
          
          setPayrolls(processedPayrolls);
          calculateStats(processedPayrolls);
          
          toast.success(`Loaded ${processedPayrolls.length} of your payrolls`);
          return;
        }
      }
      
      // Option 3: If all else fails, show empty state with helpful message
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

  const loadAllPayrolls = async () => {
    try {
      // Build query parameters
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
      
      console.log('🔍 Loading all payrolls from:', endpoint);
      
      const response = await apiRequest('GET', endpoint);
      
      if (response && response.status === 'success') {
        console.log('✅ All payrolls response:', response);
        
        let payrollsData = [];
        
        if (response.data && Array.isArray(response.data.payrolls)) {
          payrollsData = response.data.payrolls;
        } else if (Array.isArray(response.data)) {
          payrollsData = response.data;
        } else if (Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        }
        
        console.log(`✅ Found ${payrollsData.length} payrolls for admin`);
        
        // Enrich payroll data with employee information
        const enrichedPayrolls = payrollsData.map(payroll => {
          const employee = employees.find(e => e._id === payroll.employee);
          return {
            ...payroll,
            employeeName: payroll.employeeName || getEmployeeName(employee) || getEmployeeName(payroll),
            department: payroll.department || employee?.department || 'General',
            designation: payroll.designation || employee?.designation || 'Employee',
            employeeId: payroll.employeeId || employee?.employeeId || 'N/A'
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
    const totalRejected = payrollData.filter(p => p.status?.toLowerCase() === 'rejected').length;
    
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
        
        // Refresh payrolls
        await loadPayrolls();
        
        // Reset form
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
        
        // Handle specific error cases
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
      
      // Call backend calculation API
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
        
        // Refresh payrolls
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
        // Update local state
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
          // Create JSON file download
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

  // ==================== VIEW FUNCTIONS ====================
  const loadEmployeeSpecificPayrolls = async (employeeId) => {
    if (!employeeId) return [];
    try {
      const response = await apiRequest('GET', `/payroll/employee/${employeeId}`);
      return response?.payrolls || response?.data || [];
    } catch (error) {
      console.error('Error loading employee payrolls:', error);
      return [];
    }
  };

  const handleViewEmployeePayrolls = async (employee) => {
    setSelectedEmployeeForPayroll(employee);
    const filtered = await loadEmployeeSpecificPayrolls(employee._id);
    setEmployeePayrolls(filtered);
    setShowEmployeeDetails(true);
  };

  const handleViewMonthYearPayrolls = async (month, year) => {
    try {
      const response = await apiRequest('GET', '/payroll/all', {
        params: { month, year }
      });
      
      let filtered = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          filtered = response.data;
        } else if (response.data.payrolls && Array.isArray(response.data.payrolls)) {
          filtered = response.data.payrolls;
        }
      }
      
      setMonthYearPayrolls(filtered);
      setSelectedMonthYearForView({ month, year });
      setShowMonthYearDetails(true);
    } catch (error) {
      console.error('Error loading month year payrolls:', error);
      toast.error('Failed to load payrolls');
    }
  };

  const handleRefresh = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    await loadPayrolls();
    if (userRole === 'admin') {
      await loadEmployees();
    }
  };

  // ==================== FILTERED PAYROLLS ====================
  const filteredPayrolls = payrolls.filter(payroll => {
    const employeeName = (payroll.employeeName || getEmployeeName(payroll)).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || payroll.status === selectedStatus;
    const matchesDepartment = selectedDepartment === "all" || payroll.department === selectedDepartment;
    
    // For employee view, only show their payrolls
    if (isEmployeeView) {
      return matchesSearch && matchesStatus;
    }
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // ==================== RENDER MODALS ====================
  // ... (Modal rendering functions remain the same as before)
  // Due to character limit, I'll show the most important modal - Create Modal

  const renderCreateModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Payroll</h2>
              <p className="text-gray-500 text-sm mt-1">Auto-calculated with 23 Days Month</p>
            </div>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
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

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Paid", label: "Paid" },
    { value: "Processing", label: "Processing" },
    { value: "Rejected", label: "Rejected" }
  ];

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    { value: "IT", label: "IT Department" },
    { value: "HR", label: "Human Resources" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" }
  ];

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Render Modals */}
      {showCreateModal && renderCreateModal()}
      
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
                    onClick={() => setShowBulkModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Users size={18} />
                    Bulk Generate
                  </button>
                  
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={18} />
                    New Payroll
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Employee View Banner */}
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

          {/* Stats Cards */}
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

        {/* Action Cards (Admin only) */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-semibold">Create Payroll</p>
                <p className="text-sm opacity-90">Save to MongoDB</p>
              </div>
              <Plus size={24} />
            </button>

            <button 
              onClick={() => setShowCalculateModal(true)} 
              disabled={loading.employees} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between disabled:opacity-50"
            >
              <div className="text-left">
                <p className="font-semibold">Calculate</p>
                <p className="text-sm opacity-90">Auto calculation</p>
              </div>
              {loading.employees ? <Loader2 size={24} className="animate-spin" /> : <Calculator size={24} />}
            </button>

            <button 
              onClick={() => setShowBulkModal(true)} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-semibold">Bulk Generate</p>
                <p className="text-sm opacity-90">All employees</p>
              </div>
              <UsersIcon size={24} />
            </button>

            <button 
              onClick={() => setShowExportModal(true)} 
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-semibold">Export Data</p>
                <p className="text-sm opacity-90">CSV/JSON format</p>
              </div>
              <DownloadCloud size={24} />
            </button>
          </div>
        )}

        {/* Payroll Table */}
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
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={isEmployeeView ? "Search your payrolls..." : "Search employees..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64 transition-all duration-300"
                  />
                </div>
                {!isEmployeeView && (
                  <div className="flex gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
                    >
                      {departmentOptions.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payrolls List */}
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
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Create Payroll
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    <tr key={payroll._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {payroll.employeeName || getEmployeeName(payroll)}
                          </div>
                          <div className="text-sm text-gray-500">{payroll.department}</div>
                          <div className="text-xs text-gray-400">{payroll.employeeId}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {getMonthName(payroll.month)} {payroll.year}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                          {payroll.status}
                        </span>
                        {payroll.payment?.paymentDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid: {formatDate(payroll.payment.paymentDate)}
                          </div>
                        )}
                      </td>
                      {userRole === 'admin' && (
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}