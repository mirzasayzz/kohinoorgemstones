import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, MapPin, Phone, Mail, 
  User, CheckCircle, ArrowLeft, Loader2, Sparkles,
  ShoppingBag, ShieldAlert, BadgePercent, QrCode
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useGlobalToast } from '../context/ToastContext';
import SEOHead from '../components/common/SEOHead';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const toast = useGlobalToast();
  const { cartItems, cartCount, getCartTotal, clearCart } = useCart();
  const { user: customer, isAuthenticated, updateProfile } = useAuth();

  useEffect(() => {
    // Dynamically load Razorpay Standard Web Checkout SDK script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Pre-populate address fields when customer object is loaded
  useEffect(() => {
    if (customer) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: prev.fullName || customer.name || '',
        phone: prev.phone || customer.phone || '',
        email: prev.email || customer.email || '',
        address: prev.address || customer.address?.street || '',
        city: prev.city || customer.address?.city || '',
        state: prev.state || customer.address?.state || '',
        pincode: prev.pincode || customer.address?.pincode || ''
      }));
    }
  }, [customer]);

  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Call free OpenStreetMap Nominatim reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (!response.ok) {
            throw new Error('Reverse geocoding failed');
          }

          const data = await response.json();
          const address = data.address || {};
          
          // Construct street address
          const streetParts = [
            address.amenity,
            address.neighbourhood,
            address.suburb,
            address.road
          ].filter(Boolean);
          
          const streetAddress = streetParts.length > 0 
            ? streetParts.join(', ') 
            : data.display_name?.split(',').slice(0, 2).join(',') || 'Detected Location';
            
          const detectedCity = address.city || address.town || address.village || address.county || '';
          const detectedState = address.state || address.province || '';
          const detectedPincode = address.postcode || '';

          setShippingAddress(prev => ({
            ...prev,
            address: streetAddress,
            city: detectedCity,
            state: detectedState,
            pincode: detectedPincode
          }));

          toast.success('Location detected and address populated!');
        } catch (err) {
          console.error(err);
          toast.error('Failed to resolve address from coordinates.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow location access in your browser settings.');
        } else {
          toast.error('Failed to fetch current location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const totalAmount = getCartTotal();

  // Redirect to home if cart is empty and not loading
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view checkout');
      navigate('/signin');
    } else if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/');
    }
  }, [cartItems, isAuthenticated, navigate, toast]);

  // Form field handlings
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate Shipping Fields
    if (!shippingAddress.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingAddress.phone.trim() || shippingAddress.phone.length < 10) errors.phone = 'Valid phone number is required';
    if (!shippingAddress.email.trim() || !/\S+@\S+\.\S+/.test(shippingAddress.email)) errors.email = 'Valid email is required';
    if (!shippingAddress.address.trim()) errors.address = 'Street address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.pincode.trim() || shippingAddress.pincode.length !== 6) errors.pincode = 'Pincode must be 6 digits';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve all validation errors first');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Razorpay payment gateway script not loaded yet. Please wait.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(1); // "Initiating secure payment request..."

    try {
      // 1. Create order on Express backend
      const orderResponse = await api.post('/payment/create-order', {
        amount: Math.round(totalAmount * 100) // Convert INR to paise
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order.');
      }

      setProcessingStep(2); // "Awaiting transaction authorization..."

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T4FrvrCjnLEh4K',
        amount: orderResponse.amount,
        currency: orderResponse.currency || 'INR',
        name: 'Kohinoor Gemstones',
        description: 'Secure Gemstone Acquisition',
        order_id: orderResponse.order_id,
        handler: async function (response) {
          try {
            setProcessingStep(3); // "Verifying secure payment token..."
            
            // 2. Verify signature on backend
            const verificationResponse = await api.post('/payment/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResponse.success) {
              setProcessingStep(4); // "Confirming order details..."
              
              // Persist shipping address to user profile permanently if checked
              if (saveAddressToProfile && isAuthenticated) {
                try {
                  await updateProfile({
                    address: {
                      street: shippingAddress.address,
                      city: shippingAddress.city,
                      state: shippingAddress.state,
                      pincode: shippingAddress.pincode
                    }
                  });
                } catch (profileErr) {
                  console.error('Failed to auto-save address to user profile:', profileErr);
                }
              }

              const orderData = {
                orderId: response.razorpay_order_id,
                items: cartItems,
                total: totalAmount,
                shipping: shippingAddress,
                paymentMethod: 'razorpay',
                date: new Date().toISOString()
              };

              // Persist locally for profile order history
              try {
                const existingOrders = JSON.parse(localStorage.getItem('kohinoor_orders') || '[]');
                existingOrders.unshift(orderData);
                localStorage.setItem('kohinoor_orders', JSON.stringify(existingOrders));
              } catch (err) {
                console.error('Failed to save order to localStorage:', err);
              }

              clearCart();
              setIsProcessing(false);
              toast.success('Payment completed and verified successfully!');
              navigate('/order-success', { state: { order: orderData } });
            } else {
              setIsProcessing(false);
              toast.error(verificationResponse.message || 'Signature mismatch.');
            }
          } catch (err) {
            setIsProcessing(false);
            toast.error(err.message || 'Payment signature verification failed.');
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#D4AF37' // Luxury gold theme matching brand identity
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.error('Payment modal cancelled by user.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (resp) {
        setIsProcessing(false);
        toast.error(`Payment failed: ${resp.error.description || 'Unknown error'}`);
      });

      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      toast.error(err.message || 'Failed to initiate checkout transaction.');
    }
  };

  const stepsList = [
    'Initiating secure payment request...',
    'Awaiting transaction authorization...',
    'Verifying secure payment token...',
    'Confirming order details & finalizing...'
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 py-8 px-4 transition-all">
      <SEOHead 
        title="Secure Checkout - Kohinoor Gemstones" 
        description="Verify billing information, choose custom shipping addresses, and pay via secure digital channels." 
      />

      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-neutral-550 hover:text-amber-500 transition-colors mb-6 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>

        <h1 className="text-2xl font-bold tracking-tight mb-8 border-l-4 border-amber-500 pl-3">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Checkout Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shipping details */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
                <h2 className="text-sm uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>1. Shipping Information</span>
                </h2>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all hover:bg-amber-500/20 active:scale-95 disabled:opacity-60"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-550 dark:text-neutral-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 text-xs" 
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  {validationErrors.fullName && <p className="text-red-500 text-[10px] mt-1 font-medium">{validationErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-neutral-550 dark:text-neutral-400 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 text-xs" 
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  {validationErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-medium">{validationErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-neutral-550 dark:text-neutral-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input 
                      type="email" 
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleAddressChange}
                      className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 text-xs" 
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  {validationErrors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{validationErrors.email}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-550 dark:text-neutral-400 mb-1.5">Street Address</label>
                  <input 
                    type="text" 
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs" 
                    placeholder="Apartment, suite, unit, block details"
                  />
                  {validationErrors.address && <p className="text-red-500 text-[10px] mt-1 font-medium">{validationErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-neutral-550 dark:text-neutral-400 mb-1.5">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs" 
                    placeholder="e.g. Bareilly"
                  />
                  {validationErrors.city && <p className="text-red-500 text-[10px] mt-1 font-medium">{validationErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-neutral-550 dark:text-neutral-400 mb-1.5">State</label>
                  <input 
                    type="text" 
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs" 
                    placeholder="e.g. Uttar Pradesh"
                  />
                  {validationErrors.state && <p className="text-red-500 text-[10px] mt-1 font-medium">{validationErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-neutral-550 dark:text-neutral-400 mb-1.5">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleAddressChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-xs" 
                    placeholder="e.g. 243001"
                  />
                  {validationErrors.pincode && <p className="text-red-500 text-[10px] mt-1 font-medium">{validationErrors.pincode}</p>}
                </div>

                <div className="sm:col-span-2 mt-3 flex items-center gap-2 select-none border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                  <input
                    type="checkbox"
                    id="saveAddressToProfile"
                    checked={saveAddressToProfile}
                    onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-550 focus:ring-amber-500 border-neutral-300 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="saveAddressToProfile" className="text-neutral-600 dark:text-neutral-405 text-xs font-semibold cursor-pointer">
                    Save this shipping address to my profile for future orders
                  </label>
                </div>
              </div>
            </div>

            {/* Razorpay Gateway Explanation Block */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>2. Secure Payment Gateway</span>
              </h2>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <h3 className="font-bold text-neutral-900 dark:text-white">Checkout Powered by Razorpay</h3>
                  <p className="text-neutral-550 dark:text-neutral-400 leading-relaxed font-semibold">
                    Kohinoor Gemstones integrates with Razorpay to provide secure, seamless payment transactions. Click <strong>"Complete Secure Payment"</strong> to launch the payment gateway modal and pay with:
                  </p>
                  <ul className="list-disc pl-4 text-neutral-500 space-y-1 mt-2">
                    <li>Credit or Debit Cards (Visa, MasterCard, RuPay, Maestro)</li>
                    <li>Unified Payments Interface (UPI GooglePay, PhonePe, Paytm, BHIM)</li>
                    <li>50+ Netbanking options & secure digital wallets</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Razorpay Standard Web Checkout Integration</span>
                </span>
                <span>Sandbox Mode Active</span>
              </div>
            </div>
          </div>

          {/* Cart Sidebar Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Order receipt breakdown */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                Order Summary
              </h3>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-850 overflow-hidden flex-shrink-0 border border-neutral-200/50">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt={item.name?.english} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-4 h-4 text-amber-500" /></div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0 text-xs">
                      <h4 className="font-semibold text-neutral-900 dark:text-white truncate">{item.name?.english}</h4>
                      <p className="text-neutral-400 text-[10px] mt-0.5">{item.category} • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right text-xs font-bold text-neutral-900 dark:text-white">
                      ₹{((item.price || item.priceRange?.min || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill totals */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3.5 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Insured Packaging &amp; Shipping</span>
                  <span className="text-emerald-500">FREE</span>
                </div>
                
                <div className="border-t border-neutral-100 dark:border-neutral-850 pt-2 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Complete checkout button */}
            <button
              onClick={handlePaymentSubmit}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-950 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-98"
            >
              <ShieldCheck className="w-5 h-5 text-neutral-950" />
              <span>Complete Secure Payment</span>
            </button>

            <div className="flex items-center gap-2 justify-center text-[10px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted Connection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gateway processing Loader modal */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-shimmer"></div>
              
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 relative">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
              
              <div>
                <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white mb-2">Authenticating Gateway Transaction</h3>
                <p className="text-xs text-neutral-450 dark:text-neutral-400 max-w-xs mx-auto">Please do not refresh the page or click back button. Secure handshake is in progress.</p>
              </div>

              {/* Progress steps animation list */}
              <div className="text-left bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-850 space-y-3 text-xs font-semibold">
                {stepsList.map((step, idx) => {
                  const isActive = processingStep === idx + 1;
                  const isDone = processingStep > idx + 1;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-2.5 transition-all duration-300 ${
                        isActive ? 'text-amber-500 scale-[1.01]' : isDone ? 'text-emerald-500' : 'text-neutral-400 opacity-60'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-neutral-300 dark:border-neutral-700 flex-shrink-0"></div>
                      )}
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
