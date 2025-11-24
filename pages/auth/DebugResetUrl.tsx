import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Leaf, Copy, Check } from 'lucide-react';

const DebugResetUrl: React.FC = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Parse hash parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashData: any = {};
    hashParams.forEach((value, key) => {
      hashData[key] = value;
    });

    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const queryData: any = {};
    searchParams.forEach((value, key) => {
      queryData[key] = value;
    });

    setDebugInfo({
      fullUrl: window.location.href,
      pathname: location.pathname,
      search: location.search,
      hash: window.location.hash,
      hashParams: hashData,
      queryParams: queryData,
      hasAccessToken: !!(hashData.access_token || queryData.access_token),
      hasRefreshToken: !!(hashData.refresh_token || queryData.refresh_token),
      type: hashData.type || queryData.type || 'none',
      timestamp: new Date().toISOString()
    });
  }, [location]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    if (debugInfo.hasAccessToken && debugInfo.type === 'recovery') {
      return 'bg-green-50 border-green-200 text-green-700';
    }
    return 'bg-red-50 border-red-200 text-red-700';
  };

  const getStatusMessage = () => {
    if (debugInfo.hasAccessToken && debugInfo.type === 'recovery') {
      return '✅ Valid reset token found! You can proceed to /reset-password';
    }
    if (!debugInfo.hasAccessToken) {
      return '❌ No access token found in URL';
    }
    if (debugInfo.type !== 'recovery') {
      return `❌ Invalid type: "${debugInfo.type}" (expected "recovery")`;
    }
    return '❌ Invalid reset link';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center relative">
            <Link 
              to="/" 
              className="absolute left-4 top-4 flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Password Reset URL Debug</h1>
            </div>
            <p className="text-emerald-100">Diagnostic information for password reset links</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Status */}
            <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
              <h2 className="text-lg font-semibold mb-2">Status</h2>
              <p className="text-sm">{getStatusMessage()}</p>
            </div>

            {/* URL Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Full URL</h3>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-gray-50 rounded border text-xs break-all">
                    {debugInfo.fullUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(debugInfo.fullUrl)}
                    className="p-3 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Pathname</h3>
                  <code className="block p-3 bg-gray-50 rounded border text-xs">
                    {debugInfo.pathname || 'none'}
                  </code>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Type</h3>
                  <code className="block p-3 bg-gray-50 rounded border text-xs">
                    {debugInfo.type}
                  </code>
                </div>
              </div>

              {/* Hash Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Hash Parameters (#)</h3>
                <div className="p-3 bg-gray-50 rounded border">
                  {Object.keys(debugInfo.hashParams || {}).length > 0 ? (
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(debugInfo.hashParams, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500">No hash parameters found</p>
                  )}
                </div>
              </div>

              {/* Query Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Query Parameters (?)</h3>
                <div className="p-3 bg-gray-50 rounded border">
                  {Object.keys(debugInfo.queryParams || {}).length > 0 ? (
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(debugInfo.queryParams, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500">No query parameters found</p>
                  )}
                </div>
              </div>

              {/* Token Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Access Token</h3>
                  <div className={`p-3 rounded border ${debugInfo.hasAccessToken ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs font-medium">
                      {debugInfo.hasAccessToken ? '✅ Present' : '❌ Missing'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Refresh Token</h3>
                  <div className={`p-3 rounded border ${debugInfo.hasRefreshToken ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <p className="text-xs font-medium">
                      {debugInfo.hasRefreshToken ? '✅ Present' : '⚠️ Missing'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                {!debugInfo.hasAccessToken && (
                  <>
                    <li>Check that the email link was copied completely</li>
                    <li>Verify Supabase redirect URLs include: http://localhost:3000/**</li>
                    <li>Check email template uses: {`{{ .SiteURL }}/reset-password`}</li>
                  </>
                )}
                {debugInfo.type !== 'recovery' && debugInfo.hasAccessToken && (
                  <li>Token type should be "recovery" for password reset</li>
                )}
                <li>Request a new password reset if the link is more than 1 hour old</li>
                <li>Clear browser cache and try in incognito mode</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                to="/forgot-password"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all text-center"
              >
                Request New Reset Link
              </Link>
              {debugInfo.hasAccessToken && debugInfo.type === 'recovery' && (
                <Link
                  to="/reset-password"
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-center"
                >
                  Go to Reset Password
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugResetUrl;
