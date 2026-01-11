"use client"
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper Functions for PDF Generation
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

const convertToWords = (num) => {
  if (num === 0) return 'Zero Taka Only';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  
  return str.trim() + ' Taka Only';
};

const getEmployeeName = (employee) => {
  if (!employee) return 'Unknown Employee';
  
  if (employee.firstName || employee.lastName) {
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  }
  
  if (employee.name) {
    return employee.name;
  }
  
  if (employee.employeeName) {
    return employee.employeeName;
  }
  
  return 'Unknown Employee';
};

// ১. Individual Employee Payroll PDF ফাংশন
const generateEmployeePayrollPDF = (employee, payrolls = []) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Colors
    const primaryColor = [79, 70, 229]; // Purple
    const secondaryColor = [236, 72, 153]; // Pink
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("A2IT HRM SYSTEM", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Employee Payroll Details", 105, 30, { align: "center" });
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 190, 15, { align: "right" });
    
    // Employee Information Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Information", 20, 55);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 57, 190, 57);
    
    // Employee Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Employee Name: ${getEmployeeName(employee)}`, 20, 65);
    doc.text(`Employee ID: ${employee.employeeId || employee._id?.substring(0, 8)}`, 20, 71);
    doc.text(`Email: ${employee.email || 'N/A'}`, 20, 77);
    doc.text(`Phone: ${employee.phone || 'N/A'}`, 20, 83);
    doc.text(`Department: ${employee.department || 'N/A'}`, 110, 65);
    doc.text(`Designation: ${employee.designation || 'Employee'}`, 110, 71);
    doc.text(`Joining Date: ${employee.joiningDate ? formatDate(employee.joiningDate) : 'N/A'}`, 110, 77);
    doc.text(`Status: ${employee.status || 'Active'}`, 110, 83);
    
    let finalY = 90;
    
    // Payroll Summary Section
    if (payrolls.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Payroll Summary", 20, finalY);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, finalY + 2, 190, finalY + 2);
      
      finalY += 10;
      
      // Calculate totals
      const totalPayrolls = payrolls.length;
      const totalAmount = payrolls.reduce((sum, p) => sum + (p.summary?.netPayable || p.netSalary || 0), 0);
      const totalPaid = payrolls.filter(p => p.status === 'Paid').length;
      const totalPending = payrolls.filter(p => p.status === 'Pending').length;
      const avgAmount = totalPayrolls > 0 ? totalAmount / totalPayrolls : 0;
      
      // Summary Table
      doc.autoTable({
        startY: finalY,
        margin: { left: 20, right: 20 },
        head: [['Summary', 'Count', 'Amount']],
        body: [
          ['Total Payrolls', totalPayrolls, ''],
          ['Paid Payrolls', totalPaid, ''],
          ['Pending Payrolls', totalPending, ''],
          ['Total Amount Paid', '', formatCurrency(totalAmount)],
          ['Average per Payroll', '', formatCurrency(avgAmount)]
        ],
        theme: 'grid',
        headStyles: { fillColor: secondaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 50, halign: 'right' }
        }
      });
      
      finalY = doc.lastAutoTable.finalY + 15;
      
      // Individual Payrolls Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Payroll Details", 20, finalY);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, finalY + 2, 190, finalY + 2);
      
      finalY += 10;
      
      // Prepare payroll data
      const payrollData = payrolls.map((p, index) => [
        index + 1,
        `${formatDate(p.periodStart)} - ${formatDate(p.periodEnd)}`,
        p.month ? `${monthNames[p.month - 1]} ${p.year}` : 'N/A',
        formatCurrency(p.earnings?.basicPay || p.basicPay || 0),
        formatCurrency(p.deductions?.total || 0),
        formatCurrency(p.summary?.netPayable || p.netSalary || 0),
        p.status
      ]);
      
      // Payrolls Table
      doc.autoTable({
        startY: finalY,
        margin: { left: 20, right: 20 },
        head: [['#', 'Period', 'Month-Year', 'Basic Pay', 'Deductions', 'Net Payable', 'Status']],
        body: payrollData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' },
          6: { cellWidth: 25, halign: 'center' }
        },
        styles: { fontSize: 8, cellPadding: 3 },
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, 290);
          doc.text('A2IT HRM System - Confidential', 105, 290, { align: "center" });
          doc.text(`Employee: ${getEmployeeName(employee)}`, 190, 290, { align: "right" });
        }
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("No payroll records found for this employee.", 105, finalY + 10, { align: "center" });
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("This document is generated by A2IT HRM System", 105, 285, { align: "center" });
    doc.text("Confidential - For official use only", 105, 290, { align: "center" });
    
    // Save the PDF
    const fileName = `${getEmployeeName(employee).replace(/\s+/g, '_')}_Payroll_${Date.now()}.pdf`;
    doc.save(fileName);
    
    toast.success(`PDF generated: ${fileName}`);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF');
  }
};

// ২. Single Payroll PDF ফাংশন (Payroll Slip)
const generateSinglePayrollPDF = (payroll, employee) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Colors
    const primaryColor = [79, 70, 229];
    const secondaryColor = [236, 72, 153];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("PAYROLL SLIP", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Salary Payment Advice", 105, 30, { align: "center" });
    
    // Company Info
    doc.setFontSize(9);
    doc.text("A2IT Limited", 20, 50);
    doc.text("HR Department", 20, 55);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 190, 50, { align: "right" });
    doc.text(`Slip No: ${payroll._id?.substring(0, 8) || 'N/A'}`, 190, 55, { align: "right" });
    
    // Employee Info Box
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 65, 170, 30, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 65, 170, 30);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Employee Information", 25, 75);
    
    const employeeName = getEmployeeName(employee);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${employeeName}`, 25, 82);
    doc.text(`ID: ${employee.employeeId || employee._id?.substring(0, 8)}`, 25, 87);
    doc.text(`Period: ${formatDate(payroll.periodStart)} - ${formatDate(payroll.periodEnd)}`, 105, 82);
    doc.text(`Status: ${payroll.status}`, 105, 87);
    
    if (payroll.month && payroll.year) {
      doc.text(`Month: ${monthNames[payroll.month - 1]} ${payroll.year}`, 105, 92);
    }
    
    // Salary Details Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Salary Details", 20, 110);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 112, 190, 112);
    
    // Earnings Table
    const earningsY = 120;
    doc.autoTable({
      startY: earningsY,
      margin: { left: 20, right: 20 },
      head: [['Earnings', 'Amount (BDT)']],
      body: [
        ['Basic Salary', formatCurrency(payroll.earnings?.basicPay || payroll.basicPay || 0)],
        ['Overtime', formatCurrency(payroll.earnings?.overtime || 0)],
        ['Bonus', formatCurrency(payroll.earnings?.bonus || 0)],
        ['Allowance', formatCurrency(payroll.earnings?.allowance || 0)],
        ['', ''],
        ['Total Earnings', formatCurrency(payroll.earnings?.total || (payroll.earnings?.basicPay || 0))]
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // Deductions Table
    const deductionsY = doc.lastAutoTable.finalY + 10;
    doc.autoTable({
      startY: deductionsY,
      margin: { left: 20, right: 20 },
      head: [['Deductions', 'Amount (BDT)']],
      body: [
        ['Late Deduction', formatCurrency(payroll.deductions?.lateDeduction || 0)],
        ['Absent Deduction', formatCurrency(payroll.deductions?.absentDeduction || 0)],
        ['Leave Deduction', formatCurrency(payroll.deductions?.leaveDeduction || 0)],
        ['Other Deductions', formatCurrency((payroll.deductions?.total || 0) - 
          (payroll.deductions?.lateDeduction || 0) - 
          (payroll.deductions?.absentDeduction || 0) - 
          (payroll.deductions?.leaveDeduction || 0))],
        ['', ''],
        ['Total Deductions', formatCurrency(payroll.deductions?.total || 0)]
      ],
      theme: 'grid',
      headStyles: { fillColor: secondaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // Net Payable Section
    const netY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, netY, 170, 25, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, netY, 170, 25);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Net Payable Amount:", 30, netY + 10);
    
    const netAmount = payroll.summary?.netPayable || payroll.netSalary || 0;
    doc.setTextColor(79, 70, 229);
    doc.text(formatCurrency(netAmount), 150, netY + 10, { align: "right" });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`In Words: ${convertToWords(netAmount)}`, 30, netY + 18);
    
    // Attendance Summary
    const attendanceY = netY + 35;
    if (payroll.attendance) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Attendance Summary", 20, attendanceY);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, attendanceY + 2, 190, attendanceY + 2);
      
      doc.autoTable({
        startY: attendanceY + 5,
        margin: { left: 20, right: 20 },
        body: [
          ['Present Days', payroll.attendance.presentDays || 0],
          ['Working Days', payroll.attendance.totalWorkingDays || 30],
          ['Absent Days', (payroll.attendance.totalWorkingDays || 30) - (payroll.attendance.presentDays || 0)],
          ['Attendance %', `${Math.round(((payroll.attendance.presentDays || 0) / (payroll.attendance.totalWorkingDays || 30)) * 100)}%`]
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 70, halign: 'center' }
        }
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Approved by HR Department", 105, 280, { align: "center" });
    doc.text("A2IT Limited - Confidential Document", 105, 285, { align: "center" });
    doc.text("For any discrepancy, contact HR within 7 days", 105, 290, { align: "center" });
    
    // Save PDF
    const fileName = `Payroll_${employeeName.replace(/\s+/g, '_')}_${formatDate(payroll.periodStart).replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    toast.success(`Payroll slip generated: ${fileName}`);
    
  } catch (error) {
    console.error('Single payroll PDF error:', error);
    toast.error('Failed to generate payroll slip');
  }
};

// ৩. Month-Wise Bulk PDF ফাংশন
const generateMonthWiseBulkPDF = (monthYearData, employees, payrolls) => {
  try {
    const { month, year } = monthYearData;
    
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    // Colors
    const primaryColor = [79, 70, 229];
    const secondaryColor = [59, 130, 246];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 297, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("MONTHLY PAYROLL REPORT", 148.5, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(`${monthNames[month - 1]} ${year}`, 148.5, 30, { align: "center" });
    
    // Report Info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 280, 15, { align: "right" });
    doc.text(`Total Employees: ${employees.length}`, 280, 20, { align: "right" });
    
    // Calculate monthly totals
    const employeeDetails = employees.map(emp => {
      const empPayrolls = payrolls.filter(p => {
        const isEmployeeMatch = p.employee === emp._id || p.employeeId === emp._id;
        const isMonthYearMatch = p.month === month && p.year === year;
        return isEmployeeMatch && isMonthYearMatch;
      });
      
      const totalAmount = empPayrolls.reduce((sum, p) => sum + (p.summary?.netPayable || p.netSalary || 0), 0);
      const status = empPayrolls.length > 0 ? empPayrolls[0].status : 'No Payroll';
      
      return {
        name: getEmployeeName(emp),
        designation: emp.designation || 'Employee',
        department: emp.department || 'N/A',
        payrollCount: empPayrolls.length,
        totalAmount,
        status
      };
    });
    
    const totalAmount = employeeDetails.reduce((sum, emp) => sum + emp.totalAmount, 0);
    
    // Employee Table
    doc.autoTable({
      startY: 50,
      margin: { left: 20, right: 20 },
      head: [['Employee', 'Designation', 'Department', 'Payroll Count', 'Total Amount', 'Status']],
      body: employeeDetails.map(emp => [
        emp.name,
        emp.designation,
        emp.department,
        emp.payrollCount,
        formatCurrency(emp.totalAmount),
        emp.status
      ]),
      theme: 'striped',
      headStyles: { fillColor: secondaryColor, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 40, halign: 'right' },
        5: { cellWidth: 30, halign: 'center' }
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, 200);
        doc.text('A2IT HRM - Monthly Payroll Report', 148.5, 200, { align: "center" });
        doc.text(`${monthNames[month - 1]} ${year}`, 280, 200, { align: "right" });
      }
    });
    
    // Summary Section
    const summaryY = doc.lastAutoTable.finalY + 10;
    
    // Calculate statistics
    const paidCount = employeeDetails.filter(emp => emp.status === 'Paid').length;
    const pendingCount = employeeDetails.filter(emp => emp.status === 'Pending').length;
    const avgAmount = employees.length > 0 ? totalAmount / employees.length : 0;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, summaryY, 257, 30, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, summaryY, 257, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Monthly Summary", 25, summaryY + 10);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Employees: ${employees.length}`, 25, summaryY + 18);
    doc.text(`Paid: ${paidCount}`, 100, summaryY + 18);
    doc.text(`Pending: ${pendingCount}`, 150, summaryY + 18);
    doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 200, summaryY + 18);
    doc.text(`Average per Employee: ${formatCurrency(avgAmount)}`, 25, summaryY + 25);
    
    // Save PDF
    const fileName = `Payroll_Report_${monthNames[month - 1]}_${year}_${Date.now()}.pdf`;
    doc.save(fileName);
    
    toast.success(`Monthly report generated: ${fileName}`);
    
  } catch (error) {
    console.error('Month-wise PDF error:', error);
    toast.error('Failed to generate monthly report');
  }
};

