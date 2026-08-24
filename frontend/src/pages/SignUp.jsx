import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, Sparkles, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGlobalToast } from '../context/ToastContext';
import api from '../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const toast = useGlobalToast();
  
  // Step: 1 = email, 2 = otp, 3 = details
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/customer/send-otp', { email: formData.email });
      if (response.success) {
        setOtpSent(true);
        setStep(2);
        toast.success('OTP sent to your email!');
      } else {
        // Check if email already exists
        if (response.exists) {
          toast.error('This email already has an account. Please login.');
          setTimeout(() => navigate('/signin'), 1500);
        } else {
          setError(response.message || 'Failed to send OTP');
          toast.error(response.message || 'Failed to send OTP');
        }
      }
    } catch (err) {
      // err.data comes from axios interceptor transformation
      const errorData = err.data || err.response?.data || err;
      // Check if email already exists
      if (errorData?.exists) {
        toast.error('This email already has an account. Please login.');
        setTimeout(() => navigate('/signin'), 1500);
      } else {
        const msg = errorData?.message || err.message || 'Failed to send OTP';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/customer/verify-otp', { 
        email: formData.email, 
        otp: formData.otp 
      });
      if (response.success) {
        setOtpVerified(true);
        setStep(3);
        toast.success('Email verified! Complete your profile.');
      } else {
        setError(response.message || 'Invalid OTP');
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        otp: formData.otp
      });
      
      if (result.success) {
        toast.signupSuccess(formData.name);
        navigate('/');
      } else {
        setError(result.message || 'Signup failed');
        toast.error(result.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await api.post('/customer/send-otp', { email: formData.email });
      if (response.success) {
        toast.success('New OTP sent!');
      }
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Kohinoor</span>
          </Link>
        </div>
        
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? 'bg-amber-500 text-white' : 'bg-neutral-700 text-neutral-400'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-amber-500' : 'bg-neutral-700'}`} />}
              </div>
            ))}
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {step === 1 && 'Create Account'}
            {step === 2 && 'Verify Email'}
            {step === 3 && 'Complete Profile'}
          </h2>
          <p className="text-neutral-400 text-center text-sm mb-6">
            {step === 1 && 'Enter your email to get started'}
            {step === 2 && `Enter the OTP sent to ${formData.email}`}
            {step === 3 && 'Fill in your details to complete signup'}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !formData.email}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          )}
          
          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Enter 6-digit OTP *</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || formData.otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
              </button>
              
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-amber-500 hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
          
          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Email verified: {formData.email}
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Phone (optional, 10 digits)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: value });
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-12 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>
            </form>
          )}
          
          <p className="text-center text-neutral-400 mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-amber-500 hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
