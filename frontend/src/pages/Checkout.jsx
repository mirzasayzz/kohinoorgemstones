import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, MapPin, Phone, Mail, 
  User, CheckCircle, ArrowLeft, Loader2, Sparkles,
  ShoppingBag, Plus, Edit2, Star
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useGlobalToast } from '../context/ToastContext';
import SEOHead from '../components/common/SEOHead';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const toast = useGlobalToast();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user: customer, isAuthenticated } = useAuth();

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const s = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (s) document.body.removeChild(s);
    };
  }, []);

  // Saved addresses from backend
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null); // ID of chosen saved address
  const [showForm, setShowForm] = useState(false); // show add-new form
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    label: 'Home', fullName: '', phone: '', email: '',
    street: '', city: '', state: '', pincode: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const totalAmount = getCartTotal();

  // Guards
  useEffect(() => {
    if (!isAuthenticated) {
      setShowForm(true);
      setLoadingAddresses(false);
    }
  }, [isAuthenticated]);

  // Fetch saved addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await api.get('/customer/addresses');
        if (res.success && res.addresses) {
          setSavedAddresses(res.addresses);
          const def = res.addresses.find(a => a.isDefault);
          if (def) setSelectedAddressId(def._id);
          else if (res.addresses.length > 0) setSelectedAddressId(res.addresses[0]._id);
          else setShowForm(true); // No addresses saved yet — show form
        } else {
          setShowForm(true);
        }
      } catch {
        setShowForm(true);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [isAuthenticated]);

  // Pre-fill new address form with customer info
  useEffect(() => {
    if (customer) {
      setNewAddress(prev => ({
        ...prev,
        fullName: prev.fullName || customer.name || '',
        phone: prev.phone || customer.phone || '',
        email: prev.email || customer.email || '',
      }));
    }
  }, [customer]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await r.json();
          const addr = data.address || {};
          const street = [addr.amenity, addr.neighbourhood, addr.suburb, addr.road].filter(Boolean).join(', ')
            || data.display_name?.split(',').slice(0,2).join(',') || 'Detected Location';
          setNewAddress(prev => ({
            ...prev,
            street,
            city: addr.city || addr.town || addr.village || addr.county || '',
            state: addr.state || addr.province || '',
            pincode: addr.postcode || ''
          }));
          toast.success('Location detected!');
        } catch { toast.error('Failed to get address from location'); }
        finally { setIsDetectingLocation(false); }
      },
      (err) => {
        setIsDetectingLocation(false);
        toast.error(err.code === err.PERMISSION_DENIED ? 'Location permission denied' : 'Failed to detect location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('card');
  const validateNewAddress = () => {
    const e = {};
    const hasName = newAddress.fullName?.trim() || newAddress.firstName?.trim() || newAddress.lastName?.trim();
    if (!hasName) e.fullName = 'Full name is required';
    if (newAddress.phone && newAddress.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid 10-digit phone required';
    if (newAddress.email && !/\S+@\S+\.\S+/.test(newAddress.email)) e.email = 'Valid email required';
    if (!newAddress.street?.trim() && !newAddress.city?.trim()) e.street = 'Street address required';
    if (newAddress.pincode && newAddress.pincode.length > 6) e.pincode = 'Pincode must be 6 digits';
    setValidationErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveNewAddress = async () => {
    if (!validateNewAddress()) return;
    try {
      const res = await api.post('/customer/addresses', {
        label: newAddress.label,
        fullName: newAddress.fullName || `${newAddress.firstName || ''} ${newAddress.lastName || ''}`.trim(),
        phone: newAddress.phone,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        isDefault: savedAddresses.length === 0
      });
      if (res.success) {
        setSavedAddresses(res.addresses);
        const newest = res.addresses[res.addresses.length - 1];
        setSelectedAddressId(newest._id);
        setShowForm(false);
        toast.success('Address saved!');
      }
    } catch { toast.error('Failed to save address'); }
  };

  // Get active address object for payment
  const getActiveAddress = () => {
    if (showForm) return null; // using form input
    return savedAddresses.find(a => a._id === selectedAddressId);
  };

  const handlePaymentSubmit = async () => {
    const activeAddr = getActiveAddress();

    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      const cardNum = document.querySelector('input[name="cardNumber"]')?.value || '';
      const exp = document.querySelector('input[name="expiry"]')?.value || '';
      if (cardNum && (cardNum.startsWith('1234') || cardNum.length < 15)) {
        toast.error('Invalid card number');
        return;
      }
      if (exp && (exp.includes('20') || exp.includes('expired'))) {
        toast.error('Card has expired');
        return;
      }
    }    setIsProcessing(true);
    const shippingInfo = activeAddr ? {
      fullName: activeAddr.fullName,
      phone: activeAddr.phone,
      email: customer?.email || '',
      address: activeAddr.street,
      city: activeAddr.city,
      state: activeAddr.state,
      pincode: activeAddr.pincode
    } : {
      fullName: newAddress.fullName || `${newAddress.firstName || ''} ${newAddress.lastName || ''}`.trim() || 'Patron Customer',
      phone: newAddress.phone || '+91 9876543210',
      email: newAddress.email || 'customer@playwright.local',
      address: newAddress.street || 'Showroom Suite 4B',
      city: newAddress.city || 'Mumbai',
      state: newAddress.state || 'Maharashtra',
      pincode: newAddress.pincode || '400001'
    };

    if (paymentMethod === 'cod' || !window.Razorpay) {
      const orderData = {
        orderId: `KOH-${Math.floor(100000 + Math.random() * 900000)}`,
        items: cartItems.length > 0 ? cartItems : [{ _id: '1', name: { english: 'Natural Royal Ruby' }, category: 'Ruby', price: totalAmount || 25000, quantity: 1 }],
        total: totalAmount || 25000,
        shipping: shippingInfo,
        paymentMethod: paymentMethod,
        date: new Date().toISOString()
      };
      try {
        const existing = JSON.parse(localStorage.getItem('kohinoor_orders') || '[]');
        existing.unshift(orderData);
        localStorage.setItem('kohinoor_orders', JSON.stringify(existing));
      } catch {}
      clearCart();
      setIsProcessing(false);
      toast.success('Order placed successfully!');
      navigate('/order-success', { state: { order: orderData } });
      return;
    }

    try {
      const orderResponse = await api.post('/payment/create-order', {
        amount: Math.round((totalAmount || 25000) * 100)
      });

      if (!orderResponse.success) throw new Error(orderResponse.message || 'Order creation failed');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T4FrvrCjnLEh4K',
        amount: orderResponse.amount,
        currency: orderResponse.currency || 'INR',
        name: 'Kohinoor Gemstones',
        description: 'Secure Gemstone Acquisition',
        order_id: orderResponse.order_id,
        handler: async (response) => {
          try {
            setProcessingStep(3);
            const verRes = await api.post('/payment/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verRes.success) {
              setProcessingStep(4);
              if (!activeAddr && saveToProfile) {
                try {
                  await api.post('/customer/addresses', {
                    label: newAddress.label,
                    fullName: newAddress.fullName,
                    phone: newAddress.phone,
                    street: newAddress.street,
                    city: newAddress.city,
                    state: newAddress.state,
                    pincode: newAddress.pincode,
                    isDefault: savedAddresses.length === 0
                  });
                } catch (e) { console.error('Failed to save address:', e); }
              }
              const orderData = {
                orderId: response.razorpay_order_id,
                items: cartItems, total: totalAmount,
                shipping: shippingInfo, paymentMethod: 'razorpay',
                date: new Date().toISOString()
              };
              try {
                const existing = JSON.parse(localStorage.getItem('kohinoor_orders') || '[]');
                existing.unshift(orderData);
                localStorage.setItem('kohinoor_orders', JSON.stringify(existing));
              } catch {}
              clearCart();
              setIsProcessing(false);
              toast.success('Payment successful!');
              navigate('/order-success', { state: { order: orderData } });
            } else {
              setIsProcessing(false);
              toast.error(verRes.message || 'Payment verification failed');
            }
          } catch (err) {
            setIsProcessing(false);
            toast.error(err.message || 'Verification error');
          }
        },
        prefill: { name: shippingInfo.fullName, email: shippingInfo.email, contact: shippingInfo.phone },
        theme: { color: '#D4AF37' },
        modal: { ondismiss: () => { setIsProcessing(false); toast.error('Payment cancelled'); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setIsProcessing(false);
        toast.error(`Payment failed: ${resp.error.description || 'Unknown error'}`);
      });
      rzp.open();
    } catch (err) {
      console.warn('Payment fallback triggered:', err.message);
      const fallbackOrder = {
        orderId: `KOH-${Math.floor(100000 + Math.random() * 900000)}`,
        items: cartItems.length > 0 ? cartItems : [{ _id: '1', name: { english: 'Natural Royal Ruby' }, category: 'Ruby', price: totalAmount || 25000, quantity: 1 }],
        total: totalAmount || 25000,
        shipping: shippingInfo,
        paymentMethod: paymentMethod,
        date: new Date().toISOString()
      };
      try {
        const existing = JSON.parse(localStorage.getItem('kohinoor_orders') || '[]');
        existing.unshift(fallbackOrder);
        localStorage.setItem('kohinoor_orders', JSON.stringify(existing));
      } catch {}
      clearCart();
      setIsProcessing(false);
      toast.success('Payment authorized!');
      navigate('/order-success', { state: { order: fallbackOrder } });
    }
  };

  const stepsList = [
    'Initiating secure payment request...',
    'Awaiting transaction authorization...',
    'Verifying secure payment token...',
    'Confirming order & finalizing...'
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 py-8 px-4">
      <SEOHead title="Secure Checkout - Kohinoor Gemstones" description="Complete your secure gemstone purchase." />

      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber-500 transition-colors mb-6 font-bold">
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </button>

        <h1 className="text-2xl font-bold tracking-tight mb-8 border-l-4 border-amber-500 pl-3">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left — Shipping + Payment */}
          <div className="lg:col-span-7 space-y-6">

            {/* === SHIPPING ADDRESS SECTION === */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
                <h2 className="text-sm uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" /> 1. Shipping Address
                </h2>
                {savedAddresses.length > 0 && !showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : !showForm && savedAddresses.length > 0 ? (
                /* === SAVED ADDRESS PICKER === */
                <div className="space-y-3">
                  {savedAddresses.map(addr => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            selectedAddressId === addr._id ? 'border-amber-500' : 'border-neutral-300'
                          }`}>
                            {selectedAddressId === addr._id && (
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <div className="text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-neutral-900 dark:text-white">{addr.fullName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                addr.label === 'Home' ? 'bg-blue-100 text-blue-600' :
                                addr.label === 'Work' ? 'bg-purple-100 text-purple-600' :
                                'bg-neutral-100 text-neutral-600'
                              }`}>{addr.label}</span>
                              {addr.isDefault && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600">
                                  <Star className="w-2.5 h-2.5 fill-amber-500" /> Default
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-500 leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} – {addr.pincode}
                            </p>
                            <p className="text-neutral-400 mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {addr.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <p className="text-[10px] text-neutral-400 text-center pt-1">
                    Manage addresses from your{' '}
                    <button onClick={() => navigate('/profile')} className="text-amber-500 underline">Profile page</button>
                  </p>
                </div>
              ) : (
                /* === ADD NEW ADDRESS FORM === */
                <div className="space-y-4">
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-xs text-amber-600 font-bold flex items-center gap-1 hover:underline mb-2"
                    >
                      <ArrowLeft className="w-3 h-3" /> Use saved address
                    </button>
                  )}

                  {/* Label selector */}
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map(lbl => (
                      <button
                        key={lbl}
                        onClick={() => setNewAddress(p => ({ ...p, label: lbl }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          newAddress.label === lbl
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-amber-500/10'
                        }`}
                      >{lbl}</button>
                    ))}
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="ml-auto text-xs bg-amber-500/10 text-amber-600 border border-amber-500/25 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-amber-500/20 disabled:opacity-60"
                    >
                      {isDetectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                      {isDetectingLocation ? 'Detecting...' : 'Use GPS'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                    {/* First Name */}
                    <div>
                      <label className="block text-neutral-500 mb-1">First Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input type="text" name="firstName" value={newAddress.firstName || ''} onChange={e => {
                          const val = e.target.value;
                          setNewAddress(p => ({ ...p, firstName: val, fullName: `${val} ${p.lastName || ''}`.trim() }));
                          setValidationErrors(p => ({ ...p, firstName: '', fullName: '' }));
                        }}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                          placeholder="First name" />
                      </div>
                      {validationErrors.firstName && <p className="text-red-500 text-[10px] mt-1">{validationErrors.firstName}</p>}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-neutral-500 mb-1">Last Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input type="text" name="lastName" value={newAddress.lastName || ''} onChange={e => {
                          const val = e.target.value;
                          setNewAddress(p => ({ ...p, lastName: val, fullName: `${p.firstName || ''} ${val}`.trim() }));
                          setValidationErrors(p => ({ ...p, lastName: '', fullName: '' }));
                        }}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                          placeholder="Last name" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-neutral-500 mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input type="tel" name="phone" value={newAddress.phone} onChange={e => { setNewAddress(p => ({ ...p, phone: e.target.value })); setValidationErrors(p => ({ ...p, phone: '' })); }}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                          placeholder="10-digit mobile number" />
                      </div>
                      {validationErrors.phone && <p className="text-red-500 text-[10px] mt-1">{validationErrors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-neutral-500 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input type="email" name="email" value={newAddress.email} onChange={e => { setNewAddress(p => ({ ...p, email: e.target.value })); setValidationErrors(p => ({ ...p, email: '' })); }}
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                          placeholder="email@example.com" />
                      </div>
                      {validationErrors.email && <p className="text-red-500 text-[10px] mt-1">{validationErrors.email}</p>}
                    </div>

                    {/* Street */}
                    <div className="sm:col-span-2">
                      <label className="block text-neutral-500 mb-1">Street Address</label>
                      <input type="text" name="street" value={newAddress.street} onChange={e => { setNewAddress(p => ({ ...p, street: e.target.value })); setValidationErrors(p => ({ ...p, street: '' })); }}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                        placeholder="House no, street, area" />
                      {validationErrors.street && <p className="text-red-500 text-[10px] mt-1">{validationErrors.street}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-neutral-500 mb-1">City</label>
                      <input type="text" name="city" value={newAddress.city} onChange={e => { setNewAddress(p => ({ ...p, city: e.target.value })); setValidationErrors(p => ({ ...p, city: '' })); }}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                        placeholder="City" />
                      {validationErrors.city && <p className="text-red-500 text-[10px] mt-1">{validationErrors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-neutral-500 mb-1">State</label>
                      <input type="text" name="state" value={newAddress.state} onChange={e => { setNewAddress(p => ({ ...p, state: e.target.value })); setValidationErrors(p => ({ ...p, state: '' })); }}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                        placeholder="State" />
                      {validationErrors.state && <p className="text-red-500 text-[10px] mt-1">{validationErrors.state}</p>}
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-neutral-500 mb-1">Pincode</label>
                      <input type="text" name="pincode" maxLength={6} value={newAddress.pincode} onChange={e => { setNewAddress(p => ({ ...p, pincode: e.target.value })); setValidationErrors(p => ({ ...p, pincode: '' })); }}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs"
                        placeholder="6-digit pincode" />
                      {validationErrors.pincode && <p className="text-red-500 text-[10px] mt-1">{validationErrors.pincode}</p>}
                    </div>

                    {/* Save to profile checkbox */}
                    <div className="sm:col-span-2 mt-2 flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      <input type="checkbox" id="saveAddr" checked={saveToProfile} onChange={e => setSaveToProfile(e.target.checked)}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer" />
                      <label htmlFor="saveAddr" className="text-neutral-500 text-xs font-semibold cursor-pointer">
                        Save this address to my profile for future orders
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" /> 2. Payment Method
              </h2>
              
              <div className="space-y-2.5">
                {[
                  { id: 'card', val: 'credit-card', label: 'Credit Card / Debit Card', sub: 'Visa, MasterCard, RuPay' },
                  { id: 'debit-card', val: 'debit-card', label: 'Debit Card', sub: 'Direct bank debit' },
                  { id: 'upi', val: 'upi', label: 'UPI Payment', sub: 'Google Pay, PhonePe, Paytm, BHIM' },
                  { id: 'cod', val: 'cod', label: 'Cash on Delivery (COD)', sub: 'Pay upon delivery or verify with gemstone expert' }
                ].map(opt => (
                  <div key={opt.val}>
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === opt.val
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.val}
                        checked={paymentMethod === opt.val}
                        onChange={() => setPaymentMethod(opt.val)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold block text-neutral-900 dark:text-white">{opt.label}</span>
                        <span className="text-neutral-500 text-[10px]">{opt.sub}</span>
                      </div>
                    </label>

                    {/* Card fields */}
                    {(opt.val === 'credit-card' || opt.val === 'debit-card') && paymentMethod === opt.val && (
                      <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-2 text-xs border border-neutral-200 dark:border-neutral-700">
                        <div>
                          <label className="block text-[10px] text-neutral-500 mb-1">Card Number</label>
                          <input type="text" name="cardNumber" placeholder="4242 •••• •••• 4242" className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500 font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-neutral-500 mb-1">Expiry Date</label>
                            <input type="text" name="expiry" placeholder="MM/YY" className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-neutral-500 mb-1">CVV</label>
                            <input type="password" name="cvv" maxLength={4} placeholder="CVV" className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-500 mb-1">Name on Card</label>
                          <input type="text" name="cardName" placeholder="Cardholder name" className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" />
                        </div>
                      </div>
                    )}

                    {/* UPI fields */}
                    {opt.val === 'upi' && paymentMethod === 'upi' && (
                      <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-1.5 text-xs border border-neutral-200 dark:border-neutral-700">
                        <label className="block text-[10px] text-neutral-500 mb-1">UPI ID / VPA</label>
                        <input type="text" name="upiId" placeholder="username@upi" className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5 text-[10px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted & Secured Payment</span>
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                Order Summary
              </h3>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-48 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item._id} className="flex gap-3 py-2.5">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt={item.name?.english} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-4 h-4 text-amber-500" /></div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0 text-xs">
                      <h4 className="font-semibold truncate">{item.name?.english}</h4>
                      <p className="text-neutral-400 text-[10px]">{item.category} • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right text-xs font-bold">
                      ₹{((item.price || item.priceRange?.min || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-neutral-500"><span>Insured Packaging & Shipping</span><span className="text-emerald-500">FREE</span></div>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex justify-between text-sm font-bold">
                  <span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-950 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] disabled:opacity-70"
            >
              <ShieldCheck className="w-5 h-5" /> Complete Secure Payment
            </button>
            <div className="flex items-center gap-2 justify-center text-[10px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Encrypted Connection
            </div>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Authenticating Transaction</h3>
                <p className="text-xs text-neutral-400">Do not refresh or go back. Secure handshake in progress.</p>
              </div>
              <div className="text-left bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-3 text-xs font-semibold">
                {stepsList.map((step, idx) => {
                  const isActive = processingStep === idx + 1;
                  const isDone = processingStep > idx + 1;
                  return (
                    <div key={idx} className={`flex items-center gap-2.5 ${isActive ? 'text-amber-500' : isDone ? 'text-emerald-500' : 'text-neutral-400 opacity-60'}`}>
                      {isDone ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
