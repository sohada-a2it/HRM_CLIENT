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
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sidebarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Enhanced menus with more items
  const menus = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "User Roles", icon: <Shield size={20} />, path: "/user-roles" },
    { name: "Profile", icon: <UserCog size={20} />, path: "/profile" }, 
    { name: "Attendance", icon: <Clock size={20} />, path: "/attendance" },
    { name: "Leave Management", icon: <Calendar size={20} />, path: "/leave" },
    { name: "Payroll", icon: <Wallet size={20} />, path: "/payroll" },
    { name: "Salary Structure", icon: <CreditCard size={20} />, path: "/salaryRule" },
    { name: "Holiday", icon: <Award size={20} />, path: "/holiday" }, 
    { name: "Audit Logs", icon: <Activity size={20} />, path: "/audit" }, 
    { name: "Session Logs", icon: <Activity size={20} />, path: "/session" }, 
    { name: "Notifications", icon: <Bell size={20} />, path: "/notification" },
    { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" }, 
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
    { name: "Help & Support", icon: <HelpCircle size={20} />, path: "/help" },
  ];

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

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
    router.push("/login");
  };

  return (
    <div className="relative h-screen flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 sticky top-0 z-20 bg-purple-900/90 backdrop-blur-sm border-b border-purple-700">
        <div className="flex items-center justify-between px-4 py-4">
          {open && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A2</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-purple-900"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">A2IT HRM</h1>
                <p className="text-xs text-purple-200">Professional Suite</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-purple-700 transition-colors text-purple-200 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div className="h-1 bg-purple-800 flex-shrink-0">
        <div 
          className="h-full bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scrollable Menu Container */}
      <div 
        ref={sidebarRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <nav className="py-4 px-3">
          {/* Navigation Menu */}
          <div className="space-y-1">
            {menus.map((menu, index) => {
              const isActive = pathname === menu.path;
              return (
                <Link href={menu.path} key={index}>
                  <div
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 mb-1 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20 border-l-4 border-purple-400"
                        : "hover:bg-purple-800/40 hover:border-l-4 hover:border-purple-600"
                    }`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-purple-400 rounded-r-full"></div>
                    )}
                    
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-700 group-hover:text-white'
                    }`}>
                      {menu.icon}
                    </div>
                    
                    {open && (
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${
                          isActive ? 'text-white' : 'text-purple-100 group-hover:text-white'
                        }`}>
                          {menu.name}
                        </span>
                        {isActive && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
                            <span className="text-xs text-purple-300">Active</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Hover Arrow */}
                    {open && (
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'text-purple-300' : 'text-purple-400'
                      }`}>
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 mx-3 border-t border-purple-700"></div>

          {/* Quick Stats */}
          {open && (
            <div className="px-3 mb-6">
              <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-purple-200">Quick Stats</span>
                  <Activity size={14} className="text-green-300" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">Active Users</span>
                    <span className="text-sm font-medium text-green-300">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">Today's Clock-ins</span>
                    <span className="text-sm font-medium text-blue-300">38</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">Pending Tasks</span>
                    <span className="text-sm font-medium text-amber-300">5</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          {open && (
            <div className="px-3 mb-6">
              <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-purple-200">System Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-300">Live</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">API Response</span>
                    <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-300 rounded">24ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">Database</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">Uptime</span>
                    <span className="text-xs text-purple-200">99.8%</span>
                  </div>
                </div>
              </div>
            </div>
          )} 
        </nav>
      </div>

      {/* Scroll Buttons */}
      {open && (
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

      {/* Footer - Fixed */}
      <div className="flex-shrink-0 sticky bottom-0 z-20 bg-purple-900/90 backdrop-blur-sm border-t border-purple-700">
        <div className="p-2">
          {open ? (
            <div className="space-y-2">
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">John Doe</p>
                  <p className="text-xs text-purple-200">Administrator</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-1 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 hover:text-white hover:from-red-600/30 hover:to-red-700/30 rounded-xl border border-red-800/30 transition-all duration-200 group"
              >
                <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                <span className="font-medium">Logout</span>
              </button> 
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">JD</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 hover:text-white hover:from-red-600/30 hover:to-red-700/30 rounded-xl border border-red-800/30 transition-all duration-200"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styling (via CSS) */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
  );
}