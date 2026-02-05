// components/AttendanceReportPDF.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ফন্ট রেজিস্ট্রেশন
Font.register({
  family: "Helvetica",
  fonts: [
    { 
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2" 
    },
  ],
});

// ✅ Late/Early Calculation Function (Frontend এর মতোই)
const calculateLateEarlyMinutes = (clockInTime, shiftStart, recordStatus, lateThreshold = 5, earlyThreshold = 1) => {
  const nonWorkingStatuses = ['Absent', 'Leave', 'Govt Holiday', 'Weekly Off', 'Off Day', 'Holiday'];
  
  if (nonWorkingStatuses.includes(recordStatus)) {
    return {
      isLate: false,
      isEarly: false,
      minutes: 0,
      details: '',
      status: recordStatus
    };
  }
  
  if (!clockInTime || !shiftStart) return { 
    isLate: false, 
    isEarly: false, 
    minutes: 0, 
    details: 'N/A',
    status: 'Present'
  };

  try {
    const clockIn = new Date(clockInTime);
    const [shiftHour, shiftMinute] = shiftStart.split(':').map(Number);
    const clockInHour = clockIn.getHours();
    const clockInMinute = clockIn.getMinutes();
    
    const clockInTotalMinutes = clockInHour * 60 + clockInMinute;
    const shiftTotalMinutes = shiftHour * 60 + shiftMinute;
    const diffMinutes = clockInTotalMinutes - shiftTotalMinutes;
    
    // ✅ Case 1: EARLY
    if (diffMinutes < 0 && Math.abs(diffMinutes) >= earlyThreshold) {
      const earlyMinutes = Math.abs(diffMinutes);
      let details = '';
      
      if (earlyMinutes >= 60) {
        const hours = Math.floor(earlyMinutes / 60);
        const mins = earlyMinutes % 60;
        details = mins > 0 ? `${hours}h ${mins}m early` : `${hours}h early`;
      } else {
        details = `${earlyMinutes}m early`;
      }
      
      return { 
        isLate: false, 
        isEarly: true, 
        minutes: earlyMinutes, 
        details,
        status: `Present (Early)`
      };
    } 
    // ✅ Case 2: LATE
    else if (diffMinutes > lateThreshold) {
      const lateMinutes = diffMinutes - lateThreshold;
      let details = '';
      
      if (lateMinutes >= 60) {
        const hours = Math.floor(lateMinutes / 60);
        const mins = lateMinutes % 60;
        details = mins > 0 ? `${hours}h ${mins}m late` : `${hours}h late`;
      } else {
        details = `${lateMinutes}m late`;
      }
      
      return { 
        isLate: true, 
        isEarly: false, 
        minutes: lateMinutes, 
        details,
        status: `Present (Late)`
      };
    }
    // ✅ Case 3: ON TIME
    else {
      let details = '';
      
      if (diffMinutes === 0) {
        details = 'Exactly on time';
      } else if (diffMinutes > 0) {
        details = `${diffMinutes}m after shift start`;
      } else {
        details = `${Math.abs(diffMinutes)}m before shift start (On time)`;
      }
      
      return { 
        isLate: false, 
        isEarly: false, 
        minutes: Math.abs(diffMinutes), 
        details,
        status: `Present (On Time)`
      };
    }
  } catch (error) {
    return { 
      isLate: false, 
      isEarly: false, 
      minutes: 0, 
      details: 'Calculation error',
      status: 'Present'
    };
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#667eea",
    borderBottomStyle: "solid",
  },
  
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
  logoCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  
  logoText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  
  companyTagline: {
    fontSize: 8,
    color: "#718096",
    marginTop: 1,
  },
  
  reportInfo: {
    alignItems: "flex-end",
  },
  
  reportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4C51BF",
    marginBottom: 4,
  },
  
  reportSubtitle: {
    fontSize: 9,
    color: "#718096",
  },
  
  reportDate: {
    fontSize: 8,
    color: "#4A5568",
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginTop: 4,
  },
  
  // Summary Section - Made Smaller
  summarySection: {
    marginBottom: 15,
  },
  
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  
  // Summary Cards made smaller and more compact
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  
  summaryCard: {
    flex: 1,
    minWidth: "23%", // 4 cards per row instead of 2
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    minHeight: 50,
  },
  
  summaryLabel: {
    fontSize: 8,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 2,
  },
  
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  
  summarySubtext: {
    fontSize: 7,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 1,
  },
  
  // Filters
  filtersSection: {
    backgroundColor: "#F7FAFC",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  
  filtersTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4A5568",
    marginBottom: 6,
  },
  
  filtersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  
  filterBadge: {
    fontSize: 7,
    color: "#4A5568",
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  
  // Table
  tableSection: {
    marginBottom: 20,
  },
  
  tableTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4C51BF",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  
  tableHeaderText: {
    fontSize: 8,
    color: "#FFFFFF",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  
  tableRowEven: {
    backgroundColor: "#F7FAFC",
  },
  
  tableCell: {
    fontSize: 7,
    color: "#2D3748",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  
  // FIXED: Status Badge colors - using HEX colors directly
  statusBadge: {
    fontSize: 6.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  
  // Late/Early Badges with fixed colors
  lateEarlyBadge: {
    fontSize: 6.5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    textAlign: "center",
    marginTop: 2,
  },
  
  // Fixed badge styles with explicit colors
  lateBadge: {
    backgroundColor: "#FEFCBF",
    color: "#D69E2E",
  },
  
  earlyBadge: {
    backgroundColor: "#E9D8FD",
    color: "#805AD5",
  },
  
  onTimeBadge: {
    backgroundColor: "#C6F6D5",
    color: "#38A169",
  },
  
  detailsCell: {
    fontSize: 6.5,
    color: "#4A5568",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 1,
  },
  
  // Footer
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  footerText: {
    fontSize: 7,
    color: "#718096",
  },
  
  pageNumber: {
    fontSize: 7,
    color: "#4A5568",
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});

const AttendanceReportPDF = ({ 
  attendance = [], 
  filters = {}, 
  dateRange = {}, 
  summary = {}, 
  userData = {}, 
  isAdmin = false,
  selectedEmployeeName = '' 
}) => {
  // ✅ ফাংশনগুলো ডিফাইন করুন
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString || "-";
    }
  };
  
  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return timeString || "-";
    }
  };
  
  // ✅ Status colors function - FIXED
  const getStatusColor = (status) => {
    const colorMap = {
      'Present': '#38A169',
      'Present (On Time)': '#38A169',
      'Present (Late)': '#D69E2E',
      'Present (Early)': '#805AD5',
      'Absent': '#E53E3E',
      'Leave': '#3182CE',
      'Govt Holiday': '#6B46C1',
      'Weekly Off': '#4A5568',
      'Off Day': '#718096',
    };
    return colorMap[status] || '#4A5568';
  };
  
  const getStatusBgColor = (status) => {
    const bgMap = {
      'Present': '#C6F6D5',
      'Present (On Time)': '#C6F6D5',
      'Present (Late)': '#FEFCBF',
      'Present (Early)': '#E9D8FD',
      'Absent': '#FED7D7',
      'Leave': '#BEE3F8',
      'Govt Holiday': '#E9D8FD',
      'Weekly Off': '#E2E8F0',
      'Off Day': '#EDF2F7',
    };
    return bgMap[status] || '#E2E8F0';
  };
  
  // ✅ Calculate statistics
  const presentCount = attendance.filter(a => 
    a.status === "Present" || 
    a.status === "Present (On Time)" || 
    a.status === "Present (Late)" || 
    a.status === "Present (Early)"
  ).length;
  
  const absentCount = attendance.filter(a => a.status === "Absent").length;
  
  const lateEarlyStats = attendance.reduce((stats, record) => {
    const lateEarly = calculateLateEarlyMinutes(
      record.clockIn, 
      record.shift?.start || "09:00", 
      record.status,
      5,
      1
    );
    
    if (lateEarly.isLate) {
      stats.lateMinutes += lateEarly.minutes;
      stats.lateCount++;
    } else if (lateEarly.isEarly) {
      stats.earlyMinutes += lateEarly.minutes;
      stats.earlyCount++;
    } else if (lateEarly.status === 'Present (On Time)') {
      stats.onTimeCount++;
    }
    
    return stats;
  }, { lateCount: 0, lateMinutes: 0, earlyCount: 0, earlyMinutes: 0, onTimeCount: 0 });
  
  const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
  const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;
  
  // ✅ SMALLER Summary cards - with 8 cards total
  const summaryCards = [
    { 
      label: "Total Days", 
      value: attendance.length, 
      subtext: "in period", 
      color: "#4C51BF" 
    },
    { 
      label: "Present", 
      value: presentCount, 
      subtext: `${((presentCount/attendance.length)*100 || 0).toFixed(1)}%`, 
      color: "#38A169" 
    },
    { 
      label: "Absent", 
      value: absentCount, 
      subtext: `${((absentCount/attendance.length)*100 || 0).toFixed(1)}%`, 
      color: "#E53E3E" 
    },
    { 
      label: "Late", 
      value: lateEarlyStats.lateCount, 
      subtext: lateEarlyStats.lateCount > 0 ? `Avg: ${(lateEarlyStats.lateMinutes/lateEarlyStats.lateCount).toFixed(0)}m` : 'None', 
      color: "#D69E2E" 
    },
    { 
      label: "Early", 
      value: lateEarlyStats.earlyCount, 
      subtext: lateEarlyStats.earlyCount > 0 ? `Avg: ${(lateEarlyStats.earlyMinutes/lateEarlyStats.earlyCount).toFixed(0)}m` : 'None', 
      color: "#805AD5" 
    },
    { 
      label: "On Time", 
      value: lateEarlyStats.onTimeCount, 
      subtext: `${((lateEarlyStats.onTimeCount/attendance.length)*100 || 0).toFixed(1)}%`, 
      color: "#319795" 
    },
    { 
      label: "Total Hrs", 
      value: totalHours.toFixed(1), 
      subtext: "hours worked", 
      color: "#3182CE" 
    },
    { 
      label: "Rate", 
      value: attendanceRate.toFixed(1) + "%", 
      subtext: "attendance %", 
      color: "#6B46C1" 
    },
  ];
  
  // ✅ Filter badges
  const filterBadges = [];
  if (dateRange.startDate && dateRange.endDate) {
    filterBadges.push(`${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`);
  }
  if (filters?.status && filters.status !== 'all') {
    filterBadges.push(`Status: ${filters.status}`);
  }
  if (filters?.employeeId && selectedEmployeeName) {
    filterBadges.push(`Employee: ${selectedEmployeeName}`);
  }
  if (filters?.search) {
    filterBadges.push(`Search: "${filters.search}"`);
  }
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>A2</Text>
            </View>
            <View>
              <Text style={styles.companyName}>A2IT HRM</Text>
              <Text style={styles.companyTagline}>Attendance Management System</Text>
            </View>
          </View>
          
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Attendance Report</Text>
            <Text style={styles.reportSubtitle}>
              {isAdmin ? 'Admin Report' : 'Employee Report'}
            </Text>
            <Text style={styles.reportDate}>
              {new Date().toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        
        {/* Employee Information */}
        {isAdmin && selectedEmployeeName && (
          <View style={[styles.filtersSection, { backgroundColor: '#EBF4FF', borderLeftWidth: 4, borderLeftColor: '#4299E1' }]}>
            <Text style={[styles.filtersTitle, { color: '#2B6CB0' }]}>
              Employee Information
            </Text>
            <View style={styles.filtersGrid}>
              <Text style={[styles.filterBadge, { backgroundColor: '#BEE3F8', color: '#2C5282' }]}>
                Name: {selectedEmployeeName}
              </Text>
              <Text style={[styles.filterBadge, { backgroundColor: '#C6F6D5', color: '#22543D' }]}>
                Report Period: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
              </Text>
            </View>
          </View>
        )}
        
        {/* Summary Section - Made Compact */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Attendance Summary</Text>
          <View style={styles.summaryGrid}>
            {summaryCards.map((card, index) => (
              <View 
                key={index} 
                style={[
                  styles.summaryCard, 
                  { backgroundColor: card.color }
                ]}
              >
                <Text style={styles.summaryLabel}>{card.label}</Text>
                <Text style={styles.summaryValue}>{card.value}</Text>
                <Text style={styles.summarySubtext}>{card.subtext}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Active Filters */}
        {filterBadges.length > 0 && (
          <View style={styles.filtersSection}>
            <Text style={styles.filtersTitle}>Active Filters</Text>
            <View style={styles.filtersGrid}>
              {filterBadges.map((badge, index) => (
                <Text key={index} style={styles.filterBadge}>{badge}</Text>
              ))}
            </View>
          </View>
        )}
        
        {/* Attendance Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>Attendance Details</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Date</Text>
              <Text style={styles.tableHeaderText}>Shift</Text>
              <Text style={styles.tableHeaderText}>Clock In</Text>
              <Text style={styles.tableHeaderText}>Clock Out</Text>
              <Text style={styles.tableHeaderText}>Status</Text>
              <Text style={styles.tableHeaderText}>Punctuality</Text>
              <Text style={styles.tableHeaderText}>Hours</Text>
            </View>
            
            {/* Table Rows */}
            {attendance.map((record, index) => {
              const date = new Date(record.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const isEvenRow = index % 2 === 0;
              
              // Calculate Late/Early
              const lateEarly = calculateLateEarlyMinutes(
                record.clockIn, 
                record.shift?.start || "09:00", 
                record.status,
                5,
                1
              );
              
              // Get status display
              const displayStatus = lateEarly.status;
              const statusColor = getStatusColor(displayStatus);
              const statusBgColor = getStatusBgColor(displayStatus);
              
              // Determine punctuality badge
              let punctualityBadge = null;
              let punctualityText = "";
              
              if (lateEarly.isLate) {
                punctualityBadge = styles.lateBadge;
                punctualityText = "LATE";
              } else if (lateEarly.isEarly) {
                punctualityBadge = styles.earlyBadge;
                punctualityText = "EARLY";
              } else if (lateEarly.status === 'Present (On Time)') {
                punctualityBadge = styles.onTimeBadge;
                punctualityText = "ON TIME";
              }
              
              return (
                <View 
                  key={record._id || index} 
                  style={[
                    styles.tableRow,
                    isEvenRow && styles.tableRowEven
                  ]}
                >
                  {/* Date */}
                  <View style={styles.tableCell}>
                    <Text>{formatDate(record.date)}</Text>
                    <Text style={{ fontSize: 6.5, color: '#718096' }}>{dayName}</Text>
                    {(record.autoGenerated || record.markedAbsent) && (
                      <Text style={{ fontSize: 6, color: '#718096', fontStyle: 'italic', marginTop: 1 }}>
                        {record.autoGenerated ? 'Auto' : ''}
                        {record.markedAbsent ? 'Auto-absent' : ''}
                      </Text>
                    )}
                  </View>
                  
                  {/* Shift Time */}
                  <Text style={styles.tableCell}>
                    {record.shift?.start || "09:00"} - {record.shift?.end || "18:00"}
                  </Text>
                  
                  {/* Clock In */}
                  <View style={styles.tableCell}>
                    <Text>{formatTime(record.clockIn) || "-"}</Text>
                    {lateEarly.isLate && (
                      <Text style={[styles.lateEarlyBadge, styles.lateBadge]}>
                        {lateEarly.details}
                      </Text>
                    )}
                    {lateEarly.isEarly && (
                      <Text style={[styles.lateEarlyBadge, styles.earlyBadge]}>
                        {lateEarly.details}
                      </Text>
                    )}
                  </View>
                  
                  {/* Clock Out */}
                  <View style={styles.tableCell}>
                    <Text>{formatTime(record.clockOut) || "-"}</Text>
                    {record.autoClockOut && (
                      <Text style={{ fontSize: 6, color: '#D69E2E', fontStyle: 'italic', marginTop: 1 }}>
                        Auto
                      </Text>
                    )}
                  </View>
                  
                  {/* Status - FIXED: Using direct styles instead of variables */}
                  <View style={styles.tableCell}>
                    <Text 
                      style={[
                        styles.statusBadge,
                        { 
                          color: statusColor,
                          backgroundColor: statusBgColor
                        }
                      ]}
                    >
                      {displayStatus}
                    </Text>
                  </View>
                  
                  {/* Punctuality */}
                  <View style={styles.tableCell}>
                    {punctualityBadge ? (
                      <>
                        <Text style={[styles.lateEarlyBadge, punctualityBadge]}>
                          {punctualityText}
                        </Text>
                        <Text style={styles.detailsCell}>
                          {lateEarly.details}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.detailsCell}>-</Text>
                    )}
                  </View>
                  
                  {/* Hours */}
                  <View style={styles.tableCell}>
                    <Text style={{ fontWeight: 'bold', fontSize: 8 }}>
                      {record.totalHours?.toFixed(1) || "0.0"}
                    </Text>
                    <Text style={{ fontSize: 6.5, color: '#718096' }}>
                      hours
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A2IT HRM • Attendance Management System • Generated on {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.pageNumber}>
            Page 1
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default AttendanceReportPDF;