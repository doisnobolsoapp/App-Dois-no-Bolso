
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, size = 'md', variant = 'full' }) => {
  
  // Size mapping
  const sizeMap = {
    sm: { width: 32, height: 32, fontSize: 'text-lg' },
    md: { width: 48, height: 48, fontSize: 'text-xl' },
    lg: { width: 80, height: 80, fontSize: 'text-3xl' },
    xl: { width: 120, height: 120, fontSize: 'text-4xl' }
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div style={{ width, height }} className="relative flex-shrink-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
            {/* Left Figure (Dark Teal/Blue) */}
            <path 
                d="M100 165 C 60 165, 30 130, 45 85" 
                stroke="#0f4c5c" 
                strokeWidth="28" 
                strokeLinecap="round" 
            />
            <circle cx="45" cy="60" r="22" fill="#0f4c5c" />

            {/* Right Figure (Light Teal) */}
            <path 
                d="M100 165 C 140 165, 170 130, 155 85" 
                stroke="#2dd4bf" 
                strokeWidth="28" 
                strokeLinecap="round" 
            />
            <circle cx="155" cy="60" r="22" fill="#2dd4bf" />
            
            {/* Coin (Orange) */}
            <circle cx="100" cy="135" r="38" fill="#fb8500" stroke="white" strokeWidth="4"/>
            <text x="100" y="150" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="sans-serif">$</text>
        </svg>
      </div>
      
      {showText && variant === 'full' && (
        <div className="text-center mt-3">
            <h1 className={`font-extrabold text-slate-800 leading-none tracking-tight ${fontSize}`}>
               DOIS NO <span className="text-teal-500">BOLSO</span>
            </h1>
            {size !== 'sm' && (
                <p className="text-[10px] tracking-[0.3em] text-slate-400 mt-1.5 uppercase font-medium">
                    Finanças Inteligentes
                </p>
            )}
        </div>
      )}
    </div>
  );
};
