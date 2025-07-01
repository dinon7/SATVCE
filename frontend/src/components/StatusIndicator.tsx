import React from 'react';
import { usePoolerStatus } from '@/hooks/usePoolerStatus';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function StatusIndicator({ showDetails = false, className = '' }: StatusIndicatorProps) {
  const { status, lastCheck, error, isChecking } = usePoolerStatus();

  // Status configuration
  const statusConfig = {
    healthy: {
      label: 'Connected',
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    degraded: {
      label: 'Degraded',
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    unhealthy: {
      label: 'Disconnected',
      icon: WifiOff,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    checking: {
      label: 'Checking...',
      icon: Wifi,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div className={`status-indicator ${className}`}>
      {/* Compact Status Badge */}
      <Badge 
        variant="outline" 
        className={`flex items-center gap-2 px-3 py-1 ${config.borderColor} ${config.textColor}`}
      >
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <IconComponent className="w-4 h-4" />
        <span className="text-sm font-medium">{config.label}</span>
        {isChecking && (
          <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
        )}
      </Badge>

      {/* Detailed Status Information */}
      {showDetails && (
        <div className={`mt-2 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
          <Alert>
            <IconComponent className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-1">
                <div>
                  <strong>Backend Status:</strong> {config.label}
                </div>
                {lastCheck && (
                  <div>
                    <strong>Last Check:</strong> {new Date(lastCheck).toLocaleTimeString()}
                  </div>
                )}
                {error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {status === 'unhealthy' && (
                  <div className="text-sm text-gray-600 mt-2">
                    Some features may be limited. Data will be cached locally.
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Offline Mode Notice */}
      {status === 'unhealthy' && !showDetails && (
        <div className="mt-2">
          <Alert variant="destructive" className="py-2">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Offline mode - using cached data
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

// Compact version for headers/navbars
export function CompactStatusIndicator() {
  return <StatusIndicator showDetails={false} />;
}

// Full version for status pages
export function FullStatusIndicator() {
  return <StatusIndicator showDetails={true} />;
} 