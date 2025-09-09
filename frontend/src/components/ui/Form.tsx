import React, { forwardRef, FormHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import Input, { InputProps } from './Input';
import Button, { ButtonProps } from './Button';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}

export interface FormFieldProps<T extends FieldValues = FieldValues>
  extends Omit<InputProps, 'name' | 'error' | 'form'> {
  name: FieldPath<T>;
  form: UseFormReturn<T>;
}

export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

/**
 * Form component system with React Hook Form integration
 * 
 * Features:
 * - Automatic form validation integration
 * - Consistent spacing and layout
 * - Accessible form structure
 * - Composable form elements
 */
const Form = forwardRef<HTMLFormElement, FormProps>(({
  children,
  spacing = 'md',
  className,
  ...props
}, ref) => {
  // Spacing styles
  const spacingStyles: Record<string, string> = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  const formStyles = clsx(
    'w-full',
    spacingStyles[spacing],
    className
  );

  return (
    <form
      ref={ref}
      role="form"
      className={clsx(formStyles, 'motion-reduce:transition-none')}
      {...props}
    >
      {children}
    </form>
  );
});

/**
 * Form Field component with automatic validation integration
 */
const FormField = <T extends FieldValues = FieldValues>({
  name,
  form,
  ...inputProps
}: FormFieldProps<T>) => {
  const {
    register,
    formState: { errors },
  } = form;

  const fieldError = errors[name];
  const errorMessage = fieldError?.message as string | undefined;

  const inputId = `field-${String(name).replace(/\./g, '-')}`;

  return (
    <Input
      id={inputId}
      {...register(name)}
      error={errorMessage}
      {...inputProps}
    />
  );
};

/**
 * Form Actions component for buttons and action elements
 */
const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(({
  children,
  align = 'right',
  className,
}, ref) => {
  // Alignment styles
  const alignStyles: Record<string, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  const actionsStyles = clsx(
    'flex items-center gap-3',
    alignStyles[align],
    'pt-2',
    className
  );

  return (
    <div ref={ref} className={clsx(actionsStyles, 'motion-reduce:transition-none')} role="group" aria-label="Form actions">
      {children}
    </div>
  );
});

/**
 * Form Submit Button with loading state integration
 */
interface FormSubmitButtonProps extends Omit<ButtonProps, 'type' | 'form'> {
  form?: UseFormReturn<any>;
  loadingText?: string;
}

const FormSubmitButton = forwardRef<HTMLButtonElement, FormSubmitButtonProps>(({
  form,
  loadingText = 'Submitting...',
  children,
  disabled,
  ...buttonProps
}, ref) => {
  const isSubmitting = form?.formState.isSubmitting || false;

  return (
    <Button
      ref={ref}
      type="submit"
      loading={isSubmitting}
      disabled={disabled || isSubmitting}
      {...buttonProps}
    >
      {isSubmitting ? loadingText : children}
    </Button>
  );
});

/**
 * Form Group component for grouping related fields
 */
interface FormGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(({
  title,
  description,
  children,
  className,
}, ref) => {
  const groupStyles = clsx(
    'space-y-4',
    className
  );

  return (
    <div ref={ref} className={groupStyles}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-secondary-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-secondary-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
});

/**
 * Form Error Summary component
 */
interface FormErrorSummaryProps {
  form: UseFormReturn<any>;
  title?: string;
  className?: string;
}

const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(({
  form,
  title = 'Please correct the following errors:',
  className,
}, ref) => {
  const { formState: { errors } } = form;
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  const handleFocusField = (fieldName: string) => {
    const byId = document.getElementById(`field-${String(fieldName).replace(/\./g, '-')}`);
    const byName = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${fieldName}"]`);
    const el = byId || byName;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  const summaryStyles = clsx(
    'p-4 rounded-md bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/40',
    className
  );

  return (
    <div ref={ref} className={summaryStyles} role="alert" aria-live="assertive">
      <h4 className="text-sm font-medium text-red-800 mb-2">
        {title}
      </h4>
      <ul className="text-sm text-red-700 space-y-1">
        {errorEntries.map(([field, error]) => (
          <li key={field}>
            <button
              type="button"
              className="underline decoration-dotted text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 transition-colors"
              onClick={() => handleFocusField(field)}
            >
              {(error as any)?.message || `${field} is invalid`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

// Set display names
Form.displayName = 'Form';
FormField.displayName = 'FormField';
FormActions.displayName = 'FormActions';
FormSubmitButton.displayName = 'FormSubmitButton';
FormGroup.displayName = 'FormGroup';
FormErrorSummary.displayName = 'FormErrorSummary';

// Export compound component
export default Object.assign(Form, {
  Field: FormField,
  Actions: FormActions,
  SubmitButton: FormSubmitButton,
  Group: FormGroup,
  ErrorSummary: FormErrorSummary,
});

// Export individual components
export { FormField, FormActions, FormSubmitButton, FormGroup, FormErrorSummary };
