"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  Shield,
  UserCog,
  Clock,
  Wallet,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
  Settings,
  Calendar,
  Activity,
  CreditCard,
  User,
  Mail,
  Phone,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Building2,
  Briefcase,
  DollarSign,
  Cloud,
  Utensils,
  Car,
  MoreHorizontal,
  Filter,
  FileText,
  Eye,
  Award,
  Lock,
  Key,
  History,
  FileClock,
  TrendingUp,
  Zap,
  PieChart,
  Target,
  FileKey,
  CalendarClock,
  Logs
} from "lucide-react";
import Link from "next/link";

export default function sidebar() {
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const sidebarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // State for user data
  const [userData, setUserData] = useState({
    name: "Loading...",
    role: "employee",
    email: "example.longemailaddress@company.com",
    phone: "+880 1234 567890",
    employeeId: "EMP202400012345",
    picture: null,
    permissions: [],
    isSuperAdmin: false,
    moderatorLevel: "junior",
    canModerateUsers: false,
    canModerateContent: true,
    canViewReports: true,
    canManageReports: false
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setOpen(false);
        setCollapsed(false);
      } else {
        setOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check localStorage for collapsed preference
  useEffect(() => {
    if (!isMobile) {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setCollapsed(savedCollapsed);
    }
  }, [isMobile]);

  // Save collapsed preference to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }
  }, [collapsed, isMobile]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    if (isMobile) {
      setOpen(!open);
    } else {
      if (!collapsed) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
        setOpen(true);
      }
    }
  };

  // Toggle submenu function
  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Get sidebar width
  const getSidebarWidth = () => {
    if (isMobile) {
      return open ? 'w-80' : 'w-0';
    }
    
    if (collapsed) {
      return 'w-20';
    }
    
    return open ? 'w-64' : 'w-0';
  };

  // Fetch user data from localStorage
  useEffect(() => {
    const fetchUserData = () => {
      try {
        if (typeof window !== 'undefined') {
          // Check cache expiry first
          const expiry = localStorage.getItem('cacheExpiry');
          if (expiry && Date.now() > parseInt(expiry)) {
            console.log("Cache expired, clearing authentication...");
            handleAutoLogout();
            return;
          }

          const adminData = localStorage.getItem('adminData');
          const employeeData = localStorage.getItem('employeeData');
          const moderatorData = localStorage.getItem('moderatorData');
          const userData = localStorage.getItem('userData');
          
          let userInfo = {
            name: "User",
            role: "employee",
            email: "",
            phone: "",
            employeeId: "",
            picture: null,
            permissions: [],
            isSuperAdmin: false,
            moderatorLevel: "junior",
            canModerateUsers: false,
            canModerateContent: true,
            canViewReports: true,
            canManageReports: false
          };

          let parsedData = null;
          
          if (adminData) {
            try {
              parsedData = JSON.parse(adminData);
              userInfo.role = 'admin';
            } catch (e) { console.error("Error parsing adminData:", e); }
          }
          
          if (!parsedData && moderatorData) {
            try {
              parsedData = JSON.parse(moderatorData);
              userInfo.role = 'moderator';
            } catch (e) { console.error("Error parsing moderatorData:", e); }
          }
          
          if (!parsedData && employeeData) {
            try {
              parsedData = JSON.parse(employeeData);
              userInfo.role = 'employee';
            } catch (e) { console.error("Error parsing employeeData:", e); }
          }
          
          if (!parsedData && userData) {
            try {
              parsedData = JSON.parse(userData);
            } catch (e) { console.error("Error parsing userData:", e); }
          }

          if (parsedData) {
            if (parsedData.name || parsedData.fullName || parsedData.username) {
              userInfo.name = parsedData.name || parsedData.fullName || parsedData.username;
            }
            
            userInfo = { 
              ...userInfo, 
              ...parsedData,
              role: parsedData.role || userInfo.role
            };
          } else {
            const hasToken = localStorage.getItem('adminToken') || 
                            localStorage.getItem('employeeToken') || 
                            localStorage.getItem('moderatorToken') ||
                            localStorage.getItem('authToken');
            
            if (hasToken) {
              console.warn("Token found but no user data in localStorage");
            } else {
              console.log("No authentication found, redirecting to login...");
              router.push('/');
              return;
            }
          }

          console.log("Loaded user data:", userInfo);
          setUserData(userInfo);
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    
    const handleUserUpdate = () => fetchUserData();
    window.addEventListener('userDataUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleUserUpdate);
    };
  }, [router]);

  const isAdmin = userData.role === 'admin' || userData.role === 'superAdmin';
  const isModerator = userData.role === 'moderator';
  const isEmployee = userData.role === 'employee';
  const isSuperAdmin = userData.isSuperAdmin;

  // Auto logout when cache expires
  const handleAutoLogout = () => {
    console.log("Auto logout triggered");
    
    // Clear only authentication data, keep other cache
    const keysToRemove = [
      'adminToken',
      'employeeToken', 
      'moderatorToken',
      'authToken',
      'adminData',
      'employeeData',
      'moderatorData',
      'userData',
      'currentUserRole',
      'token',
      'auth_token',
      'refresh_token',
      'session_token',
      'cacheExpiry'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Keep these cache items: sidebarCollapsed, theme, language, etc.
    
    // Reset user data
    setUserData({
      name: "User",
      role: "employee",
      email: "",
      phone: "",
      employeeId: "",
      picture: null,
      permissions: [],
      isSuperAdmin: false,
      moderatorLevel: "junior",
      canModerateUsers: false,
      canModerateContent: true,
      canViewReports: true,
      canManageReports: false
    });
    
    // Redirect to login
    router.push("/");
    
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  // Common menus for all roles (ONLY Profile)
  const commonMenus = [
    { 
      name: "Profile", 
      icon: <User size={20} />,
      path: "/profile", 
      roles: ['admin', 'moderator', 'employee'],
      showForAll: true
    },
  ];

  // Employee specific menus
  const employeeMenus = [
    { 
      name: "Attendance", 
      icon: <Clock size={20} />, 
      path: "/attendance", 
      roles: ['employee'],
    },
    { 
      name: "Leave Management", 
      icon: <Calendar size={20} />, 
      path: "/leave", 
      roles: ['employee'],
    },
    { 
      name: "Payroll", 
      icon: <Wallet size={20} />, 
      path: "/payroll", 
      roles: ['employee'],
    },
    { 
      name: "Office Schedule", 
      icon: <Calendar size={20} />, 
      path: "/officeSchedule", 
      roles: ['employee'],
    },
    { 
      name: "Holiday", 
      icon: <Award size={20} />, 
      path: "/holiday", 
      roles: ['employee'],
    },
    { 
      name: "Audit Logs", 
      icon: <FileClock size={20} />,
      path: "/audit", 
      roles: ['employee'],
    },
    { 
      name: "Shift Schedule", 
      icon: <CalendarClock size={20} />,
      path: "/shift-schedule", 
      roles: ['employee'],
      showForAll: true
    },
    { 
      name: "Meal Management", 
      icon: <Utensils size={20} />,
      path: "/meal", 
      roles: ['employee'],
    },
  ];

  // Moderator specific menus
  const moderatorMenus = [
    { 
      name: "Dashboard", 
      icon: <Home size={20} />, 
      path: "/moderatorDashboard", 
      roles: ['moderator'],
    },
  ];

  // Admin specific menus
  const adminMenus = [
    { 
      name: "Dashboard", 
      icon: <Home size={20} />, 
      path: "/dashboard", 
      roles: ['admin'],
    }, 
    { 
      name: "Attendance", 
      icon: <Clock size={20} />, 
      path: "/attendance", 
      roles: ['admin'],
    },
    { 
      name: "Leave Management", 
      icon: <Calendar size={20} />, 
      path: "/leave", 
      roles: ['admin'],
    },
    { 
      name: "Payroll", 
      icon: <Wallet size={20} />, 
      path: "/payroll", 
      roles: ['admin'],
    },
    { 
      name: "Office Schedule", 
      icon: <Calendar size={20} />, 
      path: "/officeSchedule", 
      roles: ['admin'],
    },
    { 
      name: "Holiday", 
      icon: <Award size={20} />, 
      path: "/holiday", 
      roles: ['admin'],
    },
    { 
      name: "Shift Schedule", 
      icon: <CalendarClock size={20} />,
      path: "/shift-schedule", 
      roles: ['admin'],
      showForAll: true
    },
    { 
      name: "Audit Logs", 
      icon: <FileClock size={20} />,
      path: "/audit", 
      roles: ['admin'],
    },
    { 
      name: "User Roles", 
      icon: <Shield size={20} />,
      path: "/user-roles", 
      roles: ['admin'],
    },
    { 
      name: "Meal Management", 
      icon: <Utensils size={20} />,
      path: "/meal", 
      roles: ['admin'],
    },
  ];

  // Cost Details Submenus (Only for Admin and Moderator)
  const costDetailsSubmenus = [
    { 
      name: "Office Rent", 
      icon: <Building2 size={18} />, 
      href: "/officeRent",
      roles: ['admin', 'moderator'],
    },
    { 
      name: "Utility Bills", 
      icon: <FileText size={18} />,
      href: "/utilityBills",
      roles: ['admin', 'moderator'],
    },
    { 
      name: "Office Supplies", 
      icon: <Briefcase size={18} />, 
      href: "/officeSupplies",
      roles: ['admin', 'moderator'],
    },
    { 
      name: "Software Subscriptions", 
      icon: <Cloud size={18} />, 
      href: "/subscriptions",
      roles: ['admin'], 
    },
    { 
      name: "Food Cost", 
      icon: <Utensils size={18} />, 
      href: "/foodCost",
      roles: ['admin', 'moderator'],
    },
    { 
      name: "Transport", 
      icon: <Car size={18} />, 
      href: "/transport",
      roles: ['admin', 'moderator'],
    },
    { 
      name: "Miscellaneous", 
      icon: <MoreHorizontal size={18} />, 
      href: "/miscellaneous",
      roles: ['admin', 'moderator'],
    },
  ];

  const getFilteredMenus = () => {
    let menus = [...commonMenus];
    
    if (isAdmin) {
      menus = [...menus, ...adminMenus];
      
      menus.push({
        name: "Cost Details",
        icon: <DollarSign size={20} />,
        path: "#",
        roles: ['admin'],
        hasSubmenu: true,
        submenus: costDetailsSubmenus.filter(submenu => submenu.roles.includes('admin'))
      });
    } else if (isModerator) {
      menus = [...menus, ...moderatorMenus];
      
      menus.push({
        name: "Cost Details",
        icon: <DollarSign size={20} />,
        path: "#",
        roles: ['moderator'],
        hasSubmenu: true,
        submenus: costDetailsSubmenus.filter(submenu => submenu.roles.includes('moderator'))
      });
    } else if (isEmployee) {
      menus = [...menus, ...employeeMenus];
    }
    
    return menus;
  };

  const filteredMenus = getFilteredMenus();

  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(progress);
        setShowScrollTop(scrollTop > 100);
        setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 100);
      }
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => sidebar.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({ 
        top: sidebarRef.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  };

  const handleLogout = () => {
    console.log("Manual logout triggered - Clearing authentication only");
    
    // Define authentication keys to remove
    const authKeysToRemove = [
      'adminToken',
      'employeeToken', 
      'moderatorToken',
      'authToken',
      'adminData',
      'employeeData',
      'moderatorData',
      'userData',
      'currentUserRole',
      'token',
      'auth_token',
      'refresh_token',
      'session_token',
      'cacheExpiry'
    ];
    
    // Remove only authentication keys
    authKeysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed auth key: ${key}`);
    });
    
    // Define cache keys to KEEP (these will NOT be removed)
    const cacheKeysToKeep = [
      'sidebarCollapsed',    // Sidebar state
      'theme',               // Theme preference
      'language',            // Language preference
      'recentSearches',      // Search history
      'tableFilters',        // Table filter preferences
      'formDataCache',       // Form data cache
      'notifications',       // Notification preferences
      'userPreferences',     // Other user preferences
      'dashboardLayout',     // Dashboard layout
      'lastVisitedPages',    // Navigation history
      'settings'             // App settings
    ];
    
    console.log("Keeping cache keys:", cacheKeysToKeep);
    
    // Clear sessionStorage (optional - depends on your needs)
    // sessionStorage.clear(); // Uncomment if you want to clear sessionStorage
    
    // Reset user data state
    setUserData({
      name: "User",
      role: "employee",
      email: "",
      phone: "",
      employeeId: "",
      picture: null,
      permissions: [],
      isSuperAdmin: false,
      moderatorLevel: "junior",
      canModerateUsers: false,
      canModerateContent: true,
      canViewReports: true,
      canManageReports: false
    });
    
    // Show logout confirmation
    console.log("Logout successful. Authentication cleared, cache preserved.");
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('userLoggedOut'));
    
    // Redirect to login page
    router.push("/");
    
    // Optional: Show toast notification
    if (typeof window !== 'undefined') {
      // You can add a toast notification here
      setTimeout(() => {
        // Reload to ensure clean state
        window.location.href = "/";
      }, 100);
    }
  };

  // Function to clear ALL cache (for development/testing)
  const clearAllCache = () => {
    if (confirm("Are you sure you want to clear ALL cache including preferences?")) {
      localStorage.clear();
      sessionStorage.clear();
      console.log("All cache cleared");
      window.location.reload();
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && open && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, open]);

  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, open]);

  const getRoleBadgeColor = () => {
    if (isAdmin) return 'from-purple-600 to-pink-600';
    if (isModerator) return 'from-blue-600 to-cyan-600';
    return 'from-green-600 to-emerald-600';
  };

  const getRoleTextColor = () => {
    if (isAdmin) return 'text-purple-200';
    if (isModerator) return 'text-blue-200';
    return 'text-green-200';
  };

  const getPanelTitle = () => {
    if (isAdmin) return 'Admin Panel';
    if (isModerator) return 'Moderator Panel';
    return 'Employee Portal';
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Shield size={12} />;
    if (isModerator) return <Filter size={12} />;
    return <User size={12} />;
  };

  if (isLoading) {
    return (
      <div className="relative h-screen flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
        <p className="mt-4 text-purple-200">Loading...</p>
      </div>
    );
  }

  const getToggleIcon = () => {
    if (isMobile) {
      return open ? <X size={24} /> : <Menu size={24} />;
    }
    
    if (collapsed) {
      return <ChevronRight size={24} />;
    }
    
    return <ChevronLeft size={24} />;
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const isSubmenuActive = (submenus) => {
    return submenus.some(submenu => isActive(submenu.href));
  };

  return (
    <>
      {isMobile && !open && (
        <button 
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Menu size={24} />
        </button>
      )}

      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <div 
        ref={sidebarRef}
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform' : 'relative'} 
          ${isMobile ? (open ? 'translate-x-0' : '-translate-x-full') : ''} 
          ${getSidebarWidth()}
          transition-all duration-300 ease-in-out
          h-screen flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900
          ${!isMobile ? 'shadow-xl' : ''}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 sticky top-0 z-20 bg-purple-900/90 backdrop-blur-sm border-b border-purple-700">
          <div className="flex items-center justify-between px-4 py-4">
            {!collapsed && open && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">A2</span>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 ${
                    isAdmin ? 'bg-green-400' : 
                    isModerator ? 'bg-blue-400' : 'bg-emerald-400'
                  } rounded-full border-2 border-purple-900`}></div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">A2IT HRM</h1>
                  <p className="text-xs text-purple-200 whitespace-nowrap overflow-hidden text-ellipsis">
                    {getPanelTitle()}
                  </p>
                </div>
              </div>
            )}
            
            {collapsed && open && (
              <div className="flex items-center justify-center w-full">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A2</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={toggleSidebar}
              className={`p-2 rounded-lg hover:bg-purple-700 transition-colors text-purple-200 hover:text-white ${
                collapsed && !isMobile ? 'mx-auto' : ''
              }`}
            >
              {getToggleIcon()}
            </button>
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(107, 33, 168, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8));
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, rgba(168, 85, 247, 1), rgba(236, 72, 153, 1));
          }
        `}</style>

        {/* Progress Bar */}
        <div className="h-1 bg-purple-800 flex-shrink-0 relative overflow-hidden">
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{ 
              width: `${scrollProgress}%`,
              background: 'linear-gradient(to right, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.7))',
              opacity: scrollProgress > 0 ? 1 : 0,
              transform: `translateX(${scrollProgress > 0 ? 0 : '-100%'})`,
            }}
          />
          {scrollProgress > 0 && (
            <div 
              className="absolute top-0 left-0 h-full w-24"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                transform: `translateX(${scrollProgress}%)`,
                transition: 'transform 0.3s ease'
              }}
            />
          )}
        </div>

        {/* Role Badge */}
        {!collapsed && open && (
          <div className="px-4 py-2 flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleBadgeColor()} ${getRoleTextColor()}`}>
              {getRoleIcon()}
              <span className="capitalize truncate max-w-[100px]">
                {userData.role}
                {isSuperAdmin && ' (Super)'}
                {isModerator && userData.moderatorLevel && ` (${userData.moderatorLevel})`}
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Menu Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className={`py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
            <div className="space-y-1">
              {filteredMenus.map((menu, index) => {
                const menuIsActive = isActive(menu.path);
                const isAdminMenu = menu.adminOnly;
                const isModeratorMenu = menu.moderatorOnly;
                const hasSubmenu = menu.hasSubmenu;
                const submenuIsOpen = openSubmenus[menu.name] || false;
                const anySubmenuActive = hasSubmenu && isSubmenuActive(menu.submenus || []);
                
                if (collapsed) {
                  return (
                    <div key={index}>
                      {hasSubmenu ? (
                        <div className="mb-1">
                          <button
                            onClick={() => toggleSubmenu(menu.name)}
                            className={`group relative flex items-center justify-center rounded-xl p-3 w-full transition-all duration-200 ${
                              menuIsActive || anySubmenuActive
                                ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20"
                                : "hover:bg-purple-800/40"
                            }`}
                            title={menu.name}
                          >
                            {(menuIsActive || anySubmenuActive) && (
                              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-purple-400 rounded-r-full"></div>
                            )}
                            
                            <div className={`p-2 rounded-lg ${
                              menuIsActive || anySubmenuActive
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                            }`}>
                              {menu.icon}
                            </div>
                            
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {menu.name}
                              {isAdminMenu && <span className="ml-1 text-yellow-300">(Admin)</span>}
                              {isModeratorMenu && <span className="ml-1 text-blue-300">(Moderator)</span>}
                            </div>
                          </button>
                        </div>
                      ) : (
                        <Link 
                          href={menu.path} 
                          key={index}
                          onClick={handleLinkClick}
                        >
                          <div
                            className={`group relative flex items-center justify-center rounded-xl p-3 transition-all duration-200 mb-1 ${
                              menuIsActive
                                ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20"
                                : "hover:bg-purple-800/40"
                            }`}
                            title={menu.name}
                          >
                            {menuIsActive && (
                              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-purple-400 rounded-r-full"></div>
                            )}
                            
                            <div className={`p-2 rounded-lg ${
                              menuIsActive 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                            }`}>
                              {menu.icon}
                            </div>
                            
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {menu.name}
                              {isAdminMenu && <span className="ml-1 text-yellow-300">(Admin)</span>}
                              {isModeratorMenu && <span className="ml-1 text-blue-300">(Moderator)</span>}
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={index}>
                      {hasSubmenu ? (
                        <div className="mb-1">
                          <button
                            onClick={() => toggleSubmenu(menu.name)}
                            className={`group relative flex items-center justify-between w-full rounded-xl px-3 py-3 transition-all duration-200 ${
                              menuIsActive || anySubmenuActive || submenuIsOpen
                                ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20 border-l-4 border-purple-400"
                                : "hover:bg-purple-800/40 hover:border-l-4 hover:border-purple-600"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2 rounded-lg flex-shrink-0 ${
                                menuIsActive || anySubmenuActive || submenuIsOpen
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                  : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                              }`}>
                                {menu.icon}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`text-sm font-medium truncate ${
                                    menuIsActive || anySubmenuActive || submenuIsOpen 
                                      ? 'text-white' 
                                      : 'text-purple-100 group-hover:text-white'
                                  }`}>
                                    {menu.name}
                                  </span>
                                  {isAdminMenu && (
                                    <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 text-amber-300 rounded flex-shrink-0">
                                      Admin
                                    </span>
                                  )}
                                  {isModeratorMenu && (
                                    <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-blue-900/30 to-cyan-900/20 text-blue-300 rounded flex-shrink-0">
                                      Moderator
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <ChevronRight 
                              size={16} 
                              className={`transform transition-transform duration-200 flex-shrink-0 ${
                                submenuIsOpen ? 'rotate-90' : ''
                              } ${menuIsActive || anySubmenuActive ? 'text-purple-300' : 'text-purple-400'}`}
                            />
                          </button>
                          
                          {submenuIsOpen && (
                            <div className="ml-6 mt-1 space-y-1 border-l border-purple-700/50 pl-2">
                              {menu.submenus?.map((submenu, subIndex) => (
                                <Link
                                  href={submenu.href}
                                  key={subIndex}
                                  onClick={handleLinkClick}
                                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                                    isActive(submenu.href)
                                      ? "bg-gradient-to-r from-purple-600/20 to-pink-600/10 border-l-2 border-purple-400"
                                      : "hover:bg-purple-800/30"
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                                    isActive(submenu.href)
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                      : 'bg-purple-900/30 text-purple-300 group-hover:bg-purple-700 group-hover:text-white'
                                  }`}>
                                    {submenu.icon}
                                  </div>
                                  <span className={`text-sm truncate ${
                                    isActive(submenu.href)
                                      ? 'text-white font-medium'
                                      : 'text-purple-200'
                                  }`}>
                                    {submenu.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link 
                          href={menu.path} 
                          key={index}
                          onClick={handleLinkClick}
                        >
                          <div
                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 mb-1 ${
                              menuIsActive
                                ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20 border-l-4 border-purple-400"
                                : "hover:bg-purple-800/40 hover:border-l-4 hover:border-purple-600"
                            }`}
                          >
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                              menuIsActive 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                            }`}>
                              {menu.icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`text-sm font-medium truncate ${
                                  menuIsActive ? 'text-white' : 'text-purple-100 group-hover:text-white'
                                }`}>
                                  {menu.name}
                                </span>
                                {isAdminMenu && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 text-amber-300 rounded flex-shrink-0">
                                    Admin
                                  </span>
                                )}
                                {isModeratorMenu && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-blue-900/30 to-cyan-900/20 text-blue-300 rounded flex-shrink-0">
                                    Moderator
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                }
              })}
            </div>

            {!collapsed && (
              <div className="my-6 mx-3 border-t border-purple-700"></div>
            )}

            {/* User Profile Card - FIXED for long names */}
            {!collapsed && open && (
              <div className="px-3 mb-6">
                <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        {userData.picture ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500">
                            <img 
                              src={userData.picture} 
                              alt={userData.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {userData.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${
                          isAdmin ? 'bg-green-400' : 
                          isModerator ? 'bg-blue-400' : 'bg-emerald-400'
                        } rounded-full border-2 border-purple-900`}></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white break-words leading-snug">
                        {userData.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRoleBadgeColor()} ${getRoleTextColor()} whitespace-nowrap`}>
                          {userData.role}
                          {isModerator && userData.moderatorLevel && ` • ${userData.moderatorLevel}`}
                        </span>
                        {userData.employeeId && (
                          <span className="text-xs text-purple-300 truncate max-w-full">
                            ID: {userData.employeeId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {(userData.email || userData.phone) && (
                    <div className="space-y-2 border-t border-purple-700/50 pt-3">
                      {userData.email && (
                        <div className="flex items-start gap-2 text-sm">
                          <Mail size={14} className="text-purple-300 flex-shrink-0 mt-0.5" />
                          <span className="text-purple-200 break-all leading-snug">
                            {userData.email}
                          </span>
                        </div>
                      )}
                      {userData.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-purple-300 flex-shrink-0" />
                          <span className="text-purple-200 break-all">
                            {userData.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Cache info (for debugging) */}
                  {/* <div className="mt-4 pt-3 border-t border-purple-700/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-300">Cache Status:</span>
                      <span className="text-green-400 font-medium">Preserved ✓</span>
                    </div>
                    <div className="mt-1 text-xs text-purple-400">
                      Sidebar state, theme, preferences will be kept
                    </div>
                  </div> */}
                </div>
              </div>
            )}
          </nav>
        </div>

        {!collapsed && open && !isMobile && (
          <>
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="absolute right-2 top-1/3 transform -translate-y-1/2 p-2.5 bg-purple-800/90 backdrop-blur-sm rounded-full text-purple-200 hover:text-white hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 z-30 border border-purple-600/30"
                style={{
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <ChevronUp size={20} />
              </button>
            )}
            
            {showScrollBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute right-2 bottom-1/3 transform translate-y-1/2 p-2.5 bg-purple-800/90 backdrop-blur-sm rounded-full text-purple-200 hover:text-white hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 z-30 border border-purple-600/30"
                style={{
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <ChevronDown size={20} />
              </button>
            )}
          </>
        )}

        {/* Footer - FIXED for long names */}
        <div className="flex-shrink-0 sticky bottom-0 z-20 bg-purple-900/90 backdrop-blur-sm border-t border-purple-700">
          <div className={`${collapsed ? 'p-2' : 'p-3'}`}>
            {collapsed ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {userData.picture ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-500">
                      <img 
                        src={userData.picture} 
                        alt={userData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                    isAdmin ? 'bg-green-400' : 
                    isModerator ? 'bg-blue-400' : 'bg-emerald-400'
                  } rounded-full border-2 border-purple-900`}></div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 hover:text-white hover:from-red-600/30 hover:to-red-700/30 rounded-xl border border-red-800/30 transition-all duration-200 hover:scale-110 active:scale-95 group relative"
                  title="Logout (Preserves Cache)"
                >
                  <LogOut size={18} />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Logout (Cache preserved)
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        {userData.picture ? (
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-500">
                            <img 
                              src={userData.picture} 
                              alt={userData.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {userData.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${
                          isAdmin ? 'bg-green-400' : 
                          isModerator ? 'bg-blue-400' : 'bg-emerald-400'
                        } rounded-full border-2 border-purple-900`}></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white break-words leading-snug">
                        {userData.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        <p className="text-xs text-purple-200 capitalize truncate max-w-full">
                          {userData.role}
                          {isModerator && userData.moderatorLevel && ` • ${userData.moderatorLevel}`}
                        </p>
                        {userData.employeeId && (
                          <span className="text-xs text-purple-400 truncate max-w-full">• {userData.employeeId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <UserCheck size={16} className="text-purple-300 flex-shrink-0 mt-1" />
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 hover:text-white hover:from-red-600/30 hover:to-red-700/30 rounded-xl border border-red-800/30 transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98] relative"
                  title="Logout (Cache will be preserved)"
                >
                  <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                  <span className="font-medium">Logout</span>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Cache will be preserved
                  </div>
                </button>
                
                {/* Cache info for debugging */}
                <div className="text-center">
                  <div className="text-xs text-purple-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Cache preserved on logout
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global CSS for text overflow */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        /* Prevent horizontal scroll in sidebar */
        .sidebar-container * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        /* Text overflow handling */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .break-words {
          overflow-wrap: break-word;
          word-wrap: break-word;
          hyphens: auto;
        }
        
        .break-all {
          word-break: break-all;
        }
        
        .leading-snug {
          line-height: 1.375;
        }
        
        /* Custom scrollbar for sidebar content */
        .sidebar-content {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
        }
        
        .sidebar-content::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 4px;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </>
  );
}