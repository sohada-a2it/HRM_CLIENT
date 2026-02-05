'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DollarSign, 
  Calendar,
  PieChart,
  FileText,
  BarChart3,
  Download,
  RefreshCw,
  ChevronDown,
  PlusCircle,
  Tag,
  AlertCircle,
  FileDown,
  Utensils,
  Shield,
  LogOut,
  User,
  Home,
  Zap,
  Package,
  Cpu,
  Car,
  Gift,
  Coffee
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// API base URL
const API_BASE_URL = 'https://a2itserver.onrender.com/api/v1';

// Months for dropdown
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function page() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState({ monthly: false, yearly: false });
  const [pdfReady, setPdfReady] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [jsPDF, setJsPDF] = useState(null);
  const [autoTable, setAutoTable] = useState(null);
  
  // Initialize PDF libraries on client side
  useEffect(() => {
    const initializePDF = async () => {
      if (typeof window !== 'undefined') {
        try {
          const [jsPDFModule, autoTableModule] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable')
          ]);
          setJsPDF(() => jsPDFModule.default);
          setAutoTable(() => autoTableModule.default);
          setPdfReady(true);
        } catch (error) {
          console.error('Failed to load PDF libraries:', error);
        }
      }
    };
    
    initializePDF();
  }, []);
  
  const [dashboardData, setDashboardData] = useState({
    // Selected Period
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    selectedYearForYearly: new Date().getFullYear(),
    
    // Summary Data
    monthlySummary: {
      total: 0,
      employeeSalaries: 0,
      officeRent: 0,
      utilities: 0,
      officeSupplies: 0,
      softwareSubscriptions: 0,
      transportExpenses: 0,
      extraExpenses: 0,
      foodCosts: 0,
      categoryBreakdown: []
    },
    
    yearlySummary: {
      total: 0,
      monthlyBreakdown: [],
      categoryTotals: []
    },
    
    recentExpenses: [],
    
    isLoading: false,
    isLoadingYearly: false,
    error: null
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Check admin mode on user change
  useEffect(() => {
    if (user) {
      const adminToken = localStorage.getItem('adminToken');
      setIsAdminMode(!!adminToken);
    }
  }, [user]);

  // Fetch data after authentication
  useEffect(() => {
    if (user && !authLoading) {
      fetchMonthlySummary();
      fetchYearlySummary();
      fetchRecentExpenses();
    }
  }, [user, authLoading, dashboardData.selectedYear, dashboardData.selectedMonth, dashboardData.selectedYearForYearly]);

  // Check if user is authenticated - IMPROVED VERSION
  const checkAuthentication = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');
      const adminToken = localStorage.getItem('adminToken');
      
      // Check if we have ANY authentication method
      const hasAnyAuth = userData || token || adminToken;
      
      if (!hasAnyAuth) {
        console.log('No authentication data found, redirecting to login');
        router.push('/');
        return;
      }
      
      // If user data exists, use it
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        // If only tokens exist, create a minimal user object
        setUser({
          name: adminToken ? 'Admin User' : 'Authenticated User',
          role: adminToken ? 'admin' : 'user'
        });
      }
      
      setAuthLoading(false);
      
    } catch (error) {
      console.error('Error in authentication check:', error);
      // Clear everything and redirect
      localStorage.clear();
      router.push('/');
    }
  }, [router]);

  // Update the useEffect that checks authentication
  useEffect(() => {
    checkAuthentication();
    
    // Add visibility change listener to refresh auth when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthentication();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuthentication]);

  // Improve getAuthHeaders function
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    const adminToken = localStorage.getItem('adminToken');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Priority: adminToken > token
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }, []);

  // Add token validation function
  const validateToken = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      
      // If no headers with auth, skip validation
      if (!headers.Authorization) {
        return false;
      }
      
      // Make a simple API call to validate token
      const response = await fetch(`${API_BASE_URL}/employees?limit=1`, { 
        headers,
        method: 'GET'
      });
      
      if (response.status === 401 || response.status === 403) {
        console.log('Token validation failed');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, [getAuthHeaders]);

  // Update API error handling to be less aggressive
  const handleAPIError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);
    
    // Check if it's an authentication error
    const isAuthError = error.message?.includes('authentication') || 
                        error.message?.includes('token') || 
                        error.message?.includes('401') || 
                        error.message?.includes('403');
    
    if (isAuthError) {
      // Try to validate token first
      validateToken().then(isValid => {
        if (!isValid) {
          // Only show message, don't clear everything immediately
          setDashboardData(prev => ({
            ...prev,
            error: `Authentication issue in ${context}. Some data may not load.`,
            isLoading: false,
            isLoadingYearly: false
          }));
          
          // Schedule a token refresh check
          setTimeout(() => {
            checkAuthentication();
          }, 2000);
        }
      });
      
      return false;
    }
    
    // Other errors
    setDashboardData(prev => ({ 
      ...prev, 
      error: error.message || `Failed to load ${context} data`,
      isLoading: false,
      isLoadingYearly: false
    }));
    
    return true;
  }, [validateToken, checkAuthentication]);

  // Add a refresh token function
  const refreshAuth = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');
      const adminToken = localStorage.getItem('adminToken');
      
      // Try to get fresh data from backend
      if (adminToken) {
        // For admin, we might need to re-verify
        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('Admin token still valid');
          return true;
        }
      }
      
      // For regular users, check if we have the original login data
      if (userData && token) {
        // Token might still be valid, just update user data
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      return false;
    }
  }, []);

  // Add auto-refresh on focus
  useEffect(() => {
    const handleFocus = () => {
      // Refresh auth when window gets focus
      if (user) {
        refreshAuth();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, refreshAuth]);

  // Generate year options (last 5 years + current year + next year)
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => currentYear - 3 + i),
    [currentYear]
  );

  // Format currency in BDT (Taka)
  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'BDT 0.00';
    
    const formattedAmount = new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    return `BDT ${formattedAmount}`;
  }, []);

  // Format currency without symbol (for display where needed)
  const formatAmount = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, []);

  // Calculate percentage for category breakdown
  const calculatePercentage = useCallback((amount) => {
    const total = dashboardData.monthlySummary.total;
    return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
  }, [dashboardData.monthlySummary.total]);

  // Calculate percentage for yearly summary
  const calculateYearlyPercentage = useCallback((amount) => {
    const total = dashboardData.yearlySummary.total;
    return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
  }, [dashboardData.yearlySummary.total]); 

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    setDashboardData(prev => ({
      ...prev,
      error: 'Your session has expired. Please login again.'
    }));
    
    // Give user time to see the message
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/');
    }, 3000);
  }, [router]);

  // Fetch monthly summary data
  const fetchMonthlySummary = async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { selectedYear, selectedMonth } = dashboardData;
      const headers = getAuthHeaders();
      
      // Fetch all data including food costs
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills/month/${selectedYear}/${selectedMonth}`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/software-subscriptions`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers }),
        fetch(`${API_BASE_URL}/food-costs`, { headers })
      ]);

      // Parse responses with error handling
      const data = await Promise.all(
        responses.map(async (response, index) => {
          if (response.status === 'fulfilled') {
            try {
              const result = await response.value.json();
              
              // Check for authentication error
              if (response.value.status === 401 || response.value.status === 403) {
                console.warn(`API ${index} returned auth error`);
                return { success: false, data: [], authError: true };
              }
              
              return result;
            } catch (error) {
              console.error(`Error parsing API ${index} response:`, error);
              return { success: false, data: [] };
            }
          }
          return { success: false, data: [] };
        })
      );

      // Check if any API had auth error
      const hasAuthError = data.some(item => item.authError);
      if (hasAuthError) {
        handleAPIError(new Error('Authentication failed for some APIs'), 'monthly summary');
        return;
      }

      // Filter data for selected month
      const filterByMonth = (items, dateField) => {
        if (!items || !Array.isArray(items)) return [];
        return items.filter(item => {
          if (!item[dateField]) return false;
          try {
            const date = new Date(item[dateField]);
            return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
          } catch {
            return false;
          }
        });
      };

      const monthRents = filterByMonth(data[0]?.data, 'date');
      const monthBills = data[1]?.data || [];
      const monthSupplies = filterByMonth(data[2]?.data, 'date');
      const monthSoftware = filterByMonth(data[3]?.data, 'date');
      const monthTransport = filterByMonth(data[4]?.data, 'date');
      const monthExtra = filterByMonth(data[5]?.data, 'date');
      const monthFoodCosts = filterByMonth(data[6]?.data, 'date');

      // Calculate totals
      const officeRent = monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0);
      const utilities = monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
      const officeSupplies = monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0);
      const softwareSubscriptions = monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0);
      const transportExpenses = monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0);
      const extraExpenses = monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);
      const foodCosts = monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0);

      // Note: Employee salaries are fetched separately in yearly summary
      const employeeSalaries = 0; // This will be updated when yearly summary fetches

      const total = officeRent + utilities + officeSupplies + 
                    softwareSubscriptions + transportExpenses + extraExpenses + foodCosts;

      // Create category breakdown for chart including food costs
      const categoryBreakdown = [
        { category: 'Employee Salaries', amount: employeeSalaries, color: '#8B5CF6', icon: '👨‍💼' },
        { category: 'House Rent', amount: officeRent, color: '#A855F7', icon: '🏢' },
        { category: 'Utilities', amount: utilities, color: '#D946EF', icon: '💡' },
        { category: 'Office Supplies', amount: officeSupplies, color: '#EC4899', icon: '📦' },
        { category: 'Software Subscriptions', amount: softwareSubscriptions, color: '#F43F5E', icon: '💻' },
        { category: 'Transport Expenses', amount: transportExpenses, color: '#8B5CF6', icon: '🚗' },
        { category: 'Extra Expenses', amount: extraExpenses, color: '#A855F7', icon: '📝' },
        { category: 'Food Costs', amount: foodCosts, color: '#D946EF', icon: '🍽️' }
      ].filter(item => item.amount > 0);

      setDashboardData(prev => ({
        ...prev,
        monthlySummary: {
          total,
          employeeSalaries,
          officeRent,
          utilities,
          officeSupplies,
          softwareSubscriptions,
          transportExpenses,
          extraExpenses,
          foodCosts,
          categoryBreakdown
        },
        isLoading: false
      }));

    } catch (error) {
      handleAPIError(error, 'monthly summary');
    }
  };

  // Fetch yearly summary data
  const fetchYearlySummary = async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ ...prev, isLoadingYearly: true }));
      
      const { selectedYearForYearly } = dashboardData;
      const headers = getAuthHeaders();
      
      // Fetch all data including food costs
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/employees`, { headers }),
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/software-subscriptions`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers }),
        fetch(`${API_BASE_URL}/food-costs`, { headers })
      ]);

      // Parse responses with error handling
      const data = await Promise.all(
        responses.map(async (response, index) => {
          if (response.status === 'fulfilled') {
            try {
              const result = await response.value.json();
              
              // Check for authentication error
              if (response.value.status === 401 || response.value.status === 403) {
                console.warn(`API ${index} returned auth error`);
                return { success: false, data: [], authError: true };
              }
              
              return result;
            } catch (error) {
              console.error(`Error parsing API ${index} response:`, error);
              return { success: false, data: [] };
            }
          }
          return { success: false, data: [] };
        })
      );

      // Check if any API had auth error
      const hasAuthError = data.some(item => item.authError);
      if (hasAuthError) {
        handleAPIError(new Error('Authentication failed for some APIs'), 'yearly summary');
        return;
      }

      // Filter data for selected year
      const filterByYear = (items, dateField) => {
        if (!items || !Array.isArray(items)) return [];
        return items.filter(item => {
          if (!item[dateField]) return false;
          try {
            const date = new Date(item[dateField]);
            return date.getFullYear() === selectedYearForYearly;
          } catch {
            return false;
          }
        });
      };

      const yearEmployees = filterByYear(data[0]?.data, 'salaryDate');
      const yearRents = filterByYear(data[1]?.data, 'date');
      const yearBills = (data[2]?.data || []).filter(bill => bill.year === selectedYearForYearly);
      const yearSupplies = filterByYear(data[3]?.data, 'date');
      const yearSoftware = filterByYear(data[4]?.data, 'date');
      const yearTransport = filterByYear(data[5]?.data, 'date');
      const yearExtra = filterByYear(data[6]?.data, 'date');
      const yearFoodCosts = filterByYear(data[7]?.data, 'date');

      // Update monthly summary with employee salaries for current month
      if (dashboardData.selectedYear === selectedYearForYearly) {
        const currentMonthEmployees = yearEmployees.filter(emp => {
          try {
            const date = new Date(emp.salaryDate);
            return date.getMonth() + 1 === dashboardData.selectedMonth;
          } catch {
            return false;
          }
        });
        
        const currentMonthSalaries = currentMonthEmployees.reduce((sum, emp) => 
          sum + (emp.calculatedSalary || emp.salary || 0), 0);
        
        setDashboardData(prev => ({
          ...prev,
          monthlySummary: {
            ...prev.monthlySummary,
            employeeSalaries: currentMonthSalaries,
            total: prev.monthlySummary.total + currentMonthSalaries
          }
        }));
      }

      // Calculate monthly breakdown including food costs
      const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = MONTHS[i].substring(0, 3);
        
        // Filter data for each month
        const filterByMonth = (items, dateField) => {
          return items.filter(item => {
            try {
              const date = new Date(item[dateField]);
              return date.getMonth() + 1 === month;
            } catch {
              return false;
            }
          });
        };

        const monthEmployees = filterByMonth(yearEmployees, 'salaryDate');
        const monthRents = filterByMonth(yearRents, 'date');
        const monthBills = yearBills.filter(bill => bill.month === month);
        const monthSupplies = filterByMonth(yearSupplies, 'date');
        const monthSoftware = filterByMonth(yearSoftware, 'date');
        const monthTransport = filterByMonth(yearTransport, 'date');
        const monthExtra = filterByMonth(yearExtra, 'date');
        const monthFoodCosts = filterByMonth(yearFoodCosts, 'date');

        const total = 
          monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0) +
          monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0) +
          monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) +
          monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0) +
          monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0) +
          monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0) +
          monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0) +
          monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0);

        return {
          month,
          monthName,
          total,
          employeeSalaries: monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0),
          officeRent: monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0),
          utilities: monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0),
          officeSupplies: monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0),
          softwareSubscriptions: monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0),
          transportExpenses: monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0),
          extraExpenses: monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0),
          foodCosts: monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0)
        };
      });

      // Calculate category totals for the year including food costs
      const categoryTotals = [
        { category: 'Employee Salaries', amount: yearEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0), color: '#8B5CF6', icon: '👨‍💼' },
        { category: 'House Rent', amount: yearRents.reduce((sum, rent) => sum + (rent.rent || 0), 0), color: '#A855F7', icon: '🏢' },
        { category: 'Utilities', amount: yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0), color: '#D946EF', icon: '💡' },
        { category: 'Office Supplies', amount: yearSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0), color: '#EC4899', icon: '📦' },
        { category: 'Software Subscriptions', amount: yearSoftware.reduce((sum, software) => sum + (software.amount || 0), 0), color: '#F43F5E', icon: '💻' },
        { category: 'Transport Expenses', amount: yearTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0), color: '#8B5CF6', icon: '🚗' },
        { category: 'Extra Expenses', amount: yearExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0), color: '#A855F7', icon: '📝' },
        { category: 'Food Costs', amount: yearFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0), color: '#D946EF', icon: '🍽️' }
      ].filter(item => item.amount > 0);

      const total = categoryTotals.reduce((sum, item) => sum + item.amount, 0);

      setDashboardData(prev => ({
        ...prev,
        yearlySummary: {
          total,
          monthlyBreakdown,
          categoryTotals
        },
        isLoadingYearly: false
      }));

    } catch (error) {
      handleAPIError(error, 'yearly summary');
    }
  };

  // Fetch recent expenses
  const fetchRecentExpenses = async () => {
    if (!user) return;
    
    try {
      const headers = getAuthHeaders();
      
      // Combine recent expenses from all categories
      const recentExpenses = [];
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      // Helper function to add expenses
      const addExpenses = (data, type, nameField, amountField, dateField) => {
        if (data?.data && Array.isArray(data.data)) {
          data.data.forEach(item => {
            if (item[dateField]) {
              try {
                const date = new Date(item[dateField]);
                if (date >= oneMonthAgo) {
                  recentExpenses.push({
                    id: item._id || item.id || Date.now() + Math.random(),
                    category: type,
                    name: item[nameField] || 'Unknown',
                    amount: item[amountField] || 0,
                    date: date,
                    payment: item.paymentMethod || 'Cash'
                  });
                }
              } catch (error) {
                console.warn('Error parsing expense date:', error);
              }
            }
          });
        }
      };

      // Fetch all expense types including food costs
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/employees`, { headers }),
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/software-subscriptions`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers }),
        fetch(`${API_BASE_URL}/food-costs`, { headers })
      ]);

      // Parse responses with error handling
      const data = await Promise.all(
        responses.map(async (response, index) => {
          if (response.status === 'fulfilled') {
            try {
              const result = await response.value.json();
              
              // Check for authentication error
              if (response.value.status === 401 || response.value.status === 403) {
                console.warn(`API ${index} returned auth error in recent expenses`);
                return { success: false, data: [] };
              }
              
              return result;
            } catch (error) {
              console.error(`Error parsing API ${index} response:`, error);
              return { success: false, data: [] };
            }
          }
          return { success: false, data: [] };
        })
      );

      // Add all expenses including food costs
      addExpenses(data[0], 'Employee Salary', 'name', 'calculatedSalary', 'salaryDate');
      addExpenses(data[1], 'House Rent', 'type', 'rent', 'date');
      addExpenses(data[2], 'Utility Bill', 'name', 'amount', 'date');
      addExpenses(data[3], 'Office Supply', 'name', 'price', 'date');
      addExpenses(data[4], 'Software', 'softwareName', 'amount', 'date');
      addExpenses(data[5], 'Transport', 'transportName', 'cost', 'date');
      addExpenses(data[6], 'Extra Expense', 'expenseName', 'amount', 'date');
      addExpenses(data[7], 'Food Cost', 'note', 'cost', 'date');

      // Sort by date descending and take top 10
      recentExpenses.sort((a, b) => b.date - a.date);
      const topRecent = recentExpenses.slice(0, 10);

      setDashboardData(prev => ({
        ...prev,
        recentExpenses: topRecent
      }));

    } catch (error) {
      console.error('Error fetching recent expenses:', error);
      // Don't show error for recent expenses, it's less critical
    }
  };

  // Download Monthly Summary PDF
  const downloadMonthlyPDF = async () => {
    if (!pdfReady || downloadingPDF.monthly || dashboardData.isLoading || !dashboardData.monthlySummary.categoryBreakdown.length) {
      alert('Please wait for PDF libraries to load or ensure there is data available.');
      return;
    }
    
    setDownloadingPDF(prev => ({ ...prev, monthly: true }));
    
    try {
      // Load libraries if not already loaded
      let pdfLib = jsPDF;
      let tableLib = autoTable;
      
      if (!pdfLib || !tableLib) {
        const [jsPDFModule, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
        ]);
        pdfLib = jsPDFModule.default;
        tableLib = autoTableModule.default;
      }
      
      const doc = new pdfLib();
      const monthName = MONTHS[dashboardData.selectedMonth - 1];
      const year = dashboardData.selectedYear;
      const summary = dashboardData.monthlySummary;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Monthly Expense Summary - ${monthName} ${year}`, 105, 20, { align: 'center' });
      
      // Add company/org info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      doc.text(`Generated by: ${user?.name || 'Admin'}`, 105, 38, { align: 'center' });
      
      if (isAdminMode) {
        doc.text('Access Mode: ADMIN', 105, 46, { align: 'center' });
      }
      
      // Add total summary
      doc.setFontSize(16);
      doc.setTextColor(107, 33, 168);
      doc.text(`Total Monthly Expenses: ${formatCurrency(summary.total)}`, 105, isAdminMode ? 60 : 55, { align: 'center' });
      
      // Add summary table using autoTable
      tableLib(doc, {
        startY: isAdminMode ? 65 : 60,
        head: [['Category', 'Amount (BDT)', 'Percentage']],
        body: [
          ['Employee Salaries', formatAmount(summary.employeeSalaries), `${calculatePercentage(summary.employeeSalaries)}%`],
          ['House Rent', formatAmount(summary.officeRent), `${calculatePercentage(summary.officeRent)}%`],
          ['Utilities', formatAmount(summary.utilities), `${calculatePercentage(summary.utilities)}%`],
          ['Office Supplies', formatAmount(summary.officeSupplies), `${calculatePercentage(summary.officeSupplies)}%`],
          ['Software Subscriptions', formatAmount(summary.softwareSubscriptions), `${calculatePercentage(summary.softwareSubscriptions)}%`],
          ['Transport Expenses', formatAmount(summary.transportExpenses), `${calculatePercentage(summary.transportExpenses)}%`],
          ['Extra Expenses', formatAmount(summary.extraExpenses), `${calculatePercentage(summary.extraExpenses)}%`],
          ['Food Costs', formatAmount(summary.foodCosts), `${calculatePercentage(summary.foodCosts)}%`],
          ['', '', ''],
          ['TOTAL', formatAmount(summary.total), '100%']
        ],
        theme: 'grid',
        headStyles: { fillColor: [107, 33, 168], textColor: 255, fontSize: 12 },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 }
        },
        margin: { left: 15, right: 15 }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
        doc.text('Confidential - Office Expenses Report', 15, 285);
        if (isAdminMode) {
          doc.text('Admin Access Report', 105, 285, { align: 'center' });
        }
      }
      
      // Save the PDF
      doc.save(`Monthly_Expense_Summary_${monthName}_${year}${isAdminMode ? '_ADMIN' : ''}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(prev => ({ ...prev, monthly: false }));
    }
  };

  // Download Yearly Summary PDF
  const downloadYearlyPDF = async () => {
    if (!pdfReady || downloadingPDF.yearly || dashboardData.isLoadingYearly || !dashboardData.yearlySummary.monthlyBreakdown.length) {
      alert('Please wait for PDF libraries to load or ensure there is data available.');
      return;
    }
    
    setDownloadingPDF(prev => ({ ...prev, yearly: true }));
    
    try {
      // Load libraries if not already loaded
      let pdfLib = jsPDF;
      let tableLib = autoTable;
      
      if (!pdfLib || !tableLib) {
        const [jsPDFModule, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
        ]);
        pdfLib = jsPDFModule.default;
        tableLib = autoTableModule.default;
      }
      
      const doc = new pdfLib();
      const year = dashboardData.selectedYearForYearly;
      const summary = dashboardData.yearlySummary;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Yearly Expense Summary - ${year}`, 105, 20, { align: 'center' });
      
      // Add company/org info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      doc.text(`Generated by: ${user?.name || 'Admin'}`, 105, 38, { align: 'center' });
      
      if (isAdminMode) {
        doc.text('Access Mode: ADMIN', 105, 46, { align: 'center' });
      }
      
      // Add total summary
      doc.setFontSize(16);
      doc.setTextColor(147, 51, 234);
      doc.text(`Total Yearly Expenses: ${formatCurrency(summary.total)}`, 105, isAdminMode ? 60 : 55, { align: 'center' });
      
      // Add monthly breakdown table
      tableLib(doc, {
        startY: isAdminMode ? 65 : 60,
        head: [['Month', 'Total (BDT)', 'Employee Salaries', 'House Rent', 'Utilities', 'Other']],
        body: summary.monthlyBreakdown.map(month => [
          month.monthName,
          formatAmount(month.total),
          formatAmount(month.employeeSalaries),
          formatAmount(month.officeRent),
          formatAmount(month.utilities),
          formatAmount(month.officeSupplies + month.softwareSubscriptions + month.transportExpenses + month.extraExpenses + month.foodCosts)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234], textColor: 255, fontSize: 11 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        },
        margin: { left: 10, right: 10 }
      });
      
      // Add a new page for category totals
      doc.addPage();
      
      // Add category totals
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Yearly Category Totals', 105, 20, { align: 'center' });
      
      tableLib(doc, {
        startY: 30,
        head: [['Category', 'Amount (BDT)', 'Percentage', 'Monthly Average']],
        body: summary.categoryTotals.map(item => [
          item.category,
          formatAmount(item.amount),
          `${calculateYearlyPercentage(item.amount)}%`,
          formatAmount(item.amount / 12)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247], textColor: 255, fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 40 },
          2: { cellWidth: 35 },
          3: { cellWidth: 45 }
        },
        margin: { left: 10, right: 10 }
      });
      
      // Add summary statistics
      const finalY = doc.lastAutoTable.finalY || 80;
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      
      // Find highest and lowest months
      if (summary.monthlyBreakdown.length > 0) {
        const highestMonth = summary.monthlyBreakdown.reduce((max, month) => 
          month.total > max.total ? month : max, summary.monthlyBreakdown[0]);
        const lowestMonth = summary.monthlyBreakdown.reduce((min, month) => 
          month.total < min.total ? month : min, summary.monthlyBreakdown[0]);
        
        doc.text(`Highest Expense Month: ${highestMonth.monthName} - ${formatCurrency(highestMonth.total)}`, 15, finalY + 15);
        doc.text(`Lowest Expense Month: ${lowestMonth.monthName} - ${formatCurrency(lowestMonth.total)}`, 15, finalY + 25);
        
        // Calculate average monthly expense
        const avgMonthly = summary.total / 12;
        doc.text(`Average Monthly Expense: ${formatCurrency(avgMonthly)}`, 15, finalY + 35);
        
        // Calculate average food costs per month
        const totalFoodCosts = summary.categoryTotals.find(item => item.category === 'Food Costs')?.amount || 0;
        doc.text(`Average Monthly Food Costs: ${formatCurrency(totalFoodCosts / 12)}`, 15, finalY + 45);
      }
      
      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
        doc.text('Confidential - Yearly Expenses Report', 15, 285);
        if (isAdminMode) {
          doc.text('Admin Access Report', 105, 285, { align: 'center' });
        }
      }
      
      // Save the PDF
      doc.save(`Yearly_Expense_Summary_${year}${isAdminMode ? '_ADMIN' : ''}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(prev => ({ ...prev, yearly: false }));
    }
  };

  // Handle year/month change
  const handleMonthYearChange = (type, value) => {
    setDashboardData(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    if (!user) return;
    fetchMonthlySummary();
    fetchYearlySummary();
    fetchRecentExpenses();
  };

  // Handle logout (both regular and admin)
  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/');
    }
  };

  // Handle session refresh
  const handleSessionRefresh = () => {
    const shouldRefresh = window.confirm(
      'Your session seems to have issues. Would you like to try refreshing your session?'
    );
    
    if (shouldRefresh) {
      // Try to reload user data
      checkAuthentication();
      handleRefresh();
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Track and analyze your office expenses in BDT (Taka)</p>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="text-right">
            <div className="flex items-center justify-end">
              <User className="w-4 h-4 text-purple-500 mr-1" />
              <p className="text-sm text-gray-600">Logged in as</p>
              {isAdminMode && (
                <Shield className="w-4 h-4 text-purple-600 ml-1" />
              )}
            </div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-purple-600 capitalize">
              {user.role} 
              {isAdminMode && (
                <span className="ml-1 font-semibold">(Admin Mode)</span>
              )}
            </p>
          </div> 
        </div>
      </div>

      {/* Error Display */}
      {dashboardData.error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-rose-500 mr-2" />
              <p className="text-rose-700">{dashboardData.error}</p>
            </div>
            <button
              onClick={() => setDashboardData(prev => ({ ...prev, error: null }))}
              className="text-rose-500 hover:text-rose-700"
            >
              ×
            </button>
          </div>
          {dashboardData.error.includes('session') && (
            <button
              onClick={handleSessionRefresh}
              className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Try refreshing session
            </button>
          )}
        </div>
      )}

      {/* Admin Mode Indicator */}
      {isAdminMode && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl shadow-md">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-purple-600 mr-2" />
            <p className="text-purple-700 font-semibold">
              You are accessing the dashboard in Admin Mode. You can view all expense data.
            </p>
          </div>
        </div>
      )}

      {/* Monthly Summary Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Monthly Expense Summary</h2>
            </div>
            <button
              onClick={downloadMonthlyPDF}
              disabled={!pdfReady || downloadingPDF.monthly || dashboardData.isLoading || dashboardData.monthlySummary.categoryBreakdown.length === 0}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className={`w-4 h-4 mr-2 ${downloadingPDF.monthly ? 'animate-spin' : ''}`} />
              {downloadingPDF.monthly ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={dashboardData.selectedYear}
                onChange={(e) => handleMonthYearChange('selectedYear', e.target.value)}
                className="appearance-none bg-white border border-purple-200 rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                disabled={dashboardData.isLoading}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-purple-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={dashboardData.selectedMonth}
                onChange={(e) => handleMonthYearChange('selectedMonth', e.target.value)}
                className="appearance-none bg-white border border-purple-200 rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                disabled={dashboardData.isLoading}
              >
                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-purple-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {dashboardData.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : dashboardData.monthlySummary.categoryBreakdown.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-purple-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              No expense data found for {MONTHS[dashboardData.selectedMonth - 1]} {dashboardData.selectedYear}
            </p>
          </div>
        ) : (
          <>
            {/* Monthly Total Card */}
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    {MONTHS[dashboardData.selectedMonth - 1]} {dashboardData.selectedYear}
                  </p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {formatCurrency(dashboardData.monthlySummary.total)}
                  </h3>
                  <p className="text-purple-100 text-sm mt-2">Total Monthly Expenses (BDT)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <button
                    onClick={downloadMonthlyPDF}
                    disabled={!pdfReady || downloadingPDF.monthly || dashboardData.monthlySummary.categoryBreakdown.length === 0}
                    className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download PDF Report"
                  >
                    <FileDown className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {dashboardData.monthlySummary.categoryBreakdown.map((item, index) => (
                  <div key={`${item.category}-${index}`} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">{item.category}</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${calculatePercentage(item.amount)}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{calculatePercentage(item.amount)}% of total</span>
                      <span>BDT {formatAmount(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Monthly Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Employee Salaries', value: dashboardData.monthlySummary.employeeSalaries, color: 'from-purple-500 to-violet-500', icon: '👨‍💼' },
                { label: 'House Rent', value: dashboardData.monthlySummary.officeRent, color: 'from-violet-500 to-purple-500', icon: '🏢' },
                { label: 'Utilities', value: dashboardData.monthlySummary.utilities, color: 'from-fuchsia-500 to-pink-500', icon: '💡' },
                { label: 'Office Supplies', value: dashboardData.monthlySummary.officeSupplies, color: 'from-pink-500 to-rose-500', icon: '📦' },
                { label: 'Software Subscriptions', value: dashboardData.monthlySummary.softwareSubscriptions, color: 'from-rose-500 to-red-500', icon: '💻' },
                { label: 'Transport Expenses', value: dashboardData.monthlySummary.transportExpenses, color: 'from-purple-500 to-indigo-500', icon: '🚗' },
                { label: 'Extra Expenses', value: dashboardData.monthlySummary.extraExpenses, color: 'from-violet-500 to-purple-500', icon: '📝' },
                { label: 'Food Costs', value: dashboardData.monthlySummary.foodCosts, color: 'from-fuchsia-500 to-pink-500', icon: '🍽️' },
              ].map((item, index) => (
                <div key={`detail-${index}`} className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 bg-gradient-to-r ${item.color} rounded-lg mr-3`}>
                      <span className="text-white text-lg">{item.icon}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(item.value)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-400">
                      {item.value > 0 ? `${calculatePercentage(item.value)}% of total` : 'No data'}
                    </p>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Yearly Summary Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Yearly Expense Summary</h2>
            </div>
            <button
              onClick={downloadYearlyPDF}
              disabled={!pdfReady || downloadingPDF.yearly || dashboardData.isLoadingYearly || dashboardData.yearlySummary.monthlyBreakdown.length === 0}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className={`w-4 h-4 mr-2 ${downloadingPDF.yearly ? 'animate-spin' : ''}`} />
              {downloadingPDF.yearly ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
          <div className="relative">
            <select
              value={dashboardData.selectedYearForYearly}
              onChange={(e) => handleMonthYearChange('selectedYearForYearly', e.target.value)}
              className="appearance-none bg-white border border-purple-200 rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
              disabled={dashboardData.isLoadingYearly}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-purple-400 pointer-events-none" />
          </div>
        </div>

        {dashboardData.isLoadingYearly ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : dashboardData.yearlySummary.monthlyBreakdown.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-purple-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              No expense data found for year {dashboardData.selectedYearForYearly}
            </p>
          </div>
        ) : (
          <>
            {/* Yearly Total Card */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm font-medium">Year {dashboardData.selectedYearForYearly}</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {formatCurrency(dashboardData.yearlySummary.total)}
                  </h3>
                  <p className="text-violet-100 text-sm mt-2">Total Yearly Expenses (BDT)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <button
                    onClick={downloadYearlyPDF}
                    disabled={!pdfReady || downloadingPDF.yearly || dashboardData.yearlySummary.monthlyBreakdown.length === 0}
                    className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download PDF Report"
                  >
                    <FileDown className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {dashboardData.yearlySummary.monthlyBreakdown.map((month, index) => (
                  <div key={`month-${index}`} className="text-center group">
                    <div className="text-sm text-gray-500 mb-1 group-hover:text-purple-600 transition-colors">{month.monthName}</div>
                    <div className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {formatCurrency(month.total)}
                    </div>
                    <div className="mt-2">
                      <div 
                        className="h-2 bg-purple-100 rounded-full"
                        style={{ 
                          width: '100%',
                        }}
                      >
                        <div 
                          className="h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((month.total / Math.max(...dashboardData.yearlySummary.monthlyBreakdown.map(m => m.total || 1))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 group-hover:text-purple-600 transition-colors">
                      BDT {formatAmount(month.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yearly Category Totals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Category Totals (BDT)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.yearlySummary.categoryTotals.map((item, index) => (
                  <div key={`category-${index}`} className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{item.category}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        BDT {formatAmount(item.amount)} ({calculateYearlyPercentage(item.amount)}%)
                      </div>
                      <div className="text-lg">{item.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Expenses Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 rounded-lg">
              <FileText className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Expenses (Past 30 Days)</h2>
          </div>
          <div className="flex items-center">
            <Coffee className="w-6 h-6 text-purple-500 mr-2" />
            <Utensils className="w-5 h-5 text-pink-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          {dashboardData.recentExpenses.length > 0 ? (
            dashboardData.recentExpenses.map((expense) => (
              <div key={expense.id} className="p-4 border border-purple-100 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all shadow-sm hover:shadow-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      expense.category === 'Food Cost' ? 'bg-gradient-to-r from-pink-100 to-rose-100' : 
                      expense.category === 'Employee Salary' ? 'bg-gradient-to-r from-purple-100 to-violet-100' :
                      expense.category === 'House Rent' ? 'bg-gradient-to-r from-violet-100 to-purple-100' :
                      expense.category === 'Utility Bill' ? 'bg-gradient-to-r from-fuchsia-100 to-pink-100' :
                      'bg-gradient-to-r from-purple-50 to-violet-50'
                    }`}>
                      {expense.category === 'Food Cost' ? <Coffee className="w-5 h-5 text-pink-600" /> :
                       expense.category === 'Employee Salary' ? <User className="w-5 h-5 text-purple-600" /> :
                       expense.category === 'House Rent' ? <Home className="w-5 h-5 text-violet-600" /> :
                       expense.category === 'Utility Bill' ? <Zap className="w-5 h-5 text-fuchsia-600" /> :
                       <FileText className="w-5 h-5 text-purple-600" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-semibold text-gray-900">{expense.category}</h4>
                        {expense.category === 'Food Cost' && (
                          <span className="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full border border-pink-200">
                            🍽️ Food
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {expense.name} • <span className="text-purple-600">{expense.payment}</span>
                      </p>
                      <p className="text-sm text-purple-500">
                        {expense.date.toLocaleDateString('en-BD', { 
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900 block">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-sm text-purple-600 block">
                      BDT {formatAmount(expense.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Expenses</h3>
              <p className="text-gray-500">
                No expense data found in the past 30 days
              </p>
            </div>
          )}
        </div>
      </div> 
    </div>
  );
}