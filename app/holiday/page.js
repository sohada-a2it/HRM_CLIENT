"use client";

import React, { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  RefreshCw, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  Globe,
  ChevronDown,
  MoreVertical,
  CalendarDays,
  PartyPopper,
  Shield,
  Eye,
  EyeOff,
  Search,
  SortAsc,
  SortDesc
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    type: "GOVT"
  });

  // Years for filter
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  // Fetch holidays
  const fetchHolidays = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Loading holidays...");
    
    try {
      const res = await api.get("/getAllHoliday");
      
      if (res.data.status === "success") {
        setHolidays(res.data.holidays || []);
        toast.dismiss(loadingToast);
        toast.success(`Loaded ${res.data.holidays?.length || 0} holidays`, {
          icon: '🎉',
          duration: 3000,
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.data.message || "Failed to load holidays");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error loading holidays");
      console.error("Fetch holidays error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new holiday
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    const loadingToast = toast.loading("Adding holiday...");
    
    try {
      const res = await api.post("/addHoliday", form);
      
      if (res.data.status === "success") {
        toast.dismiss(loadingToast);
        toast.success("Holiday added successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        setShowAddModal(false);
        setForm({ title: "", date: "", type: "GOVT" });
        fetchHolidays();
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.data.message || "Failed to add holiday");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      
      if (error.response?.status === 403) {
        toast.error("Only admin can create holidays");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Validation failed");
      } else {
        toast.error("Error adding holiday");
      }
      
      console.error("Add holiday error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Update holiday
  const handleUpdateHoliday = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    const loadingToast = toast.loading("Updating holiday...");
    
    try {
      const res = await api.put(`/editHoliday/${selectedHoliday._id}`, form);
      
      if (res.data.status === "success") {
        toast.dismiss(loadingToast);
        toast.success("Holiday updated successfully!", {
          icon: '✅',
          duration: 3000,
        });
        
        setShowEditModal(false);
        setSelectedHoliday(null);
        setForm({ title: "", date: "", type: "GOVT" });
        fetchHolidays();
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.data.message || "Failed to update holiday");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error updating holiday");
      console.error("Update holiday error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete holiday
  const handleDeleteHoliday = async () => {
    setFormLoading(true);
    
    const loadingToast = toast.loading("Deleting holiday...");
    
    try {
      const res = await api.delete(`/deleteHoliday/${selectedHoliday._id}`);
      
      if (res.data.status === "success") {
        toast.dismiss(loadingToast);
        toast.success("Holiday deleted successfully!", {
          icon: '🗑️',
          duration: 3000,
        });
        
        setShowDeleteModal(false);
        setSelectedHoliday(null);
        fetchHolidays();
      } else {
        toast.dismiss(loadingToast);
        toast.error(res.data.message || "Failed to delete holiday");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error deleting holiday");
      console.error("Delete holiday error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Edit holiday click
  const handleEditClick = (holiday) => {
    setSelectedHoliday(holiday);
    setForm({
      title: holiday.title,
      date: new Date(holiday.date).toISOString().split('T')[0],
      type: holiday.type
    });
    setShowEditModal(true);
  };

  // Delete holiday click
  const handleDeleteClick = (holiday) => {
    setSelectedHoliday(holiday);
    setShowDeleteModal(true);
  };

  // Filter holidays
  const filteredHolidays = holidays.filter(holiday => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      holiday.title.toLowerCase().includes(searchLower);
    
    const matchesYear = selectedYear === "all" || 
      new Date(holiday.date).getFullYear() === selectedYear;
    
    const matchesType = selectedType === "all" || holiday.type === selectedType;
    
    return matchesSearch && matchesYear && matchesType;
  });

  // Group holidays by month
  const holidaysByMonth = filteredHolidays.reduce((groups, holiday) => {
    const month = new Date(holiday.date).toLocaleString('default', { month: 'long' });
    if (!groups[month]) groups[month] = [];
    groups[month].push(holiday);
    return groups;
  }, {});

  // Get holiday stats
  const stats = {
    total: holidays.length,
    govt: holidays.filter(h => h.type === "GOVT").length,
    company: holidays.filter(h => h.type === "COMPANY").length,
    upcoming: holidays.filter(h => new Date(h.date) >= new Date()).length,
    past: holidays.filter(h => new Date(h.date) < new Date()).length
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get day name
  const getDayName = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get days until holiday
  const getDaysUntil = (dateString) => {
    const holidayDate = new Date(dateString);
    const today = new Date();
    const diffTime = holidayDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `${diffDays} days`;
  };

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Holiday</h2>
                  <p className="text-gray-500 text-sm mt-1">Add a new holiday to the calendar</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setForm({ title: "", date: "", type: "GOVT" });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holiday Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="E.g., Independence Day"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="GOVT">Government Holiday</option>
                  <option value="COMPANY">Company Holiday</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setForm({ title: "", date: "", type: "GOVT" });
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Add Holiday
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {showEditModal && selectedHoliday && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Holiday</h2>
                  <p className="text-gray-500 text-sm mt-1">Update holiday details</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedHoliday(null);
                    setForm({ title: "", date: "", type: "GOVT" });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holiday Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="GOVT">Government Holiday</option>
                  <option value="COMPANY">Company Holiday</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedHoliday(null);
                      setForm({ title: "", date: "", type: "GOVT" });
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit size={18} />
                        Update Holiday
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHoliday && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Holiday</h2>
                  <p className="text-gray-500 text-sm mt-1">This action cannot be undone</p>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedHoliday(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Are you sure?</h3>
                  <p className="text-sm text-gray-500">
                    You are about to delete "{selectedHoliday.title}"
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedHoliday(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteHoliday}
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Holiday
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Holiday Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and track all holidays for the organization</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchHolidays}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                Add Holiday
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Holidays</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1">All scheduled holidays</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Government</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.govt}</p>
                  <p className="text-xs text-blue-500 mt-1">National holidays</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Globe className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Company</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.company}</p>
                  <p className="text-xs text-green-500 mt-1">Internal holidays</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Building className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
                  <p className="text-xs text-yellow-500 mt-1">Future holidays</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Holidays List */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Holiday Calendar</h2>
                    <p className="text-gray-500 text-sm">
                      {filteredHolidays.length} of {holidays.length} holidays
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search holidays..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                      >
                        <option value="all">All Years</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
                      >
                        <option value="all">All Types</option>
                        <option value="GOVT">Government</option>
                        <option value="COMPANY">Company</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Holidays List */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading holidays...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
                  </div>
                </div>
              ) : filteredHolidays.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                      <CalendarDays className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No holidays found</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchTerm || selectedYear !== "all" || selectedType !== "all" 
                        ? 'Try adjusting your search or filters' 
                        : 'Start by adding your first holiday'}
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Add Holiday
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Object.entries(holidaysByMonth).map(([month, monthHolidays]) => (
                    <div key={month} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Calendar className="text-purple-600" size={20} />
                          {month} {selectedYear !== "all" ? selectedYear : ""}
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({monthHolidays.length} holidays)
                          </span>
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        {monthHolidays.map((holiday) => {
                          const isPast = new Date(holiday.date) < new Date();
                          const daysUntil = getDaysUntil(holiday.date);
                          
                          return (
                            <div 
                              key={holiday._id}
                              className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                                isPast 
                                  ? 'bg-gray-50 border-gray-200' 
                                  : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-100 hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                                  holiday.type === 'GOVT' 
                                    ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700' 
                                    : 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700'
                                }`}>
                                  <div className="text-sm font-bold">
                                    {new Date(holiday.date).getDate()}
                                  </div>
                                  <div className="text-xs">
                                    {new Date(holiday.date).toLocaleString('default', { month: 'short' })}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                      {holiday.title}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      holiday.type === 'GOVT' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {holiday.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={14} />
                                      {formatDate(holiday.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={14} />
                                      {getDayName(holiday.date)}
                                    </span>
                                    <span className={`font-medium ${
                                      daysUntil.includes('Today') || daysUntil.includes('Tomorrow')
                                        ? 'text-green-600'
                                        : daysUntil.includes('ago')
                                        ? 'text-gray-400'
                                        : 'text-blue-600'
                                    }`}>
                                      {daysUntil}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={() => handleEditClick(holiday)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Edit Holiday"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(holiday)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Delete Holiday"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Upcoming Holidays & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Holidays</h2>
                <p className="text-gray-500 text-sm mt-1">Next 3 holidays</p>
              </div>

              <div className="p-6">
                {filteredHolidays
                  .filter(h => new Date(h.date) >= new Date())
                  .slice(0, 3)
                  .map((holiday, index) => (
                    <div 
                      key={holiday._id}
                      className={`mb-4 p-4 rounded-xl border ${
                        index === 0
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            holiday.type === 'GOVT' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900">{holiday.title}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          holiday.type === 'GOVT' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {holiday.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{formatDate(holiday.date)}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{getDayName(holiday.date)}</span>
                        <span className="text-sm font-semibold text-purple-600">
                          {getDaysUntil(holiday.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                
                {filteredHolidays.filter(h => new Date(h.date) >= new Date()).length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PartyPopper className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-600">No upcoming holidays</p>
                    <p className="text-gray-400 text-sm mt-2">Add holidays to see them here</p>
                  </div>
                )}

                {/* Holiday Summary */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Holiday Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Holidays</span>
                      <span className="font-semibold text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Government</span>
                      <span className="font-semibold text-blue-600">{stats.govt}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Company</span>
                      <span className="font-semibold text-green-600">{stats.company}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Upcoming</span>
                      <span className="font-semibold text-purple-600">{stats.upcoming}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Past</span>
                      <span className="font-semibold text-gray-600">{stats.past}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Plus size={16} className="text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Add New Holiday</span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 rotate-270" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Download size={16} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Export Calendar</span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 rotate-270" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-300 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <CalendarDays size={16} className="text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">View Full Calendar</span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 rotate-270" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}