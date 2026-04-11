import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Leaf, Mail, Lock, User, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api.js';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ─── OTP Input — 6 boxes ──────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = value.split('');

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      next[i] = '';
      onChange(next.join(''));
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = val;
    onChange(next.join(''));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors"
        />
      ))}
    </div>
  );
};

// ─── Main Register Component ──────────────────────────────────────────────────
export const Register = ({ onToggleMode }) => {
  const { login } = useAuth();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingFirstName, setPendingFirstName] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchPassword = watch('password');

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── Step 1: Submit form → send OTP ──────────────────────────────────────────
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const res = await apiService.post('/auth/send-otp', {
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        role: data.role,
        phone: data.phone || undefined,
      });

      if (res.success) {
        setPendingEmail(data.email);
        setPendingFirstName(firstName);
        setCooldown(60);
        setStep('otp');
      } else {
        setError(res.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP → create account ─────────────────────────────────────
  const onVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await apiService.post('/auth/verify-otp', { email: pendingEmail, otp });
      if (res.success) {
        const { user, token } = res.data;
        apiService.setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        // Use login dispatch via a small trick — reload to dashboard
        setTimeout(() => { window.location.href = '/dashboard'; }, 300);
      } else {
        setError(res.error || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const onResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setError('');
    setOtp('');
    try {
      // Re-submit the same form data — we need to re-call send-otp
      // We stored the email; trigger resend by calling send-otp again
      // (backend will allow after 60s cooldown)
      const res = await apiService.post('/auth/send-otp', {
        email: pendingEmail,
        // We don't have password here — backend will reject if user exists
        // So we pass a dummy; backend checks cooldown first
        _resend: true,
      });
      if (res.success) {
        setCooldown(60);
      } else {
        setError(res.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP Screen ──────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-600 p-3 rounded-full">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Verify your email</h2>
            <p className="mt-2 text-gray-600">
              We sent a 6-digit code to <span className="font-medium text-emerald-600">{pendingEmail}</span>
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <OtpInput value={otp} onChange={setOtp} />

            <button
              onClick={onVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify & Create Account'
              )}
            </button>

            <div className="text-center">
              <button
                onClick={onResend}
                disabled={cooldown > 0 || isLoading}
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => { setStep('form'); setError(''); setOtp(''); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-emerald-600 p-3 rounded-full">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join CuraOne</h2>
          <p className="mt-2 text-gray-600">Create your account to start your wellness journey</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                  type="text"
                  className={cn('block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500', errors.name ? 'border-red-300' : 'border-gray-300')}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                  type="email"
                  className={cn('block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500', errors.email ? 'border-red-300' : 'border-gray-300')}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select
                {...register('role', { required: 'Please select an account type' })}
                className={cn('block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500', errors.role ? 'border-red-300' : 'border-gray-300')}
              >
                <option value="">Select account type</option>
                <option value="patient">Patient</option>
                <option value="practitioner">Practitioner</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                  type={showPassword ? 'text' : 'password'}
                  className={cn('block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500', errors.password ? 'border-red-300' : 'border-gray-300')}
                  placeholder="Create a password"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  {...register('confirmPassword', { required: 'Please confirm your password', validate: v => v === watchPassword || 'Passwords do not match' })}
                  type="password"
                  className={cn('block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500', errors.confirmPassword ? 'border-red-300' : 'border-gray-300')}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button onClick={onToggleMode} className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
