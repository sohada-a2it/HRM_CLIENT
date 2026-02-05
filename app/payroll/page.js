"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import {
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  FileText,
  TrendingUp,
  Banknote,
  Calculator,
  UserCheck,
  Search,
  BarChart3,
  Shield,
  CreditCard,
  Receipt,
  Building,
  BarChart,
  PieChart,
  UserPlus,
  Loader2,
  AlertTriangle,
  Users as UsersIcon,
  CalendarDays,
  Briefcase,
  Settings,
  Bell,
  User,
  MoreVertical,
  Printer,
  Mail,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Target,
  Server,
  Wifi,
  Check,
  ExternalLink,
  CheckSquare,
  UserX,
  FileSpreadsheet,
  DownloadCloud,
  Percent,
  FileDown,
  CalendarRange,
  FilterX,
  Wallet,
  EyeOff,
  FileBarChart,
  Grid,
  List,
  Layers,
  Info
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function page() {
// PayrollPage.jsx এর state section এ যোগ করুন
const [pdfLoading, setPdfLoading] = useState(false);
const [selectedForPDF, setSelectedForPDF] = useState(null);
const [showPDFPreview, setShowPDFPreview] = useState(false);

// PDF generation functions
const generateSinglePayrollPDF = async (payrollId) => {
  setPdfLoading(true);
  
  try {
    // Load payroll details
    const payroll = payrolls.find(p => p._id === payrollId);
    if (!payroll) {
      toast.error('Payroll not found');
      return;
    }
    
    // Create payroll details object for PDF
    const payrollDetails = {
      payrollId: payroll._id,
      employee: {
        name: payroll.employeeName || getEmployeeName(payroll),
        employeeId: payroll.employeeId || 'N/A',
        department: payroll.department || 'General',
        designation: payroll.designation || 'Employee'
      },
      salary: {
        monthly: payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0,
        daily: Math.round((payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0) / 23)
      },
      earnings: {
        basicPay: payroll.earnings?.basicPay || 0,
        overtime: payroll.earnings?.overtime?.amount || 0,
        bonus: payroll.earnings?.bonus?.amount || 0,
        allowance: payroll.earnings?.allowance?.amount || 0,
        total: payroll.summary?.grossEarnings || 0
      },
      deductions: {
        late: payroll.deductions?.lateDeduction || 0,
        absent: payroll.deductions?.absentDeduction || 0,
        leave: payroll.deductions?.leaveDeduction || 0,
        halfDay: payroll.deductions?.halfDayDeduction || 0,
        allowanceDeduction: payroll.deductions?.allowanceDeduction || 0,
        total: payroll.deductions?.total || 0
      },
      attendance: {
        totalDays: payroll.attendance?.totalWorkingDays || 23,
        presentDays: payroll.attendance?.presentDays || 0,
        absentDays: payroll.attendance?.absentDays || 0,
        attendancePercentage: payroll.attendance?.attendancePercentage || 0
      },
      summary: {
        netPayable: payroll.summary?.netPayable || 0,
        grossEarnings: payroll.summary?.grossEarnings || 0,
        totalDeductions: payroll.deductions?.total || 0
      },
      status: {
        current: payroll.status || 'Pending',
        employeeAccepted: payroll.employeeAccepted?.accepted || false,
        acceptedAt: payroll.employeeAccepted?.acceptedAt
      },
      period: {
        formattedPeriod: `${getMonthName(payroll.month)} ${payroll.year}`
      },
      mealDeduction: payroll.mealSystemData?.mealDeduction || null,
      onsiteBenefits: payroll.onsiteBenefitsDetails || null,
      foodCostDetails: payroll.foodCostDetails || null
    };

    // Import and use PDF generator
    const { PayrollPDFDocument } = await import('@/components/PayrollPDFDocument');
    PayrollPDFDocument(payrollDetails);
    
    toast.success('PDF generated successfully!');
    
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF');
  } finally {
    setPdfLoading(false);
  }
};

const generateFilteredPayrollsPDF = async () => {
  if (filteredPayrolls.length === 0) {
    toast.error('No payrolls to generate PDF');
    return;
  }
  
  setPdfLoading(true);
  
  try {
    // Prepare payroll details for all filtered payrolls
    const payrollDetails = filteredPayrolls.map(payroll => {
      return {
        payrollId: payroll._id,
        employee: {
          name: payroll.employeeName || getEmployeeName(payroll),
          employeeId: payroll.employeeId || 'N/A',
          department: payroll.department || 'General',
          designation: payroll.designation || 'Employee'
        },
        salary: {
          monthly: payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0,
          daily: Math.round((payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0) / 23)
        },
        earnings: {
          basicPay: payroll.earnings?.basicPay || 0,
          overtime: payroll.earnings?.overtime?.amount || 0,
          bonus: payroll.earnings?.bonus?.amount || 0,
          allowance: payroll.earnings?.allowance?.amount || 0,
          total: payroll.summary?.grossEarnings || 0
        },
        deductions: {
          late: payroll.deductions?.lateDeduction || 0,
          absent: payroll.deductions?.absentDeduction || 0,
          leave: payroll.deductions?.leaveDeduction || 0,
          halfDay: payroll.deductions?.halfDayDeduction || 0,
          allowanceDeduction: payroll.deductions?.allowanceDeduction || 0,
          total: payroll.deductions?.total || 0
        },
        attendance: {
          totalDays: payroll.attendance?.totalWorkingDays || 23,
          presentDays: payroll.attendance?.presentDays || 0,
          absentDays: payroll.attendance?.absentDays || 0,
          attendancePercentage: payroll.attendance?.attendancePercentage || 0
        },
        summary: {
          netPayable: payroll.summary?.netPayable || 0,
          grossEarnings: payroll.summary?.grossEarnings || 0,
          totalDeductions: payroll.deductions?.total || 0
        },
        status: {
          current: payroll.status || 'Pending',
          employeeAccepted: payroll.employeeAccepted?.accepted || false,
          acceptedAt: payroll.employeeAccepted?.acceptedAt
        },
        period: {
          formattedPeriod: `${getMonthName(payroll.month)} ${payroll.year}`
        },
        mealDeduction: payroll.mealSystemData?.mealDeduction || null,
        onsiteBenefits: payroll.onsiteBenefitsDetails || null,
        foodCostDetails: payroll.foodCostDetails || null
      };
    });

    // Prepare filters info
    const filters = {
      searchTerm,
      month: selectedMonth,
      year: selectedYear,
      status: selectedStatus,
      department: selectedDepartment,
      startDate: new Date(selectedYear, selectedMonth === 'all' ? 0 : selectedMonth - 1, 1).toLocaleDateString(),
      endDate: new Date(selectedYear, selectedMonth === 'all' ? 11 : selectedMonth - 1, 
        selectedMonth === 'all' ? 31 : new Date(selectedYear, selectedMonth, 0).getDate()
      ).toLocaleDateString()
    };

    // Import and use PDF generator
    const { generateFilteredPayrollsPDF } = await import('../utils/pdfGenerator');
    generateFilteredPayrollsPDF(payrollDetails, filters);
    
    toast.success(`PDF generated for ${filteredPayrolls.length} payrolls!`);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF');
  } finally {
    setPdfLoading(false);
  }
};

const generateAllPayrollsPDF = async () => {
  if (payrolls.length === 0) {
    toast.error('No payrolls to generate PDF');
    return;
  }
  
  setPdfLoading(true);
  
  try {
    // Prepare all payroll details
    const payrollDetails = payrolls.map(payroll => {
      return {
        payrollId: payroll._id,
        employee: {
          name: payroll.employeeName || getEmployeeName(payroll),
          employeeId: payroll.employeeId || 'N/A',
          department: payroll.department || 'General',
          designation: payroll.designation || 'Employee'
        },
        salary: {
          monthly: payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0,
          daily: Math.round((payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0) / 23)
        },
        earnings: {
          basicPay: payroll.earnings?.basicPay || 0,
          overtime: payroll.earnings?.overtime?.amount || 0,
          bonus: payroll.earnings?.bonus?.amount || 0,
          allowance: payroll.earnings?.allowance?.amount || 0,
          total: payroll.summary?.grossEarnings || 0
        },
        deductions: {
          late: payroll.deductions?.lateDeduction || 0,
          absent: payroll.deductions?.absentDeduction || 0,
          leave: payroll.deductions?.leaveDeduction || 0,
          halfDay: payroll.deductions?.halfDayDeduction || 0,
          allowanceDeduction: payroll.deductions?.allowanceDeduction || 0,
          total: payroll.deductions?.total || 0
        },
        attendance: {
          totalDays: payroll.attendance?.totalWorkingDays || 23,
          presentDays: payroll.attendance?.presentDays || 0,
          absentDays: payroll.attendance?.absentDays || 0,
          attendancePercentage: payroll.attendance?.attendancePercentage || 0
        },
        summary: {
          netPayable: payroll.summary?.netPayable || 0,
          grossEarnings: payroll.summary?.grossEarnings || 0,
          totalDeductions: payroll.deductions?.total || 0
        },
        status: {
          current: payroll.status || 'Pending',
          employeeAccepted: payroll.employeeAccepted?.accepted || false,
          acceptedAt: payroll.employeeAccepted?.acceptedAt
        },
        period: {
          formattedPeriod: `${getMonthName(payroll.month)} ${payroll.year}`
        },
        mealDeduction: payroll.mealSystemData?.mealDeduction || null,
        onsiteBenefits: payroll.onsiteBenefitsDetails || null,
        foodCostDetails: payroll.foodCostDetails || null
      };
    });

    // Import and use PDF generator
    const { generateMultiplePayrollsPDF } = await import('../utils/pdfGenerator');
    generateMultiplePayrollsPDF(payrollDetails, 'All Payrolls Report');
    
    toast.success(`PDF generated for all ${payrolls.length} payrolls!`);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF');
  } finally {
    setPdfLoading(false);
  }
};

// PDF Preview Modal
const renderPDFPreviewModal = () => {
  if (!showPDFPreview || !selectedForPDF) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generate PDF</h2>
              <p className="text-gray-500 text-sm mt-1">
                {selectedForPDF.employeeName} • {getMonthName(selectedForPDF.month)} {selectedForPDF.year}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowPDFPreview(false);
                setSelectedForPDF(null);
              }} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">PDF Generation Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => generateSinglePayrollPDF(selectedForPDF._id)}
                disabled={pdfLoading}
                className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">Single Payroll</div>
                    <div className="text-sm text-blue-600">Individual slip</div>
                  </div>
                </div>
              </button>

              <button
                onClick={generateFilteredPayrollsPDF}
                disabled={pdfLoading || filteredPayrolls.length === 0}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-400 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Filter className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-green-700">Filtered Results</div>
                    <div className="text-sm text-green-600">{filteredPayrolls.length} payrolls</div>
                  </div>
                </div>
              </button>

              <button
                onClick={generateAllPayrollsPDF}
                disabled={pdfLoading || payrolls.length === 0}
                className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-400 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileBarChart className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-purple-700">All Payrolls</div>
                    <div className="text-sm text-purple-600">{payrolls.length} total</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Preview Section */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-600">Employee Name</div>
                  <div className="font-medium">{selectedForPDF.employeeName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Employee ID</div>
                  <div className="font-medium">{selectedForPDF.employeeId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Period</div>
                  <div className="font-medium">{getMonthName(selectedForPDF.month)} {selectedForPDF.year}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Net Payable</div>
                  <div className="font-bold text-green-600">{formatCurrency(selectedForPDF.summary?.netPayable || 0)}</div>
                </div>
              </div>

              {/* Special Features Indicators */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex flex-wrap gap-2">
                  {selectedForPDF.mealSystemData?.mealDeduction?.amount > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      Meal Deduction: {formatCurrency(selectedForPDF.mealSystemData.mealDeduction.amount)}
                    </span>
                  )}
                  {selectedForPDF.onsiteBenefitsDetails && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                      Onsite Benefits
                    </span>
                  )}
                  {selectedForPDF.foodCostDetails?.included && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Food Cost Included
                    </span>
                  )}
                  {selectedForPDF.employeeAccepted?.accepted && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      Accepted by Employee
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                setShowPDFPreview(false);
                setSelectedForPDF(null);
              }}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              onClick={() => generateSinglePayrollPDF(selectedForPDF._id)}
              disabled={pdfLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pdfLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown size={18} />
                  Generate PDF Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
  const router = useRouter();
  // State এর শুরুতে এই variables গুলো যোগ করুন
const [showEditModal, setShowEditModal] = useState(false);
const [editForm, setEditForm] = useState({
  payrollId: "",
  monthlySalary: "",
  overtime: "0",
  bonus: "0",
  allowance: "0",
  dailyMealRate: "0",
  manualMealAmount: "0",
  mealDeduction: "0",
  mealDeductionType: "none",
  notes: ""
});
const [editingPayroll, setEditingPayroll] = useState(null);
const [allPayrollsAdmin, setAllPayrollsAdmin] = useState([]);
const [showAdminAllModal, setShowAdminAllModal] = useState(false);
const [adminViewFilters, setAdminViewFilters] = useState({
  view: 'detailed', // detailed, summary, grouped
  sort: 'month_desc'
});
  // State Management
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeSalaries, setEmployeeSalaries] = useState({});
  const [loading, setLoading] = useState({
    payrolls: false,
    employees: true,
    action: false,
    calculation: false,
    generate: false,
    accept: false,
    create: false,
    myPayrolls: false,
    allView: false
  });
  const [employeeMealData, setEmployeeMealData] = useState({});
  
// State variables
// State variable update
const [mealSystemData, setMealSystemData] = useState({
  hasMonthlySubscription: false,
  dailyMealDays: 0,
  monthlyFoodCost: 0,
  activeSubscribers: 0,
  deductionPerEmployee: 0,
  averageDailyCost: 0,
  foodCostDays: 0,
  mealDetails: {}
});
// Show create modal function এ যোগ করুন
const handleOpenCreateModal = () => {
  // Reset meal data
  setMealSystemData(null); // বা empty object
  
  setCreateForm({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthlySalary: "",
    overtime: "0",
    bonus: "0",
    allowance: "0",
    notes: "",
    dailyMealRate: "0",
    manualMealAmount: "0"
  });
  
  setShowCreateModal(true);
};
  const [apiConnected, setApiConnected] = useState(false);
  const [isEmployeeView, setIsEmployeeView] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
const [previewData, setPreviewData] = useState(null);
const [isPreviewing, setIsPreviewing] = useState(false);
  // নতুন state variables
const [employeeDetailsModal, setEmployeeDetailsModal] = useState(false);
const [selectedEmployeePayroll, setSelectedEmployeePayroll] = useState(null);
const [employeePayrollDetails, setEmployeePayrollDetails] = useState(null);
const [acceptingPayroll, setAcceptingPayroll] = useState(false);
  // NEW STATE: Employee acceptance status
  const [employeeAcceptedStatus, setEmployeeAcceptedStatus] = useState({});
  
  // NEW STATE: Real-time updates
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAllPayrollsModal, setShowAllPayrollsModal] = useState(false);
  
  // Selected Items
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  
  // All Payrolls View
  const [allPayrollsView, setAllPayrollsView] = useState([]);
  const [viewType, setViewType] = useState('table'); // table, grid, grouped
  const [groupedBy, setGroupedBy] = useState('month'); // month, department, employee
  
  // Forms
  const [createForm, setCreateForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthlySalary: "",
    overtime: "0",
    bonus: "0",
    allowance: "0",
    notes: "",
     dailyMealRate: "0", // নতুন field
  manualMealAmount: "0" // নতুন field
  });
  
// State এর শুরুতে calculateForm update করুন:
const [calculateForm, setCalculateForm] = useState({
  employeeId: "",
  month: new Date().getMonth() + 1, // Current month
  year: new Date().getFullYear(), // Current year
  monthlySalary: ""
});
  
  const [bulkForm, setBulkForm] = useState({
    month: "",
    year: ""
  });
  
  // Stats
  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalPaid: 0,
    totalRejected: 0,
    monthlyExpense: 0,
    totalNetPayable: 0,
    totalDeductions: 0,
    averageSalary: 0
  });

  // ==================== HELPER FUNCTIONS ====================
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://a2itserver.onrender.com/api/v1';

  // ✅ নতুন ফাংশন: Employee select হলে meal data load করবে
const handleEmployeeSelect = (e) => {
  const empId = e.target.value;
  console.log('Employee selected:', empId);
  setCreateForm({ ...createForm, employeeId: empId });
  
  // Reset meal data first
  setMealSystemData({
    hasMonthlySubscription: false,
    dailyMealDays: 0,
    monthlyFoodCost: 0,
    activeSubscribers: 0,
    deductionPerEmployee: 0,
    averageDailyCost: 0,
    foodCostDays: 0,
    mealDetails: {}
  });
  
  // Then load new meal data
  if (empId && createForm.month && createForm.year) {
    console.log('Loading meal data for new employee...');
    setTimeout(() => {
      loadEmployeeMealData(empId, createForm.month, createForm.year);
    }, 100);
  }
};

