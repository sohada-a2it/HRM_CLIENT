"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Clock, Users, Search, Filter, UserCheck, 
  X, RefreshCw, Loader2, ShieldCheck, Crown,
  User, UserPlus, RotateCcw, Edit, History,
  ArrowLeft, CalendarDays, Building, Check,
  Eye, BarChart3, Plus, Database, CheckCircle,
  AlertCircle
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// ====================== HELPER FUNCTIONS ======================
const getRoleBadgeColor = (role) => {
  switch(role) {
    case 'admin':
    case 'superAdmin':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'moderator':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'employee':
      return 'bg-green-100 text-green-800 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

const getRoleIcon = (role) => {
  switch(role) {
    case 'admin':
    case 'superAdmin':
      return <Crown className="inline mr-1" size={12} />;
    case 'moderator':
      return <ShieldCheck className="inline mr-1" size={12} />;
    case 'employee':
      return <User className="inline mr-1" size={12} />;
    default:
      return <User className="inline mr-1" size={12} />;
  }
};

// ====================== COMPONENT 1: Update/Edit Shift Modal ======================
function UpdateShiftModal({ isOpen, onClose, user, onUpdate, loading }) {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
    shiftType: 'regular',
    makeDefault: false
  });

  useEffect(() => {
    if (user && isOpen) {
      // Get current shift data from user
      let currentStart = '09:00';
      let currentEnd = '18:00';
      
      // Check assignedShift first
      if (user.shiftTiming?.assignedShift?.isActive) {
        currentStart = user.shiftTiming.assignedShift.start;
        currentEnd = user.shiftTiming.assignedShift.end;
      } 
      // Check currentShift
      else if (user.shiftTiming?.currentShift?.isActive) {
        currentStart = user.shiftTiming.currentShift.start;
        currentEnd = user.shiftTiming.currentShift.end;
      } 
      // Check defaultShift
      else if (user.shiftTiming?.defaultShift) {
        currentStart = user.shiftTiming.defaultShift.start;
        currentEnd = user.shiftTiming.defaultShift.end;
      }
      
      console.log('Setting form data for modal:', {
        userName: `${user.firstName} ${user.lastName}`,
        currentStart,
        currentEnd,
        shiftTiming: user.shiftTiming
      });
      
      setFormData({
        startTime: currentStart,
        endTime: currentEnd,
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: '',
        shiftType: 'regular',
        makeDefault: false
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate times
    if (!formData.startTime || !formData.endTime) {
      toast.error('Start time and end time are required');
      return;
    }
    
    // Validate start time is before end time
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    
    if (start >= end) {
      toast.error('Start time must be before end time');
      return;
    }
    
    onUpdate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Update Shift for {user?.firstName} {user?.lastName}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Employee ID: {user?.employeeId}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective Date *
            </label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift Type
            </label>
            <select
              value={formData.shiftType}
              onChange={(e) => setFormData({...formData, shiftType: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="regular">Regular</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="2"
              placeholder="Reason for updating shift..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="makeDefault"
              checked={formData.makeDefault}
              onChange={(e) => setFormData({...formData, makeDefault: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="makeDefault" className="text-sm text-gray-700">
              Make this the default shift for this user
            </label>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Update Shift
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====================== COMPONENT 2: Assign Shift Modal ======================
function AssignShiftModal({ isOpen, onClose, users, shift, onAssign, loading, currentUserRole }) {
  const [formData, setFormData] = useState({
    userId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
    makeDefault: false
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: '',
        makeDefault: false
      });
      setSelectedUser(null);
      setSearchUser('');
      setFilterRole('all');
    }
  }, [isOpen]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData({...formData, userId: user._id});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.userId) {
      toast.error('Please select a user');
      return;
    }
    onAssign(formData);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchUser || 
        user.firstName?.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchUser.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchUser, filterRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Shift</h2>
              <p className="text-sm text-gray-600 mt-1">
                {shift?.startTime} - {shift?.endTime}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex h-[calc(90vh-180px)]">
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterRole('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filterRole === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setFilterRole('employee')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filterRole === 'employee' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  Employees
                </button>
                <button
                  onClick={() => setFilterRole('admin')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filterRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  Admins
                </button>
                <button
                  onClick={() => setFilterRole('moderator')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filterRole === 'moderator' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  Moderators
                </button>
              </div>
              
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedUser?._id === user._id 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        user.role === 'moderator' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{user.department} • {user.employeeId || 'No ID'}</p>
                        <p className="text-xs text-gray-500">
                          Current: {user.currentShiftDisplay || 'Default Shift'}
                        </p>
                      </div>
                      {selectedUser?._id === user._id && (
                        <Check className="text-green-500" size={18} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-1/2 p-6">
            {selectedUser ? (
              <>
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Selected User</h3>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        selectedUser.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        selectedUser.role === 'moderator' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}>
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                            {getRoleIcon(selectedUser.role)}
                            {selectedUser.role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedUser.department} • {selectedUser.employeeId || 'No ID'}
                        </p>
                        // AssignShiftModal-এর মধ্যে selected user display-এও একই logic apply করুন
<p className="text-xs text-gray-500 mt-1">
  <span className="font-medium">Current Shift:</span> 
  {(() => {
    const shiftTiming = selectedUser.shiftTiming || {};
    const today = new Date().toISOString().split('T')[0];
    
    const todaysActiveShift = shiftTiming.currentShift?.isActive && 
                              shiftTiming.currentShift.effectiveDate === today 
                              ? shiftTiming.currentShift 
                              : null;
    
    const todaysShiftFromHistory = shiftTiming.shiftHistory?.find(shift => 
      shift.effectiveDate === today
    );
    
    const activeShift = todaysActiveShift || todaysShiftFromHistory;
    
    if (activeShift) {
      return `${activeShift.start || activeShift.startTime} - ${activeShift.end || activeShift.endTime} (Active)`;
    }
    
    return shiftTiming.assignedShift?.start && shiftTiming.assignedShift?.end 
      ? `${shiftTiming.assignedShift.start} - ${shiftTiming.assignedShift.end}`
      : 'Default Shift';
  })()}
</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shift Timing
                    </label>
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-700">
                          {shift?.startTime} - {shift?.endTime}
                        </div>
                        <div className="text-sm text-green-600">New Shift Timing</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effective Date *
                    </label>
                    <input
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows="2"
                      placeholder="Reason for assigning this shift..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="makeDefault"
                      checked={formData.makeDefault}
                      onChange={(e) => setFormData({...formData, makeDefault: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="makeDefault" className="text-sm text-gray-700">
                      Make this the default shift for this user
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          Assign Shift
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <User className="text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a User</h3>
                <p className="text-gray-500">Choose a user from the list to assign this shift</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================== COMPONENT 3: Shift History Modal ======================
function ShiftHistoryModal({ isOpen, onClose, user, history }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shift History</h2>
              <p className="text-sm text-gray-600 mt-1">
                {user?.name || `${user?.firstName} ${user?.lastName}`} • {user?.employeeId || user?.email}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        record.reason?.includes('Assigned') ? 'bg-green-100 text-green-800' :
                        record.reason?.includes('Updated') ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <Clock size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {record.start || record.startTime} - {record.end || record.endTime}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {record.assignedAt ? new Date(record.assignedAt).toLocaleDateString() : 'No date'} • 
                          {record.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                    {record.effectiveDate && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Effective: {new Date(record.effectiveDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {record.assignedByUser && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={12} />
                      <span>Assigned by: {record.assignedByUser.firstName} {record.assignedByUser.lastName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="text-gray-300 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Shift History</h3>
              <p className="text-gray-500">This user doesn't have any shift history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================== MAIN COMPONENT ======================
export default function page() {
  const [viewMode, setViewMode] = useState('overview');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  const router = useRouter();

  // Improved getCurrentShiftInfo function
// Enhanced getCurrentShiftInfo function with better debugging
const getCurrentShiftInfo = (user) => {
  if (!user) return { 
    display: 'N/A', 
    isActive: false, 
    start: '09:00', 
    end: '18:00' 
  };
  
  console.log('🔍 Parsing shift for user:', user.firstName);
  
  // Check multiple sources for shift data
  const shiftTiming = user.shiftTiming || {};
  
  // Priority 1: Check assignedShift with explicit isActive check
  if (shiftTiming.assignedShift && shiftTiming.assignedShift.isActive === true) {
    console.log('✅ Using assignedShift for', user.firstName);
    return {
      display: `${shiftTiming.assignedShift.start || '09:00'} - ${shiftTiming.assignedShift.end || '18:00'}`,
      isActive: true,
      start: shiftTiming.assignedShift.start,
      end: shiftTiming.assignedShift.end,
      effectiveDate: shiftTiming.assignedShift.effectiveDate,
      assignedAt: shiftTiming.assignedShift.assignedAt,
      type: 'assigned'
    };
  }
  
  // Priority 2: Check currentShift
  if (shiftTiming.currentShift && shiftTiming.currentShift.isActive === true) {
    console.log('✅ Using currentShift for', user.firstName);
    return {
      display: `${shiftTiming.currentShift.start || '09:00'} - ${shiftTiming.currentShift.end || '18:00'}`,
      isActive: true,
      start: shiftTiming.currentShift.start,
      end: shiftTiming.currentShift.end,
      effectiveDate: shiftTiming.currentShift.effectiveDate,
      type: 'current'
    };
  }
  
  // Priority 3: Check if there's any history with today's date
  const today = new Date().toISOString().split('T')[0];
  if (shiftTiming.shiftHistory && shiftTiming.shiftHistory.length > 0) {
    const latestShift = shiftTiming.shiftHistory[0];
    if (latestShift.effectiveDate && 
        new Date(latestShift.effectiveDate).toISOString().split('T')[0] === today) {
      console.log('✅ Using today\'s shift from history for', user.firstName);
      return {
        display: `${latestShift.start || latestShift.startTime || '09:00'} - ${latestShift.end || latestShift.endTime || '18:00'}`,
        isActive: true,
        start: latestShift.start || latestShift.startTime,
        end: latestShift.end || latestShift.endTime,
        effectiveDate: latestShift.effectiveDate,
        type: 'history'
      };
    }
  }
  
  // Priority 4: Use defaultShift
  console.log('ℹ️ Using defaultShift for', user.firstName);
  return {
    display: `${shiftTiming.defaultShift?.start || '09:00'} - ${shiftTiming.defaultShift?.end || '18:00'}`,
    isActive: false,
    start: shiftTiming.defaultShift?.start || '09:00',
    end: shiftTiming.defaultShift?.end || '18:00',
    type: 'default'
  };
};

  // Initialize token and role from localStorage
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const employeeToken = localStorage.getItem('employeeToken');
    const moderatorToken = localStorage.getItem('moderatorToken');
    const userToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('userRole');
    
    // Priority: Unified token first
    if (userToken) {
      setToken(userToken);
      setUserId(storedUserId || '');
      setUserRole(storedUserRole || 'employee');
    } 
    // Fallback to role-specific tokens
    else if (adminToken) {
      setToken(adminToken);
      setUserRole('admin');
    } else if (moderatorToken) {
      setToken(moderatorToken);
      setUserRole('moderator');
    } else if (employeeToken) {
      setToken(employeeToken);
      setUserRole('employee');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Enhanced fetchAllData function
  const fetchAllData = async () => {
    if (!token) return;
    
    setLoading(true);
    
    try {
      // Setup axios with current token
      const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let allUsers = [];
      
      if (userRole === 'admin' || userRole === 'superAdmin' || userRole === 'moderator') {
        // Admin/Moderator can see all users
        const usersRes = await axiosInstance.get('/admin/getAll-user');
        
        if (usersRes.data.success) {
          allUsers = usersRes.data.users || [];
          console.log('✅ Fetched users:', allUsers.length);
          
          // Log first user's shift structure for debugging
          if (allUsers.length > 0) {
            const firstUser = allUsers[0];
            console.log('First user shift structure:', {
              name: `${firstUser.firstName} ${firstUser.lastName}`,
              shiftTiming: firstUser.shiftTiming,
              parsed: getCurrentShiftInfo(firstUser)
            });
          }
        } else {
          toast.error('Failed to fetch users');
        }
      } else {
        // Employee can only see their own data
        const profileRes = await axiosInstance.get('/users/getProfile');
        
        if (profileRes.data.success) {
          allUsers = [profileRes.data.user];
          setUserId(profileRes.data.user._id);
        }
      }
      
      // Transform and prepare users with shift info
      const transformedUsers = allUsers.map(user => {
        const shiftInfo = getCurrentShiftInfo(user);
        
        return {
          ...user,
          currentShiftDisplay: shiftInfo.display,
          shiftInfo: shiftInfo
        };
      });
      
      console.log('Setting users with transformed data:', transformedUsers.length);
      setUsers(transformedUsers);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          setTimeout(() => router.push('/login'), 2000);
        } else if (error.response.status === 403) {
          toast.error('Access denied. You do not have permission.');
        } else {
          toast.error(error.response.data?.message || 'Failed to load data');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle shift update 
// Handle shift update with proper optimistic update
const handleShiftUpdate = async (formData) => {
  if (!selectedUser) return;
  
  setLoading(true);
  try {
    console.log('📝 Updating shift for user:', selectedUser._id);
    console.log('Update data:', formData);
    
    // Create axios instance with token
    const axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Optimistic update: Update UI immediately
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user._id === selectedUser._id) {
          // Create updated user object with new shift
          const updatedUser = {
            ...user,
            shiftTiming: {
              // Keep existing structure
              ...user.shiftTiming,
              // Force update assignedShift with isActive: true
              assignedShift: {
                name: formData.shiftType === 'morning' ? 'Morning Shift' : 
                      formData.shiftType === 'evening' ? 'Evening Shift' : 
                      formData.shiftType === 'night' ? 'Night Shift' : 'Regular Shift',
                start: formData.startTime,
                end: formData.endTime,
                lateThreshold: 5,
                earlyThreshold: -1,
                autoClockOutDelay: 10,
                assignedBy: userId, // Use actual admin ID
                assignedAt: new Date().toISOString(),
                effectiveDate: formData.effectiveDate,
                isActive: true // THIS IS CRITICAL
              },
              // Also update currentShift
              currentShift: {
                start: formData.startTime,
                end: formData.endTime,
                effectiveDate: formData.effectiveDate,
                isActive: true
              },
              // Add to shiftHistory
              shiftHistory: [
                {
                  name: formData.shiftType === 'morning' ? 'Morning Shift' : 
                        formData.shiftType === 'evening' ? 'Evening Shift' : 
                        formData.shiftType === 'night' ? 'Night Shift' : 'Regular Shift',
                  start: formData.startTime,
                  end: formData.endTime,
                  lateThreshold: 5,
                  earlyThreshold: -1,
                  autoClockOutDelay: 10,
                  assignedBy: userId,
                  assignedAt: new Date().toISOString(),
                  effectiveDate: formData.effectiveDate,
                  reason: formData.reason || 'Shift updated by admin',
                  isActive: true
                },
                ...(user.shiftTiming?.shiftHistory || [])
              ],
              // Update defaultShift if requested
              ...(formData.makeDefault && {
                defaultShift: {
                  ...user.shiftTiming?.defaultShift,
                  start: formData.startTime,
                  end: formData.endTime
                }
              })
            },
            // Update display info
            currentShiftDisplay: `${formData.startTime} - ${formData.endTime}`,
            shiftInfo: {
              display: `${formData.startTime} - ${formData.endTime}`,
              isActive: true,
              start: formData.startTime,
              end: formData.endTime,
              effectiveDate: formData.effectiveDate,
              type: 'assigned'
            }
          };
          
          console.log('🔄 Optimistic update applied to:', updatedUser.firstName);
          console.log('New assignedShift:', updatedUser.shiftTiming.assignedShift);
          return updatedUser;
        }
        return user;
      })
    );
    
    // Now make the API call
    const response = await axiosInstance.put(`/employee/${selectedUser._id}/shift`, {
      startTime: formData.startTime,
      endTime: formData.endTime,
      effectiveDate: formData.effectiveDate,
      reason: formData.reason || 'Shift updated by admin',
      shiftType: formData.shiftType,
      makeDefault: formData.makeDefault
    });
    
    console.log('✅ API Update response:', response.data);
    
    if (response.data.success) {
      toast.success('✅ Shift updated successfully!');
      
      // Update with actual API response data
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user._id === selectedUser._id) {
            return {
              ...user,
              shiftTiming: response.data.employee.shiftTiming || user.shiftTiming,
              currentShiftDisplay: `${formData.startTime} - ${formData.endTime}`,
              shiftInfo: {
                display: `${formData.startTime} - ${formData.endTime}`,
                isActive: true,
                start: formData.startTime,
                end: formData.endTime,
                effectiveDate: formData.effectiveDate,
                type: 'assigned'
              }
            };
          }
          return user;
        })
      );
      
      setShowUpdateModal(false);
      setSelectedUser(null);
      
    } else {
      toast.error(response.data.message || 'Failed to update shift');
      
      // Revert optimistic update on error
      setTimeout(() => {
        fetchAllData();
        toast.info('Reverting to previous data...');
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Update shift error:', error);
    
    if (error.response) {
      if (error.response.status === 403) {
        toast.error('Access denied. Admin only.');
      } else if (error.response.status === 404) {
        toast.error('User not found');
      } else {
        toast.error(error.response.data?.message || 'Failed to update shift');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    // Revert optimistic update on error
    setTimeout(() => {
      fetchAllData();
      toast.info('Reverting to previous data due to error...');
    }, 1000);
  } finally {
    setLoading(false);
  }
};

  // Handle shift assignment
  const handleShiftAssign = async (formData) => {
    setLoading(true);
    try {
      console.log('📝 Assigning shift to user:', formData.userId);
      console.log('Assign data:', formData);
      
      const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const response = await axiosInstance.put(`/employee/${formData.userId}/shift`, {
        startTime: selectedShift.startTime,
        endTime: selectedShift.endTime,
        effectiveDate: formData.effectiveDate,
        reason: formData.reason || 'Shift assigned by admin',
        shiftType: 'regular',
        makeDefault: formData.makeDefault
      });
      
      console.log('✅ Assign response:', response.data);
      
      if (response.data.success) {
        toast.success('✅ Shift assigned successfully!');
        
        // OPTIMISTIC UPDATE
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === formData.userId) {
              const updatedUser = {
                ...user,
                shiftTiming: {
                  ...user.shiftTiming,
                  assignedShift: {
                    name: 'Assigned Shift',
                    start: selectedShift.startTime,
                    end: selectedShift.endTime,
                    assignedBy: userId,
                    assignedAt: new Date().toISOString(),
                    effectiveDate: formData.effectiveDate,
                    isActive: true
                  },
                  currentShift: {
                    start: selectedShift.startTime,
                    end: selectedShift.endTime,
                    effectiveDate: formData.effectiveDate,
                    isActive: true
                  },
                  shiftHistory: [
                    {
                      name: 'Assigned Shift',
                      start: selectedShift.startTime,
                      end: selectedShift.endTime,
                      assignedBy: userId,
                      assignedAt: new Date().toISOString(),
                      effectiveDate: formData.effectiveDate,
                      reason: formData.reason || 'Shift assigned by admin'
                    },
                    ...(user.shiftTiming?.shiftHistory || [])
                  ],
                  ...(formData.makeDefault && {
                    defaultShift: {
                      start: selectedShift.startTime,
                      end: selectedShift.endTime
                    }
                  })
                },
                currentShiftDisplay: `${selectedShift.startTime} - ${selectedShift.endTime}`,
                shiftInfo: {
                  display: `${selectedShift.startTime} - ${selectedShift.endTime}`,
                  isActive: true,
                  start: selectedShift.startTime,
                  end: selectedShift.endTime,
                  effectiveDate: formData.effectiveDate
                }
              };
              
              console.log('🔄 Optimistic assignment applied to:', updatedUser.firstName);
              return updatedUser;
            }
            return user;
          })
        );
        
        setShowAssignModal(false);
        setSelectedShift(null);
        
        // Refetch fresh data
        setTimeout(() => {
          fetchAllData();
        }, 1000);
        
      } else {
        toast.error(response.data.message || 'Failed to assign shift');
      }
    } catch (error) {
      console.error('❌ Assign shift error:', error);
      
      if (error.response) {
        if (error.response.status === 403) {
          toast.error('Access denied. Admin only.');
        } else if (error.response.status === 404) {
          toast.error('Employee not found');
        } else {
          toast.error(error.response.data?.message || 'Failed to assign shift');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch shift history function
  // Fix the shift history function - userId undefined problem
const fetchShiftHistory = async (userId) => {
  // Check if userId is valid
  if (!userId || userId === 'undefined') {
    toast.error('Invalid user ID');
    return;
  }

  try {
    const axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Fetching shift history for userId:', userId);
    
    // Try to find the user first
    const user = users.find(u => u._id === userId);
    if (!user) {
      toast.error('User not found in local data');
      return;
    }
    
    // Use employeeId if available, otherwise use userId
    const identifier = user.employeeId || userId;
    
    const response = await axiosInstance.get(`/admin/shift-history/${identifier}`);
    
    if (response.data.success) {
      setShiftHistory(response.data.shiftHistory || []);
      setSelectedUser(response.data.employee || user);
      setShowHistoryModal(true);
    } else {
      toast.error(response.data.message || 'Failed to load history');
    }
  } catch (error) {
    console.error('Fetch history error:', error);
    
    // Fallback: Show local history
    const user = users.find(u => u._id === userId);
    if (user?.shiftTiming?.shiftHistory) {
      setShiftHistory(user.shiftTiming.shiftHistory);
      setSelectedUser(user);
      setShowHistoryModal(true);
      toast.success('Loaded local shift history');
    } else {
      toast.error('No shift history available');
    }
  }
};

  // Handle shift reset
const handleShiftReset = async (userId) => {
  // Find the user
  const user = users.find(u => u._id === userId);
  if (!user) {
    toast.error('User not found');
    return;
  }

  if (!confirm(`Are you sure you want to reset ${user.firstName}'s shift to default?`)) return;
  
  setLoading(true);
  try {
    const axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Use employeeId if available, otherwise use userId
    const identifier = user.employeeId || user._id;
    
    console.log('🔄 Resetting shift:', {
      userId: user._id,
      employeeId: user.employeeId,
      identifier,
      name: user.firstName
    });
    
    const response = await axiosInstance.post(`/admin/reset-shift/${identifier}`, {
      reason: 'Shift reset by admin'
    });
    
    console.log('✅ Reset response:', response.data);
    
    if (response.data.success) {
      toast.success(`✅ ${user.firstName}'s shift reset to default!`);
      
      // Update UI with response data
      const resetUser = response.data.user;
      
      // OPTIMISTIC UPDATE
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u._id === userId) {
            const defaultShift = resetUser.shiftTiming?.defaultShift || 
                                { start: '09:00', end: '18:00' };
            
            const updatedUser = {
              ...u,
              shiftTiming: {
                ...u.shiftTiming,
                // Clear assigned shift
                assignedShift: null,
                // Reset to default
                currentShift: {
                  start: defaultShift.start,
                  end: defaultShift.end,
                  isActive: false,
                  type: 'default'
                },
                // Ensure defaultShift exists
                defaultShift: defaultShift,
                // Update history
                shiftHistory: resetUser.shiftTiming?.shiftHistory || 
                            u.shiftTiming?.shiftHistory || []
              },
              // Update display
              currentShiftDisplay: `${defaultShift.start} - ${defaultShift.end}`,
              shiftInfo: {
                display: `${defaultShift.start} - ${defaultShift.end}`,
                isActive: false,
                start: defaultShift.start,
                end: defaultShift.end,
                type: 'default'
              }
            };
            
            console.log('🔄 Updated user:', updatedUser.firstName, updatedUser.currentShiftDisplay);
            return updatedUser;
          }
          return u;
        })
      );
      
    } else {
      toast.error(response.data.message || 'Failed to reset shift');
    }
  } catch (error) {
    console.error('❌ Reset shift error:', error);
    
    // Detailed error handling
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Bad request');
          break;
        case 401:
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          router.push('/login');
          break;
        case 403:
          toast.error('Access denied. Admin only.');
          break;
        case 404:
          toast.error(`User not found: ${user.employeeId || user._id}`);
          break;
        case 500:
          toast.error('Server error: ' + (data.message || 'Please try again later.'));
          console.error('Server error details:', data);
          break;
        default:
          toast.error(data?.message || 'Failed to reset shift');
      }
    } else if (error.request) {
      toast.error('No response from server. Check your connection.');
    } else {
      toast.error('Request error: ' + error.message);
    }
    
    // Even if API fails, update UI locally (use toast.success, not toast.info)
    toast.success('Updating UI locally...');
    setUsers(prev => prev.map(u => 
      u._id === userId ? {
        ...u,
        shiftTiming: {
          ...u.shiftTiming,
          assignedShift: null,
          currentShift: {
            start: '09:00',
            end: '18:00',
            isActive: false
          }
        },
        currentShiftDisplay: '09:00 - 18:00',
        shiftInfo: { 
          display: '09:00 - 18:00', 
          isActive: false,
          start: '09:00',
          end: '18:00'
        }
      } : u
    ));
  } finally {
    setLoading(false);
  }
};

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesDept = filterDepartment === 'all' || 
        (user.department && user.department.toLowerCase() === filterDepartment.toLowerCase());
      
      return matchesSearch && matchesRole && matchesDept;
    });
  }, [users, searchTerm, filterRole, filterDepartment]);

  // Get unique departments and roles
  const uniqueDepartments = useMemo(() => {
    const depts = [...new Set(users.map(user => user.department).filter(Boolean))];
    return depts;
  }, [users]);

  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(users.map(user => user.role).filter(Boolean))];
    return roles;
  }, [users]);

  // Calculate statistics
  const calculatedStats = useMemo(() => {
    const totalUsers = users.length;
    const withAssignedShifts = users.filter(user => 
      user.shiftInfo?.isActive
    ).length;
    const onDefaultShift = totalUsers - withAssignedShifts;
    
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    return {
      totalUsers,
      usersWithAssignedShifts: withAssignedShifts,
      usersOnDefaultShift: onDefaultShift,
      roleCounts
    };
  }, [users]);

  // Force refresh function
  const forceRefresh = async () => {
    setLoading(true);
    try {
      await fetchAllData();
      toast.success('✅ Data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (token && userRole) {
      fetchAllData();
    }
  }, [token, userRole]);

  // Employee View
  if (userRole === 'employee') {
    const currentUser = users.find(u => u._id === userId) || users[0] || {};
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <Toaster position="top-right" />
        
        <ShiftHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          user={selectedUser}
          history={shiftHistory}
        />

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Shift Schedule
                </h1>
                <p className="text-gray-600 mt-1">View your current shift timing</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Current Shift</h2>
                    <p className="text-sm text-gray-600">Your active working schedule</p>
                  </div>
                </div>
                <button
                  onClick={() => fetchShiftHistory(currentUser._id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <History size={14} />
                  View History
                </button>
              </div>
            </div>
             
<div className="p-6">
  {loading ? (
    <div className="text-center py-8">
      <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
      <p className="text-gray-500 mt-2">Loading your shift...</p>
    </div>
  ) : currentUser.shiftInfo?.isActive ? (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-gray-900">Assigned Shift</h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              ACTIVE
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Time:</span> {currentUser.shiftInfo.display}
                </span>
              </div>
              {currentUser.shiftInfo.effectiveDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">Effective:</span> {new Date(currentUser.shiftInfo.effectiveDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building size={14} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Department:</span> {currentUser.department || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Employee ID:</span> {currentUser.employeeId || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:text-right">
          <div className="text-2xl font-bold text-blue-600">
            {currentUser.shiftInfo.start} - {currentUser.shiftInfo.end}
          </div>
          <div className="text-sm text-gray-600 mt-1">Working Hours</div>
          {currentUser.shiftInfo.effectiveDate && (
            <div className="text-xs text-gray-500">
              Since: {new Date(currentUser.shiftInfo.effectiveDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="text-gray-400" size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Default Shift Timing</h3>
      <p className="text-gray-500">You are currently on the company default shift</p>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Default Timing:</span> {currentUser.shiftInfo?.display || '09:00 - 18:00'}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Contact admin to request a custom shift
        </p>
      </div>
    </div>
  )}
</div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Toaster position="top-right" />
      
      <UpdateShiftModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdate={handleShiftUpdate}
        loading={loading}
      />
      
      <AssignShiftModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedShift(null);
        }}
        users={users}
        shift={selectedShift}
        onAssign={handleShiftAssign}
        loading={loading}
        currentUserRole={userRole}
      />
      
      <ShiftHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        user={selectedUser}
        history={shiftHistory}
      />

      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Shift Management (Admin)
              </h1>
              <p className="text-gray-600 mt-1">Manage all user shift schedules and assignments</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor('admin')}`}>
                  <Crown className="inline mr-1" size={10} />
                  Admin Access
                </span>
                <span className="text-xs text-gray-500">
                  Total Users: {users.length} • Active Shifts: {calculatedStats.usersWithAssignedShifts}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={forceRefresh}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="text-xl font-bold text-gray-900">{calculatedStats.totalUsers}</p>
                </div>
                <Database className="text-blue-500" size={20} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Assigned Shifts</p>
                  <p className="text-xl font-bold text-gray-900">{calculatedStats.usersWithAssignedShifts}</p>
                </div>
                <UserCheck className="text-green-500" size={20} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Default Shifts</p>
                  <p className="text-xl font-bold text-gray-900">{calculatedStats.usersOnDefaultShift}</p>
                </div>
                <Clock className="text-purple-500" size={20} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">My Role</p>
                  <p className="text-sm font-bold text-gray-900 truncate">Administrator</p>
                </div>
                <Crown className="text-orange-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex space-x-1 px-6">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    viewMode === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Users
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                  <p className="text-gray-500 mt-2">Loading data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users by name, email, or ID..."
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">All Roles</option>
                        {uniqueRoles.map(role => (
                          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                        ))}
                      </select>
                      
                      <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">All Departments</option>
                        {uniqueDepartments.map(dept => (
                          <option key={dept} value={dept.toLowerCase()}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">User</th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Role</th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Department</th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Current Shift</th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Status</th>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                    user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                    user.role === 'moderator' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                    'bg-gradient-to-r from-green-500 to-emerald-500'
                                  }`}>
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {user.employeeId || 'No ID'} • {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                  {getRoleIcon(user.role)}
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="text-gray-700">{user.department || 'N/A'}</div>
                              </td> 
<td className="p-3">
  <div className="font-medium">
    {(() => {
      const today = new Date().toISOString().split('T')[0];
      const shiftTiming = user.shiftTiming || {};
      
      // Check for today's active shift
      const todaysActiveShift = shiftTiming.currentShift?.isActive && 
                                shiftTiming.currentShift.effectiveDate === today 
                                ? shiftTiming.currentShift 
                                : null;
      
      // Check shift history for today
      const todaysShiftFromHistory = shiftTiming.shiftHistory?.find(shift => 
        shift.effectiveDate === today
      );
      
      // Use whichever is available
      const activeShift = todaysActiveShift || todaysShiftFromHistory;
      
      if (activeShift) {
        return (
          <div>
            <div className="text-gray-900 font-semibold">
              {activeShift.start || activeShift.startTime} - {activeShift.end || activeShift.endTime}
            </div>
            <div className="text-xs text-green-600 font-medium">
              ✓ Active Shift
            </div>
            {activeShift.effectiveDate && (
              <div className="text-xs text-gray-500">
                Effective: {new Date(activeShift.effectiveDate).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      }
      
      // Check for assigned shift (for other days)
      if (shiftTiming.assignedShift && shiftTiming.assignedShift.start) {
        return (
          <div>
            <div className="text-gray-900">
              {shiftTiming.assignedShift.start} - {shiftTiming.assignedShift.end}
            </div>
            <div className="text-xs text-blue-600 font-medium">
              Assigned Shift
            </div>
            {shiftTiming.assignedShift.effectiveDate && (
              <div className="text-xs text-gray-500">
                Effective: {new Date(shiftTiming.assignedShift.effectiveDate).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      }
      
      // Default shift
      return (
        <div>
          <div className="text-gray-700">
            {shiftTiming.defaultShift?.start || '09:00'} - {shiftTiming.defaultShift?.end || '18:00'}
          </div>
          <div className="text-xs text-gray-500">Default Shift</div>
        </div>
      );
    })()}
  </div>
</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      const shiftInfo = user.shiftInfo || {
                                        start: user.shiftTiming?.defaultShift?.start || '09:00',
                                        end: user.shiftTiming?.defaultShift?.end || '18:00'
                                      };
                                      setSelectedShift({
                                        _id: user._id,
                                        startTime: shiftInfo.start,
                                        endTime: shiftInfo.end
                                      });
                                      setShowAssignModal(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Assign New Shift"
                                  >
                                    <UserPlus size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUpdateModal(true);
                                    }}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Update Current Shift"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => fetchShiftHistory(user._id)}
                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="View History"
                                  >
                                    <History size={14} />
                                  </button>
                                  {/* <button
                                    onClick={() => handleShiftReset(user._id)}
                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Reset to Default"
                                    disabled={!user.shiftInfo?.isActive}
                                  >
                                    <RotateCcw size={14} className={!user.shiftInfo?.isActive ? 'opacity-30' : ''} />
                                  </button> */}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-8 text-center">
                              <div className="text-gray-500">No users found</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Debug panel for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Debug Information</h3>
                <button
                  onClick={() => {
                    console.log('All Users:', users);
                    console.log('First User Shift Structure:', users[0]?.shiftTiming);
                    toast.success('Check console for debug info');
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  Log Data
                </button>
              </div>
              <div className="text-sm space-y-1">
                <div>Total Users: {users.length}</div>
                <div>Token Present: {token ? '✅' : '❌'}</div>
                <div>User Role: {userRole}</div>
                <div>API Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}