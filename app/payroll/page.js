// app/payroll/page.js
"use client"
import React, { useState, useEffect } from 'react'
import { 
  DollarSign, Users, Calendar, FileText, PlusCircle, Edit, Trash2,
  Search, Filter, Download, CheckCircle, Clock, AlertCircle, X, Eye, Save,
  RefreshCw, TrendingUp, TrendingDown, UserPlus, Wallet, CreditCard,
  PieChart, BarChart3, Mail, Phone, Briefcase, Award, ChevronRight,
  Home, Settings, LogOut, Bell, User, Calculator, Loader2,
  Building, MapPin, CalendarDays, CreditCard as CardIcon, ChevronLeft,
  Shield, UserCheck, FileCheck, Receipt, Banknote, ArrowUpDown, CalendarRange,
  Users as UsersIcon, UserCog, FileSpreadsheet, BarChart, DownloadCloud,
  Percent, Clock as ClockIcon, Moon, Sun, Zap, Target, PieChart as PieChartIcon,
  Briefcase as BriefcaseIcon, Building2, Home as HomeIcon, Wallet as WalletIcon,
  Server, Wifi, WifiOff, AlertTriangle, Check, ExternalLink,
  Calculator as CalcIcon, Zap as ZapIcon, CheckSquare, UserX, ChevronDown
} from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// API Configuration
const API_BASE_URL = 'https://a2itserver.onrender.com/api/v1'

// Helper Functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0).replace('BDT', '৳')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    return 'Invalid Date'
  }
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const getEmployeeName = (employee) => {
  if (!employee) return 'Unknown Employee'
  if (employee.firstName || employee.lastName) {
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
  }
  if (employee.name) return employee.name
  if (employee.employeeName) return employee.employeeName
  return 'Unknown Employee'
}

const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || ''
  if (statusLower.includes('paid') || statusLower.includes('approved')) {
    return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={14} /> }
  } else if (statusLower.includes('pending')) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={14} /> }
  } else if (statusLower.includes('draft')) {
    return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> }
  } else if (statusLower.includes('rejected')) {
    return { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle size={14} /> }
  } else {
    return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> }
  }
}

// PDF Generator Functions
const generateSinglePayrollPDF = async (payroll, employee) => {
  toast.success('PDF generation initiated')
  // PDF generation logic would go here
}

const generateEmployeePayrollPDF = async (employee, payrolls) => {
  toast.success(`Generating PDF for ${getEmployeeName(employee)}`)
  // PDF generation logic would go here
}

export default function PayrollPage() {
  const router = useRouter()
  
  // All states in one place
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeSalaries, setEmployeeSalaries] = useState({})
  const [attendanceData, setAttendanceData] = useState({})
  
  const [loading, setLoading] = useState({
    payrolls: false,
    employees: true,
    action: false,
    calculation: false,
    generate: false,
    accept: false,
    create: false
  })
  
  const [apiConnected, setApiConnected] = useState(false)
  const [isEmployeeView, setIsEmployeeView] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  
  // All modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCalculateModal, setShowCalculateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showMonthYearViewModal, setShowMonthYearViewModal] = useState(false)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [showMonthYearDetails, setShowMonthYearDetails] = useState(false)
  
  const [selectedPayroll, setSelectedPayroll] = useState(null)
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null)
  const [calculationResult, setCalculationResult] = useState(null)
  const [selectedMonthYearForView, setSelectedMonthYearForView] = useState({ month: '', year: '' })
  const [monthYearPayrolls, setMonthYearPayrolls] = useState([])
  const [employeePayrolls, setEmployeePayrolls] = useState([])
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Form states
  const [createForm, setCreateForm] = useState({
    employee: '',
    periodStart: '',
    periodEnd: '',
    status: 'Pending',
    month: '',
    year: '',
    monthlySalary: '',
    basicPay: '',
    presentDays: 0,
    totalWorkingDays: 23,
    deductions: {
      lateDeduction: 0,
      absentDeduction: 0,
      leaveDeduction: 0,
      halfDayDeduction: 0
    },
    earnings: {
      overtime: 0,
      bonus: 0,
      allowance: 0
    },
    netSalary: 0
  })

  const [calculateForm, setCalculateForm] = useState({
    employeeId: '',
    month: '',
    year: '',
    monthlySalary: ''
  })

  const [bulkForm, setBulkForm] = useState({
    month: '',
    year: ''
  })

  const [selectedMonthYear, setSelectedMonthYear] = useState({ month: '', year: '' })
  
  // Stats
  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalPaid: 0,
    totalRejected: 0,
    monthlyExpense: 0
  })

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const initApp = async () => {
      // Check authentication
      const token = getToken()
      if (!token) {
        router.push('/login')
        return
      }
      
      // Set user role
      const adminToken = localStorage.getItem('adminToken')
      const employeeToken = localStorage.getItem('employeeToken')
      
      if (adminToken) {
        setUserRole('admin')
        setIsEmployeeView(false)
      } else if (employeeToken) {
        setUserRole('employee')
        setIsEmployeeView(true)
      }
      
      // Get user info
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          const parsed = JSON.parse(userData)
          setUserName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim())
          setUserId(parsed._id)
          if (employeeToken) setUserId(parsed._id)
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
      
      // Load data
      await checkApiConnection()
      await loadEmployees()
      await loadPayrolls()
    }
    
    initApp()
  }, [])

  // ==================== API FUNCTIONS ====================
  const getToken = () => {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('adminToken') || localStorage.getItem('employeeToken')
    return token?.startsWith('Bearer ') ? token.slice(7) : token
  }

  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    instance.interceptors.request.use((config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.')
          localStorage.clear()
          setTimeout(() => router.push('/login'), 1000)
        }
        return Promise.reject(error)
      }
    )

    return instance
  }

  const API = createApiInstance()

  const checkApiConnection = async () => {
    try {
      const response = await axios.get(API_BASE_URL, { timeout: 5000 })
      if (response.status === 200) {
        setApiConnected(true)
        return true
      }
    } catch (error) {
      setApiConnected(false)
      return false
    }
  }

  // ==================== DATA LOADING ====================
