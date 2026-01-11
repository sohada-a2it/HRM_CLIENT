"use client"
import React, { useState, useEffect } from 'react';
import {
  DollarSign, Users, Calendar, FileText, PlusCircle, Edit, Trash2,
  Search, Filter, Download, CheckCircle, Clock, AlertCircle, X, Eye, Save,
  RefreshCw, TrendingUp, TrendingDown, UserPlus, Wallet, CreditCard,
  PieChart, BarChart3, Mail, Phone, Briefcase, Award, ChevronRight,
  Home, Settings, LogOut, Bell, User, Calculator, Loader2,
  Building, MapPin, CalendarDays, CreditCard as CardIcon, ChevronLeft,
  Shield, UserCheck, FileCheck, Receipt, Banknote, ArrowUpDown, CalendarRange,
  Users as UsersIcon, UserCog, FileSpreadsheet, BarChart, DownloadCloud,
  Percent, Clock as ClockIcon, Moon, Sun, Zap, Target, PieChart as PieChartIcon,
  Briefcase as BriefcaseIcon, Building2, Home as HomeIcon, Wallet as WalletIcon,
  Server, Wifi, WifiOff, AlertTriangle, Check, ExternalLink, 
  Calculator as CalcIcon, Zap as ZapIcon, CheckSquare
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API Configuration - সঠিক API URL ইউজ করুন
const API_BASE_URL = 'https://a2itserver.onrender.com/api/v1';

// Main Component
const Page = () => {
  const router = useRouter();
  
  // States
  const [payrolls, setPayrolls] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('payrolls');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [employees, setEmployees] = useState([]);
  const [employeeSalaries, setEmployeeSalaries] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const [loading, setLoading] = useState({
    payrolls: false,
    employees: true,
    employeeSalaries: false,
    action: false,
    calculation: false,
    generate: false,
    accept: false,
    apiCheck: true
  });
  const [apiConnected, setApiConnected] = useState(false);
  
  // User states
  const [isEmployeeView, setIsEmployeeView] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  // Attendance collection API/function এ
const recordAttendance = (employeeId, checkInTime) => {
  const checkInHour = new Date(checkInTime).getHours();
  const checkInMinute = new Date(checkInTime).getMinutes();
  
  // Check if late (after 9:30 AM)
  const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 5);
  
  const attendanceRecord = {
    employeeId,
    date: new Date().toISOString().split('T')[0],
    checkIn: checkInTime,
    checkOut: null,
    status: isLate ? 'Late' : 'Present',
    lateMinutes: isLate ? ((checkInHour - 9) * 60 + (checkInMinute - 5)) : 0,
    isLateDay: isLate ? 1 : 0 // New field: 1 if late, 0 if on time
  };
  
  return attendanceRecord;
};
// Payroll system এ attendance data process করার সময়
const processAttendanceForPayroll = (attendanceRecords) => {
  const monthlySummary = {};
  
  attendanceRecords.forEach(record => {
    const date = new Date(record.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${employeeId}_${month}_${year}`;
    
    if (!monthlySummary[key]) {
      monthlySummary[key] = {
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        totalWorkingDays: 23
      };
    }
    
    if (record.status === 'Present') {
      monthlySummary[key].presentDays += 1;
    } 
    else if (record.status === 'Late') {
      monthlySummary[key].presentDays += 1;
      monthlySummary[key].lateDays += 1; // ✅ Late day count
    }
    else if (record.status === 'Absent') {
      monthlySummary[key].absentDays += 1;
    }
  });
  
  return monthlySummary;
};
// In your payroll table or details view
const LatePolicyInfo = () => (
  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="text-yellow-600" size={18} />
      <h4 className="font-medium text-yellow-700">Late Policy</h4>
    </div>
    
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-700">Check-in before 9:5 AM = Present</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-gray-700">Check-in 9:6 AM onwards = Late</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-gray-700">
          <span className="font-semibold">3 Late days = 1 day salary deduction</span>
        </span>
      </div>
      
      <div className="mt-2 p-2 bg-white rounded border">
        <p className="text-xs text-gray-600">
          Example: If salary is 23,000 BDT and daily rate = 1,000 BDT<br/>
          3 late days → 1,000 BDT deduction
        </p>
      </div>
    </div>
  </div>
);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showMonthYearViewModal, setShowMonthYearViewModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState({ month: '', year: '' });
  
  // New modals
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null);
  const [employeePayrolls, setEmployeePayrolls] = useState([]);
  const [showMonthYearDetails, setShowMonthYearDetails] = useState(false);
  const [monthYearPayrolls, setMonthYearPayrolls] = useState([]);
  const [selectedMonthYearForView, setSelectedMonthYearForView] = useState({ month: '', year: '' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form states
  const [createForm, setCreateForm] = useState({
    employee: '',
    periodStart: '',
    periodEnd: '',
    status: 'Pending',
    notes: '',
    basicPay: '',
    monthlySalary: '',
    presentDays: 0,
    totalWorkingDays: 30, // Now 30 days
    deductions: {
      lateDeduction: 0,
      absentDeduction: 0,
      leaveDeduction: 0
    },
    earnings: {
      overtime: 0,
      bonus: 0,
      allowance: 0
    }
  });

  const [calculateForm, setCalculateForm] = useState({
    employeeId: '',
    month: '',
    year: ''
  });

  const [bulkForm, setBulkForm] = useState({
    month: '',
    year: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalPaid: 0,
    totalRejected: 0,
    monthlyExpense: 0,
    pendingSalaryRequests: 0
  });

  // Helper Functions
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('adminToken') || 
                  localStorage.getItem('employeeToken');
    
    if (token && token.startsWith('Bearer ')) {
      return token.slice(7);
    }
    return token;
  };

  const getUserRole = () => {
    if (typeof window === 'undefined') return null;
    
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) return 'admin';
    
    const employeeToken = localStorage.getItem('employeeToken');
    if (employeeToken) return 'employee';
    
    return null;
  };

  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed._id || parsed.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getUserName = () => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.firstName || parsed.lastName) {
          return `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
        }
        return parsed.name || 'User';
      } catch (e) {
        return 'User';
      }
    }
    return 'User';
  };

  // Save payrolls to localStorage
  const savePayrollsToLocalStorage = (payrollsData) => {
    try {
      localStorage.setItem('payrolls', JSON.stringify(payrollsData));
      localStorage.setItem('payrolls_last_saved', new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Create axios instance with better error handling
  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    instance.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      config.metadata = { startTime: new Date() };
      
      return config;
    });

    instance.interceptors.response.use(
      (response) => {
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;
        console.log(`✅ API ${response.config.url} took ${duration}ms`);
        return response;
      },
      (error) => {
        console.error('❌ API Error:', error.message);
        
        if (error.code === 'ECONNABORTED') {
          console.log('Request timeout');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          setTimeout(() => router.push('/login'), 1000);
        } else if (error.response?.status === 500) {
          console.log('Server error');
        } else if (!error.response) {
          console.log('Network error');
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  };

  const API = createApiInstance();

  // API Functions
  const payrollApi = {
    // Get all payrolls (admin only)
    getAllPayrolls: async () => {
      try {
        const response = await API.get('/payrollAll');
        return response.data;
      } catch (error) {
        console.error('Get all payrolls error:', error);
        throw error;
      }
    },

    // Get payroll by ID
    getPayrollById: async (id) => {
      try {
        const response = await API.get(`/payrollAll/${id}`);
        return response.data;
      } catch (error) {
        console.error('Get payroll by ID error:', error);
        throw error;
      }
    },

    // Create payroll (admin only)
    createPayroll: async (data) => {
      try {
        const response = await API.post('/payrollCreate', data);
        return response.data;
      } catch (error) {
        console.error('Create payroll error:', error);
        throw error;
      }
    },

    // Update payroll status (admin only)
    updatePayrollStatus: async (id, status) => {
      try {
        const response = await API.put(`/payrollUpdate/${id}/status`, { status });
        return response.data;
      } catch (error) {
        console.error('Update payroll status error:', error);
        throw error;
      }
    },

    // Delete payroll (admin only)
    deletePayroll: async (id) => {
      try {
        const response = await API.delete(`/payrollDelete/${id}`);
        return response.data;
      } catch (error) {
        console.error('Delete payroll error:', error);
        throw error;
      }
    },

    // Generate monthly payroll (admin only)
    generateMonthlyPayroll: async (data) => {
      try {
        const response = await API.post('/generate/monthly', data);
        return response.data;
      } catch (error) {
        console.error('Generate monthly payroll error:', error);
        throw error;
      }
    },

    // Get employee payrolls
    getEmployeePayrolls: async (employeeId) => {
      try {
        const response = await API.get(`/employee/${employeeId}`);
        return response.data;
      } catch (error) {
        console.error('Get employee payrolls error:', error);
        throw error;
      }
    },

    // Employee action on payroll
    employeeActionOnPayroll: async (id, action) => {
      try {
        const response = await API.post(`/action/${id}`, { action });
        return response.data;
      } catch (error) {
        console.error('Employee action error:', error);
        throw error;
      }
    },

    // Calculate payroll from attendance (auto-calculation)
    calculatePayrollFromAttendance: async (data) => {
      try {
        const response = await API.post('/calculate', data);
        return response.data;
      } catch (error) {
        console.error('Calculate payroll error:', error);
        throw error;
      }
    },

    // Auto generate payroll
    autoGeneratePayroll: async (data) => {
      try {
        const response = await API.post('/auto-generate', data);
        return response.data;
      } catch (error) {
        console.error('Auto generate payroll error:', error);
        throw error;
      }
    },

    // Bulk auto generate payroll
    bulkAutoGeneratePayroll: async (data) => {
      try {
        const response = await API.post('/bulk-auto-generate', data);
        return response.data;
      } catch (error) {
        console.error('Bulk auto generate error:', error);
        throw error;
      }
    }
  };

  // Check API Connection with multiple endpoints
  const checkApiConnection = async () => {
    setLoading(prev => ({ ...prev, apiCheck: true }));
    
    const endpoints = [
      '/health',
      '/test',
      '/users/test',
      '/admin/test'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying ${endpoint}...`);
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, { 
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        if (response.status === 200 || response.status === 201) {
          setApiConnected(true);
          console.log(`✅ API Connected via ${endpoint}`);
          setLoading(prev => ({ ...prev, apiCheck: false }));
          return true;
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error.message);
      }
    }
    
    // If all endpoints fail, try base URL
    try {
      console.log('Trying base URL...');
      const response = await axios.get(API_BASE_URL, { 
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.status === 200) {
        setApiConnected(true);
        console.log('✅ Connected to API base URL');
        setLoading(prev => ({ ...prev, apiCheck: false }));
        return true;
      }
    } catch (error) {
      console.log('Base URL also failed:', error.message);
    }
    
    setApiConnected(false);
    console.log('❌ API Connection Failed');
    setLoading(prev => ({ ...prev, apiCheck: false }));
    return false;
  };

  // Load employees with fallback
  const loadEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    
    try {
      console.log('Loading employees...');
      
      let employeesData = [];
      
      if (apiConnected) {
        try {
          const response = await API.get('/admin/getAll-user');
          
          if (response.data && Array.isArray(response.data)) {
            employeesData = response.data;
          } else if (response.data.users && Array.isArray(response.data.users)) {
            employeesData = response.data.users;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            employeesData = response.data.data;
          }
          
          console.log(`✅ Loaded ${employeesData.length} employees from API`);
        } catch (apiError) {
          console.log('API employees load failed:', apiError.message);
        }
      }
      
      // Fallback to localStorage if API fails
      if (employeesData.length === 0) {
        const localEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        if (localEmployees.length > 0) {
          employeesData = localEmployees;
          console.log(`📁 Loaded ${employeesData.length} employees from localStorage`);
        }
      }
      
      const activeEmployees = employeesData.filter(emp => 
        !emp.status || 
        emp.status === 'active' || 
        emp.status === 'Active' ||
        (emp.status !== 'inactive' && emp.status !== 'terminated')
      );
      
      setEmployees(activeEmployees);
      
      // Save to localStorage for offline access
      localStorage.setItem('employees', JSON.stringify(activeEmployees));
      
      const salaryMap = {};
      activeEmployees.forEach(emp => {
        if (emp._id) {
          salaryMap[emp._id] = {
            salary: emp.salary || emp.monthlySalary || emp.basicSalary || 30000,
            monthlyBasic: emp.monthlyBasic || emp.salary || emp.basicSalary || 30000,
            designation: emp.designation || emp.role || 'Employee',
            department: emp.department || 'General',
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || 'Unknown',
            email: emp.email || 'N/A',
            phone: emp.phone || emp.mobile || 'N/A'
          };
        }
      });
      setEmployeeSalaries(salaryMap);
      
      console.log(`Active employees: ${activeEmployees.length}`);
      return activeEmployees;
      
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

// CORRECTED: Calculate daily rate based on 23 working days
const calculateDailyRate = (monthlySalary) => {
  return Math.round(monthlySalary / 23);
};

// CORRECTED: Monthly salary and basic salary are the same
const calculateBasicSalary = (monthlySalary) => {
  return monthlySalary; // ✅ Basic = Monthly salary (no calculation)
};

// CORRECTED: Calculate attendance with 23 working days
const calculateAutoAttendance = (employeeId, month, year) => {
  if (!employeeId) {
    return {
      presentDays: 23, // Default 23 days
      totalWorkingDays: 23, // ✅ 23 working days
      attendancePercentage: 100,
      absentDays: 0,
      lateDays: 0,
      leaves: 0
    };
  }
  
  const monthYearKey = `${year}-${month.toString().padStart(2, '0')}`;
  const employeeAttendance = attendanceData[employeeId] || {};
  const monthAttendance = employeeAttendance[monthYearKey];
  
  if (monthAttendance) {
    const presentDays = monthAttendance.presentDays || 23;
    const totalWorkingDays = 23; // Fixed 23 days
    const attendancePercentage = Math.round((presentDays / totalWorkingDays) * 100);
    const absentDays = totalWorkingDays - presentDays - (monthAttendance.lateDays || 0);
    
    return {
      presentDays,
      totalWorkingDays,
      attendancePercentage,
      absentDays: absentDays > 0 ? absentDays : 0,
      lateDays: monthAttendance.lateDays || 0,
      leaves: monthAttendance.leaves || 0
    };
  }
  
  // Default attendance - সবাই ২৩ দিনের জন্য পূর্ণ উপস্থিত
  const presentDays = 23; // ✅ ২৩ দিনই উপস্থিত
  const totalWorkingDays = 23;
  const attendancePercentage = 100;
  
  return {
    presentDays: 23, // ✅ ২৩ দিন উপস্থিত
    totalWorkingDays: 23, // ✅ ২৩ কাজের দিন
    attendancePercentage: 100,
    absentDays: 0,
    lateDays: 0,
    leaves: 0
  };
};

// CORRECTED: Calculate deductions with 23 days logic
const calculateAttendanceDeductions = (employeeId, monthlySalary, month, year) => {
  const attendance = calculateAutoAttendance(employeeId, month, year);
  const dailyRate = calculateDailyRate(monthlySalary);
  
  let lateDeduction = 0;
  let absentDeduction = 0;
  let leaveDeduction = 0;
  
  // Late Deduction: 3 days late = 1 day salary deduction (23 দিয়ে ভাগ)
  if (attendance.lateDays > 0) {
    const deductionDays = Math.floor(attendance.lateDays / 3);
    lateDeduction = deductionDays * dailyRate;
  }
  
  // Absent Deduction: 1 day absent = 1 day salary deduction (23 দিয়ে ভাগ)
  absentDeduction = attendance.absentDays * dailyRate;
  
  // Leave Deduction: 1 day leave = 1 day salary deduction (23 দিয়ে ভাগ)
  if (attendance.leaves > 0) {
    leaveDeduction = attendance.leaves * dailyRate;
  }
  
  return {
    lateDeduction,
    absentDeduction,
    leaveDeduction,
    total: lateDeduction + absentDeduction + leaveDeduction,
    dailyRate,
    attendanceBreakdown: attendance
  };
};

  // Load attendance data
  const loadAttendanceData = async () => {
    try {
      console.log('Loading attendance data...');
      
      if (!apiConnected) {
        console.log('API not connected, using default attendance');
        // Create default attendance structure
        const defaultAttendanceData = {};
        employees.forEach(emp => {
          if (emp._id) {
            defaultAttendanceData[emp._id] = {};
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            const currentMonthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
            
            const presentDays = 25 + Math.floor(Math.random() * 4) - 2;
            defaultAttendanceData[emp._id][currentMonthKey] = {
              lateMinutes: Math.floor(Math.random() * 300),
              absentDays: 30 - presentDays,
              halfDays: Math.floor(Math.random() * 2),
              leaves: Math.floor(Math.random() * 3),
              presentDays: presentDays,
              totalWorkingDays: 23
            };
          }
        });
        
        setAttendanceData(defaultAttendanceData);
        return;
      }
      
      const userId = getUserId();
      const role = getUserRole();
      
      let endpoint = '/attendance/all';
      if (role === 'employee') {
        endpoint = `/attendance/user/${userId}`;
      }
      
      const response = await API.get(endpoint);
      
      if (response.data) {
        const attendanceList = response.data.attendances || response.data.data || [];
        console.log(`Found ${attendanceList.length} attendance records`);
        
        const attendanceMap = {};
        
        attendanceList.forEach(att => {
          const empId = att.employee || att.employeeId || att.user;
          if (!empId) return;
          
          const date = new Date(att.date || att.attendanceDate || att.createdAt);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const monthYearKey = `${year}-${month.toString().padStart(2, '0')}`;
          
          if (!attendanceMap[empId]) {
            attendanceMap[empId] = {};
          }
          
          if (!attendanceMap[empId][monthYearKey]) {
            attendanceMap[empId][monthYearKey] = {
              lateMinutes: 0,
              absentDays: 0,
              halfDays: 0,
              leaves: 0,
              presentDays: 0,
              totalWorkingDays: 0
            };
          }
          
          if (att.status === 'Present' || att.status === 'present') {
            attendanceMap[empId][monthYearKey].presentDays += 1;
          } else if (att.status === 'Late' || att.status === 'late' || att.lateMinutes > 0) {
            attendanceMap[empId][monthYearKey].presentDays += 1;
            attendanceMap[empId][monthYearKey].lateMinutes += att.lateMinutes || 60;
          } else if (att.status === 'Absent' || att.status === 'absent') {
            attendanceMap[empId][monthYearKey].absentDays += 1;
          } else if (att.status === 'Half Day' || att.status === 'half_day' || att.status === 'half') {
            attendanceMap[empId][monthYearKey].halfDays += 1;
            attendanceMap[empId][monthYearKey].presentDays += 0.5;
          }
          
          if (att.leaveDays && att.leaveDays > 0) {
            attendanceMap[empId][monthYearKey].leaves += att.leaveDays;
          }
          
          attendanceMap[empId][monthYearKey].totalWorkingDays += 1;
        });
        
        setAttendanceData(attendanceMap);
        console.log('Attendance data loaded');
      }
    } catch (error) {
      console.log('Attendance load error:', error.message);
      // Create default attendance
      const defaultAttendanceData = {};
      employees.forEach(emp => {
        if (emp._id) {
          defaultAttendanceData[emp._id] = {};
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
          const currentMonthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
          
          const presentDays = 25 + Math.floor(Math.random() * 4) - 2;
          defaultAttendanceData[emp._id][currentMonthKey] = {
            lateMinutes: Math.floor(Math.random() * 300),
            absentDays: 30 - presentDays,
            halfDays: Math.floor(Math.random() * 2),
            leaves: Math.floor(Math.random() * 3),
            presentDays: presentDays,
            totalWorkingDays: 30
          };
        }
      });
      
      setAttendanceData(defaultAttendanceData);
    }
  };

  // Get employee name
  const getEmployeeName = (payroll) => {
    if (!payroll) return 'Unknown Employee';
    
    if (payroll.employeeName) {
      return payroll.employeeName;
    }
    
    if (payroll.employee && typeof payroll.employee === 'object') {
      if (payroll.employee.firstName || payroll.employee.lastName) {
        return `${payroll.employee.firstName || ''} ${payroll.employee.lastName || ''}`.trim();
      }
      if (payroll.employee.name) {
        return payroll.employee.name;
      }
    }
    
    const employee = employees.find(emp => emp._id === payroll.employeeId || emp._id === payroll.employee);
    if (employee) {
      if (employee.firstName || employee.lastName) {
        return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
      }
      if (employee.name) {
        return employee.name;
      }
    }
    
    return 'Unknown Employee';
  };

  // Load payrolls
  const loadPayrolls = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    
    try {
      let apiPayrolls = [];
      
      if (apiConnected) {
        try {
          const role = getUserRole();
          const userId = getUserId();
          
          let endpoint = '/payrollAll';
          if (role === 'employee') {
            endpoint = `/employee/${userId}`;
          }
          
          console.log(`Fetching payrolls from: ${endpoint}`);
          const response = await API.get(endpoint);
          
          if (response.data) {
            if (Array.isArray(response.data)) {
              apiPayrolls = response.data;
            } else if (response.data.payrolls && Array.isArray(response.data.payrolls)) {
              apiPayrolls = response.data.payrolls;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              apiPayrolls = response.data.data;
            }
            
            console.log(`✅ Loaded ${apiPayrolls.length} payrolls from API`);
          }
        } catch (apiError) {
          console.log('API payrolls load failed:', apiError.message);
        }
      }
      
      // Load from localStorage
      const localPayrolls = JSON.parse(localStorage.getItem('payrolls') || '[]');
      
      // Combine and deduplicate
      const allPayrolls = [...apiPayrolls, ...localPayrolls];
      const uniqueIds = new Set();
      const uniquePayrolls = [];
      
      allPayrolls.forEach(p => {
        const id = p._id || p.id;
        if (id && !uniqueIds.has(id)) {
          uniqueIds.add(id);
          uniquePayrolls.push(p);
        } else if (!id) {
          uniquePayrolls.push(p);
        }
      });
      
      // Sort by date
      uniquePayrolls.sort((a, b) => {
        return new Date(b.createdAt || b.createdDate || Date.now()) - 
               new Date(a.createdAt || a.createdDate || Date.now());
      });
      
      // Filter for employee view
      let filteredPayrolls = uniquePayrolls;
      if (isEmployeeView && currentEmployeeId) {
        filteredPayrolls = uniquePayrolls.filter(p => 
          p.employee === currentEmployeeId || 
          p.employeeId === currentEmployeeId
        );
      }
      
      setPayrolls(filteredPayrolls);
      savePayrollsToLocalStorage(filteredPayrolls);
      calculateStats(filteredPayrolls);
      
      console.log(`Total payrolls: ${filteredPayrolls.length}`);
      
    } catch (error) {
      console.error('Error loading payrolls:', error);
      toast.error('Failed to load payrolls');
    } finally {
      setLoading(prev => ({ ...prev, payrolls: false }));
    }
  };

  // Calculate statistics
  const calculateStats = (payrollData) => {
    const totalPayroll = payrollData.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    const totalProcessed = payrollData.length;
    const totalPending = payrollData.filter(p => p.status === 'Pending' || p.status === 'pending_approval').length;
    const totalPaid = payrollData.filter(p => p.status === 'Paid').length;
    const totalRejected = payrollData.filter(p => p.status === 'Rejected').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPayrolls = payrollData.filter(p => {
      try {
        const payrollDate = new Date(p.periodStart || p.createdAt);
        const payrollMonth = payrollDate.getMonth();
        const payrollYear = payrollDate.getFullYear();
        return payrollMonth === currentMonth && payrollYear === currentYear;
      } catch (e) {
        return false;
      }
    });
    
    const monthlyExpense = currentMonthPayrolls.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    setStats({
      totalPayroll,
      totalEmployees: employees.length,
      totalProcessed,
      totalPending,
      totalPaid,
      totalRejected,
      monthlyExpense,
      pendingSalaryRequests: 0
    });
  };

  // Format currency in BDT
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
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

  // Convert number to words in BDT
  const convertToWords = (num) => {
    if (num === 0) return 'Zero Taka Only';
    
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    
    return str.trim() + ' Taka Only';
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('paid') || statusLower.includes('approved')) {
      return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={14} /> };
    } else if (statusLower.includes('pending')) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={14} /> };
    } else if (statusLower.includes('draft')) {
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> };
    } else if (statusLower.includes('rejected')) {
      return { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle size={14} /> };
    } else {
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> };
    }
  };

  // CORRECTED: Handle employee selection - AUTO CALCULATION based on 30 days
// In handleEmployeeSelect function, update:
const handleEmployeeSelect = (employeeId) => {
  if (!employeeId) return;
  
  const salaryData = employeeSalaries[employeeId] || {};
  const monthlySalary = salaryData.salary || 30000;
  
  // Get selected month and year
  let month, year;
  const currentDate = new Date();
  
  if (createForm.periodStart) {
    const date = new Date(createForm.periodStart);
    month = date.getMonth() + 1;
    year = date.getFullYear();
  } else {
    month = currentDate.getMonth() + 1;
    year = currentDate.getFullYear();
    // Set default period (current month)
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    setCreateForm(prev => ({
      ...prev,
      periodStart: firstDay.toISOString().split('T')[0],
      periodEnd: lastDay.toISOString().split('T')[0]
    }));
  }
  
  // Auto calculate attendance for 23 days
  const attendance = calculateAutoAttendance(employeeId, month, year);
  const deductions = calculateAttendanceDeductions(employeeId, monthlySalary, month, year);
  
  const dailyRate = calculateDailyRate(monthlySalary);
  
  // ✅ Basic Pay = Monthly Salary (no calculation with days)
  const basicPay = monthlySalary; 
  
  const totalEarnings = 
    basicPay + 
    (createForm.earnings.overtime || 0) + 
    (createForm.earnings.bonus || 0) + 
    (createForm.earnings.allowance || 0);
  
  const totalDeductions = deductions.total;
  const netPayable = totalEarnings - totalDeductions;
  
  setCreateForm(prev => ({
    ...prev,
    employee: employeeId,
    monthlySalary,
    basicPay, // ✅ Basic Pay = Monthly Salary
    presentDays: attendance.presentDays,
    totalWorkingDays: 23, // Hardcoded 23 days
    deductions: {
      lateDeduction: deductions.lateDeduction,
      absentDeduction: deductions.absentDeduction,
      leaveDeduction: deductions.leaveDeduction
    },
    netSalary: netPayable
  }));
  
  toast.success(`Employee selected. Basic Salary: ${formatCurrency(monthlySalary)}`);
};

  // CORRECTED: Handle period start change - AUTO RECALCULATE
  const handlePeriodStartChange = (date) => {
    if (!date) return;
    
    setCreateForm(prev => {
      const updatedForm = { ...prev, periodStart: date };
      
      // Auto calculate if employee is selected
      if (prev.employee) {
        const salaryData = employeeSalaries[prev.employee] || {};
        const monthlySalary = salaryData.salary || 30000;
        const selectedDate = new Date(date);
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        
        const attendance = calculateAutoAttendance(prev.employee, month, year);
        const deductions = calculateAttendanceDeductions(prev.employee, monthlySalary, month, year);
        
        const dailyRate = calculateDailyRate(monthlySalary);
        const basicPay = Math.round(dailyRate * attendance.presentDays);
        
        const totalEarnings = 
          basicPay + 
          (prev.earnings.overtime || 0) + 
          (prev.earnings.bonus || 0) + 
          (prev.earnings.allowance || 0);
        
        const totalDeductions = deductions.total;
        const netPayable = totalEarnings - totalDeductions;
        
        return {
          ...updatedForm,
          monthlySalary,
          presentDays: attendance.presentDays,
          totalWorkingDays: attendance.totalWorkingDays,
          basicPay,
          deductions: {
            lateDeduction: deductions.lateDeduction,
            absentDeduction: deductions.absentDeduction,
            leaveDeduction: deductions.leaveDeduction
          },
          netSalary: netPayable
        };
      }
      
      return updatedForm;
    });
  };

  // Load employee-specific payrolls
  const loadEmployeeSpecificPayrolls = async (employeeId) => {
    if (!employeeId) return;
    
    setLoading(prev => ({ ...prev, payrolls: true }));
    
    try {
      let employeePayrollsData = [];
      
      if (apiConnected) {
        try {
          const response = await payrollApi.getEmployeePayrolls(employeeId);
          
          if (response.data && Array.isArray(response.data)) {
            employeePayrollsData = response.data;
          } else if (response.data.payrolls && Array.isArray(response.data.payrolls)) {
            employeePayrollsData = response.data.payrolls;
          }
        } catch (apiError) {
          console.log('API employee payrolls load failed:', apiError.message);
          
          // Fallback: Filter from existing payrolls
          employeePayrollsData = payrolls.filter(p => 
            p.employee === employeeId || p.employeeId === employeeId
          );
        }
      } else {
        employeePayrollsData = payrolls.filter(p => 
          p.employee === employeeId || p.employeeId === employeeId
        );
      }
      
      setEmployeePayrolls(employeePayrollsData);
      return employeePayrollsData;
      
    } catch (error) {
      console.error('Load employee payrolls error:', error);
      toast.error('Failed to load employee payrolls');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, payrolls: false }));
    }
  };

  // Handle employee payroll view (for admin)
  const handleViewEmployeePayrolls = async (employee) => {
    setSelectedEmployeeForPayroll(employee);
    await loadEmployeeSpecificPayrolls(employee._id);
    setShowEmployeeDetails(true);
  };

  // Handle month-year wise payroll view
  const handleMonthYearPayrollView = async (month, year) => {
    setSelectedMonthYearForView({ month, year });
    
    // Filter payrolls by month and year
    const filtered = payrolls.filter(p => {
      try {
        const payrollDate = new Date(p.periodStart || p.createdAt);
        const payrollMonth = payrollDate.getMonth() + 1;
        const payrollYear = payrollDate.getFullYear();
        return payrollMonth === month && payrollYear === year;
      } catch (e) {
        return false;
      }
    });
    
    setMonthYearPayrolls(filtered);
    setShowMonthYearDetails(true);
  };

// CORRECTED: Handle create payroll function
const handleCreatePayroll = async (e) => {
  e.preventDefault();
  
  if (!createForm.employee || !createForm.periodStart || !createForm.periodEnd) {
    toast.error('Please select employee and period dates');
    return;
  }
  
  setLoading(prev => ({ ...prev, action: true }));
  
  try {
    const selectedEmployee = employees.find(emp => emp._id === createForm.employee);
    if (!selectedEmployee) {
      throw new Error('Selected employee not found');
    }
    
    const salaryData = employeeSalaries[createForm.employee] || {};
    const monthlySalary = salaryData.salary || 30000;
    
    const periodStartDate = new Date(createForm.periodStart);
    const month = periodStartDate.getMonth() + 1;
    const year = periodStartDate.getFullYear();
    
    const attendance = calculateAutoAttendance(createForm.employee, month, year);
    const deductions = calculateAttendanceDeductions(createForm.employee, monthlySalary, month, year);
    
    const dailyRate = calculateDailyRate(monthlySalary);
    const basicPay = monthlySalary; // ✅ Basic = Monthly (no calculation)
    
    const overtimeAmount = createForm.earnings.overtime || 0;
    const bonusAmount = createForm.earnings.bonus || 0;
    const allowanceAmount = createForm.earnings.allowance || 0;
    const totalEarnings = basicPay + overtimeAmount + bonusAmount + allowanceAmount;
    const totalDeductions = deductions.total;
    const netPayable = totalEarnings - totalDeductions;
    
    const payrollData = {
      employee: createForm.employee,
      employeeName: salaryData.name || `${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim(),
      employeeId: selectedEmployee.employeeId || selectedEmployee._id,
      periodStart: createForm.periodStart,
      periodEnd: createForm.periodEnd,
      status: createForm.status,
      notes: createForm.notes,
      
      salaryDetails: {
        monthlySalary,
        basicPay, // ✅ Same as monthly salary
        dailyRate, // For deduction calculations
        deductionBase: 23 // ✅ 23 days base
      },
      
      attendance: {
        presentDays: 23, // ✅ Always 23 days
        totalWorkingDays: 23, // ✅ Fixed 23 days
        attendancePercentage: 100,
        lateDays: attendance.lateDays || 0,
        absentDays: attendance.absentDays || 0,
        leaves: attendance.leaves || 0,
        calculationNote: "23 working days month, basic salary = monthly salary"
      },
      
      earnings: {
        basicPay, // ✅ Basic = Monthly Salary
        overtime: overtimeAmount,
        bonus: bonusAmount,
        allowance: allowanceAmount,
        total: totalEarnings
      },
      
      deductions: {
        lateDeduction: deductions.lateDeduction,
        absentDeduction: deductions.absentDeduction,
        leaveDeduction: deductions.leaveDeduction,
        total: totalDeductions,
        deductionRules: {
          lateRule: `3 late days = ${formatCurrency(dailyRate)} deduction (1 day salary)`,
          absentRule: `1 absent day = ${formatCurrency(dailyRate)} deduction`,
          leaveRule: `1 leave day = ${formatCurrency(dailyRate)} deduction`,
          calculationBase: `Daily rate = Monthly salary ÷ 23 = ${formatCurrency(dailyRate)}`
        }
      },
      
      summary: {
        grossEarnings: totalEarnings,
        totalDeductions,
        netPayable,
        inWords: convertToWords(netPayable),
        calculationMethod: "23 days month, basic = monthly salary"
      },
      
      createdBy: getUserId(),
      createdRole: getUserRole(),
      isAutoGenerated: false,
      hasLateLeaveCalculations: totalDeductions > 0,
      autoDeductionsApplied: true,
      calculationBaseDays: 23, // ✅ Store 23 days in record
      currency: "BDT",
      month: month,
      year: year,
      accepted: createForm.status === 'Paid' ? true : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // ... rest of the function remains same
  } catch (error) {
    console.error('Create payroll error:', error);
    toast.error(error.message || 'Failed to create payroll');
  } finally {
    setLoading(prev => ({ ...prev, action: false }));
  }
};

  // CORRECTED: Handle calculate payroll
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
      const monthlySalary = salaryData.salary || 30000;
      
      const month = parseInt(calculateForm.month);
      const year = parseInt(calculateForm.year);
      
      const attendance = calculateAutoAttendance(calculateForm.employeeId, month, year);
      const deductions = calculateAttendanceDeductions(calculateForm.employeeId, monthlySalary, month, year);
      
      const dailyRate = calculateDailyRate(monthlySalary);
      const hourlyRate = calculateHourlyRate(dailyRate);
      const basicPay = Math.round(dailyRate * attendance.presentDays);
      const overtimeAmount = Math.round(hourlyRate * 10 * 1.5);
      const totalEarnings = basicPay + overtimeAmount;
      const totalDeductions = deductions.total;
      const netPayable = totalEarnings - totalDeductions;
      
      setCalculationResult({
        employeeDetails: {
          name: salaryData.name || `${employee.firstName} ${employee.lastName}`.trim(),
          employeeId: employee.employeeId || employee._id,
          department: salaryData.department,
          designation: salaryData.designation
        },
        month: month,
        year: year,
        periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
        periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
        monthlySalary: monthlySalary,
        basicPay: basicPay,
        dailyRate: dailyRate,
        hourlyRate: hourlyRate,
        presentDays: attendance.presentDays,
        totalWorkingDays: attendance.totalWorkingDays,
        attendancePercentage: attendance.attendancePercentage,
        
        attendanceBreakdown: attendance,
        
        earnings: {
          basicPay: basicPay,
          overtime: overtimeAmount,
          bonus: 0,
          allowance: 0,
          total: totalEarnings
        },
        
        deductions: {
          lateDeduction: deductions.lateDeduction,
          absentDeduction: deductions.absentDeduction,
          leaveDeduction: deductions.leaveDeduction,
          total: totalDeductions,
          deductionRules: {
            lateRule: "3 দিন লেট = ১ দিনের বেতন কাটা",
            absentRule: "১ দিন অনুপস্থিত = ১ দিনের বেতন কাটা",
            leaveRule: "অবৈতনিক ছুটি = ১ দিনের বেতন কাটা"
          }
        },
        
        summary: {
          grossEarnings: totalEarnings,
          totalDeductions: totalDeductions,
          netPayable: netPayable,
          inWords: convertToWords(netPayable)
        }
      });
      
      toast.success(`Payroll calculated successfully for ${month}/${year}!`);
      
    } catch (error) {
      console.error('Calculate payroll error:', error);
      toast.error('Failed to calculate payroll');
    } finally {
      setLoading(prev => ({ ...prev, calculation: false }));
    }
  };

  // CORRECTED: Handle bulk generate
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    
    if (!bulkForm.month || !bulkForm.year) {
      toast.error('Please select month and year');
      return;
    }
    
    setLoading(prev => ({ ...prev, generate: true }));
    
    try {
      const month = parseInt(bulkForm.month);
      const year = parseInt(bulkForm.year);
      
      const newPayrolls = [];
      
      for (const emp of employees) {
        const salaryData = employeeSalaries[emp._id] || {};
        const monthlySalary = salaryData.salary || 30000;
        
        const attendance = calculateAutoAttendance(emp._id, month, year);
        const deductions = calculateAttendanceDeductions(emp._id, monthlySalary, month, year);
        
        const dailyRate = calculateDailyRate(monthlySalary);
        const hourlyRate = calculateHourlyRate(dailyRate);
        const basicPay = Math.round(dailyRate * attendance.presentDays);
        const overtimeAmount = Math.round(hourlyRate * 10 * 1.5);
        const totalEarnings = basicPay + overtimeAmount;
        const totalDeductions = deductions.total;
        const netPayable = totalEarnings - totalDeductions;
        
        const payrollData = {
          employee: emp._id,
          employeeName: salaryData.name || `${emp.firstName} ${emp.lastName}`.trim(),
          employeeId: emp.employeeId || emp._id,
          periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
          periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
          status: 'Pending',
          
          salaryDetails: {
            monthlySalary,
            dailyRate,
            hourlyRate
          },
          
          attendance: {
            presentDays: attendance.presentDays,
            totalWorkingDays: attendance.totalWorkingDays,
            attendancePercentage: attendance.attendancePercentage,
            lateMinutes: attendance.lateMinutes,
            absentDays: attendance.absentDays
          },
          
          earnings: {
            basicPay,
            overtime: overtimeAmount,
            total: totalEarnings
          },
          
          deductions: {
            lateDeduction: deductions.lateDeduction,
            absentDeduction: deductions.absentDeduction,
            leaveDeduction: deductions.leaveDeduction,
            total: totalDeductions,
            deductionRules: {
              lateRule: "3 দিন লেট = ১ দিনের বেতন কাটা",
              absentRule: "১ দিন অনুপস্থিত = ১ দিনের বেতন কাটা",
              leaveRule: "অবৈতনিক ছুটি = ১ দিনের বেতন কাটা"
            }
          },
          
          summary: {
            netPayable,
            inWords: convertToWords(netPayable)
          },
          
          createdBy: getUserId(),
          createdRole: getUserRole(),
          isAutoGenerated: true,
          autoDeductionsApplied: true,
          currency: "BDT",
          month: month,
          year: year,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Try to save to API
        if (apiConnected) {
          try {
            const response = await payrollApi.bulkAutoGeneratePayroll(payrollData);
            if (response.data) {
              newPayrolls.push(response.data.payroll || response.data);
            }
          } catch (apiError) {
            console.error(`API save failed for ${emp._id}:`, apiError.message);
            payrollData._id = `bulk_${Date.now()}_${emp._id}`;
            payrollData.localSave = true;
            newPayrolls.push(payrollData);
          }
        } else {
          payrollData._id = `bulk_${Date.now()}_${emp._id}`;
          payrollData.localSave = true;
          newPayrolls.push(payrollData);
        }
      }
      
      const updatedPayrolls = [...newPayrolls, ...payrolls];
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      calculateStats(updatedPayrolls);
      
      toast.success(`Created ${newPayrolls.length} payrolls for ${month}/${year}`);
      setShowBulkModal(false);
      setBulkForm({ month: '', year: '' });
      
    } catch (error) {
      console.error('Bulk generate error:', error);
      toast.error('Bulk generation failed');
    } finally {
      setLoading(prev => ({ ...prev, generate: false }));
    }
  };

  // Handle update status
  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Change status to ${status}?`)) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      if (apiConnected) {
        try {
          await payrollApi.updatePayrollStatus(id, status);
        } catch (apiError) {
          console.log('API update failed:', apiError.message);
        }
      }
      
      const updatedPayrolls = payrolls.map(p => 
        p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      );
      
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      calculateStats(updatedPayrolls);
      
      // Update employee payrolls if modal is open
      if (showEmployeeDetails) {
        const updatedEmployeePayrolls = employeePayrolls.map(p => 
          p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
        );
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success('Status updated successfully');
      
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Handle delete payroll
  const handleDeletePayroll = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll?')) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      if (apiConnected) {
        try {
          await payrollApi.deletePayroll(id);
        } catch (apiError) {
          console.log('API delete failed:', apiError.message);
        }
      }
      
      const updatedPayrolls = payrolls.filter(p => p._id !== id);
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      calculateStats(updatedPayrolls);
      
      // Update employee payrolls if modal is open
      if (showEmployeeDetails) {
        const updatedEmployeePayrolls = employeePayrolls.filter(p => p._id !== id);
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success('Payroll deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete payroll');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Handle employee action on payroll (accept/reject)
  const handleEmployeePayrollAction = async (payrollId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this payroll?`)) return;
    
    setLoading(prev => ({ ...prev, accept: true }));
    
    try {
      if (apiConnected) {
        await payrollApi.employeeActionOnPayroll(payrollId, action);
      }
      
      // Update local state
      const updatedPayrolls = payrolls.map(p => {
        if (p._id === payrollId) {
          if (action === 'accept') {
            return {
              ...p,
              status: 'Paid',
              accepted: true,
              acceptedBy: getUserId(),
              acceptedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          } else if (action === 'reject') {
            return {
              ...p,
              status: 'Rejected',
              rejectedBy: getUserId(),
              rejectedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
        }
        return p;
      });
      
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      
      // Also update employeePayrolls if it's open
      if (showEmployeeDetails) {
        const updatedEmployeePayrolls = employeePayrolls.map(p => {
          if (p._id === payrollId) {
            if (action === 'accept') {
              return {
                ...p,
                status: 'Paid',
                accepted: true,
                acceptedBy: getUserId(),
                acceptedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            } else if (action === 'reject') {
              return {
                ...p,
                status: 'Rejected',
                rejectedBy: getUserId(),
                rejectedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            }
          }
          return p;
        });
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success(`Payroll ${action}ed successfully!`);
      
    } catch (error) {
      console.error('Employee action error:', error);
      toast.error(`Failed to ${action} payroll`);
    } finally {
      setLoading(prev => ({ ...prev, accept: false }));
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    await checkApiConnection();
    await loadEmployees();
    await loadAttendanceData();
    await loadPayrolls();
    setLoading(prev => ({ ...prev, payrolls: false }));
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      toast.success('Logged out successfully');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }
  };

  // Handle auto-generate from calculation
  const handleAutoGenerateFromCalculation = async () => {
    if (!calculationResult) {
      toast.error('No calculation result available');
      return;
    }
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const { month, year, attendanceBreakdown, summary, earnings, deductions } = calculationResult;
      const employeeId = calculationResult.employeeDetails.employeeId;
      
      const employee = employees.find(e => e._id === employeeId);
      if (!employee) throw new Error('Employee not found');
      
      const payrollData = {
        employee: employeeId,
        employeeName: calculationResult.employeeDetails.name,
        month,
        year,
        periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
        periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
        status: 'Pending',
        attendance: attendanceBreakdown,
        earnings,
        deductions,
        summary,
        autoGenerated: true,
        createdAt: new Date().toISOString()
      };
      
      let savedPayroll;
      if (apiConnected) {
        try {
          const response = await payrollApi.autoGeneratePayroll(payrollData);
          savedPayroll = response.data;
        } catch (apiError) {
          console.error('API auto generate failed:', apiError.message);
          savedPayroll = {
            ...payrollData,
            _id: `auto_${Date.now()}_${employeeId}`,
            localSave: true
          };
        }
      } else {
        savedPayroll = {
          ...payrollData,
          _id: `auto_${Date.now()}_${employeeId}`,
          localSave: true
        };
      }
      
      const updatedPayrolls = [savedPayroll, ...payrolls];
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      
      // Update employee payrolls if modal is open
      if (showEmployeeDetails && selectedEmployeeForPayroll?._id === employeeId) {
        const updatedEmployeePayrolls = [savedPayroll, ...employeePayrolls];
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success('Auto-generated payroll created successfully!');
      setCalculationResult(null);
      setShowCalculateModal(false);
      
    } catch (error) {
      console.error('Auto generate error:', error);
      toast.error('Failed to auto-generate payroll');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Filter payrolls
  const filteredPayrolls = payrolls.filter(payroll => {
    const employeeName = getEmployeeName(payroll).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payroll.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Initialize app
  useEffect(() => {
    const init = async () => {
      console.log('Initializing payroll system...');
      
      const token = getToken();
      if (!token) {
        toast.error('Please login to access payroll');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      try {
        const role = getUserRole();
        const userId = getUserId();
        
        if (role === 'employee') {
          setIsEmployeeView(true);
          setCurrentEmployeeId(userId);
          console.log('Employee view activated for user:', userId);
        }
        
        await checkApiConnection();
        await loadEmployees();
        await loadAttendanceData();
        await loadPayrolls();
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Failed to initialize app');
      }
    };
    
    init();
  }, []);

  // Paginate payrolls
  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

  // Check if user is admin
  const isAdmin = getUserRole() === 'admin';

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Payroll Management System
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <p className="text-gray-600 text-sm">Dashboard</p>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {isAdmin ? 'Admin Access' : 'Employee Access'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {getUserName()}
                </span>
                <div className="flex items-center gap-2 ml-4">
                  {apiConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Wifi size={16} />
                      <span className="text-sm">Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <WifiOff size={16} />
                      <span className="text-sm">Offline Mode</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
            >
              <HomeIcon size={18} />
              Dashboard
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading.payrolls}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading.payrolls ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Employee View Banner */}
        {isEmployeeView && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  <UserCheck size={20} />
                  Employee Payroll View
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  You can view and accept your payrolls here
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{getUserName()}</p>
                  <p className="text-xs text-gray-500">Employee ID: {currentEmployeeId?.substring(0, 8)}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span>View all your payroll records</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare size={14} className="text-green-500" />
                <span>Accept payrolls to mark as Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-yellow-500" />
                <span>Contact HR for any discrepancies</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Payroll Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <WalletIcon size={16} />
                  {isEmployeeView ? 'My Total Payroll' : 'Total Payroll'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalPayroll)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isEmployeeView ? 'All your processed payrolls' : 'All processed payrolls'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
            </div>
          </div>

          {/* Employees Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <UsersIcon size={16} />
                  {isEmployeeView ? 'Payroll Count' : 'Employees'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {isEmployeeView ? stats.totalProcessed : stats.totalEmployees}
                </p>
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  {isEmployeeView ? (
                    <>
                      <FileText size={12} /> Your payroll records
                    </>
                  ) : (
                    <>
                      <UserCheck size={12} /> Active employees
                    </>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                {isEmployeeView ? <FileText className="text-white" size={20} /> : <Users className="text-white" size={20} />}
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <ClockIcon size={16} />
                  {isEmployeeView ? 'Pending Approval' : 'Pending'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalPending}
                </p>
                <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  {isEmployeeView ? 'Awaiting your acceptance' : 'Awaiting processing'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
            </div>
          </div>

          {/* Monthly Expense Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <Banknote size={16} />
                  {isEmployeeView ? 'My Monthly' : 'Monthly Expense'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.monthlyExpense)}
                </p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {isEmployeeView ? 'Your current month' : 'Current month'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <BarChart className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards - Show only for admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg"
            >
              <div className="text-left">
                <p className="font-semibold">Create Payroll</p>
                <p className="text-sm opacity-90">Manual creation</p>
              </div>
              <PlusCircle size={24} />
            </button>

            <button
              onClick={() => setShowCalculateModal(true)}
              disabled={loading.employees}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg disabled:opacity-50"
            >
              <div className="text-left">
                <p className="font-semibold">Calculate</p>
                <p className="text-sm opacity-90">Auto calculation</p>
              </div>
              {loading.employees ? <Loader2 size={24} className="animate-spin" /> : <CalcIcon size={24} />}
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg"
            >
              <div className="text-left">
                <p className="font-semibold">Bulk Generate</p>
                <p className="text-sm opacity-90">All employees</p>
              </div>
              <UsersIcon size={24} />
            </button>

            <button
              onClick={() => setShowMonthYearViewModal(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg"
            >
              <div className="text-left">
                <p className="font-semibold">Month View</p>
                <p className="text-sm opacity-90">Month-wise summary</p>
              </div>
              <CalendarRange size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content - Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEmployeeView ? 'My Payrolls' : 'Payroll Records'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing {paginatedPayrolls.length} of {filteredPayrolls.length} records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={isEmployeeView ? "Search your payrolls..." : "Search employees..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full sm:w-64 transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Export Button - Only for admin */}
              {isAdmin && (
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      "Employee Name,Period,Basic Pay,Net Payable,Status,Auto Deductions\n" +
                      payrolls.map(p => 
                        `${getEmployeeName(p)},${formatDate(p.periodStart)}-${formatDate(p.periodEnd)},${formatCurrency(p.earnings?.basicPay || p.basicPay || 0)},${formatCurrency(p.summary?.netPayable || p.netSalary || 0)},${p.status},${p.autoDeductionsApplied ? 'Yes' : 'No'}`
                      ).join("\n");
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    toast.success('Payroll data exported successfully');
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
                >
                  <DownloadCloud size={18} />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        {loading.payrolls ? (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading payroll data...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the records</p>
            </div>
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records found</h3>
              <p className="text-gray-500 text-sm mb-6">
                {searchTerm || statusFilter !== 'All'
                  ? 'Try adjusting your search or filter'
                  : isEmployeeView
                  ? 'No payroll records available for you yet'
                  : 'Get started by creating your first payroll'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium shadow-sm transition-all"
                >
                  Create Payroll
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Basic Pay</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Payable</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPayrolls.map((payroll, index) => {
                    const uniqueKey = payroll._id || `payroll-${index}-${Date.now()}`;
                    const statusColor = getStatusColor(payroll.status);
                    const netPayable = payroll.summary?.netPayable || payroll.netSalary || 0;
                    const basicPay = payroll.earnings?.basicPay || payroll.basicPay || 0;
                    
                    return (
                      <tr key={uniqueKey} className="hover:bg-gray-50 transition-colors">
                        {/* Employee Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                              {getEmployeeName(payroll).charAt(0).toUpperCase() || 'E'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{getEmployeeName(payroll)}</div>
                              <div className="text-sm text-gray-500">
                                {payroll.employee?.designation || payroll.designation || 'Employee'}
                              </div>
                              {payroll.attendance?.presentDays && (
                                <div className="text-xs text-green-600 mt-1">
                                  📅 Present: {payroll.attendance.presentDays}/{payroll.attendance.totalWorkingDays || 30} days
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Period Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600">
                              {formatDate(payroll.periodStart)}
                            </div>
                            <div className="text-xs text-gray-400 text-center">to</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(payroll.periodEnd)}
                            </div>
                          </div>
                          {payroll.month && payroll.year && (
                            <div className="text-xs text-gray-400 mt-1">
                              {monthNames[payroll.month - 1]} {payroll.year}
                            </div>
                          )}
                        </td>

                        {/* Basic Pay Column */}
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(basicPay)}
                          </div>
                          {payroll.salaryDetails?.monthlySalary && (
                            <div className="text-xs text-gray-400">
                              Monthly: {formatCurrency(payroll.salaryDetails.monthlySalary)}
                            </div>
                          )}
                        </td>

                        {/* Net Payable Column */}
                        <td className="px-6 py-4">
                          <div className="text-xl font-bold text-purple-600">
                            {formatCurrency(netPayable)}
                          </div>
                          {payroll.autoDeductionsApplied && (
                            <div className="text-xs text-green-500 mt-1">
                              ✓ Auto deductions
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.icon}
                            <span className="ml-2">{payroll.status}</span>
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Employee can accept pending payrolls */}
                            {isEmployeeView && payroll.status === 'Pending' && (
                              <button
                                onClick={() => handleEmployeePayrollAction(payroll._id, 'accept')}
                                disabled={loading.accept}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Accept Payroll"
                              >
                                {loading.accept ? <Loader2 size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                              </button>
                            )}

                            {/* Admin only actions */}
                            {isAdmin && (
                              <>
                                {payroll.status === 'Pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Mark as Paid"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeletePayroll(payroll._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>

                                {/* View Employee Payrolls Button */}
                                <button
                                  onClick={() => {
                                    const employee = employees.find(e => e._id === payroll.employee || e._id === payroll.employeeId);
                                    if (employee) {
                                      handleViewEmployeePayrolls(employee);
                                    }
                                  }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View Employee's All Payrolls"
                                >
                                  <User size={16} />
                                </button>
                                
                                {/* View by Month-Year Button */}
                                {payroll.month && payroll.year && (
                                  <button
                                    onClick={() => handleMonthYearPayrollView(payroll.month, payroll.year)}
                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    title={`View ${payroll.month}/${payroll.year} Payrolls`}
                                  >
                                    <CalendarRange size={16} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages} • {filteredPayrolls.length} records
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
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
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg ${currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Payroll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create Payroll</h2>
                  <p className="text-gray-500 text-sm mt-1">Auto-calculated attendance and deductions</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePayroll} className="p-6 space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={createForm.employee}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  required
                  disabled={loading.employees || employees.length === 0}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
                >
                  <option value="">Choose an employee</option>
                  {employees.map((emp) => {
                    const salaryData = employeeSalaries[emp._id] || {};
                    return (
                      <option key={emp._id} value={emp._id}>
                        {salaryData.name || `${emp.firstName} ${emp.lastName}`.trim()} • 
                        Salary: {formatCurrency(salaryData.salary || 30000)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Pay Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Period *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={createForm.periodStart}
                      onChange={(e) => handlePeriodStartChange(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Start Date (Month selection)</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={createForm.periodEnd}
                      onChange={(e) => setCreateForm({ ...createForm, periodEnd: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">End Date</p>
                  </div>
                </div>
              </div>

              {/* Auto Calculated Attendance */} 
{createForm.employee && createForm.periodStart && (
  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
      <Check size={16} />
      Salary Calculation (23 Working Days Month)
    </h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
        <span className="text-xs text-gray-600 block">Monthly Salary</span>
        <p className="text-lg font-bold text-green-600">
          {formatCurrency(createForm.monthlySalary || 0)}
        </p>
        <p className="text-xs text-gray-400">Basic Pay</p>
      </div>
      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
        <span className="text-xs text-gray-600 block">Daily Rate</span>
        <p className="text-lg font-bold text-blue-600">
          {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))}
        </p>
        <p className="text-xs text-gray-400">Monthly ÷ 23</p>
      </div>
      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
        <span className="text-xs text-gray-600 block">Working Days</span>
        <p className="text-lg font-bold text-purple-600">23</p>
      </div>
      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
        <span className="text-xs text-gray-600 block">Present Days</span>
        <p className="text-lg font-bold text-green-600">23</p>
        <p className="text-xs text-green-500">✓ Full Month</p>
      </div>
    </div>
    <div className="mt-3 p-3 bg-white rounded-lg border border-green-100">
      <p className="text-sm font-medium text-gray-700 mb-1">Calculation Formula:</p>
      <p className="text-xs text-gray-600">
        ✅ Basic Salary = Monthly Salary ({formatCurrency(createForm.monthlySalary || 0)})<br/>
        ✅ Deductions: Late/Absent/Leave × Daily Rate ({formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))})
      </p>
    </div>
  </div>
)}

              {/* Earnings */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="text-sm font-medium text-emerald-700 mb-3">Additional Earnings (BDT)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Overtime Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.earnings.overtime}
                      onChange={(e) => {
                        const overtime = parseInt(e.target.value) || 0;
                        const basicPay = createForm.basicPay || 0;
                        const deductionsTotal = (createForm.deductions.lateDeduction || 0) + 
                                               (createForm.deductions.absentDeduction || 0) + 
                                               (createForm.deductions.leaveDeduction || 0);
                        setCreateForm(prev => ({
                          ...prev,
                          earnings: { ...prev.earnings, overtime },
                          netSalary: basicPay + overtime + (prev.earnings.bonus || 0) + (prev.earnings.allowance || 0) - deductionsTotal
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Bonus</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.earnings.bonus}
                      onChange={(e) => {
                        const bonus = parseInt(e.target.value) || 0;
                        const basicPay = createForm.basicPay || 0;
                        const deductionsTotal = (createForm.deductions.lateDeduction || 0) + 
                                               (createForm.deductions.absentDeduction || 0) + 
                                               (createForm.deductions.leaveDeduction || 0);
                        setCreateForm(prev => ({
                          ...prev,
                          earnings: { ...prev.earnings, bonus },
                          netSalary: basicPay + (prev.earnings.overtime || 0) + bonus + (prev.earnings.allowance || 0) - deductionsTotal
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.earnings.allowance}
                      onChange={(e) => {
                        const allowance = parseInt(e.target.value) || 0;
                        const basicPay = createForm.basicPay || 0;
                        const deductionsTotal = (createForm.deductions.lateDeduction || 0) + 
                                               (createForm.deductions.absentDeduction || 0) + 
                                               (createForm.deductions.leaveDeduction || 0);
                        setCreateForm(prev => ({
                          ...prev,
                          earnings: { ...prev.earnings, allowance },
                          netSalary: basicPay + (prev.earnings.overtime || 0) + (prev.earnings.bonus || 0) + allowance - deductionsTotal
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

// Auto Deductions section with 23 days calculation
{createForm.employee && (
  <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
    <h3 className="text-sm font-medium text-rose-700 mb-3 flex items-center gap-2">
      <AlertCircle size={16} />
      Auto Calculated Deductions (Based on 23 Days)
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Late Deduction */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-gray-600">Late Deduction</label>
          {createForm.deductions.lateDeduction > 0 && (
            <span className="text-xs font-medium text-rose-600">
              -{formatCurrency(createForm.deductions.lateDeduction)}
            </span>
          )}
        </div>
        <input
          type="number"
          min="0"
          value={createForm.deductions.lateDeduction}
          readOnly
          className="w-full px-3 py-2.5 bg-gray-50 border border-rose-200 rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          3 late days = 1 day deduction ({formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))})
        </p>
      </div>
      
      {/* Absent Deduction */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-gray-600">Absent Deduction</label>
          {createForm.deductions.absentDeduction > 0 && (
            <span className="text-xs font-medium text-rose-600">
              -{formatCurrency(createForm.deductions.absentDeduction)}
            </span>
          )}
        </div>
        <input
          type="number"
          min="0"
          value={createForm.deductions.absentDeduction}
          readOnly
          className="w-full px-3 py-2.5 bg-gray-50 border border-rose-200 rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          1 absent day = {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))} deduction
        </p>
      </div>
      
      {/* Leave Deduction */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-gray-600">Leave Deduction</label>
          {createForm.deductions.leaveDeduction > 0 && (
            <span className="text-xs font-medium text-rose-600">
              -{formatCurrency(createForm.deductions.leaveDeduction)}
            </span>
          )}
        </div>
        <input
          type="number"
          min="0"
          value={createForm.deductions.leaveDeduction}
          readOnly
          className="w-full px-3 py-2.5 bg-gray-50 border border-rose-200 rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          1 leave day = {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))} deduction
        </p>
      </div>
    </div>
    
    {/* Daily Rate Calculation Box */}
    <div className="mt-4 p-3 bg-white rounded-lg border border-rose-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">Monthly Salary</p>
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(createForm.monthlySalary || 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">÷ 23 Days</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Daily Rate</p>
          <p className="text-sm font-medium text-blue-600">
            {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))}
          </p>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-rose-100">
        <p className="text-xs text-gray-500">
          <span className="font-medium">All deductions calculated as:</span><br/>
          (Deduction Days) × {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))} per day
        </p>
      </div>
    </div>
  </div>
)}

              {/* Summary */}
              // Summary section update
{createForm.employee && (
  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
    <h3 className="text-sm font-medium text-blue-700 mb-3">Salary Summary (BDT)</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
        <span className="text-xs text-gray-600">Monthly Salary</span>
        <p className="text-lg font-bold text-blue-600">
          {formatCurrency(createForm.monthlySalary || 0)}
        </p>
        <p className="text-xs text-green-500">✓ Full month basic</p>
      </div>
      
      <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
        <span className="text-xs text-gray-600">Total Earnings</span>
        <p className="text-lg font-bold text-emerald-600">
          {formatCurrency(
            createForm.monthlySalary + 
            (createForm.earnings.overtime || 0) + 
            (createForm.earnings.bonus || 0) + 
            (createForm.earnings.allowance || 0)
          )}
        </p>
      </div>
      
      <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
        <span className="text-xs text-gray-600">Total Deductions</span>
        <p className="text-lg font-bold text-rose-600">
          {formatCurrency(
            (createForm.deductions.lateDeduction || 0) + 
            (createForm.deductions.absentDeduction || 0) + 
            (createForm.deductions.leaveDeduction || 0)
          )}
        </p>
        <p className="text-xs text-gray-400">23 days calculation</p>
      </div>
      
      <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
        <span className="text-xs text-gray-600">Net Payable</span>
        <p className="text-xl font-bold text-purple-600">
          {formatCurrency(createForm.netSalary || 0)}
        </p>
        <p className="text-xs text-gray-400">
          Monthly - Deductions + Allowances
        </p>
      </div>
    </div>
    
    {/* Calculation Formula */}
    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
      <p className="text-sm font-medium text-gray-700">Calculation Formula:</p>
      <p className="text-xs text-gray-600 mt-1">
        Net Payable = Monthly Salary ({formatCurrency(createForm.monthlySalary || 0)}) + 
        Allowances ({formatCurrency((createForm.earnings.overtime || 0) + (createForm.earnings.bonus || 0) + (createForm.earnings.allowance || 0))}) - 
        Deductions ({formatCurrency((createForm.deductions.lateDeduction || 0) + (createForm.deductions.absentDeduction || 0) + (createForm.deductions.leaveDeduction || 0))})
      </p>
    </div>
  </div>
)}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading.action}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.action || !createForm.employee}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading.action ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      Create Payroll
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Payroll Details Modal (Admin View) */}
      {showEmployeeDetails && selectedEmployeeForPayroll && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedEmployeeForPayroll.firstName?.charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedEmployeeForPayroll.firstName} {selectedEmployeeForPayroll.lastName}'s Payrolls
                    </h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>ID: {selectedEmployeeForPayroll.employeeId || selectedEmployeeForPayroll._id?.substring(0, 8)}</span>
                      <span>•</span>
                      <span>Department: {selectedEmployeeForPayroll.department || 'N/A'}</span>
                      <span>•</span>
                      <span>Salary: {formatCurrency(employeeSalaries[selectedEmployeeForPayroll._id]?.salary || 30000)}/month</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEmployeeDetails(false);
                    setSelectedEmployeeForPayroll(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => {
                    setCreateForm(prev => ({
                      ...prev,
                      employee: selectedEmployeeForPayroll._id
                    }));
                    setShowEmployeeDetails(false);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium"
                >
                  <PlusCircle size={16} />
                  Create New Payroll
                </button>
                
                <button
                  onClick={() => {
                    const currentDate = new Date();
                    const month = currentDate.getMonth() + 1;
                    const year = currentDate.getFullYear();
                    setCalculateForm({
                      employeeId: selectedEmployeeForPayroll._id,
                      month: month.toString(),
                      year: year.toString()
                    });
                    setShowEmployeeDetails(false);
                    setShowCalculateModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium"
                >
                  <Calculator size={16} />
                  Auto Calculate Current Month
                </button>
              </div>

              {/* Employee Payrolls Table */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payroll History</h3>
                
                {loading.payrolls ? (
                  <div className="py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-600">Loading payrolls...</p>
                    </div>
                  </div>
                ) : employeePayrolls.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-gray-400" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records found</h3>
                      <p className="text-gray-500 text-sm">This employee has no payroll records yet.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white border-b">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Basic Pay</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Payable</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attendance</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeePayrolls.map((payroll, index) => {
                          const statusColor = getStatusColor(payroll.status);
                          return (
                            <tr key={payroll._id || index} className="border-b hover:bg-white">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payroll.month && payroll.year && `${payroll.month}/${payroll.year}`}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-bold text-blue-600">
                                  {formatCurrency(payroll.earnings?.basicPay || payroll.basicPay || 0)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-lg font-bold text-purple-600">
                                  {formatCurrency(payroll.summary?.netPayable || payroll.netSalary || 0)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                                  {statusColor.icon}
                                  <span className="ml-2">{payroll.status}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {payroll.attendance?.presentDays ? (
                                  <div className="text-sm text-gray-600">
                                    {payroll.attendance.presentDays}/{payroll.attendance.totalWorkingDays || 30} days
                                    <div className="text-xs text-green-500">
                                      {Math.round((payroll.attendance.presentDays / (payroll.attendance.totalWorkingDays || 30)) * 100)}%
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedPayroll(payroll);
                                      setShowDetailsModal(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  
                                  {payroll.status === 'Pending' && (
                                    <button
                                      onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Mark as Paid"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleDeletePayroll(payroll._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month-Year Wise Payroll View Modal */}
      {showMonthYearDetails && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payroll Summary - {monthNames[selectedMonthYearForView.month - 1]} {selectedMonthYearForView.year}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Showing payrolls for {monthYearPayrolls.length} employees
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMonthYearDetails(false);
                    setSelectedMonthYearForView({ month: '', year: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {[...new Set(monthYearPayrolls.map(p => p.employee))].length}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(monthYearPayrolls.reduce((sum, p) => sum + (p.summary?.netPayable || p.netSalary || 0), 0))}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {monthYearPayrolls.filter(p => p.status === 'Paid').length}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {monthYearPayrolls.filter(p => p.status === 'Pending').length}
                  </p>
                </div>
              </div>

              {/* Month-Year Payrolls Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Basic Pay</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Payable</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attendance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthYearPayrolls.map((payroll, index) => {
                      const statusColor = getStatusColor(payroll.status);
                      const employeeName = getEmployeeName(payroll);
                      
                      return (
                        <tr key={payroll._id || index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                                {employeeName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{employeeName}</div>
                                <div className="text-xs text-gray-500">
                                  {payroll.employee?.designation || 'Employee'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">
                              {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-blue-600">
                              {formatCurrency(payroll.earnings?.basicPay || payroll.basicPay || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-purple-600">
                              {formatCurrency(payroll.summary?.netPayable || payroll.netSalary || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                              {statusColor.icon}
                              <span className="ml-1">{payroll.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {payroll.attendance?.presentDays ? (
                              <div className="text-xs">
                                <span className="text-green-600">{payroll.attendance.presentDays} days</span>
                                <div className="text-gray-400">
                                  {Math.round((payroll.attendance.presentDays / (payroll.attendance.totalWorkingDays || 30)) * 100)}%
                                </div>
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setShowDetailsModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye size={14} />
                              </button>
                              
                              {payroll.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Mark Paid"
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  const employee = employees.find(e => e._id === payroll.employee || e._id === payroll.employeeId);
                                  if (employee) {
                                    handleViewEmployeePayrolls(employee);
                                  }
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                title="View Employee"
                              >
                                <User size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Payroll Modal */}
      {showCalculateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Calculate Payroll</h2>
                  <p className="text-gray-500 text-sm mt-1">Auto-calculate based on attendance (30 days month)</p>
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
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={calculateForm.employeeId}
                  onChange={(e) => setCalculateForm({ ...calculateForm, employeeId: e.target.value })}
                  required
                  disabled={loading.employees}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Choose an employee</option>
                  {employees.map((emp) => {
                    const salaryData = employeeSalaries[emp._id] || {};
                    return (
                      <option key={emp._id} value={emp._id}>
                        {salaryData.name || `${emp.firstName} ${emp.lastName}`.trim()} • 
                        Salary: {formatCurrency(salaryData.salary || 30000)}/month
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Month and Year Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <select
                    value={calculateForm.month}
                    onChange={(e) => setCalculateForm({ ...calculateForm, month: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    value={calculateForm.year}
                    onChange={(e) => setCalculateForm({ ...calculateForm, year: e.target.value })}
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

              {/* Calculation Result */}
              {calculationResult && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h3 className="text-sm font-medium text-green-700 mb-3">Calculation Result</h3>
                  
                  <div className="space-y-4">
                    {/* Employee Info */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Employee:</span>
                      <span className="text-sm font-medium">{calculationResult.employeeDetails.name}</span>
                    </div>
                    
                    {/* Period */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Period:</span>
                      <span className="text-sm font-medium">
                        {monthNames[calculationResult.month - 1]} {calculationResult.year}
                      </span>
                    </div>
                    
                    {/* Attendance */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-white rounded-lg border">
                        <span className="text-xs text-gray-600">Present Days</span>
                        <p className="text-lg font-bold text-green-600">
                          {calculationResult.attendanceBreakdown.presentDays}/{calculationResult.attendanceBreakdown.totalWorkingDays}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border">
                        <span className="text-xs text-gray-600">Attendance %</span>
                        <p className="text-lg font-bold text-blue-600">
                          {calculationResult.attendancePercentage}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Salary Calculation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly Salary:</span>
                        <span className="text-sm font-medium">{formatCurrency(calculationResult.monthlySalary)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Daily Rate (÷30):</span>
                        <span className="text-sm font-medium">{formatCurrency(calculationResult.dailyRate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Basic Pay:</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(calculationResult.basicPay)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Deductions */}
                    {calculationResult.deductions.total > 0 && (
                      <div className="p-3 bg-rose-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-rose-700">Deductions:</span>
                          <span className="text-sm font-bold text-rose-700">
                            {formatCurrency(calculationResult.deductions.total)}
                          </span>
                        </div>
                        {calculationResult.deductions.lateDeduction > 0 && (
                          <div className="text-xs text-rose-600">
                            Late: {formatCurrency(calculationResult.deductions.lateDeduction)}
                          </div>
                        )}
                        {calculationResult.deductions.absentDeduction > 0 && (
                          <div className="text-xs text-rose-600">
                            Absent: {formatCurrency(calculationResult.deductions.absentDeduction)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Net Payable */}
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-purple-700">Net Payable:</span>
                        <span className="text-xl font-bold text-purple-700">
                          {formatCurrency(calculationResult.summary.netPayable)}
                        </span>
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        {calculationResult.summary.inWords}
                      </div>
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleAutoGenerateFromCalculation}
                    disabled={loading.action}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading.action ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={18} />
                        Generate Payroll from Calculation
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCalculateModal(false);
                    setCalculationResult(null);
                  }}
                  disabled={loading.calculation}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.calculation}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {loading.calculation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator size={18} />
                      Calculate Payroll
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Bulk Generate Payrolls</h2>
                  <p className="text-gray-500 text-sm mt-1">Generate for all employees (30 days month)</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <select
                    value={bulkForm.month}
                    onChange={(e) => setBulkForm({ ...bulkForm, month: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    value={bulkForm.year}
                    onChange={(e) => setBulkForm({ ...bulkForm, year: e.target.value })}
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

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Employees:</span>
                    <span className="text-sm font-medium">{employees.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Month:</span>
                    <span className="text-sm font-medium">
                      {bulkForm.month ? monthNames[parseInt(bulkForm.month) - 1] : 'N/A'} {bulkForm.year}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Payrolls will be generated with auto-calculated attendance and deductions
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  disabled={loading.generate}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.generate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {loading.generate ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <UsersIcon size={18} />
                      Generate for All
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Month Year Selection Modal */}
      {showMonthYearViewModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Select Month & Year</h2>
                <button
                  onClick={() => setShowMonthYearViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={selectedMonthYear.month}
                    onChange={(e) => setSelectedMonthYear(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Month</option>
                    {monthNames.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedMonthYear.year}
                    onChange={(e) => setSelectedMonthYear(prev => ({ ...prev, year: e.target.value }))}
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
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowMonthYearViewModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedMonthYear.month && selectedMonthYear.year) {
                      handleMonthYearPayrollView(parseInt(selectedMonthYear.month), parseInt(selectedMonthYear.year));
                      setShowMonthYearViewModal(false);
                    } else {
                      toast.error('Please select both month and year');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90"
                >
                  View Payrolls
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Details Modal */}
      {showDetailsModal && selectedPayroll && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
                  <p className="text-gray-500 text-sm mt-1">Complete breakdown of payroll calculation</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPayroll(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {getEmployeeName(selectedPayroll).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{getEmployeeName(selectedPayroll)}</h3>
                  <p className="text-gray-600">
                    {formatDate(selectedPayroll.periodStart)} - {formatDate(selectedPayroll.periodEnd)}
                  </p>
                  {selectedPayroll.month && selectedPayroll.year && (
                    <p className="text-sm text-gray-500">
                      {monthNames[selectedPayroll.month - 1]} {selectedPayroll.year}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  {(() => {
                    const statusColor = getStatusColor(selectedPayroll.status);
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                        {statusColor.icon}
                        <span className="ml-2">{selectedPayroll.status}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Salary Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Salary Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Monthly Salary</span>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedPayroll.salaryDetails?.monthlySalary || selectedPayroll.monthlySalary || 30000)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Daily Rate (÷30)</span>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedPayroll.salaryDetails?.dailyRate || calculateDailyRate(selectedPayroll.salaryDetails?.monthlySalary || 30000))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              {selectedPayroll.attendance && (
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendance (30 days month)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Present Days</span>
                      <p className="text-lg font-bold text-green-600">
                        {selectedPayroll.attendance.presentDays || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Working Days</span>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedPayroll.attendance.totalWorkingDays || 30}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Attendance %</span>
                      <p className="text-lg font-bold text-purple-600">
                        {selectedPayroll.attendance.attendancePercentage || 
                         Math.round(((selectedPayroll.attendance.presentDays || 0) / (selectedPayroll.attendance.totalWorkingDays || 30)) * 100)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Absent Days</span>
                      <p className="text-lg font-bold text-rose-600">
                        {(selectedPayroll.attendance.totalWorkingDays || 30) - (selectedPayroll.attendance.presentDays || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Earnings */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Earnings (BDT)</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Basic Pay:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0)}
                    </span>
                  </div>
                  {selectedPayroll.earnings?.overtime > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overtime:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(selectedPayroll.earnings.overtime)}
                      </span>
                    </div>
                  )}
                  {selectedPayroll.earnings?.bonus > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Bonus:</span>
                      <span className="font-medium text-yellow-600">
                        {formatCurrency(selectedPayroll.earnings.bonus)}
                      </span>
                    </div>
                  )}
                  {selectedPayroll.earnings?.allowance > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Allowance:</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(selectedPayroll.earnings.allowance)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Total Earnings:</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(selectedPayroll.earnings?.total || 
                          (selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0) + 
                          (selectedPayroll.earnings?.overtime || 0) + 
                          (selectedPayroll.earnings?.bonus || 0) + 
                          (selectedPayroll.earnings?.allowance || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              {(selectedPayroll.deductions?.total > 0 || selectedPayroll.autoDeductionsApplied) && (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Deductions (BDT)</h3>
                  <div className="space-y-2">
                    {selectedPayroll.deductions?.lateDeduction > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Late Deduction:</span>
                        <span className="font-medium text-rose-600">
                          {formatCurrency(selectedPayroll.deductions.lateDeduction)}
                        </span>
                      </div>
                    )}
                    {selectedPayroll.deductions?.absentDeduction > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Absent Deduction:</span>
                        <span className="font-medium text-rose-600">
                          {formatCurrency(selectedPayroll.deductions.absentDeduction)}
                        </span>
                      </div>
                    )}
                    {selectedPayroll.deductions?.leaveDeduction > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Leave Deduction:</span>
                        <span className="font-medium text-rose-600">
                          {formatCurrency(selectedPayroll.deductions.leaveDeduction)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-rose-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Total Deductions:</span>
                        <span className="text-lg font-bold text-rose-600">
                          {formatCurrency(selectedPayroll.deductions?.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary (BDT)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Gross Earnings:</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(selectedPayroll.summary?.grossEarnings || 
                        selectedPayroll.earnings?.total || 
                        (selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Deductions:</span>
                    <span className="font-medium text-rose-600">
                      {formatCurrency(selectedPayroll.summary?.totalDeductions || selectedPayroll.deductions?.total || 0)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">Net Payable:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(selectedPayroll.summary?.netPayable || selectedPayroll.netSalary || 0)}
                      </span>
                    </div>
                    {selectedPayroll.summary?.inWords && (
                      <p className="text-sm text-purple-700 mt-2">
                        {selectedPayroll.summary.inWords}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPayroll(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPayroll.status === 'Pending' && isAdmin && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedPayroll._id, 'Paid');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;