import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Home } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=verification_failed');
          return;
        }

        if (data.session) {
          navigate('/app/dashboard');
        } else {
          navigate('/login?message=email_confirmed');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login?error=verification_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      <div className="absolute top-4 left-4">
        <Link 
          to="/" 
          className="flex items-center gap-1 bg-white hover:bg-gray-50 text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-full transition-all shadow-sm border border-gray-200"
          aria-label="Back to home page"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>
      </div>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;