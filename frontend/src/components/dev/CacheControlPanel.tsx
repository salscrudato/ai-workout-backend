import React, { useState } from 'react';
import { Trash2, RefreshCw, Info, Settings } from 'lucide-react';
import { clearAllCaches, forceRefresh, invalidateCache } from '../../utils/cache';

interface CacheControlPanelProps {
  className?: string;
}

/**
 * Development-only cache control panel for testing immediate updates
 * Only shows in development or when ?dev=true is in URL
 */
export const CacheControlPanel: React.FC<CacheControlPanelProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const isDev = import.meta.env.DEV;
  const showDevPanel = isDev || new URLSearchParams(window.location.search).has('dev');
  
  if (!showDevPanel) return null;

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAllCaches();
      // Show success message briefly
      setTimeout(() => setIsClearing(false), 1000);
    } catch (error) {
      console.error('Failed to clear caches:', error);
      setIsClearing(false);
    }
  };

  const handleInvalidatePattern = (pattern: string) => {
    invalidateCache(pattern);
    console.log(`Invalidated caches matching: ${pattern}`);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Cache Control (Dev)"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Cache Control</h3>
          </div>
          
          <div className="space-y-3">
            {/* Clear All Caches */}
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Clearing...' : 'Clear All Caches'}
            </button>

            {/* Force Refresh */}
            <button
              onClick={forceRefresh}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Force Refresh
            </button>

            {/* Quick Invalidations */}
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 mb-2">Quick Invalidate:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleInvalidatePattern('workout')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Workouts
                </button>
                <button
                  onClick={() => handleInvalidatePattern('user')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  User Data
                </button>
                <button
                  onClick={() => handleInvalidatePattern('api')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  API Cache
                </button>
                <button
                  onClick={() => handleInvalidatePattern('image')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Images
                </button>
              </div>
            </div>

            {/* Cache Status */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500">
                Cache minimization: <span className="font-mono text-green-600">ENABLED</span>
              </p>
              <p className="text-xs text-gray-500">
                TTL: API 30s, User 1m, Workout 30s
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheControlPanel;
