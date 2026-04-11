import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'default', 
  className = '', 
  text = '', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizes = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const spinnerSize = sizes[size] || sizes.default;

  const spinner = (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${spinnerSize} animate-spin text-ayur-600`} />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-ayur-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">{text || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Specific loading components for common use cases
export const PageLoader = ({ text = 'Loading page...' }) => (
  <LoadingSpinner fullScreen text={text} />
);

export const ContentLoader = ({ text = 'Loading content...' }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="large" text={text} />
  </div>
);

export const ButtonLoader = ({ text = 'Processing...' }) => (
  <div className="inline-flex items-center">
    <LoadingSpinner size="small" className="mr-2" />
    <span>{text}</span>
  </div>
);

export const CardLoader = ({ text }) => (
  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
    <LoadingSpinner text={text} />
  </div>
);

export const InlineLoader = ({ text }) => (
  <div className="inline-flex items-center space-x-2">
    <LoadingSpinner size="small" />
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
);

// Table loading skeleton
export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <div className="bg-gray-50 p-4 border-b">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Card loading skeleton
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded w-full"></div>
      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
      <div className="h-3 bg-gray-100 rounded w-4/6"></div>
    </div>
    <div className="mt-4 flex space-x-2">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-8 bg-gray-100 rounded w-16"></div>
    </div>
  </div>
);

// Stats card skeleton
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-24"></div>
      <div className="h-8 w-8 bg-gray-100 rounded"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
    <div className="h-4 bg-gray-100 rounded w-20"></div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="flex items-center space-x-4 animate-pulse">
    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-3 bg-gray-100 rounded w-16"></div>
    </div>
  </div>
);

// List item skeleton
export const ListItemSkeleton = ({ showAvatar = false }) => (
  <div className="flex items-center space-x-4 p-4 animate-pulse">
    {showAvatar && <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>}
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
    </div>
    <div className="h-8 w-16 bg-gray-100 rounded"></div>
  </div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="space-y-6 animate-pulse">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-100 rounded w-full"></div>
      </div>
    ))}
    <div className="flex space-x-4 pt-4">
      <div className="h-10 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-100 rounded w-20"></div>
    </div>
  </div>
);

export default LoadingSpinner;