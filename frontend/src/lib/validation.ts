/**
 * Form Validation Utility
 * 
 * This module provides comprehensive form validation functionality,
 * implementing various validation rules and error handling mechanisms.
 */

import { z } from 'zod';

// Common validation patterns
export const patterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^\+?[\d\s-]{10,}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// Common validation messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
  minLength: (length: number) => `Must be at least ${length} characters`,
  maxLength: (length: number) => `Must be at most ${length} characters`,
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
  number: 'Please enter a valid number',
  integer: 'Please enter a valid integer',
  positive: 'Please enter a positive number',
  date: 'Please enter a valid date',
};

// Common validation schemas
export const schemas = {
  email: z.string().email(messages.email),
  password: z.string().regex(patterns.password, messages.password),
  phone: z.string().regex(patterns.phone, messages.phone),
  url: z.string().regex(patterns.url, messages.url),
  required: z.string().min(1, messages.required),
  optional: z.string().optional(),
  number: z.number().min(0, messages.positive),
  integer: z.number().int(messages.integer),
  date: z.string().datetime(messages.date),
};

/**
 * Create a form validation schema
 * @param schema - The validation schema
 * @returns Zod schema
 */
export const createFormSchema = (schema: Record<string, z.ZodTypeAny>) => {
  return z.object(schema);
};

/**
 * Validate form data
 * @param data - The data to validate
 * @param schema - The validation schema
 * @returns Validation result
 */
export const validateForm = <T>(
  data: T,
  schema: z.ZodSchema<T>
): { success: boolean; errors?: Record<string, string[]> } => {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: ['An unexpected error occurred'] } };
  }
};

/**
 * Format validation errors for display
 * @param errors - The validation errors
 * @returns Formatted error messages
 */
export const formatValidationErrors = (errors: Record<string, string[]>): string[] => {
  return Object.entries(errors).map(([field, messages]) => {
    return `${field}: ${messages.join(', ')}`;
  });
};

/**
 * Create a field validator
 * @param schema - The validation schema
 * @returns Field validator function
 */
export const createFieldValidator = (schema: z.ZodTypeAny) => {
  return (value: any): string | null => {
    try {
      schema.parse(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return 'Invalid value';
    }
  };
};

/**
 * Create a form validator
 * @param schema - The validation schema
 * @returns Form validator function
 */
export const createFormValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: T): Record<string, string[]> | null => {
    try {
      schema.parse(data);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        return errors;
      }
      return { _form: ['An unexpected error occurred'] };
    }
  };
};

export const handleValidationError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export const validateWithZod = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(err => err.message).join(', '));
    }
    throw error;
  }
}; 