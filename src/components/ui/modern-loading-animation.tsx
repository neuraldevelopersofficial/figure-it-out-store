import React from 'react';

interface ModernLoadingAnimationProps {
  type?: 'card' | 'banner' | 'grid';
  count?: number;
  message?: string;
  className?: string;
}

/**
 * Modern loading animation component with consistent styling
 * Used across keychains, hero banner, and product cards
 */
export function ModernLoadingAnimation({ 
  type = 'card', 
  count = 3, 
  message = 'Loading amazing content...',
  className = ''
}: ModernLoadingAnimationProps) {
  
  const renderCardSkeleton = () => (
    <div className="relative w-full h-80 bg-white rounded-2xl overflow-hidden shadow-lg">
      {/* Gradient shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      
      {/* Floating dots animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Main loading circle */}
          <div className="w-16 h-16 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -left-2 w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -top-2 -right-2 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-red-500 via-purple-500 to-blue-500"></div>
      </div>
    </div>
  );

  const renderBannerSkeleton = () => (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
      {/* Gradient shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
      
      {/* Central loading animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Main loading circle */}
          <div className="w-20 h-20 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
          
          {/* Floating particles around the circle */}
          <div className="absolute -top-3 -left-3 w-4 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute -top-3 -right-3 w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute -bottom-3 -right-3 w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-red-500 via-purple-500 to-blue-500"></div>
      </div>
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative">
          <div className="relative w-full h-64 bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Gradient shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            
            {/* Floating dots animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Main loading circle */}
                <div className="w-12 h-12 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
                
                {/* Floating particles */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}></div>
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${index * 0.3}s` }}></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${index * 0.4}s` }}></div>
              </div>
            </div>
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-red-500 via-purple-500 to-blue-500"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLoadingText = () => (
    <div className="text-center mt-8">
      <div className="inline-flex items-center space-x-2 text-gray-600">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium animate-pulse">{message}</span>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {type === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="relative">
              {renderCardSkeleton()}
            </div>
          ))}
        </div>
      )}
      
      {type === 'banner' && renderBannerSkeleton()}
      
      {type === 'grid' && renderGridSkeleton()}
      
      {renderLoadingText()}
    </div>
  );
}

export default ModernLoadingAnimation;
