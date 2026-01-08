"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  Calendar, 
  Filter, 
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
  Save
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function Page({ userId }) {
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
    holidayType: null
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

  // Auto Clock-Out at 6:10 PM (controller অনুযায়ী)
  useEffect(() => {
    const checkAutoClockOut = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // Check if it's 6:10 PM (18:10) - controller অনুযায়ী
      if (currentHours === 18 && currentMinutes === 10) {
        if (todayStatus.clockedIn && !todayStatus.clockedOut && userRole === "employee") {
          handleAutoClockOut();
        }
      }
    };
    
    const interval = setInterval(checkAutoClockOut, 60000);
    
    return () => clearInterval(interval);
  }, [todayStatus, userRole]);

  // Fetch all employees (for admin)
// Fetch all employees (for admin)
const fetchEmployees = useCallback(async () => {
  console.log("fetchEmployees called, isAdmin:", isAdmin);
  
  if (!isAdmin) {
    console.log("Not admin, skipping fetch");
    return;
  }
  
  try {
    const token = getToken();
    
    if (!token) {
      console.log("No token found");
      toast.error("Authentication required");
      return;
    }

    console.log("Fetching employees from:", `${process.env.NEXT_PUBLIC_API_URL}/admin/getAll-user`);
    
    // API call
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getAll-user`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      cache: 'no-store'
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response Data:", data);
    
    // Check if data exists
    if (!data) {
      console.log("No data received from API");
      setEmployees([]);
      return;
    }

    // Handle response based on actual structure
    let employeesArray = [];
    
    // Check common response structures
    if (Array.isArray(data)) {
      // Direct array response
      employeesArray = data;
    } else if (data.users && Array.isArray(data.users)) {
      // Nested users array
      employeesArray = data.users;
    } else if (data.data && Array.isArray(data.data)) {
      // Nested data array
      employeesArray = data.data;
    } else if (data.employees && Array.isArray(data.employees)) {
      // Nested employees array
      employeesArray = data.employees;
    } else if (typeof data === 'object') {
      // Try to extract array from object values
      const values = Object.values(data);
      for (const value of values) {
        if (Array.isArray(value)) {
          employeesArray = value;
          break;
        }
      }
    }
    
    console.log("Extracted employees array:", employeesArray);
    
    // Transform and validate employees
    const validEmployees = employeesArray
      .filter(emp => emp && typeof emp === 'object')
      .map(emp => {
        // Extract names properly
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
      .filter(emp => emp._id && (emp.firstName || emp.lastName)); // Must have ID and at least one name

    console.log("Valid employees after processing:", validEmployees);
    setEmployees(validEmployees);
    
    if (validEmployees.length === 0) {
      toast.warning("No employees found in the system");
    } else {
      toast.success(`Loaded ${validEmployees.length} employees`);
    }
    
  } catch (error) {
    console.error("Fetch employees error:", error);
    toast.error(`Failed to load employees: ${error.message}`);
    setEmployees([]);
  }
}, [isAdmin]);

// Effect to fetch employees - এই useEffect টি খেয়াল করুন
useEffect(() => {
  console.log("Admin status changed, isAdmin:", isAdmin);
  if (isAdmin) {
    console.log("Fetching employees...");
    fetchEmployees();
  } else {
    console.log("Not admin, clearing employees");
    setEmployees([]);
  }
}, [isAdmin, fetchEmployees]);
 

// Debug: Check employees state
useEffect(() => {
  console.log("Employees state updated:", employees);
}, [employees]);



  const handleAutoClockOut = async () => {
    if (userRole !== "employee") return;
    
    try {
      const token = getToken();
      
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: "Office - Auto",
          device: navigator.userAgent,
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

  // ===================== NEW ADMIN FUNCTIONS =====================

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/trigger-auto-clockout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✓ Auto clock out triggered manually: ${data.results.success} successful, ${data.results.failed} failed`);
        
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

  // Create Manual Attendance (Admin Only)
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

    console.log("Manual Attendance Data:", manualAttendanceData);
    console.log("Selected Employee:", selectedEmployee);
    console.log("Is Admin:", isAdmin);

    // Validate required fields - এই validation টি ঠিক করুন
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

    // Prepare data in correct format
    const employeeId = selectedEmployee?._id || manualAttendanceData.employeeId;
    
    // যদি employeeId না থাকে
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
      isHoliday: manualAttendanceData.isHoliday || false,
      holidayType: manualAttendanceData.holidayType || null
    };

    console.log("Sending attendance data:", attendanceData);

    // Remove null values
    Object.keys(attendanceData).forEach(key => {
      if (attendanceData[key] === null || attendanceData[key] === undefined) {
        delete attendanceData[key];
      }
    });

    // API endpoint check করুন - আপনার backend এর endpoint অনুযায়ী change করুন
    const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/attendance/manual`;
    console.log("API Endpoint:", apiEndpoint);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(attendanceData)
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", data);

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
        holidayType: null
      });
      
      setSelectedEmployee(null);
      
      // Refresh data
      const roleInfo = { role: userRole, isAdmin, userData };
      await fetchSummary(roleInfo);
      await fetchAttendanceRecords(roleInfo);
    } else {
      toast.error(data.message || data.error || data.details || "Failed to create manual attendance");
    }
  } catch (err) {
    console.error("Create manual attendance error:", err);
    toast.error(`Failed to create manual attendance: ${err.message}`);
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

    // Show confirmation dialog
    const confirmCreate = window.confirm(
      `This will create/update attendance for ${new Date(bulkData.year, bulkData.month - 1, 1).toLocaleString('default', { month: 'long' })} ${bulkData.year}.\nEmployee: ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}\n\nAre you sure?`
    );

    if (!confirmCreate) {
      setLoading(false);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attendance/bulk`, {
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
      let message = `✓ Bulk attendance created for ${new Date(bulkData.year, bulkData.month - 1, 1).toLocaleString('default', { month: 'long' })} ${bulkData.year}:\n`;
      
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
      toast.error(data.message || data.error || "Failed to create bulk attendance");
    }
  } catch (err) {
    console.error("Create bulk attendance error:", err);
    toast.error("Failed to create bulk attendance. Please try again.");
  } finally {
    setLoading(false);
  }
};

