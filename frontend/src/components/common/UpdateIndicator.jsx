import { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useBusinessContext } from '../../context/BusinessContext';

const UpdateIndicator = ({ showLastUpdate = true, className = "" }) => {
  const { businessInfo, loading, error, forceRefresh } = useBusinessContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualRefresh = async () => {
    if (!loading) {
      await forceRefresh();
    }
  };

  if (!showLastUpdate) return null;

  return (
    <div className={`flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      {/* Online/Offline Status */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="w-3 h-3 text-green-500" title="Online" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" title="Offline" />
        )}
      </div>

      {/* Update Status */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleManualRefresh}
          disabled={loading || !isOnline}
          className={`
            p-1 rounded transition-colors
            ${loading 
              ? 'text-blue-500 animate-spin cursor-not-allowed' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }
            ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title="Refresh business information"
        >
          <RefreshCw className="w-3 h-3" />
        </button>

        {error ? (
          <span className="text-red-500" title={error}>
            Error
          </span>
        ) : loading ? (
          <span className="text-blue-500">
            Updating...
          </span>
        ) : (
          <span>Ready</span>
        )}
      </div>
    </div>
  );
};

export default UpdateIndicator; 