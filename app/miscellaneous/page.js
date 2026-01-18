'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from 'next/navigation';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Download,
  Trash2,
  Edit,
  FileText,
  RefreshCw,
  Calendar,
  TrendingUp,
  CalendarDays,
  User,
  Shield,
  Info,
  Plus,
  Filter,
  Key,
  Lock,
  Crown,
  Sparkles,
  BarChart3,
  CreditCard,
  Wallet
} from "lucide-react";

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 
                  type === 'error' ? 'bg-red-50 border-red-200' :
                  type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  type === 'info' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200';
  
  const textColor = type === 'success' ? 'text-green-800' : 
                    type === 'error' ? 'text-red-800' :
                    type === 'warning' ? 'text-yellow-800' :
                    type === 'info' ? 'text-blue-800' :
                    'text-gray-800';
  
  const iconColor = type === 'success' ? 'text-green-600' : 
                    type === 'error' ? 'text-red-600' :
                    type === 'warning' ? 'text-yellow-600' :
                    type === 'info' ? 'text-blue-600' :
                    'text-gray-600';

  const icons = {
    success: <CheckCircle className={`w-5 h-5 ${iconColor}`} />,
    error: <AlertCircle className={`w-5 h-5 ${iconColor}`} />,
    warning: <AlertCircle className={`w-5 h-5 ${iconColor}`} />,
    info: <Info className={`w-5 h-5 ${iconColor}`} />
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${bgColor} animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {icons[type]}
        <div className="flex-1">
          <p className={`font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Permission Denied Toast Component
const PermissionDeniedToast = ({ action = "perform this action", requiredRole = "admin or moderator", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md">
      <div className="bg-purple-50 border border-purple-200 rounded-xl shadow-lg p-4 animate-slide-in">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-800">Access Restricted</h3>
            <p className="text-sm text-purple-700 mt-1">
              You don't have permission to {action}. 
              This section requires <span className="font-bold">{requiredRole}</span> privileges.
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-purple-400 hover:text-purple-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Access Restricted Banner Component
const AccessRestrictedBanner = ({ userRole, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            This section is exclusively available to <span className="font-bold text-purple-600">Administrators</span> and <span className="font-bold text-purple-600">Moderators</span> only.
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800">Admin</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="flex items-center">
                <Key className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800">Moderator</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Your current role: <span className="font-bold capitalize text-purple-700">{userRole || 'guest'}</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  itemName, 
  onConfirm,
  userRole 
}) => {
  if (!isOpen) return null;

  const canDelete = ['admin', 'moderator'].includes(userRole);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
        <div className="flex items-start space-x-4 mb-6">
          <div className={`w-12 h-12 rounded-full ${canDelete ? 'bg-red-100' : 'bg-yellow-100'} flex items-center justify-center`}>
            {canDelete ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <Shield className="w-6 h-6 text-yellow-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">
              {canDelete ? 'Confirm Deletion' : 'Permission Required'}
            </h3>
            <p className="text-gray-600 mt-2">
              {canDelete ? (
                <>
                  Are you sure you want to delete <span className="font-bold text-gray-900">{itemName}</span>? 
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Only administrators and moderators can delete records. 
                  Your current role: <span className="font-bold capitalize text-purple-700">{userRole}</span>
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
          >
            Cancel
          </button>
          {canDelete ? (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl transition-all duration-300 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ExtraExpensesPage() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const [permissionToast, setPermissionToast] = useState(null);
  
  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemName: '',
    expenseId: null
  });

  const [expenses, setExpenses] = useState([
    {
      id: crypto.randomUUID(),
      expenseName: "",
      amount: "",
      date: "",
      paymentMethod: "Cash",
      note: "",
    },
  ]);

  const [storedExpenses, setStoredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    expenseName: "",
    amount: "",
    date: "",
    paymentMethod: "Cash",
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

  // Ref for edit form
  const editFormRef = useRef(null);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Backend API URL
  const API_URL = "https://a2itserver.onrender.com/api/v1";

  // Payment methods - MUST MATCH BACKEND ENUM
  const paymentMethods = [
    "Cash", 
    "Bank Transfer", 
    "Mobile Banking", 
    "Card"
  ];

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Clear toast
  const clearToast = () => {
    setToast(null);
  };

  // Show permission denied toast
  const showPermissionToast = (action = "perform this action", requiredRole = "admin or moderator") => {
    setPermissionToast({ action, requiredRole });
  };

  // Clear permission toast
  const clearPermissionToast = () => {
    setPermissionToast(null);
  };

  // Check if user has admin or moderator role
  const hasAdminOrModeratorAccess = () => {
    if (!user) return false;
    return ['admin', 'moderator'].includes(user.role);
  };

  // Check user permissions
  const checkPermission = (action) => {
    if (!user) return false;
    
    switch (action) {
      case 'delete':
        return ['admin', 'moderator'].includes(user.role);
      case 'edit':
        return ['admin', 'moderator'].includes(user.role);
      case 'create':
        return ['admin', 'moderator'].includes(user.role);
      case 'view':
        return ['admin', 'moderator'].includes(user.role);
      default:
        return false;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Fetch extra expenses after authentication
  useEffect(() => {
    if (user && hasAdminOrModeratorAccess() && !authLoading) {
      fetchStoredExpenses();
    }
  }, [user, authLoading]);

  // Check if user is authenticated and has admin/moderator role
  const checkAuthentication = async () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userData || !token) {
      showToast('Please login to access the system', 'error');
      setTimeout(() => router.push('/'), 2000);
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user has admin or moderator role
      if (!hasAdminOrModeratorAccess(parsedUser)) {
        setAccessDenied(true);
        setAuthLoading(false);
        return;
      }
      
      setUser(parsedUser);
      setAuthLoading(false);
      showToast(`Welcome, ${parsedUser.name}! Admin access granted.`, 'success');
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Update available years and months when storedExpenses changes
  useEffect(() => {
    if (storedExpenses.length > 0) {
      // Extract unique years from stored expenses
      const years = Array.from(
        new Set(
          storedExpenses.map(expense => {
            const date = new Date(expense.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setAvailableYears(years);

      // If a year is selected, update available months
      if (filterYear !== "all") {
        const yearExpenses = storedExpenses.filter(expense => {
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
  }, [storedExpenses, filterYear]);

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

  const fetchStoredExpenses = async () => {
    if (!hasAdminOrModeratorAccess()) {
      showPermissionToast('view extra expenses');
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses`, {
        headers: headers, 
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          router.push('/');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      };
      
      const data = await response.json();
      if (data.success) {
        // Sort expenses by date in descending order (newest first)
        const sortedExpenses = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setStoredExpenses(sortedExpenses);
      } else {
        showToast(data.message || 'Failed to load extra expenses', 'error');
      }
    } catch (error) {
      console.error('Error fetching extra expenses:', error);
      showToast(`Network error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    let filtered = storedExpenses;

    // Apply date filter
    if (filterDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date).toISOString().split('T')[0];
        return expenseDate === filterDate;
      });
    }

    // Apply year filter
    if (filterYear !== "all") {
      filtered = filtered.filter(expense => {
        const date = new Date(expense.date);
        return date.getFullYear().toString() === filterYear;
      });
    }

    // Apply month filter
    if (filterMonth !== "all") {
      filtered = filtered.filter(expense => {
        const date = new Date(expense.date);
        return (date.getMonth() + 1).toString() === filterMonth;
      });
    }

    // Already sorted in fetchStoredExpenses, but ensure sorting here too
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [storedExpenses, filterDate, filterYear, filterMonth]);

  // Generate PDF function
  const generatePDF = () => {
    if (!hasAdminOrModeratorAccess()) {
      showPermissionToast('download reports');
      return;
    }

    if (filteredExpenses.length === 0) {
      showToast("No extra expenses to download", "warning");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(20);
      doc.setTextColor(75, 0, 130); // Purple color
      doc.setFont("helvetica", "bold");
      doc.text("Extra Expenses Report", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      let filterInfo = "All Extra Expenses";
      if (filterDate) {
        filterInfo = `Date: ${new Date(filterDate).toLocaleDateString()}`;
      } else if (filterYear !== "all" || filterMonth !== "all") {
        filterInfo = `Filter: ${filterYear !== "all" ? `Year: ${filterYear}` : ""} ${filterMonth !== "all" ? `Month: ${monthNames[parseInt(filterMonth) - 1]}` : ""}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredExpenses.length}`, 14, 42);
      
      // Add user info
      if (user) {
        doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
        doc.text(`Access Level: ${user.role === 'admin' ? 'Administrator' : 'Moderator'}`, 14, 54);
      }
      
      // Prepare table data
      const tableData = filteredExpenses.map(expense => [
        expense.expenseName,
        new Date(expense.date).toLocaleDateString(),
        `BDT ${expense.amount.toFixed(2)}`,
        expense.paymentMethod || 'Cash',
        expense.note || "-",
        `${monthNames[new Date(expense.date).getMonth()]} ${new Date(expense.date).getFullYear()}`
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        startY: user ? 60 : 50,
        head: [['Expense Name', 'Date', 'Amount (BDT)', 'Payment Method', 'Note', 'Month-Year']],
        body: tableData,
        headStyles: {
          fillColor: [128, 0, 128], // Purple color
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
          4: { cellWidth: 40 },
          5: { cellWidth: 30 }
        },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }
      });
      
      // Calculate totals
      const totalAmount = calculateFilteredTotal();
      const lastY = doc.lastAutoTable.finalY + 10;
      
      // Add summary section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 0, 130);
      doc.text("SUMMARY", 14, lastY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Expenses: ${filteredExpenses.length}`, 14, lastY + 8);
      doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
      doc.text(`Average per Expense: BDT ${(totalAmount / filteredExpenses.length).toFixed(2)}`, 14, lastY + 24);
      
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
      const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";
      const filterSuffix = isFilterActive ? '_filtered' : '';
      const filename = `extra_expenses_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      showToast(`PDF report downloaded successfully!`, "success");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(`Failed to generate PDF: ${error.message}`, 'error');
    }
  };

  const updateField = (id, field, value) => {
    setExpenses(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addExpense = () => {
    if (!hasAdminOrModeratorAccess()) {
      showPermissionToast('add expenses');
      return;
    }

    setExpenses(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        expenseName: "",
        amount: "",
        date: "",
        paymentMethod: "Cash",
        note: "",
      },
    ]);
  };

  const removeExpense = (id) => {
    if (expenses.length === 1) return;
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check create permission
    if (!hasAdminOrModeratorAccess()) {
      showPermissionToast('create extra expense records');
      return;
    }

    setSaving(true);

    // Filter out empty rows
    const validExpenses = expenses.filter(
      item => item.expenseName.trim() && item.amount && item.date
    );

    if (validExpenses.length === 0) {
      showToast("Please add at least one extra expense", 'error');
      setSaving(false);
      return;
    }

    try {
      // Prepare data for backend
      const expensesToSave = validExpenses.map(expense => ({
        expenseName: expense.expenseName.trim(),
        amount: parseFloat(expense.amount),
        date: expense.date,
        paymentMethod: expense.paymentMethod || "Cash",
        note: expense.note || ""
      }));

      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(expensesToSave),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          showToast(errorData.message || `Server error: ${response.status}`, 'error');
        } catch {
          showToast(`Server error: ${response.status} - ${errorText}`, 'error');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast(`✅ Successfully saved ${data.data.length} extra expense(s)!`, 'success');
        // Reset form
        setExpenses([{
          id: crypto.randomUUID(),
          expenseName: "",
          amount: "",
          date: "",
          paymentMethod: "Cash",
          note: "",
        }]);
        // Refresh stored expenses
        fetchStoredExpenses();
        
        if (data.warnings && data.warnings.length > 0) {
          console.warn('Warnings:', data.warnings);
        }
      } else {
        showToast(`❌ ${data.message || 'Failed to save extra expenses'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving extra expenses:', error);
      showToast(`❌ Network error: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditExpense = (expense) => {
    // Check edit permission
    if (!hasAdminOrModeratorAccess()) {
      showPermissionToast('edit extra expense records');
      return;
    }

    setEditingId(expense._id);
    setEditForm({
      expenseName: expense.expenseName,
      date: new Date(expense.date).toISOString().split('T')[0],
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod || "Cash",
      note: expense.note || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      expenseName: "",
      amount: "",
      date: "",
      paymentMethod: "Cash",
      note: ""
    });
    showToast('Edit mode cancelled', 'info');
  };

  const handleUpdateExpense = async () => {
    if (!editingId) return;

    // Check edit permission
    if (!hasAdminOrModeratorAccess()) {
      showPermissionToast('edit extra expense records');
      return;
    }

    // Validation
    if (!editForm.expenseName.trim() || !editForm.amount || !editForm.date) {
      showToast("Please fill all required fields", 'error');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        expenseName: editForm.expenseName.trim(),
        date: editForm.date,
        amount: parseFloat(editForm.amount),
        paymentMethod: editForm.paymentMethod || "Cash",
        note: editForm.note || ""
      };

      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses/${editingId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('✅ Extra expense updated successfully!', 'success');
        // Refresh the list
        fetchStoredExpenses();
        // Reset edit mode
        setEditingId(null);
        setEditForm({
          expenseName: "",
          amount: "",
          date: "",
          paymentMethod: "Cash",
          note: ""
        });
      } else {
        showToast(`❌ ${data.message || 'Failed to update extra expense'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating extra expense:', error);
      showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (expense) => {
    // Check delete permission
    if (!hasAdminOrModeratorAccess()) {
      showPermissionToast('delete extra expense records');
      return;
    }

    // Open delete confirmation modal
    setDeleteModal({
      isOpen: true,
      itemName: `${expense.expenseName} (${formatCurrency(expense.amount)})`,
      expenseId: expense._id
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const { expenseId } = deleteModal;
    
    if (!expenseId) {
      showToast("No expense selected for deletion", 'error');
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses/${expenseId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('✅ Extra expense deleted successfully!', 'success');
        // Refresh the list
        fetchStoredExpenses();
      } else {
        showToast(`❌ ${data.message || 'Failed to delete extra expense'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting extra expense:', error);
      showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
      // Close the modal
      setDeleteModal({ isOpen: false, itemName: '', expenseId: null });
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    if (!method) return "Cash";
    return method;
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

  // Calculate total for filtered expenses
  const calculateFilteredTotal = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterDate("");
    setFilterMonth("all");
    setFilterYear("all");
    showToast('All filters reset', 'info');
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all");
    const year = e.target.value === "all" ? "All Years" : e.target.value;
    showToast(`Filtered by year: ${year}`, 'info');
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
    const monthName = e.target.value === "all" ? "All Months" : monthNames[parseInt(e.target.value) - 1];
    showToast(`Filtered by month: ${monthName}`, 'info');
  };

  // Check if any filter is active
  const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Calculate form total
  const calculateFormTotal = () => {
    return expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return total + amount;
    }, 0);
  };

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Checking admin privileges...</p>
          <p className="text-gray-600 text-sm mt-2">Verifying your access level</p>
        </div>
      </div>
    );
  }

  // Show access denied screen
  if (accessDenied || !hasAdminOrModeratorAccess()) {
    return (
      <AccessRestrictedBanner 
        userRole={user?.role} 
        onClose={handleReturnToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notifications */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        
        {/* Permission Denied Toast */}
        {permissionToast && (
          <PermissionDeniedToast 
            action={permissionToast.action}
            requiredRole={permissionToast.requiredRole}
            onClose={clearPermissionToast}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, itemName: '', expenseId: null })}
          itemName={deleteModal.itemName}
          onConfirm={handleDeleteConfirm}
          userRole={user?.role}
        />

        {/* Header with Admin Badge */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Extra Expenses Management
              </h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Admin & Moderator Access Only
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1.5 rounded-full flex items-center ${
                user?.role === 'admin' 
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' 
                  : 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700'
              }`}>
                {user?.role === 'admin' ? (
                  <Crown className="w-4 h-4 mr-2" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm font-medium capitalize">{user?.role}</span>
              </div>
              <button
                onClick={handleReturnToDashboard}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
          
          {/* Access Level Banner */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Admin Access Granted</h3>
                  <p className="text-sm opacity-90">
                    Welcome, <span className="font-semibold">{user?.name}</span> • Full management privileges
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xs opacity-80">Total Expenses</div>
                  <div className="text-xl font-bold">{storedExpenses.length}</div>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <div className="text-right">
                  <div className="text-xs opacity-80">Total Amount</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(storedExpenses.reduce((total, exp) => total + exp.amount, 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8 border border-purple-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-purple-600" />
                Add New Extra Expenses
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Add single or multiple expense entries
              </p>
            </div>
            <button
              onClick={addExpense}
              className="md:hidden px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all duration-300 text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Row
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Row - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
              <div className="col-span-3">Expense Name *</div>
              <div className="col-span-2">Amount (BDT) *</div>
              <div className="col-span-2">Date *</div>
              <div className="col-span-2">Payment Method *</div>
              <div className="col-span-2">Note (Optional)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {expenses.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-4 md:p-0 md:border-0 border ${
                  index % 2 === 0 ? 'border-purple-100 bg-purple-50/50' : 'border-gray-100 bg-white'
                } rounded-xl mb-4 md:mb-0`}
              >
                {/* Mobile View - Vertical Layout */}
                <div className="md:hidden space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Expense Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Office Party, Stationery"
                        value={item.expenseName}
                        onChange={(e) =>
                          updateField(item.id, "expenseName", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Amount (BDT) *
                      </label>
                      <input
                        type="number"
                        placeholder="Amount in BDT"
                        value={item.amount}
                        onChange={(e) =>
                          updateField(item.id, "amount", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        max={getTodayDate()}
                        onChange={(e) =>
                          updateField(item.id, "date", e.target.value)
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
                        value={item.paymentMethod}
                        onChange={(e) =>
                          updateField(item.id, "paymentMethod", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select</option>
                        {paymentMethods.map(method => (
                          <option key={method} value={method}>
                            {method}
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
                      value={item.note}
                      onChange={(e) =>
                        updateField(item.id, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  {expenses.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeExpense(item.id)}
                        className="w-full py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-300 text-sm flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove This Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View - Grid Layout */}
                {/* Expense Name */}
                <div className="hidden md:block col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Office Party, Stationery"
                    value={item.expenseName}
                    onChange={(e) =>
                      updateField(item.id, "expenseName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="number"
                    placeholder="Amount in BDT"
                    value={item.amount}
                    onChange={(e) =>
                      updateField(item.id, "amount", e.target.value)
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
                    value={item.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateField(item.id, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="hidden md:block col-span-2">
                  <select
                    value={item.paymentMethod}
                    onChange={(e) =>
                      updateField(item.id, "paymentMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>

                {/* Remove - Desktop */}
                <div className="hidden md:block col-span-1">
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpense(item.id)}
                      className="w-full py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-300 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Form Total */}
            <div className="flex justify-end mb-3">
              <div className="text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl shadow-lg">
                Form Total: {formatCurrency(calculateFormTotal())}
              </div>
            </div>

            {/* Add More Button */}
            <div className="flex flex-col md:flex-row gap-3 mt-3">
                <button
                 type="button"
                onClick={addExpense}
                className="hidden md:block w-full border-2 border-dashed border-purple-300 text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition-all duration-300 font-medium"
               >
                 <Plus className="inline w-5 h-5 mr-2" />
                 Add More Expense Rows
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base font-medium ${
                  saving
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
                } text-white flex items-center justify-center`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving Expenses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save Extra Expenses
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Edit Form Section with ref */}
        {editingId && (
          <div 
            ref={editFormRef} 
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8 border-2 border-purple-300"
            id="edit-form-section"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-purple-700 flex items-center">
                  <Edit className="w-6 h-6 mr-2" />
                  Edit Extra Expense
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  Update expense details below
                </p>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-sm font-medium rounded-full flex items-center shadow-sm">
                <Edit className="w-4 h-4 mr-1" />
                Editing Mode
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-start">
              {/* Expense Name */}
              <div className="md:col-span-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Expense Name *
                </label>
                <input
                  type="text"
                  value={editForm.expenseName}
                  onChange={(e) => setEditForm({...editForm, expenseName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  required
                  placeholder="e.g., Office Party, Stationery"
                />
              </div>

              {/* Amount */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Amount (BDT) *
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  max={getTodayDate()}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  required
                >
                  <option value="">Select Method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Optional note"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-1 flex space-x-2 pt-6 md:pt-0 md:items-end">
                <button
                  onClick={handleUpdateExpense}
                  disabled={saving}
                  className={`flex-1 py-3 md:py-2 rounded-lg transition-all duration-300 text-sm md:text-base font-medium ${
                    saving
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg'
                  } text-white flex items-center justify-center`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-lg font-medium hover:from-gray-300 hover:to-gray-400 transition-all duration-300 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stored Extra Expenses Table Section */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                {isFilterActive ? 'Filtered Extra Expenses' : 'All Extra Expenses'}
                <span className="ml-3 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
                  {filteredExpenses.length} records
                </span>
              </h3>
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                {isFilterActive ? (
                  <span>
                    Showing {filteredExpenses.length} of {storedExpenses.length} expense(s)
                  </span>
                ) : (
                  <span>Total: {storedExpenses.length} expense(s)</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* PDF Download Button */}
              {filteredExpenses.length > 0 && (
                <button
                  onClick={generatePDF}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 flex items-center text-sm md:text-base font-medium shadow-lg hover:shadow-xl"
                  title="Download PDF Report"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Download PDF
                </button>
              )}
              
              {/* Mobile Filters Toggle */}
              <button
                onClick={toggleMobileFilters}
                className="md:hidden px-4 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-xl transition-all duration-300 flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <button
                onClick={fetchStoredExpenses}
                disabled={loading}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all duration-300 text-sm md:text-base font-medium flex items-center shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Sort Indicator */}
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl flex items-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600 mr-3" />
            <div>
              <p className="text-sm md:text-base font-medium text-purple-800">
                <strong>Sorted by:</strong> Date (Newest to Oldest)
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Most recent expenses appear first
              </p>
            </div>
          </div>

          {/* Filter Section */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200`}>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by:
                </span>
                <button
                  onClick={toggleMobileFilters}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4">
                {/* Date Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterDate" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Specific Date
                  </label>
                  <input
                    type="date"
                    id="filterDate"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    max={getTodayDate()}
                  />
                </div>

                {/* Year Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterYear" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    id="filterYear"
                    value={filterYear}
                    onChange={handleYearChange}
                    className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterMonth" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    id="filterMonth"
                    value={filterMonth}
                    onChange={handleMonthChange}
                    disabled={filterYear === "all"}
                    className={`w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                      filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
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
                    <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
                      <span className="text-xs text-green-700 flex items-center">
                        <Filter className="w-3 h-3 mr-1" />
                        {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
                        {filterDate && (filterYear !== "all" || filterMonth !== "all") && ", "}
                        {filterYear !== "all" && `Year: ${filterYear}`}
                        {filterYear !== "all" && filterMonth !== "all" && ", "}
                        {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                      </span>
                      <button
                        onClick={() => resetFilters()}
                        className="text-green-500 hover:text-green-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Reset Filters Button */}
                {isFilterActive && (
                  <div className="w-full md:w-auto flex md:items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full md:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-xl transition-all duration-300"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count - Desktop only */}
              <div className="hidden md:block ml-auto text-right">
                <span className="text-sm text-gray-600">
                  Showing {filteredExpenses.length} of {storedExpenses.length} record(s)
                </span>
                {isFilterActive && (
                  <div className="text-sm font-medium text-green-600 mt-1 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Filtered Total: {formatCurrency(calculateFilteredTotal())}
                  </div>
                )}
              </div>
            </div>
            
            {/* Results Count - Mobile only */}
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Showing {filteredExpenses.length} of {storedExpenses.length}
                </span>
                {isFilterActive && (
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Total: {formatCurrency(calculateFilteredTotal())}
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-base font-medium">Loading extra expenses...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching data from secure admin database</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-purple-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                {isFilterActive ? 'No matching expenses found' : 'No expenses recorded yet'}
              </h4>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {isFilterActive 
                  ? 'Try adjusting your filters or add new expenses using the form above.'
                  : 'Start by adding some extra expenses using the form above.'
                }
              </p>
              {isFilterActive && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredExpenses.map((expense, index) => (
                  <div key={expense._id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{expense.expenseName}</h4>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(expense.date)}
                          {index === 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium rounded">
                              Newest
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                          {formatCurrency(expense.amount)}
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                          expense.paymentMethod === 'Cash' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800' :
                          expense.paymentMethod === 'Bank Transfer' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800' :
                          expense.paymentMethod === 'Mobile Banking' ? 'bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800' :
                          expense.paymentMethod === 'Card' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' :
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                        }`}>
                          {formatPaymentMethod(expense.paymentMethod || 'Cash')}
                        </span>
                      </div>
                    </div>
                    
                    {expense.note && (
                      <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
                        <span className="font-medium text-gray-700">Note:</span> {expense.note}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        disabled={!checkPermission('edit')}
                        className="flex-1 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title={!checkPermission('edit') ? "Admin/Moderator access required" : ""}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expense)}
                        disabled={!checkPermission('delete')}
                        className="flex-1 py-2.5 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-300 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title={!checkPermission('delete') ? "Admin/Moderator access required" : ""}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Mobile Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mt-4 border border-purple-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-purple-800">
                      {isFilterActive ? "Filtered Total" : "Total"}
                    </span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      {formatCurrency(calculateFilteredTotal())}
                    </span>
                  </div>
                  <div className="text-xs text-purple-600 flex items-center">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    {filteredExpenses.length} expense(s)
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Expense Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Amount (BDT)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense, index) => (
                      <tr key={expense._id} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mr-3">
                              <Wallet className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {expense.expenseName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                            {formatDate(expense.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {monthNames[new Date(expense.date).getMonth()]} {new Date(expense.date).getFullYear()}
                          </div>
                          {index === 0 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium rounded-full flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Newest
                            </div>
                          )}
                          {index === filteredExpenses.length - 1 && filteredExpenses.length > 1 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-xs font-medium rounded-full">
                              Oldest
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                            {formatCurrency(expense.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            expense.paymentMethod === 'Cash' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800' :
                            expense.paymentMethod === 'Bank Transfer' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800' :
                            expense.paymentMethod === 'Mobile Banking' ? 'bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800' :
                            expense.paymentMethod === 'Card' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' :
                            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                          }`}>
                            <CreditCard className="inline w-3 h-3 mr-1" />
                            {formatPaymentMethod(expense.paymentMethod || 'Cash')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 max-w-xs">
                            {expense.note || (
                              <span className="text-gray-400 italic">No note</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              disabled={!checkPermission('edit')}
                              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              title={!checkPermission('edit') ? "Admin/Moderator access required" : ""}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(expense)}
                              disabled={!checkPermission('delete')}
                              className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              title={!checkPermission('delete') ? "Admin/Moderator access required" : ""}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-sm font-bold text-gray-900">
                        {isFilterActive ? "Filtered Total" : "Total"}
                        {isFilterActive && (
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            <Filter className="inline w-3 h-3 mr-1" />
                            {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
                            {filterDate && (filterYear !== "all" || filterMonth !== "all") && " • "}
                            {filterYear !== "all" && `Year: ${filterYear}`}
                            {filterYear !== "all" && filterMonth !== "all" && " • "}
                            {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                          </div>
                        )}
                        <div className="text-xs font-normal text-purple-600 mt-1 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Sorted: Newest to Oldest • Admin View
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          {formatCurrency(calculateFilteredTotal())}
                        </div>
                        {filteredExpenses.length > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Average: {formatCurrency(calculateFilteredTotal() / filteredExpenses.length)}
                          </div>
                        )}
                      </td>
                      <td colSpan="3" className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
                          {filteredExpenses.length} expense(s)
                        </div>
                        {filteredExpenses.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            Showing {Math.min(filteredExpenses.length, 10)} of {filteredExpenses.length} records
                          </div>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                  <h4 className="text-xs md:text-sm font-medium text-purple-900 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {isFilterActive ? "Filtered Expenses" : "Total Expenses"}
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">
                    {filteredExpenses.length}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <h4 className="text-xs md:text-sm font-medium text-green-900 flex items-center">
                    <Wallet className="w-4 h-4 mr-2" />
                    {isFilterActive ? "Filtered Cost" : "Total Cost"}
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    {formatCurrency(calculateFilteredTotal())}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                  <h4 className="text-xs md:text-sm font-medium text-pink-900 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Average per Expense
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                    {formatCurrency(filteredExpenses.length > 0 ? calculateFilteredTotal() / filteredExpenses.length : 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="text-xs md:text-sm font-medium text-blue-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Expense Types
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {[...new Set(filteredExpenses.map(expense => expense.expenseName))].length}
                  </p>
                </div>
              </div>

              {/* Expense Type Breakdown */}
              {filteredExpenses.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
                    {isFilterActive ? "Filtered Expense Type Breakdown" : "Expense Type Breakdown"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(
                      filteredExpenses.reduce((acc, expense) => {
                        acc[expense.expenseName] = (acc[expense.expenseName] || 0) + expense.amount;
                        return acc;
                      }, {})
                    ).map(([expenseName, totalAmount]) => (
                      <div key={expenseName} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 truncate mr-2">{expenseName}</span>
                          <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>
                        <div className="mt-3 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-1000" 
                            style={{ 
                              width: `${Math.min((totalAmount / calculateFilteredTotal()) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-right">
                          {((totalAmount / calculateFilteredTotal()) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .bg-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
      `}</style>
    </div>
  );
}