// ===================== IMPROVED EMPLOYEE SELECTOR =====================

// এই ফাংশনগুলি যোগ করুন বা update করুন:

// Handle employee selection with better validation
// const handleSelectEmployee = (employee) => {
//   if (!employee || !employee._id) {
//     toast.error("Invalid employee selected");
//     return;
//   }
  
//   setSelectedEmployee(employee);
//   setShowEmployeeSelector(false);
  
//   // Update both forms
//   const employeeInfo = {
//     employeeId: employee._id,
//     employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
//   };
  
//   // Update manual attendance form
//   if (showManualAttendanceModal) {
//     setManualAttendanceData(prev => ({
//       ...prev,
//       ...employeeInfo
//     }));
//   }
  
//   // Update bulk attendance form
//   if (showBulkAttendanceModal) {
//     setBulkAttendanceData(prev => ({
//       ...prev,
//       ...employeeInfo
//     }));
//   }
  
//   toast.success(`Selected: ${employeeInfo.employeeName}`);
// };

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

  // Get Employee Attendance with Shift Info
  const handleViewEmployeeAttendance = async (employeeId, month, year) => {
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const query = new URLSearchParams({
        employeeId,
        month,
        year
      }).toString();

      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/employee-attendance`
        : `${process.env.NEXT_PUBLIC_API_URL}/employee-attendance`;

      const response = await fetch(`${endpoint}?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show employee attendance in modal or new section
        setSelectedAttendanceRecord(data);
        
        toast.success(
          <div>
            <p className="font-bold">Employee Attendance</p>
            <p>{data.employee?.name} - {data.period?.month}/{data.period?.year}</p>
          </div>,
          { duration: 4000 }
        );
      }
    } catch (err) {
      console.error("Get employee attendance error:", err);
    }
  };

  // Get Late Statistics
  const handleViewLateStatistics = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/late-statistics`
        : `${process.env.NEXT_PUBLIC_API_URL}/late-statistics`;

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
        
        // Show late statistics in a modal or alert
        const stats = data.statistics;
        
        toast.success(
          <div>
            <p className="font-bold">Late Statistics</p>
            <p>Total Late: {stats.totalLate}</p>
            <p>Average: {stats.averageLateMinutes} minutes</p>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error("Get late statistics error:", err);
    }
  };

  // Get Employee Shift Timing
  const handleViewShiftTiming = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/employee-shift-timing`
        : `${process.env.NEXT_PUBLIC_API_URL}/shift-timing`;

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
            {data.data.shiftTiming.isAdminAdjusted && <p className="text-yellow-600">✓ Admin Adjusted</p>}
          </div>,
          { duration: 4000 }
        );
      }
    } catch (err) {
      console.error("Get shift timing error:", err);
    }
  };

  // Admin Correct Attendance
  const handleCorrectAttendance = async (attendanceId, currentData = {}) => {
    if (!isAdmin) {
      toast.error("Only admin can correct attendance");
      return;
    }
    
    setLoading(true);
    try {
      // Create an edit form/modal for detailed editing
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/correct/${selectedAttendanceRecord._id}`, {
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
          shiftEnd: selectedAttendanceRecord.shiftEnd
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

  // Update Employee Shift Timing
  const handleUpdateShiftTiming = async (employeeId) => {
    if (!isAdmin) return;
    
    const startTime = prompt("Enter new shift start time (HH:mm)", "09:00");
    const endTime = prompt("Enter new shift end time (HH:mm)", "18:00");
    const reason = prompt("Enter reason for adjustment (optional)", "Shift timing adjustment");
    
    if (!startTime || !endTime) return;

    setLoading(true);
    try {
      const token = getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-shift`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          startTime,
          endTime,
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

  // Handle employee selection
const handleSelectEmployee = (employee) => {
  console.log("Selecting employee:", employee);
  
  if (!employee || !employee._id) {
    toast.error("Invalid employee selected");
    return;
  }
  
  setSelectedEmployee(employee);
  setShowEmployeeSelector(false);
  
  // Create full name
  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  
  // Update manual attendance form
  if (showManualAttendanceModal) {
    setManualAttendanceData(prev => ({
      ...prev,
      employeeId: employee._id,
      employeeName: fullName
    }));
  }
  
  // Update bulk attendance form
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

  // Apply employee filter
  const applyEmployeeFilter = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const query = new URLSearchParams({
        ...(employeeFilter.employeeId && { employeeId: employeeFilter.employeeId }),
        ...(employeeFilter.month && { month: employeeFilter.month }),
        ...(employeeFilter.year && { year: employeeFilter.year }),
        ...(employeeFilter.status !== 'all' && { status: employeeFilter.status })
      }).toString();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-records?${query}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.records || data || []);
        toast.success("Filter applied successfully!");
      }
    } catch (error) {
      console.error("Filter error:", error);
      toast.error("Failed to apply filter");
    } finally {
      setLoading(false);
    }
  };

  // ===================== ORIGINAL FUNCTIONS =====================

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/today`, {
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
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/summary?${query}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/summary?${query}`;
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
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/all-records?${query}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/records?${query}`;
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/${attendanceId}`, {
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

  useEffect(() => {
    initializeData();
  }, [initializeData]);

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: "Office",
          device: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedIn: true,
          clockInTime: data.attendance?.clockIn || new Date().toISOString(),
          status: "Clocked In"
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: "Office",
          device: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedOut: true,
          clockOutTime: data.attendance?.clockOut || new Date().toISOString(),
          status: "Present"
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

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPages = Math.ceil(attendance.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = attendance.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

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
      case 'govt holiday': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'weekly off': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'off day': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'clocked in': return 'bg-blue-100 text-blue-800 border-blue-200';
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
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/export?${query}`
        : `${process.env.NEXT_PUBLIC_API_URL}/export?${query}`;

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

  return (
    <>
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
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <XCircle size={24} />
        </button>
      </div>
      
      {/* Employee Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
        <div className="relative">
          <button
            onClick={() => setShowEmployeeSelector(true)}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {selectedEmployee ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedEmployee.employeeId} • {selectedEmployee.department || 'No Department'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <UserCircle size={20} />
                  <span>Click to select employee *</span>
                </div>
              )}
            </div>
            <ChevronDown size={20} />
          </button>
          {!selectedEmployee && (
            <p className="text-red-500 text-sm mt-1">Employee selection is required</p>
          )}
        </div>
      </div>
      
      {selectedEmployee && (
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={manualAttendanceData.date}
                onChange={(e) => setManualAttendanceData({...manualAttendanceData, date: e.target.value})}
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
              </select>
            </div>
          </div>
          
          {/* Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clock In Time {manualAttendanceData.status === 'Present' && '*'}
              </label>
              <input
                type="time"
                value={manualAttendanceData.clockIn}
                onChange={(e) => setManualAttendanceData({...manualAttendanceData, clockIn: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                disabled={['Absent', 'Leave', 'Govt Holiday', 'Weekly Off', 'Off Day'].includes(manualAttendanceData.status)}
              />
              {['Absent', 'Leave', 'Govt Holiday', 'Weekly Off', 'Off Day'].includes(manualAttendanceData.status) && (
                <p className="text-gray-500 text-xs mt-1">Disabled for selected status</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clock Out Time {manualAttendanceData.status === 'Present' && '*'}
              </label>
              <input
                type="time"
                value={manualAttendanceData.clockOut}
                onChange={(e) => setManualAttendanceData({...manualAttendanceData, clockOut: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                disabled={['Absent', 'Leave', 'Govt Holiday', 'Weekly Off', 'Off Day'].includes(manualAttendanceData.status)}
              />
              {['Absent', 'Leave', 'Govt Holiday', 'Weekly Off', 'Off Day'].includes(manualAttendanceData.status) && (
                <p className="text-gray-500 text-xs mt-1">Disabled for selected status</p>
              )}
            </div>
          </div>
          
          {/* Shift Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start Time</label>
              <input
                type="time"
                value={manualAttendanceData.shiftStart}
                onChange={(e) => setManualAttendanceData({...manualAttendanceData, shiftStart: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shift End Time</label>
              <input
                type="time"
                value={manualAttendanceData.shiftEnd}
                onChange={(e) => setManualAttendanceData({...manualAttendanceData, shiftEnd: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Holiday Information (if applicable) */}
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
          }}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateManualAttendance}
          disabled={loading || !selectedEmployee || !manualAttendanceData.date || !manualAttendanceData.status}
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
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <XCircle size={24} />
        </button>
      </div>
      
      {/* Employee Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
        <div className="relative">
          <button
            onClick={() => setShowEmployeeSelector(true)}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {selectedEmployee ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedEmployee.employeeId} • {selectedEmployee.department || 'No Department'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <UserCircle size={20} />
                  <span>Click to select employee *</span>
                </div>
              )}
            </div>
            <ChevronDown size={20} />
          </button>
          {!selectedEmployee && (
            <p className="text-red-500 text-sm mt-1">Employee selection is required</p>
          )}
        </div>
      </div>
      
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Shift Start</label>
              <input
                type="time"
                value={bulkAttendanceData.defaultShiftStart}
                onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, defaultShiftStart: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Shift End</label>
              <input
                type="time"
                value={bulkAttendanceData.defaultShiftEnd}
                onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, defaultShiftEnd: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
          </div>
          
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
              <p className="text-sm font-medium text-blue-800">Preview</p>
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
                <span className="font-medium">Options:</span> {bulkAttendanceData.skipWeekends ? 'Skip weekends, ' : ''} {bulkAttendanceData.markAllAsPresent ? 'Mark all as Present' : 'Based on actual dates'}
              </p>
            </div>
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
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
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onClick={() => handleExportData('csv')}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {/* Employee Filter Section - For Admin */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="text-purple-600" size={24} />
                    Filter Attendance by Employee & Month
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Filter attendance records for specific employees and months
                  </p>
                </div>
                <button
                  onClick={applyEmployeeFilter}
                  disabled={loading}
                  className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Filter size={18} />
                  Apply Filter
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <select
                    value={employeeFilter.employeeId}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, employeeId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="">All Employees</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName} ({employee.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={employeeFilter.month}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, month: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="">All Months</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={employeeFilter.year}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, year: parseInt(e.target.value) || ''})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    placeholder="YYYY"
                    min="2000"
                    max="2100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={employeeFilter.status}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Late">Late</option>
                    <option value="Govt Holiday">Govt Holiday</option>
                    <option value="Weekly Off">Weekly Off</option>
                    <option value="Off Day">Off Day</option>
                  </select>
                </div>
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
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    clockDetails.status === 'Present' ? 'bg-green-100 text-green-800' : 
                    clockDetails.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                    clockDetails.status === 'Leave' ? 'bg-blue-100 text-blue-800' : 
                    clockDetails.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                    clockDetails.status === 'Clocked In' ? 'bg-blue-100 text-blue-800' : 
                    clockDetails.status === 'Govt Holiday' ? 'bg-purple-100 text-purple-800' :
                    clockDetails.status === 'Weekly Off' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {clockDetails.status}
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Device</span>
                  </div>
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center gap-1">
                      <Briefcase size={12} className="text-gray-400" />
                      <span>Type: {clockDetails.device?.type || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Home size={12} className="text-gray-400" />
                      <span>OS: {clockDetails.device?.os || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coffee size={12} className="text-gray-400" />
                      <span>Browser: {clockDetails.device?.browser || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">IP Address</span>
                  </div>
                  <div className="text-sm font-mono text-gray-900">
                    {clockDetails.ipAddress || 'Unknown'}
                  </div>
                </div>
                
                {clockDetails.correctedByAdmin && (
                  <div className="p-4 bg-white rounded-xl border border-orange-100 hover:border-orange-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit size={16} className="text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Admin Correction</span>
                    </div>
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                      Corrected by Admin
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Modified by administrator
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
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.daysPresent || 0}</p>
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
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.daysAbsent || 0}</p>
                  <p className="text-xs text-red-500 mt-1">Needs attention</p>
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

          <div className="">
            <div className="">
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
                                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(a.status)}`}>
                                    {a.status || "Pending"}
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

            <div className="lg:col-span-1 mt-6">
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
                          <span className="font-semibold text-yellow-600">{summary.lateArrivals || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Holidays/Off</span>
                          <span className="font-semibold text-purple-600">{summary.daysHoliday || 0}</span>
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