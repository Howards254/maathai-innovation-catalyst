import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Home, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Debug page to help diagnose password reset issues
 * Access this page by going to /debug-reset-password
 */
const DebugResetPassword: React.FC = () => {
  const location = useLocation();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const analyzeUrl = async () => {
      // Parse hash parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashData = {
        access_token: hashParams.get('access_token'),
        refresh_token: hashParams.get('refresh_token'),
        expires_in: hashParams.get('expires_in'),
        token_type: hashParams.get('token_type'),
        type: hashParams.get('type'),
      };

      // Parse query parameters
      const searchParams = new URLSearchParams(location.search);
      const queryData = {
        access_token: searchParams.get('access_token'),
        type: searchParams.get('type'),
        error: searchParams.get('error'),
        error_description: searchParams.get('error_description'),
      };

      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      // Get Supabase config
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

      setDebugInfo({
        hashData,
        queryData,
        sessionError: sessionError?.message,
        fullHash: window.location.hash,
        fullSearch: window.location.search,
        fullUrl: window.location.href,
        origin: window.location.origin,
        supabaseUrl,
        hasAnonKey,
        timestamp: new Date().toISOString(),
      });

      setSession(sessionData.session);
    };

    analyzeUrl();
  }, [location]);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Password Reset Debug</h1>
          <Link
            to="/"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Status Overview
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(!!debugInfo.hashData?.access_token)}
              <span className="text-gray-700">
                Access Token in Hash: {debugInfo.hashData?.access_token ? 'Found' : 'Not Found'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(debugInfo.hashData?.type === 'recovery')}
              <span className="text-gray-700">
                Type is Recovery: {debugInfo.hashData?.type || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(!!session)}
              <span className="text-gray-700">
                Session Active: {session ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(!!debugInfo.supabaseUrl && debugInfo.hasAnonKey)}
              <span className="text-gray-700">
                Supabase Configured: {debugInfo.supabaseUrl && debugInfo.hasAnonKey ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Hash Parameters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Hash Parameters</h2>
          <div className="bg-gray-50 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
              {JSON.stringify(debugInfo.hashData, null, 2)}
            </pre>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Full Hash:</strong>
            <div className="bg-gray-50 rounded p-2 mt-1 break-all font-mono text-xs">
              {debugInfo.fullHash || '(empty)'}
            </div>
          </div>
        </div>

        {/* Query Parameters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Query Parameters</h2>
          <div className="bg-gray-50 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
              {JSON.stringify(debugInfo.queryData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          {session ? (
            <div className="bg-gray-50 rounded p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800">
                {JSON.stringify(
                  {
                    user_id: session.user?.id,
                    email: session.user?.email,
                    expires_at: session.expires_at,
                    token_type: session.token_type,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
              No active session found
              {debugInfo.sessionError && (
                <div className="mt-2 text-sm">
                  <strong>Error:</strong> {debugInfo.sessionError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Supabase URL:</strong>{' '}
              <span className="font-mono text-gray-700">{debugInfo.supabaseUrl || 'Not set'}</span>
            </div>
            <div>
              <strong>Has Anon Key:</strong>{' '}
              <span className="font-mono text-gray-700">{debugInfo.hasAnonKey ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <strong>Origin:</strong>{' '}
              <span className="font-mono text-gray-700">{debugInfo.origin}</span>
            </div>
            <div>
              <strong>Expected Redirect URL:</strong>{' '}
              <span className="font-mono text-gray-700">{debugInfo.origin}/reset-password</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Recommendations</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            {!debugInfo.hashData?.access_token && (
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  No access token found in URL hash. Make sure you're clicking the link directly from
                  the password reset email.
                </span>
              </li>
            )}
            {debugInfo.hashData?.type !== 'recovery' && debugInfo.hashData?.access_token && (
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  Token type is not 'recovery'. This might be a different type of auth link.
                </span>
              </li>
            )}
            {!session && debugInfo.hashData?.access_token && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span>
                  Token found but no session created. Check Supabase Dashboard → Authentication → URL
                  Configuration and ensure '{debugInfo.origin}/reset-password' is in the Redirect URLs
                  list.
                </span>
              </li>
            )}
            {!debugInfo.supabaseUrl || !debugInfo.hasAnonKey ? (
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  Supabase is not properly configured. Check your .env file and ensure
                  VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
                </span>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>
                If everything looks correct here but still failing, check the browser console for
                additional error messages.
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            to="/reset-password"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Go to Reset Password Page
          </Link>
          <Link
            to="/forgot-password"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DebugResetPassword;
