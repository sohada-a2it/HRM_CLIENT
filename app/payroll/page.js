"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, Users, Calendar, FileText, PlusCircle, Edit, Trash2, 
  Search, Filter, Download, ChevronRight, Bell, User, Home, Settings, 
  LogOut, TrendingUp, CheckCircle, Clock, AlertCircle, X, Eye, Save, 
  Calculator, RefreshCw, TrendingDown, UserPlus, Wallet, CreditCard,
  PieChart, BarChart3, Mail, Phone, Briefcase, Award
} from 'lucide-react';

// Axios instance with your backend URL
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://a2ithrmserver-2.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AdminPayrollDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState({
    dashboard: false,
    payrolls: false,
    employees: false,
    action: false
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    paidPayrolls: 0,
    pendingPayrolls: 0,
    processingPayrolls: 0,
    growth: 0
  });

  // Form State
  const [formData, setFormData] = useState({
    employee: '',
    periodStart: '',
    periodEnd: '',
    basicPay: '',
    overtimePay: '0',
    deductions: '0',
    netPayable: '0',
    status: 'Pending',
    notes: ''
  });

  // Fetch all payrolls from backend
  const fetchPayrolls = async () => {
    setIsLoading(prev => ({ ...prev, payrolls: true }));
    try {
      const response = await API.get('/admin/getAllpayroll');
      if (response.data.status === 'success') {
        setPayrolls(response.data.payrolls || []);
        calculateStats(response.data.payrolls || []);
      }
    } catch (err) {
      console.error('Error fetching payrolls:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch payroll data'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, payrolls: false }));
    }
  };

  // Fetch all employees from backend
