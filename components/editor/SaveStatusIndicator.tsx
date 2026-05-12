/**
 * Save Status Indicator Component
 * 
 * Displays the current auto-save status with visual feedback
 * 
 * Features:
 * - Shows "Saving...", "Saved", "Error", "Offline" states
 * - Visual indicators with icons and colors
 * - Last saved timestamp
 * - Queued saves count when offline
 * 
 * Requirements:
 * - 14.7: Show save status indicators
 * - 29.3: Display offline queue status
 */

'use client';

import { useAutoSave, type SaveStatus } from '@/hooks/use-auto-save';
import { 
  Cloud, 
  CloudOff, 
  Check, 
  Loader2, 
  AlertCircle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SaveStatusIndicatorProps {
  className?: string;
  showLastSaved?: boolean; // Show "Last saved X ago" text
  showQueuedCount?: boolean; // Show queued saves count when offline
}

/**
 * Save Status Indicator
 * 
 * Usage:
 * ```tsx
 * <SaveStatusIndicator 
 *   showLastSaved={true}
 *   showQueuedCount={true}
 * />
 * ```
 */
export function SaveStatusIndicator({
  className = '',
  showLastSaved = true,
  showQueuedCount = true,
}: SaveStatusIndicatorProps) {
  const { 
    saveStatus, 
    isOnline, 
    lastSavedAt, 
    queuedSaves,
    forceSave,
  } = useAutoSave();
  
  const getStatusConfig = (status: SaveStatus) => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          iconClass: 'animate-spin',
        };
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          iconClass: '',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          iconClass: '',
        };
      case 'offline':
        return {
          icon: CloudOff,
          text: 'Offline',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          iconClass: '',
        };
      default:
        return {
          icon: Cloud,
          text: 'Auto-save enabled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          iconClass: '',
        };
    }
  };
  
  const config = getStatusConfig(saveStatus);
  const Icon = config.icon;
  
  const formatLastSaved = () => {
    if (!lastSavedAt) return null;
    
    try {
      return formatDistanceToNow(lastSavedAt, { addSuffix: true });
    } catch (error) {
      console.error('Failed to format last saved time:', error);
      return null;
    }
  };
  
  const handleRetry = () => {
    if (saveStatus === 'error' && isOnline) {
      forceSave();
    }
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Badge */}
      <div
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
          ${config.bgColor} ${config.color}
          text-sm font-medium
          transition-all duration-200
        `}
      >
        <Icon className={`w-4 h-4 ${config.iconClass}`} />
        <span>{config.text}</span>
      </div>
      
      {/* Last Saved Time */}
      {showLastSaved && lastSavedAt && saveStatus !== 'saving' && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Last saved {formatLastSaved()}</span>
        </div>
      )}
      
      {/* Queued Saves Count */}
      {showQueuedCount && queuedSaves > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-medium">
          <span>{queuedSaves} queued</span>
        </div>
      )}
      
      {/* Retry Button (on error) */}
      {saveStatus === 'error' && isOnline && (
        <button
          onClick={handleRetry}
          className="
            px-2 py-1 rounded-md
            bg-red-50 text-red-600
            hover:bg-red-100
            text-xs font-medium
            transition-colors
          "
        >
          Retry
        </button>
      )}
      
      {/* Offline Message */}
      {!isOnline && (
        <div className="text-xs text-orange-600">
          Changes will be saved when connection is restored
        </div>
      )}
    </div>
  );
}
