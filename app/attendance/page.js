"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Clock, Calendar, Filter, Download, BarChart3, 
  Users, UserCheck, UserX, AlertCircle, CheckCircle, 
  XCircle, RefreshCw, Plus, FileSpreadsheet, Edit, 
  Eye, Trash2, Search, ChevronLeft, ChevronRight,
  MoreVertical, Sun, Moon, MapPin, Smartphone,
  Server, Network, Printer, Share2, Upload,
  Loader2, Settings, FileText, PieChart,
  Bell, Clock4, TrendingUp, Home, Briefcase,
  Coffee, Activity, User as UserIcon, Shield,
  LogIn, LogOut, CalendarDays, Layers,
  Database, Save, HardDrive, Wifi, X,
  FileEdit, CalendarRange, Globe, Battery,
  BatteryCharging, Cpu, MemoryStick,
  CreditCard, Award, Target, Zap,
  TrendingDown, Clock9, Clock10, MoonStar,
  Sunrise, Sunset, Thermometer, Cloud,
  CloudRain, Wind, Droplets, Umbrella
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const AttendanceManagement = ({ userId, isAdminView = false }) => {
  const router = {
    push: (path) => window.location.href = path
  };

  // ===================== STATE MANAGEMENT =====================
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [todayStatus, setTodayStatus] = useState({
    clockedIn: false,
    clockedOut: false,
    clockInTime: null,
    clockOutTime: null,
    status: "Not Clocked",
    date: new Date().toDateString()
  });
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState("employee");
  const [isAdmin, setIsAdmin] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [lastAutoCheck, setLastAutoCheck] = useState({ date: '', type: '' });
  // Filters and Pagination
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: "",
    department: "",
    status: "all",
    search: ""
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    totalItems: 0
  });

  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Form Data
  const [manualForm, setManualForm] = useState({
    employeeId: "",
    employeeName: "",
    date: new Date().toISOString().split('T')[0],
    clockIn: "09:00",
    clockOut: "18:00",
    status: "Present",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    remarks: "",
    ipAddress: "",
    location: "Office",
    deviceType: "desktop",
    isHoliday: false,
    holidayType: null
  });

  const [bulkForm, setBulkForm] = useState({
    employeeId: "",
    employeeName: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    defaultShiftStart: "09:00",
    defaultShiftEnd: "18:00",
    holidays: [],
    leaveDates: [],
    workingDays: [],
    markAllAsPresent: false,
    skipWeekends: true
  });

  // System Info
  const [systemInfo, setSystemInfo] = useState({
    ipAddress: "Fetching...",
    location: "Fetching...",
    device: {
      type: "desktop",
      os: "Unknown",
      browser: "Unknown",
      userAgent: ""
    },
    battery: null,
    connection: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Current Time
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
 

  // ===================== CONSTANTS & HELPER FUNCTIONS =====================
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const TIMEZONE = "Asia/Dhaka";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || 
             localStorage.getItem("adminToken") || 
             localStorage.getItem("employeeToken");
    }
    return null;
  };

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    return timeString;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status, statusType = null) => {
  // বিশেষভাবে Early-Present এবং Late-Present হ্যান্ডেল করা
  if (status === "Present") {
    if (statusType === "Early") {
      return { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-200',
        displayText: 'Early-Present'  // নতুন property
      };
    }
    if (statusType === "Late") {
      return { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        border: 'border-yellow-200',
        displayText: 'Late-Present'  // নতুন property
      };
    }
  }
  
  // বাকি status গুলোর জন্য
  const colors = {
    'Present': { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      border: 'border-green-200',
      displayText: 'Present'  // নতুন property
    },
    'Absent': { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      border: 'border-red-200',
      displayText: 'Absent'  // নতুন property
    },
    'Late': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      border: 'border-yellow-200',
      displayText: 'Late'  // নতুন property
    },
    'Early': { 
      bg: 'bg-orange-100', 
      text: 'text-orange-800', 
      border: 'border-orange-200',
      displayText: 'Early'  // নতুন property
    },
    'Leave': { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      border: 'border-blue-200',
      displayText: 'Leave'  // নতুন property
    },
    'Govt Holiday': { 
      bg: 'bg-purple-100', 
      text: 'text-purple-800', 
      border: 'border-purple-200',
      displayText: 'Govt Holiday'  // নতুন property
    },
    'Weekly Off': { 
      bg: 'bg-indigo-100', 
      text: 'text-indigo-800', 
      border: 'border-indigo-200',
      displayText: 'Weekly Off'  // নতুন property
    },
    'Off Day': { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      border: 'border-gray-200',
      displayText: 'Off Day'  // নতুন property
    },
    'Clocked In': { 
      bg: 'bg-cyan-100', 
      text: 'text-cyan-800', 
      border: 'border-cyan-200',
      displayText: 'Clocked In'  // নতুন property
    },
    'Half Day': { 
      bg: 'bg-amber-100', 
      text: 'text-amber-800', 
      border: 'border-amber-200',
      displayText: 'Half Day'  // নতুন property
    },
    'Auto Absent': { 
      bg: 'bg-red-50', 
      text: 'text-red-600', 
      border: 'border-red-100',
      displayText: 'Auto Absent'  // নতুন property
    },
    'Half Paid Leave': { 
      bg: 'bg-pink-100', 
      text: 'text-pink-800', 
      border: 'border-pink-200',
      displayText: 'Half Paid Leave'  // নতুন property
    },
    'Unpaid Leave': { 
      bg: 'bg-rose-100', 
      text: 'text-rose-800', 
      border: 'border-rose-200',
      displayText: 'Unpaid Leave'  // নতুন property
    }
  };
  
  const result = colors[status] || colors['Absent'];
  // displayText না থাকলে status দিয়ে সেট করুন
  if (!result.displayText) {
    result.displayText = status;
  }
  return result;
};

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end - start;
    return (diffMs / (1000 * 60 * 60)).toFixed(2);
  };

  const getDayStatus = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDay();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check for holidays (you can expand this)
  const holidays = [
    '2024-01-01', // New Year
    '2024-12-16', // Victory Day
    '2024-12-25'  // Christmas
  ];
  
  if (holidays.includes(dateString)) {
    return {
      status: 'Govt Holiday',
      dayName: dayName,
      isWeekend: true,
      isWorkingDay: false,
      description: 'Government Holiday'
    };
  }
  
  // Bangladesh weekend: Friday & Saturday
  if (day === 5) { // Friday
    return {
      status: 'Weekly Off',
      dayName: 'Friday',
      isWeekend: true,
      isWorkingDay: false,
      description: 'Friday - Weekly Off'
    };
  }
  
  if (day === 6) { // Saturday
    return {
      status: 'Weekly Off',
      dayName: 'Saturday',
      isWeekend: true,
      isWorkingDay: false,
      description: 'Saturday - Weekly Off'
    };
  }
  
  // Sunday is working day in Bangladesh
  if (day === 0) { // Sunday
    return {
      status: 'Working Day',
      dayName: 'Sunday',
      isWeekend: false,
      isWorkingDay: true,
      description: 'Sunday - Working Day'
    };
  }
  
  // Monday-Thursday (1-4)
  return {
    status: 'Working Day',
    dayName: dayName,
    isWeekend: false,
    isWorkingDay: true,
    description: `${dayName} - Working Day`
  };
};

  const getAutoStatus = (dateString) => {
    const dayStatus = getDayStatus(dateString);
    return dayStatus.status;
  };

  const formatDayMessage = (dateString) => {
    const dayStatus = getDayStatus(dateString);
    
    if (dayStatus.status === 'Govt Holiday') {
      return `🎉 ${dayStatus.dayName} - Government Holiday (Auto-generated at 1:00 AM)`;
    }
    
    if (dayStatus.status === 'Weekly Off') {
      return `🏖️ ${dayStatus.dayName} - Weekly Off (Auto-generated at 1:00 AM)`;
    }
    
    return `🏢 ${dayStatus.dayName} - Working Day`;
  };

  // ===================== API FUNCTIONS =====================
  const fetchUserProfile = async () => {
  try {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const endpoint = token.includes('admin') 
      ? `${API_URL}/admin/getAdminProfile`
      : `${API_URL}/users/getProfile`;

    const response = await fetch(endpoint, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const data = await response.json();
      const user = data.user || data;
      setUserData(user);
      setUserRole(user.role || 'employee');
      setIsAdmin((user.role || '').toLowerCase() === 'admin');
      
      // User এর shift timing fetch করুন
      if (user.shiftTiming) {
        const shiftTiming = getUserShiftTiming(user);
        
        // Employee এর জন্য তাদের নিজের shift timing সেট করুন
        if (!isAdmin && user.role === 'employee') {
          setManualForm(prev => ({
            ...prev,
            shiftStart: shiftTiming.start,
            shiftEnd: shiftTiming.end,
            clockIn: shiftTiming.start,
            clockOut: shiftTiming.end
          }));
          
          setBulkForm(prev => ({
            ...prev,
            defaultShiftStart: shiftTiming.start,
            defaultShiftEnd: shiftTiming.end
          }));
        }
      }
      
      return user;
    } else if (response.status === 401) {
      localStorage.clear();
      router.push('/login');
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
  return null;
};

  const fetchTodayStatus = async () => {
    if (isAdmin) return;
    
    try {
      const response = await fetch(`${API_URL}/attendance/today-status`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodayStatus({
          clockedIn: data.clockedIn || false,
          clockedOut: data.clockedOut || false,
          clockInTime: data.attendance?.clockIn || null,
          clockOutTime: data.attendance?.clockOut || null,
          status: data.attendance?.status || "Not Clocked",
          date: new Date().toDateString()
        });
      }
    } catch (error) {
      console.error("Error fetching today status:", error);
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        ...(filters.department && { department: filters.department }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const endpoint = isAdmin 
        ? `${API_URL}/admin/all-records`
        : `${API_URL}/records`;

      const response = await fetch(`${endpoint}?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.records || data || []);
        setPagination(prev => ({
          ...prev,
          totalItems: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / pagination.itemsPerPage)
        }));
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.employeeId && { employeeId: filters.employeeId })
      });

      const endpoint = isAdmin
        ? `${API_URL}/attendance/admin/summary`
        : `${API_URL}/attendance/summary`;

      const response = await fetch(`${endpoint}?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary || data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchEmployees = async () => {
  if (!isAdmin) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/getAll-user`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      // Handle different response structures
      let employeesArray = [];
      
      if (Array.isArray(data)) {
        employeesArray = data;
      } else if (data.users && Array.isArray(data.users)) {
        employeesArray = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        employeesArray = data.data;
      }
      
      const formattedEmployees = employeesArray
        .filter(emp => emp && typeof emp === 'object')
        .map(emp => ({
          _id: emp._id || emp.id || '',
          firstName: emp.firstName || emp.first_name || '',
          lastName: emp.lastName || emp.last_name || '',
          email: emp.email || '',
          employeeId: emp.employeeId || emp.employee_id || '',
          department: emp.department || 'No Department',
          position: emp.position || emp.designation || '',
          phone: emp.phone || emp.phone_number || '',
          status: emp.status || 'active',
          shiftTiming: emp.shiftTiming || null, // Shift timing যোগ করুন
          role: emp.role || 'employee'
        }));
      
      setEmployees(formattedEmployees);
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

  const fetchSystemInfo = async () => {
    try {
      // Get IP Address
      let ipAddress = "Unknown";
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipError) {
        console.log("Could not fetch public IP");
      }

      // Get device info
      const userAgent = navigator.userAgent;
      let deviceType = 'desktop';
      let os = 'Unknown';
      let browser = 'Unknown';

      if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
        deviceType = 'mobile';
      } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'tablet';
      }

      if (/Windows/i.test(userAgent)) {
        os = 'Windows';
      } else if (/Mac/i.test(userAgent)) {
        os = 'MacOS';
      } else if (/Linux/i.test(userAgent)) {
        os = 'Linux';
      } else if (/Android/i.test(userAgent)) {
        os = 'Android';
      } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        os = 'iOS';
      }

      if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
        browser = 'Chrome';
      } else if (/Firefox/i.test(userAgent)) {
        browser = 'Firefox';
      } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
        browser = 'Safari';
      } else if (/Edg/i.test(userAgent)) {
        browser = 'Edge';
      }

      // Get battery info if available
      let batteryInfo = null;
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          batteryInfo = {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          };
        } catch (e) {
          // Battery API not supported
        }
      }

      // Get connection info
      let connectionInfo = null;
      if ('connection' in navigator) {
        connectionInfo = {
          type: navigator.connection.type,
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        };
      }

      // Get location
      let location = "Office";
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          const { latitude, longitude } = position.coords;
          location = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
          
          // Try reverse geocoding
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const geoData = await geoResponse.json();
            if (geoData.display_name) {
              location = geoData.display_name.split(',').slice(0, 2).join(',');
            }
          } catch (geoError) {
            // Silently fail reverse geocoding
          }
        } catch (locError) {
          // Location permission denied or error
          console.log("Location access denied or error:", locError);
        }
      }

      setSystemInfo({
        ipAddress,
        location,
        device: {
          type: deviceType,
          os,
          browser,
          userAgent: userAgent.substring(0, 100)
        },
        battery: batteryInfo,
        connection: connectionInfo,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

    } catch (error) {
      console.error("Error fetching system info:", error);
    }
  };

  const fetchWeather = async () => {
    try {
      // This is a mock weather function. Replace with actual API
      const mockWeather = {
        temp: 28,
        condition: "Sunny",
        humidity: 65,
        wind: 12,
        icon: "☀️"
      };
      setWeather(mockWeather);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  // ===================== ATTENDANCE ACTIONS =====================
const handleClockIn = async () => {
  try {
    const shiftTiming = getUserShiftTiming(userData);
    const now = new Date();
    const shiftStart = parseTime(shiftTiming.start);
    
    let isLate = false;
    let isEarly = false;
    let lateMinutes = 0;
    let earlyMinutes = 0;
    let status = "Present";
    let statusType = "OnTime";
    
    if (shiftStart) {
      const diffMinutes = Math.floor((now - shiftStart) / (1000 * 60));
      
      // ১. EARLY (1+ minutes BEFORE shift)
      if (diffMinutes < 0) {
        const minutesBefore = Math.abs(diffMinutes);
        if (minutesBefore >= 1) {
          isEarly = true;
          earlyMinutes = minutesBefore;
          status = "Present";
          statusType = "Early";
        }
      }
      // ২. LATE (5+ minutes AFTER shift)
      else if (diffMinutes > 5) {
        isLate = true;
        lateMinutes = diffMinutes;
        status = "Present";
        statusType = "Late";
      }
      // ৩. ON-TIME (0 to 5 minutes)
      else {
        status = "Present";
        statusType = "OnTime";
      }
    }

    // API call (পুরানো ফাংশনের মত অন্যান্য ফিল্ড যোগ করুন)
    const response = await fetch(`${API_URL}/clock-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        timestamp: now.toISOString(),
        location: systemInfo.location,
        ipAddress: systemInfo.ipAddress,
        device: systemInfo.device,
        shiftStart: shiftTiming.start,
        shiftEnd: shiftTiming.end,
        shiftName: shiftTiming.name,
        isLate: isLate,
        isEarly: isEarly,
        lateMinutes: lateMinutes,
        earlyMinutes: earlyMinutes,
        status: status,
        statusType: statusType,
        expectedClockIn: shiftTiming.start
      })
    });

    if (response.ok) {
      const data = await response.json();
      toast.success(data.message || "Clocked in successfully");
      await fetchTodayStatus();
      await fetchAttendanceRecords();
      await fetchSummary();
    } else {
      const error = await response.json();
      toast.error(error.message || "Failed to clock in");
    }
  } catch (error) {
    console.error("Error clocking in:", error);
    toast.error("Failed to clock in");
  }
};

const handleClockOut = async () => {
  try {
    // Get user's shift timing
    const shiftTiming = getUserShiftTiming(userData);
    
    // Check if user is leaving early
    const now = new Date();
    const shiftEnd = parseTime(shiftTiming.end);
    
    let isEarly = false;
    let earlyMinutes = 0;
    let status = "Present";
    
    if (shiftEnd && now < shiftEnd) {
      const diffMinutes = Math.floor((shiftEnd - now) / (1000 * 60));
      if (diffMinutes > shiftTiming.earlyThreshold && shiftTiming.earlyThreshold >= 0) {
        isEarly = true;
        earlyMinutes = diffMinutes;
        status = "Early";
      }
    }

    const response = await fetch(`${API_URL}/clock-out`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        location: systemInfo.location,
        ipAddress: systemInfo.ipAddress,
        device: systemInfo.device,
        shiftStart: shiftTiming.start,
        shiftEnd: shiftTiming.end,
        shiftName: shiftTiming.name,
        isEarly: isEarly,
        earlyMinutes: earlyMinutes,
        status: status,
        expectedClockOut: shiftTiming.end
      })
    });

    if (response.ok) {
      const data = await response.json();
      toast.success(data.message || "Clocked out successfully");
      await fetchTodayStatus();
      await fetchAttendanceRecords();
      await fetchSummary();
    } else {
      const error = await response.json();
      toast.error(error.message || "Failed to clock out");
    }
  } catch (error) {
    console.error("Error clocking out:", error);
    toast.error("Failed to clock out");
  }
};

  const handleCreateManualAttendance = async () => {
    if (!manualForm.employeeId && !selectedEmployee?._id) {
      toast.error("Please select an employee");
      return;
    }

    try {
      const payload = {
        ...manualForm,
        employeeId: selectedEmployee?._id || manualForm.employeeId,
        clockIn: manualForm.clockIn ? `${manualForm.date}T${manualForm.clockIn}:00` : null,
        clockOut: manualForm.clockOut ? `${manualForm.date}T${manualForm.clockOut}:00` : null,
        ipAddress: systemInfo.ipAddress,
        device: systemInfo.device
      };

      const response = await fetch(`${API_URL}/attendance/admin/manual`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Attendance created successfully");
        setShowManualModal(false);
        resetManualForm();
        await fetchAttendanceRecords();
        await fetchSummary();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create attendance");
      }
    } catch (error) {
      console.error("Error creating manual attendance:", error);
      toast.error("Failed to create attendance");
    }
  };

  const handleCreateBulkAttendance = async () => {
    if (!bulkForm.employeeId && !selectedEmployee?._id) {
      toast.error("Please select an employee");
      return;
    }

    try {
      const payload = {
        ...bulkForm,
        employeeId: selectedEmployee?._id || bulkForm.employeeId,
        employeeName: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : bulkForm.employeeName
      };

      const response = await fetch(`${API_URL}/attendance/admin/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Bulk attendance created successfully");
        setShowBulkModal(false);
        resetBulkForm();
        await fetchAttendanceRecords();
        await fetchSummary();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create bulk attendance");
      }
    } catch (error) {
      console.error("Error creating bulk attendance:", error);
      toast.error("Failed to create bulk attendance");
    }
  };

  const handleUpdateAttendance = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/attendance/admin/update/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Attendance updated successfully");
        setShowEditModal(false);
        setEditingRecord(null);
        await fetchAttendanceRecords();
        await fetchSummary();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update attendance");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance");
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/attendance/admin/delete/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: "Deleted by admin" })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Attendance deleted successfully");
        await fetchAttendanceRecords();
        await fetchSummary();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete attendance");
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      toast.error("Failed to delete attendance");
    }
  };

  const handleCorrectAttendance = async (id) => {
    try {
      const response = await fetch(`${API_URL}/attendance/admin/correct/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingRecord)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Attendance corrected successfully");
        setShowEditModal(false);
        setEditingRecord(null);
        await fetchAttendanceRecords();
        await fetchSummary();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to correct attendance");
      }
    } catch (error) {
      console.error("Error correcting attendance:", error);
      toast.error("Failed to correct attendance");
    }
  };

  const handleExportData = async (format = 'csv') => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format,
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        ...(filters.department && { department: filters.department })
      });

      const endpoint = isAdmin
        ? `${API_URL}/attendance/admin/export`
        : `${API_URL}/attendance/export`;

      const response = await fetch(`${endpoint}?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `attendance_${filters.startDate}_to_${filters.endDate}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("CSV exported successfully!");
        } else {
          const data = await response.json();
          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `attendance_${filters.startDate}_to_${filters.endDate}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("JSON exported successfully!");
        }
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };
const triggerAutoAbsentMarking = async (reason) => {
  try {
    const shiftTiming = getUserShiftTiming(userData);
    
    const response = await fetch(`${API_URL}/attendance/auto-mark-absent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        reason: reason,
        markedBy: "System Auto",
        shiftTiming: shiftTiming,
        ruleType: reason.includes('5 hours') ? '5_hour_rule' : 'shift_start_rule'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Auto absent marked:", data.message);
      
      // Refresh data
      fetchTodayStatus();
      fetchAttendanceRecords();
      fetchSummary();
    }
  } catch (error) {
    console.error("Error in auto absent marking:", error);
  }
};
  // Admin trigger functions
  const handleTriggerAutoClockOut = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/admin/trigger-auto-clockout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Auto clock out triggered");
        await fetchAttendanceRecords();
        await fetchSummary();
      }
    } catch (error) {
      console.error("Error triggering auto clock out:", error);
      toast.error("Failed to trigger auto clock out");
    }
  };

  const handleTriggerAbsentMarking = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/admin/trigger-absent-marking`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Absent marking triggered");
        await fetchAttendanceRecords();
        await fetchSummary();
      }
    } catch (error) {
      console.error("Error triggering absent marking:", error);
      toast.error("Failed to trigger absent marking");
    }
  };

  const handleTriggerTomorrowRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/admin/trigger-tomorrow-records`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Tomorrow records generated");
        await fetchAttendanceRecords();
        await fetchSummary();
      }
    } catch (error) {
      console.error("Error triggering tomorrow records:", error);
      toast.error("Failed to generate tomorrow records");
    }
  };

  // ===================== HELPER FUNCTIONS ===================== 
