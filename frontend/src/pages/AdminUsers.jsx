import { useState, useEffect } from 'react';
import api from '../api';
import { UsersIcon, CheckCircleIcon, AlertCircleIcon, SettingsIcon, LockIcon, UnlockIcon, TrashIcon } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [userActivity, setUserActivity] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isSortByOpen, setIsSortByOpen] = useState(false);
  const [isSortOrderOpen, setIsSortOrderOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetchUsers();
  }, [searchTerm, sortBy, sortOrder]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users', {
        params: {
          search: searchTerm,
          sortBy,
          order: sortOrder
        }
      });
      setUsers(response.data.users);
      setSummary(response.data.summary);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.error || 'Failed to fetch users');
        console.error('Error fetching users:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/activity`);
      setUserActivity(response.data.activity);
      setShowActivityModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user activity');
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      setUpdatingUser(userId);
      await api.put(`/admin/users/${userId}`, { isActive });
      fetchUsers();
      setUpdatingUser(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
      setUpdatingUser(null);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const getActivityBadge = (status) => {
    const badges = {
      'active': { color: 'bg-green-100', textColor: 'text-green-800', label: 'Active Now' },
      'recently-active': { color: 'bg-blue-100', textColor: 'text-blue-800', label: 'Recently Active' },
      'active-today': { color: 'bg-yellow-100', textColor: 'text-yellow-800', label: 'Active Today' },
      'active-week': { color: 'bg-purple-100', textColor: 'text-purple-800', label: 'This Week' },
      'inactive': { color: 'bg-gray-100', textColor: 'text-gray-800', label: 'Inactive' },
      'never-active': { color: 'bg-gray-100', textColor: 'text-gray-600', label: 'Never Active' }
    };
    return badges[status] || badges.inactive;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
            CLIENT DIRECTORY &amp; PRIVILEGES
          </span>
          <h2 className="font-heading text-3xl font-bold text-[#222222]">User Management</h2>
        </div>
        {summary && (
          <div className="flex items-center gap-3 bg-[#FAF9F7] border border-gray-200 p-3 px-5 rounded-none text-xs font-body font-bold uppercase tracking-wider text-[#222222]">
            <span>Total Clients: <strong className="font-mono text-sm text-[#B59A6C]">{summary.totalUsers || summary.active + summary.inactive}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Active Today: <strong className="font-mono text-sm text-emerald-700">{summary.activeToday || summary.activeUsersToday || 0}</strong></span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-none text-rose-800 text-xs font-body font-semibold">
          Error: {error}
        </div>
      )}

      {/* Search and Framer Motion Custom Dropdown Bar */}
      <div className="bg-white border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-200 bg-[#FAF9F7] focus:outline-none focus:border-[#222222] text-xs text-[#222222] font-body transition-colors rounded-none w-full"
          />

          {/* Custom Framer Motion Sort By Dropdown */}
          <div className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setIsSortByOpen(!isSortByOpen);
                setIsSortOrderOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 bg-[#FAF9F7] text-xs font-body font-bold uppercase tracking-wider text-[#222222] text-left focus:outline-none cursor-pointer"
            >
              <span>{sortBy === 'createdAt' ? 'Sort: Signup Date' : sortBy === 'lastLogin' ? 'Sort: Last Login' : sortBy === 'name' ? 'Sort: Name' : 'Sort: Email'}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isSortByOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {isSortByOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                >
                  {[
                    { value: 'createdAt', label: 'Sort by Signup Date' },
                    { value: 'lastLogin', label: 'Sort by Last Login' },
                    { value: 'name', label: 'Sort by Name' },
                    { value: 'email', label: 'Sort by Email' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setSortBy(item.value);
                        setIsSortByOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${sortBy === item.value ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Framer Motion Sort Order Dropdown */}
          <div className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setIsSortOrderOpen(!isSortOrderOpen);
                setIsSortByOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 bg-[#FAF9F7] text-xs font-body font-bold uppercase tracking-wider text-[#222222] text-left focus:outline-none cursor-pointer"
            >
              <span>{sortOrder === 'desc' ? 'Order: Newest First' : 'Order: Oldest First'}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isSortOrderOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {isSortOrderOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                >
                  {[
                    { value: 'desc', label: 'Newest First' },
                    { value: 'asc', label: 'Oldest First' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setSortOrder(item.value);
                        setIsSortOrderOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${sortOrder === item.value ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <span className="font-body text-xs text-gray-500 uppercase tracking-wider">Loading user directory...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-gray-500 font-body text-sm">
            <p className="font-bold text-[#222222] uppercase tracking-wider">No users found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cream border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-heading text-dark uppercase tracking-wider">Patron ID</th>
                  <th className="px-6 py-4 text-sm font-heading text-dark uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-sm font-heading text-dark uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-sm font-heading text-dark uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-sm font-heading text-dark uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-heading text-dark uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-sm font-heading text-dark uppercase tracking-wider">Signup Date</th>
                  <th className="px-6 py-4 text-right text-sm font-heading text-dark uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const activityBadge = getActivityBadge(user.activityStatus);
                  return (
                    <motion.tr 
                      key={user._id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-[#B59A6C] bg-black/5 px-2.5 py-1 border border-[#B59A6C]/30">
                          {user.customUserId || `GLM-${user._id?.slice(-6).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-dark">{user.name}</div>
                        {user.role === 'admin' && (
                          <span className="inline-flex mt-2 px-2 py-1 bg-gold bg-opacity-10 text-gold text-xs font-semibold rounded-full items-center gap-1 w-fit">
                            <SettingsIcon size={12} /> Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-muted">{user.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${activityBadge.color} ${activityBadge.textColor}`}>
                          {activityBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {formatDate(user.signupDate)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => fetchUserActivity(user._id)}
                          className="px-3 py-1.5 text-xs inline-flex items-center gap-1 border border-gray-300 text-dark hover:border-gold hover:text-gold rounded-full transition-colors"
                        >
                          <SettingsIcon size={14} /> Activity
                        </button>
                        <button
                          onClick={() => updateUserStatus(user._id, !user.isActive)}
                          disabled={updatingUser === user._id}
                          className={`px-3 py-1.5 text-xs inline-flex items-center gap-1 border border-gray-300 hover:border-gold hover:text-gold rounded-full disabled:opacity-50 transition-colors ${user.isActive ? 'text-gray-600' : 'text-green-600'}`}
                        >
                          {user.isActive ? (
                            <><LockIcon size={14} /> Deactivate</>
                          ) : (
                            <><UnlockIcon size={14} /> Activate</>
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="px-3 py-1.5 text-xs inline-flex items-center gap-1 border border-gray-300 text-red-500 hover:border-red-600 hover:text-red-600 rounded-full transition-colors"
                        >
                          <TrashIcon size={14} /> Delete
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Modal */}
      {showActivityModal && userActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-cream px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-heading text-dark">User Activity Details</h2>
                  <p className="text-sm text-muted mt-1">Complete activity history and insights</p>
                </div>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-muted hover:text-dark rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
              {/* User Info Section */}
              <div className="bg-light rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-heading font-semibold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-1 font-medium">Full Name</p>
                    <p className="text-dark font-semibold">{userActivity.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-1 font-medium">Email Address</p>
                    <p className="text-dark font-medium text-sm break-all">{userActivity.email}</p>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div className="bg-light rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-heading font-semibold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  Registration Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm text-muted font-medium">Signup Date</span>
                    <span className="text-dark font-medium">{formatDate(userActivity.signupDate)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm text-muted font-medium">Registration IP</span>
                    <span className="text-dark font-mono text-sm bg-white px-3 py-1 rounded-full border border-gray-200">{userActivity.signupIp}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted font-medium">Signup Device</span>
                    <span className="text-dark text-xs text-right max-w-xs break-words">{userActivity.signupDevice}</span>
                  </div>
                </div>
              </div>

              {/* Login Activity */}
              <div className="bg-light rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-heading font-semibold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  Login Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm text-muted font-medium">Last Login</span>
                    <span className="text-dark font-medium">{userActivity.lastLogin ? formatDate(userActivity.lastLogin) : <span className="text-gold italic">Never</span>}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm text-muted font-medium">Last Login IP</span>
                    <span className="text-dark font-mono text-sm bg-white px-3 py-1 rounded-full border border-gray-200">{userActivity.lastLoginIp}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted font-medium">Last Login Device</span>
                    <span className="text-dark text-xs text-right max-w-xs break-words">{userActivity.lastLoginDevice}</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gold border-opacity-30 text-center shadow-soft">
                  <p className="text-xs text-gold uppercase tracking-wider mb-2 font-semibold">Total Logins</p>
                  <p className="text-4xl font-heading font-bold text-dark">{userActivity.totalLogins}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gold border-opacity-30 text-center shadow-soft">
                  <p className="text-xs text-gold uppercase tracking-wider mb-2 font-semibold">Member For</p>
                  <p className="text-4xl font-heading font-bold text-dark">{userActivity.daysSinceSignup}</p>
                  <p className="text-xs text-muted mt-1 font-medium">days</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-cream px-8 py-6 border-t border-gray-200">
              <button
                onClick={() => setShowActivityModal(false)}
                className="w-full btn-primary bg-gold text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all shadow-soft"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
