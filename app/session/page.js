// app/sessions/page.jsx - Complete Single Page Design
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  // Icons
  Clock, Calendar, Filter, Search, Download, Trash2, Eye, MoreVertical,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User, Smartphone,
  Globe, Shield, AlertCircle, CheckCircle, XCircle, RefreshCw, BarChart3,
  Users, Smartphone as DeviceIcon, Zap, CalendarDays, Clock as ClockIcon,
  DollarSign, TrendingUp, ShieldAlert, FileText, Settings, LogOut, Plus,
  Edit, Save, X, History, Building, Briefcase, CreditCard, Activity,
  MapPin, Mail, Phone, Lock, EyeOff, Upload, Camera, Image as ImageIcon,
  Loader2, ExternalLink, Bell, AlertTriangle, Check, Info, HelpCircle,
  Star, Award, Target, PieChart, LineChart, BarChart, Cloud, Database,
  HardDrive, ShieldCheck, Key, Cpu, Wifi, Battery, Signal, Thermometer,
  Wind, Sun, Moon, CloudRain, CloudSnow, CloudLightning,
  // Additional icons for purple theme
  Home, UserPlus, UserCheck, UserX, CheckSquare, Square, PlayCircle,
  PauseCircle, StopCircle, BatteryCharging, Server, Network, Bluetooth,
  Radio, Satellite, WifiOff, SignalHigh, SignalMedium, SignalLow,
  ThermometerSun, ThermometerSnowflake, CloudOff, SunDim, MoonStar,
  Sunrise, Sunset, CloudSun, CloudMoon, CloudFog, WindIcon,
  Droplets, Umbrella, Snowflake, Tornado, Hurricane, Earthquake,
  Volcano, Meteor, Alien, Ghost, Skull, Heart, HeartPulse,
  Brain, Bone, Pill, Stethoscope, Ambulance, Hospital,
  // Tab icons
  LayoutDashboard, Table, Grid, List,  Map,
  // Analytics icons
  TrendingDown, TrendingUp as TrendingUpIcon, Target as TargetIcon,
  BarChart as BarChartIcon, LineChart as LineChartIcon,
  // Settings icons
  Sliders, ToggleLeft, ToggleRight, BellRing, Mail as MailIcon,
  MessageSquare, PhoneCall, Video, Mic, MicOff, Headphones,
  Volume2, VolumeX, Settings as SettingsIcon, Key as KeyIcon,
  Shield as ShieldIcon, Lock as LockIcon, Unlock, Fingerprint,
  QrCode, Scan, Camera as CameraIcon, Video as VideoIcon,
  Radio as RadioIcon, Bluetooth as BluetoothIcon, Wifi as WifiIcon,
  // User icons
  UserCircle, UserRound, Users as UsersIcon, UserRoundCheck,
  UserRoundPlus, UserRoundX, UserRoundSearch, UserRoundCog,
  // Device icons
  Smartphone as SmartphoneIcon, Tablet, Monitor, Laptop,
  Printer, Scanner, Router, HardDrive as HardDriveIcon,
  Database as DatabaseIcon, Server as ServerIcon,
  // Location icons
  MapPin as MapPinIcon, Navigation, Compass, Globe as GlobeIcon,
  Map as MapIcon, Flag, Navigation as NavigationIcon,
  // Time icons
  Watch, AlarmClock, Timer, Hourglass, Calendar as CalendarIcon,
  CalendarClock, CalendarDays as CalendarDaysIcon,
  CalendarCheck, CalendarX,
  // Status icons
  Circle, CircleDot, CircleCheck, CircleX, CircleAlert,
  CircleHelp, CircleMinus, CirclePlus, Radio as RadioIcon2,
  Dot, DotSquare,
  // Action icons
  Play, Pause, Stop, SkipBack, SkipForward, Rewind, FastForward,
  Power, PowerOff, Zap as ZapIcon, Battery as BatteryIcon,
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning,
  // File icons
  File, FileText as FileTextIcon, FileCode, FileSpreadsheet,
  FileArchive, FileAudio, FileVideo, FileImage, FilePdf,
  FileWord, FileExcel, FilePowerpoint,
  // Arrow icons
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight,
  ArrowDownRight, ArrowUpLeft, ArrowDownLeft, MoveLeft,
  MoveRight, MoveUp, MoveDown, ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon, ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  // Other icons
  Star as StarIcon, Heart as HeartIcon, ThumbsUp, ThumbsDown,
  Bookmark, BookmarkCheck, Tag, Tags, Hash, AtSign, Percent,
  DollarSign as DollarSignIcon, Euro, PoundSterling, Yen,
  Bitcoin, CreditCard as CreditCardIcon, Wallet, Receipt,
  ShoppingCart, Package, Truck, Home as HomeIcon, Building as BuildingIcon,
  Factory, Warehouse, Store, Hotel, School, University, Hospital as HospitalIcon,
  Church, Mosque, TempleHindu, TempleBuddhist, Synagogue,
  // Weather icons
  Cloud as CloudIcon, CloudDrizzle, CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon, CloudLightning as CloudLightningIcon,
  CloudFog as CloudFogIcon, Sun as SunIcon, Moon as MoonIcon,
  Sunrise as SunriseIcon, Sunset as SunsetIcon, Thermometer as ThermometerIcon,
    Droplets as DropletsIcon,
  // Sports icons
  Trophy, Medal, Award as AwardIcon, Crown, Flag as FlagIcon,
  Target as TargetIcon2, Sword, Shield as ShieldIcon2, Helmet,
  // Food icons
  Apple, Banana, Carrot, Pizza, Hamburger, Coffee, Wine, Beer,
  // Travel icons
  Car, Bus, Train, Plane, Ship, Bike, Walking, Running,
  // Music icons
  Music, Headphones as HeadphonesIcon, Radio as RadioIcon3,
  Microphone as MicrophoneIcon, Volume as VolumeIcon,
  // Game icons
  Gamepad2, Dice, Chess, Puzzle,
  // Communication icons
  Phone as PhoneIcon, Mail as MailIcon2, MessageCircle,
  MessageSquare as MessageSquareIcon, PhoneCall as PhoneCallIcon,
  Video as VideoIcon2,
  // Social icons
  Facebook, Instagram, Twitter, Youtube, Linkedin, Github,
  // Tech icons
  Code, Terminal, Cpu as CpuIcon, MemoryStick, HardDrive as HardDriveIcon2,
  Server as ServerIcon2, Database as DatabaseIcon2, Network as NetworkIcon,
  Wifi as WifiIcon2, Bluetooth as BluetoothIcon2, Radio as RadioIcon4,
  Satellite as SatelliteIcon, QrCode as QrCodeIcon, Scan as ScanIcon,
  // Shopping icons
  ShoppingBag, ShoppingCart as ShoppingCartIcon, Store as StoreIcon,
  Tag as TagIcon, Percent as PercentIcon, Ticket, Gift,
  // Finance icons
  CreditCard as CreditCardIcon2, Wallet as WalletIcon, Banknote,
  Coins, PiggyBank, TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon, ChartBar, ChartLine,
  ChartPie,
  // Health icons
  Heart as HeartIcon2, HeartPulse as HeartPulseIcon, Pill as PillIcon,
  Stethoscope as StethoscopeIcon, Syringe, Thermometer as ThermometerIcon2,
  // Education icons
  Book, BookOpen, GraduationCap, School as SchoolIcon,
  University as UniversityIcon,
  // Nature icons
  Leaf, Tree, Flower, Mountain, Waves, Fish, Bird, Cat, Dog,
  // Tools icons
  Wrench, Hammer, Screwdriver, Drill, Paintbrush, Palette,
  Scissors, Ruler, EyeDropper,
  // Safety icons
  Shield as ShieldIcon3, ShieldCheck as ShieldCheckIcon,
  ShieldAlert as ShieldAlertIcon, Lock as LockIcon2,
  Key as KeyIcon2, Fingerprint as FingerprintIcon,
  // Transportation icons
  Car as CarIcon, Bus as BusIcon, Train as TrainIcon,
  Plane as PlaneIcon, Ship as ShipIcon, Bike as BikeIcon,
  // Real estate icons
  Home as HomeIcon2, Building as BuildingIcon2, Factory as FactoryIcon,
  Warehouse as WarehouseIcon, Store as StoreIcon2, Hotel as HotelIcon,
  // Religion icons
  Church as ChurchIcon, Mosque as MosqueIcon, TempleHindu as TempleHinduIcon,
  TempleBuddhist as TempleBuddhistIcon, Synagogue as SynagogueIcon,
  StarOfDavid, Om, YinYang,
  // Holiday icons
  ChristmasTree, Gift as GiftIcon, Snowflake as SnowflakeIcon,
  Fire, Candle, Menorah,
  // Space icons
  Rocket, SatelliteDish, UFO, Alien as AlienIcon,
  Meteor as MeteorIcon, Planet, Galaxy, Telescope,
  // Fantasy icons
  Dragon, Unicorn, Wizard, Fairy, Ghost as GhostIcon,
  Skull as SkullIcon, Sword as SwordIcon, Shield as ShieldIcon4,
  Helmet as HelmetIcon,
  // Office icons
  Briefcase as BriefcaseIcon, Clipboard, File as FileIcon,
  Folder, FolderOpen, Archive, Printer as PrinterIcon,
  Scanner as ScannerIcon,
  // Home icons
  Sofa, Bed, Bath, Kitchen, Dining, Chair, Lamp, Tv,
  // Fashion icons
  Shirt, TShirt, Dress, Glasses, Hat, Shoe, Bag, Jewelry,
  // Art icons
  Paintbrush as PaintbrushIcon, Palette as PaletteIcon,
  Camera as CameraIcon2, Film, Music as MusicIcon2,
  Theater, Mask,
  // Science icons
  Atom, Flask, Microscope, Telescope as TelescopeIcon,
  DNA, Virus, Magnet, Lightbulb,
  // Law icons
  Scale, Gavel, LawBook, Handcuffs, Police,
  // Military icons
  Tank, FighterJet, Warship, Gun, Bomb,
  // Agriculture icons
  Tractor, Barn, Wheat, Corn, Cow, Chicken,
  // Construction icons
  Crane, Excavator, Bulldozer, HardHat, CementMixer,
  // Entertainment icons
  Film as FilmIcon, Tv as TvIcon, Radio as RadioIcon5,
  Gamepad as GamepadIcon, Dice as DiceIcon, Chess as ChessIcon,
  // Utility icons
  Flashlight, Battery as BatteryIcon2, Plug, Outlet,
  Lightbulb as LightbulbIcon, FireExtinguisher, FirstAid,
  // Navigation icons
  Compass as CompassIcon, Map as MapIcon2, Navigation as NavigationIcon2,
  Flag as FlagIcon2, Signpost,
  // Text icons
  Type, Bold, Italic, Underline, Strikethrough, Heading,
  Paragraph, List as ListIcon, ListOrdered, ListChecks,
  Quote, Code as CodeIcon2, Terminal as TerminalIcon,
  // Media icons
  Play as PlayIcon, Pause as PauseIcon, Stop as StopIcon,
  SkipBack as SkipBackIcon, SkipForward as SkipForwardIcon,
  Rewind as RewindIcon, FastForward as FastForwardIcon,
  Volume as VolumeIcon2, Volume1, Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon, Mic as MicIcon, MicOff as MicOffIcon,
  Headphones as HeadphonesIcon2,
  // Communication icons 2
  Phone as PhoneIcon2, PhoneOff, PhoneMissed, PhoneForwarded,
  PhoneIncoming, PhoneOutgoing, Voicemail, Message as MessageIcon,
  MessageCircle as MessageCircleIcon, MessageSquare as MessageSquareIcon2,
  MessageSquareDashed, MessageSquarePlus,
  // Social icons 2
  Facebook as FacebookIcon, Instagram as InstagramIcon,
  Twitter as TwitterIcon, Youtube as YoutubeIcon,
  Linkedin as LinkedinIcon, Github as GithubIcon,
  Gitlab, Bitbucket, Slack, Discord, Twitch, Reddit,
  // Brand icons
  Apple as AppleIcon, Windows, Linux, Android, Chrome,
  Firefox, Safari, Edge, Opera,
  // Payment icons
  CreditCard as CreditCardIcon3, Bitcoin as BitcoinIcon,
  Ethereum, Paypal, Stripe, Visa, Mastercard, AmericanExpress,
  // Document icons
  File as FileIcon2, FileText as FileTextIcon2, FileCode as FileCodeIcon,
  FileSpreadsheet as FileSpreadsheetIcon, FileArchive as FileArchiveIcon,
  FileAudio as FileAudioIcon, FileVideo as FileVideoIcon,
  FileImage as FileImageIcon, FilePdf as FilePdfIcon,
  FileWord as FileWordIcon, FileExcel as FileExcelIcon,
  FilePowerpoint as FilePowerpointIcon,
  // Data icons
  Database as DatabaseIcon3, Server as ServerIcon3,
  Cloud as CloudIcon2, HardDrive as HardDriveIcon3,
  MemoryStick as MemoryStickIcon, Cpu as CpuIcon2,
  // Network icons
  Wifi as WifiIcon3, WifiOff as WifiOffIcon, Bluetooth as BluetoothIcon3,
  Radio as RadioIcon6, Satellite as SatelliteIcon2,
  Network as NetworkIcon2, Router as RouterIcon,
  // Security icons
  Shield as ShieldIcon5, ShieldCheck as ShieldCheckIcon2,
  ShieldAlert as ShieldAlertIcon2, Lock as LockIcon3,
  Key as KeyIcon3, Fingerprint as FingerprintIcon2,
  QrCode as QrCodeIcon2, Scan as ScanIcon2,
  // Time icons 2
  Watch as WatchIcon, AlarmClock as AlarmClockIcon,
  Timer as TimerIcon, Hourglass as HourglassIcon,
  Calendar as CalendarIcon2, CalendarClock as CalendarClockIcon,
  CalendarDays as CalendarDaysIcon2, CalendarCheck as CalendarCheckIcon,
  CalendarX as CalendarXIcon,
  // Weather icons 2
  Cloud as CloudIcon3, CloudDrizzle as CloudDrizzleIcon,
  CloudRain as CloudRainIcon2, CloudSnow as CloudSnowIcon2,
  CloudLightning as CloudLightningIcon2, CloudFog as CloudFogIcon2,
  Sun as SunIcon2, Moon as MoonIcon2, Sunrise as SunriseIcon2,
  Sunset as SunsetIcon2, Thermometer as ThermometerIcon3,
  Umbrella as UmbrellaIcon2, Wind as WindIcon2,
  Droplets as DropletsIcon2,
  // Food icons 2
  Apple as AppleIcon2, Banana as BananaIcon, Carrot as CarrotIcon,
  Pizza as PizzaIcon, Hamburger as HamburgerIcon,
  Coffee as CoffeeIcon, Wine as WineIcon, Beer as BeerIcon,
  // Travel icons 2
  Car as CarIcon2, Bus as BusIcon2, Train as TrainIcon2,
  Plane as PlaneIcon2, Ship as ShipIcon2, Bike as BikeIcon2,
  Walking as WalkingIcon, Running as RunningIcon,
  // Music icons 2
  Music as MusicIcon3, Headphones as HeadphonesIcon3,
  Radio as RadioIcon7, Microphone as MicrophoneIcon2,
  Volume as VolumeIcon3,
  // Game icons 2
  Gamepad2 as GamepadIcon2, Dice as DiceIcon2, Chess as ChessIcon2,
  Puzzle as PuzzleIcon,
  // Communication icons 3
  Phone as PhoneIcon3, Mail as MailIcon3, MessageCircle as MessageCircleIcon2,
  MessageSquare as MessageSquareIcon3, PhoneCall as PhoneCallIcon2,
  Video as VideoIcon3,
  // Social icons 3
  Facebook as FacebookIcon2, Instagram as InstagramIcon2,
  Twitter as TwitterIcon2, Youtube as YoutubeIcon2,
  Linkedin as LinkedinIcon2, Github as GithubIcon2,
  // Shopping icons 2
  ShoppingBag as ShoppingBagIcon, ShoppingCart as ShoppingCartIcon2,
  Store as StoreIcon3, Tag as TagIcon2, Percent as PercentIcon2,
  Ticket as TicketIcon, Gift as GiftIcon2,
  // Finance icons 2
  CreditCard as CreditCardIcon4, Wallet as WalletIcon2,
  Banknote as BanknoteIcon, Coins as CoinsIcon,
  PiggyBank as PiggyBankIcon, TrendingUp as TrendingUpIcon3,
  TrendingDown as TrendingDownIcon2, ChartBar as ChartBarIcon,
  ChartLine as ChartLineIcon, ChartPie as ChartPieIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  
  // ==================== STATE VARIABLES ====================
  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPerPage, setSessionsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    dateRange: '30days',
    search: '',
    device: 'all',
    showAutoDelete: false,
    startDate: '',
    endDate: ''
  });
  
  // View mode
  const [viewMode, setViewMode] = useState('table'); // 'table', 'card', 'timeline'
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions', 'analytics', 'deletion'
  
  // Selected sessions for bulk operations
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    expired: 0,
    terminated: 0,
    totalHours: 0,
    avgDuration: '0m',
    deletionCount: 0,
    uniqueUsers: 0,
    avgSessionDuration: 0
  });
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    dailyStats: [],
    deviceStats: [],
    roleDistribution: [],
    hourlyTrends: []
  });
  
  // Auto-delete data
  const [deletionData, setDeletionData] = useState({
    sessionsNearingDeletion: [],
    nextCleanup: new Date(Date.now() + 24 * 60 * 60 * 1000),
    retentionDays: 30,
    autoDeleteEnabled: true
  });
  
  // User settings
  const [userSettings, setUserSettings] = useState({
    theme: 'purple',
    compactView: false,
    darkMode: false,
    notifications: true,
    autoRefresh: false
  });
  
  // ==================== HELPER FUNCTIONS ====================
  
  // Get user type and token
  const getUserType = () => {
    if (typeof window === 'undefined') return null;
    if (localStorage.getItem("adminToken")) return "admin";
    if (localStorage.getItem("employeeToken")) return "employee";
    if (localStorage.getItem("moderatorToken")) return "moderator";
    return null;
  };
  
  const getCurrentToken = () => {
    const userType = getUserType();
    switch(userType) {
      case 'admin':
        return localStorage.getItem("adminToken");
      case 'employee':
        return localStorage.getItem("employeeToken");
      case 'moderator':
        return localStorage.getItem("moderatorToken");
      default:
        return null;
    }
  };
  
  // User role helpers
  const isAdmin = () => user?.role === "admin" || user?.role === "superAdmin";
  const isModerator = () => user?.role === "moderator";
  const isEmployee = () => user?.role === "employee";
  
  // Get role color (purple theme)
  const getRoleColor = (role) => {
    switch(role) {
      case 'admin':
      case 'superAdmin':
        return {
          bg: 'from-indigo-500 to-purple-600',
          text: 'text-indigo-600',
          light: 'bg-indigo-50 text-indigo-700',
          dark: 'bg-indigo-900 text-indigo-100'
        };
      case 'moderator':
        return {
          bg: 'from-violet-500 to-purple-500',
          text: 'text-violet-600',
          light: 'bg-violet-50 text-violet-700',
          dark: 'bg-violet-900 text-violet-100'
        };
      case 'employee':
        return {
          bg: 'from-purple-500 to-pink-500',
          text: 'text-purple-600',
          light: 'bg-purple-50 text-purple-700',
          dark: 'bg-purple-900 text-purple-100'
        };
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          text: 'text-gray-600',
          light: 'bg-gray-50 text-gray-700',
          dark: 'bg-gray-900 text-gray-100'
        };
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return {
          color: 'bg-gradient-to-r from-emerald-500 to-green-500',
          text: 'Active',
          icon: <Zap className="w-3 h-3" />,
          light: 'bg-emerald-50 text-emerald-700'
        };
      case 'completed':
        return {
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          text: 'Completed',
          icon: <CheckCircle className="w-3 h-3" />,
          light: 'bg-blue-50 text-blue-700'
        };
      case 'expired':
        return {
          color: 'bg-gradient-to-r from-orange-500 to-amber-500',
          text: 'Expired',
          icon: <Clock className="w-3 h-3" />,
          light: 'bg-orange-50 text-orange-700'
        };
      case 'terminated':
        return {
          color: 'bg-gradient-to-r from-red-500 to-pink-500',
          text: 'Terminated',
          icon: <XCircle className="w-3 h-3" />,
          light: 'bg-red-50 text-red-700'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'Unknown',
          icon: <HelpCircle className="w-3 h-3" />,
          light: 'bg-gray-50 text-gray-700'
        };
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };
  
  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    
    return `${Math.floor(minutes)}m`;
  };
  
  // Format time ago
  const timeAgo = (dateString) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return formatDate(dateString);
  };
  
  // ==================== API FUNCTIONS ====================
  
  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = getCurrentToken();
      if (!token) {
        router.push("/");
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/getProfile`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        router.push("/");
        return;
      }
      
      const data = await response.json();
      if (data.user || data._id) {
        const userData = data.user || data;
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    }
  };
  
  // Fetch sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = getCurrentToken();
      
      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/sessions/my-sessions`;
      if (isAdmin()) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/sessions/admin/all`;
      } else if (isModerator()) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/sessions/moderator/sessions`;
      }
      
      // Add query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: sessionsPerPage,
        status: filters.status !== 'all' ? filters.status : '',
        role: isAdmin() && filters.role !== 'all' ? filters.role : '',
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
        setFilteredSessions(data.data || []);
        setTotalSessions(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
        
        // Update stats
        if (data.statistics) {
          setStats({
            total: data.statistics.totalSessions || 0,
            active: data.statistics.activeSessions || 0,
            totalHours: parseFloat(data.statistics.totalHours || 0).toFixed(2),
            avgDuration: formatDuration(data.statistics.avgDuration || 0),
            deletionCount: data.statistics.deletionCount || 0,
            uniqueUsers: data.statistics.uniqueUsers || 0,
            avgSessionDuration: data.statistics.avgSessionDuration || 0
          });
        }
        
        // Update theme
        if (data.theme === 'purple') {
          document.documentElement.classList.add('purple-theme');
        }
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const token = getCurrentToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || {});
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };
  
  // Fetch deletion data
  const fetchDeletionData = async () => {
    try {
      const token = getCurrentToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/deletion-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeletionData(data.data || {});
      }
    } catch (error) {
      console.error("Failed to fetch deletion data:", error);
    }
  };
  
  // ==================== FILTER FUNCTIONS ====================
  
  const applyFilters = () => {
    let filtered = [...sessions];
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }
    
    // Role filter (admin only)
    if (isAdmin() && filters.role !== 'all') {
      filtered = filtered.filter(session => session.userRole === filters.role);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.userName?.toLowerCase().includes(searchLower) ||
        session.userEmail?.toLowerCase().includes(searchLower) ||
        session.device?.toLowerCase().includes(searchLower) ||
        session.ip?.includes(searchLower) ||
        session.sessionNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    // Auto-delete filter
    if (filters.showAutoDelete) {
      filtered = filtered.filter(session => session.daysUntilDeletion <= 7);
    }
    
    // Device filter
    if (filters.device !== 'all') {
      filtered = filtered.filter(session => 
        session.device?.toLowerCase().includes(filters.device.toLowerCase())
      );
    }
    
    setFilteredSessions(filtered);
    setTotalPages(Math.ceil(filtered.length / sessionsPerPage));
  };
  
  // ==================== EVENT HANDLERS ====================
  
  // Session selection
  const handleSessionSelect = (sessionId) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
    } else {
      setSelectedSessions([...selectedSessions, sessionId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSessions([]);
      setSelectAll(false);
    } else {
      setSelectedSessions(filteredSessions.slice(0, sessionsPerPage).map(session => session.id));
      setSelectAll(true);
    }
  };
  
  // Bulk operations
  const handleBulkDelete = async () => {
    if (!selectedSessions.length) {
      toast.error("Please select sessions to delete");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedSessions.length} sessions? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = getCurrentToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionIds: selectedSessions })
      });
      
      if (response.ok) {
        toast.success(`Successfully deleted ${selectedSessions.length} sessions`);
        setSelectedSessions([]);
        setSelectAll(false);
        fetchSessions();
      } else {
        toast.error("Failed to delete sessions");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete sessions");
    }
  };
  
  const handleBulkExtend = async () => {
    if (!selectedSessions.length) {
      toast.error("Please select sessions to extend");
      return;
    }
    
    const days = prompt("Enter number of days to extend (1-90):", "30");
    if (!days || isNaN(days) || days < 1 || days > 90) {
      toast.error("Please enter a valid number between 1 and 90");
      return;
    }
    
    try {
      const token = getCurrentToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/admin/bulk-extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sessionIds: selectedSessions,
          days: parseInt(days)
        })
      });
      
      if (response.ok) {
        toast.success(`Extended ${selectedSessions.length} sessions by ${days} days`);
        setSelectedSessions([]);
        setSelectAll(false);
        fetchSessions();
      } else {
        toast.error("Failed to extend sessions");
      }
    } catch (error) {
      console.error("Bulk extend error:", error);
      toast.error("Failed to extend sessions");
    }
  };
  
  // Session actions
  const handleTerminateSession = async (sessionId) => {
    if (!confirm("Are you sure you want to terminate this session?")) return;
    
    try {
      const token = getCurrentToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/terminate/${sessionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success("Session terminated successfully");
        fetchSessions();
      } else {
        toast.error("Failed to terminate session");
      }
    } catch (error) {
      console.error("Terminate error:", error);
      toast.error("Failed to terminate session");
    }
  };
  
  const handleViewSession = (sessionId) => {
    router.push(`/sessions/${sessionId}`);
  };
  
  // Export functions
  const handleExport = async (format = 'json') => {
    try {
      const token = getCurrentToken();
      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/sessions/export`;
      
      if (isAdmin()) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/sessions/admin/export-all`;
      }
      
      const params = new URLSearchParams({
        format,
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status !== 'all' ? filters.status : ''
      });
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (format === 'csv') {
          // Convert to CSV
          const csvContent = convertToCSV(data.data);
          downloadFile(csvContent, `sessions_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
          toast.success("Exported as CSV");
        } else {
          // Download JSON
          const jsonContent = JSON.stringify(data.data, null, 2);
          downloadFile(jsonContent, `sessions_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
          toast.success("Exported as JSON");
        }
      } else {
        toast.error("Failed to export sessions");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export sessions");
    }
  };
  
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const cell = row[header];
        if (cell === null || cell === undefined) return '';
        if (typeof cell === 'string') return `"${cell.replace(/"/g, '""')}"`;
        return String(cell);
      }).join(','))
    ];
    
    return csvRows.join('\n');
  };
  
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  // Pagination
   // Pagination handlers
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const handleSessionsPerPageChange = (e) => {
    setSessionsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };
  
  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleDateRangeChange = (range) => {
    const now = new Date();
    let startDate = '';
    let endDate = new Date().toISOString().split('T')[0];
    
    switch(range) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        startDate = yesterday.toISOString().split('T')[0];
        break;
      case '7days':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case '30days':
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case '90days':
        const quarterAgo = new Date(now);
        quarterAgo.setDate(now.getDate() - 90);
        startDate = quarterAgo.toISOString().split('T')[0];
        break;
      case 'custom':
        // Let user pick custom dates
        return;
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: range,
      startDate,
      endDate
    }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      role: 'all',
      dateRange: '30days',
      search: '',
      device: 'all',
      showAutoDelete: false,
      startDate: '',
      endDate: ''
    });
    setSelectedSessions([]);
    setSelectAll(false);
  };
  
  // ==================== USE EFFECTS ====================
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchAnalytics();
      fetchDeletionData();
    }
  }, [user, currentPage, sessionsPerPage]);
  
  useEffect(() => {
    applyFilters();
  }, [filters, sessions]);
  
  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (userSettings.autoRefresh) {
      interval = setInterval(() => {
        fetchSessions();
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userSettings.autoRefresh]);
  
  // ==================== RENDER COMPONENTS ====================
  
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow animate-pulse">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="p-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Stats cards component
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Total Sessions</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% this month</span>
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Active Now</p>
            <p className="text-3xl font-bold mt-2">{stats.active}</p>
            <div className="flex items-center mt-2 text-sm">
              <Users className="w-4 h-4 mr-1" />
              <span>{stats.uniqueUsers} unique users</span>
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Activity className="w-8 h-8" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Avg Duration</p>
            <p className="text-3xl font-bold mt-2">{stats.avgDuration}</p>
            <div className="flex items-center mt-2 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>{stats.totalHours} total hours</span>
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <ClockIcon className="w-8 h-8" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm font-medium">Auto Delete</p>
            <p className="text-3xl font-bold mt-2">{stats.deletionCount}</p>
            <div className="flex items-center mt-2 text-sm">
              <ShieldAlert className="w-4 h-4 mr-1" />
              <span>Next cleanup: {new Date(deletionData.nextCleanup).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Shield className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
  
  // Filter bar component
  const FilterBar = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sessions..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
          
          {isAdmin() && (
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="employee">Employee</option>
            </select>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {filters.startDate && filters.endDate && (
        <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4 mr-1" />
          Showing sessions from {filters.startDate} to {filters.endDate}
        </div>
      )}
    </div>
  );
  
  // Session table component
  const SessionTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session History</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {filteredSessions.length} sessions found
              {selectedSessions.length > 0 && ` • ${selectedSessions.length} selected`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">View:</span>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <Table className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <home className="w-5 h-5" />
              </button>
            </div>
            
            {selectedSessions.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all flex items-center"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Selected
                </button>
                {isAdmin() && (
                  <button
                    onClick={handleBulkExtend}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Extend Selected
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">User</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Session</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Duration</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Device</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSessions.slice((currentPage - 1) * sessionsPerPage, currentPage * sessionsPerPage).map((session) => {
              const roleColor = getRoleColor(session.userRole);
              const statusBadge = getStatusBadge(session.status);
              
              return (
                <tr 
                  key={session.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={() => handleSessionSelect(session.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${roleColor.bg} text-white`}>
                        {session.userName?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900 dark:text-white">{session.userName || 'Unknown'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{session.userEmail || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">#{session.sessionNumber || session.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(session.startTime)}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <DeviceIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{session.device || 'Unknown'}</span>
                    </div>
                    {session.ip && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{session.ip}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.light}`}>
                        {statusBadge.icon}
                        <span className="ml-1.5">{statusBadge.text}</span>
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewSession(session.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      {session.status === 'active' && (
                        <button
                          onClick={() => handleTerminateSession(session.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Terminate Session"
                        >
                          <PowerOff className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredSessions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
  
  // Session cards view
  const SessionCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSessions.slice((currentPage - 1) * sessionsPerPage, currentPage * sessionsPerPage).map((session) => {
        const roleColor = getRoleColor(session.userRole);
        const statusBadge = getStatusBadge(session.status);
        
        return (
          <div 
            key={session.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => handleSessionSelect(session.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                  />
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${roleColor.bg} text-white`}>
                    {session.userName?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{session.userName || 'Unknown'}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleColor.light} mt-1`}>
                      {session.userRole || 'User'}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.light}`}>
                  {statusBadge.icon}
                  <span className="ml-1.5">{statusBadge.text}</span>
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(session.startTime)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatDuration(session.duration)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Smartphone className="w-4 h-4 mr-2" />
                  <span>{session.device || 'Unknown device'}</span>
                </div>
                {session.ip && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="font-mono">{session.ip}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Session #{session.sessionNumber || session.id.slice(0, 8)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewSession(session.id)}
                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  {session.status === 'active' && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Terminate Session"
                    >
                      <PowerOff className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Analytics tab component
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session Activity</h3>
            <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Session activity chart</p>
              <p className="text-sm text-gray-400">Analytics data would appear here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Device Distribution</h3>
          <div className="space-y-4">
            {[
              { device: 'Mobile', count: 45, color: 'bg-purple-500' },
              { device: 'Desktop', count: 30, color: 'bg-indigo-500' },
              { device: 'Tablet', count: 15, color: 'bg-violet-500' },
              { device: 'Other', count: 10, color: 'bg-gray-400' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.device}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.count}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Peak Hours</h3>
          <div className="space-y-3">
            {[
              { hour: '9:00 AM', sessions: 42 },
              { hour: '12:00 PM', sessions: 68 },
              { hour: '3:00 PM', sessions: 45 },
              { hour: '6:00 PM', sessions: 32 },
              { hour: '9:00 PM', sessions: 21 }
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{item.hour}</div>
                <div className="flex-1 ml-4">
                  <div className="flex items-center">
                    <div 
                      className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-l"
                      style={{ width: `${(item.sessions / 68) * 100}%` }}
                    ></div>
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{item.sessions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Role Activity</h3>
          <div className="space-y-4">
            {[
              { role: 'Admin', sessions: 120, avgDuration: '2h 30m' },
              { role: 'Moderator', sessions: 85, avgDuration: '1h 45m' },
              { role: 'Employee', sessions: 250, avgDuration: '3h 15m' }
            ].map((item, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(item.role.toLowerCase()).bg} text-white`}>
                  {item.role.charAt(0)}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.role}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.sessions} sessions</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{item.avgDuration}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg duration</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Auto-deletion tab component
  const DeletionTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Auto-Deletion Settings</h3>
            <p className="text-purple-100 mt-2">
              Sessions older than {deletionData.retentionDays} days are automatically deleted
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-3xl font-bold">{deletionData.sessionsNearingDeletion?.length || 0}</div>
              <div className="text-sm text-purple-200">Nearing deletion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {new Date(deletionData.nextCleanup).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-sm text-purple-200">Next cleanup</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
            Change Retention Period
          </button>
          <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium border border-white/30">
            Run Cleanup Now
          </button>
          <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium border border-white/30">
            Download Report
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sessions Nearing Deletion</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Sessions that will be automatically deleted in the next cleanup
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Session</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">User</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Created</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Days Left</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deletionData.sessionsNearingDeletion?.slice(0, 5).map((session, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      #{session.id?.slice(0, 8) || `SESSION-${index + 1}`}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 dark:text-white">User {index + 1}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">user{index + 1}@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    {formatDate(session.createdAt || new Date(Date.now() - (7 - session.daysLeft) * 24 * 60 * 60 * 1000))}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.daysLeft <= 1 ? 'bg-red-100 text-red-800' :
                        session.daysLeft <= 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.daysLeft} day{session.daysLeft !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                      Exempt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-300">
              Showing {Math.min(5, deletionData.sessionsNearingDeletion?.length || 0)} of {deletionData.sessionsNearingDeletion?.length || 0} sessions
            </p>
            <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Pagination component
  const Pagination = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Showing {(currentPage - 1) * sessionsPerPage + 1} to {Math.min(currentPage * sessionsPerPage, filteredSessions.length)} of {filteredSessions.length} sessions
        </span>
        <select
          value={sessionsPerPage}
          onChange={handleSessionsPerPageChange}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
        >
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
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
              className={`w-10 h-10 rounded-lg ${
                currentPage === pageNum
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className="text-gray-500">...</span>
            <button
              onClick={() => handlePageChange(totalPages)}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
  
  // User profile dropdown
  const UserProfileDropdown = () => (
    <div className="relative">
      <button className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="text-left hidden md:block">
          <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Unknown role'}</p>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
  
  // ==================== MAIN RETURN ====================
  
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSkeleton />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in fetchUserData
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Session Manager</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Complete session monitoring</p>
                </div>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => userSettings.autoRefresh ? fetchSessions() : null}
                className="p-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${userSettings.autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              <UserProfileDropdown />
              
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/');
                }}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards />
        
        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${
                activeTab === 'sessions'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Table className="w-5 h-5" />
                <span>Sessions</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('deletion')}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${
                activeTab === 'deletion'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Auto-Deletion</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'sessions' && (
            <>
              <FilterBar />
              {viewMode === 'table' ? <SessionTable /> : <SessionCards />}
              {filteredSessions.length > sessionsPerPage && <Pagination />}
            </>
          )}
          
          {activeTab === 'analytics' && <AnalyticsTab />}
          
          {activeTab === 'deletion' && <DeletionTab />}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/5 dark:to-indigo-500/5 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleExport('csv')}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-3">
                <Download className="w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Export CSV</p>
            </button>
            
            <button
              onClick={() => toast.success("New session created")}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">New Session</p>
            </button>
            
            <button
              onClick={() => router.push('/settings')}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white mb-3">
                <Settings className="w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Settings</p>
            </button>
            
            <button
              onClick={() => window.open('/help', '_blank')}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Help Center</p>
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Session Manager. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Privacy Policy
              </button>
              <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Terms of Service
              </button>
              <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 