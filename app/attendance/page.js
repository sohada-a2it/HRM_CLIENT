"use client";

import React, { useState, useEffect } from "react";
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
  Users,
  Activity,
  Home,
  Briefcase,
  Coffee,
  Moon,
  Sun,
  Zap,
  ChevronRight,
  MoreVertical,
  Edit,
  Eye,
  FileText,
  Printer,
  Share2,
  Bell,
  Settings,
  User
} from "lucide-react";

export default function AttendancePage({ userId }) {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [clockDetails, setClockDetails] = useState(() => {
    // Initialize from localStorage if exists
    const storedClockIn = localStorage.getItem('clockInTime');
    const storedClockOut = localStorage.getItem('clockOutTime');
    const storedStatus = localStorage.getItem('clockStatus');
    
    if (storedClockIn || storedClockOut) {
      return {
        _id: "initial_local_storage",
        date: new Date().toISOString(),
        clockIn: storedClockIn,
        clockOut: storedClockOut,
        totalHours: storedClockIn && storedClockOut ? 
          ((new Date(storedClockOut) - new Date(storedClockIn)) / (1000 * 60 * 60)).toFixed(4) : 0,
        status: storedStatus === 'clocked_out' ? 'Present' : 
                storedStatus === 'clocked_in' ? 'Clocked In' : 'Not Clocked',
        device: { 
          type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          os: navigator.platform,
          browser: navigator.userAgent.split(' ').pop()
        },
        ipAddress: 'Local Storage',
        correctedByAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return null;
  });
  const [showRecentDetails, setShowRecentDetails] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('showRecentDetails') === 'true';
  });
  
  // LocalStorage based clock status
  const [todayStatus, setTodayStatus] = useState(() => {
    // Initialize from localStorage
    const storedDate = localStorage.getItem('attendanceDate');
    const today = new Date().toDateString();
    
    // If it's a new day, reset everything
    if (storedDate !== today) {
      localStorage.setItem('attendanceDate', today);
      localStorage.setItem('clockStatus', 'not_clocked_in');
      localStorage.removeItem('clockInTime');
      localStorage.removeItem('clockOutTime');
      localStorage.removeItem('showRecentDetails');
      return {
        clockedIn: false,
        clockedOut: false,
        clockInTime: null,
        clockOutTime: null
      };
    }
    
    // Return stored status
    return {
      clockedIn: localStorage.getItem('clockStatus') === 'clocked_in',
      clockedOut: localStorage.getItem('clockStatus') === 'clocked_out',
      clockInTime: localStorage.getItem('clockInTime'),
      clockOutTime: localStorage.getItem('clockOutTime')
    };
  });

  // Midnight reset checker
  useEffect(() => {
    const checkMidnightReset = () => {
      const now = new Date();
      const today = now.toDateString();
      const storedDate = localStorage.getItem('attendanceDate');
      
      if (storedDate !== today) {
        // New day, reset everything
        localStorage.setItem('attendanceDate', today);
        localStorage.setItem('clockStatus', 'not_clocked_in');
        localStorage.removeItem('clockInTime');
        localStorage.removeItem('clockOutTime');
        localStorage.removeItem('showRecentDetails');
        
        setTodayStatus({
          clockedIn: false,
          clockedOut: false,
          clockInTime: null,
          clockOutTime: null
        });
        
        setClockDetails(null);
        setShowRecentDetails(false);
        
        fetchSummary(); // Refresh data for new day
      }
    };
    
    // Check every minute for midnight
    const interval = setInterval(checkMidnightReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // ================== Fetch Today's Status ==================
  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const today = new Date().toDateString();
        localStorage.setItem('attendanceDate', today);
        
        // Update localStorage with API data
        if (data.clockedIn) {
          localStorage.setItem('clockStatus', 'clocked_in');
          if (data.attendance?.clockIn) {
            localStorage.setItem('clockInTime', data.attendance.clockIn);
          }
        }
        
        if (data.clockedOut) {
          localStorage.setItem('clockStatus', 'clocked_out');
          if (data.attendance?.clockOut) {
            localStorage.setItem('clockOutTime', data.attendance.clockOut);
          }
        }
        
        setTodayStatus({
          clockedIn: data.clockedIn,
          clockedOut: data.clockedOut,
          clockInTime: data.attendance?.clockIn,
          clockOutTime: data.attendance?.clockOut
        });
      }
    } catch (error) {
      console.error("Failed to fetch today's status:", error);
      // If API fails, keep localStorage status
    }
  };

  // ================== Fetch Attendance Summary ==================
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");
      const query = new URLSearchParams({
        userId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }).toString();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/summary?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        
        // Fetch records for the selected date range
        await fetchAttendanceRecords();
      } else {
        setSummary(null);
        setAttendance([]);
      }
    } catch (err) {
      console.error(err);
      setSummary(null);
      setAttendance([]);
    }
    setLoading(false);
  };

  // ================== Fetch Attendance Records ==================
  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");
      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }).toString();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/records?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.records || []);
      }
    } catch (error) {
      console.error("Failed to fetch attendance records:", error);
      setAttendance([]);
    }
  };

  // ================== Handle Refresh ==================
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // শুধুমাত্র data fetch করুন, clock details reset করবেন না
      await Promise.all([
        fetchTodayStatus(),
        fetchSummary()
      ]);
      
      // যদি clockDetails না থাকে কিন্তু localStorage-এ আছে, তাহলে লোড করুন
      if (!clockDetails) {
        const storedClockIn = localStorage.getItem('clockInTime');
        const storedClockOut = localStorage.getItem('clockOutTime');
        
        if (storedClockIn || storedClockOut) {
          viewStoredDetails();
        }
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================== View Attendance Details ==================
  const handleViewDetails = async (attendanceId) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${attendanceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setClockDetails(data.attendance);
        setShowRecentDetails(true);
        localStorage.setItem('showRecentDetails', 'true');
      } else {
        // If API fails, show mock data for demo
        const mockDetails = {
          _id: attendanceId,
          date: new Date().toISOString(),
          clockIn: "2025-12-29T09:51:31.043Z",
          clockOut: "2025-12-29T09:52:03.835Z",
          totalHours: 0.0091,
          status: "Present",
          device: {
            type: "desktop",
            os: "Windows",
            browser: "Chrome"
          },
          ipAddress: "192.168.1.1",
          correctedByAdmin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setClockDetails(mockDetails);
        setShowRecentDetails(true);
        localStorage.setItem('showRecentDetails', 'true');
      }
    } catch (err) {
      console.error("View details error:", err);
      // Show mock data on error
      const mockDetails = {
        _id: attendanceId,
        date: new Date().toISOString(),
        clockIn: "2025-12-29T09:51:31.043Z",
        clockOut: "2025-12-29T09:52:03.835Z",
        totalHours: 0.0091,
        status: "Present",
        device: {
          type: "desktop",
          os: "Windows",
          browser: "Chrome"
        },
        ipAddress: "192.168.1.1",
        correctedByAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setClockDetails(mockDetails);
      setShowRecentDetails(true);
      localStorage.setItem('showRecentDetails', 'true');
    }
  };

  // ================== View Stored Clock Details ==================
  const viewStoredDetails = () => {
    const storedClockIn = localStorage.getItem('clockInTime');
    const storedClockOut = localStorage.getItem('clockOutTime');
    const storedStatus = localStorage.getItem('clockStatus');
    
    if (storedClockIn || storedClockOut) {
      const mockDetails = {
        _id: "local_storage_" + Date.now(),
        date: new Date().toISOString(),
        clockIn: storedClockIn,
        clockOut: storedClockOut,
        totalHours: storedClockIn && storedClockOut ? 
          ((new Date(storedClockOut) - new Date(storedClockIn)) / (1000 * 60 * 60)).toFixed(4) : 0,
        status: storedStatus === 'clocked_out' ? 'Present' : 
                storedStatus === 'clocked_in' ? 'Clocked In' : 'Not Clocked',
        device: { 
          type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          os: navigator.platform,
          browser: navigator.userAgent.split(' ').pop()
        },
        ipAddress: 'Local Storage',
        correctedByAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setClockDetails(mockDetails);
      setShowRecentDetails(true);
      localStorage.setItem('showRecentDetails', 'true');
    } else {
      alert("No recent clock details found in storage");
    }
  };

  // ================== Toggle Details Visibility ==================
  const toggleDetailsVisibility = () => {
    if (showRecentDetails) {
      // Hide details
      setShowRecentDetails(false);
      localStorage.setItem('showRecentDetails', 'false');
    } else {
      // Show details
      setShowRecentDetails(true);
      localStorage.setItem('showRecentDetails', 'true');
      
      // If no clockDetails but localStorage has data, load it
      if (!clockDetails) {
        viewStoredDetails();
      }
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    fetchSummary();
  }, [dateRange, userId]);

  // ================== Clock In ==================
  const handleClockIn = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");
      const clockInTime = new Date().toISOString();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: clockInTime,
          location: "Office",
          device: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save to localStorage
        const today = new Date().toDateString();
        localStorage.setItem('attendanceDate', today);
        localStorage.setItem('clockStatus', 'clocked_in');
        localStorage.setItem('clockInTime', clockInTime);
        
        // Save clock details
        setClockDetails(data.attendance);
        setShowRecentDetails(true);
        localStorage.setItem('showRecentDetails', 'true');
        
        // Update state
        setTodayStatus({
          clockedIn: true,
          clockedOut: false,
          clockInTime: clockInTime,
          clockOutTime: null
        });
        
        // Show success message with details
        alert(`✓ Clock In successful!\n\nDetails:\nTime: ${new Date(data.attendance.clockIn).toLocaleTimeString()}\nStatus: ${data.attendance.status}\nDevice: ${data.attendance.device.type}\nIP: ${data.attendance.ipAddress}`);
        
        fetchSummary();
      } else {
        alert(data.message || "Failed to clock in");
      }
    } catch (err) {
      console.error("Clock in error:", err);
      alert("Clock In failed. Please try again.");
    }
    setLoading(false);
  };

  // ================== Clock Out ==================
  const handleClockOut = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");
      const clockOutTime = new Date().toISOString();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: clockOutTime,
          location: "Office",
          device: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem('clockStatus', 'clocked_out');
        localStorage.setItem('clockOutTime', clockOutTime);
        
        // Save clock details
        setClockDetails(data.attendance);
        setShowRecentDetails(true);
        localStorage.setItem('showRecentDetails', 'true');
        
        // Update state
        setTodayStatus(prev => ({
          ...prev,
          clockedOut: true,
          clockOutTime: clockOutTime
        }));
        
        // Calculate total hours
        const clockInTime = new Date(data.attendance.clockIn);
        const clockOutTimeDate = new Date(data.attendance.clockOut);
        const totalHours = (clockOutTimeDate - clockInTime) / (1000 * 60 * 60);
        
        // Show success message with details
        alert(`✓ Clock Out successful!\n\nDetails:\nClock In: ${new Date(data.attendance.clockIn).toLocaleTimeString()}\nClock Out: ${new Date(data.attendance.clockOut).toLocaleTimeString()}\nTotal Hours: ${totalHours.toFixed(2)}\nStatus: ${data.attendance.status}\nDevice: ${data.attendance.device.type}\nIP: ${data.attendance.ipAddress}`);
        
        fetchSummary();
      } else {
        alert(data.message || "Failed to clock out");
      }
    } catch (err) {
      console.error("Clock out error:", err);
      alert("Clock Out failed. Please try again.");
    }
    setLoading(false);
  };

  // ================== Admin Correct Attendance ==================
  const handleCorrectAttendance = async (attendanceId) => {
    const clockIn = prompt("Enter new Clock In time (HH:mm, e.g., 09:00)", "09:00"); 
    const clockOut = prompt("Enter new Clock Out time (HH:mm, e.g., 18:00)", "18:00");
    const status = prompt("Enter status (present / absent / leave)", "present");

    if (!attendanceId || (!clockIn && !clockOut && !status)) return;

    try {
      const token = localStorage.getItem("token");
      
      // Create proper date-time strings
      const today = new Date().toISOString().split('T')[0];
      const clockInFull = clockIn ? `${today}T${clockIn}:00` : null;
      const clockOutFull = clockOut ? `${today}T${clockOut}:00` : null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin-correct`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attendanceId,
          clockIn: clockInFull,
          clockOut: clockOutFull,
          status
        })
      });

      const data = await response.json();

      if (response.ok) {
        fetchSummary();
        alert("✓ Attendance corrected successfully!");
      } else {
        alert(data.message || "Failed to correct attendance");
      }
    } catch (err) {
      console.error("Correction error:", err);
      alert("Correction failed. Please try again.");
    }
  };

  // Calculate current time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time nicely
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time from ISO string
  const formatTimeFromISO = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get today's status display
  const getTodayStatusText = () => {
    if (todayStatus.clockedOut) return "Clocked Out";
    if (todayStatus.clockedIn) return "Clocked In";
    return "Not Clocked In";
  };

  // Get today's status color
  const getTodayStatusColor = () => {
    if (todayStatus.clockedOut) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (todayStatus.clockedIn) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Attendance Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage employee attendance with real-time updates</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-xl font-bold text-purple-700">{formatTime(currentTime)}</div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Clock In/Out Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-purple-600" size={24} />
                Today's Attendance
              </h2>
              <p className="text-gray-500 text-sm mt-1">{formatDate(new Date().toISOString())}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClockIn}
                disabled={loading || todayStatus.clockedIn || todayStatus.clockedOut}
                className="group px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Sun size={20} className="group-hover:rotate-12 transition-transform" />
                {todayStatus.clockedIn || todayStatus.clockedOut ? "Clocked In" : "Clock In"}
              </button>
              <button
                onClick={handleClockOut}
                disabled={loading || !todayStatus.clockedIn || todayStatus.clockedOut}
                className="group px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Moon size={20} className="group-hover:rotate-12 transition-transform" />
                {todayStatus.clockedOut ? "Clocked Out" : "Clock Out"}
              </button>
              {/* View Recent Clock Button - Shows when there are details but card is hidden */}
              {clockDetails && !showRecentDetails && (
                <button
                  onClick={toggleDetailsVisibility}
                  className="group relative px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 hover:text-blue-700 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:scale-[1.02] overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/20 group-hover:to-cyan-500/10 transition-all duration-500"></div>
                  
                  {/* Left glow effect */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-2">
                    <Eye size={16} className="group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium"> Recent Details</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </button>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Clock In Status */}
              <div className={`p-4 rounded-xl border ${todayStatus.clockedIn ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className={todayStatus.clockedIn ? "text-green-600" : "text-gray-400"} size={20} />
                    <span className="font-medium text-gray-700">Clock In</span>
                  </div>
                  {todayStatus.clockedIn && (
                    <CheckCircle className="text-green-600" size={20} />
                  )}
                </div>
                <div className="text-sm">
                  {todayStatus.clockedIn ? (
                    <div>
                      <div className="font-semibold text-green-700">✓ Completed</div>
                      <div className="text-green-600 mt-1">
                        {formatTimeFromISO(todayStatus.clockInTime)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">Not clocked in yet</div>
                  )}
                </div>
              </div>

              {/* Clock Out Status */}
              <div className={`p-4 rounded-xl border ${todayStatus.clockedOut ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
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
                      <div className="text-blue-600 mt-1">
                        {formatTimeFromISO(todayStatus.clockOutTime)}
                      </div>
                    </div>
                  ) : todayStatus.clockedIn ? (
                    <div className="text-yellow-600">Waiting to clock out</div>
                  ) : (
                    <div className="text-gray-500">Clock in first</div>
                  )}
                </div>
              </div>

              {/* Daily Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="text-purple-600" size={20} />
                    <span className="font-medium text-gray-700">Daily Status</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTodayStatusColor()}`}>
                    {getTodayStatusText()}
                  </div>
                  <div className="text-gray-500 mt-2 text-xs">
                    Resets daily at midnight
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clock Details Card - Show after clock in/out or when manually opened */}
        {clockDetails && showRecentDetails && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-xl border border-blue-100 mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="text-blue-600" size={24} />
                Recent Clock Details
              </h2>
              <button
                onClick={toggleDetailsVisibility}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg"
              >
                ✕ Hide Details
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Basic Info */}
              <div className="p-4 bg-white rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Date</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(clockDetails.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              {/* Clock In Time */}
              {clockDetails.clockIn && (
                <div className="p-4 bg-white rounded-xl border border-green-100">
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
                </div>
              )}
              
              {/* Clock Out Time */}
              {clockDetails.clockOut && (
                <div className="p-4 bg-white rounded-xl border border-blue-100">
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
                </div>
              )}
              
              {/* Total Hours */}
              {clockDetails.totalHours > 0 && (
                <div className="p-4 bg-white rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Total Hours</span>
                  </div>
                  <div className="text-lg font-semibold text-purple-700">
                    {parseFloat(clockDetails.totalHours).toFixed(4)}
                  </div>
                </div>
              )}
              
              {/* Status */}
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  clockDetails.status === 'Present' ? 'bg-green-100 text-green-800' : 
                  clockDetails.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                  clockDetails.status === 'Clocked In' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {clockDetails.status}
                </div>
              </div>
              
              {/* Device Info */}
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Device</span>
                </div>
                <div className="text-sm text-gray-900">
                  <div>Type: {clockDetails.device?.type || 'Unknown'}</div>
                  <div>OS: {clockDetails.device?.os || 'Unknown'}</div>
                  <div>Browser: {clockDetails.device?.browser || 'Unknown'}</div>
                </div>
              </div>
              
              {/* IP Address */}
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">IP Address</span>
                </div>
                <div className="text-sm font-mono text-gray-900">
                  {clockDetails.ipAddress || 'Unknown'}
                </div>
              </div>
              
              {/* Admin Correction Status */}
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Edit size={16} className="text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Admin Correction</span>
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  clockDetails.correctedByAdmin ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {clockDetails.correctedByAdmin ? 'Corrected' : 'Original'}
                </div>
              </div>
              
              {/* Timestamps */}
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Timestamps</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Created: {new Date(clockDetails.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(clockDetails.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            {/* Raw JSON Button */}
            <div className="mt-4 pt-4 border-t border-blue-100 flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(clockDetails, null, 2));
                  alert('JSON copied to clipboard!');
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 text-sm"
              >
                <FileText size={16} />
                Copy JSON Details
              </button>
              <button
                onClick={viewStoredDetails}
                className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:border-purple-300 transition-all duration-300 flex items-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                Reload from Storage
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Days Present</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.daysPresent || 0}</p>
                <p className="text-xs text-green-500 mt-1 flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  Current month
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
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

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalHours?.toFixed(2) || "0.00"}</p>
                <p className="text-xs text-blue-500 mt-1">Monthly total</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.attendanceRate?.toFixed(1) || "0.0"}%</p>
                <p className="text-xs text-purple-500 mt-1 flex items-center">
                  <Activity size={12} className="mr-1" />
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
          {/* Left Column - Attendance Records */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Attendance Records</h2>
                    <p className="text-gray-500 text-sm">
                      {attendance.length} records found
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) =>
                            setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                          className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) =>
                            setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                          className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                        />
                      </div>
                      <button
                        onClick={fetchSummary}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2"
                      >
                        <Filter size={18} />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading attendance...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Clock In
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Clock Out
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Total Hours
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 px-6 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="text-gray-400" size={32} />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">No attendance records</h3>
                              <p className="text-gray-500 max-w-md">
                                {dateRange.startDate !== new Date().toISOString().split('T')[0] 
                                  ? 'Try adjusting your date range' 
                                  : 'No records for selected period'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        attendance.map((a) => (
                          <tr key={a._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-900">
                                {new Date(a.date).toLocaleDateString('en-US', { 
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(a.date).getFullYear()}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                                <span className="font-medium">
                                  {a.clockIn ? formatTimeFromISO(a.clockIn) : "-"}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <Moon className="w-4 h-4 mr-2 text-indigo-500" />
                                <span className="font-medium">
                                  {a.clockOut ? formatTimeFromISO(a.clockOut) : "-"}
                                </span>
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
                                  onClick={() => handleCorrectAttendance(a._id)}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                  title="Edit Attendance"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleViewDetails(a._id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {attendance.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(attendance.length, 10)} of {attendance.length} records
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      Previous
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                      1
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Attendance Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Attendance Summary</h2>
                <p className="text-gray-500 text-sm mt-1">Detailed overview for selected period</p>
              </div>

              <div className="p-6 space-y-6">
                {summary ? (
                  <>
                    <div className="space-y-4">
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
                        <span className="text-gray-600">Late Arrivals</span>
                        <span className="font-semibold text-yellow-600">{summary.lateArrivals || 0}</span>
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
                        <span className="text-gray-600">Overtime Hours</span>
                        <span className="font-semibold text-yellow-600">{summary.overtimeHours?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>

                    {/* Attendance Rate Progress */}
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
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FileText size={18} className="text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Generate Report</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Printer size={18} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Print Records</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-300 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Share2 size={18} className="text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Share Summary</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-600">No summary data available</p>
                    <p className="text-gray-400 text-sm mt-2">Select a date range to view summary</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}