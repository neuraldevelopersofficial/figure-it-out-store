import React from 'react';

interface LoadingAnimationProps {
  type?: 'hero' | 'banner' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  type = 'default', 
  size = 'md',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'hero':
        return 'text-white';
      case 'banner':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  if (type === 'hero') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[600px] ${className}`}>
        {/* Hero Loading Animation */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className={`${getSizeClasses()} border-4 border-white/20 border-t-white rounded-full animate-spin`}></div>
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full animate-pulse"></div>
        </div>
        
        {/* Loading text with fade animation */}
        <div className="mt-6 text-center">
          <p className="text-white text-lg font-medium animate-pulse">Loading Amazing Content...</p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'banner') {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        {/* Banner Loading Animation */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-gray-500 text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Default loading animation
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${getSizeClasses()} ${getTypeClasses()} border-4 border-gray-200 border-t-current rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingAnimation;
