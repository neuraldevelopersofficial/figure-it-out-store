import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-background' 
    : 'py-12 flex items-center justify-center bg-background';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;