'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      isPassword,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm text-black font-medium  mb-1.5"// text-[#111827
          >
            {label}
            {props.required && <span className="text-[#EF4444] ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base styles
              'w-full h-12 px-4 rounded-lg',
              'text-[#111827] placeholder:text-[#9CA3AF]',
              'bg-white border border-[#E5E7EB]',
              'transition-all duration-200',
              // Focus styles
              'focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20',
              // Error styles
              error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20',
              // Disabled styles
              disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
              // Icon padding
              leftIcon && 'pl-11',
              (rightIcon || isPassword) && 'pr-11',
              // Custom classes
              className
            )}
            disabled={disabled}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[#6B7280]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-[#111827] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#EF4444] ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-lg min-h-[120px] resize-y',
            'text-[#111827] placeholder:text-[#9CA3AF]',
            'bg-white border border-[#E5E7EB]',
            'transition-all duration-200',
            'focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20',
            error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
            className
          )}
          disabled={disabled}
          {...props}
        />

        {error && <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-[#6B7280]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-[#111827] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#EF4444] ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          className={cn(
            'w-full h-12 px-4 rounded-lg appearance-none',
            'text-[#111827] bg-white border border-[#E5E7EB]',
            'transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239CA3AF\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]',
            error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
            className
          )}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Checkbox Component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'w-5 h-5 mt-0.5 rounded border-[#E5E7EB]',
            'text-[#10B981] focus:ring-[#10B981] focus:ring-offset-0',
            'cursor-pointer',
            className
          )}
          {...props}
        />
        <label
          htmlFor={props.id}
          className="ml-2 text-sm text-[#374151] cursor-pointer select-none"
        >
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Input;
