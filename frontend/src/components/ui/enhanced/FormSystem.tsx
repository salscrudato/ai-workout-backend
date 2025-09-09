import React, { createContext, useContext, forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormReturn, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Enhanced Form System with Advanced Composition
 * 
 * This system provides a comprehensive form architecture with:
 * - Type-safe form field integration with React Hook Form
 * - Advanced validation and error handling
 * - Consistent styling and animations
 * - Accessibility-first design
 * - Flexible composition patterns
 */

// Form context for sharing form state
interface FormContextValue {
  form?: UseFormReturn<any>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled' | 'minimal';
}

const FormContext = createContext<FormContextValue>({});

export const useFormContext = () => useContext(FormContext);

// Enhanced Form Provider
export interface FormProviderProps {
  children: React.ReactNode;
  form?: UseFormReturn<any>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled' | 'minimal';
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  form,
  disabled = false,
  size = 'md',
  variant = 'default'
}) => {
  const contextValue = {
    form,
    disabled,
    size,
    variant,
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Enhanced Form Field component
export interface FormFieldProps<T extends FieldValues = FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'size'> {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  required?: boolean;
  showOptional?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled' | 'minimal';
  animate?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  name,
  label,
  description,
  required = false,
  showOptional = true,
  leftIcon,
  rightIcon,
  size: propSize,
  variant: propVariant,
  animate = true,
  className,
  type = 'text',
  ...props
}, ref) => {
  const { form, disabled: contextDisabled, size: contextSize, variant: contextVariant } = useFormContext();
  
  const size = propSize || contextSize || 'md';
  const variant = propVariant || contextVariant || 'default';
  const disabled = props.disabled || contextDisabled;

  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  // Get field state from form
  const fieldState = form?.getFieldState(name);
  const error = fieldState?.error;
  const isDirty = fieldState?.isDirty;
  const isValid = !error && isDirty;

  // Size styles
  const sizeStyles = {
    sm: {
      input: 'h-9 px-3 text-sm',
      label: 'text-sm',
      icon: 'w-4 h-4',
    },
    md: {
      input: 'h-11 px-4 text-base',
      label: 'text-sm',
      icon: 'w-5 h-5',
    },
    lg: {
      input: 'h-13 px-5 text-lg',
      label: 'text-base',
      icon: 'w-6 h-6',
    },
  };

  // Variant styles
  const variantStyles = {
    default: 'border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    outlined: 'border-2 border-slate-300 bg-transparent focus:border-blue-500',
    filled: 'border-0 bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20',
    minimal: 'border-0 border-b-2 border-slate-300 bg-transparent rounded-none focus:border-blue-500',
  };

  const inputStyles = clsx(
    'w-full rounded-xl transition-all duration-200 ease-out',
    'placeholder:text-slate-400',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
    sizeStyles[size].input,
    variantStyles[variant],
    leftIcon && 'pl-10',
    (rightIcon || isPassword) && 'pr-10',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
    isValid && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
    className
  );

  const labelStyles = clsx(
    'block font-medium text-slate-700 mb-2',
    sizeStyles[size].label,
    required && "after:content-['*'] after:text-red-500 after:ml-1"
  );

  return (
    <motion.div
      className="space-y-2"
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.2 }}
    >
      {/* Label */}
      {label && (
        <label htmlFor={name} className={labelStyles}>
          {label}
          {!required && showOptional && (
            <span className="text-slate-500 font-normal ml-2">(optional)</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={clsx(
            'absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400',
            sizeStyles[size].icon
          )}>
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        {form ? (
          <Controller
            name={name}
            control={form.control}
            render={({ field }) => (
              <input
                {...field}
                {...props}
                ref={ref}
                id={name}
                type={inputType}
                disabled={disabled}
                className={inputStyles}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={
                  error ? `${name}-error` : description ? `${name}-description` : undefined
                }
              />
            )}
          />
        ) : (
          <input
            {...props}
            ref={ref}
            id={name}
            name={name}
            type={inputType}
            disabled={disabled}
            className={inputStyles}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${name}-error` : description ? `${name}-description` : undefined
            }
          />
        )}

        {/* Right Icon / Password Toggle / Validation Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={clsx(
                'text-slate-400 hover:text-slate-600 transition-colors',
                sizeStyles[size].icon
              )}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className={clsx('text-slate-400', sizeStyles[size].icon)}>
              {rightIcon}
            </div>
          )}

          {/* Validation Icons */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={clsx('text-red-500', sizeStyles[size].icon)}
              >
                <AlertCircle />
              </motion.div>
            )}
            {isValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={clsx('text-green-500', sizeStyles[size].icon)}
              >
                <CheckCircle />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      {description && !error && (
        <p id={`${name}-description`} className="text-sm text-slate-600">
          {description}
        </p>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${name}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

FormField.displayName = 'FormField';

// Enhanced Form Actions component
export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  spacing = 'md',
  className
}) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  const spacingStyles = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  return (
    <div className={clsx(
      'flex items-center',
      alignStyles[align],
      spacingStyles[spacing],
      className
    )}>
      {children}
    </div>
  );
};

// Enhanced Form Group for organizing related fields
export interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  spacing = 'md',
  className
}) => {
  const spacingStyles = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={spacingStyles[spacing]}>
        {children}
      </div>
    </div>
  );
};
