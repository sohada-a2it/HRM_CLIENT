"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  Filter,
    Wifi,
  Server,
  Network,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  BarChart3,
  TrendingUp,
  Moon,
  Sun,
  Zap,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Printer,
  Share2,
  User,
  Shield,
  Loader2,
  LogIn,
  LogOut,
  Users,
  Home,
  Briefcase,
  Coffee,
  Activity,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Plus,
  Upload,
  Play,
  Settings,
  FileSpreadsheet,
  CalendarDays,
  Clock4,
  AlertTriangle,
  MoreVertical,
  Search,
  UserCircle,
  ChevronDown,
  X,
  FileEdit,
  CalendarRange,
  Layers,
  Database,
  Save,
  MapPin,
  Smartphone,
  Globe,
  HardDrive
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function Page({ userId }) {
  // Holiday and weekend detection functions
const isWeekend = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 5 || day === 6; // 5 = Friday, 6 = Saturday
};

// আরও স্পষ্টভাবে দিনের নামসহ ফাংশন
const getDayStatus = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDay();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  if (isHolidayDate(dateString)) {
    return {
      status: 'Govt Holiday',
      dayName: dayName,
      isWeekend: true,
      description: 'Government Holiday'
    };
  }
  
  if (day === 5) { // Friday
    return {
      status: 'Weekly Off',
      dayName: 'Friday',
      isWeekend: true,
      description: 'Friday - Weekly Off'
    };
  }
  
  if (day === 6) { // Saturday
    return {
      status: 'Weekly Off',
      dayName: 'Saturday',
      isWeekend: true,
      description: 'Saturday - Weekly Off'
    };
  }
  
  if (day === 0) { // Sunday
    return {
      status: 'Working Day',
      dayName: 'Sunday',
      isWeekend: false,
      description: 'Sunday - Working Day'
    };
  }
  
  // Monday-Thursday (1-4)
  return {
    status: 'Working Day',
    dayName: dayName,
    isWeekend: false,
    description: `${dayName} - Working Day`
  };
};

// getAutoStatus ফাংশন আপডেট করুন
const getAutoStatus = (dateString) => {
  const dayStatus = getDayStatus(dateString);
  return dayStatus.status;
};

// UI-তে সঠিক বার্তা দেখানোর জন্য
const formatDayMessage = (dateString) => {
  const dayStatus = getDayStatus(dateString);
  
  if (dayStatus.status === 'Govt Holiday') {
    return `🎉 ${dayStatus.dayName} - Government Holiday`;
  }
  
  if (dayStatus.status === 'Weekly Off') {
    return `🏖️ ${dayStatus.dayName} - Weekly Off`;
  }
  
  return `🏢 ${dayStatus.dayName} - Working Day`;
};

  const isHolidayDate = (dateString) => {
    // This function should check if a date is a holiday
    // You can expand this with actual holiday data from your backend
    const holidays = [
      '2024-01-26', // Republic Day
      '2024-08-15', // Independence Day
      '2024-10-02', // Gandhi Jayanti
      // Add more holidays as needed
    ];
    return holidays.includes(dateString);
  };

  const checkIfWorkingDay = async (dateString = null) => {
    try {
      const dateToCheck = dateString || new Date().toISOString().split('T')[0];
      const token = getToken();
      
      if (!token) return true; // Default to allowing if no token
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-working-day?date=${dateToCheck}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.isWorkingDay !== false; // Return true if it's a working day
      }
      
      return !isWeekend(dateToCheck) && !isHolidayDate(dateToCheck);
    } catch (error) {
      console.error("Error checking working day:", error);
      return !isWeekend(dateString || new Date().toISOString().split('T')[0]);
    }
  };
  // Get arrival status text and color
const getArrivalStatus = (clockInTime, shiftStartTime = "09:00") => {
  if (!clockInTime) {
    return { text: "No Clock In", color: "text-gray-500", bgColor: "bg-gray-100", borderColor: "border-gray-200" };
  }
  
  const isLate = isLateArrival(clockInTime, shiftStartTime);
  const isEarly = isEarlyArrival(clockInTime, shiftStartTime);
  
  if (isLate) {
    // Calculate how many minutes late
    const clockIn = new Date(`2000-01-01T${clockInTime}:00`);
    const shiftStart = new Date(`2000-01-01T${shiftStartTime}:00`);
    const minutesLate = Math.round((clockIn - shiftStart) / (1000 * 60));
    
    return { 
      text: `Late (${minutesLate}m)`, 
      color: "text-red-600", 
      bgColor: "bg-red-50", 
      borderColor: "border-red-200",
      minutesLate: minutesLate
    };
  } else if (isEarly) {
    // Calculate how many minutes early
    const clockIn = new Date(`2000-01-01T${clockInTime}:00`);
    const shiftStart = new Date(`2000-01-01T${shiftStartTime}:00`);
    const minutesEarly = Math.round((shiftStart - clockIn) / (1000 * 60));
    
    return { 
      text: `Early (${minutesEarly}m)`, 
      color: "text-green-600", 
      bgColor: "bg-green-50", 
      borderColor: "border-green-200",
      minutesEarly: minutesEarly
    };
  } else {
    return { 
      text: "On Time", 
      color: "text-green-600", 
      bgColor: "bg-green-50", 
      borderColor: "border-green-200"
    };
  }
}; 
// Late arrival detection function
const isLateArrival = (clockInTime, shiftStartTime = "09:00") => {
  if (!clockInTime || !shiftStartTime) return false;
  
  try {
    const clockIn = new Date(`2000-01-01T${clockInTime}:00`);
    const shiftStart = new Date(`2000-01-01T${shiftStartTime}:00`);
    
    // If clock in is after shift start (with 5 minutes grace period)
    const gracePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
    return (clockIn - shiftStart) > gracePeriod;
  } catch (error) {
    console.error("Error checking late arrival:", error);
    return false;
  }
};
// Early arrival detection function
const isEarlyArrival = (clockInTime, shiftStartTime = "09:00") => {
  if (!clockInTime || !shiftStartTime) return false;
  
  try {
    const clockIn = new Date(`2000-01-01T${clockInTime}:00`);
    const shiftStart = new Date(`2000-01-01T${shiftStartTime}:00`);
    
    // If clock in is before shift start
    return clockIn < shiftStart;
  } catch (error) {
    console.error("Error checking early arrival:", error);
    return false;
  }
};
  const validateTimeOrder = (startTime, endTime) => {
    if (!startTime || !endTime) return true;
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    return end > start;
  };
    const generateBulkAttendanceData = () => {
    const month = parseInt(bulkAttendanceData.month);
    const year = parseInt(bulkAttendanceData.year);
    
    if (isNaN(month) || isNaN(year)) return [];
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceRecords = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Skip weekends if option is enabled
      if (bulkAttendanceData.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }
      
      // Check if it's a holiday
      const isHoliday = bulkAttendanceData.holidays.some(h => h.date === dateString);
      const isLeave = bulkAttendanceData.leaveDates.includes(dateString);
      const isWorkingDay = bulkAttendanceData.workingDays.includes(dateString);
      
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
      } else if (bulkAttendanceData.markAllAsPresent) {
        status = 'Present';
        remarks = 'Marked present - Bulk created';
      }
      
      // Auto-clear clock in/out for non-working days
      const clockIn = (status === 'Present') ? bulkAttendanceData.defaultShiftStart : null;
      const clockOut = (status === 'Present') ? bulkAttendanceData.defaultShiftEnd : null;
      
      attendanceRecords.push({
        date: dateString,
        clockIn,
        clockOut,
        status,
        shiftStart: bulkAttendanceData.defaultShiftStart,
        shiftEnd: bulkAttendanceData.defaultShiftEnd,
        remarks,
        isHoliday: status === 'Govt Holiday',
        holidayType: status === 'Govt Holiday' ? 'Bulk Holiday' : null,
        autoGenerated: status !== 'Present'
      });
    }
    
    return attendanceRecords;
  };
  const router = useRouter();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [clockDetails, setClockDetails] = useState(() => {
    if (typeof window !== "undefined") {
      const storedDetails = localStorage.getItem("attendanceClockDetails");
      if (storedDetails) {
        try {
          return JSON.parse(storedDetails);
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  });
  const [realIpAddress, setRealIpAddress] = useState("Fetching...");
  const getRealIPAddress = async () => {
  try {
    // Method 1: Try ipify.org (most reliable)
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        setRealIpAddress(data.ip);
        return data.ip;
      }
    } catch (error) {
      console.log("ipify failed, trying alternative...");
    }

    // Method 2: Try icanhazip.com
    try {
      const response = await fetch('https://icanhazip.com');
      if (response.ok) {
        const ip = await response.text();
        setRealIpAddress(ip.trim());
        return ip.trim();
      }
    } catch (error) {
      console.log("icanhazip failed, trying alternative...");
    }

    // Method 3: Try api64.ipify.org
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        setRealIpAddress(data.ip);
        return data.ip;
      }
    } catch (error) {
      console.log("api64 failed...");
    }

    // Method 4: Try ipinfo.io (with token if available)
    try {
      const response = await fetch('https://ipinfo.io/json');
      if (response.ok) {
        const data = await response.json();
        setRealIpAddress(data.ip);
        return data.ip;
      }
    } catch (error) {
      console.log("ipinfo failed...");
    }

    // If all methods fail, get local IP
    try {
      // This works for local network IP
      const rtcPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
     
      if (rtcPeerConnection) {
        const pc = new rtcPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
       
        pc.onicecandidate = (ice) => {
          if (ice && ice.candidate && ice.candidate.candidate) {
            const candidate = ice.candidate.candidate;
            const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
            const match = candidate.match(regex);
           
            if (match) {
              setRealIpAddress(match[1]);
              pc.onicecandidate = () => {};
              pc.close();
            }
          }
        };
      }
    } catch (error) {
      console.log("WebRTC method failed...");
    }

    // Last resort: Check network info
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.type === 'wifi' || connection.type === 'cellular') {
        setRealIpAddress("Network Detected (No Public IP)");
      } else {
        setRealIpAddress("Localhost (127.0.0.1)");
      }
    } else {
      setRealIpAddress("127.0.0.1 (Local)");
    }

    return "127.0.0.1";
  } catch (error) {
    console.error("Error getting IP:", error);
    setRealIpAddress("Error Fetching IP");
    return "Unknown";
  }
};
  const [showRecentDetails, setShowRecentDetails] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("attendanceShowDetails") === "true";
    }
    return false;
  });
 
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
 
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
 
  // New states for admin features
  const [showManualAttendanceModal, setShowManualAttendanceModal] = useState(false);
  const [showBulkAttendanceModal, setShowBulkAttendanceModal] = useState(false);
  const [showAdminActionsMenu, setShowAdminActionsMenu] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
 
  // User location state
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    address: "Office",
    accuracy: null
  });
 
  // Device info state
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    os: 'Unknown',
    browser: 'Unknown',
    userAgent: ''
  });

  const [manualAttendanceData, setManualAttendanceData] = useState({
    employeeId: "",
    employeeName: "",
    date: new Date().toISOString().split('T')[0],
    clockIn: "09:00",
    clockOut: "18:00",
    status: "Present",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    remarks: "Created by admin",
    isHoliday: false,
    holidayType: null,
    ipAddress: "",
    location: "Office",
    deviceType: "desktop"
  });
 
  const [bulkAttendanceData, setBulkAttendanceData] = useState({
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
 
  const [todayStatus, setTodayStatus] = useState(() => {
    if (typeof window !== "undefined") {
      const storedToday = localStorage.getItem("attendanceTodayStatus");
      const todayDate = new Date().toDateString();
      const storedDate = localStorage.getItem("attendanceDate");
     
      if (storedDate !== todayDate) {
        localStorage.setItem("attendanceDate", todayDate);
        localStorage.removeItem("attendanceTodayStatus");
        localStorage.removeItem("attendanceClockDetails");
        localStorage.removeItem("attendanceShowDetails");
        return {
          clockedIn: false,
          clockedOut: false,
          clockInTime: null,
          clockOutTime: null,
          status: "Not Clocked",
          date: todayDate
        };
      }
     
      if (storedToday) {
        try {
          return JSON.parse(storedToday);
        } catch (error) {
          return {
            clockedIn: false,
            clockedOut: false,
            clockInTime: null,
            clockOutTime: null,
            status: "Not Clocked",
            date: todayDate
          };
        }
      }
    }
   
    return {
      clockedIn: false,
      clockedOut: false,
      clockInTime: null,
      clockOutTime: null,
      status: "Not Clocked",
      date: new Date().toDateString()
    };
  });

  // Employee Filter State
  const [employeeFilter, setEmployeeFilter] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "all"
  });

  // ===================== INITIALIZATION FUNCTIONS =====================

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
            accuracy
          });
         
          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data.display_name) {
                setUserLocation(prev => ({
                  ...prev,
                  address: data.display_name.split(',').slice(0, 3).join(',')
                }));
              }
            })
            .catch(() => {
              // If reverse geocoding fails, keep coordinates
            });
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation(prev => ({
            ...prev,
            address: "Location permission denied"
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  // Get device information
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let type = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';

    // Detect device type
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      type = 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      type = 'tablet';
    }

    // Detect OS
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

    // Detect browser
    if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/Firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/Edg/i.test(userAgent)) {
      browser = 'Edge';
    } else if (/Opera|OPR/i.test(userAgent)) {
      browser = 'Opera';
    }

    setDeviceInfo({
      type,
      os,
      browser,
      userAgent: userAgent.substring(0, 100) // Limit length
    });
  };

  // Get IP Address
  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error getting IP:", error);
      return "Unknown";
    }
  };

  // Initialize device and location info
