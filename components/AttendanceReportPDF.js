import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Simple styles with NO external font dependencies
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  
  title: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
  },
  
  subtitle: {
    fontSize: 12,
    marginBottom: 10,
    color: "#666",
  },
  
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  
  tableRow: {
    flexDirection: "row",
  },
  
  tableColHeader: {
    width: "14%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 5,
    fontWeight: "bold",
  },
  
  tableCol: {
    width: "14%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
});

const AttendanceReportPDF = ({ attendance, userData, isAdmin }) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString || "-";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Report</Text>
          <Text style={styles.subtitle}>
            Generated on: {new Date().toLocaleDateString()} | 
            By: {userData?.name || userData?.firstName || "System"}
          </Text>
        </View>

        {/* Simple Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Date</Text>
            <Text style={styles.tableColHeader}>Employee</Text>
            <Text style={styles.tableColHeader}>Clock In</Text>
            <Text style={styles.tableColHeader}>Clock Out</Text>
            <Text style={styles.tableColHeader}>Status</Text>
            <Text style={styles.tableColHeader}>Hours</Text>
            <Text style={styles.tableColHeader}>Remarks</Text>
          </View>

          {/* Data Rows */}
          {attendance.map((record, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol}>
                {formatDate(record.date)}
              </Text>
              <Text style={styles.tableCol}>
                {record.employee?.name || record.employee?.firstName || "N/A"}
              </Text>
              <Text style={styles.tableCol}>
                {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
              </Text>
              <Text style={styles.tableCol}>
                {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
              </Text>
              <Text style={styles.tableCol}>
                {record.status || "-"}
              </Text>
              <Text style={styles.tableCol}>
                {record.totalHours?.toFixed(2) || "0.00"}
              </Text>
              <Text style={styles.tableCol}>
                {record.remarks?.substring(0, 20) || "-"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Total Records: {attendance.length} | System Generated Report</Text>
        </View>
      </Page>
    </Document>
  );
};

export default AttendanceReportPDF;