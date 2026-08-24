import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Lock, User, Calendar, 
  ArrowRight, ArrowLeft, Loader2, Check, AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/config';

// Animated Eye Component - defined OUTSIDE the main component
const AnimatedEye = ({ isOpen, isFocused }) => (
  <div className="relative w-6 h-6">
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      animate={{ scale: isFocused ? 1.1 : 1 }}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-neutral-400">
        <motion.path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.circle
          cx="12"
          cy="12"
          r="3"
          fill="currentColor"
          animate={{ scaleY: isOpen ? 1 : 0.1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.path
          d="M1 12s4-8 11-8 11 8 11 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
      </svg>
    </motion.div>
    <AnimatePresence>
      {isOpen && isFocused && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Availability Indicator - defined OUTSIDE
const AvailabilityIndicator = ({ checking, available }) => {
  if (checking) return <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />;
  if (available === true) return <Check className="w-4 h-4 text-green-500" />;
  if (available === false) return <X className="w-4 h-4 text-red-500" />;
  return null;
};

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signup, login, verifyEmail, resendOTP, forgotPassword, resetPassword, checkEmail } = useAuth();
  
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slowRequest, setSlowRequest] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    dobDisplay: '',
    phone: '',
    city: '',
    otp: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const otpRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialMode]);

  // Wake up backend on modal open (helps with cold starts) - only in production
  useEffect(() => {
    if (isOpen && import.meta.env.PROD) {
      fetch(`${API_CONFIG.BASE_URL}/health`, { method: 'GET' }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(formData.email) && mode === 'signup') {
      setCheckingEmail(true);
      const timer = setTimeout(async () => {
        try {
          const available = await checkEmail(formData.email);
          setEmailAvailable(available);
        } catch {
          setEmailAvailable(null);
        }
        setCheckingEmail(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEmailAvailable(null);
    }
  }, [formData.email, mode, checkEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    setFormData(prev => ({ ...prev, otp: newOtpValues.join('') }));
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtpValues = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtpValues(newOtpValues);
    setFormData(prev => ({ ...prev, otp: newOtpValues.join('') }));
    
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    otpRefs.current[lastFilledIndex]?.focus();
  };

  const handleSignup = async () => {
    if (step === 1) {
      if (!formData.name.trim()) return setError('Please enter your name');
      if (!formData.email.trim()) return setError('Please enter your email');
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return setError('Please enter a valid email address');
      if (checkingEmail) return setError('Please wait, checking email...');
      if (emailAvailable === false) return setError('Email is already registered');
      setStep(2);
      return;
    }
    
    if (step === 2) {
      // DOB and Phone are optional
      setStep(3);
      return;
    }
    
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    
    setLoading(true);
    setError('');
    
    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        address: formData.city ? { city: formData.city } : undefined
      };
      
      // Only include dateOfBirth if provided
      if (formData.dateOfBirth) {
        signupData.dateOfBirth = formData.dateOfBirth;
      }
      
      const result = await signup(signupData);
      console.log('Signup result:', result);
      
      if (result && result.success) {
        setSuccess('Account created! Check your email for verification code.');
        setMode('verify');
        setResendTimer(60);
      } else if (result && result.message) {
        setError(result.message);
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email.trim()) return setError('Please enter your email');
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return setError('Please enter a valid email address');
    if (!formData.password) return setError('Please enter your password');
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result && result.success) {
        setSuccess('Welcome back!');
        setTimeout(() => onClose(), 1000);
      } else if (result && result.requiresVerification) {
        setSuccess('Verification code sent to your email!');
        setMode('verify');
        setResendTimer(60);
      } else if (result && result.message) {
        setError(result.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (formData.otp.length !== 6) return setError('Please enter the 6-digit code');
    
    setLoading(true);
    setError('');
    
    try {
      const result = await verifyEmail(formData.email, formData.otp);
      
      if (result.success) {
        setSuccess('Email verified! Welcome to Kohinoor!');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.message);
      setOtpValues(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      await resendOTP(formData.email);
      setSuccess('New code sent to your email');
      setResendTimer(60);
      setOtpValues(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) return setError('Please enter your email');
    
    setLoading(true);
    setError('');
    
    try {
      await forgotPassword(formData.email);
      setSuccess('Reset code sent to your email');
      setMode('reset');
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (formData.otp.length !== 6) return setError('Please enter the 6-digit code');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    
    setLoading(true);
    setError('');
    
    try {
      await resetPassword(formData.email, formData.otp, formData.password);
      setSuccess('Password reset successful! Please login.');
      setMode('login');
      setFormData(prev => ({ ...prev, password: '', otp: '' }));
      setOtpValues(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Input class styles
  const inputClass = "w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-white placeholder-neutral-400 transition-all duration-300";
  const inputWithSuffixClass = "w-full pl-12 pr-12 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-white placeholder-neutral-400 transition-all duration-300";

  const renderContent = () => {
    switch (mode) {
      case 'signup':
        return (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Create Account</h2>
              <p className="text-neutral-500 mt-1">Step {step} of 3</p>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-amber-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: s * 0.1 }}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Name Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  
                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputWithSuffixClass}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AvailabilityIndicator checking={checkingEmail} available={emailAvailable} />
                    </div>
                  </div>
                  {emailAvailable === false && (
                    <p className="text-red-500 text-sm ml-1">Email is already registered</p>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Date of Birth Input - DD-MM-YYYY format */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="dateOfBirth"
                      placeholder="DD-MM-YYYY (Optional)"
                      value={formData.dobDisplay || ''}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, ''); // Only digits
                        if (value.length > 8) value = value.slice(0, 8);
                        
                        // Auto-format as DD-MM-YYYY
                        let formatted = '';
                        if (value.length > 0) formatted = value.slice(0, 2);
                        if (value.length > 2) formatted += '-' + value.slice(2, 4);
                        if (value.length > 4) formatted += '-' + value.slice(4, 8);
                        
                        // Convert to YYYY-MM-DD for API
                        let apiFormat = '';
                        if (value.length === 8) {
                          const dd = value.slice(0, 2);
                          const mm = value.slice(2, 4);
                          const yyyy = value.slice(4, 8);
                          apiFormat = `${yyyy}-${mm}-${dd}`;
                        }
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          dobDisplay: formatted,
                          dateOfBirth: apiFormat 
                        }));
                      }}
                      className={inputClass}
                      maxLength={10}
                    />
                    <p className="text-xs text-neutral-500 mt-1 ml-1">Optional - Example: 15-08-1995</p>
                  </div>
                  
                  {/* Phone Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number (Optional)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  
                  {/* City Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City (Optional)"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Password Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className={inputWithSuffixClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                    >
                      <AnimatedEye isOpen={showPassword} isFocused={isPasswordFocused} />
                    </button>
                  </div>
                  
                  {/* Confirm Password Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className={inputWithSuffixClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                    >
                      <AnimatedEye isOpen={showConfirmPassword} isFocused={isPasswordFocused} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step === 3 ? (
                  'Create Account'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            <p className="text-center text-neutral-500 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => { setMode('login'); setStep(1); setError(''); }}
                className="text-amber-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        );

      case 'login':
        return (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Welcome Back</h2>
              <p className="text-neutral-500 mt-1">Sign in to continue</p>
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="text"
                inputMode="email"
                autoComplete="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={inputWithSuffixClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              >
                <AnimatedEye isOpen={showPassword} isFocused={isPasswordFocused} />
              </button>
            </div>

            <div className="text-right">
              <button 
                onClick={() => { setMode('forgot'); setError(''); }}
                className="text-amber-600 text-sm font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </motion.button>

            <p className="text-center text-neutral-500 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={() => { setMode('signup'); setStep(1); setError(''); }}
                className="text-amber-600 font-semibold hover:underline"
              >
                Create Account
              </button>
            </p>
          </motion.div>
        );

      case 'verify':
        return (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-full flex items-center justify-center"
              >
                <Mail className="w-10 h-10 text-amber-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Verify Your Email</h2>
              <p className="text-neutral-500 mt-2">
                We sent a 6-digit code to<br />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{formData.email}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex gap-2 justify-center">
              {otpValues.map((value, index) => (
                <motion.input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-12 h-14 text-center text-2xl font-bold bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-white transition-all duration-300"
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={loading || formData.otp.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Email'}
            </motion.button>

            <p className="text-center text-neutral-500 text-sm">
              Didn't receive the code?{' '}
              <button 
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || loading}
                className={`font-semibold ${resendTimer > 0 ? 'text-neutral-400' : 'text-amber-600 hover:underline'}`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </p>
          </motion.div>
        );

      case 'forgot':
        return (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Forgot Password?</h2>
              <p className="text-neutral-500 mt-1">Enter your email to receive a reset code</p>
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="text"
                inputMode="email"
                autoComplete="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
            </motion.button>

            <p className="text-center text-neutral-500 text-sm">
              Remember your password?{' '}
              <button 
                onClick={() => { setMode('login'); setError(''); }}
                className="text-amber-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        );

      case 'reset':
        return (
          <motion.div
            key="reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Reset Password</h2>
              <p className="text-neutral-500 mt-1">Enter the code and your new password</p>
            </div>

            {/* OTP Input */}
            <div className="flex gap-2 justify-center">
              {otpValues.map((value, index) => (
                <motion.input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-12 h-14 text-center text-2xl font-bold bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-white transition-all duration-300"
                />
              ))}
            </div>

            {/* New Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={inputWithSuffixClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              >
                <AnimatedEye isOpen={showPassword} isFocused={isPasswordFocused} />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </motion.button>

            <p className="text-center text-neutral-500 text-sm">
              <button 
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || loading}
                className={`font-semibold ${resendTimer > 0 ? 'text-neutral-400' : 'text-amber-600 hover:underline'}`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pt-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                  >
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