const loadEmployees = async () => {
  setLoading(prev => ({ ...prev, employees: true }))
  try {
    const response = await API.get('/admin/getAll-user')
    let employeesData = []
    
    if (response.data.users && Array.isArray(response.data.users)) {
      employeesData = response.data.users
    } else if (response.data.data && Array.isArray(response.data.data)) {
      employeesData = response.data.data
    } else if (Array.isArray(response.data)) {
      employeesData = response.data
    }
    
    // Filter employees - BE LESS STRICT about status
    const activeEmployees = employeesData.filter(emp => {
      if (!emp) return false
      if (!emp._id) return false
      
      // Accept employees regardless of status for now
      return true
    })
    
    setEmployees(activeEmployees)
    
    // Create salary map
    const salaryMap = {}
    activeEmployees.forEach(emp => {
      if (emp._id) {
        salaryMap[emp._id] = {
          salary: emp.salary || emp.monthlySalary || emp.basicSalary || 23000,
          designation: emp.designation || emp.role || emp.position || 'Employee',
          department: emp.department || emp.departmentName || 'General',
          name: getEmployeeName(emp),
          email: emp.email || 'N/A',
          phone: emp.phone || emp.mobile || 'N/A',
          employeeId: emp.employeeId || emp.employeeCode || emp._id.substring(0, 8)
        }
      }
    })
    
    setEmployeeSalaries(salaryMap)
    
  } catch (error) {
    console.error('Failed to load employees:', error)
    toast.error('Failed to load employees')
  } finally {
    setLoading(prev => ({ ...prev, employees: false }))
  }
}

const loadPayrolls = async () => {
  setLoading(prev => ({ ...prev, payrolls: true }))
  try {
    let endpoint = '/payroll/all'
    if (isEmployeeView && userId) {
      endpoint = `/payroll/employee/${userId}`
    }
    
    const response = await API.get(endpoint)
    
    console.log('✅ Payroll API Response Structure:', {
      status: response.data.status,
      data: response.data.data,
      payrolls: response.data.data?.payrolls,
      isDataArray: Array.isArray(response.data.data),
      isDataObject: typeof response.data.data === 'object',
      keys: response.data.data ? Object.keys(response.data.data) : []
    })
    
    let apiPayrolls = []
    
    // Deep nested check for payrolls array
    if (response.data) {
      // CASE 1: Direct array response
      if (Array.isArray(response.data)) {
        apiPayrolls = response.data
      } 
      // CASE 2: { status: 'success', data: { payrolls: [...] } }
      else if (response.data.data && response.data.data.payrolls && Array.isArray(response.data.data.payrolls)) {
        apiPayrolls = response.data.data.payrolls
      }
      // CASE 3: { status: 'success', data: [...] }
      else if (response.data.data && Array.isArray(response.data.data)) {
        apiPayrolls = response.data.data
      }
      // CASE 4: { payrolls: [...] }
      else if (response.data.payrolls && Array.isArray(response.data.payrolls)) {
        apiPayrolls = response.data.payrolls
      }
      // CASE 5: For employee endpoint - { status: 'success', data: { payrolls: [...] } }
      else if (response.data.data && Array.isArray(response.data.data.payrolls)) {
        apiPayrolls = response.data.data.payrolls
      }
      // CASE 6: Try to find any array in the response
      else {
        // Search for any array in the entire response object
        const findArrayInObject = (obj) => {
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key]
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              const found = findArrayInObject(obj[key])
              if (found) return found
            }
          }
          return []
        }
        
        apiPayrolls = findArrayInObject(response.data)
      }
    }
    
    console.log('✅ Extracted Payrolls Count:', apiPayrolls.length)
    console.log('✅ First Payroll Object:', apiPayrolls[0])
    
    // Sort by date
    apiPayrolls.sort((a, b) => {
      return new Date(b.createdAt || b.createdDate || Date.now()) - 
             new Date(a.createdAt || a.createdDate || Date.now())
    })
    
    setPayrolls(apiPayrolls)
    calculateStats(apiPayrolls)
    
  } catch (error) {
    console.error('❌ Error loading payrolls:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    })
    toast.error('Failed to load payrolls')
  } finally {
    setLoading(prev => ({ ...prev, payrolls: false }))
  }
}

  const calculateStats = (payrollData) => {
    const totalPayroll = payrollData.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0)
    }, 0)
    
    const totalDeductions = payrollData.reduce((sum, p) => {
      return sum + (p.deductions?.total || 0)
    }, 0)
    
    const totalProcessed = payrollData.length
    const totalPending = payrollData.filter(p => p.status === 'Pending').length
    const totalPaid = payrollData.filter(p => p.status === 'Paid').length
    const totalRejected = payrollData.filter(p => p.status === 'Rejected').length
    
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const currentMonthPayrolls = payrollData.filter(p => {
      try {
        return p.month === currentMonth && p.year === currentYear
      } catch (e) {
        return false
      }
    })
    
    const monthlyExpense = currentMonthPayrolls.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0)
    }, 0)
    
    setStats({
      totalPayroll,
      totalDeductions,
      totalEmployees: employees.length,
      totalProcessed,
      totalPending,
      totalPaid,
      totalRejected,
      monthlyExpense
    })
  }

  // ==================== PAYROLL CALCULATION FUNCTIONS ====================
  const calculateDailyRate = (monthlySalary) => {
    return Math.round(monthlySalary / 23)
  }

  const getCurrentMonthYear = () => {
    const now = new Date()
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }
  }

  // ==================== PAYROLL CRUD OPERATIONS ====================