// ৪. Employee Salary Statement PDF ফাংশন
const generateEmployeeSalaryStatementPDF = (employee, payrolls = [], selectedMonthYear = null) => {
  try {
    // Filter payrolls for the employee
    const employeePayrolls = payrolls.filter(p => 
      p.employee === employee._id || p.employeeId === employee._id
    );
    
    // Filter by month-year if provided
    const filteredPayrolls = selectedMonthYear 
      ? employeePayrolls.filter(p => {
          let month, year;
          
          if (p.month && p.year) {
            month = p.month;
            year = p.year;
          } else if (p.periodStart) {
            const date = new Date(p.periodStart);
            month = date.getMonth() + 1;
            year = date.getFullYear();
          }
          
          return month === selectedMonthYear.month && year === selectedMonthYear.year;
        })
      : employeePayrolls;
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Colors
    const primaryColor = [59, 130, 246]; // Blue
    const secondaryColor = [16, 185, 129]; // Green
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("SALARY STATEMENT", 105, 25, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(selectedMonthYear 
      ? `${monthNames[selectedMonthYear.month - 1]} ${selectedMonthYear.year}` 
      : "All Time Statement", 
      105, 35, { align: "center" }
    );
    
    // Employee Info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Employee Details", 20, 65);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 67, 190, 67);
    
    const employeeInfo = [
      ['Employee Name:', getEmployeeName(employee)],
      ['Employee ID:', employee.employeeId || employee._id?.substring(0, 8)],
      ['Department:', employee.department || 'N/A'],
      ['Designation:', employee.designation || 'Employee'],
      ['Joining Date:', employee.joiningDate ? formatDate(employee.joiningDate) : 'N/A'],
      ['Statement Period:', selectedMonthYear 
        ? `${monthNames[selectedMonthYear.month - 1]} ${selectedMonthYear.year}`
        : 'All Records'
      ],
      ['Total Payrolls:', filteredPayrolls.length.toString()]
    ];
    
    doc.autoTable({
      startY: 70,
      margin: { left: 20, right: 20 },
      body: employeeInfo,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 110 }
      }
    });
    
    // Salary Summary
    const summaryY = doc.lastAutoTable.finalY + 10;
    
    // Calculate summary
    const totalAmount = filteredPayrolls.reduce((sum, p) => sum + (p.summary?.netPayable || p.netSalary || 0), 0);
    const totalBasic = filteredPayrolls.reduce((sum, p) => sum + (p.earnings?.basicPay || p.basicPay || 0), 0);
    const totalDeductions = filteredPayrolls.reduce((sum, p) => sum + (p.deductions?.total || 0), 0);
    const avgSalary = filteredPayrolls.length > 0 ? totalAmount / filteredPayrolls.length : 0;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, summaryY, 170, 35, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, summaryY, 170, 35);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Salary Summary", 25, summaryY + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total Payrolls: ${filteredPayrolls.length}`, 25, summaryY + 18);
    doc.text(`Total Basic Salary: ${formatCurrency(totalBasic)}`, 100, summaryY + 18);
    doc.text(`Total Deductions: ${formatCurrency(totalDeductions)}`, 25, summaryY + 25);
    doc.text(`Total Net Salary: ${formatCurrency(totalAmount)}`, 100, summaryY + 25);
    doc.text(`Average per Payroll: ${formatCurrency(avgSalary)}`, 25, summaryY + 32);
    
    // Detailed Payrolls
    const detailsY = summaryY + 45;
    
    if (filteredPayrolls.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Payrolls", 20, detailsY);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, detailsY + 2, 190, detailsY + 2);
      
      const payrollDetails = filteredPayrolls.map((p, index) => [
        index + 1,
        `${formatDate(p.periodStart)}`,
        `${formatDate(p.periodEnd)}`,
        formatCurrency(p.earnings?.basicPay || p.basicPay || 0),
        formatCurrency(p.deductions?.total || 0),
        formatCurrency(p.summary?.netPayable || p.netSalary || 0),
        p.status
      ]);
      
      doc.autoTable({
        startY: detailsY + 5,
        margin: { left: 20, right: 20 },
        head: [['#', 'Start Date', 'End Date', 'Basic Pay', 'Deductions', 'Net Payable', 'Status']],
        body: payrollDetails,
        theme: 'striped',
        headStyles: { fillColor: secondaryColor, textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' },
          6: { cellWidth: 25, halign: 'center' }
        },
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, 290);
          doc.text('Salary Statement - Confidential', 105, 290, { align: "center" });
          doc.text(`Employee: ${getEmployeeName(employee)}`, 190, 290, { align: "right" });
        }
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("No payroll records found for the selected period.", 105, detailsY + 10, { align: "center" });
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("This is an official salary statement", 105, 280, { align: "center" });
    doc.text("For any query, contact HR department", 105, 285, { align: "center" });
    
    // Save PDF
    const fileName = `Salary_Statement_${getEmployeeName(employee).replace(/\s+/g, '_')}_${
      selectedMonthYear ? `${monthNames[selectedMonthYear.month - 1]}_${selectedMonthYear.year}` : 'All'
    }_${Date.now()}.pdf`;
    
    doc.save(fileName);
    
    toast.success(`Salary statement generated: ${fileName}`);
    
  } catch (error) {
    console.error('Salary statement PDF error:', error);
    toast.error('Failed to generate salary statement');
  }
};

// ৫. Bulk All Employees PDF (একসাথে সব এমপ্লয়ির PDF)
const generateAllEmployeesPDF = (employees, payrolls) => {
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    // Colors
    const primaryColor = [79, 70, 229];
    const secondaryColor = [59, 130, 246];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 297, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ALL EMPLOYEES PAYROLL REPORT", 148.5, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Comprehensive Payroll Summary", 148.5, 30, { align: "center" });
    
    // Report Info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 280, 15, { align: "right" });
    doc.text(`Total Employees: ${employees.length}`, 280, 20, { align: "right" });
    
    // Prepare employee data
    const employeeData = employees.map(emp => {
      const empPayrolls = payrolls.filter(p => 
        p.employee === emp._id || p.employeeId === emp._id
      );
      
      const totalAmount = empPayrolls.reduce((sum, p) => sum + (p.summary?.netPayable || p.netSalary || 0), 0);
      const paidCount = empPayrolls.filter(p => p.status === 'Paid').length;
      const pendingCount = empPayrolls.filter(p => p.status === 'Pending').length;
      const lastPayroll = empPayrolls.length > 0 ? 
        formatDate(empPayrolls[0].periodStart) : 'N/A';
      
      return [
        getEmployeeName(emp),
        emp.designation || 'Employee',
        emp.department || 'N/A',
        empPayrolls.length,
        paidCount,
        pendingCount,
        formatCurrency(totalAmount),
        lastPayroll
      ];
    });
    
    // Total calculations
    const totalPayrolls = payrolls.length;
    const totalPaid = payrolls.filter(p => p.status === 'Paid').length;
    const totalPending = payrolls.filter(p => p.status === 'Pending').length;
    const totalAmount = payrolls.reduce((sum, p) => sum + (p.summary?.netPayable || p.netSalary || 0), 0);
    
    // Employee Table
    doc.autoTable({
      startY: 50,
      margin: { left: 20, right: 20 },
      head: [['Employee', 'Designation', 'Department', 'Total Payrolls', 'Paid', 'Pending', 'Total Amount', 'Last Payroll']],
      body: employeeData,
      theme: 'striped',
      headStyles: { fillColor: secondaryColor, textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 35, halign: 'right' },
        7: { cellWidth: 30, halign: 'center' }
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, 200);
        doc.text('A2IT HRM - All Employees Report', 148.5, 200, { align: "center" });
        doc.text(`Total Employees: ${employees.length}`, 280, 200, { align: "right" });
      }
    });
    
    // Summary Section
    const summaryY = doc.lastAutoTable.finalY + 10;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, summaryY, 257, 25, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, summaryY, 257, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Overall Summary", 25, summaryY + 10);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Employees: ${employees.length}`, 25, summaryY + 18);
    doc.text(`Total Payrolls: ${totalPayrolls}`, 100, summaryY + 18);
    doc.text(`Paid: ${totalPaid}`, 150, summaryY + 18);
    doc.text(`Pending: ${totalPending}`, 200, summaryY + 18);
    doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 25, summaryY + 25);
    
    // Save PDF
    const fileName = `All_Employees_Payroll_Report_${Date.now()}.pdf`;
    doc.save(fileName);
    
    toast.success(`All employees report generated: ${fileName}`);
    
  } catch (error) {
    console.error('All employees PDF error:', error);
    toast.error('Failed to generate all employees report');
  }
};

