// GlassCard.tsx
import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated';
}

export default function GlassCard({ 
  children, 
  className = '', 
  padding = 'md',
  variant = 'default' 
}: GlassCardProps) {
  const paddingMap = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    default: 'bg-white/70 border-white/50 backdrop-blur-xl shadow-lg',
    elevated: 'bg-white/90 border-white/80 backdrop-blur-2xl shadow-xl',
  };

  return (
    <div className={`rounded-xl border ${variantStyles[variant]} ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}