const fetchEmployees = async () => {
  setIsLoading(prev => ({ ...prev, employees: true }));
  try {
    console.log('🔍 Fetching employees from API...');
    
    const response = await API.get('/admin/getAll-user');
    
    console.log('✅ API Response received:', {
      status: response.status,
      dataKeys: Object.keys(response.data),
      hasUsers: !!response.data.users,
      isArray: Array.isArray(response.data.users),
      count: response.data.count
    });
    
    // আপনার API response structure অনুযায়ী
    if (response.data && Array.isArray(response.data.users)) {
      console.log(`✅ Found ${response.data.users.length} users`);
      setEmployees(response.data.users);
    } 
    else if (response.data && response.data.users && !Array.isArray(response.data.users)) {
      console.log('⚠️ users is not an array:', response.data.users);
      setEmployees([]);
    }
    else if (response.data && response.data.count !== undefined) {
      console.log(`✅ Found ${response.data.count} users`);
      setEmployees(response.data.users || []);
    }
    else {
      console.log('❌ Unexpected response structure:', response.data);
      setEmployees([]);
    }
    
  } catch (err) {
    console.error('❌ Error fetching employees:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url
    });
    
    // Error display to user
    setNotification({
      type: 'error',
      message: `Failed to load employees: ${err.response?.data?.message || err.message}`
    });
    
    setEmployees([]);
  } finally {
    setIsLoading(prev => ({ ...prev, employees: false }));
  }
};

  // Calculate dashboard statistics
  const calculateStats = (payrollData) => {
    const totalPayroll = payrollData.reduce((sum, p) => sum + (p.netPayable || 0), 0);
    const paidPayrolls = payrollData.filter(p => p.status === 'Paid').length;
    const pendingPayrolls = payrollData.filter(p => p.status === 'Pending').length;
    const processingPayrolls = payrollData.filter(p => p.status === 'Processing').length;
    
    setStats({
      totalPayroll,
      totalEmployees: employees.length,
      paidPayrolls,
      pendingPayrolls,
      processingPayrolls,
      growth: 12.5
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Calculate net payable when financial fields change
      if (['basicPay', 'overtimePay', 'deductions'].includes(name)) {
        const basic = parseFloat(newData.basicPay) || 0;
        const overtime = parseFloat(newData.overtimePay) || 0;
        const deductions = parseFloat(newData.deductions) || 0;
        newData.netPayable = (basic + overtime - deductions).toFixed(2);
      }
      
      return newData;
    });
  };

  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employee: employeeId,
        basicPay: (employee.salary / 12).toFixed(2) || '0'
      }));
    }
  };

  // Create new payroll
  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, action: true }));
    
    try {
      const payrollData = {
        ...formData,
        basicPay: parseFloat(formData.basicPay),
        overtimePay: parseFloat(formData.overtimePay) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        netPayable: parseFloat(formData.netPayable) || 0
      };

      const response = await API.post('/admin/payroll', payrollData);
      
      if (response.data.status === 'success') {
        setNotification({
          type: 'success',
          message: 'Payroll created successfully!'
        });
        setShowCreateModal(false);
        resetForm();
        fetchPayrolls();
      }
    } catch (err) {
      console.error('Error creating payroll:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create payroll'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Update payroll
  const handleUpdatePayroll = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, action: true }));
    
    try {
      const updateData = {
        basicPay: parseFloat(formData.basicPay),
        overtimePay: parseFloat(formData.overtimePay) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        status: formData.status
      };

      const response = await API.put(`/admin/updatePayroll/${currentPayroll._id}`, updateData);
      
      if (response.data.status === 'success') {
        setNotification({
          type: 'success',
          message: 'Payroll updated successfully!'
        });
        setShowEditModal(false);
        resetForm();
        fetchPayrolls();
      }
    } catch (err) {
      console.error('Error updating payroll:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update payroll'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Delete payroll
  const handleDeletePayroll = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll?')) return;
    
    try {
      const response = await API.delete(`/admin/deletepayroll/${id}`);
      
      if (response.data.status === 'success') {
        setNotification({
          type: 'success',
          message: 'Payroll deleted successfully!'
        });
        fetchPayrolls();
      }
    } catch (err) {
      console.error('Error deleting payroll:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete payroll'
      });
    }
  };

  // Edit payroll handler
  const handleEditClick = (payroll) => {
    setCurrentPayroll(payroll);
    setFormData({
      employee: payroll.employee?._id || payroll.employee,
      periodStart: payroll.periodStart?.split('T')[0] || '',
      periodEnd: payroll.periodEnd?.split('T')[0] || '',
      basicPay: payroll.basicPay?.toString() || '',
      overtimePay: payroll.overtimePay?.toString() || '0',
      deductions: payroll.deductions?.toString() || '0',
      netPayable: payroll.netPayable?.toString() || '0',
      status: payroll.status || 'Pending',
      notes: ''
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employee: '',
      periodStart: '',
      periodEnd: '',
      basicPay: '',
      overtimePay: '0',
      deductions: '0',
      netPayable: '0',
      status: 'Pending',
      notes: ''
    });
    setCurrentPayroll(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get employee name
  const getEmployeeName = (payroll) => {
    if (payroll.name) return payroll.name;
    if (payroll.employee) {
      if (typeof payroll.employee === 'object') {
        return `${payroll.employee.firstName || ''} ${payroll.employee.lastName || ''}`.trim();
      }
    }
    return 'Unknown Employee';
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'payroll', icon: FileText, label: 'Payrolls' },
    { id: 'employees', icon: Users, label: 'Employees' } 
  ];

  // Stats cards
  const statsCards = [
    {
      title: 'Total Payroll',
      value: formatCurrency(stats.totalPayroll),
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      change: `${stats.growth}%`,
      changeType: 'increase'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+3 this month',
      changeType: 'increase'
    },
    {
      title: 'Paid Payrolls',
      value: stats.paidPayrolls,
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-500',
      change: `${((stats.paidPayrolls / payrolls.length) * 100 || 0).toFixed(1)}%`,
      changeType: 'increase'
    },
    {
      title: 'Pending',
      value: stats.pendingPayrolls,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      change: 'Requires attention',
      changeType: stats.pendingPayrolls > 0 ? 'decrease' : 'neutral'
    }
  ];

  // Filtered payrolls
  const filteredPayrolls = payrolls.filter(payroll => {
    const employeeName = getEmployeeName(payroll).toLowerCase();
    const email = payroll.employee?.email?.toLowerCase() || '';
    const employeeId = payroll.employee?.employeeId?.toLowerCase() || '';
    
    const matchesSearch = 
      employeeName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      employeeId.includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'All' || payroll.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 ${
          notification.type === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        } px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification({ type: '', message: '' })}
            className="ml-4 hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white shadow-2xl">
        {/* Logo */}
        <div className="p-6 border-b border-purple-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PayrollPro</h1>
              <p className="text-purple-300 text-xs">Admin System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-3 w-full p-4 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-purple-200 hover:bg-purple-700 hover:shadow-md'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                AD
              </div>
              <div>
                <p className="font-semibold">Admin</p>
                <p className="text-purple-300 text-sm">System Administrator</p>
              </div>
            </div>
            <button className="p-2 hover:bg-purple-700 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' ? 'Admin Dashboard' : 
                 activeTab === 'payroll' ? 'Payroll Management' :
                 activeTab === 'employees' ? 'Employee Directory' :
                 activeTab === 'analytics' ? 'Analytics & Reports' : 'System Settings'}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'dashboard' ? 'Overview of payroll system' :
                 activeTab === 'payroll' ? 'Manage and process employee payments' :
                 activeTab === 'employees' ? 'View and manage employee information' :
                 activeTab === 'analytics' ? 'Detailed payroll analytics' : 'Configure system preferences'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={() => {
                  fetchPayrolls();
                  fetchEmployees();
                }}
                className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading.dashboard ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-3">{stat.value}</p>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            stat.changeType === 'increase' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : stat.changeType === 'decrease'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {stat.changeType === 'increase' && <TrendingUp className="inline w-4 h-4 mr-1" />}
                            {stat.changeType === 'decrease' && <TrendingDown className="inline w-4 h-4 mr-1" />}
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl text-white shadow-lg`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Payrolls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Payrolls</h3>
                      <p className="text-gray-600 text-sm">Latest payroll transactions</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('payroll')}
                      className="text-purple-600 hover:text-purple-700 font-medium flex items-center text-sm"
                    >
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {isLoading.payrolls ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          </tr>
                        ))
                      ) : payrolls.slice(0, 5).map((payroll) => (
                        <tr key={payroll._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                                {getEmployeeName(payroll).charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{getEmployeeName(payroll)}</div>
                                <div className="text-sm text-gray-500">{payroll.employee?.employeeId || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-purple-600">{formatCurrency(payroll.netPayable)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
                              {payroll.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {new Date(payroll.periodStart).toLocaleDateString()} - {new Date(payroll.periodEnd).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Payroll Tab */}
          {activeTab === 'payroll' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Payroll Management</h3>
                    <p className="text-gray-600">Manage all payroll records and payments</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search payrolls..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="All">All Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                    </select>
                    
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-5 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all flex items-center"
                    >
                      <PlusCircle className="w-5 h-5 mr-2" />
                      New Payroll
                    </button>
                  </div>
                </div>
              </div>

              {/* Payroll Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Salary Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Payable</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading.payrolls ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                        </tr>
                      ))
                    ) : filteredPayrolls.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold mb-2">No payroll records found</p>
                            <button
                              onClick={() => setShowCreateModal(true)}
                              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                            >
                              Create Payroll
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPayrolls.map((payroll) => (
                        <tr key={payroll._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4">
                                {getEmployeeName(payroll).charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {getEmployeeName(payroll)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {payroll.employee?.email || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {payroll.employee?.employeeId || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600">
                                {new Date(payroll.periodStart).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">to</div>
                              <div className="text-sm text-gray-600">
                                {new Date(payroll.periodEnd).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-gray-500">Basic:</span>{' '}
                                <span className="font-semibold">{formatCurrency(payroll.basicPay)}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Overtime:</span>{' '}
                                <span className="font-semibold text-blue-600">{formatCurrency(payroll.overtimePay)}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Deductions:</span>{' '}
                                <span className="font-semibold text-red-600">{formatCurrency(payroll.deductions)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(payroll.netPayable)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(payroll.status)}`}>
                              {payroll.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditClick(payroll)}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                                title="Edit Payroll"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePayroll(payroll._id)}
                                className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                title="Delete Payroll"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employees Tab */} 
{activeTab === 'employees' && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Employee Directory</h3>
          <p className="text-gray-600">
            {employees.length} employees found
            {isLoading.employees && ' (Loading...)'}
          </p>
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500">
            API: {API.defaults.baseURL}/admin/getAll-user
          </div>
        </div>
        <button className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>
    </div>
    
    <div className="p-6">
      {isLoading.employees ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No employees found
          </h3>
          <p className="text-gray-500 mb-6">
            Check API endpoint or network connection
          </p>
          <div className="text-sm text-gray-400">
            Endpoint: {API.defaults.baseURL}/admin/getAll-user
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee._id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {employee.firstName} {employee.lastName}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {employee.employeeId}
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {employee.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                      {employee.role || 'Employee'}
                    </div>
                    {employee.salary && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        {formatCurrency(employee.salary / 12)}/month
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
        </main>
      </div>

      {/* Create Payroll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Payroll</h3>
                  <p className="text-gray-600">Fill in the details to create a new payroll record</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreatePayroll} className="p-6">
              <div className="space-y-6">
                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee
                  </label>
                  <select
                    name="employee"
                    value={formData.employee}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose an employee</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName} - {employee.employeeId} ({employee.role})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Pay Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Period
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Start Date</label>
                      <input
                        type="date"
                        name="periodStart"
                        value={formData.periodStart}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">End Date</label>
                      <input
                        type="date"
                        name="periodEnd"
                        value={formData.periodEnd}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Salary Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Basic Pay ($)</label>
                      <input
                        type="number"
                        name="basicPay"
                        value={formData.basicPay}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Overtime Pay ($)</label>
                      <input
                        type="number"
                        name="overtimePay"
                        value={formData.overtimePay}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Deductions ($)</label>
                      <input
                        type="number"
                        name="deductions"
                        value={formData.deductions}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Net Payable Display */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">Net Payable Amount</h4>
                      <p className="text-purple-100 text-sm">
                        Basic Pay + Overtime - Deductions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        ${formData.netPayable || '0.00'}
                      </div>
                      <div className="text-purple-200 text-sm">
                        Amount to be paid to employee
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add any additional notes or remarks..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center"
                >
                  {isLoading.action ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Create Payroll
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payroll Modal */}
      {showEditModal && currentPayroll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Payroll</h3>
                  <p className="text-gray-600">Update payroll details</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdatePayroll} className="p-6">
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                      {getEmployeeName(currentPayroll.employee).charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{getEmployeeName(currentPayroll.employee)}</h4>
                      <p className="text-sm text-gray-600">
                        Period: {new Date(currentPayroll.periodStart).toLocaleDateString()} - {new Date(currentPayroll.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Salary Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Basic Pay ($)</label>
                      <input
                        type="number"
                        name="basicPay"
                        value={formData.basicPay}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Overtime Pay ($)</label>
                      <input
                        type="number"
                        name="overtimePay"
                        value={formData.overtimePay}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Deductions ($)</label>
                      <input
                        type="number"
                        name="deductions"
                        value={formData.deductions}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Net Payable Display */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">Net Payable</h4>
                      <p className="text-purple-100 text-sm">
                        Recalculated based on changes
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        ${formData.netPayable || '0.00'}
                      </div>
                      <div className="text-purple-200 text-sm">
                        Previous: {formatCurrency(currentPayroll.netPayable)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center"
                >
                  {isLoading.action ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Update Payroll
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayrollDashboard;