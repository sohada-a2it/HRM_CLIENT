// app/sessions/page.js - Fixed Analytics Section
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Clock, Users, Calendar, BarChart3, Filter, Search, Download,
  Eye, Trash2, User, LogOut, Smartphone, Activity,
  ChevronLeft, ChevronRight, Shield, AlertTriangle, CheckCircle,
  XCircle, RefreshCw, TrendingUp, Settings, PieChart, Clock4,
  Laptop, Timer, ShieldCheck, Edit2, Plus, X, HelpCircle,
  ArrowUpRight, ArrowDownRight, CalendarDays, Target,
  MoreVertical, DownloadCloud, FileText, Phone, Mail,
  Home, Briefcase, MapPin, Globe, Cpu, Smartphone as PhoneIcon
} from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Main Component
export default function SessionsPage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    avgDuration: '0h',
    attendanceRate: '0%',
    totalHours: '0h',
    daysClockedIn: 0
  });
  
  // New statistics for different periods
  const [periodStats, setPeriodStats] = useState({
    'Last 7 days': {
      totalSessions: 0,
      totalDurationHours: '0',
      totalHoursWorked: '0',
      daysClockedIn: 0,
      daysClockedOut: 0,
      avgHoursPerDay: '0',
      attendanceRate: '0%'
    },
    'Last 30 days': {
      totalSessions: 0,
      totalDurationHours: '0',
      totalHoursWorked: '0',
      daysClockedIn: 0,
      daysClockedOut: 0,
      avgHoursPerDay: '0',
      attendanceRate: '0%'
    }
  });
  
  const [currentSession, setCurrentSession] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    userId: '',
    status: '',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [analyticsData, setAnalyticsData] = useState({
    dailyActivity: [],
    deviceDistribution: [],
    sessionTrends: []
  });
  
  const router = useRouter();

  // Get user type and token
  const getUserType = () => {
    if (typeof window === 'undefined') return null;
    
    if (localStorage.getItem('adminToken')) {
      return 'admin';
    }
    if (localStorage.getItem('employeeToken') || localStorage.getItem('userToken')) {
      return 'employee';
    }
    return null;
  };

  const getCurrentToken = () => {
    const userType = getUserType();
    if (userType === 'admin') {
      return localStorage.getItem('adminToken');
    } else if (userType === 'employee') {
      return localStorage.getItem('employeeToken') || localStorage.getItem('userToken');
    }
    return null;
  };

  // Verify token and fetch user data
  const verifyAndFetchUser = async () => {
    try {
      setLoading(true);
      setAuthError(false);
      
      const token = getCurrentToken();
      const userType = getUserType();
      
      console.log('Token:', token ? 'Exists' : 'Not found');
      console.log('User Type:', userType);
      
      if (!token || !userType) {
        throw new Error('No authentication token found');
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      let userResponse;
      try {
        if (userType === 'admin') { 
          userResponse = await axios.get('/admin/getAdminProfile');
        } else {
          userResponse = await axios.get('/users/getProfile');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        throw new Error('Failed to fetch user profile');
      }

      if (userResponse?.data) {
        const userData = userResponse.data.user || userResponse.data.data || userResponse.data;
        
        if (!userData) {
          throw new Error('Invalid user data received');
        }

        const formattedUserData = {
          _id: userData._id,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
          email: userData.email,
          role: userData.role || userType,
          firstName: userData.firstName,
          lastName: userData.lastName,
          department: userData.department,
          designation: userData.designation,
          phone: userData.phone,
          address: userData.address,
          profileImage: userData.profileImage
        };

        console.log('User data loaded:', formattedUserData.name);
        setUserData(formattedUserData);
        localStorage.setItem('userData', JSON.stringify(formattedUserData));
        
        await fetchInitialData(userType);
        
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError(true);
      
      if (getUserType() === 'admin') {
        localStorage.removeItem('adminToken');
      } else {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('userToken');
      }
      localStorage.removeItem('userData');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data based on user type
  const fetchInitialData = async (userType) => {
    try {
      if (userType === 'admin') {
        console.log('Fetching admin data...');
        await fetchAdminSessions();
        await fetchAdminStats();
        // Analytics ফাংশনটিকে try-catch দিয়ে wrap করছি
        try {
          await fetchAnalyticsData();
        } catch (analyticsError) {
          console.log('Analytics data not available, using fallback');
        }
      } else {
        console.log('Fetching employee data...');
        await fetchMySessions();
        await fetchMyStats();
        await fetchMyCurrentSession();
        await fetchPeriodStats();
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }; 

  // Fetch admin sessions
// Fix the fetchAdminSessions function
const fetchAdminSessions = async (page = 1) => {
  try {
    console.log('Fetching admin sessions, page:', page);

    // Build params object dynamically based on filters
    const params = {
      page,
      limit: pagination.limit,
      ...(filters.userId?.trim() && { userId: filters.userId }),
      ...(filters.status?.trim() && { status: filters.status }),
      ...(filters.startDate?.trim() && { startDate: filters.startDate }),
      ...(filters.endDate?.trim() && { endDate: filters.endDate }),
      ...(filters.searchQuery?.trim() && { search: filters.searchQuery }),
    };

    console.log('Request params:', params);

    // Fetch data
    const response = await axios.get('/allSession', { params });

    console.log('Admin sessions response:', response.data);

    // Check if the response status indicates success
if (response.data?.success) {
  const sessionsData = response.data.data || [];
  setSessions(sessionsData);
  console.log('Admin sessions loaded:', sessionsData.length);

  if (response.data.pagination) {
    setPagination(response.data.pagination);
    console.log('Pagination updated:', response.data.pagination);
  }
} else {
  console.warn('No admin sessions data found or invalid status');
  setSessions([]);
}

  } catch (error) {
    console.error('Error fetching admin sessions:', error);
    console.error('Error details:', error.response?.data || error.message);
    setSessions([]);
  }
};


// Also fix fetchMySessions function
const fetchMySessions = async () => {
  try {
    console.log('Fetching my sessions...');
    const response = await axios.get('/my-sessions');
    
    console.log('My sessions response:', response.data);
    
    // Fix: Check for status or success property
    if (response.data && (response.data.status === 'success' || response.data.success)) {
      setSessions(response.data.data || []);
      console.log('Sessions loaded:', response.data.data?.length || 0);
    } else {
      console.warn('No sessions data found');
      setSessions([]);
    }
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    setSessions([]);
  }
};

// Fix fetchAdminStats function
const fetchAdminStats = async () => {
  try {
    console.log('Fetching admin stats...');
    const response = await axios.get('/admin/statistics');
    
    console.log('Admin stats response:', response.data);
    
    // Fix: Check for status or success property
    if (response.data && (response.data.status === 'success' || response.data.success)) {
      const data = response.data.data || {};
      setStats(prev => ({
        ...prev,
        totalSessions: data.totalSessions || 0,
        activeSessions: data.activeSessions || 0,
        avgDuration: data.avgDuration || '0h',
        attendanceRate: data.attendanceRate || '0%'
      }));
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
  }
};

// Also fix fetchPeriodStats function
const fetchPeriodStats = async () => {
  try {
    console.log('Fetching period stats...');
    const response = await axios.get('/sessions/stats');
    
    console.log('Period stats response:', response.data);
    
    // Fix: Check for status or success property
    if (response.data && (response.data.status === 'success' || response.data.success)) {
      setPeriodStats(response.data.data || {});
    }
  } catch (error) {
    console.error('Error fetching period stats:', error);
  }
};

// Fix fetchMyStats function
const fetchMyStats = async () => {
  try {
    console.log('Fetching my stats...');
    const response = await axios.get('/sessions/stats/attendance');
    
    console.log('My stats response:', response.data);
    
    // Fix: Check for status or success property
    if (response.data && (response.data.status === 'success' || response.data.success)) {
      const data = response.data.data || {};
      
      // Update main stats
      setStats(prev => ({
        ...prev,
        totalSessions: data.totalSessions || 0,
        totalHours: data.totalHoursWorked ? `${data.totalHoursWorked}h` : '0h',
        daysClockedIn: data.daysClockedIn || 0,
        attendanceRate: data.attendanceRate || '0%',
        avgDuration: data.totalDurationHours ? `${data.totalDurationHours}h` : '0h'
      }));
    }
  } catch (error) {
    console.error('Error fetching my stats:', error);
  }
};

// Fix fetchMyCurrentSession function
const fetchMyCurrentSession = async () => {
  try {
    console.log('Fetching current session...');
    const response = await axios.get('/my-current-session');
    
    console.log('Current session response:', response.data);
    
    // Fix: Check for status or success property
    if (response.data && (response.data.status === 'success' || response.data.success)) {
      setCurrentSession(response.data.data);
    } else {
      setCurrentSession(null);
    }
  } catch (error) {
    console.error('Error fetching current session:', error);
    setCurrentSession(null);
  }
};

// Create a helper function to check response
const isSuccessfulResponse = (responseData) => {
  return responseData && (responseData.status === 'success' || responseData.success === true);
}; 
 

  // Fetch analytics data for admin - FIXED VERSION
  const fetchAnalyticsData = async () => {
    try {
      console.log('Fetching analytics data...');
      
      // Analytics API endpoints might not exist, so we'll create mock data from sessions
      // Or use existing endpoints if available
      
      const mockAnalyticsData = {
        dailyActivity: generateDailyActivity(sessions),
        deviceDistribution: generateDeviceDistribution(sessions),
        sessionTrends: generateSessionTrends(sessions)
      };
      
      setAnalyticsData(mockAnalyticsData);
      
      console.log('Analytics data generated:', mockAnalyticsData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Fallback: Generate analytics from sessions data
      const fallbackAnalyticsData = {
        dailyActivity: generateDailyActivity(sessions),
        deviceDistribution: generateDeviceDistribution(sessions),
        sessionTrends: generateSessionTrends(sessions)
      };
      
      setAnalyticsData(fallbackAnalyticsData);
    }
  };

  // Helper function to generate daily activity data
  const generateDailyActivity = (sessionsArray) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      sessions: sessionsArray.filter(s => {
        const sessionDate = new Date(s.loginAt || s.createdAt).toISOString().split('T')[0];
        return sessionDate === date;
      }).length
    }));
  };

  // Helper function to generate device distribution
  const generateDeviceDistribution = (sessionsArray) => {
    const distribution = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
      other: 0
    };

    sessionsArray.forEach(session => {
      const device = session.device?.toLowerCase() || 'unknown';
      if (device.includes('mobile') || device.includes('iphone') || device.includes('android')) {
        distribution.mobile++;
      } else if (device.includes('desktop') || device.includes('windows') || device.includes('mac')) {
        distribution.desktop++;
      } else if (device.includes('tablet') || device.includes('ipad')) {
        distribution.tablet++;
      } else {
        distribution.other++;
      }
    });

    return Object.entries(distribution).map(([device, count]) => ({
      device,
      count,
      percentage: sessionsArray.length > 0 ? Math.round((count / sessionsArray.length) * 100) : 0
    }));
  };

  // Helper function to generate session trends
  const generateSessionTrends = (sessionsArray) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const daySessions = sessionsArray.filter(s => {
        const sessionDate = new Date(s.loginAt || s.createdAt).toISOString().split('T')[0];
        return sessionDate === date;
      });
      
      return {
        date,
        active: daySessions.filter(s => s.isActive || s.status === 'active').length,
        completed: daySessions.filter(s => s.isClockedOut || s.status === 'completed').length,
        total: daySessions.length
      };
    });
  };

  // Handle clock in/out
  const handleClockAction = async () => {
    try {
      if (currentSession?.isActive) {
        // Clock out
        await axios.post('/sessions/clock-out');
        alert('Clocked out successfully!');
      } else {
        // Clock in
        await axios.post('/sessions/clock-in');
        alert('Clocked in successfully!');
      }
      
      // Refresh data
      await fetchMyCurrentSession();
      await fetchMySessions();
      await fetchMyStats();
      await fetchPeriodStats();
    } catch (error) {
      console.error('Clock action error:', error);
      alert(error.response?.data?.message || 'Failed to perform clock action');
    }
  };

  // Handle session delete
  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      const isAdmin = getUserType() === 'admin';
      const endpoint = isAdmin ? `/admin/session/${sessionId}` : `/sessions/${sessionId}`;
      
      await axios.delete(endpoint);
      
      // Refresh data
      if (isAdmin) {
        await fetchAdminSessions(pagination.page);
      } else {
        await fetchMySessions();
      }
      
      alert('Session deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete session');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API if available
      await axios.post('/users/logout');
    } catch (error) {
      console.log('Logout API error:', error);
    }
    
    const userType = getUserType();
    
    if (userType === 'admin') {
      localStorage.removeItem('adminToken');
    } else {
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('userToken');
    }
    
    localStorage.removeItem('userData');
    router.push('/login');
  };

  // Handle refresh
  const handleRefresh = async () => {
    const userType = getUserType();
    const promises = [];
    
    if (userType === 'admin') {
      promises.push(fetchAdminSessions(pagination.page));
      promises.push(fetchAdminStats());
      try {
        await fetchAnalyticsData();
      } catch (error) {
        console.log('Analytics refresh failed, using fallback');
      }
    } else {
      promises.push(fetchMySessions());
      promises.push(fetchMyStats());
      promises.push(fetchMyCurrentSession());
      promises.push(fetchPeriodStats());
    }
    
    await Promise.all(promises);
  };

  // Export sessions
  const handleExport = async () => {
    try {
      const userType = getUserType();
      const endpoint = userType === 'admin' ? '/sessions/admin/export' : '/sessions/export';
      
      const response = await axios.get(endpoint, {
        responseType: 'blob',
        params: filters
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sessions-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export sessions');
    }
  };

  // Initialize on component mount
  useEffect(() => {
    verifyAndFetchUser();
  }, []);

  // Handle filter changes for admin
  useEffect(() => {
    if (getUserType() === 'admin') {
      const timeoutId = setTimeout(() => {
        fetchAdminSessions(1);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (authError || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Your session has expired or you need to login first.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Go to Login
              </button>
              <button
                onClick={verifyAndFetchUser}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = getUserType() === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Session Management</h1>
                <p className="text-sm text-gray-600">
                  {isAdmin ? 'Admin Dashboard' : 'Employee Portal'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
                {userData.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt={userData.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {userData?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 border-t border-gray-200">
          <div className="flex space-x-1 overflow-x-auto py-1">
            <NavTab
              icon={<BarChart3 className="w-4 h-4" />}
              label="Dashboard"
              active={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
            />
            <NavTab
              icon={<Clock className="w-4 h-4" />}
              label="Sessions"
              active={activeView === 'sessions'}
              onClick={() => setActiveView('sessions')}
            />
            {isAdmin && (
              <>
                <NavTab
                  icon={<PieChart className="w-4 h-4" />}
                  label="Analytics"
                  active={activeView === 'analytics'}
                  onClick={() => setActiveView('analytics')}
                />
                <NavTab
                  icon={<Users className="w-4 h-4" />}
                  label="Users"
                  active={activeView === 'users'}
                  onClick={() => setActiveView('users')}
                />
              </>
            )}
            <NavTab
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {activeView === 'dashboard' && (
          <DashboardView 
            isAdmin={isAdmin} 
            stats={stats}
            periodStats={periodStats}
            userData={userData}
            sessions={sessions}
            currentSession={currentSession}
            onClockAction={handleClockAction}
            onRefresh={handleRefresh}
          />
        )}

        {activeView === 'sessions' && (
          <SessionsView 
            isAdmin={isAdmin}
            sessions={sessions}
            filters={filters}
            setFilters={setFilters}
            pagination={pagination}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fetchAdminSessions={fetchAdminSessions}
            fetchMySessions={fetchMySessions}
            userData={userData}
            onDeleteSession={handleDeleteSession}
            onExport={handleExport}
            onRefresh={handleRefresh}
          />
        )}

        {isAdmin && activeView === 'analytics' && (
          <AnalyticsView 
            stats={stats}
            analyticsData={analyticsData}
            sessions={sessions}
          />
        )}

        {isAdmin && activeView === 'users' && (
          <UsersView userData={userData} />
        )}

        {activeView === 'settings' && (
          <SettingsView userData={userData} isAdmin={isAdmin} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
          <div className="mb-2 sm:mb-0">
            <span>Session Management System v2.0</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline">
              Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="capitalize">Role: {userData?.role}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">User ID: {userData?._id?.substring(0, 8)}...</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Navigation Tab Component
const NavTab = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
      active 
        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="font-medium text-sm sm:text-base">{label}</span>
  </button>
);

// Dashboard View Component with Backend Data
const DashboardView = ({ 
  isAdmin, 
  stats, 
  periodStats,
  userData, 
  sessions, 
  currentSession,
  onClockAction,
  onRefresh 
}) => {
  const recentSessions = sessions.slice(0, 5);
  
  // Calculate additional metrics
  const totalHours = parseFloat(stats.totalHours) || 0;
  const avgDailyHours = periodStats['Last 30 days']?.avgHoursPerDay || '0';
  const attendanceRate = parseFloat(stats.attendanceRate) || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {userData?.name}!</h2>
            <p className="text-blue-100 mt-2 text-sm sm:text-base">
              {isAdmin 
                ? `You're managing ${stats.totalSessions} sessions across the system`
                : `You've worked ${totalHours} hours this month with ${attendanceRate}% attendance`
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Backend Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          trend={{ value: '+12%', positive: true }}
        />
        <StatCard
          title="Total Hours"
          value={stats.totalHours}
          icon={<Timer className="w-5 h-5" />}
          color="green"
          subtitle={`Avg ${avgDailyHours}h/day`}
        />
        <StatCard
          title="Attendance Rate"
          value={stats.attendanceRate}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          trend={{ value: attendanceRate > 85 ? '+5%' : '-2%', positive: attendanceRate > 85 }}
        />
        <StatCard
          title="Days Clocked In"
          value={stats.daysClockedIn}
          icon={<CalendarDays className="w-5 h-5" />}
          color="orange"
          subtitle="This month"
        />
      </div>

      {/* Current Session and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Session & Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Session Card */}
          {!isAdmin && (
            <div className={`rounded-2xl p-6 ${
              currentSession?.isActive 
                ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
                : 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {currentSession?.isActive ? 'Current Session Active' : 'No Active Session'}
                  </h3>
                  {currentSession?.isActive ? (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Clock In</p>
                        <p className="text-base sm:text-lg font-semibold">
                          {currentSession.formattedClockIn || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-base sm:text-lg font-semibold">
                          {currentSession.formattedDuration || '0m'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-2">You're currently not clocked in</p>
                  )}
                </div>
                <button
                  onClick={onClockAction}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 self-start sm:self-auto ${
                    currentSession?.isActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Clock4 className="w-4 h-4" />
                  {currentSession?.isActive ? 'Clock Out' : 'Clock In'}
                </button>
              </div>
            </div>
          )}

          {/* Period Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <div className="space-y-4">
              {Object.entries(periodStats).map(([period, data]) => (
                <div key={period} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{period}</span>
                    <span className="text-sm text-gray-500">
                      {data.totalSessions} sessions
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Hours Worked</p>
                      <p className="font-semibold">{data.totalHoursWorked}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Days Clocked In</p>
                      <p className="font-semibold">{data.daysClockedIn}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg/Day</p>
                      <p className="font-semibold">{data.avgHoursPerDay}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Attendance</p>
                      <p className="font-semibold">{data.attendanceRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {!isAdmin && (
                <QuickActionButton
                  icon={<Clock4 className="w-5 h-5" />}
                  label={currentSession?.isActive ? "Clock Out" : "Clock In"}
                  onClick={onClockAction}
                  color={currentSession?.isActive ? "red" : "blue"}
                />
              )}
              <QuickActionButton
                icon={<Download className="w-5 h-5" />}
                label="Export Report"
                onClick={() => alert('Export coming soon')}
                color="green"
              />
              <QuickActionButton
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
                onClick={() => alert('Settings')}
                color="purple"
              />
              <QuickActionButton
                icon={<HelpCircle className="w-5 h-5" />}
                label="Help & Support"
                onClick={() => alert('Help')}
                color="gray"
              />
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
              <span className="text-sm text-gray-500">{recentSessions.length} of {sessions.length}</span>
            </div>
            
            <div className="space-y-4">
              {recentSessions.length > 0 ? (
                recentSessions.map((session, index) => (
                  <div key={session.id || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        session.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {session.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {new Date(session.loginAt || session.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.formattedClockIn || 'No clock-in'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-sm">{session.formattedDuration || '0m'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[100px]">
                        {session.device || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No sessions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sessions View Component with Backend Data
const SessionsView = ({ 
  isAdmin, 
  sessions, 
  filters, 
  setFilters, 
  pagination, 
  activeTab,
  setActiveTab,
  fetchAdminSessions,
  fetchMySessions,
  userData,
  onDeleteSession,
  onExport,
  onRefresh 
}) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const tabs = isAdmin 
    ? [
        { id: 'all', label: 'All Sessions', count: pagination.total },
        { id: 'active', label: 'Active', count: sessions.filter(s => s.status === 'active' || s.isActive).length },
        { id: 'completed', label: 'Completed', count: sessions.filter(s => s.status === 'completed' || s.isClockedOut).length },
      ]
    : [
        { id: 'my-sessions', label: 'My Sessions', count: pagination.total },
        { id: 'active', label: 'Active', count: sessions.filter(s => s.isActive).length },
        { id: 'clocked-in', label: 'Clocked In', count: sessions.filter(s => s.isClockedIn).length },
      ];

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setShowDetails(true);
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return session.isActive || session.status === 'active';
    if (activeTab === 'completed') return session.isClockedOut || session.status === 'completed';
    if (activeTab === 'clocked-in') return session.isClockedIn;
    return true;
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      status: '',
      startDate: '',
      endDate: '',
      searchQuery: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Session Management</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {isAdmin 
                ? 'Monitor and manage all user sessions'
                : 'View and manage your work sessions and attendance'
              }
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm sm:text-base"
            >
              <DownloadCloud className="w-4 h-4" />
              Export
            </button>
            {!isAdmin && (
              <button
                onClick={() => alert('Coming soon')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base"
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            )}
          </div>
        </div>

        {/* Filters - Admin Only */}
        {isAdmin && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search by user..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="clocked-in">Clocked In</option>
              <option value="clocked-out">Clocked Out</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
            />
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
            />
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 text-xs bg-gray-100 rounded-full min-w-[24px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In/Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session, index) => (
                  <tr key={session.id || session._id || index} className="hover:bg-gray-50">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {session.userName || session.userEmail?.split('@')[0] || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {session.userEmail || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <p className="text-gray-900 text-sm">
                        {new Date(session.loginAt || session.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.loginAt || session.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Clock className="w-3 h-3 mr-1 text-green-600" />
                          <span className="text-gray-700">{session.formattedClockIn || '--:--'}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <LogOut className="w-3 h-3 mr-1 text-red-600" />
                          <span className="text-gray-700">{session.formattedClockOut || '--:--'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Timer className="w-3 h-3 mr-1" />
                        {session.formattedDuration || '0m'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {session.device?.toLowerCase().includes('mobile') ? (
                          <Smartphone className="w-4 h-4 mr-2 text-gray-500" />
                        ) : (
                          <Laptop className="w-4 h-4 mr-2 text-gray-500" />
                        )}
                        <span className="text-gray-700 text-sm truncate max-w-[100px]">
                          {session.device || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          session.isActive
                            ? 'bg-green-100 text-green-800'
                            : session.isClockedIn
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.isActive ? (
                            <>
                              <Activity className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : session.isClockedIn ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Clocked In
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          )}
                        </span>
                        {session.isClockedIn && !session.isClockedOut && (
                          <span className="text-xs text-gray-500">Working...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSessionClick(session)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => onDeleteSession(session.id || session._id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                        <button
                          onClick={() => alert('More options')}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Clock className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium mb-2">No sessions found</p>
                      <p className="text-sm text-gray-400">
                        {activeTab !== 'all' 
                          ? `No ${activeTab} sessions available`
                          : 'No sessions match your criteria'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSessions.length > 0 && pagination.total > pagination.limit && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} sessions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => isAdmin ? fetchAdminSessions(pagination.page - 1) : fetchMySessions(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => isAdmin ? fetchAdminSessions(pageNum) : fetchMySessions(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => isAdmin ? fetchAdminSessions(pagination.page + 1) : fetchMySessions(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {showDetails && selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          isAdmin={isAdmin}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

// Analytics View Component with Backend Data - FIXED
const AnalyticsView = ({ stats, analyticsData, sessions }) => {
  const [timeRange, setTimeRange] = useState('7d');
  
  // Use provided analytics data or generate from sessions
  const deviceDistribution = analyticsData.deviceDistribution.length > 0 
    ? analyticsData.deviceDistribution 
    : sessions.reduce((acc, session) => {
        const device = session.device?.toLowerCase() || 'unknown';
        if (device.includes('mobile') || device.includes('iphone') || device.includes('android')) {
          acc.mobile = (acc.mobile || 0) + 1;
        } else if (device.includes('desktop') || device.includes('windows') || device.includes('mac')) {
          acc.desktop = (acc.desktop || 0) + 1;
        } else if (device.includes('tablet') || device.includes('ipad')) {
          acc.tablet = (acc.tablet || 0) + 1;
        } else {
          acc.other = (acc.other || 0) + 1;
        }
        return acc;
      }, { mobile: 0, desktop: 0, tablet: 0, other: 0 });

  const dailyActivity = analyticsData.dailyActivity.length > 0 
    ? analyticsData.dailyActivity 
    : Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          sessions: sessions.filter(s => {
            const sessionDate = new Date(s.loginAt || s.createdAt).toISOString().split('T')[0];
            return sessionDate === date.toISOString().split('T')[0];
          }).length
        };
      });

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Real-time insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSessions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-2">from last week</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSessions}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-gray-500 ml-2">from yesterday</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg. Duration</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgDuration}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600 font-medium">-3%</span>
              <span className="text-gray-500 ml-2">from last week</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.attendanceRate}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+5%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
          <div className="space-y-4">
            {Object.entries(deviceDistribution).map(([device, count]) => {
              const total = typeof count === 'object' 
                ? Object.values(count).reduce((a, b) => a + b, 0)
                : Object.values(deviceDistribution).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
              
              const deviceCount = typeof count === 'object' ? count.count || count.total || 0 : count;
              const percentage = total > 0 ? Math.round((deviceCount / total) * 100) : 0;
              
              return (
                <div key={device} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{device}</span>
                    <span className="text-gray-500">{deviceCount} sessions ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        device === 'mobile' ? 'bg-blue-500' :
                        device === 'desktop' ? 'bg-green-500' :
                        device === 'tablet' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity (Last 7 days)</h3>
          <div className="h-64 flex items-end space-x-2">
            {dailyActivity.map((item, index) => {
              const maxCount = Math.max(...dailyActivity.map(d => d.sessions || d.count || 0));
              const height = maxCount > 0 ? ((item.sessions || item.count || 0) / maxCount) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                    style={{ height: `${height}%`, minHeight: '10px' }}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-sm font-semibold mt-1">{item.sessions || item.count || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users View Component
const UsersView = ({ userData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const response = await axios.get('/users/all');
      
      console.log('Users response:', response.data);
      
      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
        console.log('Users loaded:', response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage all system users and their permissions</p>
        </div>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 self-start"
          onClick={() => alert('Add user functionality coming soon')}
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search users..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-900 block">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {user.department || 'No department'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-2 text-gray-400" />
                          <span className="text-gray-700">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role || 'employee'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                        onClick={() => alert(`Edit ${user.firstName}`)}
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${user.firstName}?`)) {
                            alert('User deleted');
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No users found</p>
          <p className="text-sm text-gray-400">
            {searchTerm || roleFilter !== 'all' 
              ? 'Try changing your search criteria'
              : 'Add new users to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Settings View Component
const SettingsView = ({ userData, isAdmin }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    autoLogout: true,
    autoLogoutHours: 8,
    theme: 'light',
    language: 'en',
    timezone: 'UTC'
  });

  const [profileData, setProfileData] = useState({
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    phone: userData.phone || '',
    department: userData.department || '',
    designation: userData.designation || '',
    address: userData.address || ''
  });

  const handleSaveSettings = async () => {
    try {
      // Save preferences
      await axios.put('/users/preferences', settings);
      
      // Save profile if changed
      await axios.put('/users/profile', profileData);
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings');
    }
  };

  const handleResetPassword = async () => {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 6) {
      try {
        await axios.post('/users/reset-password', { newPassword });
        alert('Password reset successfully!');
      } catch (error) {
        alert('Failed to reset password');
      }
    } else {
      alert('Password must be at least 6 characters');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
        
        <div className="space-y-8">
          {/* Profile Information */}
          <div className="border-b border-gray-200 pb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  value={profileData.designation}
                  onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border-b border-gray-200 pb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Enable notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications for important updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Email updates</p>
                  <p className="text-sm text-gray-500">Receive weekly reports via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailUpdates}
                  onChange={(e) => setSettings({...settings, emailUpdates: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Auto logout</p>
                  <p className="text-sm text-gray-500">Automatically logout after inactivity</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoLogout}
                    onChange={(e) => setSettings({...settings, autoLogout: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                  />
                  {settings.autoLogout && (
                    <select
                      value={settings.autoLogoutHours}
                      onChange={(e) => setSettings({...settings, autoLogoutHours: parseInt(e.target.value)})}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="4">4 hours</option>
                      <option value="8">8 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                    </select>
                  )}
                </div>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="bn">Bangla</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="border-b border-gray-200 pb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-4">
              <button
                onClick={handleResetPassword}
                className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-700">Reset Password</p>
                  <p className="text-sm text-gray-500">Change your account password</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => alert('Two-factor authentication setup')}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-600">Disabled</span>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              User ID: {userData._id?.substring(0, 12)}...
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setProfileData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    department: userData.department || '',
                    designation: userData.designation || '',
                    address: userData.address || ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset Changes
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color, trend, subtitle }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    green: 'from-green-50 to-green-100 text-green-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
    orange: 'from-orange-50 to-orange-100 text-orange-600'
  };

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 sm:p-3 ${bgColorClasses[color]} rounded-lg`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend.positive ? (
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={trend.positive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {trend.value}
          </span>
          <span className="text-gray-500 ml-2">this week</span>
        </div>
      )}
    </div>
  );
};

const QuickActionButton = ({ icon, label, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: 'hover:bg-blue-50 text-blue-700',
    green: 'hover:bg-green-50 text-green-700',
    red: 'hover:bg-red-50 text-red-700',
    purple: 'hover:bg-purple-50 text-purple-700',
    gray: 'hover:bg-gray-50 text-gray-700'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${colorClasses[color]}`}
    >
      <div className={`p-2 rounded-lg ${
        color === 'blue' ? 'bg-blue-100' :
        color === 'green' ? 'bg-green-100' :
        color === 'red' ? 'bg-red-100' :
        color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
      }`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

const SessionDetailsModal = ({ session, isAdmin, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Session Details</h3>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(session.loginAt || session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            {isAdmin && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </h4>
                <div className="space-y-4">
                  {session.userName && (
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{session.userName}</p>
                    </div>
                  )}
                  {session.userEmail && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{session.userEmail}</p>
                    </div>
                  )}
                  {session.userRole && (
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium capitalize">{session.userRole}</p>
                    </div>
                  )}
                  {session.userDepartment && (
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{session.userDepartment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session Information */}
            <div className={`rounded-xl p-6 ${
              session.isActive ? 'bg-green-50' : 'bg-blue-50'
            }`}>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Login Time</p>
                  <p className="font-medium">
                    {new Date(session.loginAt || session.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Logout Time</p>
                  <p className="font-medium">
                    {session.logoutAt ? new Date(session.logoutAt).toLocaleString() : 'Still active'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clock In</p>
                  <p className="font-medium">{session.formattedClockIn || '--:--'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clock Out</p>
                  <p className="font-medium">{session.formattedClockOut || '--:--'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{session.formattedDuration || '0m'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    session.isActive
                      ? 'bg-green-100 text-green-800'
                      : session.isClockedIn
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.isActive ? 'Active' : 
                     session.isClockedIn ? 'Clocked In' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Device Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {session.device && (
                  <div>
                    <p className="text-sm text-gray-500">Device</p>
                    <p className="font-medium">{session.device}</p>
                  </div>
                )}
                {session.browser && (
                  <div>
                    <p className="text-sm text-gray-500">Browser</p>
                    <p className="font-medium">{session.browser}</p>
                  </div>
                )}
                {session.os && (
                  <div>
                    <p className="text-sm text-gray-500">Operating System</p>
                    <p className="font-medium">{session.os}</p>
                  </div>
                )}
                {session.ip && (
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-medium">{session.ip}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activities */}
            {session.activities && session.activities.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activities ({session.activities.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {session.activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded">
                      <span className="text-sm">{activity.action}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};