// ✅ useEffect for auto-loading meal data
useEffect(() => {
  const loadMealDataIfNeeded = async () => {
    if (showCreateModal && createForm.employeeId && createForm.month && createForm.year) {
      console.log('🔄 Auto-loading meal data...');
      await loadEmployeeMealData(createForm.employeeId, createForm.month, createForm.year);
    }
  };
  
  loadMealDataIfNeeded();
}, [showCreateModal, createForm.employeeId, createForm.month, createForm.year]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0).replace('BDT', '৳');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMonthName = (monthNumber) => {
    return monthNames[monthNumber - 1] || '';
  };

  const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown Employee';
    if (typeof employee === 'string') return employee;
    if (employee.firstName || employee.lastName) {
      return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    }
    if (employee.name) return employee.name;
    if (employee.employeeName) return employee.employeeName;
    if (employee.employee && employee.employee.firstName) {
      return `${employee.employee.firstName || ''} ${employee.employee.lastName || ''}`.trim();
    }
    return 'Unknown Employee';
  };

  const getStatusColor = (status) => {
    if (!status) return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> };
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid') || statusLower.includes('approved')) {
      return { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: <CheckCircle size={14} /> 
      };
    } else if (statusLower.includes('pending')) {
      return { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: <Clock size={14} /> 
      };
    } else if (statusLower.includes('draft')) {
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: <FileText size={14} /> 
      };
    } else if (statusLower.includes('rejected') || statusLower.includes('cancelled')) {
      return { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: <AlertCircle size={14} /> 
      };
    } else {
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: <FileText size={14} /> 
      };
    }
  };


// loadEmployeeMealData ফাংশন আপডেট করুন
const loadEmployeeMealData = async (employeeId, month, year) => {
  try {
    console.log('🔍 Loading meal data for:', { employeeId, month, year });
    
    const response = await apiRequest('GET', `/meal-data/${employeeId}?month=${month}&year=${year}`);
    
    console.log('✅ Meal API Response:', response?.data);
    
    if (response && response.status === 'success') {
      // API থেকে data নিন
      const apiData = response.data;
      
      // সঠিকভাবে hasMonthlySubscription check করুন
      const hasMonthlySubscription = 
        apiData.hasMonthlySubscription === true || 
        apiData.subscriptionPreference === 'monthly' ||
        apiData.mealDetails?.subscriptionPreference === 'monthly' ||
        apiData.subscriptionStatus === 'active';
      
      // Daily meal days সঠিকভাবে নিন
      const dailyMealDays = apiData.dailyMealDays || 
                           apiData.mealDetails?.dailyMeals?.length || 
                           0;
      
      const mealData = {
        hasMonthlySubscription: hasMonthlySubscription,
        dailyMealDays: dailyMealDays,
        monthlyFoodCost: apiData.monthlyFoodCost || 0,
        activeSubscribers: apiData.activeSubscribers || 0,
        deductionPerEmployee: apiData.deductionPerEmployee || 0,
        averageDailyCost: apiData.averageDailyCost || 0,
        foodCostDays: apiData.foodCostDays || 0,
        mealDetails: apiData.mealDetails || {}
      };
      
      console.log('📊 Processed Meal Data:', mealData);
      
      // State update
      setMealSystemData(mealData);
      
      // Toast message - ডিবাগ করার জন্য
      if (hasMonthlySubscription) {
        toast.success(`Monthly subscription loaded: ${formatCurrency(mealData.deductionPerEmployee)} will be auto-deducted`);
      } else if (dailyMealDays > 0) {
        toast.success(`Found ${dailyMealDays} daily meal days for this period`);
      } else {
        toast.info('No meal data found for this period');
      }
      
      return mealData;
      
    } else {
      console.log('⚠️ No meal data found');
      // Reset with empty data
      const emptyData = {
        hasMonthlySubscription: false,
        dailyMealDays: 0,
        monthlyFoodCost: 0,
        activeSubscribers: 0,
        deductionPerEmployee: 0,
        averageDailyCost: 0,
        foodCostDays: 0,
        mealDetails: {}
      };
      setMealSystemData(emptyData);
      return emptyData;
    }
  } catch (error) {
    console.error('❌ Error loading meal data:', error);
    const emptyData = {
      hasMonthlySubscription: false,
      dailyMealDays: 0,
      monthlyFoodCost: 0,
      activeSubscribers: 0,
      deductionPerEmployee: 0,
      averageDailyCost: 0,
      foodCostDays: 0,
      mealDetails: {}
    };
    setMealSystemData(emptyData);
    return emptyData;
  }
};

