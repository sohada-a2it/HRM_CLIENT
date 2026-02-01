'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from 'next/navigation';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Toast Component - Purple Theme
const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-purple-50 border-purple-200' : 
                  type === 'error' ? 'bg-red-50 border-red-200' : 
                  'bg-blue-50 border-blue-200';
  const textColor = type === 'success' ? 'text-purple-700' : 
                    type === 'error' ? 'text-red-700' : 
                    'text-blue-700';
  const iconColor = type === 'success' ? 'text-purple-600' : 
                    type === 'error' ? 'text-red-600' : 
                    'text-blue-600';

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${bgColor} animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {type === 'success' ? (
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : type === 'error' ? (
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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

export default function page() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeToken, setActiveToken] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState(null);
  
  // Form state
  const [subscriptions, setSubscriptions] = useState([
    {
      id: crypto.randomUUID(),
      softwareName: "",
      amount: "",
      date: "",
      paymentMethod: "",
      note: "",
      durationNumber: "",
      durationUnit: "month",
    },
  ]);

  const [storedSubscriptions, setStoredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    softwareName: "",
    amount: "",
    date: "",
    paymentMethod: "",
    note: "",
    durationNumber: "",
    durationUnit: "month"
  });

  // Filter states
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  // Ref for edit form
  const editFormRef = useRef(null);

  // API URL - environment variable ব্যবহার করুন
  const API_URL = useMemo(() => 
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`, 
  []);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Duration unit options
  const durationUnits = [
    { value: "day", label: "Day(s)" },
    { value: "week", label: "Week(s)" },
    { value: "month", label: "Month(s)" },
    { value: "year", label: "Year(s)" }
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

  // Initialize data after authentication
  useEffect(() => {
    if (user && activeToken && !authLoading) {
      fetchStoredSubscriptions();
    }
  }, [user, activeToken, authLoading]);

  // Update years and months when subscriptions change
  useEffect(() => {
    if (storedSubscriptions.length > 0) {
      const uniqueYears = Array.from(
        new Set(
          storedSubscriptions.map(sub => {
            const date = new Date(sub.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setYears(uniqueYears);

      // If a year is selected, update available months
      if (selectedYear !== "all") {
        const yearSubscriptions = storedSubscriptions.filter(sub => {
          const date = new Date(sub.date);
          return date.getFullYear().toString() === selectedYear;
        });

        const uniqueMonths = Array.from(
          new Set(
            yearSubscriptions.map(sub => {
              const date = new Date(sub.date);
              return date.getMonth() + 1;
            })
          )
        ).sort((a, b) => a - b);

        setMonths(uniqueMonths);
      } else {
        setMonths([]);
      }
    } else {
      setYears([]);
      setMonths([]);
    }
  }, [storedSubscriptions, selectedYear]);

  // Scroll to edit form when editingId changes
  useEffect(() => {
    if (editingId && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [editingId]);

  // **UPDATED: শুধুমাত্র adminToken থাকলেই access পাবে**
  const checkAuthentication = () => {
    try {
      // শুধুমাত্র adminToken চেক করব (moderatorToken নয়)
      const adminToken = localStorage.getItem('adminToken');
      
      let activeToken = null;
      let userInfo = null;
      let userRole = '';
      
      // **শুধুমাত্র admin token থাকলেই access**
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
      
      // যদি admin token না থাকে
      if (!activeToken) {
        console.log("Access denied: Only admin tokens are allowed for software subscriptions");
        showToast('Access denied. Only administrators can manage software subscriptions.', 'error');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }
      
      // যদি user info না থাকে, basic info create করি
      if (!userInfo) {
        userInfo = {
          name: "Administrator",
          role: 'admin',
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

  const fetchStoredSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/software-subscriptions`, {
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
        // Sort subscriptions by date in descending order (newest first)
        const sortedSubscriptions = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setStoredSubscriptions(sortedSubscriptions);
      } else {
        showToast(data.message || 'Failed to load subscriptions', 'error');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      showToast('Network error. Please check if server is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter subscriptions based on selected year and month
  const filteredSubscriptions = useMemo(() => {
    return storedSubscriptions.filter(sub => {
      const date = new Date(sub.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString();

      // Apply year filter
      if (selectedYear !== "all" && year !== selectedYear) {
        return false;
      }

      // Apply month filter
      if (selectedMonth !== "all" && month !== selectedMonth) {
        return false;
      }

      return true;
    });
  }, [storedSubscriptions, selectedYear, selectedMonth]);

  // Generate PDF function
  const generatePDF = () => {
    if (filteredSubscriptions.length === 0) {
      showToast("No subscriptions to download", 'error');
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Title - Purple theme for PDF
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(20);
      doc.setTextColor(128, 90, 156); // Purple color
      doc.setFont("helvetica", "bold");
      doc.text("Software Subscriptions Report", pageWidth / 2, 20, { align: "center" });
      
      // Company/Report Info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      // Filter information
      let filterInfo = "All Subscriptions";
      if (selectedYear !== "all" || selectedMonth !== "all") {
        filterInfo = `Filter: ${selectedYear !== "all" ? `Year: ${selectedYear}` : ""} ${selectedMonth !== "all" ? `Month: ${monthNames[parseInt(selectedMonth) - 1]}` : ""}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredSubscriptions.length}`, 14, 42);
      
      // Add user info
      if (user) {
        doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
      }
      
      // Prepare table data
      const tableData = filteredSubscriptions.map(subscription => [
        subscription.softwareName,
        new Date(subscription.date).toLocaleDateString(),
        `BDT ${subscription.amount.toFixed(2)}`,
        subscription.paymentMethod,
        subscription.durationNumber && subscription.durationUnit 
          ? `${subscription.durationNumber} ${subscription.durationUnit}${subscription.durationNumber > 1 ? 's' : ''}`
          : "-",
        subscription.note || "-"
      ]);
      
      // Add table using autoTable with purple theme
      autoTable(doc, {
        startY: user ? 55 : 50,
        head: [['Software Name', 'Date', 'Amount (BDT)', 'Payment Method', 'Duration', 'Note']],
        body: tableData,
        headStyles: {
          fillColor: [128, 90, 156], // Purple color
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 35 }
        },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(128, 90, 156); // Purple color
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }
      });
      
      // Calculate totals
      const totalAmount = calculateTotal();
      const lastY = doc.lastAutoTable.finalY + 10;
      
      // Add summary section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(128, 90, 156); // Purple color
      doc.text("SUMMARY", 14, lastY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Subscriptions: ${filteredSubscriptions.length}`, 14, lastY + 8);
      doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
      
      // Add generated date at bottom
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Report generated on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: "center" }
      );
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const isFilterActive = selectedYear !== "all" || selectedMonth !== "all";
      const filterSuffix = isFilterActive ? '_filtered' : '';
      const filename = `software_subscriptions_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success toast
      showToast(`PDF downloaded successfully: ${filename}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF. Please try again.', 'error');
    }
  };

  const updateField = (id, field, value) => {
    setSubscriptions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addSubscription = () => {
    setSubscriptions(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        softwareName: "",
        amount: "",
        date: "",
        paymentMethod: "",
        note: "",
        durationNumber: "",
        durationUnit: "month",
      },
    ]);
  };

  const removeSubscription = (id) => {
    if (subscriptions.length === 1) return;
    setSubscriptions(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Filter out empty rows
    const validSubscriptions = subscriptions.filter(
      sub => sub.softwareName.trim() && sub.amount && sub.date
    );

    if (validSubscriptions.length === 0) {
      showToast("Please add at least one subscription", 'error');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add-software-subscriptions`, {
        method: 'POST',
        headers: getAuthHeaders(), 
        body: JSON.stringify(validSubscriptions),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Access denied. Admin only.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast(`Successfully saved ${data.data.length} subscription(s)`);
        // Reset form
        setSubscriptions([{
          id: crypto.randomUUID(),
          softwareName: "",
          amount: "",
          date: "",
          paymentMethod: "",
          note: "",
          durationNumber: "",
          durationUnit: "month",
        }]);
        // Refresh stored subscriptions
        fetchStoredSubscriptions();
        
        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          data.warnings.forEach(warning => {
            showToast(warning, 'error');
          });
        }
      } else {
        showToast(data.message || 'Failed to save subscriptions', 'error');
      }
    } catch (error) {
      console.error('Error saving subscriptions:', error);
      showToast('Network error. Please check if server is running.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubscription = (subscription) => {
    setEditingId(subscription._id);
    setEditForm({
      softwareName: subscription.softwareName,
      date: new Date(subscription.date).toISOString().split('T')[0],
      amount: subscription.amount.toString(),
      paymentMethod: subscription.paymentMethod,
      note: subscription.note || "",
      durationNumber: subscription.durationNumber?.toString() || "",
      durationUnit: subscription.durationUnit || "month"
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      softwareName: "",
      amount: "",
      date: "",
      paymentMethod: "",
      note: "",
      durationNumber: "",
      durationUnit: "month"
    });
  };

  const handleUpdateSubscription = async () => {
    if (!editingId) return;

    // Validation
    if (!editForm.softwareName.trim() || !editForm.amount || !editForm.date) {
      showToast("Please fill all required fields", 'error');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/update-software-subscriptions/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(), 
        body: JSON.stringify({
          softwareName: editForm.softwareName,
          date: editForm.date,
          amount: parseFloat(editForm.amount),
          paymentMethod: editForm.paymentMethod,
          note: editForm.note,
          durationNumber: editForm.durationNumber ? parseInt(editForm.durationNumber) : null,
          durationUnit: editForm.durationUnit
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Access denied. Admin only.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('Subscription updated successfully');
        // Refresh the list
        fetchStoredSubscriptions();
        // Reset edit mode
        setEditingId(null);
        setEditForm({
          softwareName: "",
          amount: "",
          date: "",
          paymentMethod: "",
          note: "",
          durationNumber: "",
          durationUnit: "month"
        });
      } else {
        showToast(data.message || 'Failed to update subscription', 'error');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      showToast('Failed to update subscription', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubscription = async (id) => {
    // Show confirmation dialog like office rent page
    const isConfirmed = window.confirm('Are you sure you want to delete this subscription?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/delete-software-subscriptions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), 
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Access denied. Admin only.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('Subscription deleted successfully');
        // Refresh the list
        fetchStoredSubscriptions();
        // If we're deleting the currently edited subscription, cancel edit mode
        if (editingId === id) {
          handleCancelEdit();
        }
      } else {
        showToast(data.message || 'Failed to delete subscription', 'error');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      showToast('Failed to delete subscription', 'error');
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format duration for display
  const formatDuration = (durationNumber, durationUnit) => {
    if (!durationNumber || !durationUnit) return "-";
    
    const unitLabel = durationUnit === "day" ? "day" :
                     durationUnit === "week" ? "week" :
                     durationUnit === "month" ? "month" : "year";
    
    const plural = durationNumber > 1 ? "s" : "";
    return `${durationNumber} ${unitLabel}${plural}`;
  };

  // Format currency in Bangladeshi Taka (৳)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate total for filtered subscriptions
  const calculateTotal = () => {
    return filteredSubscriptions.reduce((total, sub) => total + sub.amount, 0);
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedMonth("all");
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
  };

  // Calculate form total
  const calculateFormTotal = () => {
    return subscriptions.reduce((total, subscription) => {
      const amount = parseFloat(subscription.amount) || 0;
      return total + amount;
    }, 0);
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin, if not show access denied
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-purple-100">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only administrators can access this section.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-6">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                Software Subscriptions Management
              </h1>
              <p className="text-gray-600 mt-2">Admin-only: Track and manage software subscription expenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-700">Logged in as: <span className="font-semibold text-purple-700">{user.name}</span></p>
                <p className="text-xs text-gray-500">Role: <span className="font-medium capitalize text-purple-600">{user.role}</span></p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-md transition-all shadow-sm hover:shadow"
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Admin Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-full text-sm font-medium flex items-center shadow-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  ADMIN ONLY SECTION
                </div>
                <div className="text-sm text-purple-700">
                  Only administrators can manage software subscriptions
                </div>
              </div>
              <div className="text-sm text-purple-600 font-medium">
                <span className="bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1 rounded-full">Access Level: {user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-purple-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Add New Subscriptions</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Row */}
            <div className="hidden md:grid md:grid-cols-13 gap-3 text-sm font-semibold text-gray-600 px-1 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg">
              <div className="col-span-3 text-purple-700">Software Name</div>
              <div className="col-span-2 text-purple-700">Amount (৳)</div>
              <div className="col-span-2 text-purple-700">Date</div>
              <div className="col-span-2 text-purple-700">Pay Method</div>
              <div className="col-span-2 text-purple-700">Duration</div>
              <div className="col-span-1 text-purple-700">Note</div>
              <div className="col-span-1 text-center text-purple-700">Action</div>
            </div>

            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 md:grid-cols-13 gap-3 md:gap-3 items-center p-4 md:p-0 md:border-0 border border-purple-100 rounded-lg mb-3 md:mb-0 bg-white hover:bg-purple-50 transition-colors duration-200"
              >
                {/* Mobile View - Vertical Layout */}
                <div className="md:hidden space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Software Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Adobe, Figma, Slack"
                        value={sub.softwareName}
                        onChange={(e) =>
                          updateField(sub.id, "softwareName", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Amount (৳) *
                      </label>
                      <input
                        type="number"
                        placeholder="Amount in ৳"
                        value={sub.amount}
                        onChange={(e) =>
                          updateField(sub.id, "amount", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={sub.date}
                        max={getTodayDate()}
                        onChange={(e) =>
                          updateField(sub.id, "date", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={sub.paymentMethod}
                        onChange={(e) =>
                          updateField(sub.id, "paymentMethod", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Duration Fields - Mobile */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration Number
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 1"
                        value={sub.durationNumber}
                        onChange={(e) =>
                          updateField(sub.id, "durationNumber", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="1"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration Unit
                      </label>
                      <select
                        value={sub.durationUnit}
                        onChange={(e) =>
                          updateField(sub.id, "durationUnit", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {durationUnits.map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Optional note"
                      value={sub.note}
                      onChange={(e) =>
                        updateField(sub.id, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  {subscriptions.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeSubscription(sub.id)}
                        className="w-full py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors text-sm border border-red-100"
                      >
                        Remove This Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View - Grid Layout */}
                {/* Software Name */}
                <div className="hidden md:block col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Adobe, Figma, Slack"
                    value={sub.softwareName}
                    onChange={(e) =>
                      updateField(sub.id, "softwareName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="number"
                    placeholder="Amount in ৳"
                    value={sub.amount}
                    onChange={(e) =>
                      updateField(sub.id, "amount", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Date */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="date"
                    value={sub.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateField(sub.id, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="hidden md:block col-span-2">
                  <select
                    value={sub.paymentMethod}
                    onChange={(e) =>
                      updateField(sub.id, "paymentMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {/* Duration Fields - Desktop */}
                <div className="hidden md:block col-span-2">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Number"
                        value={sub.durationNumber}
                        onChange={(e) =>
                          updateField(sub.id, "durationNumber", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        min="1"
                        step="1"
                      />
                    </div>
                    <div className="flex-1">
                      <select
                        value={sub.durationUnit}
                        onChange={(e) =>
                          updateField(sub.id, "durationUnit", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                      >
                        {durationUnits.map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Note (Optional) */}
                <div className="hidden md:block col-span-1">
                  <input
                    type="text"
                    placeholder="Note"
                    value={sub.note}
                    onChange={(e) =>
                      updateField(sub.id, "note", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>

                {/* Remove - Desktop */}
                <div className="hidden md:block col-span-1">
                  {subscriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubscription(sub.id)}
                      className="w-full py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors border border-red-100"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Form Total */}
            <div className="flex justify-end mb-3">
              <div className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Form Total: {formatCurrency(calculateFormTotal())}
              </div>
            </div>

            {/* Add More */}
            <button
              type="button"
              onClick={addSubscription}
              className="hidden md:block w-full border-2 border-dashed border-purple-300 text-purple-600 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors font-medium"
            >
              + Add More Subscriptions
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 md:py-3 rounded-lg transition-all text-sm md:text-base font-medium ${
                saving
                  ? 'bg-gradient-to-r from-purple-400 to-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
              } text-white`}
            >
              {saving ? 'Saving...' : 'Save Subscriptions'}
            </button>
          </form>
        </div>

        {/* Edit Form Section */}
        {editingId && (
          <div 
            ref={editFormRef} 
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-8 border-2 border-purple-300"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-purple-700">
                  Edit Software Subscription
                </h3>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-purple-500 hover:text-purple-700 hover:bg-purple-100 p-2 rounded-full transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-13 gap-3 items-start">
              {/* Software Name */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Software Name *
                </label>
                <input
                  type="text"
                  value={editForm.softwareName}
                  onChange={(e) => setEditForm({...editForm, softwareName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  placeholder="e.g., Adobe Creative Cloud"
                />
              </div>

              {/* Amount */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (৳) *
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  max={getTodayDate()}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Method *
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Duration Fields */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Number"
                      value={editForm.durationNumber}
                      onChange={(e) => setEditForm({...editForm, durationNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={editForm.durationUnit}
                      onChange={(e) => setEditForm({...editForm, durationUnit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {durationUnits.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Optional"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-1 flex space-x-2 pt-6">
                <button
                  onClick={handleUpdateSubscription}
                  disabled={saving}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    saving
                      ? 'bg-gradient-to-r from-purple-400 to-indigo-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow'
                  } text-white font-medium`}
                >
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stored Subscriptions Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Stored Software Subscriptions</h3>
              </div>
              <div className="mt-1 text-sm text-gray-600 ml-11">
                {selectedYear !== "all" || selectedMonth !== "all" ? (
                  <span>
                    Showing {filteredSubscriptions.length} of {storedSubscriptions.length} subscription(s)
                  </span>
                ) : (
                  <span>Total: {storedSubscriptions.length} subscription(s)</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* PDF Download Button */}
              {filteredSubscriptions.length > 0 && (
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center font-medium"
                  title="Download PDF Report"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download PDF
                </button>
              )}
              
              <button
                onClick={fetchStoredSubscriptions}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all shadow-sm hover:shadow font-medium"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-purple-700">Filter by:</span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Year Filter */}
                <div>
                  <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    id="yearFilter"
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
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
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    disabled={selectedYear === "all"}
                    className={`w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      selectedYear === "all" ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
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
                {(selectedYear !== "all" || selectedMonth !== "all") && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full shadow-sm">
                      <span className="text-sm font-medium text-purple-700">
                        {selectedYear !== "all" && `Year: ${selectedYear}`}
                        {selectedYear !== "all" && selectedMonth !== "all" && ", "}
                        {selectedMonth !== "all" && `Month: ${monthNames[parseInt(selectedMonth) - 1]}`}
                      </span>
                      <button
                        onClick={resetFilters}
                        className="text-purple-500 hover:text-purple-700 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Reset Filters Button */}
                {(selectedYear !== "all" || selectedMonth !== "all") && (
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-purple-600 hover:text-purple-800 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 rounded-lg transition-all shadow-sm hover:shadow"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="md:ml-auto">
                <span className="text-sm font-medium text-purple-700 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1 rounded-full">
                  Showing {filteredSubscriptions.length} of {storedSubscriptions.length} subscription(s)
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading subscriptions...</p>
            </div>
          ) : storedSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No subscriptions stored yet</p>
              <p className="text-gray-400 mt-2">Add some using the form above</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No subscriptions found</p>
              <p className="text-gray-400 mt-2">Try changing your filter criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-purple-100">
                <table className="min-w-full divide-y divide-purple-100">
                  <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        Software Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        Amount (৳)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-purple-50">
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {subscription.softwareName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatDate(subscription.date)}
                            <div className="text-xs text-purple-600 font-medium">
                              {monthNames[new Date(subscription.date).getMonth()]} {new Date(subscription.date).getFullYear()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            {formatCurrency(subscription.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 shadow-sm">
                            {subscription.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatDuration(subscription.durationNumber, subscription.durationUnit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {subscription.note || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSubscription(subscription)}
                              className="text-purple-600 hover:text-purple-800 transition-colors px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-lg shadow-sm hover:shadow"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubscription(subscription._id)}
                              className="text-red-600 hover:text-red-800 transition-colors px-3 py-1 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-lg shadow-sm hover:shadow"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-sm font-bold text-gray-900">
                        {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Total" : "Total"}
                        {(selectedYear !== "all" || selectedMonth !== "all") && (
                          <div className="text-xs font-normal text-purple-600 mt-1">
                            {selectedYear !== "all" && `Year: ${selectedYear}`}
                            {selectedYear !== "all" && selectedMonth !== "all" && " • "}
                            {selectedMonth !== "all" && `Month: ${monthNames[parseInt(selectedMonth) - 1]}`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatCurrency(calculateTotal())}
                        </div>
                      </td>
                      <td colSpan="4" className="px-6 py-4 text-sm font-medium text-purple-700">
                        {filteredSubscriptions.length} subscription(s)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">
                    {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Subscriptions" : "Total Subscriptions"}
                  </h4>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{filteredSubscriptions.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">
                    {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Total Cost" : "Total Cost"}
                  </h4>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{formatCurrency(calculateTotal())}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">Unique Software</h4>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {[...new Set(filteredSubscriptions.map(sub => sub.softwareName))].length}
                  </p>
                </div>
              </div>
            </>
          )}
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