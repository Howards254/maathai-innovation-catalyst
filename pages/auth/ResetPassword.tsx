import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, Leaf, Home, Check } from 'lucide-react';
import { showToast } from '../../utils/toast';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // Check if we have a valid reset token
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Get the full hash fragment from URL
        const hashFragment = window.location.hash.substring(1);
        
        console.log('Password reset - Initial check:', { 
          fullUrl: window.location.href,
          hash: window.location.hash,
          hashFragment: hashFragment,
          pathname: window.location.pathname
        });
        
        // Give Supabase client time to auto-detect and process the session from URL
        // The detectSessionInUrl: true config means Supabase handles this automatically
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if Supabase has already established a session from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Password reset - Session check:', { 
          hasSession: !!session,
          sessionError: sessionError,
          user: session?.user?.email
        });
        
        if (session && session.user) {
          // Session was successfully established by Supabase from the URL hash
          console.log('Valid reset token - session established by Supabase');
          setValidToken(true);
          // Clear the hash from URL for security
          window.history.replaceState(null, '', window.location.pathname);
          setCheckingToken(false);
          return;
        }
        
        // If no session, check if we have hash parameters to manually process
        if (!hashFragment) {
          console.error('No hash fragment found in URL');
          setError('Invalid or expired reset link. Please request a new password reset.');
          showToast.error('Invalid or expired reset link. Please request a new password reset.');
          setValidToken(false);
          setCheckingToken(false);
          return;
        }
        
        // Parse hash parameters manually as fallback
        const hashParams = new URLSearchParams(hashFragment);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const errorCode = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        console.log('Password reset - Parsed tokens:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          type: type,
          error: errorCode,
          errorDescription: errorDescription
        });
        
        // Check for errors in the URL
        if (errorCode) {
          console.error('Error in reset URL:', errorCode, errorDescription);
          setError(errorDescription || 'An error occurred with the reset link.');
          showToast.error(errorDescription || 'Invalid reset link.');
          setValidToken(false);
          setCheckingToken(false);
          return;
        }
        
        if (!accessToken || type !== 'recovery') {
          console.error('Invalid token or type:', { accessToken: !!accessToken, type });
          setError('Invalid or expired reset link. Please request a new password reset.');
          showToast.error('Invalid or expired reset link. Please request a new password reset.');
          setValidToken(false);
          setCheckingToken(false);
          return;
        }
        
        // Manually exchange the token for a session as fallback
        console.log('Manually exchanging token for session...');
        const { data, error: exchangeError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (exchangeError || !data.session) {
          console.error('Session exchange error:', exchangeError);
          setError('Unable to establish session. The reset link may have expired.');
          showToast.error('Unable to establish session. Please request a new reset link.');
          setValidToken(false);
        } else {
          console.log('Valid reset token - session established manually');
          setValidToken(true);
          // Clear the hash from URL for security
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (err) {
        console.error('Error during token validation:', err);
        setError('An error occurred while validating the reset link.');
        showToast.error('An error occurred while validating the reset link.');
        setValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };
    
    checkToken();
  }, [location]);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const score = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars, isLongEnough]
      .filter(Boolean).length;

    if (score <= 2) setPasswordStrength('weak');
    else if (score <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showToast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (passwordStrength === 'weak') {
      setError('Please choose a stronger password');
      showToast.warning('Please choose a stronger password');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setSuccess(true);
      showToast.success('Password reset successfully! Redirecting to login...');
      
      // Sign out and redirect immediately
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update password. Please try again.';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center relative">
          <Link 
            to="/" 
            className="absolute left-4 top-4 flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
            aria-label="Back to home page"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Create New Password</h1>
          </div>
          <p className="text-emerald-100">Enter your new password below</p>
        </div>

        <div className="p-8">
          {checkingToken ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Verifying Reset Link...</h2>
              <p className="text-gray-600">
                Validating your password reset link...
              </p>
            </div>
          ) : success ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-emerald-100 rounded-full p-3">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Password Updated!</h2>
              <p className="text-gray-600">
                Your password has been successfully reset. Redirecting to login page...
              </p>
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
              >
                Go to Login
              </Link>
            </div>
          ) : !validToken ? (
            <div className="text-center space-y-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h2 className="text-lg font-medium text-red-700 mb-2">Invalid Reset Link</h2>
                <p className="text-red-600">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="block w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {/* New Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">Password strength:</span>
                      <span className="text-xs font-medium capitalize" 
                        style={{ 
                          color: passwordStrength === 'weak' ? '#ef4444' : 
                                 passwordStrength === 'medium' ? '#eab308' : '#22c55e' 
                        }}
                      >
                        {passwordStrength}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()}`} 
                        style={{ 
                          width: passwordStrength === 'weak' ? '33%' : 
                                 passwordStrength === 'medium' ? '66%' : '100%' 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use 8+ characters with a mix of letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
