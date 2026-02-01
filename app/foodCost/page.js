'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from 'next/navigation';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${bgColor} animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {type === 'success' ? (
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <div>
          <p className={`font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatsCard = ({ title, value, icon, color, subtitle }) => (
  <div className={`p-6 rounded-2xl ${color} border border-opacity-20 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="text-3xl opacity-80">
        {icon}
      </div>
    </div>
  </div>
);

export default function page() {
  const router = useRouter();
  const formRef = useRef(null);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeToken, setActiveToken] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: "",
    cost: "",
    note: ""
  });

  // Data states
  const [foodCosts, setFoodCosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  
  // Filter states
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  
  // View state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'stats'
  
  // Chart data state
  const [monthlyData, setMonthlyData] = useState(null);

  const API_URL = useMemo(() => 
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`, 
  []);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Month short names for chart
  const monthShortNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Clear toast
  const clearToast = () => {
    setToast(null);
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Fetch data after authentication
  useEffect(() => {
    if (user && activeToken && !authLoading) {
      fetchFoodCosts();
      fetchStats();
      
      // Extract years and months from foodCosts data
      const extractedYears = [...new Set(foodCosts.map(cost => new Date(cost.date).getFullYear()))];
      setYears(extractedYears.sort((a, b) => b - a));
    }
  }, [user, activeToken, authLoading]);

  // Update months when year changes
  useEffect(() => {
    if (filterYear !== "all") {
      const yearCosts = foodCosts.filter(cost => 
        new Date(cost.date).getFullYear() === parseInt(filterYear)
      );
      const extractedMonths = [...new Set(yearCosts.map(cost => 
        new Date(cost.date).getMonth() + 1
      ))];
      setMonths(extractedMonths.sort((a, b) => a - b));
    } else {
      setMonths([]);
    }
  }, [filterYear, foodCosts]);

  // Fetch monthly data when year filter changes
  useEffect(() => {
    if (filterYear !== "all" && viewMode === 'stats') {
      fetchMonthlyData(filterYear);
    } else {
      setMonthlyData(null);
    }
  }, [filterYear, viewMode]);

  // **UPDATED: শুধুমাত্র adminToken বা moderatorToken থাকলেই access পাবে**
  const checkAuthentication = () => {
    try {
      // শুধুমাত্র এই দুইটি token চেক করব
      const adminToken = localStorage.getItem('adminToken');
      const moderatorToken = localStorage.getItem('moderatorToken');
      
      let activeToken = null;
      let userInfo = null;
      let userRole = '';
      
      // **শুধুমাত্র admin বা moderator token থাকলেই access**
      if (adminToken) {
        activeToken = adminToken;
        userRole = 'admin';
        // admin data খুঁজে বের করি
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
          try {
            userInfo = JSON.parse(adminData);
            userInfo.role = 'admin';
          } catch (e) {
            console.error("Error parsing admin data:", e);
          }
        }
      } 
      else if (moderatorToken) {
        activeToken = moderatorToken;
        userRole = 'moderator';
        // moderator data খুঁজে বের করি
        const moderatorData = localStorage.getItem('moderatorData');
        if (moderatorData) {
          try {
            userInfo = JSON.parse(moderatorData);
            userInfo.role = 'moderator';
          } catch (e) {
            console.error("Error parsing moderator data:", e);
          }
        }
      }
      
      // যদি admin বা moderator token না থাকে
      if (!activeToken) {
        console.log("Access denied: Only admin or moderator tokens are allowed");
        setMessage({ 
          type: 'error', 
          text: 'Access denied. This page is only for administrators and moderators.' 
        });
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }
      
      // যদি user info না থাকে, basic info create করি
      if (!userInfo) {
        userInfo = {
          name: userRole === 'admin' ? "Administrator" : "Moderator",
          role: userRole,
          email: "",
          phone: "",
          employeeId: "",
          isAuthenticated: true
        };
      }
      
      // Set user and token state
      setUser(userInfo);
      setActiveToken(activeToken);
      setAuthLoading(false);
      
    } catch (error) {
      console.error('Error in authentication check:', error);
      showToast('Authentication error. Please login again.', 'error');
      setTimeout(() => router.push('/'), 2000);
    }
  };

  // Function to get correct authorization header
  const getAuthHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    
    return headers;
  };

  // Fetch all food costs
  const fetchFoodCosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/food-costs`, {
        headers: getAuthHeaders(), 
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Session expired. Please login again.', 'error');
          setTimeout(() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('moderatorToken');
            router.push('/');
          }, 2000);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const sortedCosts = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        
        setFoodCosts(sortedCosts);
        
        // Update years list
        const extractedYears = [...new Set(sortedCosts.map(cost => 
          new Date(cost.date).getFullYear()
        ))];
        setYears(extractedYears.sort((a, b) => b - a));
        
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to load food costs' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // **NEW: Fetch statistics**
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(`${API_URL}/food-costs/stats`, {
        headers: getAuthHeaders(), 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Failed to load stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // **NEW: Fetch monthly data for specific year**
  const fetchMonthlyData = async (year) => {
    try {
      const monthlyPromises = [];
      
      // Fetch data for all months of the selected year
      for (let month = 1; month <= 12; month++) {
        monthlyPromises.push(
          fetch(`${API_URL}/food-costs/month/${year}/${month}`, {
            headers: getAuthHeaders(),
          })
        );
      }
      
      const responses = await Promise.all(monthlyPromises);
      const monthlyResults = await Promise.all(
        responses.map(response => response.json())
      );
      
      // Process monthly data
      const monthlyCosts = monthlyResults.map((result, index) => {
        if (result.success && result.data.length > 0) {
          const total = result.data.reduce((sum, cost) => sum + cost.cost, 0);
          return {
            month: index + 1,
            monthName: monthShortNames[index],
            total,
            count: result.data.length,
            average: total / result.data.length
          };
        } else {
          return {
            month: index + 1,
            monthName: monthShortNames[index],
            total: 0,
            count: 0,
            average: 0
          };
        }
      });
      
      setMonthlyData(monthlyCosts);
      
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(100, 65, 164); // Purple color
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FOOD COST REPORT', 105, 12, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('A2IT Solutions Ltd.', 105, 19, { align: 'center' });
    doc.text('Food Cost Management System', 105, 24, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Report Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Information', 14, 40);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const reportInfo = [
      ['Generated On:', new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })],
      ['Total Records:', filteredFoodCosts.length],
      ['Report Period:', filterYear === 'all' ? 'All Time' : `Year: ${filterYear}` + (filterMonth !== 'all' ? `, Month: ${monthNames[parseInt(filterMonth) - 1]}` : '')],
      ['Total Amount:', formatCurrency(calculateFilteredTotal())]
    ];
    
    autoTable(doc, {
      startY: 45,
      head: [],
      body: reportInfo,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: 125 }
      }
    });
    
    // Food Cost Details Table
    const detailsY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Food Cost Details', 14, detailsY);
    
    // Prepare table data
    const tableData = filteredFoodCosts.map((cost, index) => {
      const date = new Date(cost.date);
      return [
        index + 1,
        date.toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        formatCurrency(cost.cost),
        cost.note || '-',
        new Date(cost.createdAt).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
      ];
    });
    
    autoTable(doc, {
      startY: detailsY + 5,
      head: [['#', 'Date', 'Amount', 'Note', 'Created']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { 
        fillColor: [100, 65, 164], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold' 
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 90 },
        4: { cellWidth: 30 }
      }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer generated report.', 105, finalY, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text('Powered by A2IT HRMS', 105, finalY + 5, { align: 'center' });
    
    // Save the PDF
    const fileName = `Food_Cost_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    showToast(`PDF downloaded: ${fileName}`);
  };

  // Function to check for duplicate day entries
  const checkForDuplicateDay = async (selectedDate, currentEditingId = null) => {
    if (!selectedDate) return false;
    
    try {
      const response = await fetch(`${API_URL}/food-costs/check-date?date=${selectedDate}`, {
        headers: getAuthHeaders(), 
      });
      
      const data = await response.json();
      
      if (data.success && data.exists) {
        // If editing, only return true if it's a different record
        if (currentEditingId && data.data._id === currentEditingId) {
          return false; // Same record, not a duplicate
        }
        return data.data; // Return existing record data
      }
      
      return false;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  };

  // **UPDATED: Fetch single food cost for editing - AUTO SCROLL TO FORM**
  const fetchFoodCostForEdit = async (id) => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch(`${API_URL}/food-costs/${id}`, {
        headers: getAuthHeaders(), 
      });
        
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const cost = data.data;
        setFormData({
          date: cost.date.split('T')[0],
          cost: cost.cost.toString(),
          note: cost.note || ""
        });
        setEditingId(id);
        
        // Auto scroll to form section
        setTimeout(() => {
          if (formRef.current) {
            // Smooth scroll to form
            formRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
            
            // Highlight the form for better UX
            formRef.current.style.transition = 'all 0.3s';
            formRef.current.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.3)';
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
              if (formRef.current) {
                formRef.current.style.boxShadow = '';
              }
            }, 2000);
          }
        }, 100);
        
      } else {
        showToast(data.message || 'Failed to load food cost data', 'error');
      }
    } catch (error) {
      showToast(`Failed to load food cost record: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear duplicate warning when date changes
    if (name === 'date') {
      if (message.text.includes('already exists') || message.text.includes('duplicate')) {
        setMessage({ type: '', text: '' });
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  // Check for duplicate when date is selected
  const handleDateChange = async (e) => {
    const { value } = e.target;
    
    setFormData({ ...formData, date: value });
    
    // Check for duplicate after a short delay
    if (value && !editingId) {
      setTimeout(async () => {
        const duplicate = await checkForDuplicateDay(value);
        if (duplicate) {
          const dateStr = new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          setMessage({ 
            type: 'error', 
            text: `⚠️ Food cost for ${dateStr} already exists. Please edit the existing record instead.` 
          });
        }
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!formData.date) {
        throw new Error("Please select a date");
      }

      if (!formData.cost || parseFloat(formData.cost) <= 0) {
        throw new Error("Please enter a valid cost amount");
      }

      // Check for duplicate day
      const duplicate = await checkForDuplicateDay(formData.date, editingId);
      
      if (duplicate) {
        const dateStr = new Date(formData.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        if (editingId) {
          throw new Error(`Cannot update: A food cost record for ${dateStr} already exists. Please keep the original date or choose a different one.`);
        } else {
          throw new Error(`A food cost record for ${dateStr} already exists. Please edit the existing record instead.`);
        }
      }

      let url, method;
      
      if (editingId) {
        // ✅ Food cost এর জন্য সঠিক endpoint ব্যবহার করুন
        url = `${API_URL}/update-food-costs/${editingId}`;
        method = "PUT";
      } else {
        url = `${API_URL}/add-food-costs`;
        method = "POST";
      }
      
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(), 
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        const actionText = editingId ? "updated" : "saved";
        showToast(`Food cost ${actionText} successfully!`);
        
        // Reset form
        setFormData({
          date: "",
          cost: "",
          note: ""
        });
        
        setEditingId(null);
        
        // Refresh data
        await fetchFoodCosts();
        await fetchStats();
        
        // Clear any existing messages
        setMessage({ type: '', text: '' });
        
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || data.error || 'Operation failed' 
        });
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({ 
        type: 'error', 
        text: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setFormData({
      date: "",
      cost: "",
      note: ""
    });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  // Delete food cost record
  const handleDelete = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this food cost record?");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/delete-food-costs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(), 
      });

      const data = await response.json();

      if (data.success) {
        showToast("Food cost record deleted successfully!");
        if (editingId === id) {
          cancelEdit();
        }
        fetchFoodCosts();
        fetchStats();
      } else {
        showToast(data.message || data.error, 'error');
      }
    } catch (error) {
      showToast(`Failed to delete food cost record: ${error.message}`, 'error');
    }
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all");
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterYear("all");
    setFilterMonth("all");
  };

  // Filter food costs based on selected year and month and sort by date descending
  const filteredFoodCosts = useMemo(() => {
    const filtered = foodCosts.filter(cost => {
      const date = new Date(cost.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString();

      if (filterYear !== "all" && year !== filterYear) {
        return false;
      }

      if (filterMonth !== "all" && month !== filterMonth) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [foodCosts, filterYear, filterMonth]);

  // Calculate total for filtered food costs
  const calculateFilteredTotal = () => {
    return filteredFoodCosts.reduce((total, cost) => total + cost.cost, 0);
  };

  // Calculate average daily cost
  const calculateAverageDailyCost = () => {
    if (filteredFoodCosts.length === 0) return 0;
    return calculateFilteredTotal() / filteredFoodCosts.length;
  };

  // Format currency in Bangladeshi Taka (BDT)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format currency without symbol
  const formatCurrencyNumber = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get existing day for warning
  const getExistingDayWarning = () => {
    if (foodCosts.length === 0) return null;
    
    const selectedDate = new Date(formData.date);
    if (isNaN(selectedDate.getTime())) return null;
    
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    const existingDay = foodCosts.find(cost => {
      const costDate = new Date(cost.date);
      const costDateStr = costDate.toISOString().split('T')[0];
      return costDateStr === selectedDateStr;
    });
    
    return existingDay ? existingDay : null;
  };

  // Check if date has duplicate warning for new entries
  const existingDayWarning = !editingId ? getExistingDayWarning() : null;

  // Check if editing date causes duplicate
  const editingDuplicateWarning = editingId ? (() => {
    if (!formData.date) return null;
    
    const selectedDate = new Date(formData.date);
    if (isNaN(selectedDate.getTime())) return null;
    
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    // Find the original record being edited
    const originalRecord = foodCosts.find(cost => cost._id === editingId);
    if (!originalRecord) return null;
    
    const originalDate = new Date(originalRecord.date);
    const originalDateStr = originalDate.toISOString().split('T')[0];
    
    // Check if date has changed
    const dateChanged = selectedDateStr !== originalDateStr;
    
    if (!dateChanged) return null;
    
    // Check for duplicates excluding current record
    const isDuplicate = foodCosts.some(cost => {
      if (cost._id === editingId) return false;
      
      const costDate = new Date(cost.date);
      const costDateStr = costDate.toISOString().split('T')[0];
      return costDateStr === selectedDateStr;
    });
    
    return isDuplicate ? {
      dateStr: selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } : null;
  })() : null;

  // Monthly Chart Component
  const MonthlyChart = () => {
    if (!monthlyData) return null;
    
    const hasData = monthlyData.some(month => month.total > 0);
    if (!hasData) {
      return (
        <div className="p-8 text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500">No food cost records found for {filterYear}</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Monthly Distribution - {filterYear}</h3>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
            Total: {formatCurrency(monthlyData.reduce((sum, month) => sum + month.total, 0))}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthlyData.map((month) => (
            <div 
              key={month.month} 
              className={`p-4 rounded-xl border ${
                month.total > 0 
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-800">{month.monthName}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-opacity-20 bg-purple-500 text-purple-700">
                  {month.count} days
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatCurrency(month.total)}
              </div>
              {month.count > 0 && (
                <div className="text-xs text-gray-500">
                  Avg: {formatCurrency(month.average)}/day
                </div>
              )}
              {month.total > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ 
                        width: `${(month.total / monthlyData.reduce((max, m) => Math.max(max, m.total), 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Year Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-blue-600">Total Months</p>
              <p className="text-lg font-bold text-blue-700">
                {monthlyData.filter(m => m.total > 0).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Total Days</p>
              <p className="text-lg font-bold text-blue-700">
                {monthlyData.reduce((sum, month) => sum + month.count, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Year Total</p>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.total, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Monthly Avg</p>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(
                  monthlyData.filter(m => m.total > 0).length > 0 
                    ? monthlyData.reduce((sum, month) => sum + month.total, 0) / monthlyData.filter(m => m.total > 0).length 
                    : 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Statistics View
  const StatisticsView = () => (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Records"
          value={stats?.totalRecords || foodCosts.length}
          icon="📊"
          color="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
          subtitle="All food cost entries"
        />
        
        <StatsCard
          title="Total Amount"
          value={formatCurrency(stats?.totalAmount || calculateFilteredTotal())}
          icon="💰"
          color="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
          subtitle="Cumulative food cost"
        />
        
        <StatsCard
          title="Average Daily"
          value={formatCurrency(stats?.averageDaily || calculateAverageDailyCost())}
          icon="📈"
          color="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
          subtitle="Per day average"
        />
        
        <StatsCard
          title="Active Months"
          value={stats?.activeMonths || years.length}
          icon="📅"
          color="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
          subtitle="Months with records"
        />
      </div>
      
      {/* Monthly Analysis Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Monthly Analysis</h3>
            <p className="text-sm text-gray-500">Breakdown of food costs by month</p>
          </div>
          <div className="mt-4 md:mt-0">
            <select
              value={filterYear}
              onChange={handleYearChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {filterYear === "all" ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">Select a Year</h4>
            <p className="text-gray-500">Please select a specific year to view monthly analysis</p>
          </div>
        ) : statsLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading monthly data...</p>
            </div>
          </div>
        ) : (
          <MonthlyChart />
        )}
      </div>
      
      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Yearly Comparison</h4>
            {stats.yearlyComparison && stats.yearlyComparison.length > 0 ? (
              <div className="space-y-3">
                {stats.yearlyComparison.map((yearData, index) => (
                  <div key={yearData.year} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{yearData.year}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800">
                        {formatCurrency(yearData.total)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {yearData.count} days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No yearly data available</p>
            )}
          </div>
          
          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
            <h4 className="text-sm font-medium text-blue-700 mb-3">Record Details</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Earliest Record</span>
                <span className="font-bold text-blue-800">
                  {stats.earliestDate ? formatDate(stats.earliestDate) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Latest Record</span>
                <span className="font-bold text-blue-800">
                  {stats.latestDate ? formatDate(stats.latestDate) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Total Days Tracked</span>
                <span className="font-bold text-blue-800">
                  {stats.totalDays || foodCosts.length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <h4 className="text-sm font-medium text-green-700 mb-3">Cost Analysis</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Highest Daily Cost</span>
                <span className="font-bold text-green-800">
                  {stats.highestCost ? formatCurrency(stats.highestCost.amount) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Lowest Daily Cost</span>
                <span className="font-bold text-green-800">
                  {stats.lowestCost ? formatCurrency(stats.lowestCost.amount) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Most Active Month</span>
                <span className="font-bold text-green-800">
                  {stats.mostActiveMonth || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4 md:p-6">
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Food Cost Management
          </h1>
          <p className="text-center text-purple-600 font-medium">
            Track and manage daily food expenses
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
            message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
            'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
          }`}>
            <div className="flex items-center">
              <span className="mr-3">
                {message.type === 'error' ? '❌' :
                 message.type === 'success' ? '✅' : 'ℹ️'}
              </span>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* User Info Banner */}
        <div className="mb-8 p-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Logged in as: <span className="font-semibold text-white">{user.name}</span></p>
              <p className="text-xs text-purple-200">Role: <span className="font-medium capitalize text-white">{user.role}</span></p>
            </div>
            <div className="mt-3 md:mt-0 flex items-center space-x-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                Food Cost Management
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'stats' 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Statistics
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1">
          {/* Left: Food Cost Form with ref for auto-scroll */}
          <div 
            ref={formRef}
            className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 mb-4 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Edit Food Cost Record' : 'Add New Food Cost'}
              </h2>
              {editingId && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium rounded-full animate-pulse">
                    Editing Mode
                  </span>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-lg font-medium hover:from-gray-300 hover:to-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    (existingDayWarning && !editingId) || (editingDuplicateWarning && editingId)
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  required
                  disabled={loading}
                  max={getCurrentDate()}
                />
                
                {/* Warning for new entries */}
                {existingDayWarning && !editingId && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <strong>Warning:</strong> A food cost record for {new Date(existingDayWarning.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} already exists. 
                        <span className="block mt-1">Please edit the existing record instead.</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Warning for editing duplicates */}
                {editingDuplicateWarning && editingId && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <strong>Cannot Update:</strong> Changing date to {editingDuplicateWarning.dateStr} would create a duplicate. 
                        <span className="block mt-1">Please keep the original date or choose a different one.</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-purple-600 font-medium">Note:</span> Only one food cost record per day is allowed
                </p>
              </div>

              {/* Cost Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Amount (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ৳
                  </span>
                  <input
                    type="number"
                    name="cost"
                    placeholder="Enter cost amount in BDT"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    BDT
                  </span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  name="note"
                  placeholder="Add details about the food expense (e.g., breakfast, lunch, dinner, items purchased)"
                  value={formData.note}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || 
                    (existingDayWarning && !editingId) || 
                    (editingDuplicateWarning && editingId)
                  }
                  className={`flex-1 py-3 rounded-xl font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    editingId ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' : 
                    (existingDayWarning && !editingId) || (editingDuplicateWarning && editingId) 
                      ? 'bg-gray-400 cursor-not-allowed' : 
                    'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  } shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingId ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    (existingDayWarning && !editingId) 
                      ? 'Duplicate Day - Edit Existing' 
                      : (editingDuplicateWarning && editingId)
                        ? 'Duplicate - Cannot Update'
                        : editingId 
                          ? 'Update Food Cost Record' 
                          : 'Save Food Cost to Database'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Food Cost Records or Statistics */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
            {viewMode === 'table' ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {filterYear !== "all" || filterMonth !== "all" ? 'Filtered Food Costs' : 'All Food Costs'}
                      <span className="text-lg font-normal text-purple-600 ml-2">
                        ({filteredFoodCosts.length} records)
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Total Amount: <span className="font-bold text-purple-600">{formatCurrency(calculateFilteredTotal())}</span>
                      <span className="ml-4">Average Daily: <span className="font-bold text-green-600">{formatCurrency(calculateAverageDailyCost())}</span></span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    {/* PDF Download Button */}
                    {filteredFoodCosts.length > 0 && (
                      <button
                        onClick={generatePDF}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all flex items-center shadow-lg hover:shadow-xl"
                        title="Download PDF Report"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        PDF Report
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        fetchFoodCosts();
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 text-sm font-medium shadow-sm"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Sort Indicator */}
                <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
                  </svg>
                  <p className="text-sm text-purple-800">
                    <strong>Sorted by:</strong> Date (Newest to Oldest)
                  </p>
                </div>

                {/* Filter Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-gray-50 rounded-xl border border-purple-100">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex flex-wrap gap-4">
                      {/* Year Filter */}
                      <div>
                        <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <select
                          id="yearFilter"
                          value={filterYear}
                          onChange={handleYearChange}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                        >
                          <option value="all">All Years</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      {/* Month Filter */}
                      <div>
                        <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700 mb-1">
                          Month
                        </label>
                        <select
                          id="monthFilter"
                          value={filterMonth}
                          onChange={handleMonthChange}
                          disabled={filterYear === "all"}
                          className={`w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                            filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          }`}
                        >
                          <option value="all">All Months</option>
                          {months.map(month => (
                            <option key={month} value={month}>
                              {monthNames[month - 1]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Active Filters Display */}
                      {(filterYear !== "all" || filterMonth !== "all") && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200">
                            <span className="text-sm text-purple-700">
                              {filterYear !== "all" && `Year: ${filterYear}`}
                              {filterYear !== "all" && filterMonth !== "all" && ", "}
                              {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                            </span>
                            <button
                              onClick={() => resetFilters()}
                              className="text-purple-500 hover:text-purple-700 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reset Filters Button */}
                      {(filterYear !== "all" || filterMonth !== "all") && (
                        <div className="flex items-end">
                          <button
                            onClick={resetFilters}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors shadow-sm"
                          >
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Results Count */}
                    <div className="md:ml-auto text-right">
                      <span className="text-sm text-gray-600">
                        Showing {filteredFoodCosts.length} of {foodCosts.length} record(s)
                      </span>
                      {filterYear !== "all" || filterMonth !== "all" ? (
                        <div className="text-sm font-medium text-green-600 mt-1">
                          Filtered Total: {formatCurrency(calculateFilteredTotal())}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Duplicate Warning Notice */}
                {existingDayWarning && !editingId && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-800">
                        <strong>Duplicate Day Detected:</strong> You cannot add another food cost record for {new Date(existingDayWarning.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}. 
                        Please edit the existing record below.
                      </p>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600">Loading food cost records...</p>
                    </div>
                  </div>
                ) : filteredFoodCosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        {filterYear === "all" && filterMonth === "all" 
                          ? "No food cost records yet"
                          : "No food cost records found"
                        }
                      </h3>
                      <p className="text-gray-500">
                        {filterYear === "all" && filterMonth === "all" 
                          ? "Add your first food cost record using the form!"
                          : "Try changing your filter criteria."
                        }
                      </p>
                      {(filterYear !== "all" || filterMonth !== "all") && (
                        <button
                          onClick={resetFilters}
                          className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-purple-50 to-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                              <div className="text-xs font-normal text-purple-400 mt-1">Month-Year</div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Note
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredFoodCosts.map((cost, index) => {
                            const costDate = new Date(cost.date);
                            const monthYear = `${monthNames[costDate.getMonth()]} ${costDate.getFullYear()}`;
                            
                            return (
                              <tr key={cost._id} className={`hover:bg-purple-50 transition-colors ${editingId === cost._id ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">
                                    {formatDate(cost.date)}
                                  </div>
                                  <div className="text-xs text-purple-600 font-medium">
                                    {monthYear}
                                  </div>
                                  {index === 0 && (
                                    <div className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium rounded">
                                      Newest
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-bold text-purple-700">
                                    {formatCurrency(cost.cost)}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-600 max-w-xs truncate" title={cost.note}>
                                    {cost.note || <span className="text-gray-400 italic">No note</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => fetchFoodCostForEdit(cost._id)}
                                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors border border-purple-200 hover:border-purple-300 hover:shadow-md"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(cost._id)}
                                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors border border-red-200 hover:border-red-300 hover:shadow-md"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <h4 className="text-sm font-medium text-purple-900 mb-2">
                          {filterYear !== "all" || filterMonth !== "all" ? "Filtered Total" : "Total Amount"}
                        </h4>
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {formatCurrency(calculateFilteredTotal())}
                        </p>
                        <div className="text-xs text-purple-500 mt-1">
                          {filteredFoodCosts.length} record(s)
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                          Average Daily Cost
                        </h4>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {formatCurrency(calculateAverageDailyCost())}
                        </p>
                        <div className="text-xs text-blue-500 mt-1">
                          Based on {filteredFoodCosts.length} day(s)
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <StatisticsView />
            )}
          </div>
        </div>
      </div>

      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}