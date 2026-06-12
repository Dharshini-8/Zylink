import React from 'react';

export const Logo = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      
      {/* Left Link Loop */}
      <path
        d="M9 8H7C4.79 8 3 9.79 3 12C3 14.21 4.79 16 7 16H9"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Pulse Graph Line in the Center */}
      <path
        d="M9 12H10.5L11.5 6L12.5 18L13.5 10.5L15 12"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right Link Loop */}
      <path
        d="M15 8H17C19.21 8 21 9.79 21 12C21 14.21 19.21 16 17 16H15"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