useEffect(() => {
  if (typeof window !== 'undefined') {
    getDeviceInfo();
    getUserLocation();
    getRealIPAddress(); // Get real IP address
  }
}, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("attendanceTodayStatus", JSON.stringify(todayStatus));
      localStorage.setItem("attendanceDate", todayStatus.date);
    }
  }, [todayStatus]);

  useEffect(() => {
    if (typeof window !== "undefined" && clockDetails) {
      localStorage.setItem("attendanceClockDetails", JSON.stringify(clockDetails));
    }
  }, [clockDetails]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("attendanceShowDetails", showRecentDetails.toString());
    }
  }, [showRecentDetails]);

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdminActionsMenu && !event.target.closest('.admin-actions-menu')) {
        setShowAdminActionsMenu(false);
      }
      if (showEmployeeSelector && !event.target.closest('.employee-selector')) {
        setShowEmployeeSelector(false);
      }
    };
   
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdminActionsMenu, showEmployeeSelector]);

  // Auto Clock-Out at 6:10 PM
  useEffect(() => {
    const checkAutoClockOut = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
     
      // Check if it's 6:10 PM (18:10)
      if (currentHours === 18 && currentMinutes === 10) {
        if (todayStatus.clockedIn && !todayStatus.clockedOut && userRole === "employee") {
          handleAutoClockOut();
        }
      }
    };
   
    const interval = setInterval(checkAutoClockOut, 60000);
   
    return () => clearInterval(interval);
  }, [todayStatus, userRole]);

  // Auto mark absent at 12:10 PM
  useEffect(() => {
    const checkAutoMarkAbsent = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
     
      // Check if it's 12:10 PM
      if (currentHours === 12 && currentMinutes === 10) {
        if (!todayStatus.clockedIn && userRole === "employee") {
          toast.info("Auto absent marking in progress...");
        }
      }
    };
   
    const interval = setInterval(checkAutoMarkAbsent, 60000);
   
    return () => clearInterval(interval);
  }, [todayStatus, userRole]);

  // ===================== CORE FUNCTIONS =====================

  const getUserType = () => {
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("adminToken");
      const employeeToken = localStorage.getItem("employeeToken");
     
      if (adminToken) {
        return "admin";
      } else if (employeeToken) {
        return "employee";
      }
    }
    return null;
  };

  const getToken = () => {
    const userType = getUserType();
    if (userType === "admin") {
      return localStorage.getItem("adminToken");
    } else if (userType === "employee") {
      return localStorage.getItem("employeeToken");
    }
    return null;
  };

  const fetchUserProfile = async () => {
    try {
      const userType = getUserType();
      const token = getToken();
     
      if (!token) {
        router.push("/");
        return { role: "employee", isAdmin: false, userData: null };
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
        localStorage.clear();
        router.push("/");
        return { role: "employee", isAdmin: false, userData: null };
      }

      const data = await response.json();
     
      if (data.user || (data && typeof data === 'object' && (data.email || data._id))) {
        const userData = data.user || data;
        return {
          role: userType,
          isAdmin: userType === "admin",
          userData
        };
      } else {
        return { role: "employee", isAdmin: false, userData: null };
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { role: "employee", isAdmin: false, userData: null };
    }
  };

  const fetchTodayStatus = useCallback(async () => {
    try {
      const userType = getUserType();
      const token = getToken();
     
      if (!token || userType !== "employee") {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/today-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
       
        const newStatus = {
          clockedIn: data.clockedIn || false,
          clockedOut: data.clockedOut || false,
          clockInTime: data.attendance?.clockIn || null,
          clockOutTime: data.attendance?.clockOut || null,
          status: data.attendance?.status || "Not Clocked",
          date: new Date().toDateString()
        };
       
        setTodayStatus(newStatus);
       
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
      } else if (response.status === 401) {
        localStorage.clear();
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch today's status:", error);
    }
  }, []);

  const fetchSummary = useCallback(async (roleInfo) => {
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        router.push("/");
        return;
      }

      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(roleInfo.isAdmin && userId && { employeeId: userId })
      }).toString();

      let endpoint;
      let headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      if (roleInfo.isAdmin) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/summary?${query}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/attendance/summary?${query}`;
      }

      const response = await fetch(endpoint, { headers });

      if (response.ok) {
        const data = await response.json();
        if (roleInfo.isAdmin) {
          setSummary(data.summary || data);
        } else {
          setSummary(data.summary || data);
        }
      } else if (response.status === 401) {
        localStorage.clear();
        router.push("/");
      } else {
        setSummary(null);
      }
     
      await fetchAttendanceRecords(roleInfo);
    } catch (err) {
      console.error("Fetch summary error:", err);
      setSummary(null);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, userId]);

  const fetchAttendanceRecords = useCallback(async (roleInfo) => {
    try {
      const token = getToken();
     
      if (!token) {
        return;
      }

      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: currentPage,
        limit: itemsPerPage,
        ...(roleInfo.isAdmin && userId && { employeeId: userId })
      }).toString();

      let endpoint;
      if (roleInfo.isAdmin) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/all-records?${query}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/attendance/records?${query}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.records || data || []);
      } else if (response.status === 401) {
        localStorage.clear();
        router.push("/");
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error("Fetch records error:", error);
      setAttendance([]);
    }
  }, [dateRange, userId, currentPage, itemsPerPage]);

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      const roleInfo = await fetchUserProfile();
     
      if (roleInfo) {
        setUserRole(roleInfo.role);
        setIsAdmin(roleInfo.isAdmin);
        setUserData(roleInfo.userData);
       
        if (roleInfo.role === "employee") {
          await fetchTodayStatus();
        }
       
        await fetchSummary(roleInfo);
      }
    } catch (error) {
      console.error("Initialize data error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetchTodayStatus, fetchSummary]);

  // ===================== ATTENDANCE FUNCTIONS =====================

  const handleClockIn = async () => {
    if (userRole !== "employee") {
      toast.error("Only employees can clock in/out");
      return;
    }
   
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

  // Use real IP address
  const ipAddress = realIpAddress;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      location: userLocation.address,
      ipAddress: ipAddress,  // Using real IP
      device: deviceInfo
    })
  });
      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedIn: true,
          clockInTime: data.attendance?.clockIn || new Date().toISOString(),
          status: data.attendance?.status || "Clocked In"
        };
        setTodayStatus(newStatus);
       
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
        setShowRecentDetails(true);
       
        toast.success(`✓ ${data.message || "Clock In successful"}`);
       
        await fetchTodayStatus();
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to clock in");
      }
    } catch (err) {
      console.error("Clock in error:", err);
      toast.error("Clock In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (userRole !== "employee") {
      toast.error("Only employees can clock in/out");
      return;
    }
   
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Get IP address
      const ipAddress = await getIPAddress();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: userLocation.address,
          ipAddress: ipAddress,
          device: deviceInfo
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedOut: true,
          clockOutTime: data.attendance?.clockOut || new Date().toISOString(),
          status: data.attendance?.status || "Present"
        };
        setTodayStatus(newStatus);
       
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
        setShowRecentDetails(true);
       
        toast.success(`✓ ${data.message || "Clock Out successful"}`);
       
        await fetchTodayStatus();
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to clock out");
      }
    } catch (err) {
      console.error("Clock out error:", err);
      toast.error("Clock Out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoClockOut = async () => {
    if (userRole !== "employee") return;
   
    try {
      const token = getToken();
     
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: "Office - Auto Clock Out",
          device: deviceInfo,
          autoClockOut: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedOut: true,
          clockOutTime: data.attendance?.clockOut || new Date().toISOString(),
          status: "Present (Auto)"
        };
        setTodayStatus(newStatus);
       
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
       
        toast.success(`✓ Auto Clock Out at 6:10 PM successful`);
       
        await fetchTodayStatus();
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      }
    } catch (err) {
      console.error("Auto clock out error:", err);
    }
  };

  // ===================== ADMIN FUNCTIONS =====================

  // Fetch all employees (for admin)
  const fetchEmployees = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
   
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getAll-user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
     
      let employeesArray = [];
     
      if (Array.isArray(data)) {
        employeesArray = data;
      } else if (data.users && Array.isArray(data.users)) {
        employeesArray = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        employeesArray = data.data;
      } else if (data.employees && Array.isArray(data.employees)) {
        employeesArray = data.employees;
      } else if (typeof data === 'object') {
        const values = Object.values(data);
        for (const value of values) {
          if (Array.isArray(value)) {
            employeesArray = value;
            break;
          }
        }
      }
     
      const validEmployees = employeesArray
        .filter(emp => emp && typeof emp === 'object')
        .map(emp => {
          let firstName = '';
          let lastName = '';
         
          if (emp.firstName && emp.lastName) {
            firstName = emp.firstName;
            lastName = emp.lastName;
          } else if (emp.name) {
            const nameParts = emp.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          } else if (emp.first_name && emp.last_name) {
            firstName = emp.first_name;
            lastName = emp.last_name;
          }
         
          return {
            _id: emp._id || emp.id || emp.userId || '',
            firstName: firstName,
            lastName: lastName,
            email: emp.email || '',
            employeeId: emp.employeeId || emp.employee_id || emp.userId || emp._id?.slice(-6) || '',
            department: emp.department || emp.department_name || 'No Department',
            position: emp.position || emp.job_title || '',
            phone: emp.phone || emp.phone_number || '',
            status: emp.status || 'active'
          };
        })
        .filter(emp => emp._id && (emp.firstName || emp.lastName));

      setEmployees(validEmployees);
     
    } catch (error) {
      console.error("Fetch employees error:", error);
      setEmployees([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      setEmployees([]);
    }
  }, [isAdmin, fetchEmployees]);

  // Manual Trigger Auto Clock Out (Admin Only)
  const handleTriggerAutoClockOut = async () => {
    if (!isAdmin) return;
   
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/trigger-auto-clockout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✓ Auto clock out triggered: ${data.results?.autoClockOuts || 0} successful`);
       
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to trigger auto clock out");
      }
    } catch (err) {
      console.error("Trigger auto clock out error:", err);
      toast.error("Failed to trigger auto clock out");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Absent Marking (Admin Only)
  const handleTriggerAbsentMarking = async () => {
    if (!isAdmin) return;
   
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/trigger-absent-marking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✓ Absent marking triggered: ${data.results?.markedAbsent || 0} marked`);
       
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to trigger absent marking");
      }
    } catch (err) {
      console.error("Trigger absent marking error:", err);
      toast.error("Failed to trigger absent marking");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Tomorrow Records (Admin Only)
  const handleTriggerTomorrowRecords = async () => {
    if (!isAdmin) return;
   
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/trigger-tomorrow-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✓ Tomorrow records generated: ${data.results?.recordsCreated || 0} created`);
       
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to generate tomorrow records");
      }
    } catch (err) {
      console.error("Trigger tomorrow records error:", err);
      toast.error("Failed to generate tomorrow records");
    } finally {
      setLoading(false);
    }
  };

  // Create Manual Attendance (Admin Only)
  const handleCreateManualAttendance = async () => {
    if (!isAdmin) return;
   
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Validate required fields
      if (!manualAttendanceData.employeeId && !selectedEmployee?._id) {
        toast.error("Please select an employee");
        setLoading(false);
        return;
      }

      if (!manualAttendanceData.date) {
        toast.error("Date is required");
        setLoading(false);
        return;
      }

      const employeeId = selectedEmployee?._id || manualAttendanceData.employeeId;
     
      if (!employeeId) {
        toast.error("Employee ID is missing");
        setLoading(false);
        return;
      }

      const attendanceData = {
        employeeId: employeeId,
        date: manualAttendanceData.date,
        clockIn: manualAttendanceData.clockIn ? `${manualAttendanceData.date}T${manualAttendanceData.clockIn}:00` : null,
        clockOut: manualAttendanceData.clockOut ? `${manualAttendanceData.date}T${manualAttendanceData.clockOut}:00` : null,
        status: manualAttendanceData.status,
        shiftStart: manualAttendanceData.shiftStart || "09:00",
        shiftEnd: manualAttendanceData.shiftEnd || "18:00",
        remarks: manualAttendanceData.remarks || "Created by admin",
        ipAddress: manualAttendanceData.ipAddress || "Manual Entry",
        location: manualAttendanceData.location,
        device: {
          type: manualAttendanceData.deviceType || "desktop",
          os: "Manual Entry",
          browser: "System"
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/attendance/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(attendanceData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✓ Manual attendance created successfully!");
        setShowManualAttendanceModal(false);
       
        // Reset form
        setManualAttendanceData({
          employeeId: "",
          employeeName: "",
          date: new Date().toISOString().split('T')[0],
          clockIn: "09:00",
          clockOut: "18:00",
          status: "Present",
          shiftStart: "09:00",
          shiftEnd: "18:00",
          remarks: "Created by admin",
          isHoliday: false,
          holidayType: null,
          ipAddress: "",
          location: "Office",
          deviceType: "desktop"
        });
       
        setSelectedEmployee(null);
       
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
        await fetchAttendanceRecords(roleInfo);
      } else {
        toast.error(data.message || data.error || "Failed to create manual attendance");
      }
    } catch (err) {
      console.error("Create manual attendance error:", err);
      toast.error("Failed to create manual attendance");
    } finally {
      setLoading(false);
    }
  };

  // Create Bulk Attendance (Admin Only)
  const handleCreateBulkAttendance = async () => {
    if (!isAdmin) return;
   
    setLoading(true);
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Validate required fields
      if (!bulkAttendanceData.employeeId) {
        toast.error("Employee is required");
        setLoading(false);
        return;
      }

      if (!bulkAttendanceData.month || !bulkAttendanceData.year) {
        toast.error("Month and Year are required");
        setLoading(false);
        return;
      }

      // Prepare bulk data
      const bulkData = {
        employeeId: selectedEmployee?._id || bulkAttendanceData.employeeId,
        month: bulkAttendanceData.month,
        year: bulkAttendanceData.year,
        defaultShiftStart: bulkAttendanceData.defaultShiftStart,
        defaultShiftEnd: bulkAttendanceData.defaultShiftEnd,
        holidays: bulkAttendanceData.holidays || [],
        leaveDates: bulkAttendanceData.leaveDates || [],
        workingDays: bulkAttendanceData.workingDays || [],
        markAllAsPresent: bulkAttendanceData.markAllAsPresent,
        skipWeekends: bulkAttendanceData.skipWeekends
      };

      const confirmCreate = window.confirm(
        `This will create/update attendance for ${new Date(bulkData.year, bulkData.month - 1, 1).toLocaleString('default', { month: 'long' })} ${bulkData.year}.\nEmployee: ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}\n\nAre you sure?`
      );

      if (!confirmCreate) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/attendance/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bulkData)
      });

      const data = await response.json();

      if (response.ok) {
        const results = data.results || data;
        let message = `✓ Bulk attendance created:\n`;
       
        if (results.created) message += `Created: ${results.created}\n`;
        if (results.updated) message += `Updated: ${results.updated}\n`;
        if (results.skipped) message += `Skipped: ${results.skipped}\n`;
        if (results.failed) message += `Failed: ${results.failed}`;
       
        toast.success(
          <div className="whitespace-pre-line">
            {message}
          </div>,
          { duration: 6000 }
        );
       
        setShowBulkAttendanceModal(false);
        setSelectedEmployee(null);
       
        // Reset bulk form
        setBulkAttendanceData({
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
       
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
        await fetchAttendanceRecords(roleInfo);
      } else {
        toast.error(data.message || "Failed to create bulk attendance");
      }
    } catch (err) {
      console.error("Create bulk attendance error:", err);
      toast.error("Failed to create bulk attendance");
    } finally {
      setLoading(false);
    }
  };

  // Handle employee selection
  const handleSelectEmployee = (employee) => {
    if (!employee || !employee._id) {
      toast.error("Invalid employee selected");
      return;
    }
   
    setSelectedEmployee(employee);
    setShowEmployeeSelector(false);
   
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
   
    if (showManualAttendanceModal) {
      setManualAttendanceData(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: fullName
      }));
    }
   
    if (showBulkAttendanceModal) {
      setBulkAttendanceData(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: fullName
      }));
    }
   
    toast.success(`Selected: ${fullName}`);
  };

  // Filter employees based on search
  const filteredEmployees = Array.isArray(employees) ? employees.filter(employee => {
    if (!employee || typeof employee !== 'object') return false;
   
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const employeeId = (employee.employeeId || '').toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const searchTerm = employeeSearch.toLowerCase();
   
    return fullName.includes(searchTerm) ||
           employeeId.includes(searchTerm) ||
           email.includes(searchTerm);
  }) : [];

  // Get Late Statistics
  const handleViewLateStatistics = async () => {
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isAdmin
        ? `${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/late-statistics`
        : `${process.env.NEXT_PUBLIC_API_URL}/attendance/late-statistics`;

      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(isAdmin && userId && { employeeId: userId })
      }).toString();

      const response = await fetch(`${endpoint}?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
       
        const stats = data.statistics;
       
        toast.success(
          <div>
            <p className="font-bold">Late Statistics</p>
            <p>Total Late: {stats.totalLate}</p>
            <p>Average: {stats.averageLateMinutes} minutes</p>
            <p>Total Late Minutes: {stats.totalLateMinutes}</p>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error("Get late statistics error:", err);
    }
  };

  // Get Late & Early Statistics
  const handleViewLateEarlyStatistics = async () => {
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isAdmin
        ? `${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/late-early-statistics`
        : `${process.env.NEXT_PUBLIC_API_URL}/attendance/late-early-statistics`;

      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(isAdmin && userId && { employeeId: userId })
      }).toString();

      const response = await fetch(`${endpoint}?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
       
        const stats = data.statistics;
       
        toast.success(
          <div>
            <p className="font-bold">Late & Early Statistics</p>
            <p>Total Late: {stats.totalLate}</p>
            <p>Total Early: {stats.totalEarly}</p>
            <p>Total Late Minutes: {stats.totalLateMinutes}</p>
            <p>Total Early Minutes: {stats.totalEarlyMinutes}</p>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error("Get late/early statistics error:", err);
    }
  };

  // Get Shift Timing
  const handleViewShiftTiming = async () => {
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isAdmin
        ? `${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/employee-shift-timing`
        : `${process.env.NEXT_PUBLIC_API_URL}/attendance/shift-timing`;

      const query = new URLSearchParams({
        employeeId: userId || userData?._id,
        date: new Date().toISOString().split('T')[0]
      }).toString();

      const response = await fetch(`${endpoint}?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
       
        toast.success(
          <div>
            <p className="font-bold">Shift Timing</p>
            <p>Start: {data.data.shiftTiming.start}</p>
            <p>End: {data.data.shiftTiming.end}</p>
            <p>Auto Clock Out: {data.data.shiftTiming.autoClockOutTime}</p>
            {data.data.shiftTiming.isAdminAdjusted && <p className="text-yellow-600">✓ Admin Adjusted</p>}
          </div>,
          { duration: 4000 }
        );
      }
    } catch (err) {
      console.error("Get shift timing error:", err);
    }
  };

  // Get Auto Clock Out Schedule
  const handleViewAutoClockOutSchedule = async () => {
    if (!isAdmin) return;
   
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/auto-clock-out-schedule`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
       
        toast.success(
          <div>
            <p className="font-bold">Auto Clock Out Schedule</p>
            <p>Total Employees: {data.totalEmployees}</p>
            <p>Date: {data.date}</p>
          </div>,
          { duration: 4000 }
        );
      }
    } catch (err) {
      console.error("Get auto clock out schedule error:", err);
    }
  };

  // Check Working Day
  const handleCheckWorkingDay = async () => {
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const query = new URLSearchParams({
        date: new Date().toISOString().split('T')[0]
      }).toString();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/check-working-day?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
       
        toast.success(
          <div>
            <p className="font-bold">Working Day Check</p>
            <p>Date: {data.data.date}</p>
            <p>Status: {data.data.dayStatus}</p>
            <p>Is Working Day: {data.data.isWorkingDay ? 'Yes' : 'No'}</p>
            {data.data.reason && <p>Reason: {data.data.reason}</p>}
          </div>,
          { duration: 4000 }
        );
      }
    } catch (err) {
      console.error("Check working day error:", err);
    }
  };

  // Update Employee Shift (Admin)
  const handleUpdateShiftTiming = async (employeeId) => {
    if (!isAdmin) return;
   
    const startTime = prompt("Enter new shift start time (HH:mm)", "09:00");
    const endTime = prompt("Enter new shift end time (HH:mm)", "18:00");
    const reason = prompt("Enter reason for adjustment (optional)", "Shift timing adjustment");
   
    if (!startTime || !endTime) return;

    setLoading(true);
    try {
      const token = getToken();
     
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/update-shift`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          shiftData: {
            start: startTime,
            end: endTime,
            name: "Custom Shift"
          },
          reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✓ Shift timing updated successfully!");
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to update shift timing");
      }
    } catch (err) {
      console.error("Update shift timing error:", err);
      toast.error("Failed to update shift timing");
    } finally {
      setLoading(false);
    }
  };

  // Correct Attendance (Admin)
  const handleCorrectAttendance = async (attendanceId, currentData = {}) => {
    if (!isAdmin) {
      toast.error("Only admin can correct attendance");
      return;
    }
   
    setLoading(true);
    try {
      setSelectedAttendanceRecord({
        _id: attendanceId,
        ...currentData,
        isEditing: true
      });
     
      toast.success("Edit mode activated. Please update the attendance record.");
    } catch (err) {
      console.error("Correction error:", err);
      toast.error("Correction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save corrected attendance
  const handleSaveCorrectedAttendance = async () => {
    if (!isAdmin || !selectedAttendanceRecord) return;
   
    setLoading(true);
    try {
      const token = getToken();
     
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/correct/${selectedAttendanceRecord._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          clockIn: selectedAttendanceRecord.clockIn ? `${selectedAttendanceRecord.date}T${selectedAttendanceRecord.clockIn}:00` : null,
          clockOut: selectedAttendanceRecord.clockOut ? `${selectedAttendanceRecord.date}T${selectedAttendanceRecord.clockOut}:00` : null,
          status: selectedAttendanceRecord.status,
          shiftStart: selectedAttendanceRecord.shiftStart,
          shiftEnd: selectedAttendanceRecord.shiftEnd,
          remarks: selectedAttendanceRecord.remarks || "Corrected by admin"
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✓ Attendance corrected successfully!");
        setSelectedAttendanceRecord(null);
       
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to correct attendance");
      }
    } catch (err) {
      console.error("Save correction error:", err);
      toast.error("Save failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== UTILITY FUNCTIONS =====================

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const roleInfo = { role: userRole, isAdmin, userData };
     
      if (userRole === "employee") {
        await fetchTodayStatus();
      }
     
      await fetchSummary(roleInfo);
      toast.success("Data refreshed");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (attendanceId) => {
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/records/${attendanceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClockDetails(data.attendance);
        setShowRecentDetails(true);
       
        toast.success("Attendance details loaded");
      } else {
        toast.error("Failed to load attendance details");
      }
    } catch (err) {
      console.error("View details error:", err);
      toast.error("Error loading attendance details");
    }
  };

  const toggleDetailsVisibility = () => {
    setShowRecentDetails(!showRecentDetails);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeFromISO = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatDateDisplay = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'early': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'govt holiday': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'weekly off': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'off day': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'clocked in': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unpaid leave': return 'bg-red-100 text-red-800 border-red-200';
      case 'half paid leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'half day': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTodayStatusText = () => {
    if (todayStatus.clockedOut) return "Clocked Out";
    if (todayStatus.clockedIn) return "Clocked In";
    return "Not Clocked In";
  };

  const getTodayStatusColor = () => {
    if (todayStatus.clockedOut) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (todayStatus.clockedIn) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Export Attendance Data
  const handleExportData = async (format = 'json') => {
    try {
      const token = getToken();
     
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
        ...(isAdmin && userId && { employeeId: userId })
      }).toString();

      const endpoint = isAdmin
        ? `${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/export?${query}`
        : `${process.env.NEXT_PUBLIC_API_URL}/attendance/export?${query}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
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
          a.download = `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("JSON exported successfully!");
        }
      } else {
        toast.error("Failed to export data");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed");
    }
  };

  // Pagination
  const totalPages = Math.ceil(attendance.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = attendance.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Add holiday/leave date management functions
  const addHoliday = () => {
    const date = prompt("Enter holiday date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    const type = prompt("Enter holiday type (Govt Holiday/Weekly Off/Other):", "Govt Holiday");
   
    if (date && type) {
      setBulkAttendanceData(prev => ({
        ...prev,
        holidays: [...prev.holidays, { date, type }]
      }));
      toast.success(`Added holiday: ${date} - ${type}`);
    }
  };

  const addLeaveDate = () => {
    const date = prompt("Enter leave date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
   
    if (date) {
      setBulkAttendanceData(prev => ({
        ...prev,
        leaveDates: [...prev.leaveDates, date]
      }));
      toast.success(`Added leave date: ${date}`);
    }
  };

  const addWorkingDay = () => {
    const date = prompt("Enter working date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
   
    if (date) {
      setBulkAttendanceData(prev => ({
        ...prev,
        workingDays: [...prev.workingDays, date]
      }));
      toast.success(`Added working day: ${date}`);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Current time state
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading attendance...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // ===================== RENDER =====================

  return (
    <>
    {/* System Info Bar */}
<div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-100">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
        <Network className="text-white" size={20} />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700">System Information</div>
        <div className="flex flex-wrap gap-4 mt-1">
          <div className="flex items-center gap-1">
            <Wifi size={14} className="text-blue-500" />
            <span className="text-sm text-gray-600">IP: <span className="font-mono font-semibold">{realIpAddress}</span></span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-green-500" />
            <span className="text-sm text-gray-600">Location: {userLocation.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone size={14} className="text-purple-500" />
            <span className="text-sm text-gray-600">Device: {deviceInfo.os} ({deviceInfo.type})</span>
          </div>
          <div className="flex items-center gap-1">
            <Server size={14} className="text-orange-500" />
            <span className="text-sm text-gray-600">Browser: {deviceInfo.browser}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={getRealIPAddress}
        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
      >
        <RefreshCw size={14} />
        Refresh IP
      </button>
      <button
        onClick={getUserLocation}
        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center gap-1"
      >
        <RefreshCw size={14} />
        Refresh Location
      </button>
    </div>
  </div>
</div>
      <Toaster position="top-right" />
     
      {/* Employee Selector Modal */}
      {showEmployeeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden employee-selector">
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
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="Search by name, ID, or email..."
                />
              </div>
            </div>
           
            <div className="overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No employees found</p>
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <button
                      key={employee._id}
                      onClick={() => handleSelectEmployee(employee)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-purple-50 rounded-xl transition-all duration-300 text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
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
      )}

      {/* Manual Attendance Modal */}
      {showManualAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Manual Attendance</h2>
              <button 
                onClick={() => {
                  setShowManualAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                  setManualAttendanceData({
                    employeeId: "",
                    employeeName: "",
                    date: new Date().toISOString().split('T')[0],
                    clockIn: "09:00",
                    clockOut: "18:00",
                    status: "Present",
                    shiftStart: "09:00",
                    shiftEnd: "18:00",
                    remarks: "Created by admin",
                    isHoliday: false,
                    holidayType: null
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Employee Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee *
                {selectedEmployee && (
                  <span className="ml-2 text-green-600 text-sm font-normal">
                    ✓ Selected
                  </span>
                )}
              </label>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                  }}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="Search employee by name or ID..."
                  autoFocus
                />
                {employeeSearch && (
                  <button
                    onClick={() => setEmployeeSearch("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {/* ম্যানুয়াল অ্যাটেন্ডেন্স মোডালে বার্তা আপডেট করুন */}
{manualAttendanceData.date && (
  <div className="mb-4">
    <div className={`p-3 rounded-xl ${(() => {
      const dayStatus = getDayStatus(manualAttendanceData.date);
      if (dayStatus.status === 'Govt Holiday') return 'bg-purple-50 border border-purple-200';
      if (dayStatus.status === 'Weekly Off') return 'bg-indigo-50 border border-indigo-200';
      return 'bg-blue-50 border border-blue-200';
    })()}`}>
      <div className="flex items-center gap-2">
        <Calendar className={(() => {
          const dayStatus = getDayStatus(manualAttendanceData.date);
          if (dayStatus.status === 'Govt Holiday') return 'text-purple-600';
          if (dayStatus.status === 'Weekly Off') return 'text-indigo-600';
          return 'text-blue-600';
        })()} size={16} />
        <span className="text-sm font-medium">
          {formatDayMessage(manualAttendanceData.date)}
        </span>
      </div>
      
      {(() => {
        const dayStatus = getDayStatus(manualAttendanceData.date);
        
        if (dayStatus.status === 'Weekly Off') {
          return (
            <div className="text-xs text-indigo-600 mt-1">
              ⓘ {dayStatus.dayName} is a weekly off day. No clock in/out required.
            </div>
          );
        }
        
        if (dayStatus.status === 'Govt Holiday') {
          return (
            <div className="text-xs text-purple-600 mt-1">
              ⓘ This is a holiday. No clock in/out required.
            </div>
          );
        }
        
        return (
          <div className="text-xs text-blue-600 mt-1">
            ⓘ This is a working day. Clock in/out is required.
          </div>
        );
      })()}
    </div>
  </div>
)}
              {/* Search Results Dropdown */}
              {employeeSearch && !selectedEmployee && (
                <div className="relative z-10">
                  <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No employees found for "{employeeSearch}"
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <button
                          key={employee._id}
                          onClick={() => handleSelectEmployee(employee)}
                          className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {employee.employeeId} • {employee.department || 'No Department'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Selected Employee Display */}
              {selectedEmployee && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {selectedEmployee.employeeId} • {selectedEmployee.department || 'No Department'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setEmployeeSearch("");
                        setManualAttendanceData(prev => ({
                          ...prev,
                          employeeId: "",
                          employeeName: ""
                        }));
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
              
              {!selectedEmployee && (
                <p className="text-red-500 text-sm mt-2">
                  ⚠️ Please search and select an employee
                </p>
              )}
            </div>
            
            {/* Auto-detect status based on date */}
            <div className="mb-4">
              {manualAttendanceData.date && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-blue-800">Date Analysis:</span>
                    <span className="text-sm font-bold text-blue-700 ml-1">
                      {getAutoStatus(manualAttendanceData.date)}
                    </span>
                  </div>
                  {isWeekend(manualAttendanceData.date) && (
                    <div className="text-xs text-purple-600 mt-1">
                      ⓘ This is a weekend (no clock in/out required)
                    </div>
                  )}
                  {isHolidayDate(manualAttendanceData.date) && (
                    <div className="text-xs text-purple-600 mt-1">
                      ⓘ This is a holiday (no clock in/out required)
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Attendance Form Fields */}
            {selectedEmployee && (
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={manualAttendanceData.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const autoStatus = getAutoStatus(newDate);
                        setManualAttendanceData({
                          ...manualAttendanceData, 
                          date: newDate,
                          status: autoStatus
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={manualAttendanceData.status}
                      onChange={(e) => setManualAttendanceData({...manualAttendanceData, status: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                      <option value="Late">Late</option>
                      <option value="Govt Holiday">Govt Holiday</option>
                      <option value="Weekly Off">Weekly Off</option>
                      <option value="Off Day">Off Day</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Auto Absent">Auto Absent</option>
                    </select>
                  </div>
                </div>
                
                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clock In Time 
                      {manualAttendanceData.status === 'Present' && '*'}
                      {(manualAttendanceData.status === 'Govt Holiday' || 
                        manualAttendanceData.status === 'Weekly Off' || 
                        manualAttendanceData.status === 'Off Day') && (
                        <span className="text-xs text-gray-500 ml-2">(Auto: No clock required)</span>
                      )}
                    </label>
                    <input
                      type="time"
                      value={manualAttendanceData.clockIn}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.clockOut && time) {
                          const clockIn = new Date(`2000-01-01T${time}:00`);
                          const clockOut = new Date(`2000-01-01T${manualAttendanceData.clockOut}:00`);
                          if (clockIn >= clockOut) {
                            toast.error("Clock in time must be before clock out time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, clockIn: time});
                      }}
                      className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 ${
                        (manualAttendanceData.status === 'Govt Holiday' || 
                         manualAttendanceData.status === 'Weekly Off' || 
                         manualAttendanceData.status === 'Off Day') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={manualAttendanceData.status === 'Govt Holiday' || 
                                manualAttendanceData.status === 'Weekly Off' || 
                                manualAttendanceData.status === 'Off Day' || 
                                manualAttendanceData.status === 'Absent' || 
                                manualAttendanceData.status === 'Leave' ||
                                manualAttendanceData.status === 'Auto Absent'}
                    />
                    {manualAttendanceData.clockIn && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.clockIn}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clock Out Time 
                      {manualAttendanceData.status === 'Present' && '*'}
                      {(manualAttendanceData.status === 'Govt Holiday' || 
                        manualAttendanceData.status === 'Weekly Off' || 
                        manualAttendanceData.status === 'Off Day') && (
                        <span className="text-xs text-gray-500 ml-2">(Auto: No clock required)</span>
                      )}
                    </label>
                    <input
                      type="time"
                      value={manualAttendanceData.clockOut}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.clockIn && time) {
                          const clockIn = new Date(`2000-01-01T${manualAttendanceData.clockIn}:00`);
                          const clockOut = new Date(`2000-01-01T${time}:00`);
                          if (clockOut <= clockIn) {
                            toast.error("Clock out time must be after clock in time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, clockOut: time});
                      }}
                      className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 ${
                        (manualAttendanceData.status === 'Govt Holiday' || 
                         manualAttendanceData.status === 'Weekly Off' || 
                         manualAttendanceData.status === 'Off Day') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={manualAttendanceData.status === 'Govt Holiday' || 
                                manualAttendanceData.status === 'Weekly Off' || 
                                manualAttendanceData.status === 'Off Day' || 
                                manualAttendanceData.status === 'Absent' || 
                                manualAttendanceData.status === 'Leave' ||
                                manualAttendanceData.status === 'Auto Absent'}
                    />
                    {manualAttendanceData.clockOut && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.clockOut}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shift Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start Time *</label>
                    <input
                      type="time"
                      value={manualAttendanceData.shiftStart}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.shiftEnd && time) {
                          const shiftStart = new Date(`2000-01-01T${time}:00`);
                          const shiftEnd = new Date(`2000-01-01T${manualAttendanceData.shiftEnd}:00`);
                          if (shiftStart >= shiftEnd) {
                            toast.error("Shift start time must be before shift end time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, shiftStart: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {manualAttendanceData.shiftStart && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.shiftStart}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift End Time *</label>
                    <input
                      type="time"
                      value={manualAttendanceData.shiftEnd}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.shiftStart && time) {
                          const shiftStart = new Date(`2000-01-01T${manualAttendanceData.shiftStart}:00`);
                          const shiftEnd = new Date(`2000-01-01T${time}:00`);
                          if (shiftEnd <= shiftStart) {
                            toast.error("Shift end time must be after shift start time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, shiftEnd: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {manualAttendanceData.shiftEnd && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.shiftEnd}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Time Validation Summary */}
                {(manualAttendanceData.clockIn || manualAttendanceData.clockOut || manualAttendanceData.shiftStart || manualAttendanceData.shiftEnd) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Time Validation Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {manualAttendanceData.clockIn && manualAttendanceData.clockOut && (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            (() => {
                              const clockIn = new Date(`2000-01-01T${manualAttendanceData.clockIn}:00`);
                              const clockOut = new Date(`2000-01-01T${manualAttendanceData.clockOut}:00`);
                              return clockOut > clockIn ? 'bg-green-500' : 'bg-red-500';
                            })()
                          }`}></div>
                          <span className="text-gray-600">Clock In/Out:</span>
                          <span className="font-medium">
                            {manualAttendanceData.clockIn} - {manualAttendanceData.clockOut}
                          </span>
                        </div>
                      )}
                      
                      {manualAttendanceData.shiftStart && manualAttendanceData.shiftEnd && (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            (() => {
                              const shiftStart = new Date(`2000-01-01T${manualAttendanceData.shiftStart}:00`);
                              const shiftEnd = new Date(`2000-01-01T${manualAttendanceData.shiftEnd}:00`);
                              return shiftEnd > shiftStart ? 'bg-green-500' : 'bg-red-500';
                            })()
                          }`}></div>
                          <span className="text-gray-600">Shift:</span>
                          <span className="font-medium">
                            {manualAttendanceData.shiftStart} - {manualAttendanceData.shiftEnd}
                          </span>
                        </div>
                      )}
                      
                      {manualAttendanceData.clockIn && manualAttendanceData.shiftStart && (
                        <div className="text-xs text-gray-500">
                            <div className={`text-xs px-2 py-1 rounded font-medium mt-1 ${
    getArrivalStatus(manualAttendanceData.clockIn, manualAttendanceData.shiftStart).bgColor
  } ${
    getArrivalStatus(manualAttendanceData.clockIn, manualAttendanceData.shiftStart).color
  }`}>
    Arrival Status: {
      getArrivalStatus(manualAttendanceData.clockIn, manualAttendanceData.shiftStart).text
    }
  </div>
                          Clock In vs Shift Start: {
                            (() => {
                              const clockIn = new Date(`2000-01-01T${manualAttendanceData.clockIn}:00`);
                              const shiftStart = new Date(`2000-01-01T${manualAttendanceData.shiftStart}:00`);
                              const diffMinutes = (clockIn - shiftStart) / (1000 * 60);
                              
                              if (diffMinutes === 0) return "✅ On time";
                              if (diffMinutes > 0) return `⚠️ Late by ${diffMinutes} minutes`;
                              return `✅ Early by ${Math.abs(diffMinutes)} minutes`;
                            })()
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Holiday Information */}
                {manualAttendanceData.status === 'Govt Holiday' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Type</label>
                      <select
                        value={manualAttendanceData.holidayType || ''}
                        onChange={(e) => setManualAttendanceData({...manualAttendanceData, holidayType: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      >
                        <option value="">Select Holiday Type</option>
                        <option value="National">National Holiday</option>
                        <option value="Regional">Regional Holiday</option>
                        <option value="Religious">Religious Holiday</option>
                        <option value="Company">Company Holiday</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        id="isHoliday"
                        checked={manualAttendanceData.isHoliday}
                        onChange={(e) => setManualAttendanceData({...manualAttendanceData, isHoliday: e.target.checked})}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="isHoliday" className="ml-2 text-sm text-gray-700">
                        Mark as Paid Holiday
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={manualAttendanceData.remarks}
                    onChange={(e) => setManualAttendanceData({...manualAttendanceData, remarks: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    rows="3"
                    placeholder="Enter remarks or reason for manual entry..."
                  />
                </div>
                
                {/* Preview Card */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-sm font-medium text-green-800">Preview</p>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      <span className="font-medium">Employee:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {new Date(manualAttendanceData.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {manualAttendanceData.status}
                      {(manualAttendanceData.status === 'Govt Holiday' || manualAttendanceData.status === 'Weekly Off') && (
                        <span className="text-xs text-purple-600 ml-2">(Auto-detected)</span>
                      )}
                    </p>
                    {manualAttendanceData.clockIn && (
                      <p>
                        <span className="font-medium">Clock In:</span> {manualAttendanceData.clockIn}
                      </p>
                    )}
                    {manualAttendanceData.clockOut && (
                      <p>
                        <span className="font-medium">Clock Out:</span> {manualAttendanceData.clockOut}
                      </p>
                    )}
                    {(manualAttendanceData.status === 'Govt Holiday' || manualAttendanceData.status === 'Weekly Off') && (
                      <p className="text-xs text-green-600">
                        ✓ No clock in/out required for this status
                      </p>
                    )}
                    {manualAttendanceData.remarks && (
                      <p>
                        <span className="font-medium">Remarks:</span> {manualAttendanceData.remarks}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowManualAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateManualAttendance}
                disabled={
                  loading || 
                  !selectedEmployee || 
                  !manualAttendanceData.date || 
                  !manualAttendanceData.status ||
                  !manualAttendanceData.shiftStart ||
                  !manualAttendanceData.shiftEnd ||
                  !validateTimeOrder(manualAttendanceData.shiftStart, manualAttendanceData.shiftEnd) ||
                  (manualAttendanceData.clockIn && manualAttendanceData.clockOut && 
                   !validateTimeOrder(manualAttendanceData.clockIn, manualAttendanceData.clockOut))
                }
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Attendance"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Attendance Modal */}
      {showBulkAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Bulk Attendance</h2>
              <button 
                onClick={() => {
                  setShowBulkAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                  setBulkAttendanceData({
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
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Employee Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee *
                {selectedEmployee && (
                  <span className="ml-2 text-green-600 text-sm font-normal">
                    ✓ Selected
                  </span>
                )}
              </label>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                  }}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="Search employee by name or ID..."
                  autoFocus
                />
                {employeeSearch && (
                  <button
                    onClick={() => setEmployeeSearch("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {employeeSearch && !selectedEmployee && (
                <div className="relative z-10">
                  <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No employees found for "{employeeSearch}"
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <button
                          key={employee._id}
                          onClick={() => handleSelectEmployee(employee)}
                          className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {employee.employeeId} • {employee.department || 'No Department'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Selected Employee Display */}
              {selectedEmployee && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {selectedEmployee.employeeId} • {selectedEmployee.department || 'No Department'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setEmployeeSearch("");
                        setBulkAttendanceData(prev => ({
                          ...prev,
                          employeeId: "",
                          employeeName: ""
                        }));
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
              
              {!selectedEmployee && (
                <p className="text-red-500 text-sm mt-2">
                  ⚠️ Please search and select an employee
                </p>
              )}
            </div>
            
            {/* Bulk Attendance Form Fields */}
            {selectedEmployee && (
              <div className="space-y-6">
                {/* Month and Year Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                    <select
                      value={bulkAttendanceData.month}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, month: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
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
                      value={bulkAttendanceData.year}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, year: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
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
                      value={bulkAttendanceData.defaultShiftStart}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        setBulkAttendanceData({...bulkAttendanceData, defaultShiftStart: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {bulkAttendanceData.defaultShiftStart && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {bulkAttendanceData.defaultShiftStart}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Shift End *</label>
                    <input
                      type="time"
                      value={bulkAttendanceData.defaultShiftEnd}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (bulkAttendanceData.defaultShiftStart && time) {
                          const start = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftStart}:00`);
                          const end = new Date(`2000-01-01T${time}:00`);
                          if (end <= start) {
                            toast.error("Shift end time must be after shift start time");
                            return;
                          }
                        }
                        
                        setBulkAttendanceData({...bulkAttendanceData, defaultShiftEnd: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {bulkAttendanceData.defaultShiftEnd && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {bulkAttendanceData.defaultShiftEnd}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional validation for shift timing difference */}
                {bulkAttendanceData.defaultShiftStart && bulkAttendanceData.defaultShiftEnd && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-blue-800">Shift Duration:</span>
                      <span className="text-sm font-bold text-blue-700 ml-1">
                        {(() => {
                          const start = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftStart}:00`);
                          const end = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftEnd}:00`);
                          const diffHours = (end - start) / (1000 * 60 * 60);
                          return `${diffHours.toFixed(2)} hours`;
                        })()}
                      </span>
                    </div>
                        {/* Add arrival status explanation */}
    <div className="text-xs text-blue-700 mt-2 space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span>Early: Clock in before {bulkAttendanceData.defaultShiftStart}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span>On Time: Clock in at {bulkAttendanceData.defaultShiftStart} (±5 minutes)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <span>Late: Clock in after {bulkAttendanceData.defaultShiftStart} (+5 minutes)</span>
      </div>
    </div> 
                    {(() => {
                      const start = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftStart}:00`);
                      const end = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftEnd}:00`);
                      const diffHours = (end - start) / (1000 * 60 * 60);
                      
                      if (diffHours < 1) {
                        return (
                          <div className="text-xs text-yellow-600 mt-1">
                            ⚠️ Shift duration is less than 1 hour
                          </div>
                        );
                      } else if (diffHours > 12) {
                        return (
                          <div className="text-xs text-yellow-600 mt-1">
                            ⚠️ Shift duration is more than 12 hours
                          </div>
                        );
                      } else if (diffHours < 4) {
                        return (
                          <div className="text-xs text-blue-600 mt-1">
                            ℹ️ Considered as Half Day shift
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
                
                {/* Options */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="skipWeekends"
                      checked={bulkAttendanceData.skipWeekends}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, skipWeekends: e.target.checked})}
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
                      checked={bulkAttendanceData.markAllAsPresent}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, markAllAsPresent: e.target.checked})}
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
                  {(bulkAttendanceData.holidays.length > 0 || bulkAttendanceData.leaveDates.length > 0 || bulkAttendanceData.workingDays.length > 0) && (
                    <div className="mt-4 space-y-2">
                      {bulkAttendanceData.holidays.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-purple-600">Holidays:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bulkAttendanceData.holidays.map((holiday, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                {holiday.date} ({holiday.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {bulkAttendanceData.leaveDates.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-blue-600">Leave Dates:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bulkAttendanceData.leaveDates.map((date, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {date}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {bulkAttendanceData.workingDays.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-green-600">Working Days:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bulkAttendanceData.workingDays.map((date, index) => (
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
                      <span className="font-medium">Employee:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Period:</span> {new Date(bulkAttendanceData.year, bulkAttendanceData.month - 1, 1).toLocaleString('default', { month: 'long' })} {bulkAttendanceData.year}
                    </p>
                    <p>
                      <span className="font-medium">Shift:</span> {bulkAttendanceData.defaultShiftStart} - {bulkAttendanceData.defaultShiftEnd}
                    </p>
                    <p>
                      <span className="font-medium">Total Days:</span> {new Date(bulkAttendanceData.year, bulkAttendanceData.month, 0).getDate()}
                    </p>
                    <p>
                      <span className="font-medium">Working Days:</span> {
                        generateBulkAttendanceData().filter(record => record.status === 'Present').length
                      }
                    </p>
                    <p>
                      <span className="font-medium">Holidays:</span> {
                        generateBulkAttendanceData().filter(record => record.status === 'Govt Holiday').length
                      }
                    </p>
                    <p>
                      <span className="font-medium">Leaves:</span> {
                        generateBulkAttendanceData().filter(record => record.status === 'Leave').length
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
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
                    }}
                    className="mt-3 w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    Generate Preview
                  </button>
                </div>
                
                {/* Warning Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <p className="text-sm font-medium text-yellow-800">Important Note</p>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                    <li>This will create or update attendance records for all days in the selected month</li>
                    <li>Existing records will be updated with new data</li>
                    <li>New records will be created for missing dates</li>
                    <li>Weekends and holidays will be automatically marked (no clock in/out)</li>
                    <li>This action cannot be undone easily</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowBulkAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBulkAttendance}
                disabled={loading || !selectedEmployee || !bulkAttendanceData.month || !bulkAttendanceData.year}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={20} />
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Create Bulk Attendance"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {selectedAttendanceRecord?.isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Attendance Record</h2>
              <button
                onClick={() => setSelectedAttendanceRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>
           
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedAttendanceRecord.date ? selectedAttendanceRecord.date.split('T')[0] : ''}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      date: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedAttendanceRecord.status}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      status: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Late">Late</option>
                    <option value="Early">Early</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Govt Holiday">Govt Holiday</option>
                    <option value="Weekly Off">Weekly Off</option>
                    <option value="Off Day">Off Day</option>
                  </select>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock In Time</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.clockIn || ''}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      clockIn: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock Out Time</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.clockOut || ''}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      clockOut: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.shiftStart || '09:00'}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      shiftStart: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift End</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.shiftEnd || '18:00'}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      shiftEnd: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
              </div>
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={selectedAttendanceRecord.remarks || ''}
                  onChange={(e) => setSelectedAttendanceRecord({
                    ...selectedAttendanceRecord,
                    remarks: e.target.value
                  })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  rows="3"
                  placeholder="Enter remarks..."
                />
              </div>
            </div>
           
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedAttendanceRecord(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrectedAttendance}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6 overflow-hidden">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Attendance Management
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">
                  {isAdmin ? "Manage all employee attendance" : "Track your attendance"}
                </p>
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isAdmin
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                  }`}>
                    {isAdmin ? <Shield size={12} /> : <User size={12} />}
                    {userRole.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Time</div>
                <div className="text-xl font-bold text-purple-700">{formatTime(currentTime)}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(new Date().toISOString())}
                </div>
              </div>
             
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
             
              {isAdmin && (
                <div className="relative admin-actions-menu">
                  <button
                    onClick={() => setShowAdminActionsMenu(!showAdminActionsMenu)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <MoreVertical size={18} />
                    Admin Actions
                  </button>
                  {showAdminActionsMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowManualAttendanceModal(true);
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Plus size={18} />
                          <span>Manual Attendance</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowBulkAttendanceModal(true);
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <FileSpreadsheet size={18} />
                          <span>Bulk Attendance</span>
                        </button>
                        <button
                          onClick={() => {
                            handleViewLateStatistics();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <BarChart3 size={18} />
                          <span>Late Statistics</span>
                        </button>
                        <button
                          onClick={() => {
                            handleViewLateEarlyStatistics();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <BarChart3 size={18} />
                          <span>Late & Early Stats</span>
                        </button>
                        <button
                          onClick={() => {
                            handleTriggerAutoClockOut();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Clock size={18} />
                          <span>Trigger Auto Clock Out</span>
                        </button>
                        <button
                          onClick={() => {
                            handleTriggerAbsentMarking();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <XCircle size={18} />
                          <span>Trigger Absent Marking</span>
                        </button>
                        <button
                          onClick={() => {
                            handleTriggerTomorrowRecords();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <CalendarDays size={18} />
                          <span>Generate Tomorrow Records</span>
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            handleExportData('json');
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                          <span>Export JSON</span>
                        </button>
                        <button
                          onClick={() => {
                            handleExportData('csv');
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
             
              {!isAdmin && (
                <button
                  onClick={handleViewShiftTiming}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow"
                >
                  <Clock4 size={18} />
                  Shift Timing
                </button>
              )}
             
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>

          {/* Clock In/Out Card - Only for Employees */}
          {userRole === "employee" && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-purple-600" size={24} />
                    Today's Attendance
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatDate(new Date().toISOString())}
                    <span className="ml-2 text-xs text-purple-500">
                      • Auto clock-out at 6:10 PM
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>Location: {userLocation.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Smartphone size={12} />
                      <span>Device: {deviceInfo.os} ({deviceInfo.type})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleClockIn}
                    disabled={loading || todayStatus.clockedIn || todayStatus.clockedOut}
                    className="group px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                    {todayStatus.clockedIn || todayStatus.clockedOut ? "Clocked In" : "Clock In"}
                  </button>
                  <button
                    onClick={handleClockOut}
                    disabled={loading || !todayStatus.clockedIn || todayStatus.clockedOut}
                    className="group px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {todayStatus.clockedOut ? "Clocked Out" : "Clock Out"}
                  </button>
                 
                  {(clockDetails || todayStatus.clockedIn) && (
                    <button
                      onClick={toggleDetailsVisibility}
                      className="group px-4 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {showRecentDetails ? (
                        <>
                          <EyeOff size={20} className="group-hover:scale-110 transition-transform" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye size={20} className="group-hover:scale-110 transition-transform" />
                          Show Details
                        </>
                      )}
                    </button>
                  )}
                 
                  <button
                    onClick={handleViewLateStatistics}
                    className="group px-4 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <BarChart3 size={20} className="group-hover:scale-110 transition-transform" />
                    Late Stats
                  </button>
                 
                  <button
                    onClick={handleCheckWorkingDay}
                    className="group px-4 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Calendar size={20} className="group-hover:scale-110 transition-transform" />
                    Check Day
                  </button>
                </div>
              </div>
             
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            {formatTimeFromISO(todayStatus.clockInTime)}
                          </div>
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
                            {formatTimeFromISO(todayStatus.clockOutTime)}
                          </div>
                        </div>
                      ) : todayStatus.clockedIn ? (
                        <div className="text-yellow-600 flex items-center gap-1">
                          <Clock size={14} />
                          Waiting to clock out
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
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTodayStatusColor()}`}>
                        {getTodayStatusText()}
                      </div>
                      {todayStatus.clockedIn && todayStatus.clockedOut && (
                        <div className="text-xs text-gray-500 mt-2">
                          ✅ Attendance completed for today
                        </div>
                      )}
                      {!todayStatus.clockedIn && (
                        <div className="text-xs text-red-500 mt-2">
                          ⚠️ Auto absent marking at 12:10 PM
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Info Card */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-xl border border-purple-100 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    View and manage all employee attendance records. You can edit attendance and generate reports.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="text-gray-500" size={16} />
                    <div className="text-sm text-gray-500">Total Employees</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalEmployees || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-500" size={16} />
                    <div className="text-sm text-gray-500">Active Today</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">{summary?.presentToday || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="text-red-500" size={16} />
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
             
              {/* Admin Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowManualAttendanceModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  Manual Attendance
                </button>
                <button
                  onClick={() => setShowBulkAttendanceModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FileSpreadsheet size={18} />
                  Bulk Attendance
                </button>
                <button
                  onClick={handleViewLateStatistics}
                  className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <BarChart3 size={18} />
                  Late Statistics
                </button>
                <button
                  onClick={handleViewLateEarlyStatistics}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <BarChart3 size={18} />
                  Late & Early Stats
                </button>
                <button
                  onClick={handleViewAutoClockOutSchedule}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Clock4 size={18} />
                  Auto Clock Out
                </button>
                <button
                  onClick={() => handleExportData('csv')}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {(clockDetails && showRecentDetails) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-xl border border-blue-100 mb-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="text-blue-600" size={24} />
                  Recent Clock Details
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleDetailsVisibility}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300"
                  >
                    <EyeOff size={16} />
                    Hide
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(clockDetails, null, 2));
                      toast.success("Details copied to clipboard!");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-300"
                  >
                    <FileText size={16} />
                    Copy JSON
                  </button>
                </div>
              </div>
             
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Date</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDateDisplay(clockDetails.date)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(clockDetails.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
               
                {clockDetails.clockIn && (
                  <div className="p-4 bg-white rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Clock In</span>
                    </div>
                    <div className="text-lg font-semibold text-green-700">
                      {new Date(clockDetails.clockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateDisplay(clockDetails.clockIn)}
                    </div>
                  </div>
                )}
               
                {clockDetails.clockOut && (
                  <div className="p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Clock Out</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-700">
                      {new Date(clockDetails.clockOut).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateDisplay(clockDetails.clockOut)}
                    </div>
                  </div>
                )}
               
                {clockDetails.totalHours > 0 && (
                  <div className="p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">Total Hours</span>
                    </div>
                    <div className="text-lg font-semibold text-purple-700">
                      {parseFloat(clockDetails.totalHours).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Hours worked
                    </div>
                  </div>
                )}
               
                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <div className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(clockDetails.status)}`}>
                    {clockDetails.status || "Pending"}
                  </div>
                  {clockDetails.isLate && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Late: {clockDetails.lateMinutes} min
                    </div>
                  )}
                  {clockDetails.isEarly && (
                    <div className="text-xs text-orange-600 mt-1">
                      Early: {clockDetails.earlyMinutes} min
                    </div>
                  )}
                </div>
               
                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Location</span>
                  </div>
                  <div className="text-sm text-gray-900">
                    {clockDetails.location || "Unknown"}
                  </div>
                </div>
               
                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Network size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">IP Address</span>
                </div>
                <div className="text-sm font-mono text-gray-900">
                  {clockDetails.ipAddress || 'Unknown'}
                  {clockDetails.ipAddress === "::1" && (
                    <div className="text-xs text-yellow-600 mt-1">
                      (Localhost - Use production for real IP)
                    </div>
                  )}
                </div>
              </div>
               
                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone size={16} className="text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Device</span>
                  </div>
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center gap-1">
                      <HardDrive size={12} className="text-gray-400" />
                      <span>Type: {clockDetails.device?.type || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive size={12} className="text-gray-400" />
                      <span>OS: {clockDetails.device?.os || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive size={12} className="text-gray-400" />
                      <span>Browser: {clockDetails.device?.browser || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
               
                {clockDetails.autoClockOut && (
                  <div className="p-4 bg-white rounded-xl border border-orange-100 hover:border-orange-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock4 size={16} className="text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Auto Clock Out</span>
                    </div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                      Auto Clocked Out
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Time: {clockDetails.autoClockOutTime}
                    </div>
                  </div>
                )}
               
                {clockDetails.markedAbsent && (
                  <div className="p-4 bg-white rounded-xl border border-red-100 hover:border-red-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={16} className="text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Auto Marked</span>
                    </div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      Auto Marked Absent
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {clockDetails.absentMarkedAt ?
                        `At ${new Date(clockDetails.absentMarkedAt).toLocaleTimeString()}` :
                        'System generated'}
                    </div>
                  </div>
                )}
               
                {clockDetails.correctedByAdmin && (
                  <div className="p-4 bg-white rounded-xl border border-yellow-100 hover:border-yellow-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit size={16} className="text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">Admin Correction</span>
                    </div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                      Corrected by Admin
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Modified by administrator
                    </div>
                  </div>
                )}
               
                {clockDetails.adminAdjustedShift && (
                  <div className="p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings size={16} className="text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">Shift Adjusted</span>
                    </div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                      Admin Adjusted Shift
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Custom shift timing applied
                    </div>
                  </div>
                )}
              </div>
             
              <div className="mt-6 pt-6 border-t border-blue-100 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const today = new Date().toDateString();
                    localStorage.setItem("attendanceDate", today);
                    localStorage.removeItem("attendanceTodayStatus");
                    localStorage.removeItem("attendanceClockDetails");
                    localStorage.setItem("attendanceShowDetails", "false");
                   
                    setTodayStatus({
                      clockedIn: false,
                      clockedOut: false,
                      clockInTime: null,
                      clockOutTime: null,
                      status: "Not Clocked",
                      date: today
                    });
                   
                    setClockDetails(null);
                    setShowRecentDetails(false);
                   
                    toast.success("Local storage cleared for new day");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  <RefreshCw size={16} />
                  Simulate New Day
                </button>
                <button
                  onClick={() => {
                    setShowRecentDetails(false);
                    toast.success("Details hidden");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  <EyeOff size={16} />
                  Close Details
                </button>
              </div>
            </div>
          )}

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Attendance Records</h2>
                      <p className="text-gray-500 text-sm">
                        Showing {currentItems.length} of {attendance.length} records
                        {userId && ` for Employee ID: ${userId}`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex gap-2">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                          />
                        </div>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            handleRefresh();
                          }}
                          disabled={loading}
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Filter size={18} />
                          Apply Filter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[calc(100%-80px)] overflow-auto">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="inline-flex flex-col items-center">
                        <Loader2 size={48} className="animate-spin text-purple-600 mb-4" />
                        <p className="text-gray-600 font-medium">Loading attendance records...</p>
                      </div>
                    </div>
                  ) : attendance.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No attendance records</h3>
                        <p className="text-gray-500 max-w-md">
                          No records found for the selected date range
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10">
                            <tr>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                              {isAdmin && <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Employee</th>}
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Clock In</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Clock Out</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Total Hours</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentItems.map((a) => (
                              <tr key={a._id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="py-4 px-6">
                                  <div className="font-medium text-gray-900">
                                    {new Date(a.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </td>
                                {isAdmin && (
                                  <td className="py-4 px-6">
                                    <div className="font-medium text-gray-900">
                                      {a.employee?.firstName ? `${a.employee.firstName} ${a.employee.lastName}` : `Employee ${a.employee?._id?.slice(-6) || 'N/A'}`}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {a.employee?.email || ''}
                                    </div>
                                  </td>
                                )}
                                <td className="py-4 px-6">
                                  <div className="flex items-center">
                                    <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                                    <span className="font-medium">{formatTimeFromISO(a.clockIn)}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center">
                                    <Moon className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span className="font-medium">{formatTimeFromISO(a.clockOut)}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    <span className={`font-bold ${a.totalHours >= 8 ? 'text-green-600' : 'text-yellow-600'}`}>
                                      {a.totalHours?.toFixed(2) || "-"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex flex-col gap-1">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(a.status)}`}>
                                      {a.status || "Pending"}
                                    </div>
                                    {a.isLate && (
                                      <div className="text-xs text-yellow-600">
                                        Late: {a.lateMinutes} min
                                      </div>
                                    )}
                                    {a.isEarly && (
                                      <div className="text-xs text-orange-600">
                                        Early: {a.earlyMinutes} min
                                      </div>
                                    )}
                                    {a.autoClockOut && (
                                      <div className="text-xs text-blue-600">
                                        Auto Clocked Out
                                      </div>
                                    )}
                                    {a.markedAbsent && (
                                      <div className="text-xs text-red-600">
                                        Auto Marked Absent
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleViewDetails(a._id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                      title="View Details"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    {isAdmin && (
                                      <>
                                        <button
                                          onClick={() => handleCorrectAttendance(a._id, a)}
                                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                          title="Edit Attendance"
                                        >
                                          <Edit size={18} />
                                        </button>
                                        <button
                                          onClick={() => handleUpdateShiftTiming(a.employee?._id)}
                                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                          title="Update Shift Timing"
                                        >
                                          <Settings size={18} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                     
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft size={18} />
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
                                    onClick={() => paginate(pageNum)}
                                    className={`w-10 h-10 rounded-lg transition-all ${
                                      currentPage === pageNum
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                             
                              <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRightIcon size={18} />
                              </button>
                            </div>
                            <div className="text-sm text-gray-500">
                              {itemsPerPage} per page
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 h-full">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Attendance Summary</h2>
                  <p className="text-gray-500 text-sm mt-1">Selected period overview</p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
                  {summary ? (
                    <>
                      <div className="space-y-4">
                        {isAdmin && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Total Employees</span>
                              <span className="font-semibold text-gray-900">{summary.totalEmployees || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Present Today</span>
                              <span className="font-semibold text-green-600">{summary.presentToday || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Absent Today</span>
                              <span className="font-semibold text-red-600">{summary.absentToday || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Pending Clock Out</span>
                              <span className="font-semibold text-yellow-600">{summary.pendingClockOut || 0}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Working Days</span>
                          <span className="font-semibold text-gray-900">{summary.workingDays || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Days Present</span>
                          <span className="font-semibold text-green-600">{summary.daysPresent || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Days Absent</span>
                          <span className="font-semibold text-red-600">{summary.daysAbsent || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Days Leave</span>
                          <span className="font-semibold text-blue-600">{summary.daysLeave || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Late Arrivals</span>
                          <span className="font-semibold text-yellow-600">{summary.lateDays || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Early Departures</span>
                          <span className="font-semibold text-orange-600">{summary.earlyDays || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Holidays/Off</span>
                          <span className="font-semibold text-purple-600">{summary.holidayDays || 0}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Total Hours</span>
                            <span className="font-bold text-lg text-purple-700">{summary.totalHours?.toFixed(2) || "0.00"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Average Hours/Day</span>
                          <span className="font-semibold text-gray-900">{summary.averageHours?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Avg Late Minutes</span>
                          <span className="font-semibold text-yellow-600">{summary.averageLateMinutes?.toFixed(1) || "0.0"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Avg Early Minutes</span>
                          <span className="font-semibold text-orange-600">{summary.averageEarlyMinutes?.toFixed(1) || "0.0"}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 font-medium">Attendance Rate</span>
                          <span className="font-bold text-lg text-purple-700">{summary.attendanceRate?.toFixed(1) || "0.0"}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(summary.attendanceRate || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No summary data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
       
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
       
        .max-h-[500px] {
          max-height: 500px;
        }
       
        .h-[calc(100%-80px)] {
          height: calc(100% - 80px);
        }
      `}</style>
    </>
  );
}