// Calculate if 5 hours passed since shift start
const checkFiveHoursPassed = (record) => {
  if (!record.clockIn && record.shiftStart) {
    const now = new Date();
    const shiftStartTime = parseTime(record.shiftStart);
    
    if (shiftStartTime) {
      // Set shift start time for today
      const todayShiftStart = new Date();
      todayShiftStart.setHours(shiftStartTime.getHours(), shiftStartTime.getMinutes(), 0, 0);
      
      // Calculate difference in hours
      const diffHours = (now - todayShiftStart) / (1000 * 60 * 60);
      
      return diffHours >= 5;
    }
  }
  return false;
};

// Check if 5 hours passed since shift start (for today)
const checkFiveHoursFromShiftStart = () => {
  if (!userData || isAdmin) return false;
  
  const shiftTiming = getUserShiftTiming(userData);
  if (!shiftTiming) return false;
  
  const now = new Date();
  const shiftStartTime = parseTime(shiftTiming.start);
  
  if (!shiftStartTime || todayStatus.clockedIn) return false;
  
  // Set shift start time for today
  const todayShiftStart = new Date();
  todayShiftStart.setHours(shiftStartTime.getHours(), shiftStartTime.getMinutes(), 0, 0);
  
  // Calculate difference in hours
  const diffHours = (now - todayShiftStart) / (1000 * 60 * 60);
  
  return {
    passed: diffHours >= 5,
    hoursPassed: diffHours,
    shiftStartTime: todayShiftStart
  };
};
const getUserShiftTiming = (user) => {
  if (!user || !user.shiftTiming) {
    return {
      start: "09:00",
      end: "18:00",
      lateThreshold: 5,
      earlyThreshold: -1,
      autoClockOutDelay: 10,
      name: "Default Shift",
      shiftType: "regular"
    };
  }

  // Check if assigned shift is active
  if (user.shiftTiming.assignedShift && user.shiftTiming.assignedShift.isActive) {
    return {
      start: user.shiftTiming.assignedShift.start || "09:00",
      end: user.shiftTiming.assignedShift.end || "18:00",
      lateThreshold: user.shiftTiming.assignedShift.lateThreshold || 5,
      earlyThreshold: user.shiftTiming.assignedShift.earlyThreshold || -1,
      autoClockOutDelay: user.shiftTiming.assignedShift.autoClockOutDelay || 10,
      name: user.shiftTiming.assignedShift.name || "Assigned Shift",
      shiftType: "assigned"
    };
  }

  // Otherwise use default shift
  return {
    start: user.shiftTiming.defaultShift.start || "09:00",
    end: user.shiftTiming.defaultShift.end || "18:00",
    lateThreshold: user.shiftTiming.defaultShift.lateThreshold || 5,
    earlyThreshold: user.shiftTiming.defaultShift.earlyThreshold || -1,
    autoClockOutDelay: user.shiftTiming.defaultShift.autoClockOutDelay || 10,
    name: user.shiftTiming.defaultShift.name || "Regular Shift",
    shiftType: "default"
  };
};

