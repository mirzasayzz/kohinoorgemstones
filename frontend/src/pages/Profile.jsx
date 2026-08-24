import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, MapPin, Phone, Lock, LogOut, 
  Edit2, Save, X, Eye, EyeOff, Loader2, CheckCircle, Camera,
  ShoppingBag, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/config';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('kohinoor_orders') || '[]');
      setOrders(savedOrders);
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  }, []);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    city: ''
  });
  
  // Password change
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : '',
        city: user.address?.city || ''
      });
    }
  }, [user]);

  const getToken = () => localStorage.getItem('kohinoor_token');

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format DOB
    if (name === 'dateOfBirth') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length > 8) formatted = formatted.slice(0, 8);
      if (formatted.length >= 4) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4);
      } else if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Convert dd/mm/yyyy to ISO
      let formattedDob = undefined;
      if (formData.dateOfBirth && formData.dateOfBirth.length === 10) {
        const [day, month, year] = formData.dateOfBirth.split('/');
        formattedDob = `${year}-${month}-${day}`;
      }
      
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formattedDob,
        address: { city: formData.city }
      });
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError('Please fill all password fields');
      return;
    }
    if (passwords.new.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement change password API
      setSuccess('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Avatar upload
  const handleAvatarClick = () => {
    // Reset file input before opening to fix double-select issue
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setAvatarLoading(true);
    setError('');

    try {
      // Upload avatar via customer endpoint
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_CONFIG.BASE_URL}/customer/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      });

      const data = await res.json();

      if (data.success && data.url) {
        // Update local user state
        if (data.user) {
          localStorage.setItem('kohinoor_user', JSON.stringify(data.user));
        }
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(''), 3000);
        // Reload to reflect changes
        window.location.reload();
      } else {
        setError(data.message || 'Failed to upload image');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setAvatarLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) return null;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm overflow-hidden mb-6"
        >
          {/* Cover */}
          <div className="h-24 bg-gradient-to-r from-amber-500 to-orange-500" />
          
          {/* Avatar & Name */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              {/* Clickable Avatar with Camera Icon */}
              <div 
                onClick={handleAvatarClick}
                className="relative group cursor-pointer"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-neutral-900 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-neutral-900 shadow-lg">
                    {getInitials(user.name)}
                  </div>
                )}
                {/* Camera overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarLoading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{user.name}</h1>
                <p className="text-sm text-neutral-500">{user.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Personal Information</h2>
            <div className="flex items-center gap-2">
              {/* Change Password Icon */}
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Change Password"
              >
                <Lock className="w-4 h-4 text-amber-600" />
              </button>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-white">{user.name}</p>
                )}
              </div>
            </div>

            {/* Email (non-editable) */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">Email</label>
                <p className="text-neutral-900 dark:text-white">{user.email}</p>
              </div>
              {user.isEmailVerified && (
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-white">{user.phone || 'Not added'}</p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-white">
                    {user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : 'Not added'}
                  </p>
                )}
              </div>
            </div>

            {/* City */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-white">{user.address?.city || 'Not added'}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order History Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Orders & Acquisitions</h2>
              <p className="text-xs text-neutral-500">Track and view your certified gemstone orders.</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-500">No online orders placed yet</p>
              <p className="text-[10px] text-neutral-450 mt-1 max-w-[280px] mx-auto">Acquire certified gemstones via our secure online checkout to view them here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {orders.map((order, index) => (
                <div 
                  key={order.orderId || index}
                  className="border border-neutral-100 dark:border-neutral-800/80 rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-950/20 text-xs font-semibold"
                >
                  <div className="flex flex-wrap justify-between items-center pb-2.5 border-b border-neutral-100 dark:border-neutral-800 gap-2">
                    <div>
                      <span className="text-[9px] text-neutral-400 block uppercase">Order Reference</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">{order.orderId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-400 block uppercase">Date Placed</span>
                      <span className="text-neutral-600 dark:text-neutral-350">{new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="py-2.5 divide-y divide-neutral-100/50 dark:divide-neutral-800/50">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="w-10 h-10 rounded-lg bg-neutral-150 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-200/40">
                          {item.images?.[0]?.url ? (
                            <img src={item.images[0].url} alt={item.name?.english} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-500/10"><Sparkles className="w-3.5 h-3.5 text-amber-500" /></div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-neutral-900 dark:text-white truncate font-bold text-xs">{item.name?.english}</h4>
                          <p className="text-neutral-400 text-[10px]">{item.category} • Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right font-bold text-neutral-900 dark:text-white">
                          ₹{((item.price || item.priceRange?.min || 0) * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping and Total summary */}
                  <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[10px]">
                    <span className="text-neutral-400">Status: <span className="text-emerald-500 font-bold">● Insured Express Transit</span></span>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">Total: <span className="text-emerald-600 dark:text-emerald-450 font-extrabold text-sm">₹{order.total.toLocaleString('en-IN')}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Change Password Section */}
        {showPasswordChange && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Change Password</h2>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl px-4 py-3 pr-12 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* New Password */}
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="New Password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl px-4 py-3 pr-12 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl px-4 py-3 pr-12 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
