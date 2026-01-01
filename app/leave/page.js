"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  RefreshCw, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  CalendarDays,
  ChevronDown,
  MoreVertical,
  Eye,
  EyeOff,
  Search,
  FileText,
  ClockIcon,
  TrendingUp,
  Users,
  Activity,
  Sun,
  Moon,
  Check,
  XCircle,
  AlertTriangle,
  User,
  Briefcase,
  Home,
  Coffee,
  Shield,
  Building,
  Hash,
  Mail,
  BarChart3,
  PieChart,
  CalendarRange,
  UserCheck,
  UserX,
  FilterX,
  DownloadCloud,
  Printer,
  MailCheck,
  Bell,
  TrendingDown,
  Zap,
  Layers,
  Target,
  Award,
  Crown,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Copy,
  Share2,
  BookOpen,
  Bookmark,
  Flag,
  HelpCircle,
  Info,
  AlertOctagon,
  BellRing,
  CheckSquare,
  XSquare,
  Upload,
  Image,
  Video,
  Mic,
  Phone,
  Settings,
  LogOut,
  UserPlus,
  Users as UsersIcon,
  Grid,
  List,
  LayoutGrid,
  MapPin,
  Navigation,
  Globe,
  Lock,
  Unlock,
  Key,
  Mail as MailIcon,
  PhoneCall,
  MessageCircle,
  Send,
  Inbox,
  Archive,
  Folder,
  FolderOpen,
  FolderPlus,
  File,
  FilePlus,
  FileText as FileTextIcon,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileCheck,
  FileX,
  FileMinus,
  FileQuestion,
  FileSearch,
  FileSignature,
  FileDiff,
  FileBarChart,
  FileDigit,
  Database,
  Server,
  HardDrive,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Thermometer,
  Droplet,
  Umbrella,
  Sunset,
  Sunrise,
  Moon as MoonIcon,
  Cloudy,
  CloudSun,
  CloudMoon,
  ThermometerSun,
  ThermometerSnowflake,
  Watch,
  AlarmClock,
  Timer,
  Hourglass,
  StopCircle,
  PlayCircle,
  PauseCircle,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Play,
  Pause,
  Stop,
  Volume2,
  VolumeX,
  Volume1,
  MicOff,
  Headphones,
  Radio,
  Music,
  Music2,
  VideoOff,
  Camera,
  CameraOff,
  Film,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Cpu,
  Printer as PrinterIcon,
  Mouse,
  Keyboard,
  Gamepad,
  MonitorSpeaker,
  Webcam,
  HardDrive as HardDriveIcon,
  Cctv,
  Router,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Power,
  Zap as ZapIcon,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitCompare,
  Code,
  Code2,
  Terminal,
  Brackets,
  Parentheses,
  Braces,
  ChevronsRight,
  ChevronsLeft,
  ChevronsUp,
  ChevronsDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Move,
  MoveHorizontal,
  MoveVertical,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Minus,
  PlusCircle,
  MinusCircle,
  XCircle as XCircleIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  HelpCircle as HelpCircleIcon,
  Info as InfoIcon,
  AlertTriangle as AlertTriangleIcon,
  AlertOctagon as AlertOctagonIcon,
  Bell as BellIcon,
  BellOff,
  BellRing as BellRingIcon,
  Mail as MailIcon2,
  MailOpen,
  MailCheck as MailCheckIcon,
  MailWarning,
  Inbox as InboxIcon,
  Archive as ArchiveIcon,
  Send as SendIcon,
  MessageSquare as MessageSquareIcon,
  MessageCircle as MessageCircleIcon,
  MessageCircleWarning,
  MessageCircleQuestion,
  MessageCircleX,
  MessageCirclePlus,
  MessageCircleMinus,
  MessageCircleOff,
  MessageSquarePlus,
  MessageSquareMinus,
  MessageSquareX,
  MessageSquareText,
  MessageSquareDashed,
  MessageSquareQuote,
  MessageSquareShare,
  MessageSquareReply,
  MessageSquareForward,
  MessageSquareCode,
  MessageSquareMore,
  MessageSquareWarning,
  MessageSquareQuestion,
  MessageSquareOff,
  MessageSquareHeart,
  MessageSquareCheck,
  MessageSquareDot,
  MessageSquareEqual,
  MessageSquareDiff,
  MessageSquareEdit,
  MessageSquareLock,
  MessageSquareUnlock,
  MessageSquareKey,
  MessageSquareBell,
  MessageSquareAudio,
  MessageSquareVideo,
  MessageSquareImage,
  MessageSquareFile,
  MessageSquareMusic,
  MessageSquarePlay,
  MessageSquarePause,
  MessageSquareStop,
  MessageSquareRecord,
  MessageSquareFastForward,
  MessageSquareRewind,
  MessageSquareSkipBack,
  MessageSquareSkipForward,
  MessageSquareVolume,
  MessageSquareMute,
  MessageSquareHeadphones,
  MessageSquareRadio,
  MessageSquareTv,
  MessageSquareMonitor,
  MessageSquareSmartphone,
  MessageSquareTablet,
  MessageSquareLaptop,
  MessageSquareDesktop,
  MessageSquarePrinter,
  MessageSquareMouse,
  MessageSquareKeyboard,
  MessageSquareGamepad,
  MessageSquareWebcam,
  MessageSquareRouter,
  MessageSquareWifi,
  MessageSquareBluetooth,
  MessageSquareBattery,
  MessageSquarePower,
  MessageSquareCpu,
  MessageSquareServer,
  MessageSquareDatabase,
  MessageSquareCloud,
  MessageSquareWind,
  MessageSquareThermometer,
  MessageSquareDroplet,
  MessageSquareUmbrella,
  MessageSquareSun,
  MessageSquareMoon,
  MessageSquareWatch,
  MessageSquareAlarm,
  MessageSquareTimer,
  MessageSquareHourglass,
  MessageSquareStopwatch,
  MessageSquareCalendar,
  MessageSquareClock,
  MessageSquareFlag,
  MessageSquareBookmark,
  MessageSquareHelp,
  MessageSquareInfo,
  MessageSquareAlert,
  MessageSquareBellRing,
  MessageSquareMail,
  MessageSquarePhone,
  MessageSquareSettings,
  MessageSquareLogOut,
  MessageSquareUser,
  MessageSquareUsers,
  MessageSquareGrid,
  MessageSquareList,
  MessageSquareLayout,
  MessageSquareMap,
  MessageSquareNavigation,
  MessageSquareGlobe,
  MessageSquareLockKeyhole,
  MessageSquareUnlockKeyhole,
  MessageSquareKeyhole,
  MessageSquareShield,
  MessageSquareShieldCheck,
  MessageSquareShieldX,
  MessageSquareShieldAlert,
  MessageSquareShieldQuestion,
  MessageSquareShieldOff,
  MessageSquareShieldPlus,
  MessageSquareShieldMinus,
  MessageSquareShieldEdit,
  MessageSquareShieldLock,
  MessageSquareShieldUnlock,
  MessageSquareShieldKey,
  MessageSquareShieldBell,
  MessageSquareShieldMail,
  MessageSquareShieldPhone,
  MessageSquareShieldSettings,
  MessageSquareShieldLogOut,
  MessageSquareShieldUser,
  MessageSquareShieldUsers,
  MessageSquareShieldGrid,
  MessageSquareShieldList,
  MessageSquareShieldLayout,
  MessageSquareShieldMap,
  MessageSquareShieldNavigation,
  MessageSquareShieldGlobe,
  MessageSquareShieldCloud,
  MessageSquareShieldWind,
  MessageSquareShieldThermometer,
  MessageSquareShieldDroplet,
  MessageSquareShieldUmbrella,
  MessageSquareShieldSun,
  MessageSquareShieldMoon,
  MessageSquareShieldWatch,
  MessageSquareShieldAlarm,
  MessageSquareShieldTimer,
  MessageSquareShieldHourglass,
  MessageSquareShieldStopwatch,
  MessageSquareShieldCalendar,
  MessageSquareShieldClock,
  MessageSquareShieldFlag,
  MessageSquareShieldBookmark,
  MessageSquareShieldHelp,
  MessageSquareShieldInfo,
  MessageSquareShieldAlertOctagon,
  MessageSquareShieldBellRing,
  MessageSquareShieldMailCheck,
  MessageSquareShieldMailWarning,
  MessageSquareShieldInbox,
  MessageSquareShieldArchive,
  MessageSquareShieldSend,
  MessageSquareShieldMessage,
  MessageSquareShieldPhoneCall,
  MessageSquareShieldVideo,
  MessageSquareShieldImage,
  MessageSquareShieldFile,
  MessageSquareShieldMusic,
  MessageSquareShieldPlay,
  MessageSquareShieldPause,
  MessageSquareShieldStop,
  MessageSquareShieldRecord,
  MessageSquareShieldFastForward,
  MessageSquareShieldRewind,
  MessageSquareShieldSkipBack,
  MessageSquareShieldSkipForward,
  MessageSquareShieldVolume,
  MessageSquareShieldMute,
  MessageSquareShieldHeadphones,
  MessageSquareShieldRadio,
  MessageSquareShieldTv,
  MessageSquareShieldMonitor,
  MessageSquareShieldSmartphone,
  MessageSquareShieldTablet,
  MessageSquareShieldLaptop,
  MessageSquareShieldDesktop,
  MessageSquareShieldPrinter,
  MessageSquareShieldMouse,
  MessageSquareShieldKeyboard,
  MessageSquareShieldGamepad,
  MessageSquareShieldWebcam,
  MessageSquareShieldRouter,
  MessageSquareShieldWifi,
  MessageSquareShieldBluetooth,
  MessageSquareShieldBattery,
  MessageSquareShieldPower,
  MessageSquareShieldCpu,
  MessageSquareShieldServer,
  MessageSquareShieldDatabase,
  MessageSquareShieldCloudRain,
  MessageSquareShieldCloudSnow,
  MessageSquareShieldCloudLightning,
  MessageSquareShieldCloudDrizzle,
  MessageSquareShieldCloudFog,
  MessageSquareShieldWind as MessageSquareShieldWindIcon,
  MessageSquareShieldThermometer as MessageSquareShieldThermometerIcon,
  MessageSquareShieldDroplet as MessageSquareShieldDropletIcon,
  MessageSquareShieldUmbrella as MessageSquareShieldUmbrellaIcon,
  MessageSquareShieldSun as MessageSquareShieldSunIcon,
  MessageSquareShieldMoon as MessageSquareShieldMoonIcon,
  MessageSquareShieldWatch as MessageSquareShieldWatchIcon,
  MessageSquareShieldAlarm as MessageSquareShieldAlarmIcon,
  MessageSquareShieldTimer as MessageSquareShieldTimerIcon,
  MessageSquareShieldHourglass as MessageSquareShieldHourglassIcon,
  MessageSquareShieldStopwatch as MessageSquareShieldStopwatchIcon,
  MessageSquareShieldCalendar as MessageSquareShieldCalendarIcon,
  MessageSquareShieldClock as MessageSquareShieldClockIcon,
  MessageSquareShieldFlag as MessageSquareShieldFlagIcon,
  MessageSquareShieldBookmark as MessageSquareShieldBookmarkIcon,
  MessageSquareShieldHelp as MessageSquareShieldHelpIcon,
  MessageSquareShieldInfo as MessageSquareShieldInfoIcon,
  MessageSquareShieldAlert as MessageSquareShieldAlertIcon,
  MessageSquareShieldBellRing as MessageSquareShieldBellRingIcon,
  MessageSquareShieldMail as MessageSquareShieldMailIcon,
  MessageSquareShieldMailCheck as MessageSquareShieldMailCheckIcon,
  MessageSquareShieldMailWarning as MessageSquareShieldMailWarningIcon,
  MessageSquareShieldInbox as MessageSquareShieldInboxIcon,
  MessageSquareShieldArchive as MessageSquareShieldArchiveIcon,
  MessageSquareShieldSend as MessageSquareShieldSendIcon,
  MessageSquareShieldMessage as MessageSquareShieldMessageIcon,
  MessageSquareShieldPhoneCall as MessageSquareShieldPhoneCallIcon,
  MessageSquareShieldVideo as MessageSquareShieldVideoIcon,
  MessageSquareShieldImage as MessageSquareShieldImageIcon,
  MessageSquareShieldFile as MessageSquareShieldFileIcon,
  MessageSquareShieldMusic as MessageSquareShieldMusicIcon,
  MessageSquareShieldPlay as MessageSquareShieldPlayIcon,
  MessageSquareShieldPause as MessageSquareShieldPauseIcon,
  MessageSquareShieldStop as MessageSquareShieldStopIcon,
  MessageSquareShieldRecord as MessageSquareShieldRecordIcon,
  MessageSquareShieldFastForward as MessageSquareShieldFastForwardIcon,
  MessageSquareShieldRewind as MessageSquareShieldRewindIcon,
  MessageSquareShieldSkipBack as MessageSquareShieldSkipBackIcon,
  MessageSquareShieldSkipForward as MessageSquareShieldSkipForwardIcon,
  MessageSquareShieldVolume as MessageSquareShieldVolumeIcon,
  MessageSquareShieldMute as MessageSquareShieldMuteIcon,
  MessageSquareShieldHeadphones as MessageSquareShieldHeadphonesIcon,
  MessageSquareShieldRadio as MessageSquareShieldRadioIcon,
  MessageSquareShieldTv as MessageSquareShieldTvIcon,
  MessageSquareShieldMonitor as MessageSquareShieldMonitorIcon,
  MessageSquareShieldSmartphone as MessageSquareShieldSmartphoneIcon,
  MessageSquareShieldTablet as MessageSquareShieldTabletIcon,
  MessageSquareShieldLaptop as MessageSquareShieldLaptopIcon,
  MessageSquareShieldDesktop as MessageSquareShieldDesktopIcon,
  MessageSquareShieldPrinter as MessageSquareShieldPrinterIcon,
  MessageSquareShieldMouse as MessageSquareShieldMouseIcon,
  MessageSquareShieldKeyboard as MessageSquareShieldKeyboardIcon,
  MessageSquareShieldGamepad as MessageSquareShieldGamepadIcon,
  MessageSquareShieldWebcam as MessageSquareShieldWebcamIcon,
  MessageSquareShieldRouter as MessageSquareShieldRouterIcon,
  MessageSquareShieldWifi as MessageSquareShieldWifiIcon,
  MessageSquareShieldBluetooth as MessageSquareShieldBluetoothIcon,
  MessageSquareShieldBattery as MessageSquareShieldBatteryIcon,
  MessageSquareShieldPower as MessageSquareShieldPowerIcon,
  MessageSquareShieldCpu as MessageSquareShieldCpuIcon,
  MessageSquareShieldServer as MessageSquareShieldServerIcon,
  MessageSquareShieldDatabase as MessageSquareShieldDatabaseIcon,
  MessageSquareShieldCloud as MessageSquareShieldCloudIcon
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function LeaveManagementPage() {
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
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [bulkActions, setBulkActions] = useState([]);
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    leaveType: "Sick",
    payStatus: "Paid",
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    leaveType: "",
    payStatus: "",
    startDate: "",
    endDate: "",
    reason: ""
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

  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Get auth token
  const getAuthToken = useCallback(() => {
    const adminToken = localStorage.getItem('adminToken');
    const employeeToken = localStorage.getItem('employeeToken');
    
    if (adminToken) return adminToken;
    if (employeeToken) return employeeToken;
    return null;
  }, []);

  // Get user role
  const getUserRole = useCallback(() => {
    const adminToken = localStorage.getItem('adminToken');
    const employeeToken = localStorage.getItem('employeeToken');
    
    if (adminToken) return 'admin';
    if (employeeToken) return 'employee';
    return null;
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((leavesData) => {
    const stats = {
      pending: leavesData.filter(l => l.status === "Pending").length,
      approved: leavesData.filter(l => l.status === "Approved").length,
      rejected: leavesData.filter(l => l.status === "Rejected").length,
      total: leavesData.length,
      paid: leavesData.filter(l => l.payStatus === "Paid").length,
      unpaid: leavesData.filter(l => l.payStatus === "Unpaid").length,
      halfPaid: leavesData.filter(l => l.payStatus === "HalfPaid").length
    };
    setStats(stats);
  }, []);

  // Fetch leaves from backend
  const fetchLeaves = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      console.log("No token found, skipping fetchLeaves");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Loading leaves...");
    
    try {
      const role = getUserRole();
      
      let endpoint;
      let queryParams = [];
      
      if (role === 'admin') {
        endpoint = `${API_BASE_URL}/allLeave`;
      } else {
        endpoint = `${API_BASE_URL}/my-leaves`;
      }
      
      // Add query parameters
      if (statusFilter !== "all") queryParams.push(`status=${statusFilter}`);
      if (typeFilter !== "all") queryParams.push(`type=${typeFilter}`);
      if (dateRange.start && dateRange.end) {
        queryParams.push(`startDate=${dateRange.start}&endDate=${dateRange.end}`);
      }
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
      if (departmentFilter !== "all") queryParams.push(`department=${departmentFilter}`);
      if (employeeFilter) queryParams.push(`employeeId=${employeeFilter}`);
      if (activeTab !== "all") queryParams.push(`status=${activeTab}`);
      
      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join('&')}`;
      }
      
      console.log("Fetching leaves from:", endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'success') {
          const leavesData = data.data || data.leaves || [];
          console.log("Fetched leaves data:", leavesData.length);
          
          // Sort data
          let sortedData = [...leavesData];
          if (sortBy === "newest") {
            sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else if (sortBy === "oldest") {
            sortedData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          } else if (sortBy === "startDate") {
            sortedData.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          }
          
          // Save to state
          setLeaves(sortedData);
          calculateStats(sortedData);
          
          // Also save to localStorage as backup
          localStorage.setItem('cachedLeaves', JSON.stringify({
            data: sortedData,
            timestamp: new Date().getTime()
          }));
          
          toast.dismiss(loadingToast);
          if (!initialLoadComplete) {
            toast.success(`Loaded ${sortedData.length} leave requests`, {
              icon: '📋',
              duration: 3000,
            });
            setInitialLoadComplete(true);
          }
        } else {
          toast.dismiss(loadingToast);
          console.error("API Error:", data.message);
          
          // Try to load from cache
          const cached = localStorage.getItem('cachedLeaves');
          if (cached) {
            const { data: cachedData } = JSON.parse(cached);
            setLeaves(cachedData);
            calculateStats(cachedData);
            toast.error("Using cached data. Please refresh.");
          }
        }
      } else {
        const errorText = await response.text();
        toast.dismiss(loadingToast);
        console.error("HTTP Error:", response.status, errorText);
        
        // Try to load from cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const { data: cachedData } = JSON.parse(cached);
          setLeaves(cachedData);
          calculateStats(cachedData);
          toast.error("Using cached data. Please check connection.");
        } else {
          toast.error("Failed to load leaves");
        }
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Fetch leaves error:", error);
      
      // Try to load from cache on network error
      const cached = localStorage.getItem('cachedLeaves');
      if (cached) {
        const { data: cachedData } = JSON.parse(cached);
        setLeaves(cachedData);
        calculateStats(cachedData);
        toast.error("Using cached data due to network error.");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken, getUserRole, calculateStats, initialLoadComplete, statusFilter, typeFilter, dateRange, searchTerm, departmentFilter, employeeFilter, activeTab, sortBy]);

  // Fetch leave statistics
  const fetchLeaveStats = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
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

  // Fetch leave balance
  const fetchLeaveBalance = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
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

  // Fetch departments and employees (for admin)
  const fetchDepartmentsAndEmployees = useCallback(async () => {
    if (!isAdmin) return;

    const token = getAuthToken();
    if (!token) return;

    try {
      // Fetch departments
      const deptResponse = await fetch(`${API_BASE_URL}/users/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        if (deptData.status === 'success') {
          setDepartments(deptData.data || []);
        }
      }

      // Fetch employees
      const empResponse = await fetch(`${API_BASE_URL}/users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (empResponse.ok) {
        const empData = await empResponse.json();
        if (empData.status === 'success') {
          setEmployees(empData.data || []);
        }
      }
    } catch (error) {
      console.error("Fetch departments/employees error:", error);
    }
  }, [API_BASE_URL, getAuthToken, isAdmin]);

  // Check authentication and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      console.log("=== Initial authentication check ===");
      
      const adminToken = localStorage.getItem('adminToken');
      const employeeToken = localStorage.getItem('employeeToken');
      
      if (!adminToken && !employeeToken) {
        console.log("No tokens found, redirecting to login");
        router.push("/login");
        return;
      }
      
      // First try to load from cache for immediate display
      const cached = localStorage.getItem('cachedLeaves');
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          // Use cache if less than 5 minutes old
          if (new Date().getTime() - timestamp < 5 * 60 * 1000) {
            setLeaves(cachedData);
            calculateStats(cachedData);
            console.log("Loaded from cache:", cachedData.length);
          }
        } catch (e) {
          console.error("Error parsing cached leaves:", e);
        }
      }
      
      // Set admin status
      if (adminToken) {
        setIsAdmin(true);
        try {
          const response = await fetch(`${API_BASE_URL}/admin/getAdminProfile`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data);
            console.log("Admin profile loaded");
          } else {
            localStorage.removeItem('adminToken');
            router.push("/login");
            return;
          }
        } catch (error) {
          localStorage.removeItem('adminToken');
          router.push("/login");
          return;
        }
      } else if (employeeToken) {
        setIsAdmin(false);
        try {
          const response = await fetch(`${API_BASE_URL}/users/getProfile`, {
            headers: {
              'Authorization': `Bearer ${employeeToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user || data);
            console.log("Employee profile loaded");
          } else {
            localStorage.removeItem('employeeToken');
            router.push("/login");
            return;
          }
        } catch (error) {
          localStorage.removeItem('employeeToken');
          router.push("/login");
          return;
        }
      }
      
      // Now fetch fresh data from API
      await fetchLeaves();
      await fetchLeaveStats();
      await fetchLeaveBalance();
      await fetchDepartmentsAndEmployees();
    };
    
    checkAuthAndLoadData();
  }, [router, API_BASE_URL, fetchLeaves, calculateStats, fetchLeaveStats, fetchLeaveBalance, fetchDepartmentsAndEmployees]);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Request leave
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
    
    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      toast.error("Cannot request leave for past dates");
      return;
    }
    
    setFormLoading(true);
    const loadingToast = toast.loading("Submitting leave request...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        router.push("/login");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success(data.message || "Leave request submitted successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        // Optimistically update UI
        const newLeave = data.leave || data.data;
        setLeaves(prev => [newLeave, ...prev]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending + 1,
          total: prev.total + 1,
          paid: newLeave.payStatus === 'Paid' ? prev.paid + 1 : prev.paid,
          unpaid: newLeave.payStatus === 'Unpaid' ? prev.unpaid + 1 : prev.unpaid,
          halfPaid: newLeave.payStatus === 'HalfPaid' ? prev.halfPaid + 1 : prev.halfPaid
        }));
        
        // Also update cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const { data: cachedData } = JSON.parse(cached);
          localStorage.setItem('cachedLeaves', JSON.stringify({
            data: [newLeave, ...cachedData],
            timestamp: new Date().getTime()
          }));
        }
        
        // Reset form and close modal
        setShowRequestModal(false);
        setForm({
          leaveType: "Sick",
          payStatus: "Paid",
          startDate: "",
          endDate: "",
          reason: ""
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
      startDate: leave.startDate.split('T')[0],
      endDate: leave.endDate.split('T')[0],
      reason: leave.reason
    });
    setShowEditModal(true);
  };

  // Update leave
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
    
    setFormLoading(true);
    const loadingToast = toast.loading("Updating leave request...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        router.push("/login");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/my-leavesUpdate${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success(data.message || "Leave updated successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        // Update in state
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id ? data.leave || data.data : leave
        ));
        
        // Update cache
        const cached = localStorage.getItem('cachedLeaves');
        if (cached) {
          const { data: cachedData } = JSON.parse(cached);
          const updatedCache = cachedData.map(leave => 
            leave._id === selectedLeave._id ? data.leave || data.data : leave
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

  // Approve leave (Admin only)
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
        router.push("/login");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/approve/${selectedLeave._id}`, {
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
        
        // Update in state
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id ? data.leave || data.data : leave
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
          const { data: cachedData } = JSON.parse(cached);
          const updatedCache = cachedData.map(leave => 
            leave._id === selectedLeave._id ? data.leave || data.data : leave
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

  // Reject leave (Admin only)
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
        router.push("/login");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/reject/${selectedLeave._id}`, {
        method: 'PATCH',
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
        
        // Update in state
        setLeaves(prev => prev.map(leave => 
          leave._id === selectedLeave._id ? data.leave || data.data : leave
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
          const { data: cachedData } = JSON.parse(cached);
          const updatedCache = cachedData.map(leave => 
            leave._id === selectedLeave._id ? data.leave || data.data : leave
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

  // Delete leave
  const handleDeleteLeave = async (leaveId) => {
    if (!confirm("Are you sure you want to delete this leave request?")) {
      return;
    }
    
    const loadingToast = toast.loading("Deleting leave request...");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        router.push("/login");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}`, {
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
          const { data: cachedData } = JSON.parse(cached);
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

  // View leave details
  const handleViewDetails = async (leaveId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setSelectedLeave(data.data);
          setShowDetailsModal(true);
        }
      }
    } catch (error) {
      console.error("View leave details error:", error);
    }
  };

  // Export leaves
  const handleExportLeaves = async () => {
    setExportLoading(true);
    const loadingToast = toast.loading("Exporting leaves...");
    
    try {
      const token = getAuthToken();
      if (!token) return;

      let endpoint = `${API_BASE_URL}/leaves/export`;
      let queryParams = [];
      
      if (statusFilter !== "all") queryParams.push(`status=${statusFilter}`);
      if (typeFilter !== "all") queryParams.push(`type=${typeFilter}`);
      if (dateRange.start && dateRange.end) {
        queryParams.push(`startDate=${dateRange.start}&endDate=${dateRange.end}`);
      }
      
      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join('&')}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leaves_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.dismiss(loadingToast);
        toast.success("Leaves exported successfully!");
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

  // Handle bulk actions
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
          endpoint = `${API_BASE_URL}/leaves/bulk-approve`;
          break;
        case 'reject':
          endpoint = `${API_BASE_URL}/leaves/bulk-reject`;
          break;
        case 'delete':
          endpoint = `${API_BASE_URL}/leaves/bulk-delete`;
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
        setShowBulkActions(false);
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

  // Filter leaves
  const filteredLeaves = leaves.filter(leave => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      (leave.employee?.name || "").toLowerCase().includes(searchLower) ||
      (leave.leaveType || "").toLowerCase().includes(searchLower) ||
      (leave.reason || "").toLowerCase().includes(searchLower) ||
      (leave.employee?.employeeId || "").toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || leave.status === statusFilter;
    const matchesType = typeFilter === "all" || leave.leaveType === typeFilter;
    
    // Department filter for admin
    let matchesDepartment = true;
    if (isAdmin && departmentFilter !== "all") {
      matchesDepartment = leave.employee?.department === departmentFilter;
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate days between dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
    return leave.employee?._id === currentUser._id && leave.status === 'Pending';
  };

  // Check if user can delete this leave
  const canDeleteLeave = (leave) => {
    if (isAdmin) return true;
    if (!currentUser) return false;
    return leave.employee?._id === currentUser._id && leave.status === 'Pending';
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
  const leaveTypeOptions = [
    { value: "Sick", label: "Sick Leave", icon: <Activity size={14} /> },
    { value: "Annual", label: "Annual Leave", icon: <Sun size={14} /> },
    { value: "Casual", label: "Casual Leave", icon: <Coffee size={14} /> },
    { value: "Emergency", label: "Emergency Leave", icon: <AlertTriangle size={14} /> },
    { value: "Maternity", label: "Maternity Leave", icon: <Home size={14} /> },
    { value: "Paternity", label: "Paternity Leave", icon: <Briefcase size={14} /> },
    { value: "Other", label: "Other", icon: <FileText size={14} /> }
  ];

  // Get pay status options
  const payStatusOptions = [
    { value: "Paid", label: "Paid", color: "text-green-600" },
    { value: "Unpaid", label: "Unpaid", color: "text-red-600" },
    { value: "HalfPaid", label: "Half Paid", color: "text-yellow-600" }
  ];

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
                  <p className="text-gray-500 text-sm mt-1">Submit a new leave request</p>
                </div>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setForm({
                      leaveType: "Sick",
                      payStatus: "Paid",
                      startDate: "",
                      endDate: "",
                      reason: ""
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleRequestLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type *
                </label>
                <select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
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
                  value={form.payStatus}
                  onChange={handleChange}
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
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    min={form.startDate || new Date().toISOString().split('T')[0]}
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
                  value={form.reason}
                  onChange={handleChange}
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
                    onClick={() => {
                      setShowRequestModal(false);
                      setForm({
                        leaveType: "Sick",
                        payStatus: "Paid",
                        startDate: "",
                        endDate: "",
                        reason: ""
                      });
                    }}
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
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar size={18} />
                        Request Leave
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Leave Modal */}
      {showEditModal && selectedLeave && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Leave</h2>
                  <p className="text-gray-500 text-sm mt-1">Update leave request details</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLeave(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type *
                </label>
                <select
                  name="leaveType"
                  value={editForm.leaveType}
                  onChange={handleEditChange}
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
                  value={editForm.payStatus}
                  onChange={handleEditChange}
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
                    value={editForm.startDate}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={editForm.endDate}
                    onChange={handleEditChange}
                    required
                    min={editForm.startDate}
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
                  value={editForm.reason}
                  onChange={handleEditChange}
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
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedLeave(null);
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateLeave}
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
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedLeave && (
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
                    {selectedLeave.employee?.name || 'Employee'}'s {selectedLeave.leaveType} Leave
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{selectedLeave.totalDays || calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{selectedLeave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pay Status:</span>
                  <span className="font-medium">{selectedLeave.payStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employee:</span>
                  <span className="font-medium">{selectedLeave.employee?.name}</span>
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
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedLeave && (
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
                    {selectedLeave.employee?.name || 'Employee'}'s {selectedLeave.leaveType} Leave
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
      )}

      {/* Leave Details Modal */}
      {showDetailsModal && selectedLeave && (
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
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{selectedLeave.employee?.name || 'N/A'}</h4>
                          <p className="text-sm text-gray-600">{selectedLeave.employee?.employeeId || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{selectedLeave.employee?.department || 'N/A'}</p>
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
                          {getLeaveTypeIcon(selectedLeave.leaveType)}
                          {selectedLeave.leaveType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLeave.status)}`}>
                          {selectedLeave.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pay Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPayStatusColor(selectedLeave.payStatus)}`}>
                          {selectedLeave.payStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedLeave.totalDays || calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days</span>
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
                        <span className="font-medium">{formatDate(selectedLeave.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{formatDate(selectedLeave.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Requested On:</span>
                        <span className="font-medium">{formatDateTime(selectedLeave.createdAt)}</span>
                      </div>
                      {selectedLeave.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approved On:</span>
                          <span className="font-medium">{formatDateTime(selectedLeave.approvedAt)}</span>
                        </div>
                      )}
                      {selectedLeave.rejectedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rejected On:</span>
                          <span className="font-medium">{formatDateTime(selectedLeave.rejectedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedLeave.approvedBy && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Approved By</h3>
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="font-medium">{selectedLeave.approvedBy?.name || 'Admin'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedLeave.rejectedBy && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Rejected By</h3>
                      <div className="bg-red-50 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <XCircle size={16} className="text-red-600" />
                          <span className="font-medium">{selectedLeave.rejectedBy?.name || 'Admin'}</span>
                        </div>
                        {selectedLeave.rejectionReason && (
                          <p className="mt-2 text-sm text-gray-600">
                            Reason: {selectedLeave.rejectionReason}
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
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedLeave.reason}</p>
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
                        handleDeleteLeave(selectedLeave._id);
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete Leave
                    </button>
                  )}
                  
                  {isAdmin && selectedLeave.status === 'Pending' && (
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
      )}

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
                onClick={fetchLeaves}
                disabled={loading}
                className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span className="hidden md:inline">Refresh</span>
              </button>
              {!isAdmin && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  <span className="hidden md:inline">Request Leave</span>
                  <span className="md:hidden">New</span>
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleExportLeaves}
                  disabled={exportLoading}
                  className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Download size={18} />
                  <span className="hidden md:inline">Export</span>
                </button>
              )}
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
                    You can approve, reject, edit, and delete leave requests. Approving leaves will automatically update attendance records.
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
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
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
          <div className={`${viewMode === 'grid' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
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
                    {isAdmin && (
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
                    {!isAdmin && (
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Request Leave
                      </button>
                    )}
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
                    const isUpcoming = new Date(leave.startDate) > new Date();
                    const canEdit = canEditLeave(leave);
                    const canDelete = canDeleteLeave(leave);
                    
                    return (
                      <div 
                        key={leave._id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                leave.status === 'Approved' ? 'bg-green-100' :
                                leave.status === 'Rejected' ? 'bg-red-100' :
                                'bg-yellow-100'
                              }`}>
                                {getLeaveTypeIcon(leave.leaveType)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {isAdmin ? leave.employee?.name : (currentUser?.name || "Your Leave")}
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
                            
                            {isAdmin && (
                              <input
                                type="checkbox"
                                checked={selectedLeaves.includes(leave._id)}
                                onChange={() => toggleLeaveSelection(leave._id)}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
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
                            <div className="text-sm">
                              <p className="text-gray-600 mb-1">Reason:</p>
                              <p className="text-gray-700 line-clamp-2">{leave.reason}</p>
                            </div>
                          </div>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              {formatDateTime(leave.createdAt)}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(leave._id)}
                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              {canEdit && (
                                <button
                                  onClick={() => handleEditLeave(leave)}
                                  className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteLeave(leave._id)}
                                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
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
                    const isUpcoming = new Date(leave.startDate) > new Date();
                    const canEdit = canEditLeave(leave);
                    const canDelete = canDeleteLeave(leave);
                    
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
                            
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              leave.status === 'Approved' ? 'bg-green-100' :
                              leave.status === 'Rejected' ? 'bg-red-100' :
                              'bg-yellow-100'
                            }`}>
                              {getLeaveTypeIcon(leave.leaveType)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                                  {isAdmin ? leave.employee?.name : (currentUser?.name || "Your Leave")}
                                  {isAdmin && leave.employee?.employeeId && (
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                      ({leave.employee.employeeId})
                                    </span>
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
                                  <ClockIcon size={12} />
                                  {totalDays} days
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText size={12} />
                                  {leave.leaveType} Leave
                                </span>
                              </div>
                              
                              <p className="text-gray-700 text-sm line-clamp-2 md:line-clamp-1 mb-3">
                                {leave.reason}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-gray-500">
                                <span>Requested: {formatDateTime(leave.createdAt)}</span>
                                {isUpcoming && leave.status === 'Approved' && (
                                  <span className="text-green-600 font-medium">• Upcoming</span>
                                )}
                                {isAdmin && leave.employee?.department && (
                                  <span className="text-purple-600 font-medium">• {leave.employee.department}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                            <button
                              onClick={() => handleViewDetails(leave._id)}
                              className="p-1.5 md:p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleEditLeave(leave)}
                                className="p-1.5 md:p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteLeave(leave._id)}
                                className="p-1.5 md:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
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

          {/* Right Column - Summary & Actions */}
          {viewMode === 'list' && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Leave Summary</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {isAdmin ? "Organization overview" : "Your leave balance"}
                  </p>
                </div>

                <div className="p-4 md:p-6">
                  {/* Leave Balance (For Employees) */}
                  {!isAdmin && leaveBalance && (
                    <div className="mb-6 md:mb-8">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Your Leave Balance</h3>
                      <div className="space-y-2 md:space-y-3">
                        {Object.entries(leaveBalance.balance || {}).map(([type, data]) => (
                          <div key={type} className="p-2 md:p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1 md:gap-2">
                                {getLeaveTypeIcon(type)}
                                <span className="text-sm text-gray-700">{type} Leave</span>
                              </div>
                              <span className="font-bold text-blue-600 text-sm md:text-base">
                                {data.remaining}/{data.allowed} days
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mt-1 md:mt-2">
                              <div 
                                className="bg-blue-600 h-1.5 md:h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(data.used / data.allowed) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Used: {data.used} days</span>
                              <span>Remaining: {data.remaining} days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                      {isAdmin ? "Organization Stats" : "Your Leave Stats"}
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Total Requests</span>
                        <span className="font-semibold text-gray-900">{stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Pending</span>
                        <span className="font-semibold text-yellow-600">{stats.pending}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Approved</span>
                        <span className="font-semibold text-green-600">{stats.approved}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Rejected</span>
                        <span className="font-semibold text-red-600">{stats.rejected}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Paid Leaves</span>
                        <span className="font-semibold text-blue-600">{stats.paid}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Unpaid Leaves</span>
                        <span className="font-semibold text-gray-600">{stats.unpaid}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Half Paid</span>
                        <span className="font-semibold text-yellow-600">{stats.halfPaid}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 md:pt-6 border-t border-gray-100">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      {!isAdmin && (
                        <button
                          onClick={() => setShowRequestModal(true)}
                          className="w-full flex items-center justify-between p-2 md:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300"
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm">
                              <Plus size={14} className="text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Request New Leave</span>
                          </div>
                          <ChevronDown size={14} className="text-gray-400 rotate-270" />
                        </button>
                      )}
                      
                      <button 
                        onClick={handleExportLeaves}
                        disabled={exportLoading}
                        className="w-full flex items-center justify-between p-2 md:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm">
                            <Download size={14} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Export Leave Report</span>
                        </div>
                        {exportLoading ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ChevronDown size={14} className="text-gray-400 rotate-270" />
                        )}
                      </button>
                      
                      <button 
                        onClick={() => {
                          toast.success("Calendar view coming soon!", { icon: '📅' });
                        }}
                        className="w-full flex items-center justify-between p-2 md:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-300 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm">
                            <CalendarDays size={14} className="text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">View Leave Calendar</span>
                        </div>
                        <ChevronDown size={14} className="text-gray-400 rotate-270" />
                      </button>
                      
                      {isAdmin && (
                        <button
                          onClick={() => toast.success("Policy management coming soon!", { icon: '⚙️' })}
                          className="w-full flex items-center justify-between p-2 md:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300"
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm">
                              <Shield size={14} className="text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Manage Leave Policies</span>
                          </div>
                          <ChevronDown size={14} className="text-gray-400 rotate-270" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Approved Leaves */}
                  <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-gray-100">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Upcoming Approved Leaves</h3>
                    <div className="space-y-2">
                      {leaves
                        .filter(l => l.status === 'Approved' && new Date(l.startDate) > new Date())
                        .slice(0, 3)
                        .map(leave => (
                          <div key={leave._id} className="p-2 md:p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {isAdmin ? (leave.employee?.name || 'Employee') : "Your Leave"}
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                {calculateDays(leave.startDate, leave.endDate)} days
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </div>
                          </div>
                        ))}
                      
                      {leaves.filter(l => l.status === 'Approved' && new Date(l.startDate) > new Date()).length === 0 && (
                        <div className="text-center py-3 md:py-4">
                          <p className="text-gray-500 text-sm">No upcoming approved leaves</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}