// Parse time string to Date object
const parseTime = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Calculate auto clock out time
const getAutoClockOutTime = (shiftEnd, delayMinutes) => {
  const shiftEndTime = parseTime(shiftEnd);
  if (!shiftEndTime) return null;
  shiftEndTime.setMinutes(shiftEndTime.getMinutes() + delayMinutes);
  return shiftEndTime;
};

  const resetManualForm = () => {
    setManualForm({
      employeeId: "",
      employeeName: "",
      date: new Date().toISOString().split('T')[0],
      clockIn: "09:00",
      clockOut: "18:00",
      status: "Present",
      shiftStart: "09:00",
      shiftEnd: "18:00",
      remarks: "",
      ipAddress: systemInfo.ipAddress,
      location: systemInfo.location,
      deviceType: "desktop",
      isHoliday: false,
      holidayType: null
    });
    setSelectedEmployee(null);
  };

  const resetBulkForm = () => {
    setBulkForm({
      employeeId: "",
      employeeName: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      defaultShiftStart: "09:00",
      defaultShiftEnd: "18:00",
      holidays: [],
      leaveDates: [],
      workingDays: [],
      markAllAsPresent: false,
      skipWeekends: true
    });
    setSelectedEmployee(null);
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    if (showManualModal) {
      setManualForm(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`
      }));
    }
    if (showBulkModal) {
      setBulkForm(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`
      }));
    }
    setShowEmployeeSelector(false);
  };

  const openEditModal = (record) => {
    setEditingRecord({
      ...record,
      clockIn: record.clockIn ? formatTime(record.clockIn).replace(' ', '') : '',
      clockOut: record.clockOut ? formatTime(record.clockOut).replace(' ', '') : '',
      date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  // Add holiday/leave date management functions
  const addHoliday = () => {
    const date = prompt("Enter holiday date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    const type = prompt("Enter holiday type (Govt Holiday/Weekly Off/Other):", "Govt Holiday");
   
    if (date && type) {
      setBulkForm(prev => ({
        ...prev,
        holidays: [...prev.holidays, { date, type }]
      }));
      toast.success(`Added holiday: ${date} - ${type}`);
    }
  };

  const addLeaveDate = () => {
    const date = prompt("Enter leave date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
   
    if (date) {
      setBulkForm(prev => ({
        ...prev,
        leaveDates: [...prev.leaveDates, date]
      }));
      toast.success(`Added leave date: ${date}`);
    }
  };

  const addWorkingDay = () => {
    const date = prompt("Enter working date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
   
    if (date) {
      setBulkForm(prev => ({
        ...prev,
        workingDays: [...prev.workingDays, date]
      }));
      toast.success(`Added working day: ${date}`);
    }
  };

  const generateBulkAttendanceData = () => {
    const month = parseInt(bulkForm.month);
    const year = parseInt(bulkForm.year);
    
    if (isNaN(month) || isNaN(year)) return [];
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceRecords = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const dayStatus = getDayStatus(dateString);
      
      // Skip weekends if option is enabled
      if (bulkForm.skipWeekends && (dayOfWeek === 5 || dayOfWeek === 6)) {
        continue;
      }
      
      // Check if it's a holiday
      const isHoliday = bulkForm.holidays.some(h => h.date === dateString);
      const isLeave = bulkForm.leaveDates.includes(dateString);
      const isWorkingDay = bulkForm.workingDays.includes(dateString);
      
      let status = 'Present';
      let remarks = 'Bulk created by admin';
      
      if (isHoliday) {
        status = 'Govt Holiday';
        remarks = 'Holiday - Bulk created';
      } else if (isLeave) {
        status = 'Leave';
        remarks = 'Leave - Bulk created';
      } else if (isWorkingDay) {
        status = 'Present';
        remarks = 'Working Day - Bulk created';
      } else if (bulkForm.markAllAsPresent) {
        status = 'Present';
        remarks = 'Marked present - Bulk created';
      } else if (!dayStatus.isWorkingDay) {
        // For non-working days (like holidays/weekly offs that weren't in the list)
        status = dayStatus.status;
        remarks = `${dayStatus.description} - Bulk created`;
      }
      
      // Auto-clear clock in/out for non-working days
      const clockIn = (status === 'Present') ? bulkForm.defaultShiftStart : null;
      const clockOut = (status === 'Present') ? bulkForm.defaultShiftEnd : null;
      
      attendanceRecords.push({
        date: dateString,
        clockIn,
        clockOut,
        status,
        shiftStart: bulkForm.defaultShiftStart,
        shiftEnd: bulkForm.defaultShiftEnd,
        remarks,
        isHoliday: status === 'Govt Holiday',
        holidayType: status === 'Govt Holiday' ? 'Bulk Holiday' : null,
        autoGenerated: status !== 'Present',
        isWorkingDay: dayStatus.isWorkingDay
      });
    }
    
    return attendanceRecords;
  }; 

  // ===================== EFFECTS =====================
  useEffect(() => {
    const init = async () => {
      await fetchUserProfile();
      await fetchSystemInfo();
      await fetchEmployees();
      await fetchTodayStatus();
      await fetchAttendanceRecords();
      await fetchSummary();
      await fetchWeather();
    };
    init();
  }, [pagination.currentPage, filters]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

// Check if already auto-marked today
const checkAlreadyAutoMarkedToday = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  return attendanceRecords.some(record => {
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    return recordDate === todayStr && record.status === 'Absent' && record.autoMarked;
  });
};

// Auto operations based on user's shift timing
useEffect(() => {
  const checkAutoOperations = () => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Get user's shift timing
  const shiftTiming = getUserShiftTiming(userData);
  
  if (!shiftTiming || !userData || isAdmin) return;
  
  // Parse shift times
  const shiftStartTime = parseTime(shiftTiming.start);
  const shiftEndTime = parseTime(shiftTiming.end);
  
  if (!shiftStartTime || !shiftEndTime) return;
  
  // Calculate only necessary times
  const fiveHourMarkTime = new Date(shiftStartTime);
  fiveHourMarkTime.setHours(fiveHourMarkTime.getHours() + 5);
  
  const autoClockOutTime = new Date(shiftEndTime);
  autoClockOutTime.setMinutes(autoClockOutTime.getMinutes() + shiftTiming.autoClockOutDelay);
  
  const lateNotificationTime = new Date(shiftStartTime);
  lateNotificationTime.setMinutes(lateNotificationTime.getMinutes() + 5);
  
  const fiveHourWarningTime = new Date(fiveHourMarkTime);
  fiveHourWarningTime.setMinutes(fiveHourWarningTime.getMinutes() - 30);
  
  // Get today's status
  const todayDayStatus = getDayStatus(todayStr);
  const isWorkingDay = todayDayStatus.isWeekend === false && todayDayStatus.status === 'Working Day';
  const alreadyMarked = checkAlreadyAutoMarkedToday();
  
  // ✅ 1. Auto Clock Out
  if (currentHours === autoClockOutTime.getHours() && currentMinutes === autoClockOutTime.getMinutes()) {
    if (todayStatus.clockedIn && !todayStatus.clockedOut && !isAdmin) {
      if (lastAutoCheck.date !== todayStr || lastAutoCheck.type !== 'clockout') {
        toast.info(`Auto clock out triggered at ${autoClockOutTime.getHours()}:${autoClockOutTime.getMinutes().toString().padStart(2, '0')}`);
        setLastAutoCheck({ date: todayStr, type: 'clockout' });
      }
    }
  }
  
  // ✅ 2. Auto Absent Marking - শুধু ৫-ঘন্টা রুল
  const isFiveHourMarkTime = 
    currentHours === fiveHourMarkTime.getHours() && 
    currentMinutes === fiveHourMarkTime.getMinutes();
  
  if (isFiveHourMarkTime && isWorkingDay) {
    if (!todayStatus.clockedIn && !isAdmin && !alreadyMarked) {
      const timeType = `5-Hour Rule (${fiveHourMarkTime.getHours()}:${fiveHourMarkTime.getMinutes().toString().padStart(2, '0')})`;
      const reason = "No clock in detected within 5 hours of shift start";
      
      toast.error(`Auto Absent marked at ${timeType} - ${reason}`);
      triggerAutoAbsentMarking(reason);
      
      setLastAutoCheck({ date: todayStr, type: '5hour-real-time' });
    }
  }
  
  // ✅ 3. Warning Notifications
  // 5-hour rule warning (30 minutes before)
  if (currentHours === fiveHourWarningTime.getHours() && currentMinutes === fiveHourWarningTime.getMinutes()) {
    if (!todayStatus.clockedIn && !isAdmin && isWorkingDay && lastAutoCheck.type !== '5hour-warning') {
      showFiveHourWarningToast(shiftTiming.start, handleClockIn);
      setLastAutoCheck({ date: todayStr, type: '5hour-warning' });
    }
  }
  
  // Late arrival notification (5 minutes after shift start)
  if (currentHours === lateNotificationTime.getHours() && currentMinutes === lateNotificationTime.getMinutes()) {
    if (!todayStatus.clockedIn && !isAdmin && isWorkingDay && lastAutoCheck.type !== 'late-notification') {
      showLateNotificationToast(shiftTiming, handleClockIn);
      setLastAutoCheck({ date: todayStr, type: 'late-notification' });
    }
  }
  
  // ✅ 4. Real-time 5-hour check (backup check)
  const fiveHourCheck = checkFiveHoursFromShiftStart();
  if (fiveHourCheck.passed && fiveHourCheck.hoursPassed >= 5 && fiveHourCheck.hoursPassed < 5.1) {
    if (!alreadyMarked && !todayStatus.clockedIn && isWorkingDay && lastAutoCheck.type !== '5hour-real-time') {
      toast.error(`5-Hour Rule Applied! Marked as Absent (No clock in within 5 hours of shift start)`);
      triggerAutoAbsentMarking("No clock in detected within 5 hours of shift start");
      setLastAutoCheck({ date: todayStr, type: '5hour-real-time' });
    }
  }
  
  // ✅ 5. Non-working day notification
  if (!isWorkingDay && (lastAutoCheck.date !== todayStr || lastAutoCheck.type !== 'nonworking')) {
    const dayMessage = formatDayMessage(todayStr);
    toast.info(`${dayMessage} - No attendance required today`);
    setLastAutoCheck({ date: todayStr, type: 'nonworking' });
  }
};
  
  // Helper toast functions for cleaner code
  const showFiveHourWarningToast = (shiftStartTime, handleClockIn) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <div className="font-bold">🚨 5-Hour Rule Warning</div>
          </div>
          <div className="text-sm">You haven't clocked in today!</div>
          <div className="text-xs text-gray-600">
            Shift started at: {shiftStartTime}
          </div>
          <div className="text-xs text-red-600 font-semibold">
            ⚠️ You'll be marked Absent in 30 minutes (5-hour rule)
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleClockIn();
              }}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Clock In Now
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      { 
        duration: 10000,
        id: '5hour-warning'
      }
    );
  };
  
  const showAutoAbsentWarningToast = (shiftTiming, handleClockIn) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <div className="font-bold">⚠️ Auto Absent Warning</div>
          </div>
          <div className="text-sm">You haven't clocked in today!</div>
          <div className="text-xs text-gray-600">
            Shift: {shiftTiming.start} - {shiftTiming.end}
          </div>
          <div className="text-xs text-red-600">
            System will mark you as Absent in 5 minutes
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleClockIn();
              }}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Clock In Now
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      { 
        duration: 10000,
        id: 'absent-warning'
      }
    );
  };
  
  const showLateNotificationToast = (shiftTiming, handleClockIn) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <Clock className="text-yellow-600" size={20} />
            <div className="font-bold">⏰ Running Late?</div>
          </div>
          <div className="text-sm">You haven't clocked in yet</div>
          <div className="text-xs text-gray-600">
            Shift started at: {shiftTiming.start}
          </div>
          <div className="text-xs text-yellow-600">
            You'll be marked Late after {shiftTiming.lateThreshold} minutes
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleClockIn();
            }}
            className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Clock In Now
          </button>
        </div>
      ),
      { 
        duration: 8000,
        id: 'late-notification'
      }
    );
  };
  
  // Check every 5 minutes for real-time monitoring
  const interval = setInterval(checkAutoOperations, 300000); // 5 minutes
  
  return () => clearInterval(interval);
}, [todayStatus, isAdmin, userData, lastAutoCheck, attendanceRecords]);
 

  // ===================== COMPONENTS =====================
  const SystemInfoBar = () => (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6 border border-blue-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Network className="text-white" size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">System Information</div>
            <div className="flex flex-wrap gap-4 mt-1">
              <div className="flex items-center gap-1">
                <Wifi size={14} className="text-blue-500" />
                <span className="text-sm text-gray-600">IP: <span className="font-mono font-semibold">{systemInfo.ipAddress}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-green-500" />
                <span className="text-sm text-gray-600">Location: {systemInfo.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone size={14} className="text-purple-500" />
                <span className="text-sm text-gray-600">Device: {systemInfo.device.os} ({systemInfo.device.type})</span>
              </div>
              <div className="flex items-center gap-1">
                <Server size={14} className="text-orange-500" />
                <span className="text-sm text-gray-600">Browser: {systemInfo.device.browser}</span>
              </div>
              {systemInfo.battery && (
                <div className="flex items-center gap-1">
                  {systemInfo.battery.charging ? (
                    <BatteryCharging size={14} className="text-green-500" />
                  ) : (
                    <Battery size={14} className="text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-600">Battery: {systemInfo.battery.level}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSystemInfo}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Refresh Info
          </button>
        </div>
      </div>
    </div>
  );

const TodayStatusCard = () => {
  if (isAdmin) return null;

  // Get user's shift timing
  const shiftTiming = getUserShiftTiming(userData);
  
  // Calculate auto clock out time
  const autoClockOutTime = getAutoClockOutTime(shiftTiming.end, shiftTiming.autoClockOutDelay);
  
  // Parse current time and shift times
  const now = new Date();
  const shiftStartTime = parseTime(shiftTiming.start);
  const shiftEndTime = parseTime(shiftTiming.end);
  
  // Calculate remaining time until shift end
  let remainingTime = null;
  let isShiftActive = false;
  
  if (shiftStartTime && shiftEndTime) {
    if (now >= shiftStartTime && now <= shiftEndTime) {
      isShiftActive = true;
      remainingTime = Math.max(0, Math.floor((shiftEndTime - now) / (1000 * 60)));
    }
  }

  // Check 5-hour rule status
  const fiveHourCheck = checkFiveHoursFromShiftStart();

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-purple-600" size={24} />
            Today's Attendance
            {shiftTiming.name && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({shiftTiming.name})
              </span>
            )}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {formatDate(new Date().toISOString())}
            <span className="ml-2 text-xs text-purple-500">
              • Shift: {shiftTiming.start} - {shiftTiming.end}
            </span>
            {autoClockOutTime && (
              <span className="ml-2 text-xs text-red-500">
                • Auto clock-out at {autoClockOutTime.getHours()}:{autoClockOutTime.getMinutes().toString().padStart(2, '0')}
              </span>
            )}
          </p>
          
          {/* Shift Info Box */}
          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Shift Details</div>
                <div className="text-xs text-gray-600">
                  {shiftTiming.name} • Late after {shiftTiming.lateThreshold} min
                  {isShiftActive && remainingTime !== null && (
                    <span className="ml-2 text-green-600">
                      • {remainingTime} min remaining
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {shiftTiming.start} - {shiftTiming.end}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleClockIn}
            disabled={todayStatus.clockedIn || todayStatus.clockedOut}
            className="group px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            {todayStatus.clockedIn ? "Clocked In" : "Clock In"}
          </button>
          
          <button
            onClick={handleClockOut}
            disabled={!todayStatus.clockedIn || todayStatus.clockedOut}
            className="group px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {todayStatus.clockedOut ? "Clocked Out" : "Clock Out"}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="group px-4 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {showDetails ? (
              <>
                <Eye size={20} className="group-hover:scale-110 transition-transform" />
                Hide Details
              </>
            ) : (
              <>
                <Eye size={20} className="group-hover:scale-110 transition-transform" />
                Show Details
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          todayStatus.clockedIn
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sun className={todayStatus.clockedIn ? "text-green-600" : "text-gray-400"} size={20} />
              <span className="font-medium text-gray-700">Clock In</span>
            </div>
            {todayStatus.clockedIn && (
              <CheckCircle className="text-green-600 animate-pulse" size={20} />
            )}
          </div>
          <div className="text-sm">
            {todayStatus.clockedIn ? (
              <div>
                <div className="font-semibold text-green-700">✓ Completed</div>
                <div className="text-green-600 mt-1 font-mono">
                  {formatTime(todayStatus.clockInTime)}
                </div>
                {shiftStartTime && (
                  <div className="text-xs mt-2">
                    <span className="text-gray-500">Expected: </span>
                    <span className="font-medium">{shiftTiming.start}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Not clocked in yet</div>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          todayStatus.clockedOut
            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Moon className={todayStatus.clockedOut ? "text-blue-600" : "text-gray-400"} size={20} />
              <span className="font-medium text-gray-700">Clock Out</span>
            </div>
            {todayStatus.clockedOut && (
              <CheckCircle className="text-blue-600" size={20} />
            )}
          </div>
          <div className="text-sm">
            {todayStatus.clockedOut ? (
              <div>
                <div className="font-semibold text-blue-700">✓ Completed</div>
                <div className="text-blue-600 mt-1 font-mono">
                  {formatTime(todayStatus.clockOutTime)}
                </div>
                {shiftEndTime && (
                  <div className="text-xs mt-2">
                    <span className="text-gray-500">Expected: </span>
                    <span className="font-medium">{shiftTiming.end}</span>
                  </div>
                )}
              </div>
            ) : todayStatus.clockedIn ? (
              <div className="text-yellow-600 flex items-center gap-1">
                <Clock size={14} />
                Waiting to clock out
                {remainingTime !== null && (
                  <span className="ml-2 text-xs">
                    ({remainingTime} min left)
                  </span>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Clock in first</div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="text-purple-600" size={20} />
              <span className="font-medium text-gray-700">Today's Status</span>
            </div>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              todayStatus.clockedOut ? 'bg-blue-500' :
              todayStatus.clockedIn ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="text-sm">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              getStatusColor(todayStatus.status).bg
            } ${
              getStatusColor(todayStatus.status).text
            }`}>
              {todayStatus.status}
            </div>
            {todayStatus.clockedIn && todayStatus.clockedOut && (
              <div className="text-xs text-gray-500 mt-2">
                ✅ Attendance completed for today
              </div>
            )}
            
            {/* Auto absent warnings - Fixed version */}
            {!todayStatus.clockedIn && (
  <div className="space-y-1 mt-2">
    {/* 5-hour rule */} 
    <div className="ml-3 text-xs text-red-500">
      • Auto absent after 5 hours from shift start
    </div>
    
    {/* Show countdown if 5-hour rule not passed yet */}
    {fiveHourCheck && !fiveHourCheck.passed && fiveHourCheck.hoursPassed > 0 && (
      <div className="ml-3 text-xs text-yellow-600">
        ⏰ {(5 - fiveHourCheck.hoursPassed).toFixed(1)} hours remaining
      </div>
    )}
    
    {/* Show warning if 5-hour rule has passed */}
    {fiveHourCheck && fiveHourCheck.passed && (
      <div className="ml-3 text-xs text-red-600 font-medium">
        ⚠️ 5-hour rule already passed!
      </div>
    )}
  </div>
)}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="font-medium text-gray-700 mb-4">Attendance Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Shift Type</div>
              <div className="text-sm font-medium capitalize">{shiftTiming.shiftType}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Late Threshold</div>
              <div className="text-sm font-medium">{shiftTiming.lateThreshold} minutes</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Auto Clock Out Delay</div>
              <div className="text-sm font-medium">{shiftTiming.autoClockOutDelay} minutes</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Shift Status</div>
              <div className="text-sm font-medium">
                {isShiftActive ? 'Active' : 'Inactive'}
                {remainingTime !== null && (
                  <span className="text-xs text-green-600 ml-2">
                    ({remainingTime} min left)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 5-hour rule details */}
          {fiveHourCheck && !todayStatus.clockedIn && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-1">
                <AlertCircle size={14} />
                5-Hour Rule Status
              </h5>
              <div className="text-xs text-yellow-700">
                <p>Shift started at: {shiftTiming.start}</p>
                <p>Time passed since shift start: {fiveHourCheck.hoursPassed.toFixed(2)} hours</p>
                {!fiveHourCheck.passed && (
                  <p className="font-medium mt-1">
                    ⚠️ Auto absent in {(5 - fiveHourCheck.hoursPassed).toFixed(2)} hours
                  </p>
                )}
                {fiveHourCheck.passed && (
                  <p className="font-medium mt-1 text-red-600">
                    ⚠️ 5-hour rule already passed!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

  const AdminDashboardCard = () => {
    if (!isAdmin) return null;

    return (
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-xl border border-purple-100 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 text-sm mt-1">
              View and manage all employee attendance records
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div className="flex items-center gap-1 text-purple-600">
                <Clock size={12} />
                <span>Auto Operations:</span>
              </div>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">1:00 AM (Non-working days)</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">12:10 PM (Absent marking)</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">6:10 PM (Auto clock out)</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-200 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <Users className="text-gray-500" size={16} />
              <div className="text-sm text-gray-500">Total Employees</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{employees.length}</div>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-200 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="text-green-500" size={16} />
              <div className="text-sm text-gray-500">Present Today</div>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">{summary?.presentToday || 0}</div>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <UserX className="text-red-500" size={16} />
              <div className="text-sm text-gray-500">Absent Today</div>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">{summary?.absentToday || 0}</div>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-yellow-200 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="text-yellow-500" size={16} />
              <div className="text-sm text-gray-500">Pending Clock Out</div>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{summary?.pendingClockOut || 0}</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Manual Attendance
          </button>
          
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FileSpreadsheet size={18} />
            Bulk Attendance
          </button>
          
          <button
            onClick={handleTriggerAutoClockOut}
            className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Clock4 size={18} />
            Trigger Auto Clock Out
          </button>
          
          <button
            onClick={handleTriggerAbsentMarking}
            className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <UserX size={18} />
            Trigger Absent Marking
          </button>
          
          <button
            onClick={handleTriggerTomorrowRecords}
            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Calendar size={18} />
            Generate Tomorrow Records
          </button>
          
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>
    );
  };

  const SummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Days Present</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.presentDays || 0}</p>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <TrendingUp size={12} className="mr-1" />
              Current period
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Days Absent</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.absentDays || 0}</p>
            <p className="text-xs text-red-500 mt-1">Auto marked at 12:10 PM</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <XCircle className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Hours</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalHours?.toFixed(2) || "0.00"}</p>
            <p className="text-xs text-blue-500 mt-1">Total for period</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Clock className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Attendance Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.attendanceRate?.toFixed(1) || "0.0"}%</p>
            <p className="text-xs text-purple-500 mt-1 flex items-center">
              <BarChart3 size={12} className="mr-1" />
              Performance
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="text-white" size={24} />
          </div>
        </div>
      </div>
    </div>
  );

  const FiltersSection = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <p className="text-gray-500 text-sm">Filter attendance records</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-40"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-40"
              />
            </div>
          </div>
          
          {isAdmin && (
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Early">Early</option>
              <option value="Leave">Leave</option>
              <option value="Govt Holiday">Govt Holiday</option>
              <option value="Weekly Off">Weekly Off</option>
              <option value="Half Day">Half Day</option>
            </select>
          )}
          
          <button
            onClick={() => {
              setPagination(prev => ({ ...prev, currentPage: 1 }));
              fetchAttendanceRecords();
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2"
          >
            <Filter size={18} />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  const AttendanceTable = () => {
    const getStatusDisplay = (record) => {
  if (record.statusType === "Early") {
    return {
      text: "Early-Present",
      color: "bg-blue-100 text-blue-800"
    };
  } else if (record.statusType === "Late") {
    return {
      text: "Late-Present", 
      color: "bg-yellow-100 text-yellow-800"
    };
  } else {
    return {
      text: "Present",
      color: "bg-green-100 text-green-800"
    };
  }
}; 

  // Function to show auto-generated info
  const getAutoGeneratedInfo = (record) => {
  if (record.autoGenerated) {
    return {
      text: "Auto-generated",
      tooltip: "Record was automatically generated by the system",
      color: "text-blue-600",
      icon: "⚡"
    };
  }
  if (record.markedAbsent) {
    if (record.absentReason?.includes('5 hours')) {
      return {
        text: "5-Hour Rule Absent",
        tooltip: "Marked absent after 5 hours from shift start (no clock in)",
        color: "text-red-700",
        icon: "⏰"
      };
    }
    return {
      text: "Auto-marked Absent",
      tooltip: "Automatically marked as Absent",
      color: "text-red-600",
      icon: "⚠️"
    };
  }
  if (record.autoClockOut) {
    return {
      text: "Auto clocked out",
      tooltip: "Automatically clocked out at shift end + delay",
      color: "text-orange-600",
      icon: "🔄"
    };
  }
  return null;
};

  // Get shift display info
  const getShiftDisplay = (record) => {
    if (record.shiftName && record.shiftStart && record.shiftEnd) {
      return {
        name: record.shiftName,
        time: `${formatTime(record.shiftStart)} - ${formatTime(record.shiftEnd)}`,
        color: record.shiftName.includes('Morning') ? 'text-blue-600' : 
               record.shiftName.includes('Evening') ? 'text-purple-600' : 
               record.shiftName.includes('Night') ? 'text-indigo-600' : 
               'text-gray-600'
      };
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Attendance Records</h3>
            <p className="text-gray-500 text-sm">
              Showing {attendanceRecords.length} of {pagination.totalItems} records
              {isAdmin && (
                <>
                  <span className="ml-2 text-purple-600">
                    • {attendanceRecords.filter(r => r.autoGenerated).length} auto-generated
                  </span>
                  <span className="ml-2 text-blue-600">
                    • {attendanceRecords.filter(r => r.autoClockOut).length} auto clock-out
                  </span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
            >
              <Printer size={18} />
              Print
            </button>
            
            <button
              onClick={() => handleExportData('csv')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-300 flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              {isAdmin && <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>}
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Clock In</th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Clock Out</th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hours</th>
              {isAdmin && <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Shift</th>}
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-500 mt-2">Loading records...</p>
                </td>
              </tr>
            ) : attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No records found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              attendanceRecords.map((record) => {
                const autoInfo = getAutoGeneratedInfo(record);
                const dayStatus = getDayStatus(record.date);
                const shiftInfo = getShiftDisplay(record);
                
                return (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {formatDateTime(record.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dayStatus.dayName}
                        {dayStatus.isWorkingDay ? (
                          <span className="ml-1 text-green-600">• Working Day</span>
                        ) : (
                          <span className="ml-1 text-purple-600">• {dayStatus.status}</span>
                        )}
                      </div>
                      {autoInfo && (
                        <div className={`text-xs ${autoInfo.color} mt-1 flex items-center gap-1`} title={autoInfo.tooltip}>
                          {autoInfo.icon} {autoInfo.text}
                        </div>
                      )}
                    </td>
                    
                    {isAdmin && (
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {record.employee?.firstName} {record.employee?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.employee?.employeeId}
                        </div>
                        {record.employee?.department && (
                          <div className="text-xs text-blue-600">
                            {record.employee.department}
                          </div>
                        )}
                      </td>
                    )}
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{formatTime(record.clockIn)}</span>
                      </div>
                      {record.shiftStart && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          Expected: {formatTime(record.shiftStart)}
                          {record.isLate && record.lateMinutes > 0 && (
                            <span className="text-red-600 ml-1">
                              ({record.lateMinutes} min late)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium">{formatTime(record.clockOut)}</span>
                        {record.autoClockOut && (
                          <span className="text-xs text-orange-600 ml-1" title="Auto clocked out">
                            (Auto)
                          </span>
                        )}
                      </div>
                      {record.shiftEnd && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          Expected: {formatTime(record.shiftEnd)}
                          {record.isEarly && record.earlyMinutes > 0 && (
                            <span className="text-green-600 ml-1">
                              ({record.earlyMinutes} min early)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">
                        {record.totalHours?.toFixed(2) || "-"}
                        <span className="text-sm font-normal text-gray-600 ml-1">hrs</span>
                      </div>
                      {record.overtimeHours > 0 && (
                        <div className="text-xs text-orange-600">
                          +{record.overtimeHours} OT hours
                        </div>
                      )}
                      {record.expectedHours && record.totalHours && (
                        <div className={`text-xs ${record.totalHours >= record.expectedHours ? 'text-green-600' : 'text-red-600'}`}>
                          {record.totalHours >= record.expectedHours ? '✓' : '✗'} {record.expectedHours} hrs expected
                        </div>
                      )}
                    </td>
                    
                    {isAdmin && (
                      <td className="py-4 px-6">
                        {shiftInfo ? (
                          <div className="flex flex-col gap-1">
                            <div className={`text-sm font-medium ${shiftInfo.color}`}>
                              {shiftInfo.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {shiftInfo.time}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            No shift info
                          </div>
                        )}
                      </td>
                    )}
                    
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                            getStatusColor(record.status, record.statusType).bg
                          } ${
                            getStatusColor(record.status, record.statusType).text
                          } ${
                            getStatusColor(record.status, record.statusType).border
                          }`}>
                            <div className="flex items-center gap-1">
                              {getStatusColor(record.status, record.statusType).displayText || record.status}
                              {record.markedAbsent && (
                                <span className="text-xs opacity-75 ml-1">(Auto)</span>
                              )}
                            </div>
                          </div> 
                        {record.ruleType === '5_hour_rule' && (
                          <div className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded mt-1" 
                              title="Marked absent after 5 hours from shift start">
                            ⏰ 5-Hour Rule
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {record.isLate && (
                            <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded" title={`${record.lateMinutes} minutes late`}>
                              ⏰ Late
                            </div>
                          )}
                          
                          {record.isEarly && (
                            <div className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded" title={`${record.earlyMinutes} minutes early`}>
                              🏃 Early
                            </div>
                          )}
                          
                          {record.autoClockOut && (
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded" title="Auto clocked out">
                              🔄 Auto
                            </div>
                          )}
                          
                          {record.markedAbsent && (
                            <div className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded" title="Auto marked absent">
                              ⚠️ Auto Absent
                            </div>
                          )}
                          
                          {record.correctedByAdmin && (
                            <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded" title="Corrected by admin">
                              ✏️ Corrected
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(record)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteAttendance(record._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      pagination.currentPage === pageNum
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              {pagination.itemsPerPage} per page
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  const ManualAttendanceModal = () => {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    if (employeeSearch) {
      const filtered = employees.filter(employee => {
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const employeeId = (employee.employeeId || '').toLowerCase();
        const searchTerm = employeeSearch.toLowerCase();
        
        return fullName.includes(searchTerm) ||
               employeeId.includes(searchTerm) ||
               employee.email.toLowerCase().includes(searchTerm);
      });
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  }, [employeeSearch, employees]);

  const dayStatus = getDayStatus(manualForm.date);

  // When employee is selected, fetch their shift timing
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    
    // Get employee's shift timing
    const shiftTiming = getUserShiftTiming(employee);
    
    if (showManualModal) {
      setManualForm(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        shiftStart: shiftTiming.start,
        shiftEnd: shiftTiming.end,
        clockIn: shiftTiming.start,
        clockOut: shiftTiming.end
      }));
    }
    if (showBulkModal) {
      setBulkForm(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        defaultShiftStart: shiftTiming.start,
        defaultShiftEnd: shiftTiming.end
      }));
    }
    setShowEmployeeSelector(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Manual Attendance</h2>
          <button
            onClick={() => {
              setShowManualModal(false);
              resetManualForm();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee *
            </label>
            {selectedEmployee ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {selectedEmployee.employeeId} • {selectedEmployee.department}
                      </div>
                      {selectedEmployee.shiftTiming && (
                        <div className="text-xs text-purple-600 mt-1">
                          Shift: {getUserShiftTiming(selectedEmployee).start} - {getUserShiftTiming(selectedEmployee).end}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEmployee(null);
                      setManualForm(prev => ({ ...prev, employeeId: "", employeeName: "" }));
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search employee by name or ID..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                
                {employeeSearch && filteredEmployees.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.map((employee) => {
                      const empShift = getUserShiftTiming(employee);
                      return (
                        <button
                          key={employee._id}
                          onClick={() => handleSelectEmployee(employee)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.employeeId} • {employee.department}
                            </div>
                            {empShift && (
                              <div className="text-xs text-purple-600 mt-1">
                                Shift: {empShift.start} - {empShift.end}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* ... Rest of the Modal remains the same ... */}
        </div>
        
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              setShowManualModal(false);
              resetManualForm();
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
          >
            Cancel
          </button>
          
          <button
            onClick={handleCreateManualAttendance}
            disabled={!selectedEmployee}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={20} />
            Create Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

  const EmployeeSelectorModal = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEmployees = employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const employeeId = (employee.employeeId || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) ||
             employeeId.includes(search) ||
             employee.email.toLowerCase().includes(search);
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Select Employee</h2>
            <button
              onClick={() => setShowEmployeeSelector(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-2">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No employees found</p>
                  {searchTerm && (
                    <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
                  )}
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <button
                    key={employee._id}
                    onClick={() => handleSelectEmployee(employee)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-purple-50 rounded-xl transition-all duration-300 text-left"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {employee.employeeId} • {employee.department || 'No Department'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.email}
                      </div>
                    </div>
                    {selectedEmployee?._id === employee._id && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecordDetailsModal = () => {
    if (!selectedRecord) return null;

    const dayStatus = getDayStatus(selectedRecord.date);
    const isAutoGenerated = selectedRecord.autoGenerated || selectedRecord.markedAbsent || selectedRecord.autoClockOut;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Attendance Details</h2>
            <button
              onClick={() => setSelectedRecord(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <div className="p-3 bg-gray-50 rounded-xl">
                  {formatDate(selectedRecord.date)}
                  <div className="text-sm text-gray-600 mt-1">
                    {dayStatus.dayName} • {dayStatus.isWorkingDay ? 'Working Day' : dayStatus.status}
                  </div>
                  {isAutoGenerated && (
                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <Zap size={12} />
                      Auto-generated by system
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clock In</label>
                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2">
                  <Sun className="text-yellow-500" size={18} />
                  {formatTime(selectedRecord.clockIn)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clock Out</label>
                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2">
                  <Moon className="text-indigo-500" size={18} />
                  {formatTime(selectedRecord.clockOut)}
                  {selectedRecord.autoClockOut && (
                    <span className="text-xs text-orange-600 ml-2">(Auto)</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Hours</label>
                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2">
                  <Clock className="text-blue-500" size={18} />
                  {selectedRecord.totalHours?.toFixed(2) || "0.00"} hours
                  {selectedRecord.overtimeHours > 0 && (
                    <span className="ml-2 text-sm text-orange-600">
                      (+{selectedRecord.overtimeHours} OT)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className={`p-3 rounded-xl ${
                  getStatusColor(selectedRecord.status).bg
                } ${
                  getStatusColor(selectedRecord.status).text
                } ${
                  getStatusColor(selectedRecord.status).border
                } border`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedRecord.status}</span>
                    {selectedRecord.markedAbsent && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Auto-marked Absent
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedRecord.isLate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Late Minutes</label>
                  <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl">
                    {selectedRecord.lateMinutes} minutes late
                  </div>
                </div>
              )}
              
              {selectedRecord.isEarly && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Early Minutes</label>
                  <div className="p-3 bg-orange-50 text-orange-700 rounded-xl">
                    {selectedRecord.earlyMinutes} minutes early
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2">
                  <MapPin className="text-green-500" size={18} />
                  {selectedRecord.location || "Office"}
                </div>
              </div>
              
              {selectedRecord.device && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device</label>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone className="text-purple-500" size={18} />
                      <span>{selectedRecord.device.type || "Desktop"}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedRecord.device.os} • {selectedRecord.device.browser}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {selectedRecord.remarks && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                {selectedRecord.remarks}
              </div>
            </div>
          )}
          
          {selectedRecord.correctedByAdmin && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Correction</label>
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <Edit className="text-yellow-600" size={18} />
                  <span className="font-medium">Corrected by Administrator</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {selectedRecord.correctionReason || "No reason provided"}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setSelectedRecord(null)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              Close
            </button>
            
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingRecord(selectedRecord);
                  setShowEditModal(true);
                  setSelectedRecord(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2"
              >
                <Edit size={18} />
                Edit Record
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EditAttendanceModal = () => {
    if (!editingRecord) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Attendance Record</h2>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingRecord(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Early">Early</option>
                  <option value="Leave">Leave</option>
                  <option value="Govt Holiday">Govt Holiday</option>
                  <option value="Weekly Off">Weekly Off</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clock In Time</label>
                <input
                  type="time"
                  value={editingRecord.clockIn || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, clockIn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clock Out Time</label>
                <input
                  type="time"
                  value={editingRecord.clockOut || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, clockOut: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <textarea
                value={editingRecord.remarks || ''} 
                onChange={(e) => setEditingRecord(prev => ({ ...prev, remarks: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows="3"
                placeholder="Enter remarks..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correction Reason</label>
              <input
                type="text"
                value={editingRecord.correctionReason || ''}
                onChange={(e) => setEditingRecord(prev => ({ ...prev, correctionReason: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Reason for correction..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingRecord(null);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              onClick={() => handleCorrectAttendance(editingRecord._id)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BulkAttendanceModal = () => {
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    useEffect(() => {
      if (employeeSearch) {
        const filtered = employees.filter(employee => {
          const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
          const employeeId = (employee.employeeId || '').toLowerCase();
          const searchTerm = employeeSearch.toLowerCase();
          
          return fullName.includes(searchTerm) ||
                 employeeId.includes(searchTerm) ||
                 employee.email.toLowerCase().includes(searchTerm);
        });
        setFilteredEmployees(filtered);
      } else {
        setFilteredEmployees([]);
      }
    }, [employeeSearch, employees]);

    const generatePreview = () => {
      const records = generateBulkAttendanceData();
      toast.success(
        <div>
          <p className="font-bold">Bulk Preview Generated</p>
          <p>Total Records: {records.length}</p>
          <p>Present: {records.filter(r => r.status === 'Present').length}</p>
          <p>Holidays: {records.filter(r => r.status === 'Govt Holiday').length}</p>
          <p>Leaves: {records.filter(r => r.status === 'Leave').length}</p>
        </div>,
        { duration: 5000 }
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Bulk Attendance</h2>
            <button
              onClick={() => {
                setShowBulkModal(false);
                resetBulkForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              {selectedEmployee ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {selectedEmployee.employeeId} • {selectedEmployee.department}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setBulkForm(prev => ({ ...prev, employeeId: "", employeeName: "" }));
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder="Search employee by name or ID..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  
                  {employeeSearch && filteredEmployees.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredEmployees.map((employee) => (
                        <button
                          key={employee._id}
                          onClick={() => handleSelectEmployee(employee)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.employeeId} • {employee.department}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Month and Year Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                <select
                  value={bulkForm.month}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  value={bulkForm.year}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="YYYY"
                  min="2000"
                  max="2100"
                />
              </div>
            </div>
            
            {/* Default Shift Timings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Shift Start *</label>
                <input
                  type="time"
                  value={bulkForm.defaultShiftStart}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, defaultShiftStart: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Shift End *</label>
                <input
                  type="time"
                  value={bulkForm.defaultShiftEnd}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, defaultShiftEnd: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            {/* Options */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="skipWeekends"
                  checked={bulkForm.skipWeekends}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, skipWeekends: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="skipWeekends" className="ml-2 text-sm text-gray-700">
                  Skip Saturdays and Sundays
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="markAllAsPresent"
                  checked={bulkForm.markAllAsPresent}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, markAllAsPresent: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="markAllAsPresent" className="ml-2 text-sm text-gray-700">
                  Mark all days as Present
                </label>
              </div>
            </div>
            
            {/* Special Dates Management */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-700 mb-3">Special Dates Management</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addHoliday}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  + Add Holiday
                </button>
                <button
                  type="button"
                  onClick={addLeaveDate}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  + Add Leave Date
                </button>
                <button
                  type="button"
                  onClick={addWorkingDay}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  + Add Working Day
                </button>
              </div>
              
              {/* Display added dates */}
              {(bulkForm.holidays.length > 0 || bulkForm.leaveDates.length > 0 || bulkForm.workingDays.length > 0) && (
                <div className="mt-4 space-y-2">
                  {bulkForm.holidays.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-purple-600">Holidays:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bulkForm.holidays.map((holiday, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {holiday.date} ({holiday.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {bulkForm.leaveDates.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-600">Leave Dates:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bulkForm.leaveDates.map((date, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {bulkForm.workingDays.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-green-600">Working Days:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bulkForm.workingDays.map((date, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Preview Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-blue-600" size={20} />
                <p className="text-sm font-medium text-blue-800">Preview Summary</p>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <span className="font-medium">Employee:</span> {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Not selected'}
                </p>
                <p>
                  <span className="font-medium">Period:</span> {new Date(bulkForm.year, bulkForm.month - 1, 1).toLocaleString('default', { month: 'long' })} {bulkForm.year}
                </p>
                <p>
                  <span className="font-medium">Shift:</span> {bulkForm.defaultShiftStart} - {bulkForm.defaultShiftEnd}
                </p>
                <p>
                  <span className="font-medium">Total Days:</span> {new Date(bulkForm.year, bulkForm.month, 0).getDate()}
                </p>
                <button
                  onClick={generatePreview}
                  className="mt-3 w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Generate Preview
                </button>
              </div>
            </div>
            
            {/* Warning Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-yellow-600" size={20} />
                <p className="text-sm font-medium text-yellow-800">Important Note</p>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                <li>This will create or update attendance records for all days in the selected month</li>
                <li>Existing records will be updated with new data</li>
                <li>New records will be created for missing dates</li>
                <li>Weekends and holidays will be automatically marked</li>
                <li>This action cannot be undone easily</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowBulkModal(false);
                resetBulkForm();
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreateBulkAttendance}
              disabled={!selectedEmployee}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet size={20} />
              Create Bulk Attendance
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===================== MAIN RENDER =====================
  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading attendance system...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Attendance Management
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">
                  {isAdmin ? "Manage all employee attendance" : "Track your daily attendance"}
                </p>
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isAdmin
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                  }`}>
                    {isAdmin ? <Shield size={12} /> : <UserIcon size={12} />}
                    {userRole.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Time</div>
                <div className="text-xl font-bold text-purple-700">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(new Date().toISOString())}
                </div>
              </div>
              
              <button
                onClick={() => {
                  fetchAttendanceRecords();
                  fetchSummary();
                  fetchTodayStatus();
                }}
                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <RefreshCw size={20} />
              </button>
              
              <button
                onClick={() => window.print()}
                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* System Info */}
        <SystemInfoBar />
        
        {/* Today Status */}
        <TodayStatusCard />
        
        {/* Admin Dashboard */}
        <AdminDashboardCard />
        
        {/* Summary Cards */}
        <SummaryCards />
        
        {/* Filters */}
        <FiltersSection />
        
        {/* Main Table */}
        <div className="mb-8">
          <AttendanceTable />
        </div>
        
        {/* Summary Sidebar */}
        {summary && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Working Days</div>
                <div className="text-2xl font-bold text-gray-900">{summary.workingDays || 0}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Late Days</div>
                <div className="text-2xl font-bold text-yellow-600">{summary.lateDays || 0}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Early Days</div>
                <div className="text-2xl font-bold text-orange-600">{summary.earlyDays || 0}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Avg Hours/Day</div>
                <div className="text-2xl font-bold text-blue-600">{summary.averageHours?.toFixed(2) || "0.00"}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Attendance Rate</span>
                <span className="font-bold text-lg text-purple-700">{summary.attendanceRate?.toFixed(1) || "0.0"}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(summary.attendanceRate || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showManualModal && <ManualAttendanceModal />}
      {showBulkModal && <BulkAttendanceModal />}
      {showEmployeeSelector && <EmployeeSelectorModal />}
      {selectedRecord && <RecordDetailsModal />}
      {showEditModal && <EditAttendanceModal />}
    </>
  );
};

export default AttendanceManagement;

// Export different views
export function AdminAttendancePage() {
  return <AttendanceManagement isAdminView={true} />;
}

export function EmployeeAttendancePage({ userId }) {
  return <AttendanceManagement userId={userId} isAdminView={false} />;
}