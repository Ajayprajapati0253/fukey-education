import React from 'react';

interface StudentAvatarProps {
  name: string;
  initials: string;
  avatarUrl?: string;
  avatarBgColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIllustration?: boolean;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  name,
  initials,
  avatarUrl,
  avatarBgColor = 'bg-blue-600',
  size = 'md',
  showIllustration = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs font-semibold',
    lg: 'w-14 h-14 text-lg font-bold',
    xl: 'w-24 h-24 text-2xl font-bold',
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[#e2e8f0] dark:border-slate-700/60 shadow-2xs`}
      />
    );
  }

  if (showIllustration) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-blue-500/40 shadow-lg flex items-center justify-center p-1`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#1e293b" />
          <circle cx="50" cy="50" r="46" fill="#fbcfe8" opacity="0.1" />
          <path d="M42 60 H58 V75 H42 Z" fill="#f6c8a7" />
          <path d="M32 40 C32 26 40 22 50 22 C60 22 68 26 68 40 C68 53 59 62 50 62 C41 62 32 53 32 40 Z" fill="#f6c8a7" />
          <path d="M30 38 C31 24 40 18 50 18 C62 18 69 25 70 36 C66 32 60 30 52 30 C42 30 36 34 30 38 Z" fill="#1e1b4b" />
          <path d="M30 38 C32 32 36 29 42 28 C37 32 35 37 34 43 C32 42 31 40 30 38 Z" fill="#1e1b4b" />
          <circle cx="44" cy="42" r="2.2" fill="#0f172a" />
          <circle cx="56" cy="42" r="2.2" fill="#0f172a" />
          <path d="M41 38 Q44 36 47 38" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M53 38 Q56 36 59 38" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M49 45 L51 47" stroke="#d99979" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M46 51 Q50 55 54 51" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 100 C22 76 34 70 50 70 C66 70 78 76 78 100 Z" fill="#6366f1" />
          <path d="M40 70 C43 78 50 82 50 82 C50 82 57 78 60 70 C56 74 53 75 50 75 C47 75 44 74 40 70 Z" fill="#4f46e5" />
          <path d="M26 38 C26 22 36 14 50 14 C64 14 74 22 74 38" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <rect x="23" y="34" width="7" height="15" rx="3.5" fill="#3b82f6" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="70" y="34" width="7" height="15" rx="3.5" fill="#3b82f6" stroke="#1e293b" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full ${avatarBgColor} text-white flex items-center justify-center font-semibold tracking-tight shadow-2xs shrink-0`}>
      {initials}
    </div>
  );
};

export default StudentAvatar;