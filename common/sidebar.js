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
  FileText,
  Calendar,
  Bell,
  HelpCircle,
  ChevronUp,
  ChevronRight,
  ChevronDown,
  Building,
  Briefcase,
  PieChart,
  Activity,
  CreditCard,
  Download,
  Database,
  Server,
  Key,
  Eye,
  UserPlus,
  Award,
  DollarSign,
  Calculator,
  FileSpreadsheet,
  Sparkles,
  Lock,
  Mail,
  Phone,
  UserCheck,
  ChevronLeft,
  LogIn,
  Building2,  // Add this
  Utensils,   // Add this
  Car,        // Add this
  MoreHorizontal,  // Add this
  Cloud,      // Add this
  User
} from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({}); // State for tracking open submenus
  const sidebarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // State for user data
  const [userData, setUserData] = useState({
    name: "Loading...",
    role: "employee",
    email: "",
    phone: "",
    employeeId: "",
    picture: null
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

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (typeof window !== 'undefined') {
          const adminToken = localStorage.getItem('adminToken');
          const employeeToken = localStorage.getItem('employeeToken');
          
          let userInfo = {
            name: "User",
            role: "employee",
            email: "",
            phone: "",
            employeeId: "",
            picture: null
          };

          let userType = '';
          let token = '';
          let apiEndpoint = '';
          
          if (adminToken) {
            userType = 'admin';
            token = adminToken;
            apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/getAdminProfile`;
          } else if (employeeToken) {
            userType = 'employee';
            token = employeeToken;
            apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/getProfile`;
          }

          if (token && apiEndpoint) {
            try {
              const response = await fetch(apiEndpoint, {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              });

              if (response.ok) {
                const data = await response.json();
                const userData = data.user || data;
                
                let fullName = '';
                if (userData.firstName && userData.lastName) {
                  fullName = `${userData.firstName} ${userData.lastName}`;
                } else if (userData.firstName) {
                  fullName = userData.firstName;
                } else if (userData.name) {
                  fullName = userData.name;
                } else if (userData.email) {
                  fullName = userData.email.split('@')[0];
                }

                userInfo = {
                  name: fullName,
                  role: userType,
                  email: userData.email || '',
                  phone: userData.phone || userData.contactNumber || '',
                  employeeId: userData.employeeId || userData.id || '',
                  picture: userData.picture || null
                };

                localStorage.setItem('userData', JSON.stringify(userInfo));
                localStorage.setItem('userRole', userType);
                
              } else if (response.status === 401) {
                if (userType === 'admin') {
                  localStorage.removeItem('adminToken');
                } else {
                  localStorage.removeItem('employeeToken');
                }
                localStorage.removeItem('userData');
                localStorage.removeItem('userRole');
                router.push('/');
                return;
              }
            } catch (error) {
              console.error("Error fetching user data from API:", error);
              const storedUserData = localStorage.getItem('userData');
              if (storedUserData) {
                const parsedData = JSON.parse(storedUserData);
                userInfo = { ...userInfo, ...parsedData };
              }
            }
          } else {
            const storedUserData = localStorage.getItem('userData');
            const storedRole = localStorage.getItem('userRole');
            
            if (storedUserData) {
              try {
                const parsedData = JSON.parse(storedUserData);
                userInfo = { ...userInfo, ...parsedData };
                
                if (storedRole) {
                  userInfo.role = storedRole;
                }
              } catch (error) {
                console.error("Error parsing stored user data:", error);
              }
            } else {
              console.log("No user data found, redirecting to login...");
              router.push('/');
              return;
            }
          }

          setUserData(userInfo);
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    
    const handleStorageChange = () => {
      fetchUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  // Check if current user is admin
  const isAdmin = userData.role === 'admin';

  // Base menus available for all users
  const baseMenus = [
    { name: "Profile", icon: <UserCog size={20} />, path: "/profile", roles: ['admin', 'employee'] },
    { name: "Attendance", icon: <Clock size={20} />, path: "/attendance", roles: ['admin', 'employee'] },
    { name: "Leave Management", icon: <Calendar size={20} />, path: "/leave", roles: ['admin', 'employee'] },
    { name: "Holiday", icon: <Award size={20} />, path: "/holiday", roles: ['admin', 'employee'] },
    { name: "Salary Rule", icon: <CreditCard size={20} />, path: "/salaryRule", roles: ['admin', 'employee'] },
    { name: "Payroll", icon: <Wallet size={20} />, path: "/payroll", roles: ['admin', 'employee'] },
    { name: "Audit Logs", icon: <Shield size={20} />, path: "/audit", roles: ['admin','employee']},
    { name: "Session Logs", icon: <Activity size={20} />, path: "/session", roles: ['admin','employee']},
    { name: "Office Schedule", icon: <Calendar size={20} />, path: "/officeSchedule", roles: ['admin','employee']},
  ];

  // Cost Details Submenus
  const costDetailsSubmenus = [
    { 
      name: "Dashboard", 
      icon: <Home size={18} />, 
      href: "/dashboard",
      roles: ['admin'] // Adjust roles as needed
    },
    { 
      name: "Dashboard", 
      icon: <Home size={18} />, 
      href: "/dashboard",
      roles: [ 'moderator'] // Adjust roles as needed
    },
    { 
      name: "Employee", 
      icon: <User size={18} />, 
      href: "/employee",
      roles: ['admin'] // Adjust roles as needed
    },
    { 
      name: "House Rent", 
      icon: <Building2 size={18} />, 
      href: "/officeRent",
      roles: ['admin', 'moderator', 'employee'] // Adjust roles as needed
    },
    { 
      name: "Utility Bills", 
      icon: <DollarSign size={18} />, 
      href: "/dashboard/expenses",
      roles: ['admin', 'moderator', 'employee']
    },
    { 
      name: "Office Supplies", 
      icon: <Briefcase size={18} />, 
      href: "/dashboard/supplies",
      roles: ['admin', 'moderator', 'employee']
    },
    { 
      name: "Software Subscriptions", 
      icon: <Cloud size={18} />, 
      href: "/dashboard/subscriptions",
      roles: ['admin'] // Only admin can see
    }, 
    { 
      name: "Food Cost", 
      icon: <Utensils size={18} />, 
      href: "/dashboard/foodCost",
      roles: ['admin', 'moderator', 'employee']
    },
    { 
      name: "Transport", 
      icon: <Car size={18} />, 
      href: "/dashboard/transport",
      roles: ['admin', 'moderator', 'employee']
    },
    { 
      name: "Miscellaneous Expenses", 
      icon: <MoreHorizontal size={18} />, 
      href: "/dashboard/extra",
      roles: ['admin', 'moderator', 'employee']
    }
  ];

  // Admin-only menus
  const adminMenus = [
    { name: "User Roles", icon: <Shield size={20} />, path: "/user-roles", roles: ['admin'], adminOnly: true }, 
  ];

  // Combine menus based on user role with Cost Details as a parent menu
  const getFilteredMenus = () => {
    let menus = [...baseMenus];
    
    // Add Cost Details as a menu item with submenus
    menus.push({
      name: "Cost Details",
      icon: <DollarSign size={20} />,
      path: "#",
      roles: ['admin', 'employee'],
      hasSubmenu: true,
      submenus: costDetailsSubmenus.filter(submenu => 
        submenu.roles.includes(userData.role)
      )
    });
    
    if (isAdmin) {
      menus = [...menus, ...adminMenus];
    }
    
    return menus;
  };

  const filteredMenus = getFilteredMenus();

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(progress);
        setShowScrollTop(scrollTop > 100);
      }
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener("scroll", handleScroll);
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

  // Complete logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_token');
    
    sessionStorage.clear();
    
    setUserData({
      name: "User",
      role: "employee",
      email: "",
      phone: "",
      employeeId: "",
      picture: null
    });
    
    router.push("/");
    
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  // Close sidebar when clicking on a link in mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && open && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, open]);

  // Prevent body scroll when sidebar is open on mobile
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

  if (isLoading) {
    return (
      <div className="relative h-screen flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
        <p className="mt-4 text-purple-200">Loading user data...</p>
      </div>
    );
  }

  // Get the appropriate icon for toggle button
  const getToggleIcon = () => {
    if (isMobile) {
      return open ? <X size={24} /> : <Menu size={24} />;
    }
    
    if (collapsed) {
      return <ChevronRight size={24} />;
    }
    
    return <ChevronLeft size={24} />;
  };

  // Check if a path is active
  const isActive = (path) => {
    return pathname === path;
  };

  // Check if any submenu item is active
  const isSubmenuActive = (submenus) => {
    return submenus.some(submenu => isActive(submenu.href));
  };

  return (
    <>
      {/* Mobile Menu Button (when sidebar is closed on mobile) */}
      {isMobile && !open && (
        <button 
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
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
        {/* Header - Fixed */}
        <div className="flex-shrink-0 sticky top-0 z-20 bg-purple-900/90 backdrop-blur-sm border-b border-purple-700">
          <div className="flex items-center justify-between px-4 py-4">
            {!collapsed && open && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">A2</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-purple-900"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">A2IT HRM</h1>
                  <p className="text-xs text-purple-200">
                    {isAdmin ? 'Admin Panel' : 'Employee Portal'}
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

        {/* Scroll Progress Bar - Only show when not collapsed */}
        {!collapsed && (
          <div className="h-1 bg-purple-800 flex-shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        )}

        {/* Role Badge - Only show when not collapsed */}
        {!collapsed && open && (
          <div className="px-4 py-2 flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isAdmin
                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-purple-200 border border-purple-600' 
                : 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-blue-200 border border-blue-600'
            }`}>
              {isAdmin ? (
                <>
                  <Shield size={12} />
                  <span className="capitalize">{userData.role}</span>
                </>
              ) : (
                <>
                  <Users size={12} />
                  <span className="capitalize">{userData.role}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Menu Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className={`py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
            {/* Navigation Menu */}
            <div className="space-y-1">
              {filteredMenus.map((menu, index) => {
                const menuIsActive = isActive(menu.path);
                const isAdminMenu = menu.adminOnly;
                const hasSubmenu = menu.hasSubmenu;
                const submenuIsOpen = openSubmenus[menu.name] || false;
                const anySubmenuActive = hasSubmenu && isSubmenuActive(menu.submenus || []);
                
                if (collapsed) {
                  // Collapsed view - only show icons
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
                            {/* Active Indicator */}
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
                            
                            {/* Tooltip for collapsed mode */}
                            {collapsed && (
                              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {menu.name}
                                {isAdminMenu && <span className="ml-1 text-yellow-300">(Admin)</span>}
                              </div>
                            )}
                          </button>
                          
                          {/* Submenu items in collapsed mode (show on hover) */}
                          {hasSubmenu && submenuIsOpen && (
                            <div className="ml-2 mt-1 space-y-1">
                              {menu.submenus?.map((submenu, subIndex) => (
                                <Link
                                  href={submenu.href}
                                  key={subIndex}
                                  onClick={handleLinkClick}
                                  className="group relative flex items-center justify-center p-2 rounded-lg hover:bg-purple-800/40 transition-all duration-200"
                                  title={submenu.name}
                                >
                                  <div className={`p-1.5 rounded-lg ${
                                    isActive(submenu.href)
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                      : 'bg-purple-900/30 text-purple-300 group-hover:bg-purple-700 group-hover:text-white'
                                  }`}>
                                    {submenu.icon}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link 
                          href={menu.path} 
                          key={index}
                          className={isAdminMenu && !isAdmin ? 'pointer-events-none' : ''}
                          onClick={handleLinkClick}
                        >
                          <div
                            className={`group relative flex items-center justify-center rounded-xl p-3 transition-all duration-200 mb-1 ${
                              menuIsActive
                                ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20"
                                : "hover:bg-purple-800/40"
                            } ${
                              isAdminMenu && !isAdmin 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer'
                            }`}
                            title={menu.name}
                          >
                            {/* Active Indicator */}
                            {menuIsActive && (
                              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-purple-400 rounded-r-full"></div>
                            )}
                            
                            <div className={`p-2 rounded-lg ${
                              menuIsActive 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : isAdminMenu && !isAdmin
                                  ? 'bg-purple-900/30 text-purple-400'
                                  : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                            }`}>
                              {menu.icon}
                            </div>
                            
                            {/* Tooltip for collapsed mode */}
                            {collapsed && (
                              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {menu.name}
                                {isAdminMenu && <span className="ml-1 text-yellow-300">(Admin)</span>}
                              </div>
                            )}
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                } else {
                  // Full view - show icons and text
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
                            {/* Active Indicator */}
                            {(menuIsActive || anySubmenuActive) && (
                              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-purple-400 rounded-r-full"></div>
                            )}
                            
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                menuIsActive || anySubmenuActive || submenuIsOpen
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                  : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                              }`}>
                                {menu.icon}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    menuIsActive || anySubmenuActive || submenuIsOpen 
                                      ? 'text-white' 
                                      : 'text-purple-100 group-hover:text-white'
                                  }`}>
                                    {menu.name}
                                  </span>
                                </div>
                                
                                {(menuIsActive || anySubmenuActive) && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-purple-300">Active</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Submenu Arrow */}
                            <ChevronRight 
                              size={16} 
                              className={`transform transition-transform duration-200 ${
                                submenuIsOpen ? 'rotate-90' : ''
                              } ${menuIsActive || anySubmenuActive ? 'text-purple-300' : 'text-purple-400'}`}
                            />
                          </button>
                          
                          {/* Submenu items */}
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
                                  <div className={`p-1.5 rounded-lg ${
                                    isActive(submenu.href)
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                      : 'bg-purple-900/30 text-purple-300 group-hover:bg-purple-700 group-hover:text-white'
                                  }`}>
                                    {submenu.icon}
                                  </div>
                                  <span className={`text-sm ${
                                    isActive(submenu.href)
                                      ? 'text-white font-medium'
                                      : 'text-purple-200'
                                  }`}>
                                    {submenu.name}
                                  </span>
                                  {isActive(submenu.href) && (
                                    <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link 
                          href={menu.path} 
                          key={index}
                          className={isAdminMenu && !isAdmin ? 'pointer-events-none' : ''}
                          onClick={handleLinkClick}
                        >
                          <div
                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 mb-1 ${
                              menuIsActive
                                ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20 border-l-4 border-purple-400"
                                : "hover:bg-purple-800/40 hover:border-l-4 hover:border-purple-600"
                            } ${
                              isAdminMenu && !isAdmin 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer'
                            }`}
                          >
                            {/* Active Indicator */}
                            {menuIsActive && (
                              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-purple-400 rounded-r-full"></div>
                            )}
                            
                            {/* Admin Lock Icon for admin-only menus */}
                            {isAdminMenu && isAdmin && (
                              <div className="absolute -top-1 -right-1 z-10">
                                <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                                  <Lock size={10} className="text-white" />
                                </div>
                              </div>
                            )}
                            
                            <div className={`p-2 rounded-lg ${
                              menuIsActive 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : isAdminMenu && !isAdmin
                                  ? 'bg-purple-900/30 text-purple-400'
                                  : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                            }`}>
                              {menu.icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${
                                  menuIsActive ? 'text-white' : 
                                  isAdminMenu && !isAdmin 
                                    ? 'text-purple-400' 
                                    : 'text-purple-100 group-hover:text-white'
                                }`}>
                                  {menu.name}
                                </span>
                                
                                {/* Admin badge for admin-only menus */}
                                {isAdminMenu && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 text-amber-300 rounded">
                                    Admin
                                  </span>
                                )}
                              </div>
                              
                              {menuIsActive && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-purple-300">Active</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Hover Arrow */}
                            {!isAdminMenu || (isAdminMenu && isAdmin) && (
                              <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                menuIsActive ? 'text-purple-300' : 'text-purple-400'
                              }`}>
                                <ChevronRight size={16} />
                              </div>
                            )}
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                }
              })}
            </div>

            {/* Divider - Only show when not collapsed */}
            {!collapsed && (
              <div className="my-6 mx-3 border-t border-purple-700"></div>
            )}

            {/* User Profile Card - Only show when not collapsed */}
            {!collapsed && open && (
              <div className="px-3 mb-6">
                <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <div className="flex items-center gap-3 mb-4">
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
                        isAdmin ? 'bg-green-400' : 'bg-blue-400'
                      } rounded-full border-2 border-purple-900`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white truncate">{userData.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isAdmin 
                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-purple-200' 
                            : 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-blue-200'
                        }`}>
                          {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                        </span>
                        {userData.employeeId && (
                          <span className="text-xs text-purple-300">ID: {userData.employeeId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* User Details */}
                  {(userData.email || userData.phone) && (
                    <div className="space-y-2 border-t border-purple-700/50 pt-3">
                      {userData.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-purple-300" />
                          <span className="text-purple-200 truncate">{userData.email}</span>
                        </div>
                      )}
                      {userData.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-purple-300" />
                          <span className="text-purple-200">{userData.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Scroll Buttons - Only show when not collapsed */}
        {!collapsed && open && !isMobile && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="p-2 bg-purple-800/80 backdrop-blur-sm rounded-lg text-purple-200 hover:text-white hover:bg-purple-700 transition-all shadow-lg"
              >
                <ChevronUp size={18} />
            </button>
            )}
            <button
              onClick={scrollToBottom}
              className="p-2 bg-purple-800/80 backdrop-blur-sm rounded-lg text-purple-200 hover:text-white hover:bg-purple-700 transition-all shadow-lg"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 sticky bottom-0 z-20 bg-purple-900/90 backdrop-blur-sm border-t border-purple-700">
          <div className={`${collapsed ? 'p-2' : 'p-2'}`}>
            {collapsed ? (
              // Collapsed footer - only show user icon and logout
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
                    isAdmin ? 'bg-green-400' : 'bg-blue-400'
                  } rounded-full border-2 border-purple-900`}></div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 hover:text-white hover:from-red-600/30 hover:to-red-700/30 rounded-xl border border-red-800/30 transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              // Full footer
              <div className="space-y-3">
                {/* User Info Section */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
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
                        isAdmin ? 'bg-green-400' : 'bg-blue-400'
                      } rounded-full border-2 border-purple-900`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{userData.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-purple-200 capitalize">{userData.role}</p>
                        {userData.employeeId && (
                          <span className="text-xs text-purple-400">• {userData.employeeId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <UserCheck size={16} className="text-purple-300" />
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 hover:text-white hover:from-red-600/30 hover:to-red-700/30 rounded-xl border border-red-800/30 transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                  <span className="font-medium">Logout</span>
                </button> 
              </div>
            )}
          </div>
        </div>

        {/* Custom Scrollbar Styling */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: ${collapsed ? '3px' : '6px'};
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(107, 33, 168, 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #a855f7, #ec4899);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #9333ea, #db2777);
          }
        `}</style>
      </div>
    </>
  );
}