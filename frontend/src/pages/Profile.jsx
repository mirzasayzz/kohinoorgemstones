import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Calendar, MapPin, Phone, Lock, LogOut, 
  Edit2, Save, X, Eye, EyeOff, Loader2, CheckCircle, Camera,
  ShoppingBag, Sparkles, Plus, Trash2, Star, Home, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/config';
import api from '../services/api';

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
  
  // Address management state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null = add new, obj = edit existing
  const [addressForm, setAddressForm] = useState({
    label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', pincode: ''
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('kohinoor_orders') || '[]');
      setOrders(savedOrders);
    } catch (e) { console.error('Failed to load orders:', e); }
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await api.get('/customer/addresses');
        if (res.success) setAddresses(res.addresses || []);
      } catch { setAddresses([]); }
      finally { setLoadingAddresses(false); }
    };
    fetchAddresses();
  }, [isAuthenticated]);
  
  const [formData, setFormData] = useState({ name: '', phone: '', dateOfBirth: '', city: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/signin');
  }, [authLoading, isAuthenticated, navigate]);

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
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateOfBirth') {
      let f = value.replace(/\D/g, '').slice(0, 8);
      if (f.length >= 4) f = f.slice(0,2)+'/'+f.slice(2,4)+'/'+f.slice(4);
      else if (f.length >= 2) f = f.slice(0,2)+'/'+f.slice(2);
      setFormData(prev => ({ ...prev, [name]: f }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true); setError('');
    try {
      let formattedDob;
      if (formData.dateOfBirth && formData.dateOfBirth.length === 10) {
        const [day, month, year] = formData.dateOfBirth.split('/');
        formattedDob = `${year}-${month}-${day}`;
      }
      const result = await updateProfile({
        name: formData.name, phone: formData.phone,
        dateOfBirth: formattedDob, address: { city: formData.city }
      });
      if (result.success) { setSuccess('Profile updated!'); setIsEditing(false); setTimeout(() => setSuccess(''), 3000); }
      else setError(result.message || 'Failed to update');
    } catch (err) { setError(err.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) { setError('Fill all password fields'); return; }
    if (passwords.new.length < 6) { setError('New password must be 6+ characters'); return; }
    if (passwords.new !== passwords.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      setSuccess('Password changed!');
      setShowPasswordChange(false);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const handleAvatarClick = () => { if (fileInputRef.current) fileInputRef.current.value = ''; fileInputRef.current?.click(); };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image'); return; }
    if (file.size > 5*1024*1024) { setError('Image must be < 5MB'); return; }
    setAvatarLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_CONFIG.BASE_URL}/customer/avatar`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (data.user) localStorage.setItem('kohinoor_user', JSON.stringify(data.user));
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(''), 3000);
        window.location.reload();
      } else setError(data.message || 'Upload failed');
    } catch (err) { setError(err.message || 'Upload failed'); }
    finally { setAvatarLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // ── Address helpers ────────────────────────────────────────
  const openAddressForm = (addr = null) => {
    setEditingAddress(addr);
    setAddressError('');
    setAddressForm(addr ? {
      label: addr.label || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    } : {
      label: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '', city: '', state: '', pincode: ''
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    const { fullName, phone, street, city, state, pincode } = addressForm;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      setAddressError('All fields are required'); return;
    }
    if (pincode.length !== 6) { setAddressError('Pincode must be 6 digits'); return; }
    setAddressSaving(true); setAddressError('');
    try {
      let res;
      if (editingAddress) {
        res = await api.put(`/customer/addresses/${editingAddress._id}`, addressForm);
      } else {
        res = await api.post('/customer/addresses', { ...addressForm, isDefault: addresses.length === 0 });
      }
      if (res.success) {
        setAddresses(res.addresses);
        setShowAddressForm(false);
        setSuccess(editingAddress ? 'Address updated!' : 'Address added!');
        setTimeout(() => setSuccess(''), 3000);
      } else setAddressError(res.message || 'Failed to save address');
    } catch { setAddressError('Failed to save address'); }
    finally { setAddressSaving(false); }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await api.patch(`/customer/addresses/${addressId}/default`);
      if (res.success) { setAddresses(res.addresses); setSuccess('Default address updated!'); setTimeout(() => setSuccess(''), 2000); }
    } catch { setError('Failed to set default'); }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await api.delete(`/customer/addresses/${addressId}`);
      if (res.success) { setAddresses(res.addresses); setSuccess('Address deleted'); setTimeout(() => setSuccess(''), 2000); }
    } catch { setError('Failed to delete address'); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  if (!user) return null;

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  const LabelIcon = ({ label }) => {
    if (label === 'Work') return <Briefcase className="w-3.5 h-3.5" />;
    return <Home className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              <div onClick={handleAvatarClick} className="relative group cursor-pointer">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-neutral-900 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-neutral-900 shadow-lg">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarLoading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{user.name}</h1>
                <p className="text-sm text-neutral-500">{user.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feedback banners */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personal Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Personal Information</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" title="Change Password">
                <Lock className="w-4 h-4 text-amber-600" />
              </button>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 text-sm">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={loading} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: <User className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Full Name', field: 'name', type: 'text', value: user.name },
              { icon: <Mail className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Email', field: null, value: user.email, badge: user.isEmailVerified ? 'Verified' : null },
              { icon: <Phone className="w-5 h-5 text-green-600" />, bg: 'bg-green-100 dark:bg-green-900/30', label: 'Phone', field: 'phone', type: 'tel', value: user.phone || 'Not added' },
              { icon: <Calendar className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Date of Birth', field: 'dateOfBirth', type: 'text', value: user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : 'Not added', placeholder: 'DD/MM/YYYY', maxLength: 10 },
              { icon: <MapPin className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'City', field: 'city', type: 'text', value: user.address?.city || 'Not added' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>{item.icon}</div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 dark:text-neutral-400">{item.label}</label>
                  {isEditing && item.field ? (
                    <input type={item.type} name={item.field} value={formData[item.field]} onChange={handleInputChange}
                      placeholder={item.placeholder} maxLength={item.maxLength}
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 text-sm" />
                  ) : (
                    <p className="text-neutral-900 dark:text-white text-sm">{item.value}</p>
                  )}
                </div>
                {item.badge && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-1 rounded-full">{item.badge}</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── SAVED ADDRESSES ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Saved Addresses</h2>
                <p className="text-xs text-neutral-500">Manage your delivery addresses</p>
              </div>
            </div>
            <button
              onClick={() => openAddressForm()}
              className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          {loadingAddresses ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-amber-500" /></div>
          ) : addresses.length === 0 && !showAddressForm ? (
            <div className="text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
              <MapPin className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-500">No addresses saved yet</p>
              <p className="text-[10px] text-neutral-400 mt-1">Add an address to speed up future checkouts</p>
              <button onClick={() => openAddressForm()} className="mt-3 text-xs text-amber-500 font-bold underline">
                Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <div key={addr._id} className={`border rounded-xl p-4 transition-all ${addr.isDefault ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-200 dark:border-neutral-700'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${addr.label === 'Work' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        <LabelIcon label={addr.label} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-neutral-900 dark:text-white">{addr.fullName}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${addr.label === 'Work' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{addr.label}</span>
                          {addr.isDefault && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                              <Star className="w-2.5 h-2.5 fill-amber-500" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{addr.street}, {addr.city}, {addr.state} – {addr.pincode}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {addr.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefault(addr._id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Set as default">
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openAddressForm(addr)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAddress(addr._id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Address Form */}
          <AnimatePresence>
            {showAddressForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4">
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button onClick={() => setShowAddressForm(false)} className="text-neutral-400 hover:text-neutral-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {addressError && <p className="text-red-500 text-xs mb-3 font-medium">{addressError}</p>}

                  {/* Label */}
                  <div className="flex gap-2 mb-4">
                    {['Home', 'Work', 'Other'].map(lbl => (
                      <button key={lbl} onClick={() => setAddressForm(p => ({ ...p, label: lbl }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${addressForm.label === lbl ? 'bg-amber-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-amber-100'}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { label: 'Full Name', field: 'fullName', colSpan: false, placeholder: 'Full name' },
                      { label: 'Phone', field: 'phone', colSpan: false, placeholder: '10-digit number', type: 'tel' },
                      { label: 'Street Address', field: 'street', colSpan: true, placeholder: 'House, street, area' },
                      { label: 'City', field: 'city', colSpan: false, placeholder: 'City' },
                      { label: 'State', field: 'state', colSpan: false, placeholder: 'State' },
                      { label: 'Pincode', field: 'pincode', colSpan: false, placeholder: '6-digit pincode', maxLength: 6 },
                    ].map(item => (
                      <div key={item.field} className={item.colSpan ? 'sm:col-span-2' : ''}>
                        <label className="block text-neutral-500 mb-1 font-semibold">{item.label}</label>
                        <input
                          type={item.type || 'text'}
                          maxLength={item.maxLength}
                          placeholder={item.placeholder}
                          value={addressForm[item.field]}
                          onChange={e => setAddressForm(p => ({ ...p, [item.field]: e.target.value }))}
                          className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 outline-none focus:border-amber-500 text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowAddressForm(false)}
                      className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-500 hover:bg-neutral-50">
                      Cancel
                    </button>
                    <button onClick={handleSaveAddress} disabled={addressSaving}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold flex items-center justify-center gap-2">
                      {addressSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {editingAddress ? 'Save Changes' : 'Save Address'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Order History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Orders</h2>
              <p className="text-xs text-neutral-500">Track your certified gemstone orders</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-500">No orders yet</p>
              <p className="text-[10px] text-neutral-400 mt-1">Complete a purchase to see your orders here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {orders.map((order, index) => (
                <div key={order.orderId || index} className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-950/20 text-xs font-semibold">
                  <div className="flex flex-wrap justify-between items-center pb-2.5 border-b border-neutral-100 dark:border-neutral-800 gap-2">
                    <div>
                      <span className="text-[9px] text-neutral-400 block uppercase">Order Ref</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">{order.orderId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-400 block uppercase">Date</span>
                      <span className="text-neutral-600 dark:text-neutral-350">{new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                  <div className="py-2.5 divide-y divide-neutral-100/50 dark:divide-neutral-800/50">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                          {item.images?.[0]?.url ? <img src={item.images[0].url} alt={item.name?.english} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-amber-500/10"><Sparkles className="w-3.5 h-3.5 text-amber-500" /></div>}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-neutral-900 dark:text-white truncate font-bold">{item.name?.english}</h4>
                          <p className="text-neutral-400 text-[10px]">{item.category} • Qty: {item.quantity}</p>
                        </div>
                        <div className="font-bold text-neutral-900 dark:text-white">₹{((item.price || item.priceRange?.min || 0)*item.quantity).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[10px]">
                    <span className="text-neutral-400">Status: <span className="text-emerald-500 font-bold">● Express Transit</span></span>
                    <span className="font-bold text-neutral-900 dark:text-white">Total: <span className="text-emerald-600 dark:text-emerald-400 text-sm">₹{order.total.toLocaleString('en-IN')}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Change Password */}
        <AnimatePresence>
          {showPasswordChange && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 mb-6 overflow-hidden">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Change Password</h2>
              <div className="space-y-4">
                {[
                  { key: 'current', placeholder: 'Current Password' },
                  { key: 'new', placeholder: 'New Password' },
                  { key: 'confirm', placeholder: 'Confirm New Password' }
                ].map(item => (
                  <div key={item.key} className="relative">
                    <input type={showPasswords[item.key] ? 'text' : 'password'} placeholder={item.placeholder}
                      value={passwords[item.key]} onChange={e => setPasswords(p => ({ ...p, [item.key]: e.target.value }))}
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl px-4 py-3 pr-12 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500" />
                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      {showPasswords[item.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
                <button onClick={handleChangePassword} disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
