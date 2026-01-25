"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, Calendar, Filter, Wifi, Server, Network,
  RefreshCw, CheckCircle, XCircle, AlertCircle, Download,
  BarChart3, TrendingUp, Moon, Sun, Zap, ChevronRight,
  Edit, Eye, EyeOff, FileText, Printer, Share2, User,
  Shield, Loader2, LogIn, LogOut, Users, Home, Briefcase,
  Coffee, Activity, ChevronLeft, ChevronRight as ChevronRightIcon,
  Upload, Play, Settings, FileSpreadsheet, CalendarDays,
  Clock4, AlertTriangle, MoreVertical, Search, UserCircle,
  ChevronDown, X, FileEdit, CalendarRange, Layers, Database,
  Save, MapPin, Smartphone, Globe, HardDrive, Battery,
  BatteryCharging, Calendar as CalendarIcon, CalendarCheck,
  CalendarX, CalendarClock, Timer, Clock8, Clock9, Clock10,
  TrendingDown, Percent, Thermometer, Target, Bell, BellOff,
  Lock, Unlock, AlertOctagon, CheckSquare, Square, Clock12,
  RotateCcw, GitPullRequest, GitCommit, GitBranch, Layers2,
  PieChart, LineChart, ScatterChart, Grid, List, Layout,
  Grid3x3, Columns, Rows, Sidebar, Menu, CornerUpRight,
  CornerUpLeft, CornerDownRight, CornerDownLeft, ArrowUpDown,
  ChevronsUpDown, ArrowLeftRight, ArrowRightLeft, ArrowUpCircle,
  ArrowDownCircle, MinusCircle, PlusCircle, DivideCircle,
  Hash, DollarSign, CreditCard, Package, Box, Container,
  Truck, Ship, Plane, Car, Bike, Walk, Run, ActivitySquare,
  ActivityHeart, Heart, HeartPulse, Brain, Cpu, DatabaseZap,
  Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun,
  CloudMoon, SunDim, SunMedium, SunSnow, MoonStar, Sparkles,
  Star, Award, Trophy, Medal, Crown, Flag, Target as TargetIcon,
  Crosshair, Navigation, Compass, Map, MapPinned, Navigation2,
  NavigationOff, Route, Satellite, Globe2, Earth, World,
  WifiOff, Wifi as WifiIcon, Radio, RadioTower, Signal,
  SignalHigh, SignalMedium, SignalLow, SignalZero, BatteryFull,
  BatteryMedium, BatteryLow, BatteryWarning, BatteryChargingIcon,
  Plug, PlugZap, Plug2, Zap as ZapIcon, ZapOff, Lightning,
  Thunderstorm, Hurricane, Tornado, Volcano, Fire, Flame,
  Droplets, Waves, Wind, ThermometerSun, ThermometerSnowflake,
  Thermometer as ThermometerIcon, Waves as WavesIcon,
  Umbrella, CloudFog, CloudDrizzle, CloudHail, CloudSunRain,
  CloudMoonRain, CloudMoonSnow, CloudWind,
  Wind as WindIcon, Snowflake, Cloudy, CloudRainWind, Haze,
  Sunrise, Sunset, Moonrise, Moonset, Telescope, SatelliteDish,
  Orbit, Rocket, Space, UFO, Alien, Ghost, Skull, Cross,
  Church, Mosque, Synagogue, Temple, Castle, Home as HomeIcon,
  Building, Building2, Factory, Warehouse, Store, Shop,
  ShoppingCart, ShoppingBag, Package2, Boxes, Palette,
  Brush, PenTool, Ruler, Scissors, Cut, Combine, Merge,
  Split, Unite, Divide, Minus, Plus, X as XIcon, Divide as DivideIcon,
  Percent as PercentIcon, Infinity, Pi, Sigma, Omega, Alpha,
  Beta, Gamma, Delta, Epsilon, Zeta, Eta, Theta, Iota,
  Kappa, Lambda, Mu, Nu, Xi, Omicron, Rho, Tau, Upsilon,
  Phi, Chi, Psi, Omega as OmegaIcon,
  Smartphone as SmartphoneIcon,
  Monitor,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Camera,
  Video,
  Mic,
  Volume2,
  BellRing,
  Key,
  Mail,
  Phone,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star as StarIcon,
  Heart as HeartIcon,
  Bookmark,
  Share,
  ExternalLink,
  Link,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  UserCheck,
  UserX,
  Users as UsersIcon,
  UserPlus,
  UserMinus,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Crown as CrownIcon,
  Flag as FlagIcon,
  Target as TargetIcon2,
  Crosshair as CrosshairIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Map as MapIcon,
  MapPinned as MapPinnedIcon,
  Satellite as SatelliteIcon,
  Globe as GlobeIcon,
  Cloud as CloudIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  Thermometer as ThermometerIcon2,
  Droplet,
  Wind as WindIcon2,
  CloudLightning as CloudLightningIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  Cloud as CloudIcon2,
  Zap as ZapIcon2,
  Battery as BatteryIcon,
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  Database as DatabaseIcon,
  Server as ServerIcon,
  Wifi as WifiIcon2,
  Radio as RadioIcon,
  Signal as SignalIcon,
  Bluetooth,
  Cctv,
  Router,
  Terminal,
  Code,
  Cpu as CpuIcon2,
  MemoryStick,
  HardDrive as HardDriveIcon2,
  Database as DatabaseIcon2,
  Network as NetworkIcon,
  GitBranch as GitBranchIcon,
  GitCommit as GitCommitIcon,
  GitPullRequest as GitPullRequestIcon,
  GitMerge,
  GitCompare,
  GitFork,
  GitPullRequestClosed,
  GitBranchPlus,
  GitBranchMinus,
  GitCommitVertical,
  GitCompareArrows,
  GitGraph,
  GitMergeVertical,
  GitPullRequestArrow,
  GitPullRequestCreate,
  GitPullRequestDraft
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function AttendanceSystem() {
  const router = useRouter();
  
  // Main state
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Today's status state
  const [todayStatus, setTodayStatus] = useState({
    clockedIn: false,
    clockedOut: false,
    clockInTime: null,
    clockOutTime: null,
    status: "Not Clocked",
    date: new Date().toDateString(),
    shiftDetails: null
  });
  
  // Clock details state
  const [clockDetails, setClockDetails] = useState(null);
  const [showRecentDetails, setShowRecentDetails] = useState(false);
  
  // Device and location info
  const [realIpAddress, setRealIpAddress] = useState("Fetching...");
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    address: "Fetching location...",
    accuracy: null,
    city: null,
    country: null
  });
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'Unknown',
    os: 'Unknown',
    browser: 'Unknown',
    browserVersion: 'Unknown',
    engine: 'Unknown',
    screen: 'Unknown',
    userAgent: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Admin states
  const [showManualAttendanceModal, setShowManualAttendanceModal] = useState(false);
  const [showBulkAttendanceModal, setShowBulkAttendanceModal] = useState(false);
  const [showAdminActionsMenu, setShowAdminActionsMenu] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
  
  // Manual attendance data
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
  
  // Bulk attendance data
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
  
  // Current time and auto clock out timer
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoClockOutTimer, setAutoClockOutTimer] = useState(null);
  
  // View mode
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'grid', 'analytics'
  
  // Enhanced Filters
  const [filters, setFilters] = useState({
    status: 'all',
    employeeId: '',
    department: '',
    date: '',
    month: '',
    year: '',
    search: '',
    lateOnly: false,
    earlyOnly: false,
    showAllEmployees: false // New: টগল করলে সব এমপ্লয়ি দেখাবে
  });
  
  // Shift timing state
  const [shiftTiming, setShiftTiming] = useState({
    start: "09:00",
    end: "18:00",
    lateThreshold: 5,
    earlyThreshold: -1,
    autoClockOutDelay: 10,
    isNightShift: false
  });
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    monthlyData: [],
    weeklyData: [],
    statusDistribution: {}
  });
  
  // ===================== INITIALIZATION =====================
  
  // Initialize component
  useEffect(() => {
    initializeData();
    getDetailedDeviceInfo();
    getUserDetailedLocation();
    getRealIPAddress();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Check auto clock out timer
    const checkAutoClockOut = () => {
      if (todayStatus.clockedIn && !todayStatus.clockedOut && !isAdmin) {
        calculateAutoClockOutTimer();
      }
    };
    
    const autoCheckInterval = setInterval(checkAutoClockOut, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(timer);
      clearInterval(autoCheckInterval);
    };
  }, [todayStatus]);
  
  // ===================== HELPER FUNCTIONS =====================
  
  const getToken = () => {
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("adminToken");
      const employeeToken = localStorage.getItem("employeeToken");
      
      if (adminToken) return { token: adminToken, type: "admin" };
      if (employeeToken) return { token: employeeToken, type: "employee" };
    }
    return null;
  };
  
  const getDetailedDeviceInfo = () => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      const parser = new (require('ua-parser-js'))(userAgent);
      const result = parser.getResult();
      
      let type = 'Unknown';
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      
      if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
        if (screenWidth < 768) type = 'Mobile';
        else type = 'Tablet';
      } else {
        type = 'Desktop';
      }
      
      setDeviceInfo({
        type,
        os: result.os.name || 'Unknown',
        browser: result.browser.name || 'Unknown',
        browserVersion: result.browser.version || 'Unknown',
        engine: result.engine.name || 'Unknown',
        screen: `${screenWidth}x${screenHeight}`,
        userAgent: userAgent.substring(0, 120)
      });
    }
  };
  
  const getUserDetailedLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Try to get address from reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            setUserLocation({
              latitude,
              longitude,
              address: data.display_name || `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
              accuracy,
              city: data.address?.city || data.address?.town || data.address?.village,
              country: data.address?.country
            });
          } catch (error) {
            setUserLocation({
              latitude,
              longitude,
              address: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
              accuracy,
              city: null,
              country: null
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation(prev => ({
            ...prev,
            address: "Location permission denied",
            city: "Unknown",
            country: "Unknown"
          }));
        }
      );
    } else {
      setUserLocation(prev => ({
        ...prev,
        address: "Geolocation not supported"
      }));
    }
  };
  
  const getRealIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setRealIpAddress(data.ip);
      return data.ip;
    } catch (error) {
      console.error("Error getting IP:", error);
      setRealIpAddress("Error Fetching IP");
      return "Unknown";
    }
  };
  
  const calculateAutoClockOutTimer = () => {
    if (!todayStatus.shiftDetails) return;
    
    const now = new Date();
    const [endHour, endMinute] = todayStatus.shiftDetails.end.split(':').map(Number);
    const autoClockOutTime = new Date(now);
    autoClockOutTime.setHours(endHour, endMinute + todayStatus.shiftDetails.autoClockOutDelay, 0, 0);
    
    // If auto clock out is next day (for night shift)
    if (todayStatus.shiftDetails.isNightShift && autoClockOutTime < now) {
      autoClockOutTime.setDate(autoClockOutTime.getDate() + 1);
    }
    
    const diffMs = autoClockOutTime - now;
    
    if (diffMs > 0) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      setAutoClockOutTimer({
        hours,
        minutes: remainingMinutes,
        totalMinutes: minutes,
        autoClockOutTime: autoClockOutTime.toLocaleTimeString()
      });
    } else {
      setAutoClockOutTimer(null);
    }
  };
  
  // ===================== DATA FETCHING =====================
  
  const initializeData = async () => {
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo) {
        router.push("/login");
        return;
      }
      
      // Fetch user profile
      const endpoint = tokenInfo.type === "admin" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/getAdminProfile`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/getProfile`;
      
      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${tokenInfo.token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        
        setUserRole(tokenInfo.type);
        setIsAdmin(tokenInfo.type === "admin");
        setUserData(userData);
        
        // Fetch today's status and shift timing for employees
        if (tokenInfo.type === "employee") {
          await fetchTodayStatus();
          await fetchShiftTiming();
        }
        
        // Fetch attendance data
        await fetchAttendanceData();
        
        // Fetch analytics if needed
        if (viewMode === 'analytics') {
          await fetchAnalytics();
        }
      }
    } catch (error) {
      console.error("Initialize data error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTodayStatus = async () => {
    try {
      const tokenInfo = getToken();
      if (!tokenInfo || tokenInfo.type !== "employee") return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/today-status`, {
        headers: { 
          Authorization: `Bearer ${tokenInfo.token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodayStatus({
          clockedIn: data.clockedIn || false,
          clockedOut: data.clockedOut || false,
          clockInTime: data.attendance?.clockIn || null,
          clockOutTime: data.attendance?.clockOut || null,
          status: data.attendance?.status || "Not Clocked",
          date: new Date().toDateString(),
          shiftDetails: data.shiftDetails,
          dayStatus: data.dayStatus
        });
        
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
        
        // Calculate auto clock out timer
        if (data.clockedIn && !data.clockedOut && data.shiftDetails) {
          calculateAutoClockOutTimer();
        }
      }
    } catch (error) {
      console.error("Failed to fetch today's status:", error);
    }
  };
  
  const fetchShiftTiming = async () => {
    try {
      const tokenInfo = getToken();
      if (!tokenInfo || tokenInfo.type !== "employee") return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/shift-timing`, {
        headers: { 
          Authorization: `Bearer ${tokenInfo.token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.shiftTiming) {
          setShiftTiming(data.data.shiftTiming);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shift timing:", error);
    }
  };
  
  const fetchAttendanceData = async () => {
    try {
      const tokenInfo = getToken();
      if (!tokenInfo) return;
      
      // Build query parameters
      const queryParams = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Add filters for admin
      if (isAdmin) {
        // If showAllEmployees is true, don't filter by employeeId
        if (!filters.showAllEmployees && filters.employeeId) {
          queryParams.employeeId = filters.employeeId;
        }
      }
      
      // Add other filters
      if (filters.status !== 'all') queryParams.status = filters.status;
      if (filters.date) queryParams.date = filters.date;
      if (filters.month) queryParams.month = filters.month;
      if (filters.year) queryParams.year = filters.year;
      if (filters.search) queryParams.search = filters.search;
      if (filters.lateOnly) queryParams.lateOnly = true;
      if (filters.earlyOnly) queryParams.earlyOnly = true;
      
      const query = new URLSearchParams(queryParams).toString();
      
      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/all-records?${query}`
        : `${process.env.NEXT_PUBLIC_API_URL}/records?${query}`;
      
      console.log("Fetching from:", endpoint); // Debugging
      
      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${tokenInfo.token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Attendance data received:", data); // Debugging
        
        // Handle both array and object response formats
        let records = [];
        if (Array.isArray(data)) {
          records = data;
          setTotalRecords(data.length);
        } else if (data.records) {
          records = data.records;
          setTotalRecords(data.total || data.records.length || 0);
        } else if (data.data?.records) {
          records = data.data.records;
          setTotalRecords(data.data.total || data.data.records.length || 0);
        } else {
          records = data;
          setTotalRecords(data.length || 0);
        }
        
        setAttendance(records);
        
        // Also fetch summary
        await fetchSummary();
      } else {
        const error = await response.json();
        console.error("API Error:", error);
        setAttendance([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Fetch attendance error:", error);
      setAttendance([]);
      setTotalRecords(0);
    }
  };
  
  const fetchSummary = async () => {
    try {
      const tokenInfo = getToken();
      if (!tokenInfo) return;
      
      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(isAdmin && filters.employeeId && !filters.showAllEmployees && { employeeId: filters.employeeId })
      }).toString();
      
      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/summary?${query}`
        : `${process.env.NEXT_PUBLIC_API_URL}/attendance/summary?${query}`;
      
      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${tokenInfo.token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary || data);
      }
    } catch (error) {
      console.error("Fetch summary error:", error);
      setSummary(null);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      const tokenInfo = getToken();
      if (!tokenInfo) return;
      
      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(isAdmin && filters.employeeId && !filters.showAllEmployees && { employeeId: filters.employeeId })
      }).toString();
      
      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/analytics?${query}`
        : `${process.env.NEXT_PUBLIC_API_URL}/attendance/analytics?${query}`;
      
      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${tokenInfo.token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || data.data?.analytics || {});
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
    }
  };
  
  const fetchEmployees = async () => {
    if (!isAdmin) return;
    
    try {
      const tokenInfo = getToken();
      if (!tokenInfo) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getAll-user`, {
        headers: { 
          Authorization: `Bearer ${tokenInfo.token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const employeesArray = Array.isArray(data) ? data : 
                              data.users || data.data || data.employees || [];
        
        const validEmployees = employeesArray
          .filter(emp => emp && typeof emp === 'object')
          .map(emp => ({
            _id: emp._id || emp.id || '',
            firstName: emp.firstName || emp.first_name || emp.name?.split(' ')[0] || '',
            lastName: emp.lastName || emp.last_name || emp.name?.split(' ').slice(1).join(' ') || '',
            email: emp.email || '',
            employeeId: emp.employeeId || emp.employee_id || emp._id?.slice(-6) || '',
            department: emp.department || emp.department_name || 'No Department',
            position: emp.position || emp.job_title || '',
            status: emp.status || 'active',
            phone: emp.phone || '',
            profileImage: emp.profileImage || ''
          }))
          .filter(emp => emp._id);
        
        setEmployees(validEmployees);
      }
    } catch (error) {
      console.error("Fetch employees error:", error);
      setEmployees([]);
    }
  };
  
  // ===================== ATTENDANCE ACTIONS =====================
  
  const handleClockIn = async () => {
    if (userRole !== "employee") {
      toast.error("Only employees can clock in");
      return;
    }
    
    // Check if already clocked in
    if (todayStatus.clockedIn) {
      toast.error("Already clocked in today");
      return;
    }
    
    // Check if it's a working day
    if (todayStatus.dayStatus && !todayStatus.dayStatus.isWorkingDay) {
      toast.error(`Cannot clock in on ${todayStatus.dayStatus.status}`);
      return;
    }
    
    // Check if before shift start (1 hour before shift start)
    const now = new Date();
    const [shiftHour, shiftMinute] = shiftTiming.start.split(':').map(Number);
    const shiftStartTime = new Date(now);
    shiftStartTime.setHours(shiftHour, shiftMinute, 0, 0);
    const oneHourBeforeShift = new Date(shiftStartTime);
    oneHourBeforeShift.setHours(shiftHour - 1, shiftMinute, 0, 0);
    
    if (now < oneHourBeforeShift) {
      toast.error(`Clock in available from ${oneHourBeforeShift.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
      return;
    }
    
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenInfo.token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: userLocation.address,
          ipAddress: realIpAddress,
          device: deviceInfo
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Calculate late/early
        const clockInTime = new Date();
        const [shiftStartHour, shiftStartMinute] = shiftTiming.start.split(':').map(Number);
        const shiftStart = new Date(clockInTime);
        shiftStart.setHours(shiftStartHour, shiftStartMinute, 0, 0);
        
        const diffMinutes = Math.round((clockInTime - shiftStart) / (1000 * 60));
        let message = `Clocked in successfully!`;
        
        if (diffMinutes > shiftTiming.lateThreshold) {
          const lateMinutes = diffMinutes - shiftTiming.lateThreshold;
          message += ` ${lateMinutes} minutes late`;
        } else if (diffMinutes < shiftTiming.earlyThreshold) {
          const earlyMinutes = Math.abs(diffMinutes - shiftTiming.earlyThreshold);
          message += ` ${earlyMinutes} minutes early`;
        }
        
        toast.success(message);
        await fetchTodayStatus();
        await fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to clock in");
      }
    } catch (error) {
      console.error("Clock in error:", error);
      toast.error("Clock in failed");
    } finally {
      setLoading(false);
    }
  };
  
  const handleClockOut = async () => {
    if (userRole !== "employee") {
      toast.error("Only employees can clock out");
      return;
    }
    
    if (!todayStatus.clockedIn || todayStatus.clockedOut) {
      toast.error("Clock in first or already clocked out");
      return;
    }
    
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenInfo.token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: userLocation.address,
          ipAddress: realIpAddress,
          device: deviceInfo
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Clocked out successfully!`);
        await fetchTodayStatus();
        await fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to clock out");
      }
    } catch (error) {
      console.error("Clock out error:", error);
      toast.error("Clock out failed");
    } finally {
      setLoading(false);
    }
  };
  
  // ===================== ADMIN FUNCTIONS =====================
  
  const handleCreateManualAttendance = async () => {
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo || !isAdmin) {
        toast.error("Admin access required");
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenInfo.token}`
        },
        body: JSON.stringify(manualAttendanceData)
      });
      
      if (response.ok) {
        toast.success("Manual attendance created!");
        setShowManualAttendanceModal(false);
        await fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create manual attendance");
      }
    } catch (error) {
      console.error("Create manual attendance error:", error);
      toast.error("Failed to create manual attendance");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateBulkAttendance = async () => {
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo || !isAdmin) {
        toast.error("Admin access required");
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/bulk-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenInfo.token}`
        },
        body: JSON.stringify(bulkAttendanceData)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Bulk attendance created: ${data.results?.created || 0} records`);
        setShowBulkAttendanceModal(false);
        await fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create bulk attendance");
      }
    } catch (error) {
      console.error("Create bulk attendance error:", error);
      toast.error("Failed to create bulk attendance");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCorrectAttendance = async (recordId, updatedData) => {
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo || !isAdmin) {
        toast.error("Admin access required");
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/correct/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenInfo.token}`
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        toast.success("Attendance corrected!");
        setSelectedAttendanceRecord(null);
        await fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to correct attendance");
      }
    } catch (error) {
      console.error("Correct attendance error:", error);
      toast.error("Failed to correct attendance");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateShift = async (employeeId, shiftData) => {
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo || !isAdmin) {
        toast.error("Admin access required");
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/update-shift`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenInfo.token}`
        },
        body: JSON.stringify({
          employeeId,
          ...shiftData
        })
      });
      
      if (response.ok) {
        toast.success("Shift updated!");
        await fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update shift");
      }
    } catch (error) {
      console.error("Update shift error:", error);
      toast.error("Failed to update shift");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTriggerAutoClockOut = async () => {
    setLoading(true);
    try {
      const tokenInfo = getToken();
      if (!tokenInfo || !isAdmin) {
        toast.error("Admin access required");
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/trigger-auto-clockout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenInfo.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Auto clock out triggered: ${data.results?.autoClockOuts || 0} employees`);
        await fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to trigger auto clock out");
      }
    } catch (error) {
      console.error("Trigger auto clock out error:", error);
      toast.error("Failed to trigger auto clock out");
    } finally {
      setLoading(false);
    }
  };
  
  // ===================== UTILITY FUNCTIONS =====================
  
  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDateShort = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getStatusColor = (status) => {
    const statusMap = {
      'Present': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
      'Absent': 'bg-gradient-to-r from-rose-600 to-pink-600 text-white',
      'Leave': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'Late': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      'Early': 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
      'Govt Holiday': 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
      'Weekly Off': 'bg-gradient-to-r from-slate-500 to-gray-600 text-white',
      'Off Day': 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
      'Half Day': 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
      'Unpaid Leave': 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
      'Half Paid Leave': 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white',
      'Clocked In': 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white',
      'Not Clocked': 'bg-gradient-to-r from-slate-400 to-gray-500 text-white'
    };
    return statusMap[status] || 'bg-gradient-to-r from-gray-400 to-slate-500 text-white';
  };
  
  const getStatusIcon = (status) => {
    const iconMap = {
      'Present': CheckCircle,
      'Absent': XCircle,
      'Leave': CalendarX,
      'Late': Clock,
      'Early': TrendingDown,
      'Govt Holiday': Calendar,
      'Weekly Off': CalendarDays,
      'Off Day': CalendarRange,
      'Half Day': Clock12,
      'Clocked In': LogIn,
      'Not Clocked': Clock
    };
    return iconMap[status] || AlertCircle;
  };
  
  const calculateLateEarlyMinutes = (clockInTime, shiftStart) => {
    if (!clockInTime || !shiftStart) return { isLate: false, isEarly: false, minutes: 0, details: '' };
    
    const clockIn = new Date(clockInTime);
    const [shiftHour, shiftMinute] = shiftStart.split(':').map(Number);
    const shiftTime = new Date(clockIn);
    shiftTime.setHours(shiftHour, shiftMinute, 0, 0);
    
    const diffMinutes = Math.round((clockIn - shiftTime) / (1000 * 60));
    
    if (diffMinutes > 5) { // 5 minutes after shift start is late
      const lateMinutes = diffMinutes - 5;
      const hours = Math.floor(lateMinutes / 60);
      const minutes = lateMinutes % 60;
      let details = '';
      if (hours > 0) details = `${hours}h ${minutes}m late`;
      else details = `${minutes}m late`;
      
      return { isLate: true, isEarly: false, minutes: lateMinutes, details };
    } else if (diffMinutes < -1) { // 1 minute before shift start is early
      const earlyMinutes = Math.abs(diffMinutes + 1);
      const hours = Math.floor(earlyMinutes / 60);
      const minutes = earlyMinutes % 60;
      let details = '';
      if (hours > 0) details = `${hours}h ${minutes}m early`;
      else details = `${minutes}m early`;
      
      return { isLate: false, isEarly: true, minutes: earlyMinutes, details };
    }
    
    return { isLate: false, isEarly: false, minutes: 0, details: 'On time' };
  };
  
  const getDeviceIcon = (deviceType) => {
    switch(deviceType?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      case 'laptop': return Laptop;
      default: return Smartphone;
    }
  };
  
  const getBrowserIcon = (browser) => {
    switch(browser?.toLowerCase()) {
      case 'chrome': return Globe;
      case 'firefox': return Flame;
      case 'safari': return Compass;
      case 'edge': return Navigation;
      default: return Globe;
    }
  };
  
  // Pagination
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchAttendanceData();
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      fetchAttendanceData();
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      fetchAttendanceData();
    }
  };
  
  // Filter functions
  const applyFilters = () => {
    setCurrentPage(1);
    fetchAttendanceData();
  };
  
  const clearFilters = () => {
    setFilters({
      status: 'all',
      employeeId: '',
      department: '',
      date: '',
      month: '',
      year: '',
      search: '',
      lateOnly: false,
      earlyOnly: false,
      showAllEmployees: false
    });
    setCurrentPage(1);
    fetchAttendanceData();
  };
  
  // Filter by specific date
  const handleDateFilter = (date) => {
    setFilters(prev => ({ 
      ...prev, 
      date: date,
      month: '',
      year: '',
      showAllEmployees: false 
    }));
    setCurrentPage(1);
  };
  
  // Filter by month and year
  const handleMonthYearFilter = (month, year) => {
    setFilters(prev => ({ 
      ...prev, 
      month, 
      year,
      date: '',
      showAllEmployees: false 
    }));
    setCurrentPage(1);
  };
  
  // Toggle show all employees
  const toggleShowAllEmployees = () => {
    setFilters(prev => ({ 
      ...prev, 
      showAllEmployees: !prev.showAllEmployees,
      employeeId: !prev.showAllEmployees ? '' : prev.employeeId 
    }));
    setCurrentPage(1);
  };
  
  // ===================== RENDER COMPONENTS =====================
  
  if (loading && !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse mx-auto mb-4"></div>
            <Loader2 className="w-16 h-16 animate-spin text-white absolute top-4 left-4" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading Attendance System...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we set up your dashboard</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      
      {/* Enhanced System Info Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 rounded-2xl p-4 mb-6 shadow-xl border border-purple-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Server className="text-white" size={24} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-purple-200">System Status - Live Monitoring</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-white">
                    IP: <span className="font-mono text-purple-200">{realIpAddress}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-pink-300" />
                  <span className="text-xs text-white">
                    {userLocation.city || userLocation.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const DeviceIcon = getDeviceIcon(deviceInfo.type);
                    return <DeviceIcon size={12} className="text-blue-300" />;
                  })()}
                  <span className="text-xs text-white">
                    {deviceInfo.type} • {deviceInfo.os}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const BrowserIcon = getBrowserIcon(deviceInfo.browser);
                    return <BrowserIcon size={12} className="text-cyan-300" />;
                  })()}
                  <span className="text-xs text-white">
                    {deviceInfo.browser} {deviceInfo.browserVersion}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <div className="text-xs text-purple-200 font-medium">Current Time</div>
              <div className="text-xl font-bold text-white bg-black/20 px-3 py-1 rounded-lg">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-purple-300 mt-1">
                {formatDate(currentTime.toISOString())}
              </div>
            </div>
            
            <button
              onClick={() => {
                getRealIPAddress();
                getUserDetailedLocation();
                getDetailedDeviceInfo();
                fetchAttendanceData();
                toast.success("System refreshed!");
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Attendance Management System
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isAdmin ? "👑 Admin Dashboard - Manage all employee attendance" : "📊 Track and manage your attendance"}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm text-purple-700 flex items-center gap-1">
                  <UserCircle size={14} />
                  <span>{userData?.firstName} {userData?.lastName}</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full text-sm text-blue-700 flex items-center gap-1">
                  <Briefcase size={14} />
                  <span>{userData?.department || "No Department"}</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full text-sm text-emerald-700 flex items-center gap-1">
                  <Target size={14} />
                  <span>{userData?.employeeId || "No ID"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              {!isAdmin && (
                <div className="bg-gradient-to-r from-white to-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{formatTime(currentTime)}</div>
                      <div className="text-xs text-gray-500">{formatDateShort(new Date().toISOString())}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-3 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
                  title="Print Report"
                >
                  <Printer size={20} className="text-purple-600" />
                </button>
                
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchAttendanceData().finally(() => setLoading(false));
                  }}
                  disabled={loading}
                  className="p-3 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors shadow-sm disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw size={20} className={`text-purple-600 ${loading ? "animate-spin" : ""}`} />
                </button>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminActionsMenu(!showAdminActionsMenu)}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2 hover:shadow-xl"
                  >
                    <MoreVertical size={20} />
                    <span className="font-semibold">Admin Actions</span>
                    <ChevronDown size={16} className={`transition-transform ${showAdminActionsMenu ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Admin Actions Menu */}
          {showAdminActionsMenu && isAdmin && (
            <div className="absolute right-6 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-purple-200 z-50 overflow-hidden">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-purple-100">
                  <div className="text-sm font-semibold text-purple-900">Quick Actions</div>
                  <div className="text-xs text-gray-500">Manage attendance records</div>
                </div>
                
                <div className="space-y-1 mt-2">
                  <button
                    onClick={() => {
                      fetchEmployees();
                      setShowManualAttendanceModal(true);
                      setShowAdminActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200">
                      <PlusCircle className="text-purple-600" size={18} />
                    </div>
                    <span className="font-medium">Manual Attendance</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      fetchEmployees();
                      setShowBulkAttendanceModal(true);
                      setShowAdminActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200">
                      <FileSpreadsheet className="text-purple-600" size={18} />
                    </div>
                    <span className="font-medium">Bulk Attendance</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleTriggerAutoClockOut();
                      setShowAdminActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200">
                      <Clock4 className="text-purple-600" size={18} />
                    </div>
                    <span className="font-medium">Trigger Auto Clock Out</span>
                  </button>
                  
                  <div className="border-t border-purple-100 my-2"></div>
                  
                  <button
                    onClick={() => {
                      fetchEmployees();
                      toast.success("Employees list refreshed!");
                      setShowAdminActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200">
                      <RefreshCw className="text-purple-600" size={18} />
                    </div>
                    <span className="font-medium">Refresh Employees</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Export function implementation
                      toast.success("Export feature coming soon!");
                      setShowAdminActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200">
                      <Download className="text-purple-600" size={18} />
                    </div>
                    <span className="font-medium">Export Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Clock In/Out Section (Employees Only) */}
        {!isAdmin && (
          <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 relative z-10">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Today's Attendance</h2>
                    <p className="text-gray-500 text-sm">
                      {formatDate(new Date().toISOString())}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-purple-500" />
                    <span className="font-medium">Location:</span>
                    <span>{userLocation.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      {(() => {
                        const DeviceIcon = getDeviceIcon(deviceInfo.type);
                        return <DeviceIcon size={16} className="text-blue-500" />;
                      })()}
                      <span className="font-medium">Device:</span>
                      <span>{deviceInfo.type} ({deviceInfo.os})</span>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      {(() => {
                        const BrowserIcon = getBrowserIcon(deviceInfo.browser);
                        return <BrowserIcon size={16} className="text-green-500" />;
                      })()}
                      <span className="font-medium">Browser:</span>
                      <span>{deviceInfo.browser}</span>
                    </div>
                  </div>
                  {todayStatus.shiftDetails && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-amber-500" />
                      <span className="font-medium">Shift:</span>
                      <span>{todayStatus.shiftDetails.start} - {todayStatus.shiftDetails.end}</span>
                      {todayStatus.shiftDetails.isNightShift && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">🌙 Night Shift</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 relative z-10">
                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-2 transition-all ${todayStatus.clockedIn ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${todayStatus.clockedIn ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-100'}`}>
                        <Sun className={todayStatus.clockedIn ? "text-white" : "text-gray-400"} size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Clock In</div>
                        <div className="mt-1">
                          {todayStatus.clockedIn ? (
                            <div className="text-green-700 font-bold text-lg">
                              {formatTime(todayStatus.clockInTime)}
                            </div>
                          ) : (
                            <div className="text-gray-500">Not yet</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border-2 transition-all ${todayStatus.clockedOut ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${todayStatus.clockedOut ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-100'}`}>
                        <Moon className={todayStatus.clockedOut ? "text-white" : "text-gray-400"} size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Clock Out</div>
                        <div className="mt-1">
                          {todayStatus.clockedOut ? (
                            <div className="text-blue-700 font-bold text-lg">
                              {formatTime(todayStatus.clockOutTime)}
                            </div>
                          ) : (
                            <div className="text-gray-500">Pending</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleClockIn}
                    disabled={todayStatus.clockedIn || loading || (todayStatus.dayStatus && !todayStatus.dayStatus.isWorkingDay)}
                    className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg ${
                      todayStatus.clockedIn
                        ? 'bg-gradient-to-r from-gray-300 to-slate-300 text-gray-500 cursor-not-allowed'
                        : (todayStatus.dayStatus && !todayStatus.dayStatus.isWorkingDay)
                        ? 'bg-gradient-to-r from-gray-300 to-slate-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-[1.02]'
                    }`}
                  >
                    <LogIn size={24} />
                    {todayStatus.clockedIn ? "✅ Clocked In" : "⏰ Clock In"}
                  </button>
                  
                  <button
                    onClick={handleClockOut}
                    disabled={!todayStatus.clockedIn || todayStatus.clockedOut || loading}
                    className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg ${
                      !todayStatus.clockedIn || todayStatus.clockedOut
                        ? 'bg-gradient-to-r from-gray-300 to-slate-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02]'
                    }`}
                  >
                    <LogOut size={24} />
                    {todayStatus.clockedOut ? "✅ Clocked Out" : "🚪 Clock Out"}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Status Message and Auto Clock Out Timer */}
            <div className="mt-6 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${getStatusColor(todayStatus.status)}`}>
                    {(() => {
                      const StatusIcon = getStatusIcon(todayStatus.status);
                      return <StatusIcon size={16} className="mr-2" />;
                    })()}
                    {todayStatus.status === "Not Clocked" ? "🟡 Ready to Clock In" : `📊 Status: ${todayStatus.status}`}
                  </div>
                  
                  {autoClockOutTimer && todayStatus.clockedIn && !todayStatus.clockedOut && (
                    <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Timer size={16} className="text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Auto Clock Out:</span>
                        <span className="text-lg font-bold text-amber-900">
                          {autoClockOutTimer.hours > 0 ? `${autoClockOutTimer.hours}h ` : ''}
                          {autoClockOutTimer.minutes}m
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Auto Operations Info */}
                <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-full">
                    <AlertTriangle size={14} className="text-purple-500" />
                    <span className="font-medium text-purple-700">Late:</span>
                    <span className="text-gray-700">After {shiftTiming.lateThreshold} mins</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                    <TrendingDown size={14} className="text-green-500" />
                    <span className="font-medium text-green-700">Early:</span>
                    <span className="text-gray-700">Before {Math.abs(shiftTiming.earlyThreshold)} mins</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full">
                    <Clock4 size={14} className="text-red-500" />
                    <span className="font-medium text-red-700">Auto Out:</span>
                    <span className="text-gray-700">{shiftTiming.autoClockOutDelay} mins after shift</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Stats (Admin Only) */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalEmployees || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Active</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-green-50 border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Present Today</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{summary?.presentToday || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary?.totalEmployees ? `${Math.round((summary.presentToday / summary.totalEmployees) * 100)}%` : '0%'} attendance
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-red-50 border border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Absent Today</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{summary?.absentToday || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary?.totalEmployees ? `${Math.round((summary.absentToday / summary.totalEmployees) * 100)}%` : '0%'} absent rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="text-white" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Clock Out</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{summary?.pendingClockOut || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Will auto clock out</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Filters and Controls */}
        <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter className="text-purple-600" size={24} />
                Attendance Records
              </h2>
              <p className="text-gray-500 text-sm">
                {isAdmin ? "All employee records with advanced filtering" : "Your attendance history with detailed analysis"}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-1 border border-purple-200">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  <List size={18} />
                  <span className="text-sm font-medium">List</span>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Calendar</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  <Grid size={18} />
                  <span className="text-sm font-medium">Grid</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('analytics');
                    fetchAnalytics();
                  }}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'analytics' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  <BarChart3 size={18} />
                  <span className="text-sm font-medium">Analytics</span>
                </button>
              </div>
              
              {/* Date Range */}
              <div className="flex gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={16} />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="pl-10 pr-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={16} />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="pl-10 pr-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchAttendanceData();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 shadow-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Filters - আরও উন্নত ফিল্টারিং */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="Present">✅ Present</option>
                  <option value="Absent">❌ Absent</option>
                  <option value="Late">⏰ Late</option>
                  <option value="Early">⬇️ Early</option>
                  <option value="Leave">🏖️ Leave</option>
                  <option value="Govt Holiday">🎉 Govt Holiday</option>
                  <option value="Weekly Off">📅 Weekly Off</option>
                  <option value="Off Day">🌴 Off Day</option>
                  <option value="Clocked In">🟡 Clocked In</option>
                </select>
              </div>
              
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Filter</label>
                  <select
                    value={filters.employeeId}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      employeeId: e.target.value,
                      showAllEmployees: false 
                    }))}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={16} />
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleDateFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={16} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search records..."
                    className="w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Month and Year Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleMonthYearFilter(e.target.value, filters.year || new Date().getFullYear())}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleMonthYearFilter(filters.month || '', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">All Years</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col justify-end">
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showAllEmployees"
                      checked={filters.showAllEmployees}
                      onChange={toggleShowAllEmployees}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="showAllEmployees" className="text-sm text-gray-700">
                      Show all employees together
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lateOnly"
                  checked={filters.lateOnly}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    lateOnly: e.target.checked, 
                    earlyOnly: false 
                  }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="lateOnly" className="text-sm text-gray-700">
                  Show only Late records
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="earlyOnly"
                  checked={filters.earlyOnly}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    earlyOnly: e.target.checked, 
                    lateOnly: false 
                  }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="earlyOnly" className="text-sm text-gray-700">
                  Show only Early records
                </label>
              </div>
              
              <div className="flex-1"></div>
              
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium shadow-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(filters.status !== 'all' || filters.date || filters.month || filters.year || filters.search || filters.lateOnly || filters.earlyOnly || (isAdmin && filters.employeeId && !filters.showAllEmployees)) && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">Active Filters:</div>
                <div className="flex flex-wrap gap-2">
                  {filters.status !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Status: {filters.status}
                    </span>
                  )}
                  {filters.date && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Date: {new Date(filters.date).toLocaleDateString()}
                    </span>
                  )}
                  {filters.month && filters.year && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {new Date(2000, parseInt(filters.month)-1, 1).toLocaleString('default', { month: 'long' })} {filters.year}
                    </span>
                  )}
                  {filters.search && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.lateOnly && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      Late Only
                    </span>
                  )}
                  {filters.earlyOnly && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Early Only
                    </span>
                  )}
                  {isAdmin && filters.employeeId && !filters.showAllEmployees && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                      Employee: {employees.find(e => e._id === filters.employeeId)?.firstName || 'Selected'}
                    </span>
                  )}
                  {isAdmin && filters.showAllEmployees && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                      Showing All Employees
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Attendance Records Section */}
        <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-purple-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewMode === 'list' ? '📋 List View' : 
                   viewMode === 'calendar' ? '📅 Calendar View' : 
                   viewMode === 'grid' ? '🟦 Grid View' : 
                   '📊 Analytics View'}
                </h3>
                <p className="text-sm text-gray-500">
                  Showing {attendance.length} of {totalRecords} records
                  {filters.status !== 'all' && ` • Filtered by: ${filters.status}`}
                  {filters.lateOnly && ' • Showing only Late records'}
                  {filters.earlyOnly && ' • Showing only Early records'}
                  {isAdmin && filters.showAllEmployees && ' • Showing all employees together'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  Page <span className="font-bold text-purple-700">{currentPage}</span> of <span className="font-bold text-purple-700">{totalPages}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-50 transition-colors"
                  >
                    <ChevronLeft size={18} className="text-purple-600" />
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-50 transition-colors"
                  >
                    <ChevronRightIcon size={18} className="text-purple-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mx-auto mb-4"></div>
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 absolute top-4 left-1/2 transform -translate-x-1/2" />
              </div>
              <p className="text-gray-600 font-medium">Loading records...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the data</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-purple-400" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500">No attendance records for the selected filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* Enhanced List View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-purple-900">📅 Date & Day</th>
                    {isAdmin && (
                      <th className="py-4 px-4 text-left text-sm font-semibold text-purple-900">👤 Employee</th>
                    )}
                    <th className="py-4 px-4 text-left text-sm font-semibold text-purple-900">⏰ Clock In</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-purple-900">🚪 Clock Out</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-purple-900">⏱️ Total Hours</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-purple-900">📊 Status</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-purple-900">🔧 Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {attendance.map((record) => {
                    const lateEarly = calculateLateEarlyMinutes(record.clockIn, record.shift?.start);
                    const StatusIcon = getStatusIcon(record.status);
                    const date = new Date(record.date);
                    
                    return (
                      <tr key={record._id} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-colors group">
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-900">{formatDateShort(record.date)}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                          {record.autoGenerated && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                              <Database size={10} />
                              Auto-generated
                            </div>
                          )}
                          {record.markedAbsent && (
                            <div className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                              <AlertOctagon size={10} />
                              Auto-marked absent
                            </div>
                          )}
                        </td>
                        
                        {isAdmin && record.employee && (
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {record.employee.firstName?.[0]}{record.employee.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {record.employee.firstName} {record.employee.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {record.employee.employeeId} • {record.employee.department}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-center">
                              <Sun size={20} className="text-amber-600" />
                            </div>
                            <div>
                              <div className={`font-bold text-lg ${
                                lateEarly.isLate ? 'text-red-600' :
                                lateEarly.isEarly ? 'text-green-600' :
                                'text-gray-900'
                              }`}>
                                {formatTime(record.clockIn)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Shift: {record.shift?.start || '09:00'}
                              </div>
                              {lateEarly.isLate && (
                                <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full mt-1">
                                  ⏰ {lateEarly.details}
                                </div>
                              )}
                              {lateEarly.isEarly && (
                                <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                  ⬇️ {lateEarly.details}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-center">
                              <Moon size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold text-lg text-gray-900">
                                {formatTime(record.clockOut)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Shift: {record.shift?.end || '18:00'}
                              </div>
                              {record.autoClockOut && (
                                <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                                  🤖 Auto clocked out
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="font-bold text-xl text-purple-700">
                            {record.totalHours?.toFixed(2) || "0.00"} hrs
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.shift?.isNightShift && (
                              <span className="text-purple-600">🌙 Night Shift</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(record.status)}`}>
                              <StatusIcon size={14} className="mr-2" />
                              {record.status}
                            </div>
                            <div className="text-xs space-y-1">
                              {record.remarks && (
                                <div className="text-gray-600 truncate max-w-[150px]" title={record.remarks}>
                                  💬 {record.remarks}
                                </div>
                              )}
                              {record.correctedByAdmin && (
                                <div className="text-purple-600 flex items-center gap-1">
                                  <Edit size={10} />
                                  Admin corrected
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setClockDetails(record);
                                setShowRecentDetails(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => setSelectedAttendanceRecord(record)}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors group"
                                  title="Edit Record"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleUpdateShift(record.employee?._id, record.shift)}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group"
                                  title="Update Shift"
                                >
                                  <Settings size={18} />
                                </button>
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
          ) : viewMode === 'calendar' ? (
            /* Enhanced Calendar View */
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {/* Calendar Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-bold text-purple-900 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {Array.from({ length: 42 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - 21 + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayRecords = attendance.filter(r => 
                    new Date(r.date).toISOString().split('T')[0] === dateStr
                  );
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <div key={i} className={`min-h-32 border rounded-xl p-3 transition-all hover:shadow-md ${
                      isToday 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                        : isWeekend
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-purple-100 bg-white'
                    }`}>
                      <div className={`flex justify-between items-center mb-2 ${
                        isToday ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        <div className={`font-bold ${isToday ? 'text-lg' : ''}`}>{date.getDate()}</div>
                        {isToday && (
                          <div className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            Today
                          </div>
                        )}
                      </div>
                      {dayRecords.map(record => {
                        const StatusIcon = getStatusIcon(record.status);
                        return (
                          <div key={record._id} className="mt-2">
                            <div className={`text-xs px-2 py-1.5 rounded flex items-center gap-1 ${getStatusColor(record.status)}`}>
                              <StatusIcon size={10} />
                              <span className="truncate">{record.status}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {formatTime(record.clockIn)} - {formatTime(record.clockOut)}
                            </div>
                          </div>
                        );
                      })}
                      {dayRecords.length === 0 && (
                        <div className="text-xs text-gray-400 italic mt-4 text-center">
                          No records
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Enhanced Grid View */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendance.map(record => {
                  const lateEarly = calculateLateEarlyMinutes(record.clockIn, record.shift?.start);
                  const StatusIcon = getStatusIcon(record.status);
                  const date = new Date(record.date);
                  
                  return (
                    <div key={record._id} className="border border-purple-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-purple-50/30">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">
                            {formatDateShort(record.date)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(record.status)}`}>
                          <StatusIcon size={14} className="inline mr-1" />
                          {record.status}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-center">
                              <Sun size={16} className="text-amber-600" />
                            </div>
                            <span className="text-sm font-medium">Clock In</span>
                          </div>
                          <div className={`font-bold ${
                            lateEarly.isLate ? 'text-red-600' :
                            lateEarly.isEarly ? 'text-green-600' : ''
                          }`}>
                            {formatTime(record.clockIn)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-center">
                              <Moon size={16} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-medium">Clock Out</span>
                          </div>
                          <span className="font-bold">{formatTime(record.clockOut)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
                              <Clock size={16} className="text-purple-600" />
                            </div>
                            <span className="text-sm font-medium">Total Hours</span>
                          </div>
                          <span className="font-bold text-lg text-purple-700">
                            {record.totalHours?.toFixed(2)} hrs
                          </span>
                        </div>
                      </div>
                      
                      {(lateEarly.isLate || lateEarly.isEarly) && (
                        <div className={`mt-3 text-sm px-3 py-2 rounded-lg ${
                          lateEarly.isLate 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {lateEarly.isLate ? '⏰ Late:' : '⬇️ Early:'} {lateEarly.details}
                        </div>
                      )}
                      
                      {record.remarks && (
                        <div className="mt-3 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          💬 {record.remarks}
                        </div>
                      )}
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {record.autoGenerated && '🤖 Auto-generated • '}
                          {record.markedAbsent && '⚠️ Auto-absent • '}
                          {record.autoClockOut && '🤖 Auto-out'}
                        </div>
                        <button
                          onClick={() => {
                            setClockDetails(record);
                            setShowRecentDetails(true);
                          }}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Analytics View */
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <div className="space-y-4">
                    {Object.entries(analytics.statusDistribution || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                          <span className="font-medium text-gray-700">{status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{count}</span>
                          <span className="text-sm text-gray-500">
                            ({Math.round((count / attendance.length) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Monthly Overview */}
                <div className="bg-gradient-to-br from-white to-pink-50 border border-pink-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h3>
                  <div className="space-y-3">
                    {(analytics.monthlyData || []).slice(0, 6).map((month, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-600 w-24">{month.month}</div>
                        <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${(month.totalHours / 200) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-bold text-gray-900">{month.totalHours.toFixed(1)}h</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Summary Stats */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-sm text-gray-600">Present Days</div>
                      <div className="text-2xl font-bold text-green-700">{summary?.presentDays || 0}</div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg">
                      <div className="text-sm text-gray-600">Absent Days</div>
                      <div className="text-2xl font-bold text-red-700">{summary?.absentDays || 0}</div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Hours</div>
                      <div className="text-2xl font-bold text-purple-700">{summary?.totalHours?.toFixed(2) || "0.00"}</div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                      <div className="text-sm text-gray-600">Attendance Rate</div>
                      <div className="text-2xl font-bold text-blue-700">{summary?.attendanceRate?.toFixed(1) || "0.0"}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-purple-100 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
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
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'border border-purple-200 text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Summary Stats */}
        {summary && (
          <div className="mt-8 bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="text-purple-600" size={24} />
              Detailed Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  Present Days
                </div>
                <div className="text-2xl font-bold text-purple-700 mt-2">{summary.presentDays || 0}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalDays ? `${Math.round((summary.presentDays / summary.totalDays) * 100)}% of total` : ''}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <XCircle size={14} className="text-red-500" />
                  Absent Days
                </div>
                <div className="text-2xl font-bold text-red-700 mt-2">{summary.absentDays || 0}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalDays ? `${Math.round((summary.absentDays / summary.totalDays) * 100)}% of total` : ''}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  Total Hours
                </div>
                <div className="text-2xl font-bold text-blue-700 mt-2">{summary.totalHours?.toFixed(2) || "0.00"}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Avg: {summary.averageHours?.toFixed(2) || "0.00"} hrs/day
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Percent size={14} className="text-green-500" />
                  Attendance Rate
                </div>
                <div className="text-2xl font-bold text-green-700 mt-2">{summary.attendanceRate?.toFixed(1) || "0.0"}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  Based on working days
                </div>
              </div>
            </div>
            
            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="text-sm text-gray-600">Late Days</div>
                <div className="text-xl font-bold text-amber-700">{summary.lateDays || 0}</div>
                <div className="text-xs text-gray-500">
                  Avg: {summary.averageLateMinutes?.toFixed(1) || "0.0"} mins
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                <div className="text-sm text-gray-600">Early Days</div>
                <div className="text-xl font-bold text-violet-700">{summary.earlyDays || 0}</div>
                <div className="text-xs text-gray-500">
                  Avg: {summary.averageEarlyMinutes?.toFixed(1) || "0.0"} mins
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-100">
                <div className="text-sm text-gray-600">Total Days</div>
                <div className="text-xl font-bold text-gray-700">{summary.totalDays || 0}</div>
                <div className="text-xs text-gray-500">
                  Working days: {summary.workingDays || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* ===================== MODALS ===================== */}
      
      {/* Manual Attendance Modal */}
      {showManualAttendanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Manual Attendance</h2>
                <p className="text-gray-500">Create attendance record for specific employee</p>
              </div>
              <button
                onClick={() => setShowManualAttendanceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      fetchEmployees();
                      setShowEmployeeSelector(true);
                    }}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-left flex items-center justify-between hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {selectedEmployee ? (
                        <>
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {selectedEmployee.firstName} {selectedEmployee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {selectedEmployee.employeeId} • {selectedEmployee.department}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">Select employee</div>
                      )}
                    </div>
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
              
              {/* Date and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={manualAttendanceData.date}
                    onChange={(e) => setManualAttendanceData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={manualAttendanceData.status}
                    onChange={(e) => setManualAttendanceData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Early">Early</option>
                    <option value="Leave">Leave</option>
                    <option value="Govt Holiday">Govt Holiday</option>
                    <option value="Weekly Off">Weekly Off</option>
                  </select>
                </div>
              </div>
              
              {/* Clock Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock In Time</label>
                  <input
                    type="time"
                    value={manualAttendanceData.clockIn}
                    onChange={(e) => setManualAttendanceData(prev => ({ ...prev, clockIn: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock Out Time</label>
                  <input
                    type="time"
                    value={manualAttendanceData.clockOut}
                    onChange={(e) => setManualAttendanceData(prev => ({ ...prev, clockOut: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={manualAttendanceData.remarks}
                  onChange={(e) => setManualAttendanceData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows="3"
                  placeholder="Add any remarks or notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowManualAttendanceModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateManualAttendance}
                disabled={!selectedEmployee}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium shadow-sm disabled:opacity-50"
              >
                Create Attendance
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Attendance Modal */}
      {showBulkAttendanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Bulk Attendance</h2>
                <p className="text-gray-500">Create attendance records for multiple dates</p>
              </div>
              <button
                onClick={() => setShowBulkAttendanceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      fetchEmployees();
                      setShowEmployeeSelector(true);
                    }}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-left flex items-center justify-between hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {selectedEmployee ? (
                        <>
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {selectedEmployee.firstName} {selectedEmployee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {selectedEmployee.employeeId} • {selectedEmployee.department}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">Select employee</div>
                      )}
                    </div>
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
              
              {/* Month and Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={bulkAttendanceData.month}
                    onChange={(e) => setBulkAttendanceData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={bulkAttendanceData.year}
                    onChange={(e) => setBulkAttendanceData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    min="2000"
                    max="2100"
                  />
                </div>
              </div>
              
              {/* Shift Timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start Time</label>
                  <input
                    type="time"
                    value={bulkAttendanceData.defaultShiftStart}
                    onChange={(e) => setBulkAttendanceData(prev => ({ ...prev, defaultShiftStart: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift End Time</label>
                  <input
                    type="time"
                    value={bulkAttendanceData.defaultShiftEnd}
                    onChange={(e) => setBulkAttendanceData(prev => ({ ...prev, defaultShiftEnd: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Options */}
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="skipWeekends"
                    checked={bulkAttendanceData.skipWeekends}
                    onChange={(e) => setBulkAttendanceData(prev => ({ ...prev, skipWeekends: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="skipWeekends" className="ml-2 text-sm text-gray-700">
                    Skip weekends (Saturday & Sunday)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="markAllAsPresent"
                    checked={bulkAttendanceData.markAllAsPresent}
                    onChange={(e) => setBulkAttendanceData(prev => ({ ...prev, markAllAsPresent: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="markAllAsPresent" className="ml-2 text-sm text-gray-700">
                    Mark all as Present
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowBulkAttendanceModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBulkAttendance}
                disabled={!selectedEmployee}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium shadow-sm disabled:opacity-50"
              >
                Create Bulk Attendance
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Employee Selector Modal */}
      {showEmployeeSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Employee</h2>
                <p className="text-gray-500">Choose an employee for the attendance record</p>
              </div>
              <button
                onClick={() => setShowEmployeeSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Search employees by name, ID, or department..."
                />
              </div>
            </div>
            
            {/* Employee List */}
            <div className="overflow-y-auto max-h-[50vh] pr-2">
              <div className="grid gap-2">
                {employees
                  .filter(emp => 
                    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                    emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                    emp.department.toLowerCase().includes(employeeSearch.toLowerCase())
                  )
                  .map(employee => (
                    <button
                      key={employee._id}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setManualAttendanceData(prev => ({
                          ...prev,
                          employeeId: employee._id,
                          employeeName: `${employee.firstName} ${employee.lastName}`
                        }));
                        setBulkAttendanceData(prev => ({
                          ...prev,
                          employeeId: employee._id,
                          employeeName: `${employee.firstName} ${employee.lastName}`
                        }));
                        setShowEmployeeSelector(false);
                      }}
                      className="w-full p-4 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all group border border-transparent hover:border-purple-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-purple-700">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-3">
                              <span>ID: {employee.employeeId}</span>
                              <span>•</span>
                              <span>{employee.department}</span>
                              <span>•</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                employee.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {employee.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-purple-500" size={20} />
                      </div>
                    </button>
                  ))}
              </div>
              
              {employees.filter(emp => 
                `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Attendance Details Modal */}
      {showRecentDetails && clockDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Attendance Details</h2>
                <p className="text-gray-500">Detailed view of attendance record</p>
              </div>
              <button
                onClick={() => setShowRecentDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-bold text-lg text-gray-900">{formatDate(clockDetails.date)}</div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mt-1 ${getStatusColor(clockDetails.status)}`}>
                    {(() => {
                      const StatusIcon = getStatusIcon(clockDetails.status);
                      return <StatusIcon size={14} className="mr-2" />;
                    })()}
                    {clockDetails.status}
                  </div>
                </div>
              </div>
              
              {/* Clock Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-purple-100 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-center">
                      <Sun className="text-amber-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Clock In</div>
                      <div className="font-bold text-lg text-gray-900">{formatTime(clockDetails.clockIn)}</div>
                    </div>
                  </div>
                  {clockDetails.shift?.start && (
                    <div className="text-xs text-gray-500">
                      Shift start: {clockDetails.shift.start}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-center">
                      <Moon className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Clock Out</div>
                      <div className="font-bold text-lg text-gray-900">{formatTime(clockDetails.clockOut)}</div>
                    </div>
                  </div>
                  {clockDetails.shift?.end && (
                    <div className="text-xs text-gray-500">
                      Shift end: {clockDetails.shift.end}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Total Hours */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                <div className="text-sm text-gray-500 mb-2">Total Working Hours</div>
                <div className="text-4xl font-bold text-purple-700">
                  {clockDetails.totalHours?.toFixed(2) || "0.00"} hours
                </div>
                {clockDetails.shift?.isNightShift && (
                  <div className="text-sm text-purple-600 mt-2">🌙 Night Shift Record</div>
                )}
              </div>
              
              {/* Late/Early Calculation */}
              {clockDetails.clockIn && clockDetails.shift?.start && (
                <div className="p-4 border border-amber-100 rounded-xl">
                  <div className="text-sm font-medium text-gray-700 mb-2">Late/Early Calculation</div>
                  {(() => {
                    const lateEarly = calculateLateEarlyMinutes(clockDetails.clockIn, clockDetails.shift.start);
                    return (
                      <div className={`text-lg font-bold ${
                        lateEarly.isLate ? 'text-red-600' :
                        lateEarly.isEarly ? 'text-green-600' :
                        'text-gray-700'
                      }`}>
                        {lateEarly.details}
                      </div>
                    );
                  })()}
                  <div className="text-xs text-gray-500 mt-1">
                    Shift: {clockDetails.shift.start} • Late threshold: +5 mins • Early threshold: -1 min
                  </div>
                </div>
              )}
              
              {/* Additional Information */}
              {clockDetails.remarks && (
                <div className="p-4 border border-gray-100 rounded-xl">
                  <div className="text-sm font-medium text-gray-700 mb-2">Remarks</div>
                  <div className="text-gray-600">{clockDetails.remarks}</div>
                </div>
              )}
              
              {/* System Flags */}
              <div className="space-y-2">
                {clockDetails.markedAbsent && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700 font-medium">
                      <AlertOctagon size={18} />
                      Auto-marked as absent
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      System automatically marked as absent (No clock in within required time)
                    </div>
                  </div>
                )}
                
                {clockDetails.autoGenerated && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <Database size={18} />
                      Auto-generated record
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      System automatically generated this record for non-working day
                    </div>
                  </div>
                )}
                
                {clockDetails.correctedByAdmin && (
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <div className="flex items-center gap-2 text-purple-700 font-medium">
                      <Edit size={18} />
                      Admin corrected record
                    </div>
                    <div className="text-sm text-purple-600 mt-1">
                      This record was manually corrected by administrator
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Attendance Modal */}
      {selectedAttendanceRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Attendance Record</h2>
                <p className="text-gray-500">Modify attendance details</p>
              </div>
              <button
                onClick={() => setSelectedAttendanceRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Clock Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock In Time</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.clockIn ? formatTime(selectedAttendanceRecord.clockIn).replace(' ', '').slice(0, 5) : ''}
                    onChange={(e) => setSelectedAttendanceRecord(prev => ({ ...prev, clockIn: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock Out Time</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.clockOut ? formatTime(selectedAttendanceRecord.clockOut).replace(' ', '').slice(0, 5) : ''}
                    onChange={(e) => setSelectedAttendanceRecord(prev => ({ ...prev, clockOut: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedAttendanceRecord.status}
                  onChange={(e) => setSelectedAttendanceRecord(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Early">Early</option>
                  <option value="Leave">Leave</option>
                  <option value="Govt Holiday">Govt Holiday</option>
                  <option value="Weekly Off">Weekly Off</option>
                  <option value="Off Day">Off Day</option>
                </select>
              </div>
              
              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={selectedAttendanceRecord.remarks || ''}
                  onChange={(e) => setSelectedAttendanceRecord(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows="3"
                  placeholder="Add remarks or correction reason..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setSelectedAttendanceRecord(null)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCorrectAttendance(selectedAttendanceRecord._id, selectedAttendanceRecord)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}