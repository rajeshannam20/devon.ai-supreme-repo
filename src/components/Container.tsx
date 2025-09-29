
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  animate?: boolean;
}

const maxWidthClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
  none: ''
};

const Container = ({ 
  children, 
  className, 
  as: Component = 'div', 
  maxWidth = 'xl',
  animate = false 
}: ContainerProps) => {
  const containerClasses = cn(
    'w-full mx-auto px-4 sm:px-6 md:px-8',
    maxWidthClasses[maxWidth],
    className
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={containerClasses}
      >
        {children}
      </motion.div>
    );
  }

  return <Component className={containerClasses}>{children}</Component>;
};

export default Container;