// Admin Edit Modal function
const renderEditModal = () => {
  if (!showEditModal || !editingPayroll) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Payroll</h2>
              <p className="text-gray-500 text-sm mt-1">
                {editingPayroll.employee?.name || editingPayroll.employeeName} • 
                {editingPayroll.period?.monthName || getMonthName(editingPayroll.month)} {editingPayroll.year}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditingPayroll(null);
                setEditForm({
                  payrollId: "",
                  monthlySalary: "",
                  overtime: "0",
                  bonus: "0",
                  allowance: "0",
                  dailyMealRate: "0",
                  manualMealAmount: "0",
                  mealDeduction: "0",
                  mealDeductionType: "none",
                  notes: ""
                });
              }} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleUpdatePayroll}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Salary (৳) *
                  </label>
                  <input
                    type="number"
                    value={editForm.monthlySalary}
                    onChange={(e) => setEditForm({...editForm, monthlySalary: e.target.value})}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>

              {/* Additional Earnings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Earnings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overtime (৳)</label>
                    <input
                      type="number"
                      value={editForm.overtime}
                      onChange={(e) => setEditForm({...editForm, overtime: e.target.value})}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bonus (৳)</label>
                    <input
                      type="number"
                      value={editForm.bonus}
                      onChange={(e) => setEditForm({...editForm, bonus: e.target.value})}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowance (৳)</label>
                    <input
                      type="number"
                      value={editForm.allowance}
                      onChange={(e) => setEditForm({...editForm, allowance: e.target.value})}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Meal Deduction Section */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Meal Deduction</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deduction Type</label>
                      <select
                        value={editForm.mealDeductionType}
                        onChange={(e) => setEditForm({...editForm, mealDeductionType: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="none">No Meal Deduction</option>
                        <option value="monthly_subscription">Monthly Subscription</option>
                        <option value="daily_meal">Daily Meal</option>
                        <option value="manual_amount">Manual Amount</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Deduction Amount (৳)
                      </label>
                      <input
                        type="number"
                        value={editForm.mealDeduction}
                        onChange={(e) => setEditForm({...editForm, mealDeduction: e.target.value})}
                        min="0"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Payroll Information (Read-only) */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Payroll Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xs text-gray-500">Basic Salary</div>
                  <div className="font-bold">{formatCurrency(editingPayroll.currentValues?.monthlySalary || editingPayroll.salary?.monthly || 0)}</div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xs text-gray-500">Net Payable</div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(editingPayroll.summary?.netPayable || 0)}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xs text-gray-500">Present Days</div>
                  <div className="font-bold">
                    {editingPayroll.attendance?.presentDays || 0}/{editingPayroll.attendance?.totalWorkingDays || 23}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className={`font-medium ${
                    editingPayroll.status?.current === 'Paid' ? 'text-green-600' : 
                    editingPayroll.status?.current === 'Pending' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {editingPayroll.status?.current || 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Changes Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handlePreviewEdit}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calculator size={18} />
                Preview Changes
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPayroll(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading.action}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading.action ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Update Payroll
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
// Admin All Payrolls View Modal
const renderAdminAllModal = () => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Payrolls - Admin View</h2>
              <p className="text-gray-500 text-sm mt-1">
                Total {allPayrollsAdmin.length} payroll records • {employees.length} employees
                {lastUpdated && ` • Last updated: ${formatDate(lastUpdated)}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadAdminAllPayrolls()}
                disabled={loading.allView}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading.allView ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={() => setShowAdminAllModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search employee, department or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
                />
              </div>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Years</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Months</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                {statusOptions.slice(1).map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              
              <select
                value={adminViewFilters.view}
                onChange={(e) => setAdminViewFilters({...adminViewFilters, view: e.target.value})}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="detailed">Detailed View</option>
                <option value="summary">Summary View</option>
                <option value="grouped">Grouped View</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          {adminViewFilters.view === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Total Payable</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(allPayrollsAdmin.reduce((sum, p) => sum + (p.summary?.netPayable || 0), 0))}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <h3 className="text-sm font-medium text-green-700 mb-2">Paid Payrolls</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {allPayrollsAdmin.filter(p => p.status === 'Paid').length}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                <h3 className="text-sm font-medium text-yellow-700 mb-2">Pending Approval</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {allPayrollsAdmin.filter(p => p.status === 'Pending').length}
                </div>
              </div>
            </div>
          )}

          {/* Main Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Details
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {allPayrollsAdmin.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{payroll.employeeName}</div>
                        <div className="text-sm text-gray-500">{payroll.designation}</div>
                        <div className="text-xs text-gray-400">{payroll.employeeId}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">
                        {getMonthName(payroll.month)} {payroll.year}
                      </div>
                      <div className="text-xs text-gray-500">
                        Days: {payroll.attendance?.presentDays || 0}/{payroll.attendance?.totalWorkingDays || 23}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {payroll.department}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-600">Basic: </span>
                          <span className="font-medium">{formatCurrency(payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Net: </span>
                          <span className="font-bold text-green-600">{formatCurrency(payroll.summary?.netPayable || 0)}</span>
                        </div>
                        {payroll.mealSystemData?.mealDeduction?.amount > 0 && (
                          <div className="text-xs text-red-500">
                            Meal: -{formatCurrency(payroll.mealSystemData.mealDeduction.amount)}
                          </div>
                        )}
                        {payroll.onsiteBenefitsDetails?.netEffect && (
                          <div className="text-xs text-amber-600">
                            Onsite: {payroll.onsiteBenefitsDetails.netEffect >= 0 ? '+' : ''}{formatCurrency(payroll.onsiteBenefitsDetails.netEffect)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          payroll.employeeAccepted?.accepted 
                            ? 'bg-green-100 text-green-800' 
                            : payroll.status === 'Paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payroll.employeeAccepted?.accepted ? (
                            <>
                              <CheckCircle size={12} />
                              Accepted
                            </>
                          ) : payroll.status === 'Paid' ? (
                            <>
                              <CheckCircle size={12} />
                              Paid
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              {payroll.status}
                            </>
                          )}
                        </span>
                        
                        {payroll.employeeAccepted?.accepted && (
                          <div className="text-xs text-green-600">
                            ✓ Accepted by employee
                          </div>
                        )}
                        
                        {payroll.payment?.paymentDate && (
                          <div className="text-xs text-gray-500">
                            Paid: {formatDate(payroll.payment.paymentDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2"> 
                        <button
                          onClick={() => {
                            viewEmployeePayrollDetails(payroll._id);
                            setShowAdminAllModal(false);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm transition-colors flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
  onClick={() => {
    setSelectedForPDF(payroll);
    setShowPDFPreview(true);
  }}
  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
  title="Generate PDF"
>
  <FileDown size={18} />
</button>
                        
                        {payroll.status !== 'Paid' && !payroll.employeeAccepted?.accepted && (
                          <button
                            onClick={() => handleOpenEditModal(payroll)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm transition-colors flex items-center gap-1"
                            title="Edit Payroll"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        )}
                        
                        {payroll.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                            className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm transition-colors flex items-center gap-1"
                            title="Mark as Paid"
                          >
                            <CheckCircle size={14} />
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Records</div>
                <div className="text-2xl font-bold text-gray-900">{allPayrollsAdmin.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Payable</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(allPayrollsAdmin.reduce((sum, p) => sum + (p.summary?.netPayable || 0), 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {allPayrollsAdmin.filter(p => p.status === 'Pending').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Paid/Accepted</div>
                <div className="text-2xl font-bold text-blue-600">
                  {allPayrollsAdmin.filter(p => p.status === 'Paid' || p.employeeAccepted?.accepted).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// API functions
// Payroll details view for admin (একই ফরম্যাটে)
const viewPayrollDetailsAdmin = async (payrollId) => {
  console.log('🚀 Opening payroll details for ADMIN, ID:', payrollId);
  
  try {
    setLoading(prev => ({ ...prev, action: true }));
    
    // Find payroll in local state
    const payroll = payrolls.find(p => p._id === payrollId);
    
    if (!payroll) {
      toast.error('Payroll not found in local data');
      return;
    }
    
    console.log('Found payroll for admin:', payroll);
    
    // Create details object from local data (employeeDetailsModal এর মতো একই ফরম্যাটে)
    const payrollDetails = {
      payrollId: payroll._id,
      employee: {
        name: payroll.employeeName || getEmployeeName(payroll),
        employeeId: payroll.employeeId || 'N/A',
        department: payroll.department || 'General',
        designation: payroll.designation || 'Employee'
      },
      salary: {
        monthly: payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0,
        daily: Math.round((payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0) / 23)
      },
      earnings: {
        basicPay: payroll.earnings?.basicPay || 0,
        overtime: payroll.earnings?.overtime?.amount || 0,
        bonus: payroll.earnings?.bonus?.amount || 0,
        allowance: payroll.earnings?.allowance?.amount || 0,
        total: payroll.summary?.grossEarnings || 0
      },
      deductions: {
        late: payroll.deductions?.lateDeduction || 0,
        absent: payroll.deductions?.absentDeduction || 0,
        leave: payroll.deductions?.leaveDeduction || 0,
        halfDay: payroll.deductions?.halfDayDeduction || 0,
        allowanceDeduction: payroll.deductions?.allowanceDeduction || 0,
        total: payroll.deductions?.total || 0
      },
      attendance: {
        totalDays: payroll.attendance?.totalWorkingDays || 23,
        presentDays: payroll.attendance?.presentDays || 0,
        absentDays: payroll.attendance?.absentDays || 0,
        attendancePercentage: payroll.attendance?.attendancePercentage || 0
      },
      summary: {
        netPayable: payroll.summary?.netPayable || 0,
        grossEarnings: payroll.summary?.grossEarnings || 0,
        totalDeductions: payroll.deductions?.total || 0
      },
      status: {
        current: payroll.status || 'Pending',
        employeeAccepted: payroll.employeeAccepted?.accepted || false,
        acceptedAt: payroll.employeeAccepted?.acceptedAt
      },
      period: {
        formattedPeriod: `${getMonthName(payroll.month)} ${payroll.year}`
      },
      // Onsite benefits data
      onsiteBenefits: payroll.onsiteBenefitsDetails ? {
        serviceCharge: payroll.onsiteBenefitsDetails.serviceCharge || 0,
        teaAllowance: payroll.onsiteBenefitsDetails.teaAllowance || 0,
        presentDays: payroll.onsiteBenefitsDetails.presentDays || 0,
        netEffect: payroll.onsiteBenefitsDetails.netEffect || 0,
        calculationNote: payroll.onsiteBenefitsDetails.calculationNote || ''
      } : null,
      // Meal deduction data
      mealDeduction: payroll.mealSystemData?.mealDeduction ? {
        type: payroll.mealSystemData.mealDeduction.type || 'none',
        amount: payroll.mealSystemData.mealDeduction.amount || 0,
        calculationNote: payroll.mealSystemData.mealDeduction.calculationNote || '',
        details: payroll.mealSystemData.mealDeduction.details || {}
      } : null,
      // Food cost details
      foodCostDetails: payroll.foodCostDetails ? {
        included: payroll.foodCostDetails.included || false,
        totalMealCost: payroll.foodCostDetails.totalMealCost || 0,
        fixedDeduction: payroll.foodCostDetails.fixedDeduction || 0,
        calculationNote: payroll.foodCostDetails.calculationNote || ''
      } : null
    };
    
    console.log('✅ Admin Payroll details created:', payrollDetails);
    
    // Set state and open modal (একই modal)
    setEmployeePayrollDetails(payrollDetails);
    setEmployeeDetailsModal(true);
    
    console.log('🎯 Modal opened successfully for admin');
    
  } catch (error) {
    console.error('🚨 Error loading payroll details for admin:', error);
    toast.error('Failed to load payroll details');
  } finally {
    setLoading(prev => ({ ...prev, action: false }));
  }
};
// Load all payrolls for admin
const loadAdminAllPayrolls = async () => {
  try {
    setLoading(prev => ({ ...prev, allView: true }));
    
    const response = await apiRequest('GET', '/payroll/admin/all');
    
    if (response && response.status === 'success') {
      setAllPayrollsAdmin(response.data?.payrolls || []);
      toast.success(`Loaded ${response.data?.payrolls?.length || 0} payroll records`);
    } else {
      setAllPayrollsAdmin([]);
      toast.error('Failed to load payroll data');
    }
  } catch (error) {
    console.error('Error loading admin all payrolls:', error);
    setAllPayrollsAdmin([]);
    toast.error('Error loading payroll data');
  } finally {
    setLoading(prev => ({ ...prev, allView: false }));
  }
};

// Open edit modal
const handleOpenEditModal = async (payroll) => {
  try {
    setLoading(prev => ({ ...prev, action: true }));
    
    // Get payroll details for edit
    const response = await apiRequest('GET', `/payroll/${payroll._id}/edit`);
    
    if (response && response.status === 'success') {
      setEditingPayroll(response.data);
      setEditForm({
        payrollId: response.data.payrollId,
        monthlySalary: response.data.currentValues?.monthlySalary?.toString() || "",
        overtime: response.data.currentValues?.overtime?.toString() || "0",
        bonus: response.data.currentValues?.bonus?.toString() || "0",
        allowance: response.data.currentValues?.allowance?.toString() || "0",
        dailyMealRate: response.data.currentValues?.dailyMealRate?.toString() || "0",
        manualMealAmount: response.data.currentValues?.manualMealAmount?.toString() || "0",
        mealDeduction: response.data.currentValues?.mealDeduction?.toString() || "0",
        mealDeductionType: response.data.currentValues?.mealDeductionType || "none",
        notes: response.data.currentValues?.notes || ""
      });
      setShowEditModal(true);
    } else {
      toast.error('Failed to load payroll for edit');
    }
  } catch (error) {
    console.error('Error opening edit modal:', error);
    toast.error('Error loading payroll data');
  } finally {
    setLoading(prev => ({ ...prev, action: false }));
  }
};

// Update payroll
const handleUpdatePayroll = async (e) => {
  e.preventDefault();
  
  if (!editingPayroll) return;
  
  setLoading(prev => ({ ...prev, action: true }));
  
  try {
    const payload = {
      monthlySalary: parseInt(editForm.monthlySalary) || editingPayroll.currentValues?.monthlySalary,
      overtime: parseInt(editForm.overtime) || 0,
      bonus: parseInt(editForm.bonus) || 0,
      allowance: parseInt(editForm.allowance) || 0,
      dailyMealRate: parseFloat(editForm.dailyMealRate) || 0,
      manualMealAmount: parseFloat(editForm.manualMealAmount) || 0,
      mealDeduction: parseFloat(editForm.mealDeduction) || 0,
      mealDeductionType: editForm.mealDeductionType,
      notes: editForm.notes,
      recalculate: true
    };
    
    const response = await apiRequest('PUT', `/payroll/${editingPayroll.payrollId}/edit`, payload);
    
    if (response && response.status === 'success') {
      toast.success('Payroll updated successfully!');
      
      // Refresh data
      await loadPayrolls();
      await loadAdminAllPayrolls();
      
      // Close modal
      setShowEditModal(false);
      setEditingPayroll(null);
      setEditForm({
        payrollId: "",
        monthlySalary: "",
        overtime: "0",
        bonus: "0",
        allowance: "0",
        dailyMealRate: "0",
        manualMealAmount: "0",
        mealDeduction: "0",
        mealDeductionType: "none",
        notes: ""
      });
    } else {
      toast.error(response?.message || 'Failed to update payroll');
    }
  } catch (error) {
    console.error('Error updating payroll:', error);
    toast.error(error.message || 'Failed to update payroll');
  } finally {
    setLoading(prev => ({ ...prev, action: false }));
  }
};

// Preview edit changes
const handlePreviewEdit = async () => {
  if (!editingPayroll) return;
  
  try {
    // Calculate changes
    const oldSalary = editingPayroll.currentValues?.monthlySalary || 0;
    const newSalary = parseInt(editForm.monthlySalary) || oldSalary;
    
    const changes = {
      salaryChange: newSalary - oldSalary,
      overtimeChange: parseInt(editForm.overtime) - (editingPayroll.currentValues?.overtime || 0),
      bonusChange: parseInt(editForm.bonus) - (editingPayroll.currentValues?.bonus || 0),
      allowanceChange: parseInt(editForm.allowance) - (editingPayroll.currentValues?.allowance || 0),
      mealDeductionChange: parseFloat(editForm.mealDeduction) - (editingPayroll.currentValues?.mealDeduction || 0)
    };
    
    // Show preview
    const previewData = {
      oldValues: {
        monthlySalary: oldSalary,
        netPayable: editingPayroll.summary?.netPayable || 0
      },
      newValues: {
        monthlySalary: newSalary,
        estimatedNetPayable: Math.max(0, (newSalary + 
          parseInt(editForm.overtime) + 
          parseInt(editForm.bonus) + 
          parseInt(editForm.allowance)) - 
          (editingPayroll.deductions?.total || 0) - 
          parseFloat(editForm.mealDeduction))
      },
      changes
    };
    
    // Show preview in modal or alert
    alert(`Preview Changes:\n
    Salary: ${formatCurrency(oldSalary)} → ${formatCurrency(newSalary)} (${changes.salaryChange >= 0 ? '+' : ''}${formatCurrency(changes.salaryChange)})
    Net Payable: ${formatCurrency(previewData.oldValues.netPayable)} → ${formatCurrency(previewData.newValues.estimatedNetPayable)}
    \nChanges will affect the payroll calculation.`);
    
  } catch (error) {
    console.error('Error previewing edit:', error);
    toast.error('Error previewing changes');
  }
};

// নতুন handlePreviewPayroll function
const handlePreviewPayroll = async (e) => {
  e.preventDefault();
  
  if (userRole !== 'admin') {
    toast.error("Only admin can preview payroll");
    return;
  }
  
  // Validate required fields
  if (!createForm.employeeId || !createForm.month || !createForm.year) {
    toast.error('Please select employee, month and year');
    return;
  }
  
  setIsPreviewing(true);
  
  try {
    const employee = employees.find(emp => emp._id === createForm.employeeId);
    if (!employee) {
      toast.error('Selected employee not found');
      return;
    }
    
    const salaryData = employeeSalaries[createForm.employeeId] || {};
    const monthlySalary = parseInt(createForm.monthlySalary) || salaryData.salary || 30000;
    
    // যদি monthlySalary না থাকে তবে error show করুন
    if (!monthlySalary || monthlySalary <= 0) {
      toast.error('Please enter monthly salary');
      setIsPreviewing(false);
      return;
    }
    
    const previewPayload = {
      employeeId: createForm.employeeId,
      month: parseInt(createForm.month),
      year: parseInt(createForm.year),
      monthlySalary: monthlySalary,
      overtime: parseInt(createForm.overtime) || 0,
      bonus: parseInt(createForm.bonus) || 0,
      allowance: parseInt(createForm.allowance) || 0,
      dailyMealRate: parseFloat(createForm.dailyMealRate) || 0,
      manualMealAmount: parseFloat(createForm.manualMealAmount) || 0,
      notes: createForm.notes || `Payroll preview for ${getMonthName(createForm.month)} ${createForm.year}`
    };
    
    console.log('Preview payload:', previewPayload);
    
    const response = await apiRequest('POST', '/preview', previewPayload);
    
    if (response && response.status === 'success') {
      setPreviewData({
        ...response.data,
        employee: {
          name: getEmployeeName(employee),
          employeeId: employee.employeeId || 'N/A',
          department: employee.department || 'General'
        },
        period: {
          month: createForm.month,
          year: createForm.year,
          monthName: getMonthName(createForm.month)
        },
        salary: {
          monthly: monthlySalary,
          dailyRate: Math.round(monthlySalary / 23)
        }
      });
      
      setShowPreviewModal(true);
      
      toast.success('Payroll calculation preview generated', {
        icon: '📊',
        duration: 3000,
      });
    } else {
      throw new Error(response?.message || 'Preview failed');
    }
    
  } catch (error) {
    console.error('Preview payroll error:', error);
    toast.error(error.message || 'Failed to generate preview');
  } finally {
    setIsPreviewing(false);
  }
};
// viewEmployeePayrollDetails function-এ
const viewEmployeePayrollDetails = async (payrollId) => {
  console.log('🚀 Opening payroll details for ID:', payrollId);
  
  try {
    setLoading(prev => ({ ...prev, action: true }));
    
    // Find payroll in local state
    const payroll = payrolls.find(p => p._id === payrollId);
    
    if (!payroll) {
      toast.error('Payroll not found in local data');
      return;
    }
    
    console.log('Found payroll:', payroll);
    
    // Create details object from local data
    const payrollDetails = {
      payrollId: payroll._id,
      employee: {
        name: payroll.employeeName || getEmployeeName(payroll),
        employeeId: payroll.employeeId || 'N/A',
        department: payroll.department || 'General',
        designation: payroll.designation || 'Employee'
      },
      salary: {
        monthly: payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0,
        daily: Math.round((payroll.salaryDetails?.monthlySalary || payroll.earnings?.basicPay || 0) / 23)
      },
      earnings: {
        basicPay: payroll.earnings?.basicPay || 0,
        overtime: payroll.earnings?.overtime?.amount || 0,
        bonus: payroll.earnings?.bonus?.amount || 0,
        allowance: payroll.earnings?.allowance?.amount || 0,
        total: payroll.summary?.grossEarnings || 0
      },
      deductions: {
        late: payroll.deductions?.lateDeduction || 0,
        absent: payroll.deductions?.absentDeduction || 0,
        leave: payroll.deductions?.leaveDeduction || 0,
        halfDay: payroll.deductions?.halfDayDeduction || 0,
        allowanceDeduction: payroll.deductions?.allowanceDeduction || 0,
        total: payroll.deductions?.total || 0
      },
      attendance: {
        totalDays: payroll.attendance?.totalWorkingDays || 23,
        presentDays: payroll.attendance?.presentDays || 0,
        absentDays: payroll.attendance?.absentDays || 0,
        attendancePercentage: payroll.attendance?.attendancePercentage || 0
      },
      summary: {
        netPayable: payroll.summary?.netPayable || 0,
        grossEarnings: payroll.summary?.grossEarnings || 0,
        totalDeductions: payroll.deductions?.total || 0
      },
      status: {
        current: payroll.status || 'Pending',
        employeeAccepted: payroll.employeeAccepted?.accepted || false,
        acceptedAt: payroll.employeeAccepted?.acceptedAt
      },
      period: {
        formattedPeriod: `${getMonthName(payroll.month)} ${payroll.year}`
      },
      // ✅ Onsite benefits data
      onsiteBenefits: payroll.onsiteBenefitsDetails ? {
        serviceCharge: payroll.onsiteBenefitsDetails.serviceCharge || 0,
        teaAllowance: payroll.onsiteBenefitsDetails.teaAllowance || 0,
        presentDays: payroll.onsiteBenefitsDetails.presentDays || 0,
        netEffect: payroll.onsiteBenefitsDetails.netEffect || 0,
        calculationNote: payroll.onsiteBenefitsDetails.calculationNote || ''
      } : null,
      // ✅ Meal deduction data
      mealDeduction: payroll.mealSystemData?.mealDeduction ? {
        type: payroll.mealSystemData.mealDeduction.type || 'none',
        amount: payroll.mealSystemData.mealDeduction.amount || 0,
        calculationNote: payroll.mealSystemData.mealDeduction.calculationNote || '',
        details: payroll.mealSystemData.mealDeduction.details || {}
      } : null,
      // ✅ Food cost details
      foodCostDetails: payroll.foodCostDetails ? {
        included: payroll.foodCostDetails.included || false,
        totalMealCost: payroll.foodCostDetails.totalMealCost || 0,
        fixedDeduction: payroll.foodCostDetails.fixedDeduction || 0,
        calculationNote: payroll.foodCostDetails.calculationNote || ''
      } : null
    };
    
    console.log('✅ Payroll details created:', payrollDetails);
    
    // Set state and open modal
    setEmployeePayrollDetails(payrollDetails);
    setEmployeeDetailsModal(true);
    
    console.log('🎯 Modal opened successfully');
    
  } catch (error) {
    console.error('🚨 Error loading payroll details:', error);
    toast.error('Failed to load payroll details');
  } finally {
    setLoading(prev => ({ ...prev, action: false }));
  }
};
const renderEmployeeDetailsModal = () => {
  if (!employeeDetailsModal || !employeePayrollDetails) return null;
  
  const { 
    employee, 
    salary, 
    earnings, 
    deductions, 
    attendance, 
    summary, 
    status, 
    period,
    onsiteBenefits,
    mealDeduction, // ✅ নতুন field add করুন
    foodCostDetails // ✅ Food cost details field add করুন
  } = employeePayrollDetails;
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
              <p className="text-gray-500 text-sm mt-1">
                {period.formattedPeriod} • {employee.name}
                {onsiteBenefits?.netEffect && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Onsite Employee
                  </span>
                )}
                {mealDeduction?.amount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    Meal Deduction Applied
                  </span>
                )}
                {foodCostDetails?.included && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Food Cost Included
                  </span>
                )}
              </p>
            </div>
            <button 
              onClick={() => {
                setEmployeeDetailsModal(false);
                setEmployeePayrollDetails(null);
              }} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Employee Info</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-600">Name:</span> {employee.name}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">ID:</span> {employee.employeeId}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Department:</span> {employee.department}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Work Type:</span> 
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    {onsiteBenefits ? 'Onsite' : 'Office'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <h3 className="text-sm font-medium text-green-700 mb-2">Salary Summary</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-600">Monthly:</span> {formatCurrency(salary.monthly)}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Daily:</span> {formatCurrency(salary.daily)}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Net Payable:</span> 
                  <span className="font-bold text-green-600 ml-2">
                    {formatCurrency(summary.netPayable)}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <h3 className="text-sm font-medium text-purple-700 mb-2">Status</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-600">Current:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    status.current === 'Paid' || status.employeeAccepted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status.current}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Employee Accepted:</span> 
                  <span className={`ml-2 ${status.employeeAccepted ? 'text-green-600' : 'text-yellow-600'}`}>
                    {status.employeeAccepted ? '✓ Yes' : '✗ No'}
                  </span>
                </p>
                {status.acceptedAt && (
                  <p className="text-sm">
                    <span className="text-gray-600">Accepted on:</span> 
                    <span className="ml-2">{formatDate(status.acceptedAt)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Food Cost Details Section (যদি থাকে) */}
          {foodCostDetails && foodCostDetails.included && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                <DollarSign size={16} /> Food Cost Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg border border-green-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Meal Cost</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(foodCostDetails.totalMealCost || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Monthly food expenses
                  </p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Fixed Deduction</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(foodCostDetails.fixedDeduction || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Employee contribution
                  </p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Calculation</span>
                    <span className="text-xs font-medium text-gray-700">
                      {foodCostDetails.calculationNote || 'Standard rate'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Meal Deduction Section (যদি থাকে) */}
          {mealDeduction && mealDeduction.amount > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
              <h3 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} /> Meal Deduction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg border border-red-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="font-bold text-red-600 capitalize">
                      {mealDeduction.type?.replace('_', ' ') || 'Meal'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {mealDeduction.type === 'monthly_subscription' ? 'Monthly Subscription' : 'Daily Meal'}
                  </p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-red-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(mealDeduction.amount || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Fixed deduction
                  </p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-red-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 mr-2">Calculation:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {mealDeduction.calculationNote || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
              
              {mealDeduction.details && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <h4 className="text-xs font-medium text-red-600 mb-2">Details:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {mealDeduction.details.totalMonthlyFoodCost > 0 && (
                      <div>
                        <span className="text-gray-600">Food Cost: </span>
                        <span>{formatCurrency(mealDeduction.details.totalMonthlyFoodCost)}</span>
                      </div>
                    )}
                    {mealDeduction.details.activeSubscribers > 0 && (
                      <div>
                        <span className="text-gray-600">Subscribers: </span>
                        <span>{mealDeduction.details.activeSubscribers}</span>
                      </div>
                    )}
                    {mealDeduction.details.foodCostDays > 0 && (
                      <div>
                        <span className="text-gray-600">Food Days: </span>
                        <span>{mealDeduction.details.foodCostDays}</span>
                      </div>
                    )}
                    {mealDeduction.details.averageDailyCost > 0 && (
                      <div>
                        <span className="text-gray-600">Avg Daily: </span>
                        <span>{formatCurrency(mealDeduction.details.averageDailyCost)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onsite Benefits Section */}
          {onsiteBenefits && onsiteBenefits.serviceCharge > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <h3 className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-2">
                <Briefcase size={16} /> Onsite Employee Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-amber-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tea Allowance</span>
                    <span className="font-bold text-green-600">
                      +{formatCurrency(onsiteBenefits.teaAllowance || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {onsiteBenefits.presentDays || 0} days × 10 BDT
                  </p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-amber-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Service Charge</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(onsiteBenefits.serviceCharge || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Fixed monthly deduction
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Net Onsite Effect</span>
                  <span className={`text-lg font-bold ${
                    onsiteBenefits.netEffect >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {onsiteBenefits.netEffect >= 0 ? '+' : ''}{formatCurrency(onsiteBenefits.netEffect || 0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {onsiteBenefits.presentDays || 0} present days eligible for tea allowance
                </p>
              </div>
            </div>
          )}

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                <TrendingUp size={16} /> Earnings
              </h3>
              <div className="space-y-2 p-4 bg-white border border-gray-200 rounded-xl">
                {[
                  { label: 'Basic Pay', value: earnings.basicPay },
                  { label: 'Overtime', value: earnings.overtime },
                  { label: 'Bonus', value: earnings.bonus },
                  { label: 'Allowance', value: earnings.allowance },
                  onsiteBenefits && onsiteBenefits.teaAllowance > 0 ? 
                    { 
                      label: 'Onsite Tea Allowance', 
                      value: onsiteBenefits.teaAllowance,
                      isOnsite: true 
                    } : null
                ].filter(Boolean).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      {item.isOnsite && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">Onsite</span>
                      )}
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(earnings.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
                <AlertCircle size={16} /> Deductions
              </h3>
              <div className="space-y-2 p-4 bg-white border border-gray-200 rounded-xl">
                {[
                  { label: 'Late', value: deductions.late },
                  { label: 'Absent', value: deductions.absent },
                  { label: 'Leave', value: deductions.leave },
                  { label: 'Half Day', value: deductions.halfDay },
                  mealDeduction && mealDeduction.amount > 0 ? 
                    { 
                      label: `Meal Deduction (${mealDeduction.type?.replace('_', ' ')})`, 
                      value: mealDeduction.amount,
                      isMeal: true 
                    } : null,
                  deductions.allowanceDeduction > 0 ? 
                    { 
                      label: 'Allowance Adjustment', 
                      value: deductions.allowanceDeduction,
                      isAllowance: true 
                    } : null,
                  onsiteBenefits && onsiteBenefits.serviceCharge > 0 ? 
                    { 
                      label: 'Onsite Service Charge', 
                      value: onsiteBenefits.serviceCharge,
                      isOnsite: true 
                    } : null,
                  foodCostDetails && foodCostDetails.fixedDeduction > 0 ?
                    {
                      label: 'Food Cost Contribution',
                      value: foodCostDetails.fixedDeduction,
                      isFood: true
                    } : null
                ].filter(Boolean).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      {item.isMeal && (
                        <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Meal</span>
                      )}
                      {item.isAllowance && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">Allowance</span>
                      )}
                      {item.isOnsite && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">Onsite</span>
                      )}
                      {item.isFood && (
                        <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Food</span>
                      )}
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Deductions</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(deductions.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
                <CalendarDays size={16} /> Attendance
              </h3>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Days', value: attendance.totalDays, color: 'text-gray-900' },
                    { label: 'Present Days', value: attendance.presentDays, color: 'text-green-600' },
                    { label: 'Absent Days', value: attendance.absentDays, color: 'text-red-600' },
                    { label: 'Attendance %', value: `${attendance.attendancePercentage}%`, color: 'text-blue-600' }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">{item.label}</span>
                      <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {onsiteBenefits && (
                  <div className="mt-3 pt-3 border-t border-gray-300 text-center">
                    <p className="text-xs text-amber-600">
                      Eligible for tea allowance: {onsiteBenefits.presentDays || 0} days
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                <Calculator size={16} /> Calculation Summary
              </h3>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Earnings</span>
                    <span className="font-medium">{formatCurrency(summary.grossEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Deductions</span>
                    <span className="font-medium text-red-600">{formatCurrency(summary.totalDeductions)}</span>
                  </div>
                  
                  {/* Meal Deduction Breakdown (যদি থাকে) */}
                  {mealDeduction && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Meal Deduction</span>
                        <span className="text-red-500">-{formatCurrency(mealDeduction.amount)}</span>
                      </div>
                      <p className="text-xs text-gray-500 pl-1">
                        {mealDeduction.calculationNote || 'Standard meal deduction applied'}
                      </p>
                    </div>
                  )}
                  
                  {/* Food Cost Breakdown (যদি থাকে) */}
                  {foodCostDetails && foodCostDetails.included && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Food Cost Deduction</span>
                        <span className="text-red-500">-{formatCurrency(foodCostDetails.fixedDeduction)}</span>
                      </div>
                      <p className="text-xs text-gray-500 pl-1">
                        {foodCostDetails.calculationNote || 'Monthly food cost contribution'}
                      </p>
                    </div>
                  )}
                  
                  {/* Onsite Benefits Breakdown (যদি থাকে) */}
                  {onsiteBenefits && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Onsite Tea Allowance</span>
                        <span className="text-green-500">+{formatCurrency(onsiteBenefits.teaAllowance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Onsite Service Charge</span>
                        <span className="text-red-500">-{formatCurrency(onsiteBenefits.serviceCharge)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium pt-1">
                        <span className="text-gray-600">Onsite Net Effect</span>
                        <span className={`${onsiteBenefits.netEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {onsiteBenefits.netEffect >= 0 ? '+' : ''}{formatCurrency(onsiteBenefits.netEffect)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Net Payable</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(summary.netPayable)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      23 days fixed calculation basis
                      {onsiteBenefits && ' + Onsite benefits applied'}
                      {mealDeduction && ' + Meal deduction applied'}
                      {foodCostDetails?.included && ' + Food cost included'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptance Section for Pending Payrolls */}
          {status.current === 'Pending' && !status.employeeAccepted && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-yellow-700 mb-1">Pending Acceptance</h4>
                  <p className="text-sm text-yellow-600">
                    Please review and accept this payroll to mark it as paid
                  </p>
                  {onsiteBenefits && (
                    <p className="text-xs text-amber-600 mt-1">
                      Note: Onsite benefits calculation included
                    </p>
                  )}
                  {mealDeduction && (
                    <p className="text-xs text-red-600 mt-1">
                      Note: Meal deduction of {formatCurrency(mealDeduction.amount)} applied
                    </p>
                  )}
                  {foodCostDetails?.included && (
                    <p className="text-xs text-green-600 mt-1">
                      Note: Food cost contribution included
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleEmployeeAccept(employeePayrollDetails.payrollId)}
                  disabled={acceptingPayroll}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    acceptingPayroll 
                      ? 'bg-gray-300 text-gray-600' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {acceptingPayroll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Accept Payroll
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEmployeeDetailsModal(false);
                setEmployeePayrollDetails(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// নতুন ফাংশন: Employee acceptance (improved version)
const handleEmployeeAccept = async (payrollId) => {
  if (userRole !== 'employee') {
    toast.error("Only employees can accept payrolls");
    return;
  }
  
  setAcceptingPayroll(true);
  
  try {
    // API call to accept payroll
    const response = await apiRequest('PUT', `/payroll/${payrollId}/employee-accept`, {});
    
    if (response && response.status === 'success') {
      // Update local state immediately
      const updatedPayrolls = payrolls.map(p => {
        if (p._id === payrollId) {
          return {
            ...p,
            status: 'Paid', // এটা important
            employeeAccepted: {
              accepted: true,
              acceptedAt: new Date().toISOString(),
              acceptedBy: userId
            },
            payment: {
              ...p.payment,
              paymentDate: new Date().toISOString(),
              paymentMethod: 'Employee Accepted',
              transactionId: `EMP_ACCEPT_${Date.now()}_${userId}`
            }
          };
        }
        return p;
      });
      
      setPayrolls(updatedPayrolls);
      calculateStats(updatedPayrolls);
      
      // Save to localStorage
      saveEmployeeAcceptedStatus(payrollId, 'accepted');
      
      toast.success(response.message || 'Payroll accepted successfully!', {
        icon: '✅',
        duration: 4000,
      });
      
      // If details modal is open, update it too
      if (employeePayrollDetails?.payrollId === payrollId) {
        setEmployeePayrollDetails(prev => ({
          ...prev,
          status: {
            current: 'Paid',
            employeeAccepted: true
          }
        }));
      }
      
    } else {
      toast.error(response?.message || 'Failed to accept payroll');
    }
  } catch (error) {
    console.error('Accept payroll error:', error);
    toast.error(error.message || 'Failed to accept payroll');
  } finally {
    setAcceptingPayroll(false);
  }
};
  // ==================== AUTHENTICATION ====================
  const getUserType = () => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("adminToken")) return "admin";
      if (localStorage.getItem("employeeToken")) return "employee";
    }
    return "employee";
  };

  const getToken = () => {
    const userType = getUserType();
    const token = userType === "admin" 
      ? localStorage.getItem("adminToken") 
      : localStorage.getItem("employeeToken");
    return token || null;
  };

  // ==================== API FUNCTIONS ====================
  const apiRequest = async (method, endpoint, data = null) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method,
      headers,
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('userData');
        toast.error('Session expired. Please login again.');
        setTimeout(() => router.push('/login'), 1000);
        return null;
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  };

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const initApp = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      
      const adminToken = localStorage.getItem('adminToken');
      const employeeToken = localStorage.getItem('employeeToken');
      
      if (adminToken) {
        setUserRole('admin');
        setIsEmployeeView(false);
      } else if (employeeToken) {
        setUserRole('employee');
        setIsEmployeeView(true);
      }
      
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData);
          setUserData(parsed);
          setUserName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim());
          setUserId(parsed._id);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      await checkApiConnection();
      if (userRole === 'admin') {
        await loadEmployees();
      }
      await loadPayrolls();
      
      // Load employee accepted status from localStorage
      loadEmployeeAcceptedStatus();
    };
    
    initApp();
  }, [userRole]);

  useEffect(() => {
    // Set up periodic refresh for admin
    if (userRole === 'admin') {
      const interval = setInterval(() => {
        refreshAdminPayrolls();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [userRole, employeeAcceptedStatus]);

  // NEW FUNCTION: Load employee acceptance status from localStorage
  const loadEmployeeAcceptedStatus = () => {
    try {
      const savedStatus = localStorage.getItem('employeeAcceptedStatus');
      if (savedStatus) {
        setEmployeeAcceptedStatus(JSON.parse(savedStatus));
      }
    } catch (error) {
      console.error('Error loading employee acceptance status:', error);
    }
  };

  // NEW FUNCTION: Save employee acceptance status to localStorage
// NEW FUNCTION: Save employee acceptance status to localStorage
const saveEmployeeAcceptedStatus = (payrollId, status) => {
  try {
    const acceptedAt = new Date().toISOString();
    const updatedStatus = {
      ...employeeAcceptedStatus,
      [payrollId]: status,
      [payrollId + '_date']: acceptedAt // Store acceptance date separately
    };
    
    setEmployeeAcceptedStatus(updatedStatus);
    localStorage.setItem('employeeAcceptedStatus', JSON.stringify(updatedStatus));
    
    // Also update payroll in localStorage for persistence
    const payrollsData = localStorage.getItem('payrolls_backup');
    if (payrollsData) {
      try {
        const parsed = JSON.parse(payrollsData);
        const updated = parsed.map(p => 
          p._id === payrollId ? {
            ...p,
            status: 'Paid',
            employeeAccepted: { accepted: true, acceptedAt },
            payment: {
              ...p.payment,
              paymentDate: acceptedAt,
              paymentMethod: 'Employee Accepted'
            }
          } : p
        );
        localStorage.setItem('payrolls_backup', JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating payrolls backup:', e);
      }
    }
    
  } catch (error) {
    console.error('Error saving employee acceptance status:', error);
  }
};
 

// Load payrolls function আপডেট করুন:
const loadAllPayrolls = async () => {
  try {
    const params = new URLSearchParams();
    if (selectedYear) params.append('year', selectedYear);
    if (selectedMonth && selectedMonth !== "all") params.append('month', selectedMonth);
    if (selectedStatus !== "all") params.append('status', selectedStatus);
    if (selectedDepartment !== "all") params.append('department', selectedDepartment);
    if (searchTerm) params.append('search', searchTerm);
    params.append('page', '1');
    params.append('limit', '100');
    
    const queryString = params.toString();
    const endpoint = '/payroll/all';
    
    const response = await apiRequest('GET', endpoint);
    
    if (response && response.status === 'success') {
      let payrollsData = [];
      
      if (response.data && Array.isArray(response.data.payrolls)) {
        payrollsData = response.data.payrolls;
      } else if (Array.isArray(response.data)) {
        payrollsData = response.data;
      } else if (Array.isArray(response.payrolls)) {
        payrollsData = response.payrolls;
      }
      
      // Check employee acceptance status - server-side data ব্যবহার করুন
      const enrichedPayrolls = payrollsData.map(payroll => {
        // Server থেকে employeeAccepted data থাকলে use করবে
        const isServerAccepted = payroll.employeeAccepted?.accepted === true;
        // Fallback: localStorage থেকে check করবে
        const isLocalAccepted = employeeAcceptedStatus[payroll._id] === 'accepted';
        
        const isAccepted = isServerAccepted || isLocalAccepted;
        
        return {
          ...payroll,
          employeeName: payroll.employeeName || getEmployeeName(employee) || getEmployeeName(payroll),
          department: payroll.department || employee?.department || 'General',
          designation: payroll.designation || employee?.designation || 'Employee',
          employeeId: payroll.employeeId || employee?.employeeId || 'N/A',
          // Server-side status use করবে, যদি employee accept করে থাকে
          status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
          employeeAccepted: {
            accepted: isAccepted,
            acceptedAt: isAccepted ? (payroll.employeeAccepted?.acceptedAt || new Date().toISOString()) : null
          }
        };
      });
      
      setPayrolls(enrichedPayrolls);
      calculateStats(enrichedPayrolls);
      
      toast.success(`Loaded ${enrichedPayrolls.length} payrolls`);
    } else {
      console.log('⚠️ No payrolls found for admin');
      setPayrolls([]);
      calculateStats([]);
      toast.info('No payroll records found');
    }
  } catch (error) {
    console.error('❌ Error loading all payrolls:', error);
    setPayrolls([]);
    calculateStats([]);
    // toast.error('Failed to load payrolls');
  }
};

  // NEW FUNCTION: Simulate broadcasting to admin
  const broadcastToAdmin = (payrollId) => {
    // This simulates real-time notification to admin
    console.log(`Broadcasting payroll ${payrollId} acceptance to admin...`);
    
    // In a real app, you would use WebSocket or Server-Sent Events here
    // For now, we'll update localStorage which admin will check periodically
    const broadcastData = {
      type: 'PAYROLL_ACCEPTED',
      payrollId,
      timestamp: new Date().toISOString(),
      acceptedBy: userName || 'Employee'
    };
    
    localStorage.setItem('payroll_broadcast', JSON.stringify(broadcastData));
  };

  // NEW FUNCTION: Check for broadcasts
  const checkForBroadcasts = () => {
    try {
      const broadcastData = localStorage.getItem('payroll_broadcast');
      if (broadcastData) {
        const data = JSON.parse(broadcastData);
        if (data.type === 'PAYROLL_ACCEPTED') {
          // Update local state
          const updatedPayrolls = payrolls.map(p => 
            p._id === data.payrollId ? { 
              ...p, 
              status: 'Paid',
              employeeAccepted: true,
              acceptedAt: data.timestamp
            } : p
          );
          
          if (JSON.stringify(payrolls) !== JSON.stringify(updatedPayrolls)) {
            setPayrolls(updatedPayrolls);
            toast.info(`Employee accepted payroll: ${data.acceptedBy}`);
          }
          
          // Clear broadcast
          localStorage.removeItem('payroll_broadcast');
        }
      }
    } catch (error) {
      console.error('Error checking broadcasts:', error);
    }
  };

  // NEW FUNCTION: Refresh admin payrolls with acceptance status
  // Admin auto-refresh function
const refreshAdminPayrolls = async () => {
  if (loading.payrolls || userRole !== 'admin') return;
  
  try {
    const response = await apiRequest('GET', '/payroll/all');
    
    if (response && response.status === 'success') {
      let payrollsData = [];
      
      if (response.data && Array.isArray(response.data.payrolls)) {
        payrollsData = response.data.payrolls;
      } else if (Array.isArray(response.data)) {
        payrollsData = response.data;
      } else if (Array.isArray(response.payrolls)) {
        payrollsData = response.payrolls;
      }
      
      // Employee acceptance status check (server-side data)
      const enrichedPayrolls = payrollsData.map(payroll => {
        const isAccepted = payroll.employeeAccepted?.accepted === true;
        
        return {
          ...payroll,
          // CRITICAL: If employee accepted, status should be "Paid"
          status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
          employeeAccepted: payroll.employeeAccepted || { accepted: false }
        };
      });
      
      // Only update if there are changes
      if (JSON.stringify(payrolls) !== JSON.stringify(enrichedPayrolls)) {
        setPayrolls(enrichedPayrolls);
        calculateStats(enrichedPayrolls);
        setLastUpdated(new Date());
        
        // Show notification if new acceptances
        const newAcceptances = enrichedPayrolls.filter(p => 
          p.employeeAccepted?.accepted && 
          !payrolls.find(op => 
            op._id === p._id && 
            op.employeeAccepted?.accepted
          )
        );
        
        if (newAcceptances.length > 0) {
          toast.info(`${newAcceptances.length} payroll(s) accepted by employees`);
        }
      }
    }
  } catch (error) {
    console.error('Auto-refresh error:', error);
  }
};

  const checkApiConnection = async () => {
    try {
      const response = await fetch(API_BASE_URL, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setApiConnected(true);
        return true;
      }
    } catch (error) {
      setApiConnected(false);
      console.error('API Connection Error:', error);
      return false;
    }
  };

  // ==================== DATA LOADING ====================
  const loadEmployees = async () => {
    if (userRole !== 'admin') return;
    
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const response = await apiRequest('GET', '/admin/getAll-user');
      
      if (response && (response.users || response.data)) {
        let employeesData = [];
        
        if (response.users && Array.isArray(response.users)) {
          employeesData = response.users;
        } else if (response.data && Array.isArray(response.data)) {
          employeesData = response.data;
        }
        
        const activeEmployees = employeesData.filter(emp => {
          if (!emp || !emp._id) return false;
          return emp.status !== 'Inactive' && emp.status !== 'Terminated';
        });
        
        setEmployees(activeEmployees);
        
        const salaryMap = {};
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
            };
          }
        });
        
        setEmployeeSalaries(salaryMap);
        
        toast.success(`Loaded ${activeEmployees.length} employees`);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const loadPayrolls = async () => {
  setLoading(prev => ({ ...prev, payrolls: true }));
  
  try {
    if (isEmployeeView) {
      await loadEmployeePayrolls();
    } else {
      await loadAllPayrolls();
    }
  } catch (error) {
    console.error('Error loading payrolls:', error);
    toast.error('Failed to load payrolls');
  } finally {
    setLoading(prev => ({ ...prev, payrolls: false }));
  }
};

 

  const loadEmployeePayrolls = async () => {
    try {
      let response = await apiRequest('GET', '/my-payrolls');
      
      if (response && response.status === 'success') {
        let payrollsData = [];
        
        if (Array.isArray(response.data)) {
          payrollsData = response.data;
        } else if (response.data && Array.isArray(response.data.payrolls)) {
          payrollsData = response.data.payrolls;
        } else if (Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        } else if (response.data && Array.isArray(response.data)) {
          payrollsData = response.data;
        }
        
        // Check employee acceptance status for each payroll
        const processedPayrolls = payrollsData.map(payroll => {
          const isAccepted = employeeAcceptedStatus[payroll._id] === 'accepted';
          return {
            ...payroll,
            employeeName: payroll.employeeName || getEmployeeName(payroll.employee) || userData?.firstName || 'Unknown',
            department: payroll.department || userData?.department || 'General',
            designation: payroll.designation || userData?.designation || 'Employee',
            employeeId: payroll.employeeId || userData?.employeeId || 'N/A',
            // If employee accepted, update status to "Paid" locally
            status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
            employeeAccepted: isAccepted
          };
        });
        
        setPayrolls(processedPayrolls);
        calculateStats(processedPayrolls);
        
        toast.success(`Loaded ${processedPayrolls.length} of your payrolls`);
        return;
      }
      
      console.log('⚠️ No payrolls found for employee');
      setPayrolls([]);
      calculateStats([]);
      
      toast.info('No payroll records found for your account. Contact HR if you believe this is an error.');
      
    } catch (error) {
      console.error('❌ Error loading employee payrolls:', error);
      setPayrolls([]);
      calculateStats([]);
      
      if (error.message?.includes('403') || error.message?.includes('401')) {
        toast.error('Access denied. Please contact administrator.');
      } else {
        toast.error('Failed to load your payrolls. Please try again.');
      }
    }
  }; 

  const loadAllPayrollsForView = async () => {
    setLoading(prev => ({ ...prev, allView: true }));
    try {
      console.log('🔍 Loading all payrolls for comprehensive view...');
      
      const response = await apiRequest('GET', '/payroll/all');
      
      if (response) {
        console.log('✅ All payrolls response:', response);
        
        let payrollsData = [];
        
        if (Array.isArray(response)) {
          payrollsData = response;
        } else if (Array.isArray(response.data)) {
          payrollsData = response.data;
        } else if (response.data && Array.isArray(response.data.payrolls)) {
          payrollsData = response.data.payrolls;
        } else if (Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        } else if (response.payrolls && Array.isArray(response.payrolls)) {
          payrollsData = response.payrolls;
        }
        
        console.log(`✅ Found ${payrollsData.length} total payrolls`);
        
        const processedPayrolls = payrollsData.map(payroll => {
          const employee = employees.find(e => e._id === payroll.employee) || payroll.employee;
          const isAccepted = employeeAcceptedStatus[payroll._id] === 'accepted';
          
          return {
            ...payroll,
            _id: payroll._id || payroll.id,
            employeeName: payroll.employeeName || 
                         (employee && getEmployeeName(employee)) || 
                         getEmployeeName(payroll) || 
                         'Unknown Employee',
            department: payroll.department || 
                       (employee && employee.department) || 
                       (payroll.employee && payroll.employee.department) || 
                       'General',
            designation: payroll.designation || 
                        (employee && employee.designation) || 
                        (payroll.employee && payroll.employee.designation) || 
                        'Employee',
            employeeId: payroll.employeeId || 
                       (employee && employee.employeeId) || 
                       (payroll.employee && payroll.employee.employeeId) || 
                       'N/A',
            monthName: getMonthName(payroll.month),
            netPayable: payroll.summary?.netPayable || 
                       payroll.netSalary || 
                       payroll.earnings?.total || 
                       0,
            status: isAccepted ? 'Paid' : (payroll.status || 'Pending'),
            statusColor: getStatusColor(isAccepted ? 'Paid' : (payroll.status || 'Pending')),
            employeeAccepted: isAccepted
          };
        });
        
        const sortedPayrolls = processedPayrolls.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          if (a.month !== b.month) return b.month - a.month;
          return a.employeeName.localeCompare(b.employeeName);
        });
        
        setAllPayrollsView(sortedPayrolls);
        toast.success(`Loaded ${sortedPayrolls.length} payroll records`);
      } else {
        setAllPayrollsView([]);
        toast.info('No payroll records found');
      }
    } catch (error) {
      console.error('❌ Error loading all payrolls view:', error);
      setAllPayrollsView([]);
      toast.error('Failed to load all payrolls');
    } finally {
      setLoading(prev => ({ ...prev, allView: false }));
    }
  };

  const calculateStats = (payrollData) => {
    const totalPayroll = payrollData.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    const totalDeductions = payrollData.reduce((sum, p) => {
      return sum + (p.deductions?.total || 0);
    }, 0);
    
    const totalProcessed = payrollData.length;
    const totalPending = payrollData.filter(p => p.status?.toLowerCase() === 'pending').length;
    const totalPaid = payrollData.filter(p => p.status?.toLowerCase() === 'paid').length;
    const totalRejected = payrollData.filter(p => p.status?.toLowerCase() === 'rejected' || p.status?.toLowerCase() === 'cancelled').length;
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentMonthPayrolls = payrollData.filter(p => {
      try {
        return p.month === currentMonth && p.year === currentYear;
      } catch (e) {
        return false;
      }
    });
    
    const monthlyExpense = currentMonthPayrolls.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    setStats({
      totalPayroll,
      totalDeductions,
      totalEmployees: isEmployeeView ? 1 : employees.length,
      totalProcessed,
      totalPending,
      totalPaid,
      totalRejected,
      monthlyExpense,
      totalNetPayable: totalPayroll,
      averageSalary: totalProcessed > 0 ? totalPayroll / totalProcessed : 0
    });
  };
// Preview Modal render function
const renderPreviewModal = () => {
  if (!previewData) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payroll Calculation Details</h2>
              <p className="text-gray-500 text-sm mt-1">
                {previewData.employee?.name} • {previewData.period?.monthName} {previewData.period?.year}
                {previewData.payrollId && ` • Payroll ID: ${previewData.payrollId}`}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowPreviewModal(false);
                setPreviewData(null);
              }} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="text-sm text-blue-600 font-medium">Monthly Salary</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(previewData.salary?.monthly)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Daily: {formatCurrency(previewData.salary?.dailyRate)}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="text-sm text-green-600 font-medium">Attendance</div>
              <div className="text-2xl font-bold text-gray-900">
                {previewData.attendance?.presentDays}/{previewData.attendance?.totalWorkingDays}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((previewData.attendance?.presentDays / previewData.attendance?.totalWorkingDays) * 100)}% Present
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="text-sm text-purple-600 font-medium">Total Deductions</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(previewData.deductions?.total)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {previewData.deductions?.capped && 'Capped at monthly salary'}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="text-sm text-orange-600 font-medium">Net Payable</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(previewData.finalSummary?.netPayable || previewData.summary?.netPayable)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {previewData.finalSummary?.status || 'Calculated'}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Earnings Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Earnings Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Basic Pay', value: previewData.earnings?.basicPay, color: 'text-green-600' },
                  { label: 'Overtime', value: previewData.earnings?.overtime, color: 'text-green-500' },
                  { label: 'Bonus', value: previewData.earnings?.bonus, color: 'text-green-400' },
                  { label: 'Allowance', value: previewData.earnings?.allowance, color: 'text-green-300' }
                ].map((item, index) => (
                  item.value > 0 && (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className={`font-medium ${item.color}`}>
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  )
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(previewData.earnings?.total)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Onsite Benefits */}
              {previewData.onsiteBenefits?.included && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Onsite Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tea Allowance</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(previewData.onsiteBenefits.teaAllowance)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Charge</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(previewData.onsiteBenefits.serviceCharge)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                      <span className="text-gray-700">Net Effect</span>
                      <span className={previewData.onsiteBenefits.netEffect >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {previewData.onsiteBenefits.netEffect >= 0 ? '+' : ''}{formatCurrency(previewData.onsiteBenefits.netEffect)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deductions Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Deductions Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Late Deduction', value: previewData.deductions?.late, color: 'text-red-500' },
                  { label: 'Absent Deduction', value: previewData.deductions?.absent, color: 'text-red-600' },
                  { label: 'Leave Deduction', value: previewData.deductions?.leave, color: 'text-red-700' },
                  { label: 'Half Day Deduction', value: previewData.deductions?.halfDay, color: 'text-red-800' }
                ].map((item, index) => (
                  item.value > 0 && (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className={`font-medium ${item.color}`}>
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  )
                ))}
                
                {/* Meal Deduction */}
                {previewData.mealDeduction?.amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Meal Deduction ({previewData.mealDeduction.type})
                    </span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(previewData.mealDeduction.amount)}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Deductions</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(previewData.deductions?.total)}
                    </span>
                  </div>
                  {previewData.deductions?.capped && (
                    <div className="text-xs text-yellow-600 mt-1">
                      ⚠️ Deductions capped at monthly salary
                    </div>
                  )}
                </div>
              </div>
              
              {/* Calculation Notes */}
              <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Calculation Rules</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                    {previewData.calculationNotes?.basis}
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                    {previewData.calculationNotes?.deductionRules}
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                    {previewData.calculationNotes?.holidayRule}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Working Days', value: previewData.attendance?.totalWorkingDays, bg: 'bg-gray-100' },
                { label: 'Present Days', value: previewData.attendance?.presentDays, bg: 'bg-green-100' },
                { label: 'Absent Days', value: previewData.attendance?.absentDays, bg: 'bg-red-100' },
                { label: 'Leave Days', value: previewData.attendance?.leaveDays, bg: 'bg-yellow-100' },
                { label: 'Late Days', value: previewData.attendance?.lateDays, bg: 'bg-orange-100' },
                { label: 'Half Days', value: previewData.attendance?.halfDays, bg: 'bg-blue-100' },
                { label: 'Holidays', value: previewData.attendance?.holidays, bg: 'bg-purple-100' },
                { label: 'Weekly Offs', value: previewData.attendance?.weeklyOffs, bg: 'bg-pink-100' }
              ].map((item, index) => (
                <div key={index} className={`p-3 rounded-lg ${item.bg}`}>
                  <div className="text-xs text-gray-600">{item.label}</div>
                  <div className="text-lg font-bold text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Summary */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-green-700">Final Calculation</h4>
                <p className="text-sm text-green-600">
                  {previewData.employee?.name} • {previewData.period?.monthName} {previewData.period?.year}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(previewData.finalSummary?.netPayable || previewData.summary?.netPayable)}
                </div>
                <div className="text-sm text-green-500">Net Payable Amount</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Gross Earnings</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(previewData.finalSummary?.grossEarnings || previewData.summary?.grossEarnings)}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Total Deductions</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(previewData.finalSummary?.totalDeductions || previewData.summary?.totalDeductions)}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Payable Days</div>
                <div className="text-xl font-bold text-blue-600">
                  {previewData.attendance?.presentDays}
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {previewData.warnings && previewData.warnings.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-700 mb-2">Important Notes</h4>
              <ul className="text-sm text-yellow-600 space-y-1">
                {previewData.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5"></div>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                setShowPreviewModal(false);
                setPreviewData(null);
              }}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Close
            </button>
            {!previewData.payrollId && (
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleCreatePayroll(new Event('submit'));
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Create Payroll
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
  // ==================== PAYROLL OPERATIONS ==================== 
const handleCreatePayroll = async (e) => {
  e.preventDefault();
  
  if (userRole !== 'admin') {
    toast.error("Only admin can create payrolls");
    return;
  }
  
  setLoading(prev => ({ ...prev, create: true }));
  
  try {
    const employee = employees.find(emp => emp._id === createForm.employeeId);
    if (!employee) {
      toast.error('Selected employee not found');
      setLoading(prev => ({ ...prev, create: false }));
      return;
    }
    
    const salaryData = employeeSalaries[createForm.employeeId] || {};
    const monthlySalary = salaryData.salary || parseInt(createForm.monthlySalary) || 30000;
    
// Meal deduction calculation in handleCreatePayroll
let mealDeduction = 0;
let mealDeductionType = 'none';
let mealCalculationNote = '';

console.log('Meal Data Check:', {
  hasMonthlySubscription: mealSystemData?.hasMonthlySubscription,
  dailyMealDays: mealSystemData?.dailyMealDays,
  dailyMealRate: createForm.dailyMealRate,
  manualMealAmount: createForm.manualMealAmount
});

// CASE 1: Monthly subscription আছে
if (mealSystemData?.hasMonthlySubscription) {
  mealDeduction = mealSystemData.deductionPerEmployee;
  mealDeductionType = 'monthly_subscription';
  mealCalculationNote = `Monthly subscription: ${formatCurrency(mealSystemData.monthlyFoodCost)} ÷ ${mealSystemData.activeSubscribers} = ${formatCurrency(mealDeduction)}`;
  console.log('Using monthly subscription deduction:', mealDeduction);
}
// CASE 2: Monthly subscription নেই কিন্তু daily meal days আছে
else if (!mealSystemData?.hasMonthlySubscription && mealSystemData?.dailyMealDays > 0) {
  const dailyRate = parseFloat(createForm.dailyMealRate) || 100; // Default 100 if not provided
  mealDeduction = dailyRate * mealSystemData.dailyMealDays;
  mealDeductionType = 'daily_meal';
  mealCalculationNote = `Daily meals: ${mealSystemData.dailyMealDays} days × ${formatCurrency(dailyRate)} = ${formatCurrency(mealDeduction)}`;
  console.log('Using daily meal deduction:', mealDeduction);
}
// CASE 3: Manual amount entered
else if (parseFloat(createForm.manualMealAmount) > 0) {
  mealDeduction = parseFloat(createForm.manualMealAmount);
  mealDeductionType = 'manual_amount';
  mealCalculationNote = `Manual meal deduction: ${formatCurrency(mealDeduction)}`;
  console.log('Using manual deduction:', mealDeduction);
}
// CASE 4: কোনো meal data নেই
else {
  console.log('No meal deduction applicable');
}
    
    const payrollData = {
      employeeId: createForm.employeeId,
      month: parseInt(createForm.month),
      year: parseInt(createForm.year),
      monthlySalary: monthlySalary,
      overtime: parseInt(createForm.overtime) || 0,
      bonus: parseInt(createForm.bonus) || 0,
      allowance: parseInt(createForm.allowance) || 0,
      dailyMealRate: parseFloat(createForm.dailyMealRate) || 0,
      manualMealAmount: parseFloat(createForm.manualMealAmount) || 0,
      mealDeduction: mealDeduction,
      mealDeductionType: mealDeductionType,
      mealCalculationNote: mealCalculationNote,
      notes: createForm.notes || `Payroll for ${monthNames[createForm.month - 1]} ${createForm.year}`
    };
    
    console.log('Creating payroll with data:', payrollData);
    
    const response = await apiRequest('POST', '/payroll/create', payrollData);
    
    if (response && response.status === 'success') {
      // ✅ নতুন: Create করার পর calculation details দেখান
      if (response.data?.fullCalculation) {
        setPreviewData({
          ...response.data.fullCalculation,
          finalSummary: {
            grossEarnings: response.data.breakdown.earnings,
            totalDeductions: response.data.breakdown.deductions.total,
            netPayable: response.data.netPayable,
            status: 'CREATED SUCCESSFULLY'
          },
          mealDeduction: response.data.mealSystem,
          onsiteBenefits: response.data.onsiteBenefits,
          payrollId: response.data.payrollId
        });
        setShowPreviewModal(true);
      }
      
      toast.success(response.message || 'Payroll created successfully!', {
        icon: '✅',
        duration: 3000,
      });
      
      await loadPayrolls();
      
      setCreateForm({
        employeeId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        monthlySalary: "",
        overtime: "0",
        bonus: "0",
        allowance: "0",
        notes: ""
      });
      
      setShowCreateModal(false);
      
    } else {
      const errorMsg = response?.message || 'Failed to create payroll';
      
      if (errorMsg.includes('Payroll already exists')) {
        toast.error('❌ Payroll already exists for this employee and month!');
      } else if (errorMsg.includes('Net payable amount is 0')) {
        // যদি net payable zero হয়, তাও calculation দেখান
        if (response.calculationPreview) {
          setPreviewData(response.calculationPreview);
          setShowPreviewModal(true);
        }
        toast.error('❌ Cannot create payroll. Net payable amount would be 0 BDT.');
      } else {
        toast.error(`❌ ${errorMsg}`);
      }
    }
    
  } catch (error) {
    console.error('Create payroll error:', error);
    toast.error('Failed to create payroll. Please try again.');
  } finally {
    setLoading(prev => ({ ...prev, create: false }));
  }
};

const handleCalculatePayroll = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!calculateForm.employeeId) {
    toast.error('Please select an employee');
    return;
  }
  
  if (!calculateForm.month) {
    toast.error('Please select month');
    return;
  }
  
  if (!calculateForm.year) {
    toast.error('Please select year');
    return;
  }
  
  if (!calculateForm.monthlySalary) {
    toast.error('Please enter monthly salary');
    return;
  }
  
  setLoading(prev => ({ ...prev, calculation: true }));
  
  try {
    const employee = employees.find(e => e._id === calculateForm.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Meal data load (যদি প্রয়োজন হয়)
    const mealData = await loadEmployeeMealData(
      calculateForm.employeeId, 
      calculateForm.month, 
      calculateForm.year
    );
    
    // Meal deduction calculation
    let mealDeduction = 0;
    let mealDeductionType = 'none';
    let mealCalculationNote = '';
    
    if (mealData?.hasMonthlySubscription) {
      mealDeduction = mealData.deductionPerEmployee;
      mealDeductionType = 'monthly_subscription';
      mealCalculationNote = `Monthly subscription: ${formatCurrency(mealData.monthlyFoodCost)} ÷ ${mealData.activeSubscribers} = ${formatCurrency(mealDeduction)}`;
    } else if (mealData?.dailyMealDays > 0) {
      // Daily meal calculation (default rate 100)
      mealDeduction = 100 * mealData.dailyMealDays;
      mealDeductionType = 'daily_meal';
      mealCalculationNote = `Daily meals: ${mealData.dailyMealDays} days × ${formatCurrency(100)} = ${formatCurrency(mealDeduction)}`;
    }
    
    // ✅ Create Payroll এর মতো একই payload
    const payload = {
      employeeId: calculateForm.employeeId,
      month: parseInt(calculateForm.month),
      year: parseInt(calculateForm.year),
      monthlySalary: parseInt(calculateForm.monthlySalary),
      overtime: 0,
      bonus: 0,
      allowance: 0,
      dailyMealRate: 0,
      manualMealAmount: 0,
      mealDeduction,
      mealDeductionType,
      mealCalculationNote,
      notes: `Calculation preview for ${monthNames[calculateForm.month - 1]} ${calculateForm.year}`
    };
    
    console.log('Calculate Payroll Payload:', payload);
    
    // ✅ একই API endpoint ব্যবহার করুন
    const response = await apiRequest('POST', '/payroll/calculate-preview', payload);
    
    if (response && response.status === 'success') {
      const data = response.data;
      
      // ✅ Create Payroll এর মতো একই response structure
      setCalculationResult({
        employeeDetails: {
          name: getEmployeeName(employee),
          employeeId: employee.employeeId || employee._id,
          department: employee.department || 'General',
          designation: employee.designation || 'Employee'
        },
        month: parseInt(calculateForm.month),
        year: parseInt(calculateForm.year),
        monthlySalary: parseInt(calculateForm.monthlySalary),
        earnings: {
          basicPay: data.earnings?.basicPay || 0,
          overtime: data.earnings?.overtime?.amount || 0,
          bonus: data.earnings?.bonus?.amount || 0,
          allowance: data.earnings?.allowance?.amount || 0,
          total: data.summary?.grossEarnings || 0
        },
        deductions: {
          lateDeduction: data.deductions?.lateDeduction || 0,
          absentDeduction: data.deductions?.absentDeduction || 0,
          leaveDeduction: data.deductions?.leaveDeduction || 0,
          halfDayDeduction: data.deductions?.halfDayDeduction || 0,
          mealDeduction: data.mealSystemData?.mealDeduction?.amount || 0,
          total: data.deductions?.total || 0
        },
        summary: {
          grossEarnings: data.summary?.grossEarnings || 0,
          totalDeductions: data.deductions?.total || 0,
          netPayable: data.summary?.netPayable || 0
        },
        attendance: {
          presentDays: data.attendance?.presentDays || 0,
          totalWorkingDays: data.attendance?.totalWorkingDays || 23,
          attendancePercentage: data.attendance?.attendancePercentage || 0
        },
        mealSystemData: data.mealSystemData || null,
        onsiteBenefits: data.onsiteBenefitsDetails || null
      });
      
      toast.success(`Payroll calculated for ${monthNames[calculateForm.month - 1]} ${calculateForm.year}!`, {
        icon: '📊',
        duration: 3000,
      });
    } else {
      throw new Error(response?.message || 'Calculation failed');
    }
    
  } catch (error) {
    console.error('Calculate payroll error:', error);
    toast.error(error.message || 'Failed to calculate payroll');
  } finally {
    setLoading(prev => ({ ...prev, calculation: false }));
  }
};

  const handleBulkGenerate = async (e) => {
  e.preventDefault();
  
  if (userRole !== 'admin') {
    toast.error("Only admin can bulk generate payrolls");
    return;
  }
  
  setLoading(prev => ({ ...prev, generate: true }));
  
  try {
    const month = parseInt(bulkForm.month);
    const year = parseInt(bulkForm.year);
    
    // ✅ Create Payroll এর মতো একই payload structure
    const payload = {
      month: month,
      year: year,
      // Additional options for bulk generate
      includeMealDeduction: true,
      includeOnsiteBenefits: true,
      autoCalculateAttendance: true
    };
    
    // ✅ একই API endpoint (অথবা bulk-specific endpoint)
    const response = await apiRequest('POST', '/payroll/bulk-generate', payload);
    
    if (response && response.status === 'success') {
      const summary = response.data?.summary || {};
      const created = summary.created || 0;
      const skipped = summary.skipped || 0;
      const failed = summary.failed || 0;
      
      toast.success(
        `Created ${created} payrolls for ${monthNames[month - 1]} ${year}` + 
        (skipped > 0 ? `, ${skipped} skipped` : '') +
        (failed > 0 ? `, ${failed} failed` : ''),
        {
          icon: '✅',
          duration: 5000,
        }
      );
      
      // যদি details থাকে তবে show করতে পারেন
      if (response.data.details) {
        console.log('Bulk generation details:', response.data.details);
        
        // Meal deduction summary
        if (response.data.mealSummary) {
          toast.info(
            `Meal deduction applied to ${response.data.mealSummary.withMealDeduction} employees`,
            { duration: 3000 }
          );
        }
        
        // Onsite benefits summary
        if (response.data.onsiteSummary) {
          toast.info(
            `Onsite benefits applied to ${response.data.onsiteSummary.withOnsiteBenefits} employees`,
            { duration: 3000 }
          );
        }
      }
      
      await loadPayrolls();
      
      setShowBulkModal(false);
      setBulkForm({ month: '', year: '' });
    } else {
      throw new Error(response?.message || 'Bulk generation failed');
    }
    
  } catch (error) {
    console.error('Bulk generate error:', error);
    
    // Specific error handling
    if (error.message.includes('already exists')) {
      toast.error('Some payrolls already exist for this month. Please check existing records.');
    } else if (error.message.includes('attendance')) {
      toast.error('Attendance data missing for some employees. Please check attendance records.');
    } else {
      toast.error(error.message || 'Bulk generation failed');
    }
  } finally {
    setLoading(prev => ({ ...prev, generate: false }));
  }
};

  const handleUpdateStatus = async (id, status) => {
    if (userRole !== 'admin') {
      toast.error("Only admin can update payroll status");
      return;
    }
    
    if (!window.confirm(`Change status to ${status}?`)) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const response = await apiRequest('PUT', `/update-payroll/${id}/status`, { status });
      
      if (response && response.status === 'success') {
        const updatedPayrolls = payrolls.map(p => 
          p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
        );
        
        setPayrolls(updatedPayrolls);
        toast.success('Status updated successfully!');
      } else {
        throw new Error(response?.message || 'Update failed');
      }
      
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeletePayroll = async (id) => {
    if (userRole !== 'admin') {
      toast.error("Only admin can delete payrolls");
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this payroll?')) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const response = await apiRequest('DELETE', `/delete-payroll/${id}`);
      
      if (response && response.status === 'success') {
        const updatedPayrolls = payrolls.filter(p => p._id !== id);
        setPayrolls(updatedPayrolls);
        
        // Also remove from employeeAcceptedStatus
        const updatedStatus = { ...employeeAcceptedStatus };
        delete updatedStatus[id];
        setEmployeeAcceptedStatus(updatedStatus);
        localStorage.setItem('employeeAcceptedStatus', JSON.stringify(updatedStatus));
        
        toast.success('Payroll deleted successfully!');
        setShowDeleteModal(false);
        setSelectedPayroll(null);
      } else {
        throw new Error(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete payroll');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleExport = async () => {
    if (userRole !== 'admin') {
      toast.error("Only admin can export payroll data");
      return;
    }
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const month = selectedMonth === "all" ? new Date().getMonth() + 1 : selectedMonth;
      const year = selectedYear;
      
      let endpoint = `/payroll/export/monthly?month=${month}&year=${year}&format=${exportFormat}`;
      
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      
      if (response.ok) {
        if (exportFormat === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payrolls_${month}_${year}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast.success('CSV export downloaded successfully!', {
            icon: '📥',
            duration: 3000,
          });
        } else {
          const data = await response.json();
          const dataStr = JSON.stringify(data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(dataBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payrolls_${month}_${year}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast.success('JSON export downloaded successfully!', {
            icon: '📥',
            duration: 3000,
          });
        }
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting data');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setShowExportModal(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    await loadPayrolls();
    if (userRole === 'admin') {
      await loadEmployees();
    }
    // Check for broadcasts
    checkForBroadcasts();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth("all");
    setSelectedStatus("all");
    setSelectedDepartment("all");
  };

  // ==================== FILTERED PAYROLLS ====================
  const filteredPayrolls = payrolls.filter(payroll => {
    const employeeName = (payroll.employeeName || getEmployeeName(payroll)).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase()) || 
                         (payroll.employeeId && payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || payroll.status === selectedStatus;
    const matchesDepartment = selectedDepartment === "all" || payroll.department === selectedDepartment;
    const matchesMonth = selectedMonth === "all" || payroll.month === parseInt(selectedMonth);
    const matchesYear = !selectedYear || payroll.year === parseInt(selectedYear);
    
    if (isEmployeeView) {
      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    }
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesMonth && matchesYear;
  });

  // ==================== GROUPED PAYROLLS FOR ALL VIEW ====================
  const groupedPayrolls = allPayrollsView.reduce((groups, payroll) => {
    let key;
    if (groupedBy === 'month') {
      key = `${payroll.year}-${String(payroll.month).padStart(2, '0')}`;
    } else if (groupedBy === 'department') {
      key = payroll.department || 'Unknown Department';
    } else {
      key = payroll.employeeId || 'Unknown Employee';
    }
    
    if (!groups[key]) {
      groups[key] = {
        key,
        payrolls: [],
        total: 0,
        count: 0,
        employees: new Set()
      };
    }
    
    groups[key].payrolls.push(payroll);
    groups[key].total += payroll.netPayable || 0;
    groups[key].count += 1;
    groups[key].employees.add(payroll.employeeId);
    
    return groups;
  }, {});

  // ==================== RENDER MODALS ====================
  const renderCreateModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Payroll</h2>
              <p className="text-gray-500 text-sm mt-1">Auto-calculated with 23 Days Month</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(false)} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleCreatePayroll} className="p-6 space-y-6">
             <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
          <select
            value={createForm.employeeId}
            onChange={(e) => {
              setCreateForm({ ...createForm, employeeId: e.target.value });
              // Load meal data when employee is selected
              if (e.target.value && createForm.month && createForm.year) {
                loadEmployeeMealData(e.target.value, createForm.month, createForm.year);
              }
            }}
            required
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="">Choose an employee</option>
            {employees.map((emp) => {
              const salaryData = employeeSalaries[emp._id] || {};
              return (
                <option key={emp._id} value={emp._id}>
                  {getEmployeeName(emp)} • {formatCurrency(salaryData.salary || 30000)}/month
                </option>
              );
            })}
          </select>
        </div>

        {/* 2. Month and Year Selection */}
        {createForm.employeeId && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <select
  value={createForm.month}
  onChange={(e) => {
    const month = e.target.value;
    setCreateForm({ ...createForm, month });
    // ✅ Month change করলে meal data reload
    if (createForm.employeeId && month && createForm.year) {
      loadEmployeeMealData(createForm.employeeId, month, createForm.year);
    }
  }}
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
                onChange={(e) => {
                  setCreateForm({ ...createForm, year: e.target.value });
                  if (createForm.employeeId && createForm.month && e.target.value) {
                    loadEmployeeMealData(createForm.employeeId, createForm.month, e.target.value);
                  }
                }}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>
        )}
        {/* Create Modal এর মধ্যে monthly salary field এর পরে যোগ করুন: */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Monthly Salary (৳) *
    <span className="text-xs text-gray-500 ml-2">
      Required for calculation
    </span>
  </label>
  <input
    type="number"
    value={createForm.monthlySalary}
    onChange={(e) => setCreateForm({ ...createForm, monthlySalary: e.target.value })}
    placeholder="Enter monthly salary"
    min="0"
    required
    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
  />
  {createForm.employeeId && employeeSalaries[createForm.employeeId] && (
    <p className="text-xs text-blue-500 mt-2">
      Employee's stored salary: {formatCurrency(employeeSalaries[createForm.employeeId].salary)}
      <button
        type="button"
        onClick={() => setCreateForm(prev => ({
          ...prev,
          monthlySalary: employeeSalaries[createForm.employeeId].salary.toString()
        }))}
        className="ml-2 text-blue-600 hover:underline"
      >
        (Use this)
      </button>
    </p>
  )}
</div>
{/* Meal System Information */}  
{createForm.employeeId && createForm.month && createForm.year && (
  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      Meal System Information
      <button
        type="button"
        onClick={() => loadEmployeeMealData(createForm.employeeId, createForm.month, createForm.year)}
        className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
      >
        Reload Meal Data
      </button>
    </h4>
    
    {/* Debug info - শুধু development এর জন্য */}
    {process.env.NODE_ENV === 'development' && (
      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs"> 
        <p><strong>Debug Info:</strong></p>
        <p>Monthly Subscription: {mealSystemData.hasMonthlySubscription ? 'Yes' : 'No'}</p>
        <p>Daily Meal Days: {mealSystemData.dailyMealDays}</p>
        <p>Deduction Per Employee: {formatCurrency(mealSystemData.deductionPerEmployee)}</p>
      </div>
    )}
    
    {mealSystemData.hasMonthlySubscription ? (
      // ✅ CASE 1: Monthly Subscription থাকলে
      <div className="p-3 bg-white rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-700">Monthly Subscription Active</span>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Auto Deduction
          </span>
        </div>
        
        <div className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-gray-600 text-xs">Total Food Cost:</span>
              <p className="font-medium text-sm">{formatCurrency(mealSystemData.monthlyFoodCost)}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-gray-600 text-xs">Active Subscribers:</span>
              <p className="font-medium text-sm">{mealSystemData.activeSubscribers}</p>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">Monthly Deduction:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(mealSystemData.deductionPerEmployee)}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Calculation: {formatCurrency(mealSystemData.monthlyFoodCost)} ÷ {mealSystemData.activeSubscribers} subscribers
            </p>
          </div>
          
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <p className="flex items-center gap-1">
              <Info size={12} />
              Note: Monthly subscription থাকায় daily meal days গুলো এখানে দেখানো হবে না
            </p>
          </div>
        </div>
      </div>
    ) : mealSystemData.dailyMealDays > 0 ? (
      // ✅ CASE 2: Monthly subscription নেই কিন্তু daily meal days আছে
      <div className="space-y-3">
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Daily Meal Days Found</span>
              </div>
              <p className="text-xs text-blue-500 mt-1">
                Employee has <span className="font-bold">{mealSystemData.dailyMealDays}</span> meal days for {monthNames[createForm.month - 1]} {createForm.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">{mealSystemData.dailyMealDays}</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-blue-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Meal Rate (৳)
              <span className="text-xs text-gray-500 ml-2">(Required for calculation)</span>
            </label>
            <input
              type="number"
              value={createForm.dailyMealRate}
              onChange={(e) => setCreateForm({ ...createForm, dailyMealRate: e.target.value })}
              placeholder="Enter daily meal rate"
              min="0"
              step="10"
              required={mealSystemData.dailyMealDays > 0}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[50, 80, 100, 120, 150].map(rate => (
                <button
                  type="button"
                  key={rate}
                  onClick={() => setCreateForm({ ...createForm, dailyMealRate: rate.toString() })}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    createForm.dailyMealRate == rate 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ৳{rate}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">Total Meal Deduction:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency((parseFloat(createForm.dailyMealRate) || 0) * mealSystemData.dailyMealDays)}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Calculation: {mealSystemData.dailyMealDays} days × ৳{createForm.dailyMealRate || 0} = {formatCurrency((parseFloat(createForm.dailyMealRate) || 0) * mealSystemData.dailyMealDays)}
            </p>
          </div>
        </div>
      </div>
    ) : (
      // ✅ CASE 3: কোনো meal data নেই
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">No meal data found for this period</p>
          <p className="text-xs text-gray-500 mt-1">
            Employee does not have any meal subscription or daily meal records
          </p>
        </div>
      </div>
    )}
  </div>
)}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overtime (৳)</label>
              <input
                type="number"
                name="overtime"
                value={createForm.overtime}
                onChange={(e) => setCreateForm({ ...createForm, overtime: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bonus (৳)</label>
              <input
                type="number"
                name="bonus"
                value={createForm.bonus}
                onChange={(e) => setCreateForm({ ...createForm, bonus: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowance (৳)</label>
              <input
                type="number"
                name="allowance"
                value={createForm.allowance}
                onChange={(e) => setCreateForm({ ...createForm, allowance: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              placeholder="Additional notes (optional)"
              rows="3"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
            />
          </div>

                  <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowCreateModal(false)}
            disabled={loading.create || isPreviewing}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handlePreviewPayroll}
            disabled={loading.create || isPreviewing || !createForm.employeeId || !createForm.month || !createForm.year}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPreviewing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator size={18} />
                Preview Calculation
              </>
            )}
          </button>
          
          <button
  type="submit"
  disabled={loading.create || isPreviewing || !createForm.employeeId || !createForm.month || !createForm.year || !createForm.monthlySalary}
  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {loading.create ? (
    <>
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Creating...
    </>
  ) : (
    <>
      <Plus size={18} />
      Create Payroll
    </>
  )}
</button>
        </div>
        </form>
      </div>
    </div>
  );

const renderCalculateModal = () => (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Calculate Payroll</h2>
            <p className="text-gray-500 text-sm mt-1">Preview calculation without saving</p>
          </div>
          <button 
            onClick={() => {
              setShowCalculateModal(false);
              setCalculationResult(null);
            }} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <form onSubmit={handleCalculatePayroll} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
          <select
            value={calculateForm.employeeId}
            onChange={(e) => {
              const empId = e.target.value;
              setCalculateForm({ ...calculateForm, employeeId: empId });
              
              // Auto-fill monthly salary when employee is selected
              if (empId && employeeSalaries[empId]) {
                setCalculateForm(prev => ({
                  ...prev,
                  employeeId: empId,
                  monthlySalary: employeeSalaries[empId].salary.toString()
                }));
              }
            }}
            required
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="">Choose an employee</option>
            {employees.map((emp) => {
              const salaryData = employeeSalaries[emp._id] || {};
              return (
                <option key={emp._id} value={emp._id}>
                  {getEmployeeName(emp)} • {formatCurrency(salaryData.salary || 30000)}/month
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
            <select
              value={calculateForm.month}
              onChange={(e) => setCalculateForm({ ...calculateForm, month: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              value={calculateForm.year}
              onChange={(e) => setCalculateForm({ ...calculateForm, year: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select Year</option>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>

        {calculateForm.employeeId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary (৳) *</label>
            <input
              type="number"
              value={calculateForm.monthlySalary}
              onChange={(e) => setCalculateForm({ ...calculateForm, monthlySalary: e.target.value })}
              placeholder="Enter monthly salary"
              min="0"
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
            />
            {employeeSalaries[calculateForm.employeeId] && (
              <p className="text-xs text-blue-500 mt-2">
                Employee's stored salary: {formatCurrency(employeeSalaries[calculateForm.employeeId].salary)}
                <button
                  type="button"
                  onClick={() => setCalculateForm(prev => ({
                    ...prev,
                    monthlySalary: employeeSalaries[calculateForm.employeeId].salary.toString()
                  }))}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  (Use this)
                </button>
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setShowCalculateModal(false);
              setCalculationResult(null);
            }}
            disabled={loading.calculation}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </button> 
<button
  onClick={() => {
    // Check if employees are loaded
    if (employees.length === 0) {
      toast.error('Please wait while employees are loading');
      return;
    }
    
    // Reset form with current month/year
    setCalculateForm({
      employeeId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      monthlySalary: ""
    });
    
    setShowCalculateModal(true);
  }}
  disabled={loading.employees} 
  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between group disabled:opacity-50"
>
  <div className="text-left">
    <p className="font-semibold">Calculate</p>
    <p className="text-sm opacity-90">Preview calculation</p>
  </div>
  {loading.employees ? <Loader2 size={24} className="animate-spin" /> : <Calculator size={24} className="group-hover:scale-110 transition-transform duration-300" />}
</button>
        </div>
      </form> 
 
{calculationResult && (
  <div className="p-6 border-t border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Result</h3>
    
    <div className="space-y-4">
      {/* Employee Details */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <h4 className="text-sm font-medium text-green-700 mb-2">Employee Details</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-gray-600">Name</span>
            <p className="font-medium">{calculationResult.employeeDetails.name}</p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Department</span>
            <p className="font-medium">{calculationResult.employeeDetails.department}</p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Month</span>
            <p className="font-medium">
              {monthNames[calculationResult.month - 1]} {calculationResult.year}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Working Days</span>
            <p className="font-medium">
              {calculationResult.attendance.presentDays}/{calculationResult.attendance.totalWorkingDays}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Meal Deduction Section (যদি থাকে) */}
      {calculationResult.mealSystemData?.mealDeduction?.amount > 0 && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
          <h4 className="text-sm font-medium text-red-700 mb-2">Meal Deduction</h4>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">
                {calculationResult.mealSystemData.mealDeduction.type === 'monthly_subscription' 
                  ? 'Monthly Subscription' 
                  : 'Daily Meal'}
              </span>
              <p className="text-xs text-gray-500">
                {calculationResult.mealSystemData.mealDeduction.calculationNote}
              </p>
            </div>
            <span className="text-lg font-bold text-red-600">
              -{formatCurrency(calculationResult.mealSystemData.mealDeduction.amount)}
            </span>
          </div>
        </div>
      )}

      {/* ✅ Onsite Benefits (যদি থাকে) */}
      {calculationResult.onsiteBenefits && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
          <h4 className="text-sm font-medium text-amber-700 mb-2">Onsite Benefits</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tea Allowance</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(calculationResult.onsiteBenefits.teaAllowance || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Service Charge</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(calculationResult.onsiteBenefits.serviceCharge || 0)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-700">Net Effect</span>
              <span className={`font-bold ${
                calculationResult.onsiteBenefits.netEffect >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {calculationResult.onsiteBenefits.netEffect >= 0 ? '+' : ''}
                {formatCurrency(calculationResult.onsiteBenefits.netEffect || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Earnings & Deductions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Earnings</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Basic Pay</span>
              <span className="font-medium">{formatCurrency(calculationResult.earnings.basicPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Overtime</span>
              <span className="font-medium">{formatCurrency(calculationResult.earnings.overtime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Bonus</span>
              <span className="font-medium">{formatCurrency(calculationResult.earnings.bonus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Allowance</span>
              <span className="font-medium">{formatCurrency(calculationResult.earnings.allowance)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Total Earnings</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(calculationResult.earnings.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
          <h4 className="text-sm font-medium text-red-700 mb-2">Deductions</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Late</span>
              <span className="font-medium">{formatCurrency(calculationResult.deductions.lateDeduction)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Absent</span>
              <span className="font-medium">{formatCurrency(calculationResult.deductions.absentDeduction)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Leave</span>
              <span className="font-medium">{formatCurrency(calculationResult.deductions.leaveDeduction)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Half Day</span>
              <span className="font-medium">{formatCurrency(calculationResult.deductions.halfDayDeduction)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Total Deductions</span>
              <span className="font-bold text-red-600">
                {formatCurrency(calculationResult.deductions.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Summary */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-purple-700">Net Payable</h4>
            <p className="text-xs text-gray-500">After all calculations</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(calculationResult.summary.netPayable)}
            </p>
          </div>
        </div>
      </div>

      {/* Create Payroll Button */}
      <button
        onClick={() => {
          setCreateForm({
            employeeId: calculateForm.employeeId,
            month: calculateForm.month,
            year: calculateForm.year,
            monthlySalary: calculateForm.monthlySalary || 
                         employeeSalaries[calculateForm.employeeId]?.salary || "30000",
            overtime: "0",
            bonus: "0",
            allowance: "0",
            dailyMealRate: "0",
            manualMealAmount: "0",
            notes: `Calculated payroll for ${monthNames[calculateForm.month - 1]} ${calculateForm.year}`
          });
          setShowCalculateModal(false);
          setShowCreateModal(true);
        }}
        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <FileText size={18} />
        Create Payroll from Calculation
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );

  const renderBulkModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Generate Payrolls</h2>
              <p className="text-gray-500 text-sm mt-1">Generate payrolls for all active employees</p>
            </div>
            <button 
              onClick={() => setShowBulkModal(false)} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleBulkGenerate} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <select
                value={bulkForm.month}
                onChange={(e) => setBulkForm({ ...bulkForm, month: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
                value={bulkForm.year}
                onChange={(e) => setBulkForm({ ...bulkForm, year: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>
 
<div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
  <h4 className="text-sm font-medium text-green-700 mb-2">Generation Info</h4>
  <ul className="text-sm text-gray-600 space-y-1">
    <li className="flex items-center gap-2">
      <Check size={14} className="text-green-500" />
      Will create payrolls for {employees.length} active employees
    </li>
    <li className="flex items-center gap-2">
      <Check size={14} className="text-green-500" />
      Uses same calculation as Create Payroll
    </li>
    <li className="flex items-center gap-2">
      <Check size={14} className="text-green-500" />
      Automatic meal deduction calculation
    </li>
    <li className="flex items-center gap-2">
      <Check size={14} className="text-green-500" />
      Onsite benefits auto-applied
    </li>
    <li className="flex items-center gap-2">
      <Check size={14} className="text-green-500" />
      Existing payrolls will be skipped
    </li>
    <li className="flex items-center gap-2">
      <Check size={14} className="text-green-500" />
      Uses 23 days fixed calculation basis
    </li>
  </ul>
  
  {/* Additional Info */}
  <div className="mt-3 pt-3 border-t border-green-200">
    <div className="text-xs text-gray-500">
      <p><strong>Calculation Rules:</strong></p>
      <ul className="mt-1 space-y-1">
        <li>• Monthly Salary ÷ 23 = Daily Rate</li>
        <li>• Daily Rate ÷ 8 = Hourly Rate</li>
        <li>• Meal deduction auto-calculated from meal system</li>
        <li>• Onsite benefits auto-applied based on employee type</li>
        <li>• Attendance calculated from system records</li>
      </ul>
    </div>
  </div>
</div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              disabled={loading.generate}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.generate}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.generate ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Generate All
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderExportModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Payroll Data</h2>
              <p className="text-gray-500 text-sm mt-1">Download payroll records</p>
            </div>
            <button 
              onClick={() => setShowExportModal(false)} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-4 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${exportFormat === 'json' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <FileText size={18} />
                JSON
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-4 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${exportFormat === 'csv' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <FileSpreadsheet size={18} />
                CSV
              </button>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <h4 className="text-sm font-medium text-orange-700 mb-2">Export Details</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Selected Month:</span>
                <span className="font-medium">{selectedMonth === "all" ? "All Months" : monthNames[selectedMonth - 1]}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Year:</span>
                <span className="font-medium">{selectedYear}</span>
              </div>
              <div className="flex justify-between">
                <span>Records:</span>
                <span className="font-medium">{filteredPayrolls.length} payrolls</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              disabled={loading.action}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading.action}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.action ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsModal = () => {
    if (!selectedPayroll) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {getMonthName(selectedPayroll.month)} {selectedPayroll.year} • {selectedPayroll.employeeName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayroll.status).bg} ${getStatusColor(selectedPayroll.status).text}`}>
                  {selectedPayroll.status}
                </span>
                {selectedPayroll.employeeAccepted && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Accepted by Employee
                  </span>
                )}
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-3">Employee Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="font-medium">{selectedPayroll.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Employee ID</span>
                    <span className="font-medium">{selectedPayroll.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="font-medium">{selectedPayroll.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Designation</span>
                    <span className="font-medium">{selectedPayroll.designation}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <h3 className="text-sm font-medium text-purple-700 mb-3">Payroll Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Period</span>
                    <span className="font-medium">
                      {getMonthName(selectedPayroll.month)} {selectedPayroll.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Working Days</span>
                    <span className="font-medium">
                      {selectedPayroll.attendance?.presentDays || 23}/{selectedPayroll.attendance?.totalWorkingDays || 23}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Salary</span>
                    <span className="font-medium">
                      {formatCurrency(selectedPayroll.salaryDetails?.monthlySalary || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">Net Payable</span>
                    <span className="text-lg font-bold text-purple-600">
                      {formatCurrency(selectedPayroll.summary?.netPayable || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-3">Earnings</h3>
                <div className="space-y-2 p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Basic Pay</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.basicPay || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overtime</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.overtime?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bonus</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.bonus?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Allowance</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.earnings?.allowance?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(selectedPayroll.summary?.grossEarnings || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-red-700 mb-3">Deductions</h3>
                <div className="space-y-2 p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Late Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.lateDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Absent Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.absentDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Leave Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.leaveDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Half Day Deduction</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.deductions?.halfDayDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">Total Deductions</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(selectedPayroll.deductions?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Attendance Details</h3>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Total Days</span>
                    <p className="text-lg font-bold text-gray-900">{selectedPayroll.attendance?.totalWorkingDays || 23}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Present Days</span>
                    <p className="text-lg font-bold text-green-600">{selectedPayroll.attendance?.presentDays || 23}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Absent Days</span>
                    <p className="text-lg font-bold text-red-600">{selectedPayroll.attendance?.absentDays || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Attendance %</span>
                    <p className="text-lg font-bold text-blue-600">{selectedPayroll.attendance?.attendancePercentage || 100}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Close
              </button>
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-300 flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!selectedPayroll) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Payroll</h2>
                <p className="text-gray-500 text-sm mt-1">This action cannot be undone</p>
              </div>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayroll(null);
                }} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-600">
                You are about to delete payroll for <span className="font-semibold">{selectedPayroll.employeeName}</span> 
                ({getMonthName(selectedPayroll.month)} {selectedPayroll.year})
              </p>
              <p className="text-sm text-gray-500 mt-2">Amount: {formatCurrency(selectedPayroll.summary?.netPayable || 0)}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayroll(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePayroll(selectedPayroll._id)}
                disabled={loading.action}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading.action ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Payroll
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAllPayrollsModal = () => (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Payroll Records</h2>
            <p className="text-gray-500 text-sm mt-1">
              Total {allPayrollsView.length} payroll records • {employees.length} employees
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllPayrollsModal(false)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
            <div className="text-sm text-blue-600 font-medium">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <div className="text-sm text-green-600 font-medium">Paid Payrolls</div>
            <div className="text-2xl font-bold text-gray-900">
              {allPayrollsView.filter(p => p.status?.toLowerCase() === 'paid').length}
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
            <div className="text-sm text-yellow-600 font-medium">Pending</div>
            <div className="text-2xl font-bold text-gray-900">
              {allPayrollsView.filter(p => p.status?.toLowerCase() === 'pending').length}
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
            <div className="text-sm text-purple-600 font-medium">Avg per Payroll</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(allPayrollsView.length > 0 ? 
                allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0) / allPayrollsView.length : 0
              )}
            </div>
          </div>
        </div>

        {/* <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search employee, department or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Years</option>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Months</option>
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              {statusOptions.slice(1).map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div> */}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewType('table')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${viewType === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <List size={18} />
              Table View
            </button>
            <button
              onClick={() => setViewType('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${viewType === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <Grid size={18} />
              Grid View
            </button>
            <button
              onClick={() => setViewType('grouped')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${viewType === 'grouped' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <Layers size={18} />
              Grouped View
            </button>
          </div>
          
          {viewType === 'grouped' && (
            <div className="flex gap-2">
              <button
                onClick={() => setGroupedBy('month')}
                className={`px-3 py-1 rounded-lg ${groupedBy === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                By Month
              </button>
              <button
                onClick={() => setGroupedBy('department')}
                className={`px-3 py-1 rounded-lg ${groupedBy === 'department' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                By Department
              </button>
              <button
                onClick={() => setGroupedBy('employee')}
                className={`px-3 py-1 rounded-lg ${groupedBy === 'employee' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                By Employee
              </button>
            </div>
          )}
        </div>

        {loading.allView ? (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading all payroll records...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
            </div>
          </div>
        ) : allPayrollsView.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records found</h3>
              <p className="text-gray-500">Try adjusting your filters or create new payrolls</p>
            </div>
          </div>
        ) : viewType === 'table' ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr> 
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary Details
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {userRole === 'admin' && (
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee Accepted
                      </th>
                    )}
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Payable
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {allPayrollsView.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{payroll.employeeName}</div>
                          <div className="text-sm text-gray-500">{payroll.designation}</div>
                          <div className="text-xs text-gray-400">{payroll.employeeId}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">
                          {payroll.monthName} {payroll.year}
                        </div>
                        <div className="text-xs text-gray-500">
                          Days: {payroll.attendance?.presentDays || 0}/{payroll.attendance?.totalWorkingDays || 23}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {payroll.department}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="text-gray-600">Basic: {formatCurrency(payroll.earnings?.basicPay || 0)}</div>
                          <div className="text-gray-600">Overtime: {formatCurrency(payroll.earnings?.overtime?.amount || 0)}</div>
                          <div className="text-gray-600">Bonus: {formatCurrency(payroll.earnings?.bonus?.amount || 0)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                          {getStatusColor(payroll.status).icon}
                          {payroll.status}
                        </span>
                        {payroll.payment?.paymentDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid: {formatDate(payroll.payment.paymentDate)}
                          </div>
                        )}
                      </td>
                      {userRole === 'admin' && (
                        <td className="py-4 px-6">
                          {payroll.employeeAccepted ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              ✓ Accepted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Pending
                            </span>
                          )}
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900 text-lg">
                          {formatCurrency(payroll.netPayable)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Deductions: {formatCurrency(payroll.deductions?.total || 0)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayroll(payroll);
                              setShowDetailsModal(true);
                              setShowAllPayrollsModal(false);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPayrollsView.map((payroll) => (
              <div key={payroll._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{payroll.employeeName}</h4>
                    <p className="text-sm text-gray-500">{payroll.designation}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                    {payroll.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Period</span>
                    <span className="font-medium">{payroll.monthName} {payroll.year}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="font-medium">{payroll.department}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Working Days</span>
                    <span className="font-medium">{payroll.attendance?.presentDays || 0}/{payroll.attendance?.totalWorkingDays || 23}</span>
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Accepted</span>
                      <span className={`font-medium ${payroll.employeeAccepted ? 'text-green-600' : 'text-yellow-600'}`}>
                        {payroll.employeeAccepted ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Net Payable</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(payroll.netPayable)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Basic: {formatCurrency(payroll.earnings?.basicPay || 0)}</span>
                    <span>Deductions: {formatCurrency(payroll.deductions?.total || 0)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPayroll(payroll);
                      setShowDetailsModal(true);
                      setShowAllPayrollsModal(false);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPayrolls).map(([key, group]) => (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {groupedBy === 'month' 
                        ? `${getMonthName(parseInt(key.split('-')[1]))} ${key.split('-')[0]}`
                        : key}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {group.count} payrolls • {group.employees.size} employees • Total: {formatCurrency(group.total)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {formatCurrency(group.total)}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Employee</th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Amount</th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Status</th>
                        {userRole === 'admin' && (
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Accepted</th>
                        )}
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.payrolls.map((payroll) => (
                        <tr key={payroll._id} className="border-t border-gray-100">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{payroll.employeeName}</div>
                              <div className="text-xs text-gray-500">{payroll.designation}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{formatCurrency(payroll.netPayable)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payroll.status).bg} ${getStatusColor(payroll.status).text}`}>
                              {payroll.status}
                            </span>
                          </td>
                          {userRole === 'admin' && (
                            <td className="py-3 px-4">
                              {payroll.employeeAccepted ? (
                                <span className="text-xs text-green-600">✓ Accepted</span>
                              ) : (
                                <span className="text-xs text-yellow-600">Pending</span>
                              )}
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDetailsModal(true);
                                setShowAllPayrollsModal(false);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Records</div>
              <div className="text-2xl font-bold text-gray-900">{allPayrollsView.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Payable Amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Average per Employee</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(allPayrollsView.length > 0 ? 
                  allPayrollsView.reduce((sum, p) => sum + (p.netPayable || 0), 0) / allPayrollsView.length : 0
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {allPayrollsView.length} records
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  const csvData = [
                    ['Employee Name', 'Employee ID', 'Department', 'Month', 'Year', 'Basic Salary', 'Overtime', 'Bonus', 'Allowance', 'Deductions', 'Net Payable', 'Status', 'Payment Date', 'Employee Accepted'],
                    ...allPayrollsView.map(p => [
                      p.employeeName,
                      p.employeeId,
                      p.department,
                      p.monthName,
                      p.year,
                      p.earnings?.basicPay || 0,
                      p.earnings?.overtime?.amount || 0,
                      p.earnings?.bonus?.amount || 0,
                      p.earnings?.allowance?.amount || 0,
                      p.deductions?.total || 0,
                      p.netPayable || 0,
                      p.status,
                      p.payment?.paymentDate ? formatDate(p.payment.paymentDate) : 'N/A',
                      p.employeeAccepted ? 'Yes' : 'No'
                    ])
                  ];
                  
                  const csvContent = csvData.map(row => row.join(',')).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `all_payrolls_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  
                  toast.success('CSV exported successfully');
                } catch (error) {
                  toast.error('Failed to export CSV');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 flex items-center gap-2"
            >
              <FileSpreadsheet size={16} />
              Export as CSV
            </button> 
          </div>
        </div>
      </div>
    </div>
  </div>
);

  // ==================== MAIN RENDER ====================
  const months = [
    { value: "all", label: "All Months" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return year;
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Paid", label: "Paid" },
    { value: "Processing", label: "Processing" },
    { value: "Rejected", label: "Rejected" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    { value: "IT", label: "IT Department" },
    { value: "HR", label: "Human Resources" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" },
    { value: "Admin", label: "Administration" },
    { value: "Accounts", label: "Accounts" },
    { value: "Production", label: "Production" }
  ];

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Render Modals */}
      {showCreateModal && renderCreateModal()}
      {showCalculateModal && renderCalculateModal()}
      {showBulkModal && renderBulkModal()}
      {showDetailsModal && renderDetailsModal()}
      {showDeleteModal && renderDeleteModal()}
      {showExportModal && renderExportModal()}
      {showAllPayrollsModal && renderAllPayrollsModal()}
      {employeeDetailsModal && renderEmployeeDetailsModal()}
      {showPreviewModal && renderPreviewModal()}
        {/* New modals */}
  {showEditModal && renderEditModal()}
  {showAdminAllModal && renderAdminAllModal()}
  {employeeDetailsModal && renderEmployeeDetailsModal()}
  {showPreviewModal && renderPreviewModal()}
      {/* Main Page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Payroll Management
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">Manage and process employee payrolls</p>
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    userRole === 'admin' 
                      ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800' 
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                  }`}>
                    <Shield size={12} />
                    {userRole === 'admin' ? 'ADMIN' : 'EMPLOYEE'}
                    {userRole !== 'admin' && " (View Only)"}
                  </span>
                )}
                {apiConnected && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                    <Server size={10} /> API Connected
                  </span>
                )}
                {userRole === 'admin' && lastUpdated && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    Auto-refresh: 10s
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={loading.payrolls}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading.payrolls ? "animate-spin" : ""} />
                Refresh
              </button>
              
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={async () => {
                      setShowAllPayrollsModal(true);
                      await loadAllPayrollsForView();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Eye size={18} />
                    View All Payrolls
                  </button> 
                </>
              )}
            </div>
          </div>

          {isEmployeeView && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <UserCheck size={20} /> Employee Payroll View
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    {payrolls.length > 0 
                      ? `You have ${payrolls.length} payroll record(s)` 
                      : 'No payroll records found. Contact HR if you believe this is an error.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-gray-500">Employee ID: {userData?.employeeId || userId?.substring(0, 8) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Receipt size={16} /> {isEmployeeView ? 'My Payrolls' : 'Total Payrolls'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {payrolls.length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedMonth !== "all" ? getMonthName(selectedMonth) : "All Months"} {selectedYear}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Banknote size={16} /> {isEmployeeView ? 'My Total Payable' : 'Total Payable'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.totalNetPayable)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">Net amount</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Banknote className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Clock size={16} /> {isEmployeeView ? 'Pending' : 'Pending'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalPending}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(stats.totalPending / Math.max(payrolls.length, 1)) * 100 || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round((stats.totalPending / Math.max(payrolls.length, 1)) * 100) || 0}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <BarChart size={16} /> {isEmployeeView ? 'My Monthly' : 'Monthly Expense'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.monthlyExpense)}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Current month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <BarChart className="text-white" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between group"
            >
              <div className="text-left">
                <p className="font-semibold">Create Payroll</p>
                <p className="text-sm opacity-90">Single employee</p>
              </div>
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* <button 
              onClick={() => setShowCalculateModal(true)} 
              disabled={loading.employees} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between group disabled:opacity-50"
            >
              <div className="text-left">
                <p className="font-semibold">Calculate</p>
                <p className="text-sm opacity-90">Preview calculation</p>
              </div>
              {loading.employees ? <Loader2 size={24} className="animate-spin" /> : <Calculator size={24} className="group-hover:scale-110 transition-transform duration-300" />}
            </button> */}

            <button 
              onClick={() => setShowBulkModal(true)} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 hover:opacity-90 flex items-center justify-between group"
            >
              <div className="text-left">
                <p className="font-semibold">Bulk Generate</p>
                <p className="text-sm opacity-90">All employees</p>
              </div>
              <UsersIcon size={24} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <h3 className="font-medium text-gray-700">Filters</h3>
              {(searchTerm || selectedMonth !== "all" || selectedStatus !== "all" || selectedDepartment !== "all" || selectedYear !== new Date().getFullYear()) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                >
                  <FilterX size={12} />
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={isEmployeeView ? "Search your payrolls..." : "Search employees or ID..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full transition-all duration-300"
                />
              </div>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[120px]"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[140px]"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              
              {!isEmployeeView && (
                <>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[140px]"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 min-w-[160px]"
                  >
                    {departmentOptions.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEmployeeView ? 'My Payrolls' : 'Payroll Records'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Showing {filteredPayrolls.length} of {payrolls.length} records
                  {!isEmployeeView && (
                    <span className="ml-2 text-blue-600 font-medium">
                      {userRole === 'admin' ? '(Admin View)' : '(View Only)'}
                    </span>
                  )}
                </p>
              </div> 
            </div>
          </div>

          {loading.payrolls ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading payroll data...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
              </div>
            </div>
          ) : filteredPayrolls.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FileText className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {isEmployeeView ? 'No payroll records found' : 'No payroll records available'}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {searchTerm || selectedStatus !== 'all' || selectedDepartment !== 'all'
                    ? 'Try adjusting your search or filters' 
                    : isEmployeeView 
                      ? 'You have no payroll records yet. Contact HR for assistance.'
                      : 'Get started by creating your first payroll'}
                </p>
                {userRole === 'admin' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Create Payroll
                    </button>
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Users size={18} />
                      Bulk Generate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        Employee
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {userRole === 'admin' && (
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
  {filteredPayrolls.map((payroll) => (
    <tr key={payroll._id} className="hover:bg-gray-50 transition-colors duration-150 group">
      {/* Employee Info */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
            <User className="text-blue-600" size={18} />
          </div>
          <div>
            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {payroll.employeeName || getEmployeeName(payroll)}
              
            </div>
            <div className="text-sm text-gray-500">{payroll.department}</div>
            <div className="text-xs text-gray-400">{payroll.employeeId}</div>
          </div>
        </div>
      </td>
      
      {/* Period */}
      <td className="py-4 px-6">
        <div className="text-sm text-gray-900 font-medium">
          {getMonthName(payroll.month)} {payroll.year}
        </div>
        <div className="text-xs text-gray-500">
          {payroll.periodStart ? formatDate(payroll.periodStart) : 'N/A'} - {payroll.periodEnd ? formatDate(payroll.periodEnd) : 'N/A'}
        </div>
      </td>
      
      {/* Amount */}
          <td className="py-4 px-6">
      <div className="font-bold text-gray-900">
        {formatCurrency(payroll.summary?.netPayable || 0)}
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <div>Basic: {formatCurrency(payroll.earnings?.basicPay || 0)}</div>
        {payroll.mealSystemData?.mealDeduction?.amount > 0 && (
          <div className="text-red-500">
            Meal: -{formatCurrency(payroll.mealSystemData.mealDeduction.amount)}
          </div>
        )}
        {payroll.onsiteBenefitsDetails?.netEffect > 0 && (
          <div className="text-amber-600">
            Onsite: +{formatCurrency(payroll.onsiteBenefitsDetails.netEffect)}
          </div>
        )}
        {payroll.deductions?.total > 0 && payroll.deductions.total !== payroll.mealSystemData?.mealDeduction?.amount && (
          <div className="text-red-400">
            Other Deductions: -{formatCurrency(payroll.deductions.total - (payroll.mealSystemData?.mealDeduction?.amount || 0))}
          </div>
        )}
      </div>
    </td>
      
      {/* Status - আলাদা column */}
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1">
          {/* Main Status */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
            payroll.employeeAccepted?.accepted 
              ? 'bg-green-100 text-green-800' 
              : payroll.status === 'Paid'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {payroll.employeeAccepted?.accepted ? (
              <>
                <CheckCircle size={12} />
                Accepted
              </>
            ) : payroll.status === 'Paid' ? (
              <>
                <CheckCircle size={12} />
                Paid
              </>
            ) : (
              <>
                <Clock size={12} />
                Pending
              </>
            )}
          </span>
          
          {/* Acceptance Date */}
          {payroll.employeeAccepted?.accepted && (
            <div className="text-xs text-green-600">
              ✓ Accepted on {formatDate(payroll.employeeAccepted.acceptedAt)}
            </div>
          )}
        </div>
      </td>
      
      {/* Actions - শুধু Employee View এর জন্য */}
      {isEmployeeView && (
  <td className="py-4 px-6">
    <div className="flex gap-2 flex-wrap">
      {/* View Details Button */}
      <button
        onClick={() => viewEmployeePayrollDetails(payroll._id)}
        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm transition-colors flex items-center gap-1"
      >
        <Eye size={14} />
        View Details
      </button>
            {/* ✅ NEW: PDF Button for Employee */}
     <button
  onClick={() => generateSinglePayrollPDF(payroll._id)}
  disabled={pdfLoading}
  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors flex items-center gap-1"
>
  <FileDown size={14} />
  PDF
</button>
      {/* Accept Button - Only for pending payrolls */}
      {payroll.status === 'Pending' && !payroll.employeeAccepted?.accepted && (
        <button
          onClick={() => handleEmployeeAccept(payroll._id)}
          disabled={acceptingPayroll}
          className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
            acceptingPayroll 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {acceptingPayroll ? (
            <>
              <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Accepting...
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              Accept Payroll
            </>
          )}
        </button>
      )}
      
      {/* Accepted Status */}
      {payroll.employeeAccepted?.accepted && (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm flex items-center gap-1">
          <CheckCircle size={14} />
          Accepted
        </span>
      )} 
{userRole === 'admin' && payroll.status !== 'Paid' && !payroll.employeeAccepted?.accepted && (
  <button
    onClick={() => handleOpenEditModal(payroll)}
    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
    title="Edit Payroll"
  >
    <Edit size={18} />
  </button>
)}
    </div>
  </td>
)}
      
      {/* Admin Actions (if needed) */}
      {!isEmployeeView && userRole === 'admin' && (
        <td className="py-4 px-6">
                                {userRole === 'admin' && (
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <button
        onClick={() => viewPayrollDetailsAdmin(payroll._id)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        title="View Details"
      >
        <Eye size={18} />
      </button> 
      {/* ✅ NEW: PDF Button for Admin */}
        <button
    onClick={() => generateSinglePayrollPDF(payroll._id)}
    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
    title="Generate PDF"
  >
    <FileDown size={18} />
  </button>
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                            {!isEmployeeView && userRole === 'admin' && (
  <td className="py-4 px-6">
    <div className="flex items-center gap-1"> 
      
      {/* ✅ EDIT BUTTON - শুধু Pending payroll এর জন্য */}
      {payroll.status === 'Pending' && !payroll.employeeAccepted?.accepted && (
        <button
          onClick={() => handleOpenEditModal(payroll)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
          title="Edit Payroll"
        >
          <Edit size={18} />
        </button>
      )}   
    </div>
  </td>
)}
                          </div>
                        </td>
                      )}
        </td>
      )}
    </tr>

  ))}
</tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Employees</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Processed This Month</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProcessed}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Average Salary</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageSalary)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Deductions</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalDeductions)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}