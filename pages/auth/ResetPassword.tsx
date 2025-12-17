import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Eye, EyeOff, Leaf, Home, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { updatePasswordWithToken } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState<string | null>(null);

  useEffect(() => {
    // Get the reset token from sessionStorage
    const token = sessionStorage.getItem('password_reset_token');
    
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.');
    } else {
      setValidToken(token);
    }
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validToken) {
      setError('Invalid reset token. Please request a new reset link.');
      return;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      await updatePasswordWithToken(validToken, formData.password);
      // Clear the token from storage
      sessionStorage.removeItem('password_reset_token');
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center relative">
            <Link
              to="/"
              className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              title="Go to Home"
            >
              <Home className="w-5 h-5 text-white" />
            </Link>
            
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Password Reset!</h1>
          </div>

          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-gray-600 mb-4">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full inline-flex justify-center items-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (error && !validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center relative">
            <Link
              to="/"
              className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              title="Go to Home"
            >
              <Home className="w-5 h-5 text-white" />
            </Link>
            
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Invalid or Expired Link</h1>
          </div>

          <div className="p-8 text-center">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {error}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 transition-all"
              >
                Request New Link
              </Link>
              
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-emerald-300 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-medium transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center relative">
          <Link
            to="/"
            className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
            title="Go to Home"
          >
            <Home className="w-5 h-5 text-white" />
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          </div>
          <p className="text-emerald-100">Create a new secure password</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Enter your new password below. Make sure it's at least 6 characters long.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={`flex items-center space-x-2 ${formData.password.length >= 6 ? 'text-emerald-600' : ''}`}>
                  <span>{formData.password.length >= 6 ? '✓' : '○'}</span>
                  <span>At least 6 characters</span>
                </li>
                <li className={`flex items-center space-x-2 ${formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-emerald-600' : ''}`}>
                  <span>{formData.password === formData.confirmPassword && formData.confirmPassword ? '✓' : '○'}</span>
                  <span>Passwords match</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Resetting...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
