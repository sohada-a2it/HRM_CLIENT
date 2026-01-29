// components/PayrollPDF.js
import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';

// বাংলা ফন্ট যোগ করতে (যদি চান)
Font.register({
  family: 'SutonnyMJ',
  src: '/fonts/SutonnyMJ.ttf' // আপনার ফন্ট পাথ
});

// স্টাইলস
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2pt solid #1e40af',
  },
  title: {
    fontSize: 24,
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  filterSection: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    border: '1pt solid #d1d5db',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  filterLabel: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: 'bold',
  },
  filterValue: {
    fontSize: 10,
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statBox: {
    width: '24%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 5,
    border: '1pt solid #e2e8f0',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#1e40af',
    color: 'white',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  employeeCell: {
    width: '30%',
  },
  periodCell: {
    width: '15%',
  },
  amountCell: {
    width: '20%',
  },
  statusCell: {
    width: '15%',
  },
  deductionsCell: {
    width: '20%',
  },
  statusPaid: {
    color: '#059669',
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#d97706',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 10,
  },
});

const payrollPDF = ({ 
  payrolls, 
  filters, 
  stats,
  generatedDate 
}) => {
  // ফিল্টার ইনফো টেক্সট জেনারেট
  const getFilterText = () => {
    const filterTexts = [];
    
    if (filters.searchTerm) {
      filterTexts.push(`Search: "${filters.searchTerm}"`);
    }
    
    if (filters.selectedMonth !== "all") {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      filterTexts.push(`Month: ${monthNames[filters.selectedMonth - 1]}`);
    }
    
    if (filters.selectedYear) {
      filterTexts.push(`Year: ${filters.selectedYear}`);
    }
    
    if (filters.selectedStatus !== "all") {
      filterTexts.push(`Status: ${filters.selectedStatus}`);
    }
    
    if (filters.selectedDepartment !== "all") {
      filterTexts.push(`Department: ${filters.selectedDepartment}`);
    }
    
    return filterTexts.length > 0 ? filterTexts.join(' • ') : 'All Records';
  };

  // স্ট্যাটাস কালার
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return styles.statusPaid;
      case 'pending': return styles.statusPending;
      default: return {};
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* হেডার */}
        <View style={styles.header}>
          <Text style={styles.title}>Payroll Report</Text>
          <Text style={styles.subtitle}>
            Generated on: {generatedDate}
          </Text>
        </View>

        {/* ফিল্টার সেকশন */}
        <View style={styles.filterSection}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#374151' }}>
            Applied Filters
          </Text>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filter Criteria:</Text>
            <Text style={styles.filterValue}>{getFilterText()}</Text>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Records Found:</Text>
            <Text style={styles.filterValue}>{payrolls.length} payrolls</Text>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Report Type:</Text>
            <Text style={styles.filterValue}>
              {filters.selectedMonth === "all" ? "Multi-Month Report" : "Monthly Report"}
            </Text>
          </View>
        </View>

        {/* স্ট্যাটিস্টিক্স */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Payable</Text>
            <Text style={styles.statValue}>
              ৳{stats.totalNetPayable?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Average Salary</Text>
            <Text style={styles.statValue}>
              ৳{stats.averageSalary?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Paid</Text>
            <Text style={styles.statValue}>{stats.totalPaid || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{stats.totalPending || 0}</Text>
          </View>
        </View>

        {/* টেবিল হেডার */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.employeeCell]}>Employee</Text>
          <Text style={[styles.tableCell, styles.periodCell]}>Period</Text>
          <Text style={[styles.tableCell, styles.amountCell]}>Amount</Text>
          <Text style={[styles.tableCell, styles.statusCell]}>Status</Text>
          <Text style={[styles.tableCell, styles.deductionsCell]}>Deductions</Text>
        </View>

        {/* টেবিল ডাটা */}
        {payrolls.map((payroll, index) => (
          <View key={index} style={styles.tableRow}>
            {/* Employee */}
            <View style={[styles.tableCell, styles.employeeCell]}>
              <Text style={{ fontWeight: 'bold', fontSize: 11 }}>
                {payroll.employeeName || 'N/A'}
              </Text>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>
                {payroll.department} • {payroll.employeeId}
              </Text>
              {payroll.designation && (
                <Text style={{ fontSize: 9, color: '#4b5563' }}>
                  {payroll.designation}
                </Text>
              )}
            </View>

            {/* Period */}
            <View style={[styles.tableCell, styles.periodCell]}>
              <Text style={{ fontSize: 10 }}>
                {(() => {
                  const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ];
                  return `${monthNames[payroll.month - 1]} ${payroll.year}`;
                })()}
              </Text>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>
                Days: {payroll.attendance?.presentDays || 0}/{payroll.attendance?.totalWorkingDays || 23}
              </Text>
            </View>

            {/* Amount */}
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text style={{ fontWeight: 'bold', color: '#059669' }}>
                ৳{(payroll.summary?.netPayable || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontSize: 9, color: '#4b5563' }}>
                Basic: ৳{(payroll.earnings?.basicPay || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Status */}
            <View style={[styles.tableCell, styles.statusCell]}>
              <Text style={getStatusStyle(payroll.status)}>
                {payroll.status || 'Pending'}
              </Text>
              {payroll.employeeAccepted?.accepted && (
                <Text style={{ fontSize: 8, color: '#059669' }}>
                  ✓ Accepted
                </Text>
              )}
            </View>

            {/* Deductions */}
            <View style={[styles.tableCell, styles.deductionsCell]}>
              <Text style={{ fontSize: 10, color: '#dc2626' }}>
                -৳{(payroll.deductions?.total || 0).toLocaleString('en-IN')}
              </Text>
              {payroll.mealSystemData?.mealDeduction?.amount > 0 && (
                <Text style={{ fontSize: 8, color: '#ef4444' }}>
                  Meal: -৳{payroll.mealSystemData.mealDeduction.amount.toLocaleString('en-IN')}
                </Text>
              )}
              {payroll.onsiteBenefitsDetails?.netEffect > 0 && (
                <Text style={{ fontSize: 8, color: '#d97706' }}>
                  Onsite: +৳{payroll.onsiteBenefitsDetails.netEffect.toLocaleString('en-IN')}
                </Text>
              )}
            </View>
          </View>
        ))}

        {/* ফুটার */}
        <View style={styles.footer}>
          <Text>
            Page 1 of 1 • Generated by A2IT Payroll System • Confidential Document
          </Text>
          <Text style={{ marginTop: 5 }}>
            Total Amount: ৳{stats.totalNetPayable?.toLocaleString('en-IN') || '0'} • 
            Total Records: {payrolls.length} • 
            Generated: {generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default payrollPDF;