import React from 'react';
import ModernLoadingAnimation from './modern-loading-animation';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  type?: 'card' | 'banner' | 'grid';
  count?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  fullScreen = false,
  type = 'banner',
  count = 1
}) => {
  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-background' 
    : 'py-12 flex items-center justify-center bg-background';

  return (
    <div className={containerClasses}>
      <ModernLoadingAnimation 
        type={type}
        count={count}
        message={message}
        className="text-center"
      />
    </div>
  );
};

export default LoadingState;