import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Home, Leaf, ArrowLeft } from 'lucide-react';
import { showToast } from '../../utils/toast';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      setEmailSent(true);
      showToast.success('Password reset link sent to your email');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while sending the reset email';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          </div>
          <p className="text-emerald-100">Enter your email to receive a password reset link</p>
        </div>

        <div className="p-8">
          {emailSent ? (
            <div className="text-center space-y-6">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h2 className="text-lg font-medium text-emerald-700 mb-2">Email Sent!</h2>
                <p className="text-emerald-600">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-500 text-sm">
                  Didn't receive an email? Check your spam folder or try again.
                </p>
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  Try again with a different email
                </button>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mt-6"
              >
                <ArrowLeft className="w-4 h-4" />
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
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
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

export default ForgotPassword;
