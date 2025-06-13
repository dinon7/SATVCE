/**
 * Error Handling and Logging Utility
 * 
 * This module provides comprehensive error handling and logging functionality
 * for the frontend application. It implements user-friendly error messages,
 * consistent error logging, and proper error recovery mechanisms.
 */

import { toast } from 'react-hot-toast';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN'
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  code?: string;
}

// Error messages for different error types
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Network error occurred. Please check your connection.',
  [ErrorType.AUTHENTICATION]: 'Authentication error. Please log in again.',
  [ErrorType.VALIDATION]: 'Invalid input. Please check your data.',
  [ErrorType.PERMISSION]: 'You don\'t have permission to perform this action.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Handle API errors with proper logging and user feedback
 * @param error - The error to handle
 * @param showToast - Whether to show a toast notification
 * @returns The processed error
 */
export const handleApiError = (error: any, showToast: boolean = true): AppError => {
  // Log the error
  console.error('API Error:', error);

  // Process the error
  const appError: AppError = {
    type: ErrorType.UNKNOWN,
    message: ERROR_MESSAGES[ErrorType.UNKNOWN],
    details: error
  };

  // Determine error type and message
  if (error.response) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      appError.type = ErrorType.AUTHENTICATION;
      appError.message = ERROR_MESSAGES[ErrorType.AUTHENTICATION];
    } else if (status === 422) {
      appError.type = ErrorType.VALIDATION;
      appError.message = ERROR_MESSAGES[ErrorType.VALIDATION];
      appError.details = error.response.data.details;
    } else if (status === 403) {
      appError.type = ErrorType.PERMISSION;
      appError.message = ERROR_MESSAGES[ErrorType.PERMISSION];
    }
  } else if (error.request) {
    appError.type = ErrorType.NETWORK;
    appError.message = ERROR_MESSAGES[ErrorType.NETWORK];
  }

  // Show toast notification if requested
  if (showToast) {
    toast.error(appError.message);
  }

  return appError;
};

/**
 * Handle form validation errors
 * @param errors - The validation errors
 * @returns Formatted error messages
 */
export const handleValidationErrors = (errors: Record<string, string[]>): string[] => {
  return Object.entries(errors).map(([field, messages]) => {
    return `${field}: ${messages.join(', ')}`;
  });
};

/**
 * Log user actions for analytics and debugging
 * @param action - The action performed
 * @param details - Additional details about the action
 */
export const logUserAction = (action: string, details?: any): void => {
  console.log('User Action:', {
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle unexpected errors with proper recovery
 * @param error - The unexpected error
 * @param fallback - Fallback function to execute
 */
export const handleUnexpectedError = (error: any, fallback?: () => void): void => {
  console.error('Unexpected Error:', error);
  toast.error('An unexpected error occurred. Please try again.');
  
  if (fallback) {
    try {
      fallback();
    } catch (fallbackError) {
      console.error('Fallback Error:', fallbackError);
    }
  }
};

/**
 * Validate input data
 * @param data - The data to validate
 * @param rules - Validation rules
 * @returns Validation result
 */
export const validateInput = (data: any, rules: Record<string, (value: any) => boolean>): boolean => {
  try {
    return Object.entries(rules).every(([field, validator]) => {
      const value = data[field];
      return validator(value);
    });
  } catch (error) {
    console.error('Validation Error:', error);
    return false;
  }
};

/**
 * Format error message for display
 * @param error - The error to format
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: AppError): string => {
  if (error.details && typeof error.details === 'object') {
    return `${error.message} (${JSON.stringify(error.details)})`;
  }
  return error.message;
}; 