// Main Component
const Page = () => {
  // API Configuration - সঠিক API URL ইউজ করুন
  const API_BASE_URL = 'https://a2itserver.onrender.com/api/v1';
  
  // Add this function after your API_BASE_URL
  const savePayrollToMongoDB = async (payrollData) => {
    try {
      console.log('🚀 Attempting to save to MongoDB...');
      
      // Get authentication token
      const token = localStorage.getItem('adminToken') || localStorage.getItem('employeeToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Extract token if it starts with Bearer
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      
      // Prepare the payload
      const payload = {
        employee: payrollData.employee,
        employeeName: payrollData.employeeName,
        employeeId: payrollData.employeeId,
        periodStart: payrollData.periodStart,
        periodEnd: payrollData.periodEnd,
        status: payrollData.status || 'Pending',
        month: payrollData.month,
        year: payrollData.year,
        basicSalary: payrollData.salaryDetails?.basicSalary || payrollData.basicPay,
        monthlySalary: payrollData.salaryDetails?.monthlySalary || payrollData.monthlySalary,
        attendance: payrollData.attendance,
        earnings: payrollData.earnings,
        deductions: payrollData.deductions,
        summary: payrollData.summary,
        createdBy: payrollData.createdBy,
        createdRole: payrollData.createdRole,
        autoGenerated: true
      };
      
      console.log('📦 Payload for MongoDB:', payload);
      
      // Try multiple endpoints
      const endpoints = [
        '/payroll/create',
        '/payrollCreate',
        '/admin/payroll/create',
        '/payroll/add',
        '/api/payroll'
      ];
      
      let savedResponse = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${API_BASE_URL}${endpoint}`);
          
          const response = await axios.post(
            `${API_BASE_URL}${endpoint}`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`
              },
              timeout: 10000
            }
          );
          
          if (response.status === 200 || response.status === 201) {
            console.log(`✅ Success with endpoint: ${endpoint}`, response.data);
            savedResponse = response.data;
            break;
          }
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
          continue;
        }
      }
      
      if (!savedResponse) {
        throw new Error('All MongoDB endpoints failed');
      }
      
      return savedResponse;
      
    } catch (error) {
      console.error('❌ MongoDB save error:', error);
      throw error;
    }
  };

  const router = useRouter();
  
  // State declarations
  const [showEmployeeWiseView, setShowEmployeeWiseView] = useState(false);
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState(null);
  const [showEmployeeMonthYearView, setShowEmployeeMonthYearView] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [employeeFilterDept, setEmployeeFilterDept] = useState('');
  const [showEmployeeSalaryModal, setShowEmployeeSalaryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null); 
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  
  // States
  const [payrolls, setPayrolls] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('payrolls');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [employees, setEmployees] = useState([]);
  const [employeeSalaries, setEmployeeSalaries] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const [loading, setLoading] = useState({
    payrolls: false,
    employees: true,
    employeeSalaries: false,
    action: false,
    calculation: false,
    generate: false,
    accept: false,
    apiCheck: true
  });
  
  const [apiConnected, setApiConnected] = useState(false);
  
  // User states
  const [isEmployeeView, setIsEmployeeView] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showMonthYearViewModal, setShowMonthYearViewModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState({ month: '', year: '' });
  
  // New modals
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null);
  const [employeePayrolls, setEmployeePayrolls] = useState([]);
  const [showMonthYearDetails, setShowMonthYearDetails] = useState(false);
  const [monthYearPayrolls, setMonthYearPayrolls] = useState([]);
  const [selectedMonthYearForView, setSelectedMonthYearForView] = useState({ month: '', year: '' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form states
  const [createForm, setCreateForm] = useState({
    employee: '',
    periodStart: '',
    periodEnd: '',
    status: 'Pending',
    notes: '',
    basicPay: '',
    monthlySalary: '',
    presentDays: 0,
    totalWorkingDays: 23,
    deductions: {
      lateDeduction: 0,
      absentDeduction: 0,
      leaveDeduction: 0
    },
    earnings: {
      overtime: 0,
      bonus: 0,
      allowance: 0
    }
  });

  const [calculateForm, setCalculateForm] = useState({
    employeeId: '',
    month: '',
    year: ''
  });

  const [bulkForm, setBulkForm] = useState({
    month: '',
    year: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalPaid: 0,
    totalRejected: 0,
    monthlyExpense: 0,
    pendingSalaryRequests: 0
  });

  // Helper Functions
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('adminToken') || 
                  localStorage.getItem('employeeToken');
    
    if (token && token.startsWith('Bearer ')) {
      return token.slice(7);
    }
    return token;
  };

  const getUserRole = () => {
    if (typeof window === 'undefined') return null;
    
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) return 'admin';
    
    const employeeToken = localStorage.getItem('employeeToken');
    if (employeeToken) return 'employee';
    
    return null;
  };

  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed._id || parsed.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getUserName = () => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.firstName || parsed.lastName) {
          return `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
        }
        return parsed.name || 'User';
      } catch (e) {
        return 'User';
      }
    }
    return 'User';
  };

  // Reset create form function
  const resetCreateForm = () => {
    setCreateForm({
      employee: '',
      periodStart: '',
      periodEnd: '',
      status: 'Pending',
      notes: '',
      basicPay: '',
      monthlySalary: '',
      presentDays: 0,
      totalWorkingDays: 23,
      deductions: {
        lateDeduction: 0,
        absentDeduction: 0,
        leaveDeduction: 0
      },
      earnings: {
        overtime: 0,
        bonus: 0,
        allowance: 0
      },
      netSalary: 0
    });
  };

  // Handle form cancel
  const handleCancelCreate = () => {
    resetCreateForm();
    setShowCreateModal(false);
  };

  // Save payrolls to localStorage
  const savePayrollsToLocalStorage = (payrollsData) => {
    try {
      localStorage.setItem('payrolls', JSON.stringify(payrollsData));
      localStorage.setItem('payrolls_last_saved', new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Create axios instance with better error handling
  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    instance.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      config.metadata = { startTime: new Date() };
      
      return config;
    });

    instance.interceptors.response.use(
      (response) => {
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;
        console.log(`✅ API ${response.config.url} took ${duration}ms`);
        return response;
      },
      (error) => {
        console.error('❌ API Error:', error.message);
        
        if (error.code === 'ECONNABORTED') {
          console.log('Request timeout');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          setTimeout(() => router.push('/'), 1000);
        } else if (error.response?.status === 500) {
          console.log('Server error');
        } else if (!error.response) {
          console.log('Network error');
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  };

  const API = createApiInstance();

  // API Functions
  const payrollApi = {
    // Get all payrolls (admin only)
    getAllPayrolls: async () => {
      try {
        const response = await API.get('/payrollAll');
        return response.data;
      } catch (error) {
        console.error('Get all payrolls error:', error);
        throw error;
      }
    },

    // Get payroll by ID
    getPayrollById: async (id) => {
      try {
        const response = await API.get(`/payrollAll/${id}`);
        return response.data;
      } catch (error) {
        console.error('Get payroll by ID error:', error);
        throw error;
      }
    },

    // Create payroll (admin only)
    createPayroll: async (data) => {
      try {
        const response = await API.post('/payrollCreate', data);
        return response.data;
      } catch (error) {
        console.error('Create payroll error:', error);
        throw error;
      }
    },

    // Update payroll status (admin only)
    updatePayrollStatus: async (id, status) => {
      try {
        const response = await API.put(`/payrollUpdate/${id}/status`, { status });
        return response.data;
      } catch (error) {
        console.error('Update payroll status error:', error);
        throw error;
      }
    },

    // Delete payroll (admin only)
    deletePayroll: async (id) => {
      try {
        const response = await API.delete(`/payrollDelete/${id}`);
        return response.data;
      } catch (error) {
        console.error('Delete payroll error:', error);
        throw error;
      }
    },

    // Generate monthly payroll (admin only)
    generateMonthlyPayroll: async (data) => {
      try {
        const response = await API.post('/generate/monthly', data);
        return response.data;
      } catch (error) {
        console.error('Generate monthly payroll error:', error);
        throw error;
      }
    },  
    
    // Get employee payrolls
    getEmployeePayrolls: async (employeeId) => {
      try {
        const response = await API.get(`/employee/${employeeId}`);
        return response.data;
      } catch (error) {
        console.error('Get employee payrolls error:', error);
        throw error;
      }
    },

    // Employee action on payroll
    employeeActionOnPayroll: async (id, action) => {
      try {
        const response = await API.post(`/action/${id}`, { action });
        return response.data;
      } catch (error) {
        console.error('Employee action error:', error);
        throw error;
      }
    },

    // Calculate payroll from attendance (auto-calculation)
    calculatePayrollFromAttendance: async (data) => {
      try {
        const response = await API.post('/calculate', data);
        return response.data;
      } catch (error) {
        console.error('Calculate payroll error:', error);
        throw error;
      }
    },

    // Auto generate payroll
    autoGeneratePayroll: async (data) => {
      try {
        const response = await API.post('/auto-generate', data);
        return response.data;
      } catch (error) {
        console.error('Auto generate payroll error:', error);
        throw error;
      }
    },

    // Bulk auto generate payroll
    bulkAutoGeneratePayroll: async (data) => {
      try {
        const response = await API.post('/bulk-auto-generate', data);
        return response.data;
      } catch (error) {
        console.error('Bulk auto generate error:', error);
        throw error;
      }
    }
  };

  // Check API Connection with multiple endpoints
  const checkApiConnection = async () => {
    try {
      const response = await axios.get(API_BASE_URL, { timeout: 5000 });
      if (response.status === 200) {
        setApiConnected(true);
        return true;
      }
    } catch (error) {
      setApiConnected(false);
      return false;
    }
  };

  // Get employee-wise payroll summary
  const getEmployeeWisePayrolls = () => {
    const employeeMap = {};
    
    // First, group payrolls by employee
    payrolls.forEach(payroll => {
      const employeeId = payroll.employee || payroll.employeeId;
      if (!employeeId) return;
      
      if (!employeeMap[employeeId]) {
        const employee = employees.find(e => e._id === employeeId);
        const salaryData = employeeSalaries[employeeId] || {};
        
        employeeMap[employeeId] = {
          employeeId,
          employeeName: getEmployeeName(employee || payroll),
          designation: employee?.designation || salaryData.designation || 'Employee',
          department: employee?.department || salaryData.department || 'General',
          monthlySalary: salaryData.salary || salaryData.monthlyBasic || 30000,
          payrolls: [],
          monthYearMap: {},
          totalAmount: 0,
          totalPayrolls: 0,
          statusCount: {
            Paid: 0,
            Pending: 0,
            Approved: 0,
            Rejected: 0
          },
          recentPayrolls: []
        };
      }
      
      employeeMap[employeeId].payrolls.push(payroll);
      employeeMap[employeeId].totalAmount += payroll.summary?.netPayable || payroll.netSalary || 0;
      employeeMap[employeeId].totalPayrolls++;
      
      // Track status
      if (payroll.status && employeeMap[employeeId].statusCount[payroll.status] !== undefined) {
        employeeMap[employeeId].statusCount[payroll.status]++;
      }
      
      // Track by month-year
      let month, year;
      if (payroll.month && payroll.year) {
        month = payroll.month;
        year = payroll.year;
      } else if (payroll.periodStart) {
        const date = new Date(payroll.periodStart);
        month = date.getMonth() + 1;
        year = date.getFullYear();
      }
      
      if (month && year) {
        const monthYearKey = `${year}-${month.toString().padStart(2, '0')}`;
        if (!employeeMap[employeeId].monthYearMap[monthYearKey]) {
          employeeMap[employeeId].monthYearMap[monthYearKey] = {
            month,
            year,
            payrolls: []
          };
        }
        employeeMap[employeeId].monthYearMap[monthYearKey].payrolls.push(payroll);
      }
      
      // Keep recent payrolls (max 3)
      if (employeeMap[employeeId].recentPayrolls.length < 3) {
        employeeMap[employeeId].recentPayrolls.push(payroll);
      }
    });
    
    // Convert to array and sort by employee name
    return Object.values(employeeMap)
      .map(emp => ({
        ...emp,
        monthYearCount: Object.keys(emp.monthYearMap).length,
        latestMonthYear: Object.keys(emp.monthYearMap).sort().reverse()[0] || null
      }))
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  };

  // Get employee's month-year wise payrolls
  const getEmployeeMonthYearPayrolls = (employeeId) => {
    const employeePayrolls = payrolls.filter(p => 
      p.employee === employeeId || p.employeeId === employeeId
    );
    
    const monthYearMap = {};
    
    employeePayrolls.forEach(payroll => {
      let month, year;
      
      if (payroll.month && payroll.year) {
        month = payroll.month;
        year = payroll.year;
      } else if (payroll.periodStart) {
        const date = new Date(payroll.periodStart);
        month = date.getMonth() + 1;
        year = date.getFullYear();
      } else {
        return;
      }
      
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!monthYearMap[key]) {
        monthYearMap[key] = {
          month,
          year,
          monthName: monthNames[month - 1],
          payrolls: [],
          totalAmount: 0,
          statusCount: {
            Paid: 0,
            Pending: 0
          }
        };
      }
      
      monthYearMap[key].payrolls.push(payroll);
      monthYearMap[key].totalAmount += payroll.summary?.netPayable || payroll.netSalary || 0;
      
      if (payroll.status === 'Paid' || payroll.status === 'Approved') {
        monthYearMap[key].statusCount.Paid++;
      } else if (payroll.status === 'Pending') {
        monthYearMap[key].statusCount.Pending++;
      }
    });
    
    // Convert to array and sort by year-month
    return Object.values(monthYearMap)
      .map(item => ({
        ...item,
        payrollCount: item.payrolls.length
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  };

  // Load employees with fallback
  const loadEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    
    try {
      const response = await API.get('/admin/getAll-user');
      let employeesData = [];
      
      if (response.data.users && Array.isArray(response.data.users)) {
        employeesData = response.data.users;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response.data.success && Array.isArray(response.data.users)) {
        employeesData = response.data.users;
      }
      
      const activeEmployees = employeesData.filter(emp => 
        !emp.status || 
        emp.status === 'active' || 
        emp.status === 'Active' ||
        (emp.status !== 'inactive' && emp.status !== 'terminated')
      );
      
      setEmployees(activeEmployees);
      
      const salaryMap = {};
      activeEmployees.forEach(emp => {
        if (emp._id) {
          salaryMap[emp._id] = {
            salary: emp.salary || emp.monthlySalary || emp.basicSalary || 30000,
            monthlyBasic: emp.monthlyBasic || emp.salary || emp.basicSalary || 30000,
            designation: emp.designation || emp.role || 'Employee',
            department: emp.department || 'General',
            name: getEmployeeName(emp)
          };
        }
      });
      setEmployeeSalaries(salaryMap);
      
      return activeEmployees;
      
    } catch (error) {
      console.error('Failed to load employees:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  // calculateHourlyRate ফাংশন
  const calculateHourlyRate = (dailyRate) => {
    return Math.round(dailyRate / 8);
  };

  // Calculate daily rate based on 23 working days
  const calculateDailyRate = (monthlySalary) => {
    return Math.round(monthlySalary / 23);
  };

  // Monthly salary and basic salary are the same
  const calculateBasicSalary = (monthlySalary) => {
    return monthlySalary;
  };

  // Calculate attendance with 23 working days
  const calculateAutoAttendance = (employeeId, month, year) => {
    if (!employeeId) {
      return {
        presentDays: 23,
        totalWorkingDays: 23,
        attendancePercentage: 100,
        absentDays: 0,
        lateDays: 0,
        leaves: 0
      };
    }
    
    const monthYearKey = `${year}-${month.toString().padStart(2, '0')}`;
    const employeeAttendance = attendanceData[employeeId] || {};
    const monthAttendance = employeeAttendance[monthYearKey];
    
    if (monthAttendance) {
      return {
        presentDays: monthAttendance.presentDays || 23,
        totalWorkingDays: monthAttendance.totalWorkingDays || 23,
        attendancePercentage: monthAttendance.attendancePercentage || 100,
        absentDays: monthAttendance.absentDays || 0,
        lateDays: monthAttendance.lateDays || 0,
        leaves: monthAttendance.leaves || 0
      };
    }
    
    return {
      presentDays: 23,
      totalWorkingDays: 23,
      attendancePercentage: 100,
      absentDays: 0,
      lateDays: 0,
      leaves: 0
    };
  };

  // Calculate deductions with 23 days logic
  const calculateAttendanceDeductions = (employeeId, monthlySalary, month, year) => {
    const attendance = calculateAutoAttendance(employeeId, month, year);
    const dailyRate = calculateDailyRate(monthlySalary);
    
    let lateDeduction = 0;
    let absentDeduction = 0;
    let leaveDeduction = 0;
    
    // Late Deduction: 3 days late = 1 day salary deduction
    if (attendance.lateDays > 0) {
      const deductionDays = Math.floor(attendance.lateDays / 3);
      lateDeduction = deductionDays * dailyRate;
    }
    
    // Absent Deduction
    absentDeduction = attendance.absentDays * dailyRate;
    
    // Leave Deduction
    if (attendance.leaves > 0) {
      leaveDeduction = attendance.leaves * dailyRate;
    }
    
    return {
      lateDeduction,
      absentDeduction,
      leaveDeduction,
      total: lateDeduction + absentDeduction + leaveDeduction,
      dailyRate,
      attendanceBreakdown: attendance
    };
  };

  // Load attendance data
  const loadAttendanceData = async () => {
    try {
      console.log('Loading attendance data...');
      
      const role = getUserRole();
      const userId = getUserId();
      
      let attendanceDataMap = {};
      
      // Create default attendance data for all employees
      employees.forEach(emp => {
        if (emp._id) {
          attendanceDataMap[emp._id] = {};
          
          // Create data for current month and previous 3 months
          const currentDate = new Date();
          for (let i = 0; i < 4; i++) {
            const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = monthDate.getMonth() + 1;
            const year = monthDate.getFullYear();
            const monthYearKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            attendanceDataMap[emp._id][monthYearKey] = {
              presentDays: 23,
              totalWorkingDays: 23,
              lateDays: Math.floor(Math.random() * 3),
              absentDays: 0,
              leaves: Math.floor(Math.random() * 2),
              attendancePercentage: 100
            };
          }
        }
      });
      
      // Try to load real attendance data from API
      if (apiConnected) {
        try {
          let endpoint = '/attendance/all';
          if (role === 'employee') {
            endpoint = `/attendance/user/${userId}`;
          }
          
          const response = await API.get(endpoint);
          console.log('Attendance API response:', response.data);
          
          if (response.data) {
            const attendanceList = response.data.attendances || response.data.data || [];
            console.log(`Found ${attendanceList.length} real attendance records`);
            
            attendanceList.forEach(att => {
              const empId = att.employee || att.employeeId || att.user;
              if (!empId) return;
              
              const date = new Date(att.date || att.attendanceDate || att.createdAt);
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              const monthYearKey = `${year}-${month.toString().padStart(2, '0')}`;
              
              if (!attendanceDataMap[empId]) {
                attendanceDataMap[empId] = {};
              }
              
              if (!attendanceDataMap[empId][monthYearKey]) {
                attendanceDataMap[empId][monthYearKey] = {
                  presentDays: 0,
                  totalWorkingDays: 0,
                  lateDays: 0,
                  absentDays: 0,
                  leaves: 0,
                  attendancePercentage: 0
                };
              }
              
              // Update based on attendance status
              if (att.status === 'Present' || att.status === 'present') {
                attendanceDataMap[empId][monthYearKey].presentDays += 1;
              } else if (att.status === 'Late' || att.status === 'late') {
                attendanceDataMap[empId][monthYearKey].presentDays += 1;
                attendanceDataMap[empId][monthYearKey].lateDays += 1;
              } else if (att.status === 'Absent' || att.status === 'absent') {
                attendanceDataMap[empId][monthYearKey].absentDays += 1;
              } else if (att.status === 'Half Day') {
                attendanceDataMap[empId][monthYearKey].presentDays += 0.5;
              }
              
              if (att.leaveDays && att.leaveDays > 0) {
                attendanceDataMap[empId][monthYearKey].leaves += att.leaveDays;
              }
              
              attendanceDataMap[empId][monthYearKey].totalWorkingDays += 1;
            });
          }
        } catch (apiError) {
          console.log('Attendance API load failed, using default data:', apiError.message);
        }
      }
      
      // Calculate percentages
      Object.keys(attendanceDataMap).forEach(empId => {
        Object.keys(attendanceDataMap[empId]).forEach(monthKey => {
          const data = attendanceDataMap[empId][monthKey];
          if (data.totalWorkingDays > 0) {
            data.attendancePercentage = Math.round((data.presentDays / data.totalWorkingDays) * 100);
          } else {
            data.attendancePercentage = 100;
          }
        });
      });
      
      setAttendanceData(attendanceDataMap);
      console.log('Attendance data loaded successfully');
      
    } catch (error) {
      console.error('Error loading attendance data:', error);
      const defaultAttendance = {};
      employees.forEach(emp => {
        if (emp._id) {
          defaultAttendance[emp._id] = {};
          const currentDate = new Date();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
          
          defaultAttendance[emp._id][monthKey] = {
            presentDays: 23,
            totalWorkingDays: 23,
            lateDays: 0,
            absentDays: 0,
            leaves: 0,
            attendancePercentage: 100
          };
        }
      });
      setAttendanceData(defaultAttendance);
    }
  };

  // Load payrolls
  const loadPayrolls = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    
    try {
      let apiPayrolls = [];
      
      if (apiConnected) {
        try {
          const role = getUserRole();
          const userId = getUserId();
          
          let endpoint = '/payrollAll';
          if (role === 'employee') {
            endpoint = `/employee/${userId}`;
          }
          
          console.log(`Fetching payrolls from: ${endpoint}`);
          const response = await API.get(endpoint);
          
          if (response.data) {
            if (Array.isArray(response.data)) {
              apiPayrolls = response.data;
            } else if (response.data.payrolls && Array.isArray(response.data.payrolls)) {
              apiPayrolls = response.data.payrolls;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              apiPayrolls = response.data.data;
            }
            
            console.log(`✅ Loaded ${apiPayrolls.length} payrolls from API`);
          }
        } catch (apiError) {
          console.log('API payrolls load failed:', apiError.message);
        }
      }
      
      // Load from localStorage
      const localPayrolls = JSON.parse(localStorage.getItem('payrolls') || '[]');
      
      // Combine and deduplicate
      const allPayrolls = [...apiPayrolls, ...localPayrolls];
      const uniqueIds = new Set();
      const uniquePayrolls = [];
      
      allPayrolls.forEach(p => {
        const id = p._id || p.id;
        if (id && !uniqueIds.has(id)) {
          uniqueIds.add(id);
          uniquePayrolls.push(p);
        } else if (!id) {
          uniquePayrolls.push(p);
        }
      });
      
      // Sort by date
      uniquePayrolls.sort((a, b) => {
        return new Date(b.createdAt || b.createdDate || Date.now()) - 
               new Date(a.createdAt || a.createdDate || Date.now());
      });
      
      // Filter for employee view
      let filteredPayrolls = uniquePayrolls;
      if (isEmployeeView && currentEmployeeId) {
        filteredPayrolls = uniquePayrolls.filter(p => 
          p.employee === currentEmployeeId || 
          p.employeeId === currentEmployeeId
        );
      }
      
      setPayrolls(filteredPayrolls);
      savePayrollsToLocalStorage(filteredPayrolls);
      calculateStats(filteredPayrolls);
      
      console.log(`Total payrolls: ${filteredPayrolls.length}`);
      
    } catch (error) {
      console.error('Error loading payrolls:', error);
      toast.error('Failed to load payrolls');
    } finally {
      setLoading(prev => ({ ...prev, payrolls: false }));
    }
  };

  // Calculate statistics
  const calculateStats = (payrollData) => {
    
    const totalPayroll = payrollData.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    const totalProcessed = payrollData.length;
    const totalPending = payrollData.filter(p => p.status === 'Pending' || p.status === 'pending_approval').length;
    const totalPaid = payrollData.filter(p => p.status === 'Paid').length;
    const totalRejected = payrollData.filter(p => p.status === 'Rejected').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPayrolls = payrollData.filter(p => {
      try {
        const payrollDate = new Date(p.periodStart || p.createdAt);
        const payrollMonth = payrollDate.getMonth();
        const payrollYear = payrollDate.getFullYear();
        return payrollMonth === currentMonth && payrollYear === currentYear;
      } catch (e) {
        return false;
      }
    });
    
    const monthlyExpense = currentMonthPayrolls.reduce((sum, p) => {
      return sum + (p.summary?.netPayable || p.netSalary || p.earnings?.total || 0);
    }, 0);
    
    setStats({
      totalPayroll,
      totalEmployees: employees.length,
      totalProcessed,
      totalPending,
      totalPaid,
      totalRejected,
      monthlyExpense,
      pendingSalaryRequests: 0
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('paid') || statusLower.includes('approved')) {
      return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={14} /> };
    } else if (statusLower.includes('pending')) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={14} /> };
    } else if (statusLower.includes('draft')) {
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> };
    } else if (statusLower.includes('rejected')) {
      return { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle size={14} /> };
    } else {
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText size={14} /> };
    }
  };

  // Handle employee selection - AUTO CALCULATION
  const handleEmployeeSelect = (employeeId) => {
    if (!employeeId) return;
    
    const salaryData = employeeSalaries[employeeId] || {};
    const monthlySalary = salaryData.salary || 30000;
    
    // Get selected month and year
    let month, year;
    const currentDate = new Date();
    
    if (createForm.periodStart) {
      const date = new Date(createForm.periodStart);
      month = date.getMonth() + 1;
      year = date.getFullYear();
    } else {
      month = currentDate.getMonth() + 1;
      year = currentDate.getFullYear();
      // Set default period (current month)
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      setCreateForm(prev => ({
        ...prev,
        periodStart: firstDay.toISOString().split('T')[0],
        periodEnd: lastDay.toISOString().split('T')[0]
      }));
    }
    
    // Auto calculate attendance for 23 days
    const attendance = calculateAutoAttendance(employeeId, month, year);
    const deductions = calculateAttendanceDeductions(employeeId, monthlySalary, month, year);
    
    const dailyRate = calculateDailyRate(monthlySalary);
    
    // Basic Pay = Monthly Salary
    const basicPay = monthlySalary; 
    
    const totalEarnings = 
      basicPay + 
      (createForm.earnings.overtime || 0) + 
      (createForm.earnings.bonus || 0) + 
      (createForm.earnings.allowance || 0);
    
    const totalDeductions = deductions.total;
    const netPayable = totalEarnings - totalDeductions;
    
    setCreateForm(prev => ({
      ...prev,
      employee: employeeId,
      monthlySalary,
      basicPay,
      presentDays: attendance.presentDays,
      totalWorkingDays: 23,
      deductions: {
        lateDeduction: deductions.lateDeduction,
        absentDeduction: deductions.absentDeduction,
        leaveDeduction: deductions.leaveDeduction
      },
      netSalary: netPayable
    }));
    
    toast.success(`Employee selected. Basic Salary: ${formatCurrency(monthlySalary)}`);
  };

  // Handle period start change - AUTO RECALCULATE
  const handlePeriodStartChange = (date) => {
    if (!date) return;
    
    setCreateForm(prev => {
      const updatedForm = { ...prev, periodStart: date };
      
      // Auto calculate if employee is selected
      if (prev.employee) {
        const salaryData = employeeSalaries[prev.employee] || {};
        const monthlySalary = salaryData.salary || 30000;
        const selectedDate = new Date(date);
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        
        const attendance = calculateAutoAttendance(prev.employee, month, year);
        const deductions = calculateAttendanceDeductions(prev.employee, monthlySalary, month, year);
        
        const dailyRate = calculateDailyRate(monthlySalary);
        const basicPay = monthlySalary;
        
        const totalEarnings = 
          basicPay + 
          (prev.earnings.overtime || 0) + 
          (prev.earnings.bonus || 0) + 
          (prev.earnings.allowance || 0);
        
        const totalDeductions = deductions.total;
        const netPayable = totalEarnings - totalDeductions;
        
        return {
          ...updatedForm,
          monthlySalary,
          presentDays: attendance.presentDays,
          totalWorkingDays: 23,
          basicPay,
          deductions: {
            lateDeduction: deductions.lateDeduction,
            absentDeduction: deductions.absentDeduction,
            leaveDeduction: deductions.leaveDeduction
          },
          netSalary: netPayable
        };
      }
      
      return updatedForm;
    });
  };

  // Load employee-specific payrolls
  const loadEmployeeSpecificPayrolls = async (employeeId) => {
    if (!employeeId) return;
    
    setLoading(prev => ({ ...prev, payrolls: true }));
    
    try {
      let employeePayrollsData = [];
      
      if (apiConnected) {
        try {
          const response = await payrollApi.getEmployeePayrolls(employeeId);
          
          if (response.data && Array.isArray(response.data)) {
            employeePayrollsData = response.data;
          } else if (response.data.payrolls && Array.isArray(response.data.payrolls)) {
            employeePayrollsData = response.data.payrolls;
          }
        } catch (apiError) {
          console.log('API employee payrolls load failed:', apiError.message);
          
          employeePayrollsData = payrolls.filter(p => 
            p.employee === employeeId || p.employeeId === employeeId
          );
        }
      } else {
        employeePayrollsData = payrolls.filter(p => 
          p.employee === employeeId || p.employeeId === employeeId
        );
      }
      
      setEmployeePayrolls(employeePayrollsData);
      return employeePayrollsData;
      
    } catch (error) {
      console.error('Load employee payrolls error:', error);
      toast.error('Failed to load employee payrolls');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, payrolls: false }));
    }
  };

  // Handle employee payroll view (for admin)
  const handleViewEmployeePayrolls = async (employee) => {
    setSelectedEmployeeForPayroll(employee);
    await loadEmployeeSpecificPayrolls(employee._id);
    setShowEmployeeDetails(true);
  };

  // Handle month-year wise payroll view
  const handleMonthYearPayrollView = async (month, year) => {
    setSelectedMonthYearForView({ month, year });
    
    // Filter payrolls by month and year
    const filtered = payrolls.filter(p => {
      try {
        const payrollDate = new Date(p.periodStart || p.createdAt);
        const payrollMonth = payrollDate.getMonth() + 1;
        const payrollYear = payrollDate.getFullYear();
        return payrollMonth === month && payrollYear === year;
      } catch (e) {
        return false;
      }
    });
    
    setMonthYearPayrolls(filtered);
    setShowMonthYearDetails(true);
  };

  // Get month-year wise payrolls with employee grouping
  const getMonthYearWisePayrolls = () => {
    const monthYearMap = {};
    
    payrolls.forEach(payroll => {
      // Extract month and year from periodStart or created date
      let month, year;
      
      if (payroll.periodStart) {
        const date = new Date(payroll.periodStart);
        month = date.getMonth() + 1;
        year = date.getFullYear();
      } else if (payroll.month && payroll.year) {
        month = parseInt(payroll.month);
        year = parseInt(payroll.year);
      } else if (payroll.createdAt) {
        const date = new Date(payroll.createdAt);
        month = date.getMonth() + 1;
        year = date.getFullYear();
      } else {
        // Fallback to current month
        const currentDate = new Date();
        month = currentDate.getMonth() + 1;
        year = currentDate.getFullYear();
      }
      
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!monthYearMap[key]) {
        monthYearMap[key] = {
          month,
          year,
          monthName: monthNames[month - 1],
          payrolls: [],
          employees: new Set(),
          totalAmount: 0,
          statusCount: {
            Paid: 0,
            Pending: 0,
            Rejected: 0,
            Approved: 0
          }
        };
      }
      
      monthYearMap[key].payrolls.push(payroll);
      monthYearMap[key].totalAmount += payroll.summary?.netPayable || payroll.netSalary || 0;
      
      // Add employee to set
      if (payroll.employee) {
        monthYearMap[key].employees.add(payroll.employee);
      }
      if (payroll.employeeId) {
        monthYearMap[key].employees.add(payroll.employeeId);
      }
      
      // Count statuses
      if (payroll.status) {
        const status = payroll.status;
        if (monthYearMap[key].statusCount[status] !== undefined) {
          monthYearMap[key].statusCount[status]++;
        } else {
          monthYearMap[key].statusCount[status] = 1;
        }
      }
    });
    
    // Convert to array, add employee names, and sort by year/month
    return Object.values(monthYearMap).map(item => {
      // Get employee details for this month-year
      const employeeDetails = Array.from(item.employees).map(empId => {
        const employee = employees.find(e => e._id === empId);
        const employeePayrolls = item.payrolls.filter(p => 
          p.employee === empId || p.employeeId === empId
        );
        const totalAmount = employeePayrolls.reduce((sum, p) => 
          sum + (p.summary?.netPayable || p.netSalary || 0), 0
        );
        
        return {
          id: empId,
          name: getEmployeeName(employee || {}),
          designation: employee?.designation || 'Employee',
          payrollCount: employeePayrolls.length,
          totalAmount: totalAmount,
          status: employeePayrolls.every(p => p.status === 'Paid') ? 'Paid' : 
                  employeePayrolls.some(p => p.status === 'Pending') ? 'Pending' : 'Mixed'
        };
      });
      
      return {
        ...item,
        employeeCount: item.employees.size,
        employeeDetails: employeeDetails.sort((a, b) => b.totalAmount - a.totalAmount),
        employees: Array.from(item.employees)
      };
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  // View specific month-year payrolls
  const handleViewMonthYearPayrolls = (month, year) => {
    const filteredPayrolls = payrolls.filter(payroll => {
      try {
        const payrollDate = new Date(payroll.periodStart || payroll.createdAt);
        const payrollMonth = payrollDate.getMonth() + 1;
        const payrollYear = payrollDate.getFullYear();
        return payrollMonth === month && payrollYear === year;
      } catch (e) {
        return false;
      }
    });
    
    setMonthYearPayrolls(filteredPayrolls);
    setSelectedMonthYearForView({ month, year });
    setShowMonthYearDetails(true);
  };

  // Handle create payroll function - Optimized for MongoDB
  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    
    if (!createForm.employee || !createForm.periodStart || !createForm.periodEnd) {
      toast.error('Please select employee and period dates');
      return;
    }
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      console.log('🔄 Starting payroll creation...');
      
      // 1. Find selected employee
      const selectedEmployee = employees.find(emp => emp._id === createForm.employee);
      if (!selectedEmployee) {
        throw new Error('Selected employee not found');
      }
      
      // 2. Get salary data
      const salaryData = employeeSalaries[createForm.employee] || {};
      const monthlySalary = salaryData.salary || 30000;
      
      // 3. Calculate period
      const periodStartDate = new Date(createForm.periodStart);
      const month = periodStartDate.getMonth() + 1;
      const year = periodStartDate.getFullYear();
      
      // 4. Generate attendance data for 23 days
      const attendance = calculateAutoAttendance(createForm.employee, month, year);
      const deductions = calculateAttendanceDeductions(createForm.employee, monthlySalary, month, year);
      
      // 5. Calculate values
      const dailyRate = calculateDailyRate(monthlySalary);
      const basicPay = monthlySalary;
      
      const overtimeAmount = createForm.earnings.overtime || 0;
      const bonusAmount = createForm.earnings.bonus || 0;
      const allowanceAmount = createForm.earnings.allowance || 0;
      const totalEarnings = basicPay + overtimeAmount + bonusAmount + allowanceAmount;
      const totalDeductions = deductions.total;
      const netPayable = totalEarnings - totalDeductions;
      
      // 6. Create payroll data object
      const payrollData = {
        employee: createForm.employee,
        employeeName: getEmployeeName(selectedEmployee),
        employeeId: selectedEmployee.employeeId || selectedEmployee._id,
        periodStart: createForm.periodStart,
        periodEnd: createForm.periodEnd,
        status: createForm.status || 'Pending',
        month: month,
        year: year,
        basicSalary: basicPay,
        monthlySalary: monthlySalary,
        dailyRate: dailyRate,
        attendance: {
          presentDays: attendance.presentDays,
          totalWorkingDays: 23,
          attendancePercentage: attendance.attendancePercentage,
          lateDays: attendance.lateDays,
          absentDays: attendance.absentDays,
          leaveDays: attendance.leaves
        },
        earnings: {
          basicPay: basicPay,
          overtime: overtimeAmount,
          bonus: bonusAmount,
          allowance: allowanceAmount,
          total: totalEarnings
        },
        deductions: {
          lateDeduction: deductions.lateDeduction,
          absentDeduction: deductions.absentDeduction,
          leaveDeduction: deductions.leaveDeduction,
          total: totalDeductions
        },
        summary: {
          grossEarnings: totalEarnings,
          totalDeductions: totalDeductions,
          netPayable: netPayable,
          inWords: convertToWords(netPayable),
          payableDays: attendance.presentDays
        },
        createdBy: getUserId(),
        createdRole: getUserRole(),
        isAutoGenerated: false,
        calculationMethod: "23 days month",
        deductionRules: {
          lateRule: "3 late days = 1 day salary deduction",
          absentRule: "1 absent day = 1 day salary deduction",
          leaveRule: "1 leave day = 1 day salary deduction",
          calculationBase: "Daily rate = Monthly salary ÷ 23"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('📋 Payroll Data:', payrollData);
      
      // 7. Save to MongoDB
      let savedPayroll = null;
      
      if (apiConnected) {
        try {
          const mongoResponse = await savePayrollToMongoDB(payrollData);
          
          if (mongoResponse && (mongoResponse._id || mongoResponse.data?._id)) {
            savedPayroll = mongoResponse.data || mongoResponse;
            console.log('✅ Saved to MongoDB:', savedPayroll._id);
            toast.success('✅ Payroll saved to database!');
          } else {
            throw new Error('MongoDB response missing ID');
          }
        } catch (mongoError) {
          console.error('❌ MongoDB save failed:', mongoError);
          
          savedPayroll = {
            ...payrollData,
            _id: `local_${Date.now()}_${payrollData.employee}`,
            localSave: true,
            mongoDBSaveFailed: true,
            mongoDBError: mongoError.message
          };
          
          toast.warning('📱 Saved locally. Database connection failed.');
        }
      } else {
        savedPayroll = {
          ...payrollData,
          _id: `local_${Date.now()}_${payrollData.employee}`,
          localSave: true,
          offlineMode: true
        };
        
        toast.info('📱 Saved locally (offline mode)');
      }
      
      // 8. Update local state
      const updatedPayrolls = [savedPayroll, ...payrolls];
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      
      // 9. Update statistics
      calculateStats(updatedPayrolls);
      
      // 10. Success message
      toast.success(`✅ Payroll created for ${payrollData.employeeName}! Net: ${formatCurrency(netPayable)}`);
      
      // 11. Reset form
      resetCreateForm();
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('❌ Create payroll error:', error);
      toast.error(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Handle calculate payroll
  const handleCalculatePayroll = async (e) => {
    e.preventDefault();
    
    if (!calculateForm.employeeId || !calculateForm.month || !calculateForm.year) {
      toast.error('Please select employee, month and year');
      return;
    }
    
    setLoading(prev => ({ ...prev, calculation: true }));
    
    try {
      const employee = employees.find(e => e._id === calculateForm.employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      const salaryData = employeeSalaries[calculateForm.employeeId] || {};
      const monthlySalary = salaryData.salary || 30000;
      
      const month = parseInt(calculateForm.month);
      const year = parseInt(calculateForm.year);
      
      const attendance = calculateAutoAttendance(calculateForm.employeeId, month, year);
      const deductions = calculateAttendanceDeductions(calculateForm.employeeId, monthlySalary, month, year);
      
      const dailyRate = calculateDailyRate(monthlySalary);
      const hourlyRate = calculateHourlyRate(dailyRate);
      const basicPay = Math.round(dailyRate * attendance.presentDays);
      const overtimeAmount = Math.round(hourlyRate * 10 * 1.5);
      const totalEarnings = basicPay + overtimeAmount;
      const totalDeductions = deductions.total;
      const netPayable = totalEarnings - totalDeductions;
      
      setCalculationResult({
        employeeDetails: {
          name: getEmployeeName(employee),
          employeeId: employee.employeeId || employee._id,
          department: salaryData.department,
          designation: salaryData.designation
        },
        month: month,
        year: year,
        periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
        periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
        monthlySalary: monthlySalary,
        basicPay: basicPay,
        dailyRate: dailyRate,
        hourlyRate: hourlyRate,
        presentDays: attendance.presentDays,
        totalWorkingDays: attendance.totalWorkingDays,
        attendancePercentage: attendance.attendancePercentage,
        
        attendanceBreakdown: attendance,
        
        earnings: {
          basicPay: basicPay,
          overtime: overtimeAmount,
          bonus: 0,
          allowance: 0,
          total: totalEarnings
        },
        
        deductions: {
          lateDeduction: deductions.lateDeduction,
          absentDeduction: deductions.absentDeduction,
          leaveDeduction: deductions.leaveDeduction,
          total: totalDeductions,
          deductionRules: {
            lateRule: "3 দিন লেট = ১ দিনের বেতন কাটা",
            absentRule: "১ দিন অনুপস্থিত = ১ দিনের বেতন কাটা",
            leaveRule: "অবৈতনিক ছুটি = ১ দিনের বেতন কাটা"
          }
        },
        
        summary: {
          grossEarnings: totalEarnings,
          totalDeductions: totalDeductions,
          netPayable: netPayable,
          inWords: convertToWords(netPayable)
        }
      });
      
      toast.success(`Payroll calculated successfully for ${month}/${year}!`);
      
    } catch (error) {
      console.error('Calculate payroll error:', error);
      toast.error('Failed to calculate payroll');
    } finally {
      setLoading(prev => ({ ...prev, calculation: false }));
    }
  };

  // Handle bulk generate
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    
    if (!bulkForm.month || !bulkForm.year) {
      toast.error('Please select month and year');
      return;
    }
    
    setLoading(prev => ({ ...prev, generate: true }));
    
    try {
      const month = parseInt(bulkForm.month);
      const year = parseInt(bulkForm.year);
      
      const newPayrolls = [];
      
      for (const emp of employees) {
        const salaryData = employeeSalaries[emp._id] || {};
        const monthlySalary = salaryData.salary || 30000;
        
        const attendance = calculateAutoAttendance(emp._id, month, year);
        const deductions = calculateAttendanceDeductions(emp._id, monthlySalary, month, year);
        
        const dailyRate = calculateDailyRate(monthlySalary);
        const hourlyRate = calculateHourlyRate(dailyRate);
        const basicPay = Math.round(dailyRate * attendance.presentDays);
        const overtimeAmount = Math.round(hourlyRate * 10 * 1.5);
        const totalEarnings = basicPay + overtimeAmount;
        const totalDeductions = deductions.total;
        const netPayable = totalEarnings - totalDeductions;
        
        const payrollData = {
          employee: emp._id,
          employeeName: getEmployeeName(emp),
          employeeId: emp.employeeId || emp._id,
          periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
          periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
          status: 'Pending',
          
          salaryDetails: {
            monthlySalary,
            dailyRate,
            hourlyRate
          },
          
          attendance: {
            presentDays: attendance.presentDays,
            totalWorkingDays: attendance.totalWorkingDays,
            attendancePercentage: attendance.attendancePercentage,
            lateMinutes: attendance.lateMinutes,
            absentDays: attendance.absentDays
          },
          
          earnings: {
            basicPay,
            overtime: overtimeAmount,
            total: totalEarnings
          },
          
          deductions: {
            lateDeduction: deductions.lateDeduction,
            absentDeduction: deductions.absentDeduction,
            leaveDeduction: deductions.leaveDeduction,
            total: totalDeductions,
            deductionRules: {
              lateRule: "3 দিন লেট = ১ দিনের বেতন কাটা",
              absentRule: "১ দিন অনুপস্থিত = ১ দিনের বেতন কাটা",
              leaveRule: "অবৈতনিক ছুটি = ১ দিনের বেতন কাটা"
            }
          },
          
          summary: {
            netPayable,
            inWords: convertToWords(netPayable)
          },
          
          createdBy: getUserId(),
          createdRole: getUserRole(),
          isAutoGenerated: true,
          autoDeductionsApplied: true,
          currency: "BDT",
          month: month,
          year: year,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Try to save to API
        if (apiConnected) {
          try {
            const response = await payrollApi.bulkAutoGeneratePayroll(payrollData);
            if (response.data) {
              newPayrolls.push(response.data.payroll || response.data);
            }
          } catch (apiError) {
            console.error(`API save failed for ${emp._id}:`, apiError.message);
            payrollData._id = `bulk_${Date.now()}_${emp._id}`;
            payrollData.localSave = true;
            newPayrolls.push(payrollData);
          }
        } else {
          payrollData._id = `bulk_${Date.now()}_${emp._id}`;
          payrollData.localSave = true;
          newPayrolls.push(payrollData);
        }
      }
      
      const updatedPayrolls = [...newPayrolls, ...payrolls];
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      calculateStats(updatedPayrolls);
      
      toast.success(`Created ${newPayrolls.length} payrolls for ${month}/${year}`);
      setShowBulkModal(false);
      setBulkForm({ month: '', year: '' });
      
    } catch (error) {
      console.error('Bulk generate error:', error);
      toast.error('Bulk generation failed');
    } finally {
      setLoading(prev => ({ ...prev, generate: false }));
    }
  };

  // Handle update status
  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Change status to ${status}?`)) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      if (apiConnected) {
        try {
          await payrollApi.updatePayrollStatus(id, status);
        } catch (apiError) {
          console.log('API update failed:', apiError.message);
        }
      }
      
      const updatedPayrolls = payrolls.map(p => 
        p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      );
      
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      calculateStats(updatedPayrolls);
      
      // Update employee payrolls if modal is open
      if (showEmployeeDetails) {
        const updatedEmployeePayrolls = employeePayrolls.map(p => 
          p._id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
        );
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success('Status updated successfully');
      
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Handle delete payroll
  const handleDeletePayroll = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll?')) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      if (apiConnected) {
        try {
          await payrollApi.deletePayroll(id);
        } catch (apiError) {
          console.log('API delete failed:', apiError.message);
        }
      }
      
      const updatedPayrolls = payrolls.filter(p => p._id !== id);
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      calculateStats(updatedPayrolls);
      
      // Update employee payrolls if modal is open
      if (showEmployeeDetails) {
        const updatedEmployeePayrolls = employeePayrolls.filter(p => p._id !== id);
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success('Payroll deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete payroll');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Handle employee action on payroll (accept/reject)
  const handleEmployeePayrollAction = async (payrollId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this payroll?`)) return;
    
    setLoading(prev => ({ ...prev, accept: true }));
    
    try {
      if (apiConnected) {
        await payrollApi.employeeActionOnPayroll(payrollId, action);
      }
      
      // Update local state
      const updatedPayrolls = payrolls.map(p => {
        if (p._id === payrollId) {
          if (action === 'accept') {
            return {
              ...p,
              status: 'Paid',
              accepted: true,
              acceptedBy: getUserId(),
              acceptedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          } else if (action === 'reject') {
            return {
              ...p,
              status: 'Rejected',
              rejectedBy: getUserId(),
              rejectedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
        }
        return p;
      });
      
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      
      // Also update employeePayrolls if it's open
      if (showEmployeeDetails) {
        const updatedEmployeePayrolls = employeePayrolls.map(p => {
          if (p._id === payrollId) {
            if (action === 'accept') {
              return {
                ...p,
                status: 'Paid',
                accepted: true,
                acceptedBy: getUserId(),
                acceptedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            } else if (action === 'reject') {
              return {
                ...p,
                status: 'Rejected',
                rejectedBy: getUserId(),
                rejectedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            }
          }
          return p;
        });
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success(`Payroll ${action}ed successfully!`);
      
    } catch (error) {
      console.error('Employee action error:', error);
      toast.error(`Failed to ${action} payroll`);
    } finally {
      setLoading(prev => ({ ...prev, accept: false }));
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(prev => ({ ...prev, payrolls: true }));
    await checkApiConnection();
    await loadEmployees();
    await loadAttendanceData();
    await loadPayrolls();
    setLoading(prev => ({ ...prev, payrolls: false }));
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      toast.success('Logged out successfully');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }
  };

  // Handle auto-generate from calculation
  const handleAutoGenerateFromCalculation = async () => {
    if (!calculationResult) {
      toast.error('No calculation result available');
      return;
    }
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const { month, year, attendanceBreakdown, summary, earnings, deductions } = calculationResult;
      const employeeId = calculationResult.employeeDetails.employeeId;
      
      const employee = employees.find(e => e._id === employeeId);
      if (!employee) throw new Error('Employee not found');
      
      const payrollData = {
        employee: employeeId,
        employeeName: getEmployeeName(employee),
        month,
        year,
        periodStart: new Date(year, month - 1, 1).toISOString().split('T')[0],
        periodEnd: new Date(year, month, 0).toISOString().split('T')[0],
        status: 'Pending',
        attendance: attendanceBreakdown,
        earnings,
        deductions,
        summary,
        autoGenerated: true,
        createdAt: new Date().toISOString()
      };
      
      let savedPayroll;
      if (apiConnected) {
        try {
          const response = await payrollApi.autoGeneratePayroll(payrollData);
          savedPayroll = response.data;
        } catch (apiError) {
          console.error('API auto generate failed:', apiError.message);
          savedPayroll = {
            ...payrollData,
            _id: `auto_${Date.now()}_${employeeId}`,
            localSave: true
          };
        }
      } else {
        savedPayroll = {
          ...payrollData,
          _id: `auto_${Date.now()}_${employeeId}`,
          localSave: true
        };
      }
      
      const updatedPayrolls = [savedPayroll, ...payrolls];
      setPayrolls(updatedPayrolls);
      savePayrollsToLocalStorage(updatedPayrolls);
      
      // Update employee payrolls if modal is open
      if (showEmployeeDetails && selectedEmployeeForPayroll?._id === employeeId) {
        const updatedEmployeePayrolls = [savedPayroll, ...employeePayrolls];
        setEmployeePayrolls(updatedEmployeePayrolls);
      }
      
      toast.success('Auto-generated payroll created successfully!');
      setCalculationResult(null);
      setShowCalculateModal(false);
      
    } catch (error) {
      console.error('Auto generate error:', error);
      toast.error('Failed to auto-generate payroll');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Filter payrolls
  const filteredPayrolls = payrolls.filter(payroll => {
    const employeeName = getEmployeeName(employees.find(e => e._id === payroll.employee) || {}).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payroll.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Initialize app
  useEffect(() => {
    const init = async () => {
      console.log('Initializing payroll system...');
      
      const token = getToken();
      if (!token) {
        toast.error('Please login to access payroll');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      try {
        const role = getUserRole();
        const userId = getUserId();
        
        if (role === 'employee') {
          setIsEmployeeView(true);
          setCurrentEmployeeId(userId);
          console.log('Employee view activated for user:', userId);
        }
        
        await checkApiConnection();
        await loadEmployees();
        await loadAttendanceData();
        await loadPayrolls();
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Failed to initialize app');
      }
    };
    
    init();
  }, []);

  // Employees load হওয়ার পরে attendance data load করুন
  useEffect(() => {
    if (employees.length > 0) {
      loadAttendanceData();
    }
  }, [employees]);

  // Paginate payrolls
  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

  // Check if user is admin
  const isAdmin = getUserRole() === 'admin';

  // Month-Year Selection Modal Component
  const MonthYearViewModal = () => {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Month, Year & Employee</h2>
                <p className="text-gray-500 text-sm mt-1">Filter payrolls by month, year and employee</p>
              </div>
              <button
                onClick={() => setShowMonthYearViewModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Month Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <select
                  value={selectedMonthYear.month}
                  onChange={(e) => setSelectedMonthYear(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Month</option>
                  {monthNames.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              
              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  value={selectedMonthYear.year}
                  onChange={(e) => setSelectedMonthYear(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              
              {/* Employee Selection (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee (Optional)
                </label>
                <select
                  value={selectedMonthYear.employeeId || ''}
                  onChange={(e) => setSelectedMonthYear(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => {
                    const salaryData = employeeSalaries[emp._id] || {};
                    return (
                      <option key={emp._id} value={emp._id}>
                        {getEmployeeName(emp)}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            
            {/* Preview Section */}
            {selectedMonthYear.month && selectedMonthYear.year && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-3">Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Month-Year</span>
                    <p className="font-bold text-blue-600">
                      {monthNames[parseInt(selectedMonthYear.month) - 1]} {selectedMonthYear.year}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Selected Employee</span>
                    <p className="font-medium text-gray-900">
                      {selectedMonthYear.employeeId ? 
                        getEmployeeName(employees.find(e => e._id === selectedMonthYear.employeeId)) :
                        'All Employees'
                      }
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Total Employees</span>
                    <p className="font-bold text-green-600">
                      {selectedMonthYear.employeeId ? 1 : employees.length}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <span className="text-xs text-gray-600">Action</span>
                    <p className="font-medium text-purple-600">
                      {selectedMonthYear.employeeId ? 'View Employee' : 'View All'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowMonthYearViewModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedMonthYear.month && selectedMonthYear.year) {
                    if (selectedMonthYear.employeeId) {
                      // View specific employee's payroll for selected month-year
                      const employee = employees.find(e => e._id === selectedMonthYear.employeeId);
                      if (employee) {
                        setSelectedEmployeeForPayroll(employee);
                        
                        // Filter payrolls for this employee and month-year
                        const filteredPayrolls = payrolls.filter(p => {
                          const matchesEmployee = p.employee === selectedMonthYear.employeeId || 
                                                  p.employeeId === selectedMonthYear.employeeId;
                          
                          if (!matchesEmployee) return false;
                          
                          // Check month-year match
                          if (p.month && p.year) {
                            return p.month === parseInt(selectedMonthYear.month) && 
                                   p.year === parseInt(selectedMonthYear.year);
                          }
                          
                          // Fallback to periodStart
                          if (p.periodStart) {
                            const date = new Date(p.periodStart);
                            return date.getMonth() + 1 === parseInt(selectedMonthYear.month) &&
                                   date.getFullYear() === parseInt(selectedMonthYear.year);
                          }
                          
                          return false;
                        });
                        
                        setEmployeePayrolls(filteredPayrolls);
                        setShowEmployeeDetails(true);
                        setShowMonthYearViewModal(false);
                      }
                    } else {
                      // View all payrolls for selected month-year
                      handleViewMonthYearPayrolls(parseInt(selectedMonthYear.month), parseInt(selectedMonthYear.year));
                      setShowMonthYearViewModal(false);
                    }
                  } else {
                    toast.error('Please select at least month and year');
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                View Payrolls
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Employee-wise View Modal Component
  const EmployeeWiseViewModal = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeePayrolls, setEmployeePayrolls] = useState([]);
    const [loadingEmployee, setLoadingEmployee] = useState(false);
    
    // Filter payrolls by selected employee
    useEffect(() => {
      if (selectedEmployee) {
        setLoadingEmployee(true);
        const filtered = payrolls.filter(p => p.employee === selectedEmployee._id);
        setEmployeePayrolls(filtered);
        
        // Add delay for better UX
        setTimeout(() => {
          setLoadingEmployee(false);
        }, 300);
      }
    }, [selectedEmployee, payrolls]);
    
    // Calculate employee statistics
    const employeeStats = employeePayrolls.reduce((stats, payroll) => {
      stats.totalPayrolls++;
      stats.totalPaid += payroll.status === 'Paid' ? 1 : 0;
      stats.totalPending += payroll.status === 'Pending' ? 1 : 0;
      stats.totalAmount += payroll.summary?.netPayable || 0;
      stats.avgSalary = stats.totalAmount / stats.totalPayrolls;
      return stats;
    }, {
      totalPayrolls: 0,
      totalPaid: 0,
      totalPending: 0,
      totalAmount: 0,
      avgSalary: 0
    });
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Employee-wise Payroll View
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  View payroll details for specific employees
                </p>
              </div>
              <button
                onClick={() => setShowEmployeeWiseView(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            {/* Left Column - Employee List */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Select Employee</h3>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                {employees.length === 0 ? (
                  <div className="p-6 text-center">
                    <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No employees found</p>
                  </div>
                ) : (
                  employees.map(emp => {
                    const empPayrolls = payrolls.filter(p => p.employee === emp._id);
                    const totalSalary = empPayrolls.reduce((sum, p) => sum + (p.summary?.netPayable || 0), 0);
                    
                    return (
                      <div
                        key={emp._id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all ${
                          selectedEmployee?._id === emp._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {getEmployeeName(emp).charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {getEmployeeName(emp)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{emp.email}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="text-gray-600">Payrolls:</div>
                          <div className="font-semibold text-right">{empPayrolls.length}</div>
                          <div className="text-gray-600">Total Paid:</div>
                          <div className="font-semibold text-right text-green-600">
                            ৳{totalSalary.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Right Column - Employee Payroll Details */}
            <div className="lg:col-span-2">
              {selectedEmployee ? (
                <>
                  {/* Employee Header */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {getEmployeeName(selectedEmployee).charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {getEmployeeName(selectedEmployee)}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail size={12} />
                              <span>{selectedEmployee.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone size={12} />
                              <span>{selectedEmployee.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Building size={12} />
                              <span>{selectedEmployee.department || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Payrolls</div>
                        <div className="text-2xl font-bold text-gray-900">{employeeStats.totalPayrolls}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Employee Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-500">Total Amount</div>
                      <div className="text-lg font-bold text-gray-900">
                        ৳{employeeStats.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-500">Paid</div>
                      <div className="text-lg font-bold text-green-600">{employeeStats.totalPaid}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-500">Pending</div>
                      <div className="text-lg font-bold text-amber-600">{employeeStats.totalPending}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-500">Avg Salary</div>
                      <div className="text-lg font-bold text-blue-600">
                        ৳{employeeStats.avgSalary.toFixed(0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Payroll List */}
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Payroll History</h4>
                  {loadingEmployee ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : employeePayrolls.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No payrolls found for this employee</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {employeePayrolls.map(payroll => (
                        <div key={payroll._id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-medium text-gray-900">
                                {payroll.month ? 
                                  `${monthNames[payroll.month - 1]} ${payroll.year}` :
                                  'N/A'
                                }
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                              payroll.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payroll.status}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-gray-600">Basic Pay</div>
                              <div className="font-semibold">৳{payroll.earnings?.basicPay?.toLocaleString() || '0'}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Deductions</div>
                              <div className="font-semibold text-red-600">
                                -৳{payroll.deductions?.total?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Net Pay</div>
                              <div className="font-semibold text-green-600">
                                ৳{payroll.summary?.netPayable?.toLocaleString() || '0'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an Employee</h3>
                    <p className="text-gray-500">Choose an employee from the list to view their payroll details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedEmployee ? 
                  `Showing ${employeePayrolls.length} payrolls for ${getEmployeeName(selectedEmployee)}` :
                  'Select an employee to view details'
                }
              </div>
              <button
                onClick={() => setShowEmployeeWiseView(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                  {isAdmin ? 'Admin Access' : 'Employee Access'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {getUserName()}
                </span>
                <div className="flex items-center gap-2 ml-4">
                  {apiConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Wifi size={16} />
                      <span className="text-sm">Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <WifiOff size={16} />
                      <span className="text-sm">Offline Mode</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
            >
              <HomeIcon size={18} />
              Dashboard
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading.payrolls}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading.payrolls ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            {/* PDF Export Button */}
            {isAdmin && (
              <button
                onClick={() => generateAllEmployeesPDF(employees, payrolls)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium"
              >
                <DownloadCloud size={18} />
                Export All PDF
              </button>
            )}
          </div>
        </div>

        {/* Employee View Banner */}
        {isEmployeeView && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  <UserCheck size={20} />
                  Employee Payroll View
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  You can view and accept your payrolls here
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{getUserName()}</p>
                  <p className="text-xs text-gray-500">Employee ID: {currentEmployeeId?.substring(0, 8)}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span>View all your payroll records</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare size={14} className="text-green-500" />
                <span>Accept payrolls to mark as Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-yellow-500" />
                <span>Contact HR for any discrepancies</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Payroll Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <WalletIcon size={16} />
                  {isEmployeeView ? 'My Total Payroll' : 'Total Payroll'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalPayroll)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isEmployeeView ? 'All your processed payrolls' : 'All processed payrolls'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
            </div>
          </div>

          {/* Employees Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <UsersIcon size={16} />
                  {isEmployeeView ? 'Payroll Count' : 'Employees'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {isEmployeeView ? stats.totalProcessed : stats.totalEmployees}
                </p>
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  {isEmployeeView ? (
                    <>
                      <FileText size={12} /> Your payroll records
                    </>
                  ) : (
                    <>
                      <UserCheck size={12} /> Active employees
                    </>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                {isEmployeeView ? <FileText className="text-white" size={20} /> : <Users className="text-white" size={20} />}
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <ClockIcon size={16} />
                  {isEmployeeView ? 'Pending Approval' : 'Pending'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalPending}
                </p>
                <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  {isEmployeeView ? 'Awaiting your acceptance' : 'Awaiting processing'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
            </div>
          </div>

          {/* Monthly Expense Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <Banknote size={16} />
                  {isEmployeeView ? 'My Monthly' : 'Monthly Expense'}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.monthlyExpense)}
                </p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {isEmployeeView ? 'Your current month' : 'Current month'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <BarChart className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Month-Year Wise Summary Section with Employee Details */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Month-Year Wise Payroll Summary</h2>
                <p className="text-gray-500 text-sm mt-1">Grouped by month with employee details</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Employee-wise View Button */}
                <button
                  onClick={() => setShowEmployeeWiseView(true)}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl px-5 py-2.5 hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
                > 
                  <Users size={18} />
                  <span className="hidden sm:inline">Employee-wise View</span>
                  <span className="inline sm:hidden">Employees</span>
                </button>
                
                {/* Employee Salary Management Button */}
                <button
                  onClick={() => setShowEmployeeSalaryModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-5 py-2.5 hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
                > 
                  <CreditCard size={18} />
                  <span className="hidden sm:inline">Employee Salary</span>
                  <span className="inline sm:hidden">Salary</span>
                </button>
                
                {/* Month-Year View Button */}
                <button
                  onClick={() => setShowMonthYearViewModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2"
                >
                  <CalendarRange size={18} />
                  <span className="hidden sm:inline">View All Months</span>
                  <span className="inline sm:hidden">Months</span>
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {getMonthYearWisePayrolls().slice(0, 3).map((item, index) => (
                <div key={`${item.year}-${item.month}`} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Month-Year Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <CalendarDays className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {item.monthName} {item.year}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {item.employeeCount} Employees
                            </span>
                            <span className="flex items-center gap-1">
                              <Receipt size={14} />
                              {item.payrolls.length} Payrolls
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {formatCurrency(item.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewMonthYearPayrolls(item.month, item.year)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Employee List */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Employees in this month</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {item.employeeDetails.slice(0, 6).map((employee, empIndex) => (
                        <div key={employee.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {employee.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.designation}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              employee.status === 'Paid' ? 'bg-green-100 text-green-800' :
                              employee.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {employee.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payrolls:</span>
                            <span className="font-medium">{employee.payrollCount}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-bold text-purple-600">{formatCurrency(employee.totalAmount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {item.employeeDetails.length > 6 && (
                      <div className="mt-3 text-center">
                        <button
                          onClick={() => handleViewMonthYearPayrolls(item.month, item.year)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + {item.employeeDetails.length - 6} more employees
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Month-Year Selection Modal with Employee Filter */}
        {showMonthYearViewModal && <MonthYearViewModal />}

        {/* Action Cards - Show only for admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg"
            >
              <div className="text-left">
                <p className="font-semibold">Create Payroll</p>
                <p className="text-sm opacity-90">Manual creation</p>
              </div>
              <PlusCircle size={24} />
            </button>

            <button
              onClick={() => setShowCalculateModal(true)}
              disabled={loading.employees}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg disabled:opacity-50"
            >
              <div className="text-left">
                <p className="font-semibold">Calculate</p>
                <p className="text-sm opacity-90">Auto calculation</p>
              </div>
              {loading.employees ? <Loader2 size={24} className="animate-spin" /> : <CalcIcon size={24} />}
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg"
            >
              <div className="text-left">
                <p className="font-semibold">Bulk Generate</p>
                <p className="text-sm opacity-90">All employees</p>
              </div>
              <UsersIcon size={24} />
            </button>

            <button
              onClick={() => setShowMonthYearViewModal(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-5 hover:opacity-90 transition-all flex items-center justify-between shadow-lg"
            >
              <div className="text-left">
                <p className="font-semibold">Month View</p>
                <p className="text-sm opacity-90">Month-wise summary</p>
              </div>
              <CalendarRange size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content - Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEmployeeView ? 'My Payrolls' : 'Payroll Records'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing {paginatedPayrolls.length} of {filteredPayrolls.length} records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={isEmployeeView ? "Search your payrolls..." : "Search employees..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full sm:w-64 transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select> 
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        {loading.payrolls ? (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading payroll data...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the records</p>
            </div>
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records found</h3>
              <p className="text-gray-500 text-sm mb-6">
                {searchTerm || statusFilter !== 'All'
                  ? 'Try adjusting your search or filter'
                  : isEmployeeView
                  ? 'No payroll records available for you yet'
                  : 'Get started by creating your first payroll'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium shadow-sm transition-all"
                >
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Basic Pay</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Payable</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPayrolls.map((payroll, index) => {
                    const uniqueKey = payroll._id || `payroll-${index}-${Date.now()}`;
                    const statusColor = getStatusColor(payroll.status);
                    const netPayable = payroll.summary?.netPayable || payroll.netSalary || 0;
                    const basicPay = payroll.earnings?.basicPay || payroll.basicPay || 0;
                    const employee = employees.find(e => e._id === payroll.employee);
                    
                    return (
                      <tr key={uniqueKey} className="hover:bg-gray-50 transition-colors">
                        {/* Employee Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                              {getEmployeeName(employee || payroll).charAt(0).toUpperCase() || 'E'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{getEmployeeName(employee || payroll)}</div>
                              <div className="text-sm text-gray-500">
                                {employee?.designation || payroll.designation || 'Employee'}
                              </div>
                              {payroll.attendance?.presentDays && (
                                <div className="text-xs text-green-600 mt-1">
                                  📅 Present: {payroll.attendance.presentDays}/{payroll.attendance.totalWorkingDays || 30} days
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Period Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600">
                              {formatDate(payroll.periodStart)}
                            </div>
                            <div className="text-xs text-gray-400 text-center">to</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(payroll.periodEnd)}
                            </div>
                          </div>
                          {payroll.month && payroll.year && (
                            <div className="text-xs text-gray-400 mt-1">
                              {monthNames[payroll.month - 1]} {payroll.year}
                            </div>
                          )}
                        </td>

                        {/* Basic Pay Column */}
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(basicPay)}
                          </div>
                          {payroll.salaryDetails?.monthlySalary && (
                            <div className="text-xs text-gray-400">
                              Monthly: {formatCurrency(payroll.salaryDetails.monthlySalary)}
                            </div>
                          )}
                        </td>

                        {/* Net Payable Column */}
                        <td className="px-6 py-4">
                          <div className="text-xl font-bold text-purple-600">
                            {formatCurrency(netPayable)}
                          </div>
                          {payroll.autoDeductionsApplied && (
                            <div className="text-xs text-green-500 mt-1">
                              ✓ Auto deductions
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.icon}
                            <span className="ml-2">{payroll.status}</span>
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Add Employee-Wise View Button */}
                            <button
                              onClick={() => {
                                const employee = employees.find(e => e._id === (payroll.employee || payroll.employeeId));
                                if (employee) {
                                  setSelectedEmployeeForPayroll(employee);
                                  loadEmployeeSpecificPayrolls(employee._id);
                                  setShowEmployeeDetails(true);
                                }
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Employee's Payrolls"
                            >
                              <User size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>

                            {/* PDF Generate Button */}
                            <button
                              onClick={() => {
                                const employee = employees.find(e => e._id === (payroll.employee || payroll.employeeId));
                                if (employee) {
                                  generateSinglePayrollPDF(payroll, employee);
                                } else {
                                  generateSinglePayrollPDF(payroll, {});
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </button>

                            {/* Employee can accept pending payrolls */}
                            {isEmployeeView && payroll.status === 'Pending' && (
                              <button
                                onClick={() => handleEmployeePayrollAction(payroll._id, 'accept')}
                                disabled={loading.accept}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Accept Payroll"
                              >
                                {loading.accept ? <Loader2 size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                              </button>
                            )}

                            {/* Admin only actions */}
                            {isAdmin && (
                              <>
                                {payroll.status === 'Pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Mark as Paid"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeletePayroll(payroll._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>

                                {/* View Employee Payrolls Button */}
                                <button
                                  onClick={() => {
                                    const employee = employees.find(e => e._id === payroll.employee || e._id === payroll.employeeId);
                                    if (employee) {
                                      handleViewEmployeePayrolls(employee);
                                    }
                                  }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View Employee's All Payrolls"
                                >
                                  <User size={16} />
                                </button>
                                
                                {/* View by Month-Year Button */}
                                {payroll.month && payroll.year && (
                                  <button
                                    onClick={() => handleMonthYearPayrollView(payroll.month, payroll.year)}
                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    title={`View ${payroll.month}/${payroll.year} Payrolls`}
                                  >
                                    <CalendarRange size={16} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
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
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg ${currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Employee-wise View Modal */}
      {showEmployeeWiseView && <EmployeeWiseViewModal />}

      {/* Create Payroll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create Payroll</h2>
                  <p className="text-gray-500 text-sm mt-1">Auto-calculated attendance and deductions</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePayroll} className="p-6 space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={createForm.employee}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  required
                  disabled={loading.employees || employees.length === 0}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
                >
                  <option value="">Choose an employee</option>
                  {employees.map((emp) => {
                    const salaryData = employeeSalaries[emp._id] || {};
                    return (
                      <option key={emp._id} value={emp._id}>
                        {getEmployeeName(emp)} • 
                        Salary: {formatCurrency(salaryData.salary || 30000)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Pay Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Period *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={createForm.periodStart}
                      onChange={(e) => handlePeriodStartChange(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Start Date (Month selection)</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={createForm.periodEnd}
                      onChange={(e) => setCreateForm({ ...createForm, periodEnd: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">End Date</p>
                  </div>
                </div>
              </div>

              {/* Auto Calculated Attendance */}  
              {createForm.employee && createForm.periodStart && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                    <Check size={16} />
                    Auto Attendance Calculation (23 Working Days Month)
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <span className="text-xs text-gray-600 block">Working Days</span>
                      <p className="text-lg font-bold text-blue-600">23</p>
                      <p className="text-xs text-gray-400">Fixed per month</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <span className="text-xs text-gray-600 block">Present Days</span>
                      <p className="text-lg font-bold text-green-600">
                        {createForm.presentDays}
                      </p>
                      <p className="text-xs text-green-500">
                        Auto-loaded from attendance
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <span className="text-xs text-gray-600 block">Late Days</span>
                      <p className="text-lg font-bold text-yellow-600">
                        {calculateAutoAttendance(createForm.employee, 
                          new Date(createForm.periodStart).getMonth() + 1,
                          new Date(createForm.periodStart).getFullYear()
                        ).lateDays}
                      </p>
                      <p className="text-xs text-gray-400">For deduction</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <span className="text-xs text-gray-600 block">Attendance %</span>
                      <p className="text-lg font-bold text-purple-600">
                        {Math.round((createForm.presentDays / 23) * 100)}%
                      </p>
                      <p className="text-xs text-gray-400">Based on 23 days</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    <p>✓ 23 working days month calculation</p>
                    <p>✓ Auto-loaded from employee attendance records</p>
                    <p>✓ Late/Absent/Leave days automatically calculated</p>
                  </div>
                </div>
              )}

              {/* Earnings */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="text-sm font-medium text-emerald-700 mb-3">Additional Earnings (BDT)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Overtime Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.earnings.overtime}
                      onChange={(e) => {
                        const overtime = parseInt(e.target.value) || 0;
                        const basicPay = createForm.basicPay || 0;
                        const deductionsTotal = (createForm.deductions.lateDeduction || 0) + 
                                               (createForm.deductions.absentDeduction || 0) + 
                                               (createForm.deductions.leaveDeduction || 0);
                        setCreateForm(prev => ({
                          ...prev,
                          earnings: { ...prev.earnings, overtime },
                          netSalary: basicPay + overtime + (prev.earnings.bonus || 0) + (prev.earnings.allowance || 0) - deductionsTotal
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Bonus</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.earnings.bonus}
                      onChange={(e) => {
                        const bonus = parseInt(e.target.value) || 0;
                        const basicPay = createForm.basicPay || 0;
                        const deductionsTotal = (createForm.deductions.lateDeduction || 0) + 
                                               (createForm.deductions.absentDeduction || 0) + 
                                               (createForm.deductions.leaveDeduction || 0);
                        setCreateForm(prev => ({
                          ...prev,
                          earnings: { ...prev.earnings, bonus },
                          netSalary: basicPay + (prev.earnings.overtime || 0) + bonus + (prev.earnings.allowance || 0) - deductionsTotal
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.earnings.allowance}
                      onChange={(e) => {
                        const allowance = parseInt(e.target.value) || 0;
                        const basicPay = createForm.basicPay || 0;
                        const deductionsTotal = (createForm.deductions.lateDeduction || 0) + 
                                               (createForm.deductions.absentDeduction || 0) + 
                                               (createForm.deductions.leaveDeduction || 0);
                        setCreateForm(prev => ({
                          ...prev,
                          earnings: { ...prev.earnings, allowance },
                          netSalary: basicPay + (prev.earnings.overtime || 0) + (prev.earnings.bonus || 0) + allowance - deductionsTotal
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Deductions section with 23 days calculation */}
              {createForm.employee && (
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <h3 className="text-sm font-medium text-rose-700 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Auto Calculated Deductions (Based on 23 Days)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Late Deduction */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs text-gray-600">Late Deduction</label>
                        {createForm.deductions.lateDeduction > 0 && (
                          <span className="text-xs font-medium text-rose-600">
                            -{formatCurrency(createForm.deductions.lateDeduction)}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={createForm.deductions.lateDeduction}
                        readOnly
                        className="w-full px-3 py-2.5 bg-gray-50 border border-rose-200 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        3 late days = 1 day deduction ({formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))})
                      </p>
                    </div>
                    
                    {/* Absent Deduction */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs text-gray-600">Absent Deduction</label>
                        {createForm.deductions.absentDeduction > 0 && (
                          <span className="text-xs font-medium text-rose-600">
                            -{formatCurrency(createForm.deductions.absentDeduction)}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={createForm.deductions.absentDeduction}
                        readOnly
                        className="w-full px-3 py-2.5 bg-gray-50 border border-rose-200 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        1 absent day = {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))} deduction
                      </p>
                    </div>
                    
                    {/* Leave Deduction */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs text-gray-600">Leave Deduction</label>
                        {createForm.deductions.leaveDeduction > 0 && (
                          <span className="text-xs font-medium text-rose-600">
                            -{formatCurrency(createForm.deductions.leaveDeduction)}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={createForm.deductions.leaveDeduction}
                        readOnly
                        className="w-full px-3 py-2.5 bg-gray-50 border border-rose-200 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        1 leave day = {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))} deduction
                      </p>
                    </div>
                  </div>
                  
                  {/* Daily Rate Calculation Box */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-rose-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Monthly Salary</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(createForm.monthlySalary || 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">÷ 23 Days</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Daily Rate</p>
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-rose-100">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">All deductions calculated as:</span><br/>
                        (Deduction Days) × {formatCurrency(calculateDailyRate(createForm.monthlySalary || 0))} per day
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {createForm.employee && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700 mb-3">Salary Summary (BDT)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                      <span className="text-xs text-gray-600">Monthly Salary</span>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(createForm.monthlySalary || 0)}
                      </p>
                      <p className="text-xs text-green-500">✓ Full month basic</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                      <span className="text-xs text-gray-600">Total Earnings</span>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(
                          createForm.monthlySalary + 
                          (createForm.earnings.overtime || 0) + 
                          (createForm.earnings.bonus || 0) + 
                          (createForm.earnings.allowance || 0)
                        )}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                      <span className="text-xs text-gray-600">Total Deductions</span>
                      <p className="text-lg font-bold text-rose-600">
                        {formatCurrency(
                          (createForm.deductions.lateDeduction || 0) + 
                          (createForm.deductions.absentDeduction || 0) + 
                          (createForm.deductions.leaveDeduction || 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-400">23 days calculation</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                      <span className="text-xs text-gray-600">Net Payable</span>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(createForm.netSalary || 0)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Monthly - Deductions + Allowances
                      </p>
                    </div>
                  </div>
                  
                  {/* Calculation Formula */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">Calculation Formula:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Net Payable = Monthly Salary ({formatCurrency(createForm.monthlySalary || 0)}) + 
                      Allowances ({formatCurrency((createForm.earnings.overtime || 0) + (createForm.earnings.bonus || 0) + (createForm.earnings.allowance || 0))}) - 
                      Deductions ({formatCurrency((createForm.deductions.lateDeduction || 0) + (createForm.deductions.absentDeduction || 0) + (createForm.deductions.leaveDeduction || 0))})
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading.action}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.action || !createForm.employee}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading.action ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      Create Payroll
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Payroll Details Modal (Admin View) */}
      {showEmployeeDetails && selectedEmployeeForPayroll && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getEmployeeName(selectedEmployeeForPayroll).charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {getEmployeeName(selectedEmployeeForPayroll)}'s Payrolls
                    </h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>ID: {selectedEmployeeForPayroll.employeeId || selectedEmployeeForPayroll._id?.substring(0, 8)}</span>
                      <span>•</span>
                      <span>Department: {selectedEmployeeForPayroll.department || 'N/A'}</span>
                      <span>•</span>
                      <span>Salary: {formatCurrency(employeeSalaries[selectedEmployeeForPayroll._id]?.salary || 30000)}/month</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      generateEmployeePayrollPDF(selectedEmployeeForPayroll, employeePayrolls);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
                  >
                    <Download size={14} />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowEmployeeDetails(false);
                      setSelectedEmployeeForPayroll(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => {
                    setCreateForm(prev => ({
                      ...prev,
                      employee: selectedEmployeeForPayroll._id
                    }));
                    setShowEmployeeDetails(false);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium"
                >
                  <PlusCircle size={16} />
                  Create New Payroll
                </button>
                
                <button
                  onClick={() => {
                    const currentDate = new Date();
                    const month = currentDate.getMonth() + 1;
                    const year = currentDate.getFullYear();
                    setCalculateForm({
                      employeeId: selectedEmployeeForPayroll._id,
                      month: month.toString(),
                      year: year.toString()
                    });
                    setShowEmployeeDetails(false);
                    setShowCalculateModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 flex items-center gap-2 text-sm font-medium"
                >
                  <Calculator size={16} />
                  Auto Calculate Current Month
                </button>
              </div>

              {/* Employee Payrolls Table */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payroll History</h3>
                
                {loading.payrolls ? (
                  <div className="py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-600">Loading payrolls...</p>
                    </div>
                  </div>
                ) : employeePayrolls.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-gray-400" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No payroll records found</h3>
                      <p className="text-gray-500 text-sm">This employee has no payroll records yet.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white border-b">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Basic Pay</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Payable</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attendance</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeePayrolls.map((payroll, index) => {
                          const statusColor = getStatusColor(payroll.status);
                          return (
                            <tr key={payroll._id || index} className="border-b hover:bg-white">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payroll.month && payroll.year && `${payroll.month}/${payroll.year}`}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-bold text-blue-600">
                                  {formatCurrency(payroll.earnings?.basicPay || payroll.basicPay || 0)}
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
                                {payroll.attendance?.presentDays ? (
                                  <div className="text-sm text-gray-600">
                                    {payroll.attendance.presentDays}/{payroll.attendance.totalWorkingDays || 30} days
                                    <div className="text-xs text-green-500">
                                      {Math.round((payroll.attendance.presentDays / (payroll.attendance.totalWorkingDays || 30)) * 100)}%
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedPayroll(payroll);
                                      setShowDetailsModal(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  
                                  <button
                                    onClick={() => generateSinglePayrollPDF(payroll, selectedEmployeeForPayroll)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Download PDF"
                                  >
                                    <Download size={16} />
                                  </button>
                                  
                                  {payroll.status === 'Pending' && (
                                    <button
                                      onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Mark as Paid"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleDeletePayroll(payroll._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month-Year Wise Payroll View Modal */}
      {showMonthYearDetails && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payroll Summary - {monthNames[selectedMonthYearForView.month - 1]} {selectedMonthYearForView.year}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Showing payrolls for {monthYearPayrolls.length} employees
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const monthYearData = {
                        month: selectedMonthYearForView.month,
                        year: selectedMonthYearForView.year
                      };
                      generateMonthWiseBulkPDF(monthYearData, employees, payrolls);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
                  >
                    <Download size={14} />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowMonthYearDetails(false);
                      setSelectedMonthYearForView({ month: '', year: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Summary Stats */}
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
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {monthYearPayrolls.filter(p => p.status === 'Paid').length}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {monthYearPayrolls.filter(p => p.status === 'Pending').length}
                  </p>
                </div>
              </div>

              {/* Month-Year Payrolls Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Basic Pay</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Payable</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attendance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthYearPayrolls.map((payroll, index) => {
                      const statusColor = getStatusColor(payroll.status);
                      const employee = employees.find(e => e._id === payroll.employee);
                      
                      return (
                        <tr key={payroll._id || index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                                {getEmployeeName(employee || payroll).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{getEmployeeName(employee || payroll)}</div>
                                <div className="text-xs text-gray-500">
                                  {employee?.designation || 'Employee'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">
                              {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
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
                            {payroll.attendance?.presentDays ? (
                              <div className="text-xs">
                                <span className="text-green-600">{payroll.attendance.presentDays} days</span>
                                <div className="text-gray-400">
                                  {Math.round((payroll.attendance.presentDays / (payroll.attendance.totalWorkingDays || 30)) * 100)}%
                                </div>
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setShowDetailsModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye size={14} />
                              </button>
                              
                              <button
                                onClick={() => {
                                  const employee = employees.find(e => e._id === payroll.employee);
                                  generateSinglePayrollPDF(payroll, employee || {});
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Download PDF"
                              >
                                <Download size={14} />
                              </button>
                              
                              {payroll.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Mark Paid"
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  const employee = employees.find(e => e._id === payroll.employee || e._id === payroll.employeeId);
                                  if (employee) {
                                    handleViewEmployeePayrolls(employee);
                                  }
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                title="View Employee"
                              >
                                <User size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Payroll Modal */}
      {showCalculateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Calculate Payroll</h2>
                  <p className="text-gray-500 text-sm mt-1">Auto-calculate based on attendance (30 days month)</p>
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleCalculatePayroll} className="p-6 space-y-6">
                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee *
                  </label>
                  <select
                    value={calculateForm.employeeId}
                    onChange={(e) => setCalculateForm({ ...calculateForm, employeeId: e.target.value })}
                    required
                    disabled={loading.employees}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">Choose an employee</option>
                    {employees.map((emp) => {
                      const salaryData = employeeSalaries[emp._id] || {};
                      return (
                        <option key={emp._id} value={emp._id}>
                          {getEmployeeName(emp)} • 
                          Salary: {formatCurrency(salaryData.salary || 30000)}/month
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Month and Year Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month *
                    </label>
                    <select
                      value={calculateForm.month}
                      onChange={(e) => setCalculateForm({ ...calculateForm, month: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      value={calculateForm.year}
                      onChange={(e) => setCalculateForm({ ...calculateForm, year: e.target.value })}
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

                {/* Calculation Result - Scrollable Area */}
                {calculationResult && (
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <h3 className="text-sm font-medium text-green-700 mb-3">Calculation Result</h3>
                      
                      <div className="space-y-4">
                        {/* Employee Info */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Employee:</span>
                          <span className="text-sm font-medium">{calculationResult.employeeDetails.name}</span>
                        </div>
                        
                        {/* Period */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Period:</span>
                          <span className="text-sm font-medium">
                            {monthNames[calculationResult.month - 1]} {calculationResult.year}
                          </span>
                        </div>
                        
                        {/* Attendance */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-white rounded-lg border">
                            <span className="text-xs text-gray-600">Present Days</span>
                            <p className="text-lg font-bold text-green-600">
                              {calculationResult.attendanceBreakdown.presentDays}/{calculationResult.attendanceBreakdown.totalWorkingDays}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg border">
                            <span className="text-xs text-gray-600">Attendance %</span>
                            <p className="text-lg font-bold text-blue-600">
                              {calculationResult.attendancePercentage}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Salary Calculation */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Monthly Salary:</span>
                            <span className="text-sm font-medium">{formatCurrency(calculationResult.monthlySalary)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Daily Rate (÷23):</span>
                            <span className="text-sm font-medium">{formatCurrency(calculationResult.dailyRate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Basic Pay:</span>
                            <span className="text-sm font-bold text-blue-600">
                              {formatCurrency(calculationResult.basicPay)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Deductions */}
                        {calculationResult.deductions.total > 0 && (
                          <div className="p-3 bg-rose-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-rose-700">Deductions:</span>
                              <span className="text-sm font-bold text-rose-700">
                                {formatCurrency(calculationResult.deductions.total)}
                              </span>
                            </div>
                            {calculationResult.deductions.lateDeduction > 0 && (
                              <div className="text-xs text-rose-600">
                                Late: {formatCurrency(calculationResult.deductions.lateDeduction)}
                              </div>
                            )}
                            {calculationResult.deductions.absentDeduction > 0 && (
                              <div className="text-xs text-rose-600">
                                Absent: {formatCurrency(calculationResult.deductions.absentDeduction)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Net Payable */}
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-purple-700">Net Payable:</span>
                            <span className="text-xl font-bold text-purple-700">
                              {formatCurrency(calculationResult.monthlySalary)}
                            </span>
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            {calculationResult.summary.inWords}
                          </div>
                        </div>
                      </div>
                      
                      {/* Generate Button */}
                      <button
                        type="button"
                        onClick={handleAutoGenerateFromCalculation}
                        disabled={loading.action}
                        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading.action ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <PlusCircle size={18} />
                            Generate Payroll from Calculation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer with Action Buttons - Fixed at bottom of scrollable area */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCalculateModal(false);
                        setCalculationResult(null);
                      }}
                      disabled={loading.calculation}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading.calculation}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                    >
                      {loading.calculation ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator size={18} />
                          Calculate Payroll
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Bulk Generate Payrolls</h2>
                  <p className="text-gray-500 text-sm mt-1">Generate for all employees (30 days month)</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <select
                    value={bulkForm.month}
                    onChange={(e) => setBulkForm({ ...bulkForm, month: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    value={bulkForm.year}
                    onChange={(e) => setBulkForm({ ...bulkForm, year: e.target.value })}
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

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Employees:</span>
                    <span className="text-sm font-medium">{employees.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Month:</span>
                    <span className="text-sm font-medium">
                      {bulkForm.month ? monthNames[parseInt(bulkForm.month) - 1] : 'N/A'} {bulkForm.year}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Payrolls will be generated with auto-calculated attendance and deductions
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  disabled={loading.generate}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.generate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {loading.generate ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <UsersIcon size={18} />
                      Generate for All
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Details Modal */}
      {showDetailsModal && selectedPayroll && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
                  <p className="text-gray-500 text-sm mt-1">Complete breakdown of payroll calculation</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const employee = employees.find(e => e._id === selectedPayroll.employee);
                      generateSinglePayrollPDF(selectedPayroll, employee || {});
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
                  >
                    <Download size={14} />
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPayroll(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {getEmployeeName(employees.find(e => e._id === selectedPayroll.employee) || {}).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{getEmployeeName(employees.find(e => e._id === selectedPayroll.employee) || selectedPayroll)}</h3>
                  <p className="text-gray-600">
                    {formatDate(selectedPayroll.periodStart)} - {formatDate(selectedPayroll.periodEnd)}
                  </p>
                  {selectedPayroll.month && selectedPayroll.year && (
                    <p className="text-sm text-gray-500">
                      {monthNames[selectedPayroll.month - 1]} {selectedPayroll.year}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  {(() => {
                    const statusColor = getStatusColor(selectedPayroll.status);
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                        {statusColor.icon}
                        <span className="ml-2">{selectedPayroll.status}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Salary Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Salary Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Monthly Salary</span>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedPayroll.salaryDetails?.monthlySalary || selectedPayroll.monthlySalary || 30000)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Daily Rate (÷30)</span>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedPayroll.salaryDetails?.dailyRate || calculateDailyRate(selectedPayroll.salaryDetails?.monthlySalary || 30000))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              {selectedPayroll.attendance && (
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendance (30 days month)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Present Days</span>
                      <p className="text-lg font-bold text-green-600">
                        {selectedPayroll.attendance.presentDays || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Working Days</span>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedPayroll.attendance.totalWorkingDays || 30}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Attendance %</span>
                      <p className="text-lg font-bold text-purple-600">
                        {selectedPayroll.attendance.attendancePercentage || 
                         Math.round(((selectedPayroll.attendance.presentDays || 0) / (selectedPayroll.attendance.totalWorkingDays || 30)) * 100)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <span className="text-xs text-gray-600">Absent Days</span>
                      <p className="text-lg font-bold text-rose-600">
                        {(selectedPayroll.attendance.totalWorkingDays || 30) - (selectedPayroll.attendance.presentDays || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Earnings */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Earnings (BDT)</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Basic Pay:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0)}
                    </span>
                  </div>
                  {selectedPayroll.earnings?.overtime > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overtime:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(selectedPayroll.earnings.overtime)}
                      </span>
                    </div>
                  )}
                  {selectedPayroll.earnings?.bonus > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Bonus:</span>
                      <span className="font-medium text-yellow-600">
                        {formatCurrency(selectedPayroll.earnings.bonus)}
                      </span>
                    </div>
                  )}
                  {selectedPayroll.earnings?.allowance > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Allowance:</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(selectedPayroll.earnings.allowance)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Total Earnings:</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(selectedPayroll.earnings?.total || 
                          (selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0) + 
                          (selectedPayroll.earnings?.overtime || 0) + 
                          (selectedPayroll.earnings?.bonus || 0) + 
                          (selectedPayroll.earnings?.allowance || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              {(selectedPayroll.deductions?.total > 0 || selectedPayroll.autoDeductionsApplied) && (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Deductions (BDT)</h3>
                  <div className="space-y-2">
                    {selectedPayroll.deductions?.lateDeduction > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Late Deduction:</span>
                        <span className="font-medium text-rose-600">
                          {formatCurrency(selectedPayroll.deductions.lateDeduction)}
                        </span>
                      </div>
                    )}
                    {selectedPayroll.deductions?.absentDeduction > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Absent Deduction:</span>
                        <span className="font-medium text-rose-600">
                          {formatCurrency(selectedPayroll.deductions.absentDeduction)}
                        </span>
                      </div>
                    )}
                    {selectedPayroll.deductions?.leaveDeduction > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Leave Deduction:</span>
                        <span className="font-medium text-rose-600">
                          {formatCurrency(selectedPayroll.deductions.leaveDeduction)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-rose-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Total Deductions:</span>
                        <span className="text-lg font-bold text-rose-600">
                          {formatCurrency(selectedPayroll.deductions?.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary (BDT)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Gross Earnings:</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(selectedPayroll.summary?.grossEarnings || 
                        selectedPayroll.earnings?.total || 
                        (selectedPayroll.earnings?.basicPay || selectedPayroll.basicPay || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Deductions:</span>
                    <span className="font-medium text-rose-600">
                      {formatCurrency(selectedPayroll.summary?.totalDeductions || selectedPayroll.deductions?.total || 0)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">Net Payable:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(selectedPayroll.summary?.netPayable || selectedPayroll.netSalary || 0)}
                      </span>
                    </div>
                    {selectedPayroll.summary?.inWords && (
                      <p className="text-sm text-purple-700 mt-2">
                        {selectedPayroll.summary.inWords}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPayroll(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPayroll.status === 'Pending' && isAdmin && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedPayroll._id, 'Paid');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Month-Year View Modal */}
      {showEmployeeMonthYearView && selectedEmployeeForDetails && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedEmployeeForDetails.employeeName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedEmployeeForDetails.employeeName} - Month-Wise Payrolls
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {selectedEmployeeForDetails.designation} • {selectedEmployeeForDetails.department}
                    </p>
                  </div>
                </div>
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-purple-800">Export Options</h3>
                      <p className="text-xs text-purple-600">Generate PDF reports for this employee</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateEmployeePayrollPDF(selectedEmployeeForDetails, 
                          payrolls.filter(p => p.employee === selectedEmployeeForDetails.employeeId)
                        )}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-1"
                      >
                        <FileText size={14} />
                        All Payrolls
                      </button>
                      <button
                        onClick={() => generateEmployeeSalaryStatementPDF(selectedEmployeeForDetails, payrolls)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Receipt size={14} />
                        Salary Statement
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEmployeeMonthYearView(false);
                    setSelectedEmployeeForDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Employee Summary */}
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Salary</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedEmployeeForDetails.monthlySalary)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Payrolls</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedEmployeeForDetails.totalPayrolls}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedEmployeeForDetails.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Month Coverage</p>
                    <p className="text-xl font-bold text-orange-600">
                      {selectedEmployeeForDetails.monthYearCount} months
                    </p>
                  </div>
                </div>
              </div>

              {/* Month-Year Wise Breakdown */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Month-Year Breakdown</h3>
                
                {getEmployeeMonthYearPayrolls(selectedEmployeeForDetails.employeeId).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="text-gray-400" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No month-wise data available</h3>
                      <p className="text-gray-500 text-sm">
                        This employee doesn't have any payrolls with month-year information
                      </p>
                    </div>
                  </div>
                ) : (
                  getEmployeeMonthYearPayrolls(selectedEmployeeForDetails.employeeId).map((monthYear, index) => (
                    <div key={`${monthYear.year}-${monthYear.month}`} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Month-Year Header */}
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">{monthYear.month}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {monthYear.monthName} {monthYear.year}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {monthYear.payrollCount} payrolls • {formatCurrency(monthYear.totalAmount)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {monthYear.statusCount.Paid > 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Paid: {monthYear.statusCount.Paid}
                              </span>
                            )}
                            {monthYear.statusCount.Pending > 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                Pending: {monthYear.statusCount.Pending}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Payroll List */}
                      <div className="p-4">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-gray-500 border-b">
                              <th className="pb-2 text-left">Period</th>
                              <th className="pb-2 text-left">Basic Pay</th>
                              <th className="pb-2 text-left">Net Payable</th>
                              <th className="pb-2 text-left">Status</th>
                              <th className="pb-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthYear.payrolls.map((payroll, pIndex) => (
                              <tr key={pIndex} className="border-b hover:bg-gray-50 last:border-0">
                                <td className="py-3">
                                  <div className="text-sm text-gray-600">
                                    {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="text-sm font-medium text-blue-600">
                                    {formatCurrency(payroll.earnings?.basicPay || payroll.basicPay || 0)}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="text-sm font-bold text-purple-600">
                                    {formatCurrency(payroll.summary?.netPayable || payroll.netSalary || 0)}
                                  </div>
                                </td>
                                <td className="py-3">
                                  {(() => {
                                    const statusColor = getStatusColor(payroll.status);
                                    return (
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                                        {statusColor.icon}
                                        <span className="ml-1">{payroll.status}</span>
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedPayroll(payroll);
                                        setShowDetailsModal(true);
                                      }}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                      title="View"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    
                                    {payroll.status === 'Pending' && (
                                      <button
                                        onClick={() => handleUpdateStatus(payroll._id, 'Paid')}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                        title="Mark Paid"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Page;