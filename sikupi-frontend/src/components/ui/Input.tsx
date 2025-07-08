'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseClasses = 'input-base w-full transition-all duration-200 focus:outline-none';
    
    const variants = {
      default: 'bg-white border-2',
      filled: 'bg-neutral-100 border-2 border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm h-9',
      md: 'px-4 py-3 text-base h-12',
      lg: 'px-5 py-4 text-lg h-14',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const hasLeftIcon = leftIcon;
    const hasRightIcon = rightIcon || isPassword;

    const inputClasses = cn(
      baseClasses,
      variants[variant],
      sizes[inputSize],
      hasLeftIcon && 'pl-12',
      hasRightIcon && 'pr-12',
      error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
      !error && variant === 'default' && 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500',
      !error && variant === 'filled' && 'focus:border-primary-500 focus:ring-primary-500',
      disabled && 'opacity-50 cursor-not-allowed bg-neutral-100',
      !fullWidth && 'w-auto',
      className
    );

    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <motion.label
            className={cn(
              'block text-sm font-medium mb-2 transition-colors duration-200',
              error ? 'text-error-600' : 'text-neutral-700',
              isFocused && !error && 'text-primary-600'
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 transition-colors duration-200',
              isFocused && !error && 'text-primary-500',
              error && 'text-error-500'
            )}>
              <span className={iconSizes[inputSize]}>
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            type={actualType}
            className={inputClasses}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
            {...(props as any)}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'text-neutral-400 hover:text-neutral-600 transition-colors duration-200 focus:outline-none',
                    isFocused && 'text-primary-500'
                  )}
                  tabIndex={-1}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <EyeOff className={iconSizes[inputSize]} />
                    ) : (
                      <Eye className={iconSizes[inputSize]} />
                    )}
                  </motion.div>
                </button>
              ) : (
                <span className={cn(
                  'text-neutral-400 transition-colors duration-200',
                  isFocused && !error && 'text-primary-500',
                  error && 'text-error-500',
                  iconSizes[inputSize]
                )}>
                  {rightIcon}
                </span>
              )}
            </div>
          )}

          {/* Error Icon */}
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className={cn('text-error-500', iconSizes[inputSize])} />
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-2 text-sm text-error-600 flex items-center"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        {helperText && !error && (
          <motion.p
            className="mt-2 text-sm text-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;