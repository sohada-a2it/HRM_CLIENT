"use client"; 
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, Calendar, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle,
  Download, BarChart3, TrendingUp, Moon, Sun, Zap, ChevronRight,
  Edit, Eye, EyeOff, FileText, Printer, Share2, User, Shield, Loader2,
  LogIn, LogOut, Users, Home, Briefcase, Coffee, Activity, ChevronLeft,
  ChevronRight as ChevronRightIcon, Plus, Upload, Play, Settings,
  FileSpreadsheet, CalendarDays, Clock4, AlertTriangle, MoreVertical,
  Search, UserCircle, ChevronDown, X, FileEdit, CalendarRange, Layers,
  Database, Save, Mail, Phone, Briefcase as BriefcaseIcon, MapPin
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const PDFLibraries = {
  async load() {
    if (typeof window === 'undefined') return null;
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      return { jsPDF, autoTable };
    } catch (error) {
      console.error("Failed to load PDF libraries:", error);
      return null;
    }
  }
};

// Format currency for BDT
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Convert number to words in BDT
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

// Month names array for payroll
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// PDF Export Functions
const pdfUtils = {
  // Generate Individual Attendance PDF
  generateAttendancePDF: async (attendance, userData, summary) => {
    try {
      const libraries = await PDFLibraries.load();
      if (!libraries) {
        toast.error("PDF library failed to load");
        return;
      }
      
      const { jsPDF, autoTable } = libraries;
      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      // Company Header
      doc.setFillColor(100, 65, 164); // Purple color
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ATTENDANCE REPORT', 105, 12, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('A2IT Solutions Ltd.', 105, 19, { align: 'center' });
      doc.text('Human Resource Management System', 105, 24, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Employee Information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Information', 14, 40);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const employeeInfo = [
        ['Employee Name:', userData?.firstName + ' ' + userData?.lastName || 'N/A'],
        ['Employee ID:', userData?.employeeId || 'N/A'],
        ['Department:', userData?.department || 'N/A'],
        ['Designation:', userData?.position || userData?.designation || 'N/A'],
        ['Email:', userData?.email || 'N/A'],
        ['Report Period:', new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })],
        ['Generated On:', new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })],
        ['Report Type:', 'Attendance Summary']
      ];
      
      autoTable(doc, {
        startY: 45,
        head: [],
        body: employeeInfo,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 55 },
          1: { cellWidth: 125 }
        }
      });
      
      // Summary Statistics
      const summaryY = doc.lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 14, summaryY);
      
      const summaryData = [
        ['Total Days', summary?.totalDays || 0],
        ['Present Days', summary?.daysPresent || 0],
        ['Absent Days', summary?.daysAbsent || 0],
        ['Leave Days', summary?.daysLeave || 0],
        ['Late Arrivals', summary?.lateArrivals || 0],
        ['Holidays/Off', summary?.daysHoliday || 0],
        ['Total Hours', (summary?.totalHours || 0).toFixed(2)],
        ['Attendance Rate', (summary?.attendanceRate || 0).toFixed(1) + '%']
      ];
      
      autoTable(doc, {
        startY: summaryY + 5,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { 
          fillColor: [100, 65, 164], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' }
        }
      });
      
      // Attendance Details Table
      const detailsY = doc.lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Attendance Details', 14, detailsY);
      
      // Prepare attendance data for table
      const attendanceData = attendance.map(record => [
        new Date(record.date).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        record.clockIn ? new Date(record.clockIn).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '-',
        record.clockOut ? new Date(record.clockOut).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '-',
        record.totalHours?.toFixed(2) || '-',
        record.status
      ]);
      
      autoTable(doc, {
        startY: detailsY + 5,
        head: [['Date', 'Clock In', 'Clock Out', 'Hours', 'Status']],
        body: attendanceData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 35, halign: 'center' }
        },
        didDrawPage: function (data) {
          // Add page number
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
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
      doc.save(`Attendance_Report_${userData?.employeeId || 'Employee'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(`PDF generation failed: ${error.message}`);
    }
  },

  // Generate Bulk Attendance PDF (Admin)
  generateBulkAttendancePDF: async (employeesData, startDate, endDate) => {
    try {
      const libraries = await PDFLibraries.load();
      if (!libraries) {
        toast.error("PDF library failed to load");
        return;
      }
      
      const { jsPDF, autoTable } = libraries;
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Company Header
      doc.setFillColor(100, 65, 164);
      doc.rect(0, 0, 297, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('BULK ATTENDANCE REPORT', 148.5, 10, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('A2IT Solutions Ltd. - HR Department', 148.5, 16, { align: 'center' });
      doc.text(`Period: ${startDate} to ${endDate}`, 148.5, 21, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Report Information
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 35);
      doc.text(`Total Employees: ${employeesData.length}`, 14, 40);
      
      // Prepare data for table
      const tableData = employeesData.map((emp, index) => [
        index + 1,
        emp.employeeId || 'N/A',
        emp.name || 'N/A',
        emp.department || 'N/A',
        emp.daysPresent || 0,
        emp.daysAbsent || 0,
        emp.daysLeave || 0,
        emp.totalHours?.toFixed(2) || '0.00',
        (emp.attendanceRate || 0).toFixed(1) + '%'
      ]);
      
      // Main Table
      autoTable(doc, {
        startY: 45,
        head: [
          ['#', 'Emp ID', 'Name', 'Department', 'Present', 'Absent', 'Leave', 'Total Hours', 'Rate']
        ],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { 
          fillColor: [52, 152, 219], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold',
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 25, halign: 'center' },
          8: { cellWidth: 25, halign: 'center' }
        },
        margin: { top: 45 },
        didDrawPage: function (data) {
          // Add page number
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });
      
      // Summary Section
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, finalY);
      
      const totalPresent = employeesData.reduce((sum, emp) => sum + (emp.daysPresent || 0), 0);
      const totalAbsent = employeesData.reduce((sum, emp) => sum + (emp.daysAbsent || 0), 0);
      const totalLeave = employeesData.reduce((sum, emp) => sum + (emp.daysLeave || 0), 0);
      const avgAttendance = employeesData.length > 0 
        ? (employeesData.reduce((sum, emp) => sum + (emp.attendanceRate || 0), 0) / employeesData.length).toFixed(1)
        : 0;
      
      const summaryData = [
        ['Total Employees', employeesData.length],
        ['Total Present Days', totalPresent],
        ['Total Absent Days', totalAbsent],
        ['Total Leave Days', totalLeave],
        ['Average Attendance Rate', avgAttendance + '%']
      ];
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 50, halign: 'center' }
        }
      });
      
      // Footer
      const footerY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Confidential - For Internal Use Only', 148.5, footerY, { align: 'center' });
      
      // Save the PDF
      doc.save(`Bulk_Attendance_Report_${startDate}_to_${endDate}.pdf`);
      
    } catch (error) {
      console.error("Bulk PDF generation error:", error);
      toast.error(`Bulk PDF generation failed: ${error.message}`);
    }
  },

  // Generate Monthly Attendance Summary PDF
  generateMonthlySummaryPDF: async (attendanceData, userData, month, year) => {
    try {
      const libraries = await PDFLibraries.load();
      if (!libraries) {
        toast.error("PDF library failed to load");
        return;
      }
      
      const { jsPDF, autoTable } = libraries;
      const doc = new jsPDF();
      
      // Header with gradient effect
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('MONTHLY ATTENDANCE', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`, 105, 30, { align: 'center' });
      
      // Employee Details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Details', 14, 50);
      
      const employeeDetails = [
        ['Name:', userData?.firstName + ' ' + userData?.lastName],
        ['Employee ID:', userData?.employeeId || 'N/A'],
        ['Department:', userData?.department || 'N/A'],
        ['Designation:', userData?.position || 'N/A'],
        ['Month:', `${month}/${year}`]
      ];
      
      autoTable(doc, {
        startY: 55,
        head: [],
        body: employeeDetails,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 140 }
        }
      });
      
      // Statistics Cards
      const statsY = doc.lastAutoTable.finalY + 10;
      
      // Present Days
      doc.setFillColor(46, 204, 113);
      doc.roundedRect(14, statsY, 45, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(attendanceData.filter(a => a.status === 'Present').length, 36.5, statsY + 17, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Present', 36.5, statsY + 22, { align: 'center' });
      
      // Absent Days
      doc.setFillColor(231, 76, 60);
      doc.roundedRect(64, statsY, 45, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(attendanceData.filter(a => a.status === 'Absent').length, 86.5, statsY + 17, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Absent', 86.5, statsY + 22, { align: 'center' });
      
      // Leave Days
      doc.setFillColor(52, 152, 219);
      doc.roundedRect(114, statsY, 45, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(attendanceData.filter(a => a.status === 'Leave').length, 136.5, statsY + 17, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Leave', 136.5, statsY + 22, { align: 'center' });
      
      // Total Hours
      doc.setFillColor(155, 89, 182);
      doc.roundedRect(164, statsY, 45, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const totalHours = attendanceData.reduce((sum, a) => sum + (a.totalHours || 0), 0);
      doc.text(totalHours.toFixed(0), 186.5, statsY + 17, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Total Hours', 186.5, statsY + 22, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Attendance Calendar View
      const calendarY = statsY + 35;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Attendance Calendar', 14, calendarY);
      
      // Create calendar grid
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = new Date(year, month - 1, 1).getDay();
      
      const cellSize = 8;
      const startX = 14;
      const startY = calendarY + 10;
      
      // Day headers
      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayHeaders.forEach((day, i) => {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(day, startX + (i * cellSize) + 3, startY - 2);
      });
      
      // Draw calendar grid
      let day = 1;
      for (let week = 0; week < 6; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          if (day > daysInMonth) break;
          
          if (week === 0 && dayOfWeek < firstDay) {
            continue;
          }
          
          const x = startX + (dayOfWeek * cellSize);
          const y = startY + (week * cellSize);
          
          // Check attendance for this day
          const currentDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const attendanceForDay = attendanceData.find(a => 
            a.date && a.date.startsWith(currentDate)
          );
          
          // Set color based on status
          if (attendanceForDay) {
            switch(attendanceForDay.status) {
              case 'Present':
                doc.setFillColor(46, 204, 113); // Green
                break;
              case 'Absent':
                doc.setFillColor(231, 76, 60); // Red
                break;
              case 'Leave':
                doc.setFillColor(52, 152, 219); // Blue
                break;
              case 'Late':
                doc.setFillColor(241, 196, 15); // Yellow
                break;
              case 'Govt Holiday':
                doc.setFillColor(155, 89, 182); // Purple
                break;
              default:
                doc.setFillColor(236, 240, 241); // Gray
            }
          } else {
            doc.setFillColor(236, 240, 241); // Gray for no data
          }
          
          doc.roundedRect(x, y, cellSize - 1, cellSize - 1, 1, 1, 'F');
          
          // Day number
          doc.setFontSize(6);
          doc.setTextColor(0, 0, 0);
          doc.text(day.toString(), x + 3, y + 5);
          
          day++;
        }
      }
      
      // Legend
      const legendY = startY + (6 * cellSize) + 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Legend:', 14, legendY);
      
      const legends = [
        { color: [46, 204, 113], text: 'Present' },
        { color: [231, 76, 60], text: 'Absent' },
        { color: [52, 152, 219], text: 'Leave' },
        { color: [241, 196, 15], text: 'Late' },
        { color: [155, 89, 182], text: 'Holiday' },
        { color: [236, 240, 241], text: 'No Data' }
      ];
      
      legends.forEach((legend, i) => {
        const x = 14 + (i * 30);
        const y = legendY + 8;
        
        doc.setFillColor(...legend.color);
        doc.rect(x, y, 6, 6, 'F');
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(legend.text, x + 8, y + 4);
      });
      
      // Detailed Attendance Table
      const tableY = legendY + 20;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Attendance Records', 14, tableY);
      
      const tableData = attendanceData.map(record => [
        record.date ? new Date(record.date).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short' 
        }) : '-',
        record.clockIn ? new Date(record.clockIn).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '-',
        record.clockOut ? new Date(record.clockOut).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '-',
        record.totalHours?.toFixed(2) || '-',
        record.status
      ]);
      
      autoTable(doc, {
        startY: tableY + 5,
        head: [['Date', 'In Time', 'Out Time', 'Hours', 'Status']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { 
          fillColor: [52, 73, 94], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 }
        }
      });
      
      // Footer
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Generated by A2IT HRMS', 105, finalY, { align: 'center' });
      doc.text(new Date().toLocaleString(), 105, finalY + 5, { align: 'center' });
      
      // Save PDF
      doc.save(`Monthly_Attendance_${userData?.employeeId || 'Employee'}_${month}_${year}.pdf`);
      
    } catch (error) {
      console.error("Monthly PDF generation error:", error);
      toast.error(`Monthly PDF generation failed: ${error.message}`);
    }
  },

  // Generate Payroll Attendance PDF
  generatePayrollAttendancePDF: async (payrollData, employeeData) => {
    try {
      const libraries = await PDFLibraries.load();
      if (!libraries) {
        toast.error("PDF library failed to load");
        return;
      }
      
      const { jsPDF, autoTable } = libraries;
      const doc = new jsPDF();
      
      // Header with company logo area
      doc.setFillColor(100, 65, 164);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYROLL ATTENDANCE', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('Attendance Based Salary Calculation', 105, 30, { align: 'center' });
      
      // Employee and Payroll Information
      doc.setTextColor(0, 0, 0);
      const infoY = 50;
      
      // Left Column - Employee Info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Information:', 14, infoY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const empInfo = [
        ['Name:', employeeData.name || 'N/A'],
        ['Employee ID:', employeeData.employeeId || 'N/A'],
        ['Department:', employeeData.department || 'N/A'],
        ['Designation:', employeeData.designation || 'N/A'],
        ['Monthly Salary:', formatCurrency(employeeData.monthlySalary || 0)],
        ['Daily Rate:', formatCurrency((employeeData.monthlySalary || 0) / 23)]
      ];
      
      autoTable(doc, {
        startY: infoY + 5,
        head: [],
        body: empInfo,
        theme: 'plain',
        styles: { fontSize: 9 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 60 }
        }
      });
      
      // Right Column - Payroll Info
      const payrollInfoY = infoY;
      doc.setFont('helvetica', 'bold');
      doc.text('Payroll Period:', 120, payrollInfoY);
      
      doc.setFont('helvetica', 'normal');
      
      const payrollInfo = [
        ['Period:', `${payrollData.periodStart ? new Date(payrollData.periodStart).toLocaleDateString() : 'N/A'} - ${payrollData.periodEnd ? new Date(payrollData.periodEnd).toLocaleDateString() : 'N/A'}`],
        ['Month:', payrollData.month ? monthNames[payrollData.month - 1] : 'N/A'],
        ['Year:', payrollData.year || 'N/A'],
        ['Working Days:', '23'],
        ['Present Days:', payrollData.attendance?.presentDays || 0],
        ['Attendance Rate:', (payrollData.attendance?.attendancePercentage || 0).toFixed(1) + '%']
      ];
      
      autoTable(doc, {
        startY: payrollInfoY + 5,
        head: [],
        body: payrollInfo,
        theme: 'plain',
        styles: { fontSize: 9 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 60 }
        },
        margin: { left: 120 }
      });
      
      // Salary Calculation Breakdown
      const calcY = Math.max(
        doc.lastAutoTable.finalY,
        doc.lastAutoTable.finalY
      ) + 10;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Salary Calculation Breakdown (23 Working Days)', 14, calcY);
      
      const salaryData = [
        ['Description', 'Calculation', 'Amount (BDT)'],
        ['Monthly Salary', 'Basic Salary', formatCurrency(employeeData.monthlySalary || 0)],
        ['Daily Rate', 'Monthly Salary ÷ 23', formatCurrency((employeeData.monthlySalary || 0) / 23)],
        ['Basic Pay', 'Daily Rate × Present Days', formatCurrency(payrollData.earnings?.basicPay || 0)],
        ['Overtime', 'Additional Hours', formatCurrency(payrollData.earnings?.overtime || 0)],
        ['Bonus', 'Performance Bonus', formatCurrency(payrollData.earnings?.bonus || 0)],
        ['Allowance', 'Other Allowances', formatCurrency(payrollData.earnings?.allowance || 0)],
        ['', '', ''],
        ['Late Deduction', `${payrollData.deductions?.lateDeduction / ((employeeData.monthlySalary || 0) / 23)} days × Daily Rate`, `-${formatCurrency(payrollData.deductions?.lateDeduction || 0)}`],
        ['Absent Deduction', `${payrollData.deductions?.absentDeduction / ((employeeData.monthlySalary || 0) / 23)} days × Daily Rate`, `-${formatCurrency(payrollData.deductions?.absentDeduction || 0)}`],
        ['Leave Deduction', `${payrollData.deductions?.leaveDeduction / ((employeeData.monthlySalary || 0) / 23)} days × Daily Rate`, `-${formatCurrency(payrollData.deductions?.leaveDeduction || 0)}`],
        ['', '', ''],
        ['Gross Earnings', 'Total Additions', formatCurrency(payrollData.summary?.grossEarnings || 0)],
        ['Total Deductions', 'Total Subtractions', `-${formatCurrency(payrollData.deductions?.total || 0)}`],
        ['NET PAYABLE', 'Gross - Deductions', formatCurrency(payrollData.summary?.netPayable || 0)]
      ];
      
      autoTable(doc, {
        startY: calcY + 5,
        head: [['Description', 'Calculation', 'Amount (BDT)']],
        body: salaryData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { 
          fillColor: [100, 65, 164], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 70 },
          2: { cellWidth: 40, halign: 'right' }
        },
        didDrawCell: function(data) {
          // Highlight Net Payable row
          if (data.row.index === salaryData.length - 1 && data.column.index === 0) {
            doc.setFillColor(100, 65, 164);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(data.cell.text, data.cell.x + 3, data.cell.y + 10);
          }
        }
      });
      
      // Net Payable in Words
      const wordsY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Net Payable in Words:', 14, wordsY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(convertToWords(payrollData.summary?.netPayable || 0), 14, wordsY + 5);
      
      // Attendance Details
      const attendanceY = wordsY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Attendance Details for Payroll Calculation:', 14, attendanceY);
      
      const attendanceDetails = [
        ['Total Working Days', '23'],
        ['Present Days', payrollData.attendance?.presentDays || 0],
        ['Absent Days', payrollData.attendance?.absentDays || 0],
        ['Late Days', payrollData.attendance?.lateDays || 0],
        ['Leave Days', payrollData.attendance?.leaves || 0],
        ['Late Policy', '3 late days = 1 day salary deduction'],
        ['Calculation Method', 'Monthly Salary ÷ 23 = Daily Rate']
      ];
      
      autoTable(doc, {
        startY: attendanceY + 5,
        head: [],
        body: attendanceDetails,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 100 }
        }
      });
      
      // Footer with authorization
      const footerY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('This payroll has been calculated based on 23 working days per month.', 105, footerY, { align: 'center' });
      doc.text('All deductions are calculated as: (Deduction Days) × Daily Rate', 105, footerY + 5, { align: 'center' });
      
      // Signature area
      const signatureY = footerY + 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('________________________', 40, signatureY);
      doc.text('HR Manager Signature', 40, signatureY + 5);
      
      doc.text('________________________', 140, signatureY);
      doc.text('Employee Signature', 140, signatureY + 5);
      
      // Final note
      doc.setFontSize(8);
      doc.text('Generated on: ' + new Date().toLocaleString(), 105, signatureY + 15, { align: 'center' });
      
      // Save PDF
      doc.save(`Payroll_${employeeData.employeeId}_${payrollData.periodStart ? new Date(payrollData.periodStart).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Payroll PDF generation error:", error);
      toast.error(`Payroll PDF generation failed: ${error.message}`);
    }
  }
};

export default function Page({ userId }) {
  // Time validation helper functions
  const validateTimeFormat = (time) => {
    if (!time) return true;
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const validateTimeOrder = (startTime, endTime) => {
    if (!startTime || !endTime) return true;
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    return end > start;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    return (end - start) / (1000 * 60 * 60); // hours
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) return `${minutes} min`;
    if (minutes === 0) return `${wholeHours} hr`;
    return `${wholeHours} hr ${minutes} min`;
  };

  // Holiday and weekend detection functions
  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  const isHolidayDate = (dateString) => {
    // This function should check if a date is a holiday
    // You can expand this with actual holiday data from your backend
    const holidays = [
      '2024-01-26', // Republic Day
      '2024-08-15', // Independence Day
      '2024-10-02', // Gandhi Jayanti
      // Add more holidays as needed
    ];
    return holidays.includes(dateString);
  };

  const getAutoStatus = (dateString) => {
    if (isHolidayDate(dateString)) {
      return 'Govt Holiday';
    }
    if (isWeekend(dateString)) {
      return 'Weekly Off';
    }
    return 'Present';
  };

  const checkIfWorkingDay = async (dateString = null) => {
    try {
      const dateToCheck = dateString || new Date().toISOString().split('T')[0];
      const token = getToken();
      
      if (!token) return true; // Default to allowing if no token
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-working-day?date=${dateToCheck}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.isWorkingDay !== false; // Return true if it's a working day
      }
      
      return !isWeekend(dateToCheck) && !isHolidayDate(dateToCheck);
    } catch (error) {
      console.error("Error checking working day:", error);
      return !isWeekend(dateString || new Date().toISOString().split('T')[0]);
    }
  };

  const router = useRouter();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [clockDetails, setClockDetails] = useState(() => {
    if (typeof window !== "undefined") {
      const storedDetails = localStorage.getItem("attendanceClockDetails");
      if (storedDetails) {
        try {
          return JSON.parse(storedDetails);
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  });
  
  const [showRecentDetails, setShowRecentDetails] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("attendanceShowDetails") === "true";
    }
    return false;
  });
  
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // New states for admin features
  const [showManualAttendanceModal, setShowManualAttendanceModal] = useState(false);
  const [showBulkAttendanceModal, setShowBulkAttendanceModal] = useState(false);
  const [showAdminActionsMenu, setShowAdminActionsMenu] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectorFor, setSelectorFor] = useState(null); // "manual" or "bulk"
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
  
  const [manualAttendanceData, setManualAttendanceData] = useState({
    employeeId: "",
    employeeName: "",
    date: new Date().toISOString().split('T')[0],
    clockIn: "09:00",
    clockOut: "18:00",
    status: "Present",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    remarks: "Created by admin",
    isHoliday: false,
    holidayType: null
  });
  
  const [bulkAttendanceData, setBulkAttendanceData] = useState({
    employeeId: "",
    employeeName: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    defaultShiftStart: "09:00",
    defaultShiftEnd: "18:00",
    holidays: [],
    leaveDates: [],
    workingDays: [],
    markAllAsPresent: false,
    skipWeekends: true
  });
  
  // Employee Filter State
  const [employeeFilter, setEmployeeFilter] = useState({
    employeeId: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    status: "all"
  });

  const [todayStatus, setTodayStatus] = useState(() => {
    if (typeof window !== "undefined") {
      const storedToday = localStorage.getItem("attendanceTodayStatus");
      const todayDate = new Date().toDateString();
      const storedDate = localStorage.getItem("attendanceDate");
      
      if (storedDate !== todayDate) {
        localStorage.setItem("attendanceDate", todayDate);
        localStorage.removeItem("attendanceTodayStatus");
        localStorage.removeItem("attendanceClockDetails");
        localStorage.removeItem("attendanceShowDetails");
        return {
          clockedIn: false,
          clockedOut: false,
          clockInTime: null,
          clockOutTime: null,
          status: "Not Clocked",
          date: todayDate
        };
      }
      
      if (storedToday) {
        try {
          return JSON.parse(storedToday);
        } catch (error) {
          return {
            clockedIn: false,
            clockedOut: false,
            clockInTime: null,
            clockOutTime: null,
            status: "Not Clocked",
            date: todayDate
          };
        }
      }
    }
    
    return {
      clockedIn: false,
      clockedOut: false,
      clockInTime: null,
      clockOutTime: null,
      status: "Not Clocked",
      date: new Date().toDateString()
    };
  });

  // ===================== LOCAL STORAGE EFFECTS =====================
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("attendanceTodayStatus", JSON.stringify(todayStatus));
      localStorage.setItem("attendanceDate", todayStatus.date);
    }
  }, [todayStatus]);

  useEffect(() => {
    if (typeof window !== "undefined" && clockDetails) {
      localStorage.setItem("attendanceClockDetails", JSON.stringify(clockDetails));
    }
  }, [clockDetails]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("attendanceShowDetails", showRecentDetails.toString());
    }
  }, [showRecentDetails]);

  // ===================== AUTO CLOCK-OUT =====================
  useEffect(() => {
    const checkAutoClockOut = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // Check if it's 6:10 PM (18:10)
      if (currentHours === 18 && currentMinutes === 10) {
        if (todayStatus.clockedIn && !todayStatus.clockedOut && userRole === "employee") {
          handleAutoClockOut();
        }
      }
    };
    
    const interval = setInterval(checkAutoClockOut, 60000);
    return () => clearInterval(interval);
  }, [todayStatus, userRole]);

  // ===================== CLICK OUTSIDE =====================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdminActionsMenu && !event.target.closest('.admin-actions-menu')) {
        setShowAdminActionsMenu(false);
      }
      if (showEmployeeSelector && !event.target.closest('.employee-selector')) {
        setShowEmployeeSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdminActionsMenu, showEmployeeSelector]);

  // ===================== HELPER FUNCTIONS =====================
  const getUserType = () => {
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("adminToken");
      const employeeToken = localStorage.getItem("employeeToken");
      
      if (adminToken) return "admin";
      if (employeeToken) return "employee";
    }
    return null;
  };

  const getToken = () => {
    const userType = getUserType();
    if (userType === "admin") return localStorage.getItem("adminToken");
    if (userType === "employee") return localStorage.getItem("employeeToken");
    return null;
  };

  // ===================== FETCH FUNCTIONS =====================
  const fetchUserProfile = async () => {
    try {
      const userType = getUserType();
      const token = getToken();
      
      if (!token) {
        router.push("/");
        return { role: "employee", isAdmin: false, userData: null };
      }

      const endpoint = userType === "admin" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/getAdminProfile`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/getProfile`;

      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        router.push("/");
        return { role: "employee", isAdmin: false, userData: null };
      }

      const data = await response.json();
      
      if (data.user || (data && (data.email || data._id))) {
        const userData = data.user || data;
        return { 
          role: userType, 
          isAdmin: userType === "admin", 
          userData 
        };
      } else {
        return { role: "employee", isAdmin: false, userData: null };
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { role: "employee", isAdmin: false, userData: null };
    }
  };

  // Fetch all employees (for admin)
  const fetchEmployees = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getAll-user`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      let employeesArray = [];
      
      // Handle different response structures
      if (Array.isArray(data)) {
        employeesArray = data;
      } else if (data && data.users && Array.isArray(data.users)) {
        employeesArray = data.users;
      } else if (data && data.data && Array.isArray(data.data)) {
        employeesArray = data.data;
      } else if (data && data.employees && Array.isArray(data.employees)) {
        employeesArray = data.employees;
      } else if (data && typeof data === 'object') {
        const keys = Object.keys(data);
        for (const key of keys) {
          if (Array.isArray(data[key])) {
            employeesArray = data[key];
            break;
          }
        }
      }
      
      const validEmployees = employeesArray
        .filter(emp => emp && typeof emp === 'object')
        .map(emp => ({
          _id: emp._id || emp.id || '',
          firstName: emp.firstName || emp.first_name || emp.name?.split(' ')[0] || '',
          lastName: emp.lastName || emp.last_name || emp.name?.split(' ').slice(1).join(' ') || '',
          email: emp.email || '',
          employeeId: emp.employeeId || emp.employee_id || emp._id?.slice(-6) || '',
          department: emp.department || emp.department_name || 'No Department',
          position: emp.position || emp.job_title || '',
          phone: emp.phone || emp.phone_number || '',
          status: emp.status || 'active'
        }))
        .filter(emp => emp._id && (emp.firstName || emp.lastName));

      setEmployees(validEmployees);
      
    } catch (error) {
      console.error("Fetch employees error:", error);
      setEmployees([]);
    }
  }, [isAdmin]);

  // Effect to fetch employees when admin logs in
  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      setEmployees([]);
    }
  }, [isAdmin, fetchEmployees]);

  const fetchTodayStatus = useCallback(async () => {
    try {
      const userType = getUserType();
      const token = getToken();
      
      if (!token || userType !== "employee") return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/today`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        const newStatus = {
          clockedIn: data.clockedIn || false,
          clockedOut: data.clockedOut || false,
          clockInTime: data.attendance?.clockIn || null,
          clockOutTime: data.attendance?.clockOut || null,
          status: data.attendance?.status || "Not Clocked",
          date: new Date().toDateString()
        };
        
        setTodayStatus(newStatus);
        
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
      } else if (response.status === 401) {
        localStorage.clear();
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch today's status:", error);
    }
  }, []);

  const fetchAttendanceRecords = useCallback(async (roleInfo) => {
    try {
      const token = getToken();
      
      if (!token) return;

      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: currentPage,
        limit: itemsPerPage
      });

      // Add employeeId for admin viewing specific employee
      if (roleInfo.isAdmin && userId) {
        queryParams.append('employeeId', userId);
      }

      let endpoint;
      if (roleInfo.isAdmin) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/all-records?${queryParams.toString()}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/records?${queryParams.toString()}`;
      }

      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.records || data || []);
      } else if (response.status === 401) {
        localStorage.clear();
        router.push("/");
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error("Fetch records error:", error);
      setAttendance([]);
    }
  }, [dateRange, userId, currentPage, itemsPerPage]);

  const fetchSummary = useCallback(async (roleInfo) => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        router.push("/");
        return;
      }

      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      // Add employeeId for admin viewing specific employee
      if (roleInfo.isAdmin && userId) {
        queryParams.append('employeeId', userId);
      }

      let endpoint;
      let headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      if (roleInfo.isAdmin) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/summary?${queryParams.toString()}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/summary?${queryParams.toString()}`;
      }

      const response = await fetch(endpoint, { headers });

      if (response.ok) {
        const data = await response.json();
        if (roleInfo.isAdmin) {
          setSummary(data.summary || data);
        } else {
          setSummary(data.summary || data);
        }
      } else if (response.status === 401) {
        localStorage.clear();
        router.push("/");
      } else {
        setSummary(null);
      }
      
      await fetchAttendanceRecords(roleInfo);
    } catch (err) {
      console.error("Fetch summary error:", err);
      setSummary(null);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, userId, fetchAttendanceRecords]);

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      const roleInfo = await fetchUserProfile();
      
      if (roleInfo) {
        setUserRole(roleInfo.role);
        setIsAdmin(roleInfo.isAdmin);
        setUserData(roleInfo.userData);
        
        if (roleInfo.role === "employee") {
          await fetchTodayStatus();
        }
        
        await fetchSummary(roleInfo);
      }
    } catch (error) {
      console.error("Initialize data error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetchTodayStatus, fetchSummary]);

  // ===================== EMPLOYEE FILTER FUNCTIONS =====================
  
  // Apply employee filter
  const applyEmployeeFilter = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      
      // For admin viewing specific employee
      if (isAdmin && employeeFilter.employeeId) {
        queryParams.append('employeeId', employeeFilter.employeeId);
      }
      
      // For employee viewing their own records
      if (!isAdmin && userData?._id) {
        queryParams.append('employeeId', userData._id);
      }
      
      if (employeeFilter.month && employeeFilter.month !== "") {
        const monthNum = parseInt(employeeFilter.month);
        if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
          queryParams.append('month', monthNum);
        }
      }
      
      if (employeeFilter.year && employeeFilter.year !== "") {
        const yearNum = parseInt(employeeFilter.year);
        if (!isNaN(yearNum) && yearNum >= 2000 && yearNum <= 2100) {
          queryParams.append('year', yearNum);
        }
      }
      
      if (employeeFilter.status !== 'all') {
        queryParams.append('status', employeeFilter.status);
      }

      if (employeeFilter.month && employeeFilter.year) {
        const monthNum = parseInt(employeeFilter.month);
        const yearNum = parseInt(employeeFilter.year);
        
        if (!isNaN(monthNum) && !isNaN(yearNum)) {
          const startDate = new Date(yearNum, monthNum - 1, 1);
          const endDate = new Date(yearNum, monthNum, 0);
          
          queryParams.append('startDate', startDate.toISOString().split('T')[0]);
          queryParams.append('endDate', endDate.toISOString().split('T')[0]);
        }
      }

      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/all-records?${queryParams.toString()}`
        : `${process.env.NEXT_PUBLIC_API_URL}/records?${queryParams.toString()}`;

      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.records || data || []);
        setCurrentPage(1);
        
        // Update summary for employee view
        if (!isAdmin) {
          const presentCount = (data.records || []).filter(a => a.status === 'Present').length;
          const totalCount = (data.records || []).length;
          const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
          
          setSummary(prev => ({
            ...prev,
            daysPresent: presentCount,
            daysAbsent: (data.records || []).filter(a => a.status === 'Absent').length,
            totalDays: totalCount,
            attendanceRate: attendanceRate
          }));
        }
        
        toast.success("Filter applied successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to apply filter");
      }
    } catch (error) {
      console.error("Filter error:", error);
      toast.error("Failed to apply filter");
    } finally {
      setLoading(false);
    }
  };

  // Reset employee filter
  const resetEmployeeFilter = () => {
    setEmployeeFilter({
      employeeId: "",
      month: String(new Date().getMonth() + 1),
      year: String(new Date().getFullYear()),
      status: "all"
    });
    
    setDateRange({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    
    setCurrentPage(1);
    handleRefresh();
  };

  // ===================== ATTENDANCE FUNCTIONS =====================
  const handleAutoClockOut = async () => {
    if (userRole !== "employee") return;
    
    try {
      const token = getToken();
      
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: "Office - Auto",
          device: navigator.userAgent,
          autoClockOut: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedOut: true,
          clockOutTime: data.attendance?.clockOut || new Date().toISOString(),
          status: "Present (Auto)"
        };
        setTodayStatus(newStatus);
        
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
        
        toast.success(`✓ Auto Clock Out at 6:10 PM successful`);
        
        await fetchTodayStatus();
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      }
    } catch (err) {
      console.error("Auto clock out error:", err);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const roleInfo = { role: userRole, isAdmin, userData };
      
      if (userRole === "employee") {
        await fetchTodayStatus();
      }
      
      await fetchSummary(roleInfo);
      toast.success("Data refreshed");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (attendanceId) => {
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/${attendanceId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClockDetails(data.attendance);
        setShowRecentDetails(true);
        toast.success("Attendance details loaded");
      } else {
        toast.error("Failed to load attendance details");
      }
    } catch (err) {
      console.error("View details error:", err);
      toast.error("Error loading attendance details");
    }
  };

  const toggleDetailsVisibility = () => {
    setShowRecentDetails(!showRecentDetails);
  };

  const handleClockIn = async () => {
    if (userRole !== "employee") {
      toast.error("Only employees can clock in/out");
      return;
    }
    
    // Check if it's a working day
    const isWorkingDay = await checkIfWorkingDay();
    if (!isWorkingDay) {
      toast.error("Cannot clock in on a holiday or off day");
      return;
    }
    
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: "Office",
          device: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedIn: true,
          clockInTime: data.attendance?.clockIn || new Date().toISOString(),
          status: "Clocked In"
        };
        setTodayStatus(newStatus);
        
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
        setShowRecentDetails(true);
        
        toast.success(`✓ ${data.message || "Clock In successful"}`);
        
        await fetchTodayStatus();
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to clock in");
      }
    } catch (err) {
      console.error("Clock in error:", err);
      toast.error("Clock In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (userRole !== "employee") {
      toast.error("Only employees can clock in/out");
      return;
    }
    
    // Check if it's a working day
    const isWorkingDay = await checkIfWorkingDay();
    if (!isWorkingDay) {
      toast.error("Cannot clock out on a holiday or off day");
      return;
    }
    
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: "Office",
          device: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = {
          ...todayStatus,
          clockedOut: true,
          clockOutTime: data.attendance?.clockOut || new Date().toISOString(),
          status: "Present"
        };
        setTodayStatus(newStatus);
        
        if (data.attendance) {
          setClockDetails(data.attendance);
        }
        setShowRecentDetails(true);
        
        toast.success(`✓ ${data.message || "Clock Out successful"}`);
        
        await fetchTodayStatus();
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to clock out");
      }
    } catch (err) {
      console.error("Clock out error:", err);
      toast.error("Clock Out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== ADMIN FUNCTIONS =====================

  // Manual Trigger Auto Clock Out (Admin Only)
  const handleTriggerAutoClockOut = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/trigger-auto-clockout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✓ Auto clock out triggered: ${data.results?.success || 0} successful`);
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to trigger auto clock out");
      }
    } catch (err) {
      console.error("Trigger auto clock out error:", err);
      toast.error("Failed to trigger auto clock out");
    } finally {
      setLoading(false);
    }
  };

  // Generate bulk attendance data
  const generateBulkAttendanceData = () => {
    const month = parseInt(bulkAttendanceData.month);
    const year = parseInt(bulkAttendanceData.year);
    
    if (isNaN(month) || isNaN(year)) return [];
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceRecords = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Skip weekends if option is enabled
      if (bulkAttendanceData.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }
      
      // Check if it's a holiday
      const isHoliday = bulkAttendanceData.holidays.some(h => h.date === dateString);
      const isLeave = bulkAttendanceData.leaveDates.includes(dateString);
      const isWorkingDay = bulkAttendanceData.workingDays.includes(dateString);
      
      let status = 'Present';
      let remarks = 'Bulk created by admin';
      
      if (isHoliday) {
        status = 'Govt Holiday';
        remarks = 'Holiday - Bulk created';
      } else if (isLeave) {
        status = 'Leave';
        remarks = 'Leave - Bulk created';
      } else if (isWorkingDay) {
        status = 'Present';
        remarks = 'Working Day - Bulk created';
      } else if (bulkAttendanceData.markAllAsPresent) {
        status = 'Present';
        remarks = 'Marked present - Bulk created';
      }
      
      // Auto-clear clock in/out for non-working days
      const clockIn = (status === 'Present') ? bulkAttendanceData.defaultShiftStart : null;
      const clockOut = (status === 'Present') ? bulkAttendanceData.defaultShiftEnd : null;
      
      attendanceRecords.push({
        date: dateString,
        clockIn,
        clockOut,
        status,
        shiftStart: bulkAttendanceData.defaultShiftStart,
        shiftEnd: bulkAttendanceData.defaultShiftEnd,
        remarks,
        isHoliday: status === 'Govt Holiday',
        holidayType: status === 'Govt Holiday' ? 'Bulk Holiday' : null,
        autoGenerated: status !== 'Present'
      });
    }
    
    return attendanceRecords;
  };

  // Create Manual Attendance (Admin Only)
  const handleCreateManualAttendance = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      if (!selectedEmployee?._id) {
        toast.error("Please select an employee");
        setLoading(false);
        return;
      }

      if (!manualAttendanceData.date) {
        toast.error("Date is required");
        setLoading(false);
        return;
      }

      // Check if it's a holiday or weekend
      const isHoliday = manualAttendanceData.status === 'Govt Holiday';
      const isWeekendOff = manualAttendanceData.status === 'Weekly Off';
      const isOffDay = manualAttendanceData.status === 'Off Day';

      // Auto-clear clock in/out for holidays and weekends
      const clockIn = (isHoliday || isWeekendOff || isOffDay) 
        ? null 
        : manualAttendanceData.clockIn;
      
      const clockOut = (isHoliday || isWeekendOff || isOffDay) 
        ? null 
        : manualAttendanceData.clockOut;

      const formatDateTime = (date, time) => {
        if (!time) return null;
        const dateTimeString = `${date}T${time}:00`;
        return new Date(dateTimeString).toISOString();
      };

      const attendanceData = {
        employeeId: selectedEmployee._id,
        date: new Date(manualAttendanceData.date).toISOString().split('T')[0],
        clockIn: clockIn ? formatDateTime(manualAttendanceData.date, clockIn) : null,
        clockOut: clockOut ? formatDateTime(manualAttendanceData.date, clockOut) : null,
        status: manualAttendanceData.status,
        shiftStart: manualAttendanceData.shiftStart,
        shiftEnd: manualAttendanceData.shiftEnd,
        remarks: manualAttendanceData.remarks || 
                 (isHoliday ? 'Government Holiday' : 
                  isWeekendOff ? 'Weekly Off' : 
                  isOffDay ? 'Off Day' : 'Created by admin'),
        isHoliday: isHoliday,
        holidayType: manualAttendanceData.holidayType,
        autoGenerated: (isHoliday || isWeekendOff || isOffDay)
      };

      console.log("Sending manual attendance data:", attendanceData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/create-attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(attendanceData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✓ Attendance created successfully! ${isHoliday ? '(Holiday)' : isWeekendOff ? '(Weekly Off)' : isOffDay ? '(Off Day)' : ''}`);
        setShowManualAttendanceModal(false);
        
        // Reset form
        setManualAttendanceData({
          employeeId: "",
          employeeName: "",
          date: new Date().toISOString().split('T')[0],
          clockIn: "09:00",
          clockOut: "18:00",
          status: "Present",
          shiftStart: "09:00",
          shiftEnd: "18:00",
          remarks: "Created by admin",
          isHoliday: false,
          holidayType: null
        });
        
        setSelectedEmployee(null);
        setEmployeeSearch("");
        
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
        await applyEmployeeFilter();
      } else {
        toast.error(data.message || data.error || "Failed to create manual attendance");
      }
    } catch (err) {
      console.error("Create manual attendance error:", err);
      toast.error(`Failed to create manual attendance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create Bulk Attendance (Admin Only)
  const handleCreateBulkAttendance = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      if (!selectedEmployee?._id) {
        toast.error("Employee is required");
        setLoading(false);
        return;
      }

      if (!bulkAttendanceData.month || !bulkAttendanceData.year) {
        toast.error("Month and Year are required");
        setLoading(false);
        return;
      }

      const month = parseInt(bulkAttendanceData.month);
      const year = parseInt(bulkAttendanceData.year);
      
      if (isNaN(month) || month < 1 || month > 12) {
        toast.error("Invalid month");
        setLoading(false);
        return;
      }
      
      if (isNaN(year) || year < 2000 || year > 2100) {
        toast.error("Invalid year");
        setLoading(false);
        return;
      }

      // Generate bulk data
      const bulkRecords = generateBulkAttendanceData();
      
      if (bulkRecords.length === 0) {
        toast.error("No records to create");
        setLoading(false);
        return;
      }

      const bulkData = {
        employeeId: selectedEmployee._id,
        month: month,
        year: year,
        records: bulkRecords,
        defaultShiftStart: bulkAttendanceData.defaultShiftStart,
        defaultShiftEnd: bulkAttendanceData.defaultShiftEnd,
        skipWeekends: bulkAttendanceData.skipWeekends,
        markAllAsPresent: bulkAttendanceData.markAllAsPresent
      };

      console.log("Sending bulk attendance data:", bulkData);

      const confirmCreate = window.confirm(
        `Create ${bulkRecords.length} attendance records for ${new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} ${year}?\n\nEmployee: ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}\nPresent Days: ${bulkRecords.filter(r => r.status === 'Present').length}\nHolidays: ${bulkRecords.filter(r => r.status === 'Govt Holiday').length}\nLeaves: ${bulkRecords.filter(r => r.status === 'Leave').length}\n\nAre you sure?`
      );

      if (!confirmCreate) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attendance/bulk-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bulkData)
      });

      const data = await response.json();

      if (response.ok) {
        const results = data.results || data;
        let message = `✓ Bulk attendance created for ${new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} ${year}:\n`;
        
        if (results.created) message += `Created: ${results.created}\n`;
        if (results.updated) message += `Updated: ${results.updated}\n`;
        if (results.skipped) message += `Skipped (holidays/off): ${results.skipped}\n`;
        if (results.failed) message += `Failed: ${results.failed}`;
        
        toast.success(message, { duration: 6000 });
        
        setShowBulkAttendanceModal(false);
        setSelectedEmployee(null);
        setEmployeeSearch("");
        
        // Reset form
        setBulkAttendanceData({
          employeeId: "",
          employeeName: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          defaultShiftStart: "09:00",
          defaultShiftEnd: "18:00",
          holidays: [],
          leaveDates: [],
          workingDays: [],
          markAllAsPresent: false,
          skipWeekends: true
        });
        
        // Refresh data
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
        await applyEmployeeFilter();
      } else {
        toast.error(data.message || data.error || "Failed to create bulk attendance");
      }
    } catch (err) {
      console.error("Create bulk attendance error:", err);
      toast.error("Failed to create bulk attendance");
    } finally {
      setLoading(false);
    }
  };

  // Handle employee selection
  const handleSelectEmployee = (employee) => {
    if (!employee || !employee._id) {
      toast.error("Invalid employee selected");
      return;
    }
    
    setSelectedEmployee(employee);
    setEmployeeSearch(""); // Clear search input
    
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    
    // Set data based on which modal is open
    if (showManualAttendanceModal) {
      setManualAttendanceData(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: fullName
      }));
    } else if (showBulkAttendanceModal) {
      setBulkAttendanceData(prev => ({
        ...prev,
        employeeId: employee._id,
        employeeName: fullName
      }));
    }
    
    toast.success(`Selected: ${fullName}`);
  };

  // Open Manual Attendance Modal
  const openManualAttendanceModal = () => {
    if (!isAdmin) return;
    
    setSelectorFor("manual");
    setShowEmployeeSelector(false);
    fetchEmployees();
    
    // Reset if no employee selected
    if (!selectedEmployee) {
      setManualAttendanceData({
        employeeId: "",
        employeeName: "",
        date: new Date().toISOString().split('T')[0],
        clockIn: "09:00",
        clockOut: "18:00",
        status: "Present",
        shiftStart: "09:00",
        shiftEnd: "18:00",
        remarks: "Created by admin",
        isHoliday: false,
        holidayType: null
      });
    }
    
    setShowManualAttendanceModal(true);
  };

  // Open Bulk Attendance Modal
  const openBulkAttendanceModal = () => {
    if (!isAdmin) return;
    
    setSelectorFor("bulk");
    setShowEmployeeSelector(false);
    fetchEmployees();
    
    // Reset if no employee selected
    if (!selectedEmployee) {
      setBulkAttendanceData({
        employeeId: "",
        employeeName: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        defaultShiftStart: "09:00",
        defaultShiftEnd: "18:00",
        holidays: [],
        leaveDates: [],
        workingDays: [],
        markAllAsPresent: false,
        skipWeekends: true
      });
    }
    
    setShowBulkAttendanceModal(true);
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => {
    if (!employee || typeof employee !== 'object') return false;
    
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const employeeId = (employee.employeeId || '').toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const department = (employee.department || '').toLowerCase();
    const searchTerm = employeeSearch.toLowerCase();
    
    return fullName.includes(searchTerm) || 
           employeeId.includes(searchTerm) ||
           email.includes(searchTerm) ||
           department.includes(searchTerm);
  });

  // Add holiday/leave date management functions
  const addHoliday = () => {
    const date = prompt("Enter holiday date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    const type = prompt("Enter holiday type (Govt Holiday/Weekly Off/Other):", "Govt Holiday");
    
    if (date && type) {
      setBulkAttendanceData(prev => ({
        ...prev,
        holidays: [...prev.holidays, { date, type }]
      }));
      toast.success(`Added holiday: ${date} - ${type}`);
    }
  };

  const addLeaveDate = () => {
    const date = prompt("Enter leave date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    
    if (date) {
      setBulkAttendanceData(prev => ({
        ...prev,
        leaveDates: [...prev.leaveDates, date]
      }));
      toast.success(`Added leave date: ${date}`);
    }
  };

  const addWorkingDay = () => {
    const date = prompt("Enter working date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    
    if (date) {
      setBulkAttendanceData(prev => ({
        ...prev,
        workingDays: [...prev.workingDays, date]
      }));
      toast.success(`Added working day: ${date}`);
    }
  };

  // Get Late Statistics
  const handleViewLateStatistics = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/late-statistics`
        : `${process.env.NEXT_PUBLIC_API_URL}/late-statistics`;

      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(isAdmin && userId && { employeeId: userId })
      }).toString();

      const response = await fetch(`${endpoint}?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const stats = data.statistics;
        
        toast.success(
          <div>
            <p className="font-bold">Late Statistics</p>
            <p>Total Late: {stats.totalLate}</p>
            <p>Average: {stats.averageLateMinutes} minutes</p>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error("Get late statistics error:", err);
    }
  };

  // Get Employee Shift Timing
  const handleViewShiftTiming = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/employee-shift-timing`
        : `${process.env.NEXT_PUBLIC_API_URL}/shift-timing`;

      const query = new URLSearchParams({
        employeeId: userId || userData?._id,
        date: new Date().toISOString().split('T')[0]
      }).toString();

      const response = await fetch(`${endpoint}?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        toast.success(
          <div>
            <p className="font-bold">Shift Timing</p>
            <p>Start: {data.data.shiftTiming.start}</p>
            <p>End: {data.data.shiftTiming.end}</p>
            {data.data.shiftTiming.isAdminAdjusted && <p className="text-yellow-600">✓ Admin Adjusted</p>}
          </div>,
          { duration: 4000 }
        );
      }
    } catch (err) {
      console.error("Get shift timing error:", err);
    }
  };

  // Admin Correct Attendance
  const handleCorrectAttendance = async (attendanceId, currentData = {}) => {
    if (!isAdmin) {
      toast.error("Only admin can correct attendance");
      return;
    }
    
    setLoading(true);
    try {
      setSelectedAttendanceRecord({
        _id: attendanceId,
        ...currentData,
        isEditing: true
      });
      
      toast.success("Edit mode activated. Please update the attendance record.");
    } catch (err) {
      console.error("Correction error:", err);
      toast.error("Correction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save corrected attendance
  const handleSaveCorrectedAttendance = async () => {
    if (!isAdmin || !selectedAttendanceRecord) return;
    
    setLoading(true);
    try {
      const token = getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/correct/${selectedAttendanceRecord._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          clockIn: selectedAttendanceRecord.clockIn ? `${selectedAttendanceRecord.date}T${selectedAttendanceRecord.clockIn}:00` : null,
          clockOut: selectedAttendanceRecord.clockOut ? `${selectedAttendanceRecord.date}T${selectedAttendanceRecord.clockOut}:00` : null,
          status: selectedAttendanceRecord.status,
          shiftStart: selectedAttendanceRecord.shiftStart,
          shiftEnd: selectedAttendanceRecord.shiftEnd
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✓ Attendance corrected successfully!");
        setSelectedAttendanceRecord(null);
        
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
        await applyEmployeeFilter();
      } else {
        toast.error(data.message || "Failed to correct attendance");
      }
    } catch (err) {
      console.error("Save correction error:", err);
      toast.error("Save failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update Employee Shift Timing
  const handleUpdateShiftTiming = async (employeeId) => {
    if (!isAdmin) return;
    
    const startTime = prompt("Enter new shift start time (HH:mm)", "09:00");
    const endTime = prompt("Enter new shift end time (HH:mm)", "18:00");
    const reason = prompt("Enter reason for adjustment (optional)", "Shift timing adjustment");
    
    if (!startTime || !endTime) return;

    setLoading(true);
    try {
      const token = getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-shift`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          startTime,
          endTime,
          reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✓ Shift timing updated successfully!");
        const roleInfo = { role: userRole, isAdmin, userData };
        await fetchSummary(roleInfo);
      } else {
        toast.error(data.message || "Failed to update shift timing");
      }
    } catch (err) {
      console.error("Update shift timing error:", err);
      toast.error("Failed to update shift timing");
    } finally {
      setLoading(false);
    }
  };

  // Export Attendance Data
  const handleExportData = async (format = 'json') => {
    try {
      const token = getToken();
      
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const query = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
        // Add employee filter if employee is viewing their own records
        ...(!isAdmin && userData?._id && { employeeId: userData._id })
      }).toString();

      const endpoint = isAdmin 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/export?${query}`
        : `${process.env.NEXT_PUBLIC_API_URL}/export?${query}`;

      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = isAdmin 
            ? `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`
            : `my_attendance_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("CSV exported successfully!");
        } else {
          const data = await response.json();
          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = isAdmin 
            ? `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.json`
            : `my_attendance_${dateRange.startDate}_to_${dateRange.endDate}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("JSON exported successfully!");
        }
      } else {
        toast.error("Failed to export data");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed");
    }
  };

  // ===================== INITIALIZE DATA =====================
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ===================== PAGINATION =====================
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPages = Math.ceil(attendance.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = attendance.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // ===================== FORMATTING FUNCTIONS =====================
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeFromISO = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatDateDisplay = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'govt holiday': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'weekly off': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'off day': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'clocked in': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTodayStatusText = () => {
    if (todayStatus.clockedOut) return "Clocked Out";
    if (todayStatus.clockedIn) return "Clocked In";
    return "Not Clocked In";
  };

  const getTodayStatusColor = () => {
    if (todayStatus.clockedOut) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (todayStatus.clockedIn) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // ===================== LOADING STATE =====================
  if (loading && !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading attendance...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // ===================== RENDER =====================
  return (
    <>
      <Toaster position="top-right" />
      
      {/* Employee Selector Modal */}
      {showEmployeeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 employee-selector">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Employee</h2>
                  <p className="text-gray-500 mt-1">
                    Search and select employee for {selectorFor === "manual" ? "manual" : "bulk"} attendance
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowEmployeeSelector(false);
                    setEmployeeSearch("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm"
                  placeholder="Search employees by name, ID, email or department..."
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-gray-500">
                  {filteredEmployees.length} of {employees.length} employees
                </div>
                <button
                  onClick={() => fetchEmployees()}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Refresh List
                </button>
              </div>
            </div>
            
            {/* Employee List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No employees found</h3>
                  <p className="text-gray-500 mt-2">
                    {employeeSearch ? "Try a different search term" : "No employees available in the system"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                  {filteredEmployees.map((employee) => (
                    <button
                      key={employee._id}
                      onClick={() => handleSelectEmployee(employee)}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                        selectedEmployee?._id === employee._id
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300'
                          : 'bg-white border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                          selectedEmployee?._id === employee._id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                            : 'bg-gradient-to-r from-gray-600 to-gray-800'
                        }`}>
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 truncate">
                                {employee.firstName} {employee.lastName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                  ID: {employee.employeeId}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  employee.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {employee.status}
                                </span>
                              </div>
                            </div>
                            {selectedEmployee?._id === employee._id && (
                              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                            )}
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <BriefcaseIcon size={14} />
                              <span className="truncate">{employee.position || 'No Position'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin size={14} />
                              <span className="truncate">{employee.department || 'No Department'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              <span className="truncate">{employee.email}</span>
                            </div>
                            {employee.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={14} />
                                <span>{employee.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectorFor === "manual" ? "Manual Attendance" : "Bulk Attendance"}
                </div>
                <button
                  onClick={() => setShowEmployeeSelector(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Attendance Modal */}
      {showManualAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Manual Attendance</h2>
              <button 
                onClick={() => {
                  setShowManualAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                  setManualAttendanceData({
                    employeeId: "",
                    employeeName: "",
                    date: new Date().toISOString().split('T')[0],
                    clockIn: "09:00",
                    clockOut: "18:00",
                    status: "Present",
                    shiftStart: "09:00",
                    shiftEnd: "18:00",
                    remarks: "Created by admin",
                    isHoliday: false,
                    holidayType: null
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Employee Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee *
                {selectedEmployee && (
                  <span className="ml-2 text-green-600 text-sm font-normal">
                    ✓ Selected
                  </span>
                )}
              </label>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                  }}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="Search employee by name or ID..."
                  autoFocus
                />
                {employeeSearch && (
                  <button
                    onClick={() => setEmployeeSearch("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {employeeSearch && !selectedEmployee && (
                <div className="relative z-10">
                  <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No employees found for "{employeeSearch}"
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <button
                          key={employee._id}
                          onClick={() => handleSelectEmployee(employee)}
                          className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {employee.employeeId} • {employee.department || 'No Department'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Selected Employee Display */}
              {selectedEmployee && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {selectedEmployee.employeeId} • {selectedEmployee.department || 'No Department'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setEmployeeSearch("");
                        setManualAttendanceData(prev => ({
                          ...prev,
                          employeeId: "",
                          employeeName: ""
                        }));
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
              
              {!selectedEmployee && (
                <p className="text-red-500 text-sm mt-2">
                  ⚠️ Please search and select an employee
                </p>
              )}
            </div>
            
            {/* Auto-detect status based on date */}
            <div className="mb-4">
              {manualAttendanceData.date && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-blue-800">Date Analysis:</span>
                    <span className="text-sm font-bold text-blue-700 ml-1">
                      {getAutoStatus(manualAttendanceData.date)}
                    </span>
                  </div>
                  {isWeekend(manualAttendanceData.date) && (
                    <div className="text-xs text-purple-600 mt-1">
                      ⓘ This is a weekend (no clock in/out required)
                    </div>
                  )}
                  {isHolidayDate(manualAttendanceData.date) && (
                    <div className="text-xs text-purple-600 mt-1">
                      ⓘ This is a holiday (no clock in/out required)
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Attendance Form Fields */}
            {selectedEmployee && (
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={manualAttendanceData.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const autoStatus = getAutoStatus(newDate);
                        setManualAttendanceData({
                          ...manualAttendanceData, 
                          date: newDate,
                          status: autoStatus
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={manualAttendanceData.status}
                      onChange={(e) => setManualAttendanceData({...manualAttendanceData, status: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                      <option value="Late">Late</option>
                      <option value="Govt Holiday">Govt Holiday</option>
                      <option value="Weekly Off">Weekly Off</option>
                      <option value="Off Day">Off Day</option>
                      <option value="Half Day">Half Day</option>
                    </select>
                  </div>
                </div>
                
                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clock In Time 
                      {manualAttendanceData.status === 'Present' && '*'}
                      {(manualAttendanceData.status === 'Govt Holiday' || 
                        manualAttendanceData.status === 'Weekly Off' || 
                        manualAttendanceData.status === 'Off Day') && (
                        <span className="text-xs text-gray-500 ml-2">(Auto: No clock required)</span>
                      )}
                    </label>
                    <input
                      type="time"
                      value={manualAttendanceData.clockIn}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.clockOut && time) {
                          const clockIn = new Date(`2000-01-01T${time}:00`);
                          const clockOut = new Date(`2000-01-01T${manualAttendanceData.clockOut}:00`);
                          if (clockIn >= clockOut) {
                            toast.error("Clock in time must be before clock out time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, clockIn: time});
                      }}
                      className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 ${
                        (manualAttendanceData.status === 'Govt Holiday' || 
                         manualAttendanceData.status === 'Weekly Off' || 
                         manualAttendanceData.status === 'Off Day') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={manualAttendanceData.status === 'Govt Holiday' || 
                                manualAttendanceData.status === 'Weekly Off' || 
                                manualAttendanceData.status === 'Off Day' || 
                                manualAttendanceData.status === 'Absent' || 
                                manualAttendanceData.status === 'Leave'}
                    />
                    {manualAttendanceData.clockIn && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.clockIn}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clock Out Time 
                      {manualAttendanceData.status === 'Present' && '*'}
                      {(manualAttendanceData.status === 'Govt Holiday' || 
                        manualAttendanceData.status === 'Weekly Off' || 
                        manualAttendanceData.status === 'Off Day') && (
                        <span className="text-xs text-gray-500 ml-2">(Auto: No clock required)</span>
                      )}
                    </label>
                    <input
                      type="time"
                      value={manualAttendanceData.clockOut}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.clockIn && time) {
                          const clockIn = new Date(`2000-01-01T${manualAttendanceData.clockIn}:00`);
                          const clockOut = new Date(`2000-01-01T${time}:00`);
                          if (clockOut <= clockIn) {
                            toast.error("Clock out time must be after clock in time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, clockOut: time});
                      }}
                      className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 ${
                        (manualAttendanceData.status === 'Govt Holiday' || 
                         manualAttendanceData.status === 'Weekly Off' || 
                         manualAttendanceData.status === 'Off Day') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={manualAttendanceData.status === 'Govt Holiday' || 
                                manualAttendanceData.status === 'Weekly Off' || 
                                manualAttendanceData.status === 'Off Day' || 
                                manualAttendanceData.status === 'Absent' || 
                                manualAttendanceData.status === 'Leave'}
                    />
                    {manualAttendanceData.clockOut && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.clockOut}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shift Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start Time *</label>
                    <input
                      type="time"
                      value={manualAttendanceData.shiftStart}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.shiftEnd && time) {
                          const shiftStart = new Date(`2000-01-01T${time}:00`);
                          const shiftEnd = new Date(`2000-01-01T${manualAttendanceData.shiftEnd}:00`);
                          if (shiftStart >= shiftEnd) {
                            toast.error("Shift start time must be before shift end time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, shiftStart: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {manualAttendanceData.shiftStart && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.shiftStart}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift End Time *</label>
                    <input
                      type="time"
                      value={manualAttendanceData.shiftEnd}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (manualAttendanceData.shiftStart && time) {
                          const shiftStart = new Date(`2000-01-01T${manualAttendanceData.shiftStart}:00`);
                          const shiftEnd = new Date(`2000-01-01T${time}:00`);
                          if (shiftEnd <= shiftStart) {
                            toast.error("Shift end time must be after shift start time");
                            return;
                          }
                        }
                        
                        setManualAttendanceData({...manualAttendanceData, shiftEnd: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {manualAttendanceData.shiftEnd && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {manualAttendanceData.shiftEnd}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Time Validation Summary */}
                {(manualAttendanceData.clockIn || manualAttendanceData.clockOut || manualAttendanceData.shiftStart || manualAttendanceData.shiftEnd) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Time Validation Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {manualAttendanceData.clockIn && manualAttendanceData.clockOut && (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            (() => {
                              const clockIn = new Date(`2000-01-01T${manualAttendanceData.clockIn}:00`);
                              const clockOut = new Date(`2000-01-01T${manualAttendanceData.clockOut}:00`);
                              return clockOut > clockIn ? 'bg-green-500' : 'bg-red-500';
                            })()
                          }`}></div>
                          <span className="text-gray-600">Clock In/Out:</span>
                          <span className="font-medium">
                            {manualAttendanceData.clockIn} - {manualAttendanceData.clockOut}
                          </span>
                        </div>
                      )}
                      
                      {manualAttendanceData.shiftStart && manualAttendanceData.shiftEnd && (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            (() => {
                              const shiftStart = new Date(`2000-01-01T${manualAttendanceData.shiftStart}:00`);
                              const shiftEnd = new Date(`2000-01-01T${manualAttendanceData.shiftEnd}:00`);
                              return shiftEnd > shiftStart ? 'bg-green-500' : 'bg-red-500';
                            })()
                          }`}></div>
                          <span className="text-gray-600">Shift:</span>
                          <span className="font-medium">
                            {manualAttendanceData.shiftStart} - {manualAttendanceData.shiftEnd}
                          </span>
                        </div>
                      )}
                      
                      {manualAttendanceData.clockIn && manualAttendanceData.shiftStart && (
                        <div className="text-xs text-gray-500">
                          Clock In vs Shift Start: {
                            (() => {
                              const clockIn = new Date(`2000-01-01T${manualAttendanceData.clockIn}:00`);
                              const shiftStart = new Date(`2000-01-01T${manualAttendanceData.shiftStart}:00`);
                              const diffMinutes = (clockIn - shiftStart) / (1000 * 60);
                              
                              if (diffMinutes === 0) return "✅ On time";
                              if (diffMinutes > 0) return `⚠️ Late by ${diffMinutes} minutes`;
                              return `✅ Early by ${Math.abs(diffMinutes)} minutes`;
                            })()
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Holiday Information */}
                {manualAttendanceData.status === 'Govt Holiday' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Type</label>
                      <select
                        value={manualAttendanceData.holidayType || ''}
                        onChange={(e) => setManualAttendanceData({...manualAttendanceData, holidayType: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      >
                        <option value="">Select Holiday Type</option>
                        <option value="National">National Holiday</option>
                        <option value="Regional">Regional Holiday</option>
                        <option value="Religious">Religious Holiday</option>
                        <option value="Company">Company Holiday</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        id="isHoliday"
                        checked={manualAttendanceData.isHoliday}
                        onChange={(e) => setManualAttendanceData({...manualAttendanceData, isHoliday: e.target.checked})}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="isHoliday" className="ml-2 text-sm text-gray-700">
                        Mark as Paid Holiday
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={manualAttendanceData.remarks}
                    onChange={(e) => setManualAttendanceData({...manualAttendanceData, remarks: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    rows="3"
                    placeholder="Enter remarks or reason for manual entry..."
                  />
                </div>
                
                {/* Preview Card */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-sm font-medium text-green-800">Preview</p>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      <span className="font-medium">Employee:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {new Date(manualAttendanceData.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {manualAttendanceData.status}
                      {(manualAttendanceData.status === 'Govt Holiday' || manualAttendanceData.status === 'Weekly Off') && (
                        <span className="text-xs text-purple-600 ml-2">(Auto-detected)</span>
                      )}
                    </p>
                    {manualAttendanceData.clockIn && (
                      <p>
                        <span className="font-medium">Clock In:</span> {manualAttendanceData.clockIn}
                      </p>
                    )}
                    {manualAttendanceData.clockOut && (
                      <p>
                        <span className="font-medium">Clock Out:</span> {manualAttendanceData.clockOut}
                      </p>
                    )}
                    {(manualAttendanceData.status === 'Govt Holiday' || manualAttendanceData.status === 'Weekly Off') && (
                      <p className="text-xs text-green-600">
                        ✓ No clock in/out required for this status
                      </p>
                    )}
                    {manualAttendanceData.remarks && (
                      <p>
                        <span className="font-medium">Remarks:</span> {manualAttendanceData.remarks}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowManualAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateManualAttendance}
                disabled={
                  loading || 
                  !selectedEmployee || 
                  !manualAttendanceData.date || 
                  !manualAttendanceData.status ||
                  !manualAttendanceData.shiftStart ||
                  !manualAttendanceData.shiftEnd ||
                  !validateTimeOrder(manualAttendanceData.shiftStart, manualAttendanceData.shiftEnd) ||
                  (manualAttendanceData.clockIn && manualAttendanceData.clockOut && 
                   !validateTimeOrder(manualAttendanceData.clockIn, manualAttendanceData.clockOut))
                }
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Attendance"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Attendance Modal */}
      {showBulkAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Bulk Attendance</h2>
              <button 
                onClick={() => {
                  setShowBulkAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                  setBulkAttendanceData({
                    employeeId: "",
                    employeeName: "",
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    defaultShiftStart: "09:00",
                    defaultShiftEnd: "18:00",
                    holidays: [],
                    leaveDates: [],
                    workingDays: [],
                    markAllAsPresent: false,
                    skipWeekends: true
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Employee Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee *
                {selectedEmployee && (
                  <span className="ml-2 text-green-600 text-sm font-normal">
                    ✓ Selected
                  </span>
                )}
              </label>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                  }}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="Search employee by name or ID..."
                  autoFocus
                />
                {employeeSearch && (
                  <button
                    onClick={() => setEmployeeSearch("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {employeeSearch && !selectedEmployee && (
                <div className="relative z-10">
                  <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No employees found for "{employeeSearch}"
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <button
                          key={employee._id}
                          onClick={() => handleSelectEmployee(employee)}
                          className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {employee.employeeId} • {employee.department || 'No Department'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Selected Employee Display */}
              {selectedEmployee && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {selectedEmployee.employeeId} • {selectedEmployee.department || 'No Department'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setEmployeeSearch("");
                        setBulkAttendanceData(prev => ({
                          ...prev,
                          employeeId: "",
                          employeeName: ""
                        }));
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
              
              {!selectedEmployee && (
                <p className="text-red-500 text-sm mt-2">
                  ⚠️ Please search and select an employee
                </p>
              )}
            </div>
            
            {/* Bulk Attendance Form Fields */}
            {selectedEmployee && (
              <div className="space-y-6">
                {/* Month and Year Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                    <select
                      value={bulkAttendanceData.month}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, month: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <input
                      type="number"
                      value={bulkAttendanceData.year}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, year: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      placeholder="YYYY"
                      min="2000"
                      max="2100"
                    />
                  </div>
                </div>
                
                {/* Default Shift Timings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Shift Start *</label>
                    <input
                      type="time"
                      value={bulkAttendanceData.defaultShiftStart}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        setBulkAttendanceData({...bulkAttendanceData, defaultShiftStart: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {bulkAttendanceData.defaultShiftStart && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {bulkAttendanceData.defaultShiftStart}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Shift End *</label>
                    <input
                      type="time"
                      value={bulkAttendanceData.defaultShiftEnd}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          toast.error("Please enter a valid time in HH:mm format");
                          return;
                        }
                        
                        if (bulkAttendanceData.defaultShiftStart && time) {
                          const start = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftStart}:00`);
                          const end = new Date(`2000-01-01T${time}:00`);
                          if (end <= start) {
                            toast.error("Shift end time must be after shift start time");
                            return;
                          }
                        }
                        
                        setBulkAttendanceData({...bulkAttendanceData, defaultShiftEnd: time});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                      required
                    />
                    {bulkAttendanceData.defaultShiftEnd && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {bulkAttendanceData.defaultShiftEnd}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional validation for shift timing difference */}
                {bulkAttendanceData.defaultShiftStart && bulkAttendanceData.defaultShiftEnd && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-blue-800">Shift Duration:</span>
                      <span className="text-sm font-bold text-blue-700 ml-1">
                        {(() => {
                          const start = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftStart}:00`);
                          const end = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftEnd}:00`);
                          const diffHours = (end - start) / (1000 * 60 * 60);
                          return `${diffHours.toFixed(2)} hours`;
                        })()}
                      </span>
                    </div>
                    {(() => {
                      const start = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftStart}:00`);
                      const end = new Date(`2000-01-01T${bulkAttendanceData.defaultShiftEnd}:00`);
                      const diffHours = (end - start) / (1000 * 60 * 60);
                      
                      if (diffHours < 1) {
                        return (
                          <div className="text-xs text-yellow-600 mt-1">
                            ⚠️ Shift duration is less than 1 hour
                          </div>
                        );
                      } else if (diffHours > 12) {
                        return (
                          <div className="text-xs text-yellow-600 mt-1">
                            ⚠️ Shift duration is more than 12 hours
                          </div>
                        );
                      } else if (diffHours < 4) {
                        return (
                          <div className="text-xs text-blue-600 mt-1">
                            ℹ️ Considered as Half Day shift
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
                
                {/* Options */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="skipWeekends"
                      checked={bulkAttendanceData.skipWeekends}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, skipWeekends: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="skipWeekends" className="ml-2 text-sm text-gray-700">
                      Skip Saturdays and Sundays
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="markAllAsPresent"
                      checked={bulkAttendanceData.markAllAsPresent}
                      onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, markAllAsPresent: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="markAllAsPresent" className="ml-2 text-sm text-gray-700">
                      Mark all days as Present
                    </label>
                  </div>
                </div>
                
                {/* Special Dates Management */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-700 mb-3">Special Dates Management</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={addHoliday}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      + Add Holiday
                    </button>
                    <button
                      type="button"
                      onClick={addLeaveDate}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      + Add Leave Date
                    </button>
                    <button
                      type="button"
                      onClick={addWorkingDay}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      + Add Working Day
                    </button>
                  </div>
                  
                  {/* Display added dates */}
                  {(bulkAttendanceData.holidays.length > 0 || bulkAttendanceData.leaveDates.length > 0 || bulkAttendanceData.workingDays.length > 0) && (
                    <div className="mt-4 space-y-2">
                      {bulkAttendanceData.holidays.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-purple-600">Holidays:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bulkAttendanceData.holidays.map((holiday, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                {holiday.date} ({holiday.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {bulkAttendanceData.leaveDates.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-blue-600">Leave Dates:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bulkAttendanceData.leaveDates.map((date, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {date}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {bulkAttendanceData.workingDays.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-green-600">Working Days:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bulkAttendanceData.workingDays.map((date, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                {date}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Preview Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-blue-600" size={20} />
                    <p className="text-sm font-medium text-blue-800">Preview Summary</p>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      <span className="font-medium">Employee:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Period:</span> {new Date(bulkAttendanceData.year, bulkAttendanceData.month - 1, 1).toLocaleString('default', { month: 'long' })} {bulkAttendanceData.year}
                    </p>
                    <p>
                      <span className="font-medium">Shift:</span> {bulkAttendanceData.defaultShiftStart} - {bulkAttendanceData.defaultShiftEnd}
                    </p>
                    <p>
                      <span className="font-medium">Total Days:</span> {new Date(bulkAttendanceData.year, bulkAttendanceData.month, 0).getDate()}
                    </p>
                    <p>
                      <span className="font-medium">Working Days:</span> {
                        generateBulkAttendanceData().filter(record => record.status === 'Present').length
                      }
                    </p>
                    <p>
                      <span className="font-medium">Holidays:</span> {
                        generateBulkAttendanceData().filter(record => record.status === 'Govt Holiday').length
                      }
                    </p>
                    <p>
                      <span className="font-medium">Leaves:</span> {
                        generateBulkAttendanceData().filter(record => record.status === 'Leave').length
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const records = generateBulkAttendanceData();
                      toast.success(
                        <div>
                          <p className="font-bold">Bulk Preview Generated</p>
                          <p>Total Records: {records.length}</p>
                          <p>Present: {records.filter(r => r.status === 'Present').length}</p>
                          <p>Holidays: {records.filter(r => r.status === 'Govt Holiday').length}</p>
                          <p>Leaves: {records.filter(r => r.status === 'Leave').length}</p>
                        </div>,
                        { duration: 5000 }
                      );
                    }}
                    className="mt-3 w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    Generate Preview
                  </button>
                </div>
                
                {/* Warning Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <p className="text-sm font-medium text-yellow-800">Important Note</p>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                    <li>This will create or update attendance records for all days in the selected month</li>
                    <li>Existing records will be updated with new data</li>
                    <li>New records will be created for missing dates</li>
                    <li>Weekends and holidays will be automatically marked (no clock in/out)</li>
                    <li>This action cannot be undone easily</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowBulkAttendanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeSearch("");
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBulkAttendance}
                disabled={loading || !selectedEmployee || !bulkAttendanceData.month || !bulkAttendanceData.year}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={20} />
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Create Bulk Attendance"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {selectedAttendanceRecord?.isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Attendance Record</h2>
              <button 
                onClick={() => setSelectedAttendanceRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedAttendanceRecord.date ? selectedAttendanceRecord.date.split('T')[0] : ''}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      date: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedAttendanceRecord.status}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      status: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Late">Late</option>
                    <option value="Govt Holiday">Govt Holiday</option>
                    <option value="Weekly Off">Weekly Off</option>
                    <option value="Off Day">Off Day</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock In Time</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.clockIn || ''}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      clockIn: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock Out Time</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.clockOut || ''}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      clockOut: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.shiftStart || '09:00'}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      shiftStart: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift End</label>
                  <input
                    type="time"
                    value={selectedAttendanceRecord.shiftEnd || '18:00'}
                    onChange={(e) => setSelectedAttendanceRecord({
                      ...selectedAttendanceRecord,
                      shiftEnd: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={selectedAttendanceRecord.remarks || ''}
                  onChange={(e) => setSelectedAttendanceRecord({
                    ...selectedAttendanceRecord,
                    remarks: e.target.value
                  })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  rows="3"
                  placeholder="Enter remarks..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedAttendanceRecord(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrectedAttendance}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App UI */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6 overflow-hidden">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Attendance Management
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">
                  {isAdmin ? "Manage all employee attendance" : "Track your attendance"}
                </p>
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isAdmin 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' 
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                  }`}>
                    {isAdmin ? <Shield size={12} /> : <User size={12} />}
                    {userRole.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Time</div>
                <div className="text-xl font-bold text-purple-700">{formatTime(currentTime)}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(new Date().toISOString())}
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              
              {/* Export button for employees */}
              {!isAdmin && (
                <button
                  onClick={() => handleExportData('csv')}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              )}
              
              {isAdmin && (
                <div className="relative admin-actions-menu">
                  <button 
                    onClick={() => setShowAdminActionsMenu(!showAdminActionsMenu)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <MoreVertical size={18} />
                    Admin Actions
                  </button>
                  {showAdminActionsMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            openManualAttendanceModal();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Plus size={18} />
                          <span>Manual Attendance</span>
                        </button>
                        <button
                          onClick={() => {
                            openBulkAttendanceModal();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <FileSpreadsheet size={18} />
                          <span>Bulk Attendance</span>
                        </button>
                        <button
                          onClick={() => {
                            handleViewLateStatistics();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <BarChart3 size={18} />
                          <span>Late Statistics</span>
                        </button>
                        <button
                          onClick={() => {
                            handleTriggerAutoClockOut();
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Clock size={18} />
                          <span>Trigger Auto Clock Out</span>
                        </button>
                        <button
  onClick={async () => {
    if (selectedEmployee) {
      const employeeAttendance = attendance.filter(a => 
        a.employee?._id === selectedEmployee._id || 
        a.employee === selectedEmployee._id
      );
      
      const employeeSummary = {
        totalDays: employeeAttendance.length,
        daysPresent: employeeAttendance.filter(a => a.status === 'Present').length,
        daysAbsent: employeeAttendance.filter(a => a.status === 'Absent').length,
        daysLeave: employeeAttendance.filter(a => a.status === 'Leave').length,
        totalHours: employeeAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
        attendanceRate: employeeAttendance.length > 0 
          ? (employeeAttendance.filter(a => a.status === 'Present').length / employeeAttendance.length) * 100
          : 0
      };
      
      await pdfUtils.generateAttendancePDF(employeeAttendance, selectedEmployee, employeeSummary);
      toast.success(`PDF exported for ${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
    } else {
      toast.error("Please select an employee first from the filter above");
    }
    setShowAdminActionsMenu(false);
  }}
  className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
>
  <FileText size={18} />
  <span>Export Employee PDF</span>
</button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            handleExportData('json');
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                          <span>Export JSON</span>
                        </button>
                        <button
                          onClick={() => {
                            handleExportData('csv');
                            setShowAdminActionsMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!isAdmin && (
                <button
                  onClick={handleViewShiftTiming}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow"
                >
                  <Clock4 size={18} />
                  Shift Timing
                </button>
              )}
              
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>

          {/* Employee Self View Section - Only for Employees */}
          {!isAdmin && userData && (
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-xl border border-blue-100 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="text-blue-600" size={24} />
                    My Attendance Records
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    View your attendance records by month and year
                  </p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => {
                      // Reset to current month
                      setEmployeeFilter({
                        ...employeeFilter,
                        month: String(new Date().getMonth() + 1),
                        year: String(new Date().getFullYear()),
                        status: "all"
                      });
                      handleRefresh();
                    }}
                    className="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    This Month
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={employeeFilter.month}
                    onChange={(e) => {
                      setEmployeeFilter({...employeeFilter, month: e.target.value});
                      // Auto-fetch when month changes
                      setTimeout(() => applyEmployeeFilter(), 100);
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={employeeFilter.year}
                    onChange={(e) => {
                      setEmployeeFilter({...employeeFilter, year: e.target.value});
                      // Auto-fetch when year changes
                      setTimeout(() => applyEmployeeFilter(), 100);
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                    placeholder="YYYY"
                    min="2000"
                    max="2100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                  <select
                    value={employeeFilter.status}
                    onChange={(e) => {
                      setEmployeeFilter({...employeeFilter, status: e.target.value});
                      // Auto-fetch when status changes
                      setTimeout(() => applyEmployeeFilter(), 100);
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Late">Late</option>
                    <option value="Govt Holiday">Govt Holiday</option>
                    <option value="Weekly Off">Weekly Off</option>
                    <option value="Off Day">Off Day</option>
                  </select>
                </div>
              </div>
              
              {/* Employee Summary Card */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300">
                  <div className="text-sm text-gray-500">Total Days</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{attendance.length}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300">
                  <div className="text-sm text-gray-500">Present</div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {attendance.filter(a => a.status === 'Present').length}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-red-100 hover:border-red-200 transition-all duration-300">
                  <div className="text-sm text-gray-500">Absent</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">
                    {attendance.filter(a => a.status === 'Absent').length}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300">
                  <div className="text-sm text-gray-500">Attendance %</div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {attendance.length > 0 
                      ? ((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(1)
                      : '0.0'}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clock In/Out Card - Only for Employees */}
          {userRole === "employee" && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-purple-600" size={24} />
                    Today's Attendance
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatDate(new Date().toISOString())}
                    <span className="ml-2 text-xs text-purple-500">
                      • Auto clock-out at 6:10 PM
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleClockIn}
                    disabled={loading || todayStatus.clockedIn || todayStatus.clockedOut}
                    className="group px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                    {todayStatus.clockedIn || todayStatus.clockedOut ? "Clocked In" : "Clock In"}
                  </button>
                  <button
                    onClick={handleClockOut}
                    disabled={loading || !todayStatus.clockedIn || todayStatus.clockedOut}
                    className="group px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {todayStatus.clockedOut ? "Clocked Out" : "Clock Out"}
                  </button>
                  
                  {(clockDetails || todayStatus.clockedIn) && (
                    <button
                      onClick={toggleDetailsVisibility}
                      className="group px-4 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {showRecentDetails ? (
                        <>
                          <EyeOff size={20} className="group-hover:scale-110 transition-transform" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye size={20} className="group-hover:scale-110 transition-transform" />
                          Show Details
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={handleViewLateStatistics}
                    className="group px-4 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <BarChart3 size={20} className="group-hover:scale-110 transition-transform" />
                    Late Stats
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    todayStatus.clockedIn 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sun className={todayStatus.clockedIn ? "text-green-600" : "text-gray-400"} size={20} />
                        <span className="font-medium text-gray-700">Clock In</span>
                      </div>
                      {todayStatus.clockedIn && (
                        <CheckCircle className="text-green-600 animate-pulse" size={20} />
                      )}
                    </div>
                    <div className="text-sm">
                      {todayStatus.clockedIn ? (
                        <div>
                          <div className="font-semibold text-green-700">✓ Completed</div>
                          <div className="text-green-600 mt-1 font-mono">
                            {formatTimeFromISO(todayStatus.clockInTime)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Not clocked in yet</div>
                      )}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    todayStatus.clockedOut 
                      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Moon className={todayStatus.clockedOut ? "text-blue-600" : "text-gray-400"} size={20} />
                        <span className="font-medium text-gray-700">Clock Out</span>
                      </div>
                      {todayStatus.clockedOut && (
                        <CheckCircle className="text-blue-600" size={20} />
                      )}
                    </div>
                    <div className="text-sm">
                      {todayStatus.clockedOut ? (
                        <div>
                          <div className="font-semibold text-blue-700">✓ Completed</div>
                          <div className="text-blue-600 mt-1 font-mono">
                            {formatTimeFromISO(todayStatus.clockOutTime)}
                          </div>
                        </div>
                      ) : todayStatus.clockedIn ? (
                        <div className="text-yellow-600 flex items-center gap-1">
                          <Clock size={14} />
                          Waiting to clock out
                        </div>
                      ) : (
                        <div className="text-gray-500">Clock in first</div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="text-purple-600" size={20} />
                        <span className="font-medium text-gray-700">Today's Status</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        todayStatus.clockedOut ? 'bg-blue-500' :
                        todayStatus.clockedIn ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="text-sm">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTodayStatusColor()}`}>
                        {getTodayStatusText()}
                      </div>
                      {todayStatus.clockedIn && todayStatus.clockedOut && (
                        <div className="text-xs text-gray-500 mt-2">
                          ✅ Attendance completed for today
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Info Card */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-xl border border-purple-100 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    View and manage all employee attendance records. You can edit attendance and generate reports.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="text-gray-500" size={16} />
                    <div className="text-sm text-gray-500">Total Employees</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalEmployees || employees.length || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-500" size={16} />
                    <div className="text-sm text-gray-500">Active Today</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">{summary?.presentToday || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="text-red-500" size={16} />
                    <div className="text-sm text-gray-500">Absent Today</div>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-1">{summary?.absentToday || 0}</div>
                </div>
              </div>
               
              {/* Admin Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={openManualAttendanceModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  Manual Attendance
                </button>
                <button
                  onClick={openBulkAttendanceModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FileSpreadsheet size={18} />
                  Bulk Attendance
                </button>
              </div>
            </div>
          )}

          {/* Employee Filter Section - For Admin */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="text-purple-600" size={24} />
                    Filter Attendance by Employee & Month
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Filter attendance records for specific employees and months
                  </p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={resetEmployeeFilter}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                  >
                    <X size={18} />
                    Reset
                  </button>
                  <button
                    onClick={applyEmployeeFilter}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Filter size={18} />
                    Apply Filter
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <select
                    value={employeeFilter.employeeId}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, employeeId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="">All Employees</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName} ({employee.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={employeeFilter.month}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, month: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="">All Months</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={employeeFilter.year}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, year: parseInt(e.target.value) || ''})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                    placeholder="YYYY"
                    min="2000"
                    max="2100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={employeeFilter.status}
                    onChange={(e) => setEmployeeFilter({...employeeFilter, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Late">Late</option>
                    <option value="Govt Holiday">Govt Holiday</option>
                    <option value="Weekly Off">Weekly Off</option>
                    <option value="Off Day">Off Day</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Recent Clock Details */}
          {(clockDetails && showRecentDetails) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-xl border border-blue-100 mb-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="text-blue-600" size={24} />
                  Recent Clock Details
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleDetailsVisibility}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300"
                  >
                    <EyeOff size={16} />
                    Hide
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(clockDetails, null, 2));
                      toast.success("Details copied to clipboard!");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-300"
                  >
                    <FileText size={16} />
                    Copy JSON
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Date</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDateDisplay(clockDetails.date)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(clockDetails.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                {clockDetails.clockIn && (
                  <div className="p-4 bg-white rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Clock In</span>
                    </div>
                    <div className="text-lg font-semibold text-green-700">
                      {new Date(clockDetails.clockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateDisplay(clockDetails.clockIn)}
                    </div>
                  </div>
                )}
                
                {clockDetails.clockOut && (
                  <div className="p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Clock Out</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-700">
                      {new Date(clockDetails.clockOut).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateDisplay(clockDetails.clockOut)}
                    </div>
                  </div>
                )}
                
                {clockDetails.totalHours > 0 && (
                  <div className="p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">Total Hours</span>
                    </div>
                    <div className="text-lg font-semibold text-purple-700">
                      {parseFloat(clockDetails.totalHours).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Hours worked
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    clockDetails.status === 'Present' ? 'bg-green-100 text-green-800' : 
                    clockDetails.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                    clockDetails.status === 'Leave' ? 'bg-blue-100 text-blue-800' : 
                    clockDetails.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                    clockDetails.status === 'Clocked In' ? 'bg-blue-100 text-blue-800' : 
                    clockDetails.status === 'Govt Holiday' ? 'bg-purple-100 text-purple-800' :
                    clockDetails.status === 'Weekly Off' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {clockDetails.status}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-blue-100 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const today = new Date().toDateString();
                    localStorage.setItem("attendanceDate", today);
                    localStorage.removeItem("attendanceTodayStatus");
                    localStorage.removeItem("attendanceClockDetails");
                    localStorage.setItem("attendanceShowDetails", "false");
                    
                    setTodayStatus({
                      clockedIn: false,
                      clockedOut: false,
                      clockInTime: null,
                      clockOutTime: null,
                      status: "Not Clocked",
                      date: today
                    });
                    
                    setClockDetails(null);
                    setShowRecentDetails(false);
                    
                    toast.success("Local storage cleared for new day");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  <RefreshCw size={16} />
                  Simulate New Day
                </button>
                <button
                  onClick={() => {
                    setShowRecentDetails(false);
                    toast.success("Details hidden");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  <EyeOff size={16} />
                  Close Details
                </button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Days Present</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.daysPresent || 0}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    Current period
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Days Absent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.daysAbsent || 0}</p>
                  <p className="text-xs text-red-500 mt-1">Needs attention</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <XCircle className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Hours</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalHours?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-blue-500 mt-1">Total for period</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Attendance Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.attendanceRate?.toFixed(1) || "0.0"}%</p>
                  <p className="text-xs text-purple-500 mt-1 flex items-center">
                    <BarChart3 size={12} className="mr-1" />
                    Performance
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 h-full">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Attendance Records</h2>
                      <p className="text-gray-500 text-sm">
                        Showing {currentItems.length} of {attendance.length} records
                        {isAdmin && employeeFilter.employeeId && ` (Filtered)`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex gap-2">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                          />
                        </div>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            handleRefresh();
                          }}
                          disabled={loading}
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Filter size={18} />
                          Apply Date
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[calc(100%-80px)] overflow-auto">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="inline-flex flex-col items-center">
                        <Loader2 size={48} className="animate-spin text-purple-600 mb-4" />
                        <p className="text-gray-600 font-medium">Loading attendance records...</p>
                      </div>
                    </div>
                  ) : attendance.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No attendance records</h3>
                        <p className="text-gray-500 max-w-md">
                          No records found for the selected {employeeFilter.employeeId ? 'employee and ' : ''}date range
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10">
                            <tr>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                              {isAdmin && <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Employee</th>}
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Clock In</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Clock Out</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Total Hours</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentItems.map((a) => (
                              <tr key={a._id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="py-4 px-6">
                                  <div className="font-medium text-gray-900">
                                    {new Date(a.date).toLocaleDateString('en-US', { 
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </td>
                                {isAdmin && (
                                  <td className="py-4 px-6">
                                    <div className="font-medium text-gray-900">
                                      {a.employee?.firstName ? `${a.employee.firstName} ${a.employee.lastName}` : `Employee ${a.employee?._id?.slice(-6) || 'N/A'}`}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {a.employee?.email || ''}
                                    </div>
                                  </td>
                                )}
                                <td className="py-4 px-6">
                                  <div className="flex items-center">
                                    <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                                    <span className="font-medium">{formatTimeFromISO(a.clockIn)}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center">
                                    <Moon className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span className="font-medium">{formatTimeFromISO(a.clockOut)}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    <span className={`font-bold ${a.totalHours >= 8 ? 'text-green-600' : 'text-yellow-600'}`}>
                                      {a.totalHours?.toFixed(2) || "-"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(a.status)}`}>
                                    {a.status || "Pending"}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleViewDetails(a._id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                      title="View Details"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    {isAdmin && (
                                      <>
                                        <button
                                          onClick={() => handleCorrectAttendance(a._id, a)}
                                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                          title="Edit Attendance"
                                        >
                                          <Edit size={18} />
                                        </button>
                                        <button
                                          onClick={() => handleUpdateShiftTiming(a.employee?._id)}
                                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                          title="Update Shift Timing"
                                        >
                                          <Settings size={18} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft size={18} />
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
                                    onClick={() => paginate(pageNum)}
                                    className={`w-10 h-10 rounded-lg transition-all ${
                                      currentPage === pageNum
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              
                              <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRightIcon size={18} />
                              </button>
                            </div>
                            <div className="text-sm text-gray-500">
                              {itemsPerPage} per page
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 h-full">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Attendance Summary</h2>
                  <p className="text-gray-500 text-sm mt-1">Selected period overview</p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
                  {summary ? (
                    <>
                      <div className="space-y-4">
                        {isAdmin && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Total Employees</span>
                              <span className="font-semibold text-gray-900">{summary.totalEmployees || employees.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Present Today</span>
                              <span className="font-semibold text-green-600">{summary.presentToday || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Absent Today</span>
                              <span className="font-semibold text-red-600">{summary.absentToday || 0}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Working Days</span>
                          <span className="font-semibold text-gray-900">{summary.workingDays || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Days Present</span>
                          <span className="font-semibold text-green-600">{summary.daysPresent || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Days Absent</span>
                          <span className="font-semibold text-red-600">{summary.daysAbsent || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Days Leave</span>
                          <span className="font-semibold text-blue-600">{summary.daysLeave || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Late Arrivals</span>
                          <span className="font-semibold text-yellow-600">{summary.lateArrivals || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Holidays/Off</span>
                          <span className="font-semibold text-purple-600">{summary.daysHoliday || 0}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Total Hours</span>
                            <span className="font-bold text-lg text-purple-700">{summary.totalHours?.toFixed(2) || "0.00"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Average Hours/Day</span>
                          <span className="font-semibold text-gray-900">{summary.averageHours?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 font-medium">Attendance Rate</span>
                          <span className="font-bold text-lg text-purple-700">{summary.attendanceRate?.toFixed(1) || "0.0"}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(summary.attendanceRate || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No summary data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .max-h-[500px] {
          max-height: 500px;
        }
        
        .h-[calc(100%-80px)] {
          height: calc(100% - 80px);
        }
      `}</style>
    </>
  );
}