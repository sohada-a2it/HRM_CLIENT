"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// API বেস URL
const API_BASE_URL = 'https://a2itserver.onrender.com/api/v1';

export default function page() {
  const [transports, setTransports] = useState([
    {
      id: crypto.randomUUID(),
      transportName: "",
      cost: "",
      date: "",
      paymentMethod: "",
      note: "",
    },
  ]);

  const [storedTransports, setStoredTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    transportName: "",
    cost: "",
    date: "",
    paymentMethod: "",
    note: ""
  });

  // Filter states
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  // Mobile menu state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // User role state
  const [userRole, setUserRole] = useState("guest");

  // Ref for edit form
  const editFormRef = useRef(null);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Currency symbol for Bangladeshi Taka
  const currencySymbol = "৳";

  // Check user role on component mount
  useEffect(() => {
    checkUserRole();
    fetchStoredTransports();
  }, []);

  // Update available years and months when storedTransports changes
  useEffect(() => {
    if (storedTransports.length > 0) {
      const years = Array.from(
        new Set(
          storedTransports.map(expense => {
            const date = new Date(expense.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setAvailableYears(years);

      if (filterYear !== "all") {
        const yearExpenses = storedTransports.filter(expense => {
          const date = new Date(expense.date);
          return date.getFullYear().toString() === filterYear;
        });

        const months = Array.from(
          new Set(
            yearExpenses.map(expense => {
              const date = new Date(expense.date);
              return date.getMonth() + 1;
            })
          )
        ).sort((a, b) => a - b);

        setAvailableMonths(months);
      } else {
        setAvailableMonths([]);
        setFilterMonth("all");
      }
    } else {
      setAvailableYears([]);
      setAvailableMonths([]);
    }
  }, [storedTransports, filterYear]);

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

  // Check user role from tokens
  const checkUserRole = () => {
    const adminToken = localStorage.getItem('adminToken') || 
                      document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1];
    
    const moderatorToken = localStorage.getItem('moderatorToken') || 
                          document.cookie.split('; ').find(row => row.startsWith('moderatorToken='))?.split('=')[1];

    if (adminToken) {
      setUserRole("admin");
    } else if (moderatorToken) {
      setUserRole("moderator");
    } else {
      setUserRole("guest");
    }
  };

  // Helper function to get authentication headers based on user role
  const getAuthHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const adminToken = localStorage.getItem('adminToken') || 
                      document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1];
    
    const moderatorToken = localStorage.getItem('moderatorToken') || 
                          document.cookie.split('; ').find(row => row.startsWith('moderatorToken='))?.split('=')[1];
    
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
      headers['X-User-Role'] = 'admin';
    } else if (moderatorToken) {
      headers['Authorization'] = `Bearer ${moderatorToken}`;
      headers['X-User-Role'] = 'moderator';
    }
    
    return headers;
  };

  // ✅ CORRECTED: GET request
  const fetchStoredTransports = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/transport-expenses`, {
        headers: headers
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const sortedTransports = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setStoredTransports(sortedTransports);
      } else {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication required. Please login with admin or moderator token.');
          setStoredTransports([]);
        } else {
          setError(data.message || 'Failed to load transport expenses');
        }
      }
    } catch (error) {
      console.error('Error fetching transport expenses:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort transports
  const filteredTransports = useMemo(() => {
    let filtered = storedTransports;

    if (filterDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date).toISOString().split('T')[0];
        return expenseDate === filterDate;
      });
    }

    if (filterYear !== "all") {
      filtered = filtered.filter(expense => {
        const date = new Date(expense.date);
        return date.getFullYear().toString() === filterYear;
      });
    }

    if (filterMonth !== "all") {
      filtered = filtered.filter(expense => {
        const date = new Date(expense.date);
        return (date.getMonth() + 1).toString() === filterMonth;
      });
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [storedTransports, filterDate, filterYear, filterMonth]);

  // Generate PDF function
  const generatePDF = () => {
    if (filteredTransports.length === 0) {
      setError("No transport expenses to download");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(20);
      doc.setTextColor(106, 13, 173);
      doc.setFont("helvetica", "bold");
      doc.text("Transport Expenses Report", pageWidth / 2, 20, { align: "center" });
      
      // ... rest of PDF generation code (same as before)
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filterSuffix = isFilterActive ? '_filtered' : '';
      const filename = `transport_expenses_${timestamp}${filterSuffix}.pdf`;
      
      doc.save(filename);
      setSuccess(`PDF downloaded successfully: ${filename}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const updateField = (id, field, value) => {
    setTransports(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addTransport = () => {
    setTransports(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        transportName: "",
        cost: "",
        date: "",
        paymentMethod: "",
        note: "",
      },
    ]);
  };

  const removeTransport = (id) => {
    if (transports.length === 1) return;
    setTransports(prev => prev.filter(item => item.id !== id));
  };

  // ✅ CORRECTED: POST request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const validTransports = transports.filter(
      item => item.transportName.trim() && item.cost && item.date
    );

    if (validTransports.length === 0) {
      setError("Please add at least one transport expense");
      setSaving(false);
      return;
    }

    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/create-transport-expenses`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(validTransports),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Successfully saved ${data.data.length} transport expense(s) as ${userRole}`);
        setTransports([{
          id: crypto.randomUUID(),
          transportName: "",
          cost: "",
          date: "",
          paymentMethod: "",
          note: "",
        }]);
        fetchStoredTransports();
        
        if (data.warnings && data.warnings.length > 0) {
          console.warn('Warnings:', data.warnings);
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please login with admin or moderator token.');
        } else {
          setError(data.message || 'Failed to save transport expenses');
        }
      }
    } catch (error) {
      console.error('Error saving transport expenses:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTransport = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      transportName: expense.transportName,
      date: new Date(expense.date).toISOString().split('T')[0],
      cost: expense.cost.toString(),
      paymentMethod: expense.paymentMethod,
      note: expense.note || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      transportName: "",
      cost: "",
      date: "",
      paymentMethod: "",
      note: ""
    });
  };

  // ✅ CORRECTED: PUT request
  const handleUpdateTransport = async () => {
    if (!editingId) return;

    if (!editForm.transportName.trim() || !editForm.cost || !editForm.date) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/update-transport-expenses/${editingId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          transportName: editForm.transportName,
          date: editForm.date,
          cost: parseFloat(editForm.cost),
          paymentMethod: editForm.paymentMethod,
          note: editForm.note
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Transport expense updated successfully as ${userRole}`);
        fetchStoredTransports();
        setEditingId(null);
        setEditForm({
          transportName: "",
          cost: "",
          date: "",
          paymentMethod: "",
          note: ""
        });
      } else {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please login with admin or moderator token.');
        } else {
          setError(data.message || 'Failed to update transport expense');
        }
      }
    } catch (error) {
      console.error('Error updating transport expense:', error);
      setError('Failed to update transport expense');
    } finally {
      setSaving(false);
    }
  };

  // ✅ CORRECTED: DELETE request
  const handleDeleteTransport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transport expense?')) return;

    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/delete-transport-expenses/${id}`, {
        method: 'DELETE',
        headers: headers
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Transport expense deleted successfully as ${userRole}`);
        fetchStoredTransports();
      } else {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please login with admin or moderator token.');
        } else {
          setError(data.message || 'Failed to delete transport expense');
        }
      }
    } catch (error) {
      console.error('Error deleting transport expense:', error);
      setError('Failed to delete transport expense');
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const calculateFilteredTotal = () => {
    return filteredTransports.reduce((total, expense) => total + expense.cost, 0);
  };

  const calculateTotal = () => {
    return storedTransports.reduce((total, expense) => total + expense.cost, 0);
  };

  const resetFilters = () => {
    setFilterDate("");
    setFilterMonth("all");
    setFilterYear("all");
  };

  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all");
  };

  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
  };

  const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const calculateFormTotal = () => {
    return transports.reduce((total, expense) => {
      const amount = parseFloat(expense.cost) || 0;
      return total + amount;
    }, 0);
  };

  const isAuthenticated = () => {
    return userRole !== "guest";
  };

  const handleTokenInput = (tokenType) => {
    const token = prompt(`Enter ${tokenType} token:`);
    if (token) {
      localStorage.setItem(tokenType, token);
      checkUserRole();
      fetchStoredTransports();
      setSuccess(`${tokenType} token saved successfully!`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('moderatorToken');
    setUserRole("guest");
    setStoredTransports([]);
    setSuccess("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Role */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-center md:text-left text-purple-900">
                🚗 Transport Expense Management
              </h2>
              <p className="text-sm md:text-base text-center md:text-left text-purple-600 mt-1">
                Track and manage all your transportation expenses
              </p>
            </div>
            
            {/* User Role and Token Management */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <div className={`w-3 h-3 rounded-full ${
                  userRole === "admin" ? "bg-purple-600" :
                  userRole === "moderator" ? "bg-indigo-500" :
                  "bg-gray-400"
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  Role: <span className={`font-bold ${
                    userRole === "admin" ? "text-purple-600" :
                    userRole === "moderator" ? "text-indigo-500" :
                    "text-gray-500"
                  }`}>{userRole.toUpperCase()}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isAuthenticated() ? (
                  <>
                    <button
                      onClick={() => handleTokenInput('adminToken')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                    >
                      Admin Login
                    </button>
                    <button
                      onClick={() => handleTokenInput('moderatorToken')}
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-md transition-colors"
                    >
                      Moderator Login
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Authentication Status */}
          {!isAuthenticated() && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-purple-800">
                    🔐 Authentication Required
                  </h3>
                  <div className="mt-2 text-sm text-purple-700">
                    <p>Please login with either:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><strong>Admin Token</strong> - Full access to all features</li>
                      <li><strong>Moderator Token</strong> - Limited access to manage expenses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-purple-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div>
              <h3 className="text-lg font-bold text-purple-900">Add New Transport Expenses</h3>
              <p className="text-sm text-purple-600 mt-1">
                {userRole === "admin" ? "🔓 Full administrative access" :
                 userRole === "moderator" ? "🔐 Moderate access" :
                 "🔒 Login required to add expenses"}
              </p>
            </div>
            <button
              onClick={addTransport}
              disabled={!isAuthenticated()}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                !isAuthenticated()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
              }`}
            >
              + Add Transport
            </button>
          </div>
          
          {/* Messages */}
          {error && !editingId && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}
          {success && !editingId && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Row - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-bold text-purple-700 px-1 bg-purple-50 p-3 rounded-lg">
              <div className="col-span-3">Transportation Name</div>
              <div className="col-span-2">Cost (৳)</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Payment Method</div>
              <div className="col-span-2">Note (Optional)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {transports.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-4 md:p-3 border border-purple-100 rounded-lg mb-4 md:mb-3 bg-gradient-to-br from-white to-purple-50"
              >
                {/* Mobile View - Vertical Layout */}
                <div className="md:hidden space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1">
                        Transportation Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bus, Uber, Fuel"
                        value={item.transportName}
                        onChange={(e) =>
                          updateField(item.id, "transportName", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                        disabled={!isAuthenticated()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1">
                        Cost (৳) *
                      </label>
                      <input
                        type="number"
                        placeholder="Cost in ৳"
                        value={item.cost}
                        onChange={(e) =>
                          updateField(item.id, "cost", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                        min="0"
                        step="0.01"
                        disabled={!isAuthenticated()}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        max={getTodayDate()}
                        onChange={(e) =>
                          updateField(item.id, "date", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                        disabled={!isAuthenticated()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={item.paymentMethod}
                        onChange={(e) =>
                          updateField(item.id, "paymentMethod", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        required
                        disabled={!isAuthenticated()}
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Optional note"
                      value={item.note}
                      onChange={(e) =>
                        updateField(item.id, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      disabled={!isAuthenticated()}
                    />
                  </div>
                  
                  {transports.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeTransport(item.id)}
                        disabled={!isAuthenticated()}
                        className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                          !isAuthenticated()
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md"
                        }`}
                      >
                        Remove This Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View - Grid Layout */}
                {/* Transportation Name */}
                <div className="hidden md:block col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Bus, Uber, Fuel"
                    value={item.transportName}
                    onChange={(e) =>
                      updateField(item.id, "transportName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    required
                    disabled={!isAuthenticated()}
                  />
                </div>

                {/* Cost */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="number"
                    placeholder="Cost in ৳"
                    value={item.cost}
                    onChange={(e) =>
                      updateField(item.id, "cost", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    required
                    min="0"
                    step="0.01"
                    disabled={!isAuthenticated()}
                  />
                </div>

                {/* Date */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="date"
                    value={item.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateField(item.id, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    required
                    disabled={!isAuthenticated()}
                  />
                </div>

                {/* Payment Method */}
                <div className="hidden md:block col-span-2">
                  <select
                    value={item.paymentMethod}
                    onChange={(e) =>
                      updateField(item.id, "paymentMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    required
                    disabled={!isAuthenticated()}
                  >
                    <option value="">Select</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {/* Note (Optional) */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="text"
                    placeholder="Optional note"
                    value={item.note}
                    onChange={(e) =>
                      updateField(item.id, "note", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    disabled={!isAuthenticated()}
                  />
                </div>

                {/* Remove - Desktop */}
                <div className="hidden md:block col-span-1">
                  {transports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTransport(item.id)}
                      disabled={!isAuthenticated()}
                      className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                        !isAuthenticated()
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md"
                      }`}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Form Total */}
            <div className="flex justify-between items-center mb-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
              <div className="text-lg font-bold text-purple-900">
                Form Total: {formatCurrency(calculateFormTotal())}
              </div>
              <div className="text-sm text-purple-600">
                {transports.length} item(s) to save
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <button
                type="button"
                onClick={addTransport}
                disabled={!isAuthenticated()}
                className={`hidden md:block w-full py-3 rounded-lg transition-colors text-sm font-medium border-2 ${
                  !isAuthenticated()
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600"
                }`}
              >
                + Add More Transport
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving || !isAuthenticated()}
                className={`w-full py-3 md:py-3 rounded-lg transition-all duration-300 text-sm md:text-base font-bold shadow-lg ${
                  saving
                    ? 'bg-gradient-to-r from-purple-400 to-indigo-400 cursor-not-allowed'
                    : !isAuthenticated()
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl'
                } text-white`}
              >
                {!isAuthenticated() ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Login Required to Save
                  </span>
                ) : saving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving as {userRole}...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    Save Transport Expenses as {userRole.toUpperCase()}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Edit Form Section with ref */}
        {editingId && (
          <div 
            ref={editFormRef} 
            className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border-2 border-purple-300"
            id="edit-form-section"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div>
                <h3 className="text-base md:text-lg font-bold text-purple-900">
                  ✏️ Edit Transport Expense
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  Editing as <span className="font-bold text-purple-700">{userRole}</span>
                </p>
              </div>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                ✕ Close Edit
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 font-medium">{success}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-start">
              {/* Transport Name */}
              <div className="md:col-span-3">
                <label className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                  Transportation Name *
                </label>
                <input
                  type="text"
                  value={editForm.transportName}
                  onChange={(e) => setEditForm({...editForm, transportName: e.target.value})}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                  required
                  placeholder="e.g., Bus, Uber, Fuel"
                />
              </div>

              {/* Cost */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                  Cost (৳) *
                </label>
                <input
                  type="number"
                  value={editForm.cost}
                  onChange={(e) => setEditForm({...editForm, cost: e.target.value})}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  max={getTodayDate()}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                  required
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Note */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                  placeholder="Optional note"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-1 flex space-x-2 pt-6 md:pt-0 md:items-end">
                <button
                  onClick={handleUpdateTransport}
                  disabled={saving || !isAuthenticated()}
                  className={`flex-1 py-3 md:py-2 rounded-lg transition-all duration-300 text-sm md:text-base font-bold shadow-md ${
                    saving
                      ? 'bg-gradient-to-r from-purple-400 to-indigo-400 cursor-not-allowed'
                      : !isAuthenticated()
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg'
                  } text-white`}
                >
                  {!isAuthenticated() ? (
                    'Login Required'
                  ) : saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stored Transport Expenses Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-purple-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-lg font-bold text-purple-900">Stored Transport Expenses</h3>
              <div className="mt-1 text-sm text-purple-600 flex items-center gap-2">
                {userRole !== "guest" && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-xs font-medium">
                    Access as: {userRole}
                  </span>
                )}
                <span>
                  {isFilterActive ? (
                    `Showing ${filteredTransports.length} of ${storedTransports.length} expense(s)`
                  ) : (
                    `Total: ${storedTransports.length} expense(s)`
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* PDF Download Button */}
              {filteredTransports.length > 0 && (
                <button
                  onClick={generatePDF}
                  disabled={!isAuthenticated()}
                  className={`px-3 md:px-4 py-2 rounded-lg transition-all duration-300 text-sm md:text-base font-medium shadow-md ${
                    !isAuthenticated()
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg text-white"
                  }`}
                  title="Download PDF Report"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    {!isAuthenticated() ? 'Login to Download' : 'Download PDF'}
                  </span>
                </button>
              )}
              
              {/* Mobile Filters Toggle */}
              <button
                onClick={toggleMobileFilters}
                className="md:hidden px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 rounded-lg transition-colors flex items-center shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filters
              </button>
              
              <button
                onClick={fetchStoredTransports}
                disabled={loading || !isAuthenticated()}
                className={`px-3 md:px-4 py-2 rounded-lg transition-all duration-300 text-sm md:text-base font-medium shadow-md ${
                  loading || !isAuthenticated()
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 hover:shadow-lg"
                }`}
              >
                {!isAuthenticated() ? 'Login to Refresh' : loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block mb-4 md:mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100`}>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-purple-700">Filter by:</span>
                <button
                  onClick={toggleMobileFilters}
                  className="md:hidden text-purple-500 hover:text-purple-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4">
                {/* Date Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterDate" className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                    Specific Date
                  </label>
                  <input
                    type="date"
                    id="filterDate"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full md:w-40 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    max={getTodayDate()}
                  />
                </div>

                {/* Year Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterYear" className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                    Year
                  </label>
                  <select
                    id="filterYear"
                    value={filterYear}
                    onChange={handleYearChange}
                    className="w-full md:w-32 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterMonth" className="block text-xs md:text-sm font-bold text-purple-700 mb-1">
                    Month
                  </label>
                  <select
                    id="filterMonth"
                    value={filterMonth}
                    onChange={handleMonthChange}
                    disabled={filterYear === "all"}
                    className={`w-full md:w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                      filterYear === "all" ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-purple-200'
                    }`}
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {monthNames[month - 1]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Filters Display */}
                {isFilterActive && (
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-2 rounded-lg border border-purple-200">
                      <span className="text-xs text-purple-700 font-medium">
                        {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
                        {filterDate && (filterYear !== "all" || filterMonth !== "all") && ", "}
                        {filterYear !== "all" && `Year: ${filterYear}`}
                        {filterYear !== "all" && filterMonth !== "all" && ", "}
                        {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                      </span>
                      <button
                        onClick={() => resetFilters()}
                        className="text-purple-500 hover:text-purple-700 text-sm"
                      >
                        ✕ Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Reset Filters Button */}
                {isFilterActive && (
                  <div className="w-full md:w-auto flex md:items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full md:w-auto px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-900 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-lg transition-colors border border-purple-200"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count - Desktop only */}
              <div className="hidden md:block ml-auto text-right">
                <span className="text-sm text-purple-600 font-medium">
                  Showing {filteredTransports.length} of {storedTransports.length} record(s)
                </span>
                {isFilterActive && (
                  <div className="text-sm font-bold text-green-600 mt-1">
                    Filtered Total: {formatCurrency(calculateFilteredTotal())}
                  </div>
                )}
              </div>
            </div>
            
            {/* Results Count - Mobile only */}
            <div className="md:hidden mt-4 pt-4 border-t border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600 font-medium">
                  Showing {filteredTransports.length} of {storedTransports.length}
                </span>
                {isFilterActive && (
                  <span className="text-sm font-bold text-green-600">
                    Total: {formatCurrency(calculateFilteredTotal())}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sort Indicator */}
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
            </svg>
            <p className="text-xs md:text-sm text-purple-800 font-medium">
              <strong>Sorted by:</strong> Date (Newest to Oldest) • <strong>Access Level:</strong> {userRole.toUpperCase()}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-purple-600 text-sm md:text-base font-medium">Loading transport expenses...</p>
              <p className="text-xs text-purple-500 mt-1">Fetching data as {userRole}</p>
            </div>
          ) : !isAuthenticated() ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-purple-900 mb-3">Authentication Required</h4>
                <p className="text-purple-600 mb-6">Please login with Admin or Moderator token to view transport expenses.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleTokenInput('adminToken')}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md"
                  >
                    Login as Admin
                  </button>
                  <button
                    onClick={() => handleTokenInput('moderatorToken')}
                    className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg transition-all duration-300 font-medium shadow-md"
                  >
                    Login as Moderator
                  </button>
                </div>
              </div>
            </div>
          ) : filteredTransports.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                {isFilterActive ? (
                  <>
                    <h4 className="text-xl font-bold text-purple-900 mb-3">No Expenses Found</h4>
                    <p className="text-purple-600 mb-6">No transport expenses found for the selected filters.</p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md"
                    >
                      Reset Filters
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-xl font-bold text-purple-900 mb-3">No Expenses Yet</h4>
                    <p className="text-purple-600 mb-6">No transport expenses stored yet. Add some using the form above.</p>
                    <p className="text-sm text-purple-500">
                      Logged in as: <span className="font-bold">{userRole.toUpperCase()}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredTransports.map((expense, index) => (
                  <div key={expense._id} className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 border border-purple-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-purple-900">{expense.transportName}</h4>
                        <div className="text-xs text-purple-600 mt-1 flex items-center gap-2">
                          {formatDate(expense.date)}
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs font-bold rounded-full">
                              NEWEST
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700 text-lg">{formatCurrency(expense.cost)}</div>
                        <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full font-medium">
                          {expense.paymentMethod}
                        </span>
                      </div>
                    </div>
                    
                    {expense.note && (
                      <div className="text-sm text-purple-600 mb-3 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                        <span className="font-bold">📝 Note:</span> {expense.note}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-3 border-t border-purple-200">
                      <button
                        onClick={() => handleEditTransport(expense)}
                        disabled={!isAuthenticated()}
                        className={`flex-1 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm ${
                          !isAuthenticated()
                            ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 hover:shadow-md'
                        }`}
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          {!isAuthenticated() ? 'Login to Edit' : 'Edit'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteTransport(expense._id)}
                        disabled={!isAuthenticated()}
                        className={`flex-1 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium shadow-sm ${
                          !isAuthenticated()
                            ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 hover:shadow-md'
                        }`}
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          {!isAuthenticated() ? 'Login to Delete' : 'Delete'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Mobile Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mt-4 border border-purple-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-purple-900 text-lg">
                      {isFilterActive ? "Filtered Total" : "Total"}
                    </span>
                    <span className="font-bold text-purple-900 text-xl">{formatCurrency(calculateFilteredTotal())}</span>
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    {filteredTransports.length} expense(s) • Access: {userRole.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-purple-100">
                <table className="min-w-full divide-y divide-purple-100">
                  <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Transport Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Cost (৳)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-purple-50">
                    {filteredTransports.map((expense, index) => (
                      <tr key={expense._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-purple-900">
                            {expense.transportName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-900">
                            {formatDate(expense.date)}
                          </div>
                          <div className="text-xs text-purple-600">
                            {monthNames[new Date(expense.date).getMonth()]} {new Date(expense.date).getFullYear()}
                          </div>
                          {index === 0 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs font-bold rounded-full">
                              NEWEST
                            </div>
                          )}
                          {index === filteredTransports.length - 1 && filteredTransports.length > 1 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-bold rounded-full">
                              OLDEST
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-700">
                            {formatCurrency(expense.cost)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700">
                            {expense.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-purple-600 max-w-xs truncate">
                            {expense.note || <span className="text-purple-400">-</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTransport(expense)}
                              disabled={!isAuthenticated()}
                              className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-sm ${
                                !isAuthenticated()
                                  ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 hover:shadow-md'
                              }`}
                            >
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                {!isAuthenticated() ? 'Login to Edit' : 'Edit'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteTransport(expense._id)}
                              disabled={!isAuthenticated()}
                              className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-sm ${
                                !isAuthenticated()
                                  ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 hover:shadow-md'
                              }`}
                            >
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                {!isAuthenticated() ? 'Login to Delete' : 'Delete'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-sm font-bold text-purple-900">
                        {isFilterActive ? "Filtered Total" : "Total"}
                        {isFilterActive && (
                          <div className="text-xs font-normal text-purple-600 mt-1">
                            {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
                            {filterDate && (filterYear !== "all" || filterMonth !== "all") && " • "}
                            {filterYear !== "all" && `Year: ${filterYear}`}
                            {filterYear !== "all" && filterMonth !== "all" && " • "}
                            {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                          </div>
                        )}
                        <div className="text-xs font-normal text-purple-500 mt-1">
                          Sorted: Newest to Oldest • Access: {userRole.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-purple-900">
                          {formatCurrency(calculateFilteredTotal())}
                        </div>
                      </td>
                      <td colSpan="3" className="px-6 py-4 text-sm text-purple-600 font-medium">
                        {filteredTransports.length} expense(s)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-6 rounded-xl border border-purple-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-bold text-purple-900">
                    {isFilterActive ? "Filtered Expenses" : "Total Expenses"}
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-purple-700 mt-2">{filteredTransports.length}</p>
                  <div className="text-xs text-purple-600 mt-2">Managed by {userRole}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 rounded-xl border border-green-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-bold text-green-900">
                    {isFilterActive ? "Filtered Cost" : "Total Cost"}
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-green-700 mt-2">{formatCurrency(calculateFilteredTotal())}</p>
                  <div className="text-xs text-green-600 mt-2">Bangladeshi Taka</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 md:p-6 rounded-xl border border-yellow-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-bold text-yellow-900">Transport Types</h4>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-700 mt-2">
                    {[...new Set(filteredTransports.map(expense => expense.transportName))].length}
                  </p>
                  <div className="text-xs text-yellow-600 mt-2">Unique types</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-bold text-blue-900">Access Level</h4>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700 mt-2">{userRole.toUpperCase()}</p>
                  <div className="text-xs text-blue-600 mt-2">Current user role</div>
                </div>
              </div>

              {/* Transport Type Breakdown */}
              {filteredTransports.length > 0 && (
                <div className="mt-8 md:mt-10">
                  <h4 className="text-base md:text-lg font-bold text-purple-900 mb-4">
                    {isFilterActive ? "Filtered Transport Type Breakdown" : "Transport Type Breakdown"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {Object.entries(
                      filteredTransports.reduce((acc, expense) => {
                        acc[expense.transportName] = (acc[expense.transportName] || 0) + expense.cost;
                        return acc;
                      }, {})
                    ).map(([transportName, totalCost]) => (
                      <div key={transportName} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm md:text-base font-bold text-purple-900 truncate mr-2">{transportName}</span>
                          <span className="text-sm md:text-base font-bold text-purple-900 whitespace-nowrap">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="mb-1 flex justify-between text-xs text-purple-600">
                          <span>{(totalCost / calculateFilteredTotal() * 100).toFixed(1)}% of total</span>
                          <span>{((filteredTransports.filter(e => e.transportName === transportName).length / filteredTransports.length) * 100).toFixed(1)}% by count</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(totalCost / calculateFilteredTotal()) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-purple-200">
          <div className="text-center text-sm text-purple-600">
            <p>Transport Expense Management System • {new Date().getFullYear()}</p>
            <p className="mt-1">Access Level: <span className="font-bold text-purple-700">{userRole.toUpperCase()}</span></p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-purple-500">
              <span>Total Expenses: {storedTransports.length}</span>
              <span>•</span>
              <span>Total Cost: {formatCurrency(calculateTotal())}</span>
              <span>•</span>
              <span>Last Updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}