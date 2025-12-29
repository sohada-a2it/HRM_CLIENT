// app/lib/api.js
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://a2ithrmserver-2.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Helper function to get token
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken");
  }
  return null;
};

// Users
export async function getUsers() {
  try {
    const res = await api.get("/admin/getAll-user");
    return res.data;
  } catch (err) {
    console.error(err);
    return { users: [] };
  }
}

export async function createUser(data) {
  try {
    const res = await api.post("/admin/create-user", data);
    return res.data;
  } catch (err) {
    console.error(err.response?.data || err);
    return { message: err.response?.data?.message || "Failed to create user" };
  }
}

export async function updateUser(id, data) {
  try {
    const res = await api.put(`/admin/update-user/${id}`, data);
    return res.data;
  } catch (err) {
    console.error(err.response?.data || err);
    return { message: err.response?.data?.message || "Failed to update user" };
  }
}

export async function deleteUser(id) {
  try {
    const res = await api.delete(`/admin/user-delete/${id}`);
    return res.data;
  } catch (err) {
    console.error(err.response?.data || err);
    return { message: err.response?.data?.message || "Failed to delete user" };
  }
}

// ================== ATTENDANCE API FUNCTIONS ==================

// Clock In
const handleClockIn = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("Please login first!");
      setLoading(false);
      return;
    }
    
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://a2ithrmserver-2.onrender.com/api/v1";
    
    const response = await fetch(`${API_BASE}/attendance/clock-in`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      })
    });
    
    const data = await response.json();
    console.log("Clock In Raw Response:", data);
    
    if (response.ok && data.status === "success") {
      await fetchSummary();
      alert("✅ Clock In successful!");
    } else {
      alert(`Clock In failed: ${data.message || `Status: ${response.status}`}`);
    }
  } catch (error) {
    console.error("Clock In fetch error:", error);
    alert("Network error. Please check your connection.");
  }
  setLoading(false);
};

// Clock Out
export async function clockOut() {
  try {
    const res = await api.post("/attendance/clock-out");
    return res.data;
  } catch (err) {
    console.error("Clock Out Error:", err.response?.data || err);
    return { 
      status: "error", 
      message: err.response?.data?.message || "Failed to clock out" 
    };
  }
}

// Get Attendance Summary
export async function getAttendanceSummary(userId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
 const res = await api.get(`/admin/attendance/summary?${params.toString()}`);
    return res.data;
  } catch (err) {
    console.error("Attendance Summary Error:", err.response?.data || err);
    return { 
      status: "error", 
      message: err.response?.data?.message || "Failed to fetch attendance summary" 
    };
  }
}

// Get All Attendance Records
export async function getAllAttendance(userId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const res = await api.get(`/attendance/all?${params.toString()}`);
    return res.data;
  } catch (err) {
    console.error("All Attendance Error:", err.response?.data || err);
    return { 
      status: "error", 
      message: err.response?.data?.message || "Failed to fetch attendance records" 
    };
  }
}

// Correct Attendance (Admin)
export async function correctAttendance(attendanceId, data) {
  try {
    const res = await api.put(`/attendance/admin-correct/${attendanceId}`, data);
    return res.data;
  } catch (err) {
    console.error("Correct Attendance Error:", err.response?.data || err);
    return { 
      status: "error", 
      message: err.response?.data?.message || "Failed to correct attendance" 
    };
  }
}

// Get Today's Attendance Status
export async function getTodayAttendance() {
  try {
    const res = await api.get("/attendance/today");
    return res.data;
  } catch (err) {
    console.error("Today's Attendance Error:", err.response?.data || err);
    return { 
      status: "error", 
      message: err.response?.data?.message || "Failed to fetch today's attendance" 
    };
  }
}

// Get Monthly Attendance Report
export async function getMonthlyAttendance(month, year) {
  try {
    const res = await api.get(`/attendance/monthly?month=${month}&year=${year}`);
    return res.data;
  } catch (err) {
    console.error("Monthly Attendance Error:", err.response?.data || err);
    return { 
      status: "error", 
      message: err.response?.data?.message || "Failed to fetch monthly attendance" 
    };
  }
}

export default api;