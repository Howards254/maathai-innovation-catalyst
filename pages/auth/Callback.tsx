import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a password recovery flow by looking at URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        
        // If this is a password recovery flow, handle it without auto-login
        if (type === 'recovery' || type === 'password_recovery') {
          if (accessToken) {
            // Store the recovery token temporarily
            sessionStorage.setItem('password_reset_token', accessToken);
            
            // Sign out to prevent auto-login
            await supabase.auth.signOut();
            
            // Redirect to reset password page
            navigate('/reset-password');
            return;
          } else {
            navigate('/reset-password?error=invalid_token');
            return;
          }
        }
        
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;