const handleCreatePayroll = async (e) => {
  e.preventDefault()
  
  if (!createForm.employee || !createForm.month || !createForm.year) {
    toast.error('Please select employee, month and year')
    return
  }
  
  setLoading(prev => ({ ...prev, create: true }))
  
  try {
    const selectedEmployee = employees.find(emp => emp._id === createForm.employee)
    if (!selectedEmployee) {
      toast.error('Selected employee not found')
      setLoading(prev => ({ ...prev, create: false }))
      return
    }
    
    const salaryData = employeeSalaries[createForm.employee] || {}
    const monthlySalary = salaryData.salary || 30000
    
    const month = parseInt(createForm.month)
    const year = parseInt(createForm.year)
    
    const periodStart = new Date(year, month - 1, 1)
    const periodEnd = new Date(year, month, 0)
    
    // Use backend API to create payroll
    const payrollData = {
      employeeId: createForm.employee,
      month: month,
      year: year,
      monthlySalary: monthlySalary,
      overtime: createForm.earnings.overtime || 0,
      bonus: createForm.earnings.bonus || 0,
      allowance: createForm.earnings.allowance || 0,
      notes: `Manual payroll for ${monthNames[month - 1]} ${year}`
    }
    
    console.log('Creating payroll with data:', payrollData)
    
    const response = await API.post('/payroll/create', payrollData)
    
    console.log('Create payroll response:', response.data)
    
    if (response.data.status === 'success') {
      // Show success with warnings if any
      if (response.data.warnings && response.data.warnings.length > 0) {
        toast.success(
          `✅ Payroll created successfully! ${response.data.warnings.join(' ')}`,
          { 
            autoClose: 5000,
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        )
      } else {
        toast.success('✅ Payroll created successfully in MongoDB!', {
          autoClose: 3000,
          position: "top-right"
        })
      }
      
      // Refresh payrolls
      await loadPayrolls()
      
      // Reset form
      setCreateForm({
        employee: '',
        periodStart: '',
        periodEnd: '',
        status: 'Pending',
        month: '',
        year: '',
        monthlySalary: '',
        basicPay: '',
        presentDays: 0,
        totalWorkingDays: 23,
        deductions: {
          lateDeduction: 0,
          absentDeduction: 0,
          leaveDeduction: 0,
          halfDayDeduction: 0
        },
        earnings: {
          overtime: 0,
          bonus: 0,
          allowance: 0
        },
        netSalary: 0
      })
      
      setShowCreateModal(false)
      
    } else {
      // Handle special case: Net payable is 0
      if (response.data.message?.includes('Net payable amount is 0') || 
          response.data.message?.includes('Salary would be 0')) {
        
        toast.error(
          `❌ Cannot create payroll. Net payable amount would be 0 BDT.`,
          { 
            autoClose: 6000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
          }
        )
        
        // Show calculation details in calculate modal
        if (response.data.data) {
          setCalculationResult(response.data.data)
          setShowCreateModal(false)
          setTimeout(() => {
            setShowCalculateModal(true)
          }, 500)
        }
        
        setLoading(prev => ({ ...prev, create: false }))
        return
      }
      
      // Handle deduction cap warning
      if (response.data.message?.includes('Deductions capped') || 
          response.data.message?.includes('safety rules')) {
        
        toast.warning(
          `⚠️ ${response.data.message}`,
          { 
            autoClose: 5000,
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        )
        
        // Still refresh payrolls if created with warning
        await loadPayrolls()
        setShowCreateModal(false)
        setLoading(prev => ({ ...prev, create: false }))
        return
      }
      
      // Other errors
      throw new Error(response.data.message || 'Failed to create payroll')
    }
    
  } catch (error) {
    console.error('Create payroll error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    })
    
    let errorMessage = error.message || 'Failed to create payroll'
    
    // Extract error message from response
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    // Special error handling for specific cases
    if (errorMessage.includes('Payroll already exists')) {
      toast.error('❌ Payroll already exists for this employee and month!', {
        autoClose: 5000,
        position: "top-center"
      })
    } else if (errorMessage.includes('validation failed')) {
      toast.error('❌ Validation error. Please check all fields.', {
        autoClose: 5000,
        position: "top-center"
      })
    } else if (errorMessage.includes('Employee not found')) {
      toast.error('❌ Employee not found in system.', {
        autoClose: 5000,
        position: "top-center"
      })
    } else if (errorMessage.includes('negative') || errorMessage.includes('minimum allowed')) {
      toast.error('❌ Deductions exceed earnings. Cannot create negative payroll.', {
        autoClose: 6000,
        position: "top-center",
        style: { background: '#fef2f2', color: '#dc2626' }
      })
    } else {
      toast.error(`❌ Error: ${errorMessage}`, {
        autoClose: 5000,
        position: "top-center"
      })
    }
    
    // Show error details in console for debugging
    if (error.response?.data?.error) {
      console.error('Server error details:', error.response.data.error)
    }
    
  } finally {
    setLoading(prev => ({ ...prev, create: false }))
  }
}

  const handleCalculatePayroll = async (e) => {
    e.preventDefault()
    
    if (!calculateForm.employeeId || !calculateForm.month || !calculateForm.year) {
      toast.error('Please select employee, month and year')
      return
    }
    
    setLoading(prev => ({ ...prev, calculation: true }))
    
    try {
      const employee = employees.find(e => e._id === calculateForm.employeeId)
      if (!employee) {
        throw new Error('Employee not found')
      }
      
      const salaryData = employeeSalaries[calculateForm.employeeId] || {}
      const monthlySalary = salaryData.salary || calculateForm.monthlySalary || 30000
      
      const month = parseInt(calculateForm.month)
      const year = parseInt(calculateForm.year)
      
      // Call backend calculation API
      const response = await API.post('/payroll/calculate', {
        employeeId: calculateForm.employeeId,
        month: month,
        year: year,
        monthlySalary: monthlySalary
      })
      
      if (response.data.status === 'success') {
        const calculation = response.data.data
        
        setCalculationResult({
          employeeDetails: {
            name: getEmployeeName(employee),
            employeeId: employee.employeeId || employee._id,
            department: calculation.employeeDetails?.department || salaryData.department,
            designation: calculation.employeeDetails?.designation || salaryData.designation
          },
          month: month,
          year: year,
          periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
          periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
          monthlySalary: monthlySalary,
          basicPay: calculation.calculations?.basicPay || 0,
          dailyRate: calculation.rates?.dailyRate || 0,
          hourlyRate: calculation.rates?.hourlyRate || 0,
          presentDays: calculation.attendance?.presentDays || 0,
          totalWorkingDays: calculation.attendance?.totalWorkingDays || 23,
          attendancePercentage: calculation.attendance?.attendancePercentage || 0,
          attendanceBreakdown: calculation.attendance || {},
          earnings: {
            basicPay: calculation.calculations?.basicPay || 0,
            overtime: calculation.calculations?.overtime?.amount || 0,
            bonus: calculation.calculations?.bonus || 0,
            allowance: calculation.calculations?.allowance || 0,
            total: calculation.calculations?.totals?.earnings || 0
          },
          deductions: {
            lateDeduction: calculation.calculations?.deductions?.late?.amount || 0,
            absentDeduction: calculation.calculations?.deductions?.absent?.amount || 0,
            leaveDeduction: calculation.calculations?.deductions?.leave?.amount || 0,
            halfDayDeduction: calculation.calculations?.deductions?.halfDay?.amount || 0,
            total: calculation.calculations?.deductions?.total || 0,
            deductionRules: {
              lateRule: "3 days late = 1 day salary deduction",
              absentRule: "1 day absent = 1 day salary deduction",
              leaveRule: "1 day leave = 1 day salary deduction",
              halfDayRule: "1 half day = 0.5 day salary deduction"
            }
          },
          summary: {
            grossEarnings: calculation.calculations?.totals?.earnings || 0,
            totalDeductions: calculation.calculations?.deductions?.total || 0,
            netPayable: calculation.calculations?.totals?.netPayable || 0
          },
          calculationData: calculation
        })
        
        // Update calculate form with salary
        setCalculateForm(prev => ({
          ...prev,
          monthlySalary: monthlySalary
        }))
        
        toast.success(`Payroll calculated for ${monthNames[month - 1]} ${year}!`)
      } else {
        throw new Error(response.data.message || 'Calculation failed')
      }
      
    } catch (error) {
      console.error('Calculate payroll error:', error)
      toast.error(error.message || 'Failed to calculate payroll')
    } finally {
      setLoading(prev => ({ ...prev, calculation: false }))
    }
  }

  const handleBulkGenerate = async (e) => {
    e.preventDefault()
    
    if (!bulkForm.month || !bulkForm.year) {
      toast.error('Please select month and year')
      return
    }
    
    setLoading(prev => ({ ...prev, generate: true }))
    
    try {
      const month = parseInt(bulkForm.month)
      const year = parseInt(bulkForm.year)
      
      const response = await API.post('/payroll/bulk-generate', {
        month: month,
        year: year
      })
      
      if (response.data.status === 'success') {
        toast.success(`Created ${response.data.data?.summary?.created || 0} payrolls for ${monthNames[month - 1]} ${year}`)
        
        // Refresh payrolls
        await loadPayrolls()
        
        setShowBulkModal(false)
        setBulkForm({ month: '', year: '' })
      } else {
        throw new Error(response.data.message || 'Bulk generation failed')
      }
      
    } catch (error) {
      console.error('Bulk generate error:', error)
      toast.error(error.message || 'Bulk generation failed')
    } finally {
      setLoading(prev => ({ ...prev, generate: false }))
    }
  }

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Change status to ${status}?`)) return
    
    setLoading(prev => ({ ...prev, action: true }))
    
    try {
      const response = await API.put(`/payroll/update-payroll/${id}/status`, { status })
      
      if (response.data.status === 'success') {
        // Update local state
        const updatedPayrolls = payrolls.map(p => 
          p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
        )
        
        setPayrolls(updatedPayrolls)
        toast.success('Status updated successfully in MongoDB!')
      } else {
        throw new Error(response.data.message || 'Update failed')
      }
      
    } catch (error) {
      console.error('Update status error:', error)
      toast.error(error.message || 'Failed to update status')
    } finally {
      setLoading(prev => ({ ...prev, action: false }))
    }
  }

  const handleDeletePayroll = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll?')) return
    
    setLoading(prev => ({ ...prev, action: true }))
    
    try {
      const response = await API.delete(`/payroll/delete-payroll/${id}`)
      
      if (response.data.status === 'success') {
        const updatedPayrolls = payrolls.filter(p => p._id !== id)
        setPayrolls(updatedPayrolls)
        
        toast.success('Payroll deleted successfully from MongoDB!')
      } else {
        throw new Error(response.data.message || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete payroll')
    } finally {
      setLoading(prev => ({ ...prev, action: false }))
    }
  }

  const handleAutoGenerateFromCalculation = async () => {
    if (!calculationResult) {
      toast.error('No calculation result available')
      return
    }
    
    setLoading(prev => ({ ...prev, action: true }))
    
    try {
      const employeeId = calculateForm.employeeId
      const month = calculationResult.month
      const year = calculationResult.year
      
      const employee = employees.find(e => e._id === employeeId)
      if (!employee) throw new Error('Employee not found')
      
      const payrollData = {
        employeeId: employeeId,
        month: month,
        year: year,
        monthlySalary: calculationResult.monthlySalary,
        overtime: calculationResult.earnings.overtime || 0,
        bonus: calculationResult.earnings.bonus || 0,
        allowance: calculationResult.earnings.allowance || 0,
        notes: `Auto-generated from calculation for ${monthNames[month - 1]} ${year}`
      }
      
      const response = await API.post('/payroll/create', payrollData)
      
      if (response.data.status === 'success') {
        toast.success('Payroll created successfully in MongoDB!')
        
        // Refresh payrolls
        await loadPayrolls()
        
        setCalculationResult(null)
        setShowCalculateModal(false)
      } else {
        throw new Error(response.data.message || 'Creation failed')
      }
      
    } catch (error) {
      console.error('Auto generate error:', error)
      toast.error(error.message || 'Failed to auto-generate payroll')
    } finally {
      setLoading(prev => ({ ...prev, action: false }))
    }
  }

  // ==================== HELPER FUNCTIONS ====================
  const handleRefresh = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }))
    await checkApiConnection()
    await loadEmployees()
    await loadPayrolls()
    setLoading(prev => ({ ...prev, payrolls: false }))
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear()
      toast.success('Logged out successfully')
      setTimeout(() => router.push('/login'), 1000)
    }
  }

  const handleEmployeeSelect = (employeeId) => {
    if (!employeeId) return
    
    const salaryData = employeeSalaries[employeeId] || {}
    const monthlySalary = salaryData.salary || 30000
    
    const currentMonthYear = getCurrentMonthYear()
    const month = currentMonthYear.month
    const year = currentMonthYear.year
    
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    const dailyRate = calculateDailyRate(monthlySalary)
    
    setCreateForm(prev => ({
      ...prev,
      employee: employeeId,
      month: month.toString(),
      year: year.toString(),
      periodStart: firstDay.toISOString().split('T')[0],
      periodEnd: lastDay.toISOString().split('T')[0],
      monthlySalary: monthlySalary,
      dailyRate: dailyRate
    }))
    
    toast.success(`Employee selected. Salary: ${formatCurrency(monthlySalary)}`)
  }

  // ==================== VIEW FUNCTIONS ====================
  const loadEmployeeSpecificPayrolls = async (employeeId) => {
    if (!employeeId) return []
    try {
      const response = await API.get(`/payroll/employee/${employeeId}`)
      return response.data.payrolls || response.data.data || []
    } catch (error) {
      console.error('Error loading employee payrolls:', error)
      return []
    }
  }

  const handleViewEmployeePayrolls = async (employee) => {
    setSelectedEmployeeForPayroll(employee)
    const filtered = await loadEmployeeSpecificPayrolls(employee._id)
    setEmployeePayrolls(filtered)
    setShowEmployeeDetails(true)
  }

  const handleViewMonthYearPayrolls = async (month, year) => {
    try {
      const response = await API.get('/payroll/all', {
        params: { month, year }
      })
      
      let filtered = []
      if (response.data) {
        if (Array.isArray(response.data)) {
          filtered = response.data
        } else if (response.data.payrolls && Array.isArray(response.data.payrolls)) {
          filtered = response.data.payrolls
        } else if (response.data.data && Array.isArray(response.data.data)) {
          filtered = response.data.data
        }
      }
      
      setMonthYearPayrolls(filtered)
      setSelectedMonthYearForView({ month, year })
      setShowMonthYearDetails(true)
    } catch (error) {
      console.error('Error loading month year payrolls:', error)
      toast.error('Failed to load payrolls')
    }
  }

  // ==================== RENDER FUNCTIONS ====================
  const filteredPayrolls = payrolls.filter(payroll => {
    const employeeName = getEmployeeName(employees.find(e => e._id === payroll.employee) || {}).toLowerCase()
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || payroll.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage)

  // ==================== RENDER MODALS ====================
  const renderCreateModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Payroll (MongoDB)</h2>
              <p className="text-gray-500 text-sm mt-1">Auto-calculated with 23 Days Month</p>
            </div>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleCreatePayroll} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
            <select
              value={createForm.employee}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">Choose an employee</option>
              {employees.map((emp) => {
                const salaryData = employeeSalaries[emp._id] || {}
                return (
                  <option key={emp._id} value={emp._id}>
                    {getEmployeeName(emp)} • {formatCurrency(salaryData.salary || 30000)}/month
                  </option>
                )
              })}
            </select>
          </div>

          {createForm.employee && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                <select
                  value={createForm.month}
                  onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Month</option>
                  {monthNames.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <select
                  value={createForm.year}
                  onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </div>
            </div>
          )}

         {createForm.employee && createForm.month && createForm.year && (
  <div className="space-y-3">
    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
      <h4 className="text-sm font-medium text-blue-700 mb-2">Payroll Information</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white rounded-lg border">
          <span className="text-xs text-gray-600">Monthly Salary</span>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(createForm.monthlySalary)}</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border">
          <span className="text-xs text-gray-600">Month</span>
          <p className="text-lg font-bold text-gray-900">{monthNames[parseInt(createForm.month) - 1]}</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border">
          <span className="text-xs text-gray-600">Year</span>
          <p className="text-lg font-bold text-gray-900">{createForm.year}</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border">
          <span className="text-xs text-gray-600">Daily Rate</span>
          <p className="text-sm font-medium text-gray-900">{formatCurrency(calculateDailyRate(createForm.monthlySalary))}</p>
        </div>
      </div>
      
      {/* SAFETY RULES INFO */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-start">
          <Shield className="text-green-600 mr-2 mt-0.5" size={16} />
          <div>
            <p className="text-xs font-medium text-green-700">Safety Rules Applied:</p>
            <ul className="text-xs text-green-600 mt-1 list-disc list-inside">
              <li>Total deductions cannot exceed monthly salary</li>
              <li>Net payable amount minimum 0 BDT</li>
              <li>Negative payrolls are not allowed</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* WARNING FOR ZERO SALARY */}
      <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertTriangle className="text-yellow-600 mr-2 mt-0.5" size={16} />
          <div>
            <p className="text-xs font-medium text-yellow-700">Important Note:</p>
            <p className="text-xs text-yellow-600 mt-1">
              If employee has too many absences/lates/leaves, salary may be 0 BDT.
              In that case, payroll cannot be created.
            </p>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        Note: Calculation will be done automatically by backend with 23 days basis
      </p>
    </div>
  </div>
)}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Overtime Amount</label>
              <input type="number" min="0" value={createForm.earnings.overtime} onChange={(e) => setCreateForm(prev => ({ ...prev, earnings: { ...prev.earnings, overtime: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Bonus</label>
              <input type="number" min="0" value={createForm.earnings.bonus} onChange={(e) => setCreateForm(prev => ({ ...prev, earnings: { ...prev.earnings, bonus: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Allowance</label>
              <input type="number" min="0" value={createForm.earnings.allowance} onChange={(e) => setCreateForm(prev => ({ ...prev, earnings: { ...prev.earnings, allowance: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg" />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => setShowCreateModal(false)} disabled={loading.create} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading.create} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2">
              {loading.create ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle size={18} />}
              {loading.create ? 'Creating...' : 'Create in MongoDB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderCalculateModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Calculate Payroll</h2>
              <p className="text-gray-500 text-sm mt-1">Auto-calculate with 23 days month</p>
            </div>
            <button onClick={() => { setShowCalculateModal(false); setCalculationResult(null) }} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleCalculatePayroll} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
            <select value={calculateForm.employeeId} onChange={(e) => setCalculateForm({ ...calculateForm, employeeId: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
              <option value="">Choose an employee</option>
              {employees.map((emp) => {
                const salaryData = employeeSalaries[emp._id] || {}
                return (
                  <option key={emp._id} value={emp._id}>
                    {getEmployeeName(emp)} • {formatCurrency(salaryData.salary || 30000)}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <select value={calculateForm.month} onChange={(e) => setCalculateForm({ ...calculateForm, month: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="">Select Month</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <select value={calculateForm.year} onChange={(e) => setCalculateForm({ ...calculateForm, year: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return <option key={year} value={year}>{year}</option>
                })}
              </select>
            </div>
          </div>

          {calculateForm.employeeId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary (Optional)</label>
              <input type="number" value={calculateForm.monthlySalary} onChange={(e) => setCalculateForm({ ...calculateForm, monthlySalary: e.target.value })} placeholder="Enter salary or leave empty for default" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
          )}

          {calculationResult && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-3">Calculation Result</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee:</span>
                  <span className="text-sm font-medium">{calculationResult.employeeDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Month:</span>
                  <span className="text-sm font-medium">{monthNames[calculationResult.month - 1]} {calculationResult.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Salary:</span>
                  <span className="text-sm font-medium">{formatCurrency(calculationResult.monthlySalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Present Days:</span>
                  <span className="text-sm font-medium">{calculationResult.presentDays}/23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Payable:</span>
                  <span className="text-lg font-bold text-purple-600">{formatCurrency(calculationResult.summary.netPayable)}</span>
                </div>
                <button type="button" onClick={handleAutoGenerateFromCalculation} disabled={loading.action} className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90">
                  Generate Payroll from Calculation
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => { setShowCalculateModal(false); setCalculationResult(null) }} disabled={loading.calculation} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading.calculation} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2">
              {loading.calculation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator size={18} />}
              {loading.calculation ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderBulkModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Generate</h2>
              <p className="text-gray-500 text-sm mt-1">Generate for all employees</p>
            </div>
            <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleBulkGenerate} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <select value={bulkForm.month} onChange={(e) => setBulkForm({ ...bulkForm, month: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="">Select Month</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <select value={bulkForm.year} onChange={(e) => setBulkForm({ ...bulkForm, year: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return <option key={year} value={year}>{year}</option>
                })}
              </select>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Employees:</p>
              <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                Payrolls will be generated in MongoDB with auto calculations (23 days basis)
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => setShowBulkModal(false)} disabled={loading.generate} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading.generate} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2">
              {loading.generate ? <Loader2 className="w-5 h-5 animate-spin" /> : <UsersIcon size={18} />}
              {loading.generate ? 'Generating...' : 'Generate All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderDetailsModal = () => (
    selectedPayroll && (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
                <p className="text-gray-500 text-sm mt-1">Complete breakdown from MongoDB</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => {
                  const employee = employees.find(e => e._id === selectedPayroll.employee)
                  generateSinglePayrollPDF(selectedPayroll, employee || {})
                }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1">
                  <Download size={14} /> PDF
                </button>
                <button onClick={() => { setShowDetailsModal(false); setSelectedPayroll(null) }} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {getEmployeeName(employees.find(e => e._id === selectedPayroll.employee) || {}).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedPayroll.employeeName || getEmployeeName(employees.find(e => e._id === selectedPayroll.employee) || selectedPayroll)}
                </h3>
                <p className="text-gray-600">
                  {formatDate(selectedPayroll.periodStart)} - {formatDate(selectedPayroll.periodEnd)}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPayroll.department} • {selectedPayroll.designation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Monthly Salary</span>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(selectedPayroll.salaryDetails?.monthlySalary || selectedPayroll.monthlySalary || 30000)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Basic Pay</span>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0)}
                </p>
              </div>
            </div>

            {selectedPayroll.attendance && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendance (23 Days)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Present</span>
                    <p className="text-lg font-bold text-green-600">{selectedPayroll.attendance.presentDays || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Working Days</span>
                    <p className="text-lg font-bold text-blue-600">{selectedPayroll.attendance.totalWorkingDays || 23}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Attendance %</span>
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round(((selectedPayroll.attendance.presentDays || 0) / (selectedPayroll.attendance.totalWorkingDays || 23)) * 100)}%
                    </p>
                  </div>
                </div>
                {selectedPayroll.attendance.absentDays > 0 && (
                  <p className="text-xs text-red-600 mt-2">Absent: {selectedPayroll.attendance.absentDays} days</p>
                )}
              </div>
            )}

            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Earnings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Pay:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0)}
                  </span>
                </div>
                {selectedPayroll.earnings?.overtime?.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overtime:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(selectedPayroll.earnings.overtime.amount)}
                    </span>
                  </div>
                )}
                {selectedPayroll.earnings?.bonus?.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus:</span>
                    <span className="font-medium text-yellow-600">
                      {formatCurrency(selectedPayroll.earnings.bonus.amount)}
                    </span>
                  </div>
                )}
                {selectedPayroll.earnings?.allowance?.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Allowance:</span>
                    <span className="font-medium text-indigo-600">
                      {formatCurrency(selectedPayroll.earnings.allowance.amount)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Total Earnings:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(selectedPayroll.earnings?.total || selectedPayroll.summary?.grossEarnings || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedPayroll.deductions?.total > 0 && (
              <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deductions</h3>
                <div className="space-y-2">
                  {selectedPayroll.deductions?.lateDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Late Deduction:</span>
                      <span className="font-medium text-rose-600">
                        {formatCurrency(selectedPayroll.deductions.lateDeduction)}
                      </span>
                    </div>
                  )}
                  {selectedPayroll.deductions?.absentDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Absent Deduction:</span>
                      <span className="font-medium text-rose-600">
                        {formatCurrency(selectedPayroll.deductions.absentDeduction)}
                      </span>
                    </div>
                  )}
                  {selectedPayroll.deductions?.leaveDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Leave Deduction:</span>
                      <span className="font-medium text-rose-600">
                        {formatCurrency(selectedPayroll.deductions.leaveDeduction)}
                      </span>
                    </div>
                  )}
                  {selectedPayroll.deductions?.halfDayDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Half Day Deduction:</span>
                      <span className="font-medium text-rose-600">
                        {formatCurrency(selectedPayroll.deductions.halfDayDeduction)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-rose-200">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Total Deductions:</span>
                      <span className="text-lg font-bold text-rose-600">
                        {formatCurrency(selectedPayroll.deductions?.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Gross Earnings:</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(selectedPayroll.summary?.grossEarnings || selectedPayroll.earnings?.total || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Deductions:</span>
                  <span className="font-medium text-rose-600">
                    {formatCurrency(selectedPayroll.summary?.totalDeductions || selectedPayroll.deductions?.total || 0)}
                  </span>
                </div>
                <div className="pt-3 border-t border-purple-200">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-gray-900">Net Payable:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(selectedPayroll.summary?.netPayable || selectedPayroll.netSalary || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button onClick={() => { setShowDetailsModal(false); setSelectedPayroll(null) }} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                Close
              </button>
              {selectedPayroll.status === 'Pending' && userRole === 'admin' && (
                <button onClick={() => { handleUpdateStatus(selectedPayroll._id, 'Paid'); setShowDetailsModal(false) }} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90">
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  )

  const renderEmployeeDetailsModal = () => (
    selectedEmployeeForPayroll && (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getEmployeeName(selectedEmployeeForPayroll).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {getEmployeeName(selectedEmployeeForPayroll)}'s Payrolls
                  </h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>ID: {selectedEmployeeForPayroll.employeeId || selectedEmployeeForPayroll._id?.substring(0, 8)}</span>
                    <span>•</span>
                    <span>Salary: {formatCurrency(employeeSalaries[selectedEmployeeForPayroll._id]?.salary || 30000)}/month</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => generateEmployeePayrollPDF(selectedEmployeeForPayroll, employeePayrolls)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1">
                  <Download size={14} /> Export PDF
                </button>
                <button onClick={() => { setShowEmployeeDetails(false); setSelectedEmployeeForPayroll(null) }} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={() => {
                setCreateForm(prev => ({ ...prev, employee: selectedEmployeeForPayroll._id }))
                setShowEmployeeDetails(false)
                setShowCreateModal(true)
              }} className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium">
                <PlusCircle size={16} /> Create New Payroll
              </button>
              <button onClick={() => {
                setCalculateForm(prev => ({ ...prev, employeeId: selectedEmployeeForPayroll._id }))
                setShowEmployeeDetails(false)
                setShowCalculateModal(true)
              }} className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium">
                <Calculator size={16} /> Calculate Payroll
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payroll History (MongoDB)</h3>
              
              {employeePayrolls.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records</h3>
                    <p className="text-gray-500 text-sm">This employee has no payroll records in MongoDB yet.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Basic Pay</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Deductions</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Payable</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeePayrolls.map((payroll, index) => {
                        const statusColor = getStatusColor(payroll.status)
                        return (
                          <tr key={payroll._id || index} className="border-b hover:bg-white">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {monthNames[payroll.month - 1]} {payroll.year}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-bold text-blue-600">
                                {formatCurrency(payroll.earnings?.basicPay || payroll.basicPay || 0)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-bold text-red-600">
                                {formatCurrency(payroll.deductions?.total || 0)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-lg font-bold text-purple-600">
                                {formatCurrency(payroll.summary?.netPayable || payroll.netSalary || 0)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                                {statusColor.icon}
                                <span className="ml-2">{payroll.status}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setSelectedPayroll(payroll); setShowEmployeeDetails(false); setShowDetailsModal(true) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                  <Eye size={16} />
                                </button>
                                {payroll.status === 'Pending' && userRole === 'admin' && (
                                  <button onClick={() => handleUpdateStatus(payroll._id, 'Paid')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                                {userRole === 'admin' && (
                                  <button onClick={() => handleDeletePayroll(payroll._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  )

  const renderMonthYearViewModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Month & Year</h2>
              <p className="text-gray-500 text-sm mt-1">Filter payrolls by month and year</p>
            </div>
            <button onClick={() => setShowMonthYearViewModal(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <select value={selectedMonthYear.month} onChange={(e) => setSelectedMonthYear(prev => ({ ...prev, month: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="">Select Month</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <select value={selectedMonthYear.year} onChange={(e) => setSelectedMonthYear(prev => ({ ...prev, year: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return <option key={year} value={year}>{year}</option>
                })}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button onClick={() => setShowMonthYearViewModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => {
              if (selectedMonthYear.month && selectedMonthYear.year) {
                handleViewMonthYearPayrolls(parseInt(selectedMonthYear.month), parseInt(selectedMonthYear.year))
                setShowMonthYearViewModal(false)
              } else {
                toast.error('Please select month and year')
              }
            }} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2">
              <Eye size={18} /> View Payrolls
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMonthYearDetailsModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Payroll Summary - {monthNames[selectedMonthYearForView.month - 1]} {selectedMonthYearForView.year}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing {monthYearPayrolls.length} payrolls from MongoDB
              </p>
            </div>
            <button onClick={() => { setShowMonthYearDetails(false); setSelectedMonthYearForView({ month: '', year: '' }) }} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-600">
                {[...new Set(monthYearPayrolls.map(p => p.employee))].length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthYearPayrolls.reduce((sum, p) => sum + (p.summary?.netPayable || p.netSalary || 0), 0))}
              </p>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-xl border border-red-100">
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthYearPayrolls.reduce((sum, p) => sum + (p.deductions?.total || 0), 0))}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-purple-600">
                {monthYearPayrolls.filter(p => p.status === 'Paid').length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Basic Pay</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Payable</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthYearPayrolls.map((payroll, index) => {
                  const statusColor = getStatusColor(payroll.status)
                  const employee = employees.find(e => e._id === payroll.employee)
                  return (
                    <tr key={payroll._id || index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                            {getEmployeeName(employee || payroll).charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{getEmployeeName(employee || payroll)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {monthNames[payroll.month - 1]} {payroll.year}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-blue-600">
                          {formatCurrency(payroll.earnings?.basicPay || payroll.basicPay || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-purple-600">
                          {formatCurrency(payroll.summary?.netPayable || payroll.netSalary || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                          {statusColor.icon}
                          <span className="ml-1">{payroll.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelectedPayroll(payroll); setShowMonthYearDetails(false); setShowDetailsModal(true) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye size={14} />
                          </button>
                          {payroll.status === 'Pending' && userRole === 'admin' && (
                            <button onClick={() => handleUpdateStatus(payroll._id, 'Paid')} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Payroll Management System
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <p className="text-gray-600 text-sm">Dashboard</p>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {userRole === 'admin' ? 'Admin Access' : 'Employee Access'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {userName}
                </span>
                {apiConnected && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                    <Server size={10} /> MongoDB Connected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
              <Home size={18} /> Dashboard
            </button>
            <button onClick={handleRefresh} disabled={loading.payrolls} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium disabled:opacity-50">
              <RefreshCw size={18} className={loading.payrolls ? 'animate-spin' : ''} /> Refresh
            </button>
            {userRole === 'admin' && (
              <button onClick={() => toast.info('PDF Export feature coming soon')} className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium">
                <DownloadCloud size={18} /> Export All PDF
              </button>
            )}
            <button onClick={handleLogout} className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Employee View Banner */}
        {isEmployeeView && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  <UserCheck size={20} /> Employee Payroll View
                </h3>
                <p className="text-sm text-blue-600 mt-1">You can view and accept your payrolls here</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">Employee ID: {userId?.substring(0, 8)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <Wallet size={16} /> {isEmployeeView ? 'My Total Payroll' : 'Total Payroll'}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalPayroll)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <Receipt size={16} /> {isEmployeeView ? 'My Deductions' : 'Total Deductions'}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalDeductions || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Receipt className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <Clock size={16} /> {isEmployeeView ? 'Pending' : 'Pending'}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {stats.totalPending}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <Banknote size={16} /> {isEmployeeView ? 'My Monthly' : 'Monthly Expense'}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.monthlyExpense)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart className="text-white" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Month-Year Summary (Admin only) */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Month-Year Wise Summary</h2>
              <p className="text-gray-500 text-sm mt-1">Grouped by month with employee details</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => {
                if (employees.length > 0) {
                  handleViewEmployeePayrolls(employees[0])
                } else {
                  toast.error('No employees found')
                }
              }} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl px-5 py-2.5 hover:opacity-90 flex items-center gap-2">
                <Users size={18} /> Employee-wise View
              </button>
              <button onClick={() => setShowMonthYearViewModal(true)} className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2">
                <CalendarRange size={18} /> View All Months
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => {
              const month = new Date().getMonth() + 1 - index
              const year = new Date().getFullYear()
              const monthPayrolls = payrolls.filter(p => 
                p.month === month && p.year === year
              )
              
              if (monthPayrolls.length === 0) return null
              
              return (
                <div key={index} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {monthNames[month - 1]} {year}
                    </h3>
                    <button onClick={() => handleViewMonthYearPayrolls(month, year)} className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                      View Details
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">Employees</p>
                      <p className="font-medium">{[...new Set(monthPayrolls.map(p => p.employee))].length}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">Payrolls</p>
                      <p className="font-medium">{monthPayrolls.length}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(monthPayrolls.reduce((sum, p) => sum + (p.summary?.netPayable || 0), 0))}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">Status</p>
                      <p className={`font-medium ${monthPayrolls.every(p => p.status === 'Paid') ? 'text-green-600' : 'text-yellow-600'}`}>
                        {monthPayrolls.every(p => p.status === 'Paid') ? 'All Paid' : 'Mixed'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action Cards (Admin only) */}
      {userRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold">Create Payroll</p>
              <p className="text-sm opacity-90">Save to MongoDB</p>
            </div>
            <PlusCircle size={24} />
          </button>

          <button onClick={() => setShowCalculateModal(true)} disabled={loading.employees} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between disabled:opacity-50">
            <div className="text-left">
              <p className="font-semibold">Calculate</p>
              <p className="text-sm opacity-90">Auto calculation</p>
            </div>
            {loading.employees ? <Loader2 size={24} className="animate-spin" /> : <Calculator size={24} />}
          </button>

          <button onClick={() => setShowBulkModal(true)} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold">Bulk Generate</p>
              <p className="text-sm opacity-90">All employees</p>
            </div>
            <UsersIcon size={24} />
          </button>

          <button onClick={() => setShowMonthYearViewModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold">Month View</p>
              <p className="text-sm opacity-90">Month-wise summary</p>
            </div>
            <CalendarRange size={24} />
          </button>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEmployeeView ? 'My Payrolls' : 'Payroll Records'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing {paginatedPayrolls.length} of {filteredPayrolls.length} records from MongoDB
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder={isEmployeeView ? "Search your payrolls..." : "Search employees..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full sm:w-64" />
              </div>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading.payrolls ? (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading payroll data from MongoDB...</p>
            </div>
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records found</h3>
              <p className="text-gray-500 text-sm mb-6">
                {searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filter' : 'Get started by creating your first payroll'}
              </p>
              {userRole === 'admin' && (
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium">
                  Create Payroll
                </button>
              )}
            </div>
          </div>
          ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Basic Pay</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Deductions</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Net Payable</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPayrolls.map((payroll, index) => {
                    const statusColor = getStatusColor(payroll.status)
                    const netPayable = payroll.summary?.netPayable || payroll.netSalary || 0
                    const basicPay = payroll.earnings?.basicPay || payroll.basicPay || 0
                    const deductions = payroll.deductions?.total || 0
                    const employee = employees.find(e => e._id === payroll.employee)
                    
                    return (
                      <tr key={payroll._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                              {getEmployeeName(employee || payroll).charAt(0).toUpperCase() || 'E'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {payroll.employeeName || getEmployeeName(employee || payroll)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payroll.department || employee?.department} • {payroll.designation || employee?.designation}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600">
                              {monthNames[payroll.month - 1]} {payroll.year}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-blue-600">{formatCurrency(basicPay)}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-red-600">{formatCurrency(deductions)}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xl font-bold text-purple-600">{formatCurrency(netPayable)}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.icon}
                            <span className="ml-2">{payroll.status}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedPayroll(payroll); setShowDetailsModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
                              <Eye size={16} />
                            </button>

                            {userRole === 'admin' && (
                              <>
                                {employee && (
                                  <button onClick={() => handleViewEmployeePayrolls(employee)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View Employee">
                                    <User size={16} />
                                  </button>
                                )}
                                
                                {payroll.status === 'Pending' && (
                                  <button onClick={() => handleUpdateStatus(payroll._id, 'Paid')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Mark as Paid">
                                    <CheckCircle size={16} />
                                  </button>
                                )}

                                <button onClick={() => handleDeletePayroll(payroll._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages} • {filteredPayrolls.length} records
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-2 rounded-lg ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                          {pageNum}
                        </button>
                      )
                    })}

                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Render Modals */}
      {showCreateModal && renderCreateModal()}
      {showCalculateModal && renderCalculateModal()}
      {showBulkModal && renderBulkModal()}
      {showDetailsModal && renderDetailsModal()}
      {showEmployeeDetails && renderEmployeeDetailsModal()}
      {showMonthYearViewModal && renderMonthYearViewModal()}
      {showMonthYearDetails && renderMonthYearDetailsModal()}

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Payroll Management System • All data stored in MongoDB • Version 1.0</p>
        <p className="mt-1">
          {apiConnected ? (
            <span className="text-green-600 flex items-center justify-center gap-1">
              <Server size={12} /> MongoDB Connected
            </span>
          ) : (
            <span className="text-red-600 flex items-center justify-center gap-1">
              <WifiOff size={12} /> Offline Mode
            </span>
          )}
        </p>
      </div>
    </div>
  )
}