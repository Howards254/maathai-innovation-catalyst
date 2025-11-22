import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
           <div className="text-center mb-8">
             <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">M</div>
             <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
             <p className="text-gray-500">Sign in to continue your impact journey.</p>
           </div>

           {error && (
             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
               {error}
             </div>
           )}

           <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                    placeholder="demo@example.com" 
                    required
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                    placeholder="password" 
                    required
                  />
              </div>
              <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                      <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-primary-600 hover:underline font-medium">Forgot password?</a>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="block w-full bg-primary-600 text-white text-center font-bold py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
           </form>
           
           <div className="mt-6 text-center text-sm text-gray-600">
               Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:underline">Join Now</Link>
           </div>
        </div>
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t border-gray-100">
            By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default Login;