import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'circle';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  shape = 'rounded',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (text: string) => {
    if (!text) return 'FE';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt || name}
        onError={() => setHasError(true)}
        className={`${sizeClasses[size]} ${shapeClass} object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${shapeClass} bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] font-bold flex items-center justify-center flex-shrink-0 select-none border border-[#E6E8EE] dark:border-[#334155] ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
