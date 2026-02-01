// components/PayrollPDFDocument.jsx
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Font,
  Image 
} from '@react-pdf/renderer';

// Register fonts (optional)
Font.register({
  family: 'Noto Sans Bengali',
  src: 'https://fonts.gstatic.com/s/notosansbengali/v20/pxiEyp8kv8JHgFVrJJLmO0tCMPI7e1A.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2pt solid #3b82f6',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 3
  },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8
  },
  table: {
    display: 'table',
    width: '100%',
    marginVertical: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 5
  },
  tableCellHeader: {
    width: '40%',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#4b5563'
  },
  tableCell: {
    width: '60%',
    fontSize: 10,
    color: '#111827'
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'right'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af'
  }
});

const PayrollPDFDocument = ({ payroll }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount).replace('BDT', '৳');
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PAYROLL STATEMENT</Text>
          <Text style={styles.subtitle}>
            {getMonthName(payroll.month)} {payroll.year} • Employee ID: {payroll.employeeId}
          </Text>
          <Text style={styles.subtitle}>
            Generated on: {new Date().toLocaleDateString('en-US')}
          </Text>
        </View>

        {/* Employee Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMPLOYEE INFORMATION</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Name:</Text>
              <Text style={styles.tableCell}>{payroll.employeeName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Department:</Text>
              <Text style={styles.tableCell}>{payroll.department}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Designation:</Text>
              <Text style={styles.tableCell}>{payroll.designation}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Period:</Text>
              <Text style={styles.tableCell}>
                {getMonthName(payroll.month)} {payroll.year}
              </Text>
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EARNINGS</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Basic Salary:</Text>
              <Text style={styles.tableCell}>{formatCurrency(payroll.earnings?.basicPay || 0)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Overtime:</Text>
              <Text style={styles.tableCell}>{formatCurrency(payroll.earnings?.overtime?.amount || 0)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Bonus:</Text>
              <Text style={styles.tableCell}>{formatCurrency(payroll.earnings?.bonus?.amount || 0)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Allowance:</Text>
              <Text style={styles.tableCell}>{formatCurrency(payroll.earnings?.allowance?.amount || 0)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeader, {fontWeight: 'bold'}]}>Total Earnings:</Text>
              <Text style={[styles.tableCell, {fontWeight: 'bold'}]}>
                {formatCurrency(payroll.summary?.grossEarnings || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Deductions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEDUCTIONS</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Late Deduction:</Text>
              <Text style={styles.tableCell}>{formatCurrency(payroll.deductions?.lateDeduction || 0)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Absent Deduction:</Text>
              <Text style={styles.tableCell}>{formatCurrency(payroll.deductions?.absentDeduction || 0)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Leave Deduction:</Text>
              <Text style={styles.tableCell}>{formatCurrency(payroll.deductions?.leaveDeduction || 0)}</Text>
            </View>
            {payroll.mealSystemData?.mealDeduction?.amount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellHeader}>Meal Deduction:</Text>
                <Text style={styles.tableCell}>{formatCurrency(payroll.mealSystemData.mealDeduction.amount)}</Text>
              </View>
            )}
            {payroll.onsiteBenefitsDetails?.serviceCharge > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellHeader}>Service Charge:</Text>
                <Text style={styles.tableCell}>{formatCurrency(payroll.onsiteBenefitsDetails.serviceCharge)}</Text>
              </View>
            )}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeader, {fontWeight: 'bold'}]}>Total Deductions:</Text>
              <Text style={[styles.tableCell, {fontWeight: 'bold'}]}>
                {formatCurrency(payroll.deductions?.total || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.section, {backgroundColor: '#ecfdf5'}]}>
          <Text style={[styles.sectionTitle, {color: '#047857'}]}>FINAL SUMMARY</Text>
          <View style={[styles.table, {marginVertical: 15}]}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeader, {fontSize: 12}]}>Gross Earnings:</Text>
              <Text style={[styles.tableCell, {fontSize: 12}]}>
                {formatCurrency(payroll.summary?.grossEarnings || 0)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeader, {fontSize: 12}]}>Total Deductions:</Text>
              <Text style={[styles.tableCell, {fontSize: 12}]}>
                {formatCurrency(payroll.deductions?.total || 0)}
              </Text>
            </View>
            <View style={[styles.tableRow, {borderBottomWidth: 0, paddingVertical: 8}]}>
              <Text style={[styles.tableCellHeader, {fontSize: 14, fontWeight: 'bold'}]}>Net Payable:</Text>
              <Text style={[styles.tableCell, styles.amount]}>
                {formatCurrency(payroll.summary?.netPayable || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYROLL STATUS</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Status:</Text>
              <Text style={styles.tableCell}>{payroll.status || 'Pending'}</Text>
            </View>
            {payroll.employeeAccepted?.accepted && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellHeader}>Accepted By Employee:</Text>
                <Text style={[styles.tableCell, {color: '#059669'}]}>
                  ✓ Yes ({new Date(payroll.employeeAccepted.acceptedAt).toLocaleDateString()})
                </Text>
              </View>
            )}
            {payroll.payment?.paymentDate && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellHeader}>Payment Date:</Text>
                <Text style={styles.tableCell}>
                  {new Date(payroll.payment.paymentDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer generated payroll statement. No signature required.</Text>
          <Text>Confidential Document • © {new Date().getFullYear()} A2IT HRM System</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PayrollPDFDocument;