import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-enteru-500 text-white hover:bg-enteru-600 focus:ring-enteru-500",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        outline: "border-2 border-enteru-200 bg-white text-enteru-600 hover:bg-enteru-50 hover:border-enteru-300 focus:ring-enteru-500 hover:text-enteru-600",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
        ghost: "text-gray-600 hover:text-enteru-600 hover:bg-enteru-50 focus:ring-enteru-500",
        gradient: "bg-gradient-to-r from-enteru-500 to-enteru-600 text-white hover:from-enteru-600 hover:to-enteru-700 focus:ring-enteru-500",
        glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 focus:ring-white/50",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconPosition = 'left', children, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <motion.div
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 