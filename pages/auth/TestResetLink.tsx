import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Home, Leaf, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Test page to diagnose password reset link issues
 * Use this by replacing /reset-password with /test-reset-link in your email link
 */
const TestResetLink: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        url: {
          full: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname,
          hash: window.location.hash,
          search: window.location.search,
        },
        hashFragment: {
          raw: window.location.hash.substring(1),
          hasContent: window.location.hash.length > 1,
        },
        tokens: {},
        session: {},
        config: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      };

      // Parse hash parameters
      if (results.hashFragment.hasContent) {
        const hashParams = new URLSearchParams(results.hashFragment.raw);
        results.tokens = {
          access_token: hashParams.get('access_token') ? 'Present (hidden for security)' : 'Missing',
          refresh_token: hashParams.get('refresh_token') ? 'Present (hidden for security)' : 'Missing',
          type: hashParams.get('type') || 'Missing',
          error: hashParams.get('error') || 'None',
          error_description: hashParams.get('error_description') || 'None',
        };
      } else {
        results.tokens = {
          error: 'No hash fragment found in URL',
        };
      }

      // Wait for Supabase auto-detection
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        results.session = {
          hasSession: !!session,
          error: error?.message || 'None',
          user: session?.user ? {
            email: session.user.email,
            id: session.user.id,
          } : 'No user',
        };
      } catch (err: any) {
        results.session = {
          error: err.message,
        };
      }

      // Determine overall status
      if (results.session.hasSession) {
        results.status = 'success';
        results.message = 'Reset link is valid! Session established successfully.';
      } else if (!results.hashFragment.hasContent) {
        results.status = 'error';
        results.message = 'No token found in URL. The email link may be incorrect.';
      } else if (results.tokens.error && results.tokens.error !== 'None') {
        results.status = 'error';
        results.message = `Supabase returned an error: ${results.tokens.error_description}`;
      } else if (results.tokens.type !== 'recovery') {
        results.status = 'error';
        results.message = `Invalid token type: ${results.tokens.type}. Expected 'recovery'.`;
      } else {
        results.status = 'warning';
        results.message = 'Token found but session not established. May be expired.';
      }

      setDiagnostics(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  const StatusIcon = () => {
    switch (diagnostics.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (diagnostics.status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 relative">
            <Link
              to="/"
              className="absolute left-4 top-4 flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-all"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <div className="flex items-center justify-center space-x-2">
              <Leaf className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Password Reset Link Diagnostics</h1>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Running diagnostics...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Summary */}
                <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <StatusIcon />
                    <div>
                      <h2 className="text-xl font-bold mb-1">
                        {diagnostics.status === 'success' ? 'Success!' : 
                         diagnostics.status === 'error' ? 'Error Detected' : 
                         'Warning'}
                      </h2>
                      <p className="text-sm">{diagnostics.message}</p>
                    </div>
                  </div>
                </div>

                {/* URL Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">URL Information</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Full URL:</span>
                      <span className="col-span-2 break-all text-gray-800">{diagnostics.url?.full}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Origin:</span>
                      <span className="col-span-2 text-gray-800">{diagnostics.url?.origin}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Has Hash:</span>
                      <span className="col-span-2 text-gray-800">
                        {diagnostics.hashFragment?.hasContent ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Token Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Token Information</h3>
                  <div className="space-y-2 text-sm font-mono">
                    {Object.entries(diagnostics.tokens || {}).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2">
                        <span className="text-gray-600">{key}:</span>
                        <span className="col-span-2 text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Session Information</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Has Session:</span>
                      <span className="col-span-2 text-gray-800">
                        {diagnostics.session?.hasSession ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    {diagnostics.session?.user && typeof diagnostics.session.user === 'object' && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-gray-600">User Email:</span>
                        <span className="col-span-2 text-gray-800">{diagnostics.session.user.email}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Error:</span>
                      <span className="col-span-2 text-gray-800">{diagnostics.session?.error || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Configuration</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Supabase URL:</span>
                      <span className="col-span-2 text-gray-800">{diagnostics.config?.supabaseUrl}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Has Anon Key:</span>
                      <span className="col-span-2 text-gray-800">
                        {diagnostics.config?.hasAnonKey ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {diagnostics.status !== 'success' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
                      {!diagnostics.hashFragment?.hasContent && (
                        <>
                          <li>Check your email template uses: <code>{'{{ .SiteURL }}/reset-password'}</code></li>
                          <li>Verify Site URL in Supabase Dashboard is: <code>{window.location.origin}</code></li>
                          <li>Request a new password reset link</li>
                        </>
                      )}
                      {diagnostics.tokens?.type !== 'recovery' && diagnostics.hashFragment?.hasContent && (
                        <li>Token type is incorrect. This may not be a password reset link.</li>
                      )}
                      {diagnostics.tokens?.error !== 'None' && (
                        <>
                          <li>Add <code>{window.location.origin}/**</code> to Redirect URLs in Supabase Dashboard</li>
                          <li>Request a new password reset link after updating configuration</li>
                        </>
                      )}
                      {!diagnostics.session?.hasSession && diagnostics.hashFragment?.hasContent && (
                        <>
                          <li>Token may be expired (tokens expire after 1 hour)</li>
                          <li>Check your .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                          <li>Restart your dev server after changing .env</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  {diagnostics.status === 'success' ? (
                    <Link
                      to="/reset-password"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:from-emerald-600 hover:to-green-700"
                    >
                      Continue to Reset Password
                    </Link>
                  ) : (
                    <Link
                      to="/forgot-password"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:from-emerald-600 hover:to-green-700"
                    >
                      Request New Reset Link
                    </Link>
                  )}
                  <Link
                    to="/login"
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium text-center hover:bg-gray-300"
                  >
                    Back to Login
                  </Link>
                </div>

                {/* Raw Data (for debugging) */}
                <details className="bg-gray-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-gray-700">
                    View Raw Diagnostic Data (for developers)
                  </summary>
                  <pre className="mt-4 text-xs overflow-auto bg-white p-4 rounded border">
                    {JSON.stringify(diagnostics, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResetLink;
