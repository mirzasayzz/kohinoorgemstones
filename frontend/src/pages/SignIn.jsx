import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGlobalToast } from '../context/ToastContext';
import api from '../services/api';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useGlobalToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.loginSuccess(result.user?.name);
        navigate('/');
      } else if (result.requiresVerification) {
        toast.warning('Please verify your email first');
        navigate('/signup', { state: { email, needsVerification: true } });
      } else {
        toast.error(result.message || 'Login failed');
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP for password reset
  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/customer/forgot-password', { email });
      if (response.success) {
        toast.success('OTP sent to your email!');
        setForgotStep(2);
      } else {
        setError(response.message || 'Failed to send OTP');
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and move to password step
  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    // Move to step 3 - OTP will be verified when setting new password
    setForgotStep(3);
  };

  // Step 3: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/customer/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      if (response.success) {
        toast.success('Password reset successful! Please login.');
        resetForgotState();
      } else {
        setError(response.message || 'Failed to reset password');
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await api.post('/customer/forgot-password', { email });
      if (response.success) {
        toast.success('New OTP sent!');
      }
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Reset forgot password state
  const resetForgotState = () => {
    setForgotMode(false);
    setForgotStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Kohinoor</span>
          </Link>
        </div>
        
        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {forgotMode ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        forgotStep >= s ? 'bg-amber-500 text-white' : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        {forgotStep > s ? <CheckCircle className="w-5 h-5" /> : s}
                      </div>
                      {s < 3 && <div className={`w-8 h-0.5 ${forgotStep > s ? 'bg-amber-500' : 'bg-neutral-700'}`} />}
                    </div>
                  ))}
                </div>

                <h1 className="text-2xl font-bold text-white mb-2 text-center">
                  {forgotStep === 1 && 'Reset Password'}
                  {forgotStep === 2 && 'Verify OTP'}
                  {forgotStep === 3 && 'New Password'}
                </h1>
                <p className="text-neutral-400 mb-6 text-center text-sm">
                  {forgotStep === 1 && 'Enter your email to receive OTP'}
                  {forgotStep === 2 && `Enter the OTP sent to ${email}`}
                  {forgotStep === 3 && 'Create your new password'}
                </p>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Step 1: Email */}
                {forgotStep === 1 && (
                  <form onSubmit={handleSendResetOTP} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForgotState}
                      className="w-full text-center text-neutral-400 hover:text-white transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </form>
                )}

                {/* Step 2: OTP */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyResetOTP} className="space-y-4">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3.5 text-white text-center text-2xl tracking-[0.5em] placeholder:text-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
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

                {/* Step 3: New Password */}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4" /> OTP verified for {email}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="signin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSignIn}
              >
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-neutral-400 mb-6">Sign in to your Kohinoor account</p>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  
                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setError(''); }}
                      className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          
          {/* Create Account Link */}
          {!forgotMode && (
            <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
              <span className="text-neutral-400">New here? </span>
              <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-medium">
                Create an account
              </Link>
            </div>
          )}
        </div>
        
        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-neutral-500 hover:text-white transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
