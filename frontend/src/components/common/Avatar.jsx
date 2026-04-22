import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

/**
 * Avatar component with robust icon fallback.
 * 
 * @param {string} src - The image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - Styling classes (should include size and shape, e.g., 'w-12 h-12 rounded-full')
 * @param {number} iconSize - Size of the fallback icon (default: 20)
 */
export const Avatar = ({ src, alt = 'User Avatar', className = '', iconSize = 20 }) => {
  // 1. State-based control: Initialize hasError based on src validity
  const [hasError, setHasError] = useState(!src || src === '');

  // 2. Explicitly handle changes in src (null, undefined, empty string)
  useEffect(() => {
    setHasError(!src || src === '');
  }, [src]);

  // 3. Prevent infinite error loops by locking the error state
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  // Common classes to ensure fallback matches image layout exactly
  const baseClasses = `object-cover bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`;

  if (hasError) {
    return (
      <div className={`${baseClasses} text-gray-400`} aria-label={alt}>
        <User size={iconSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={baseClasses}
      onError={handleError}
    />
  );
};
