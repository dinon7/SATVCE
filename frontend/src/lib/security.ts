/**
 * Security Utility
 * 
 * This module provides comprehensive security functionality for the frontend application,
 * implementing various security measures and best practices.
 */

import { error } from './logging';

// Security configuration
const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 8,
};

// Security state
let lastActivity = Date.now();
let loginAttempts = 0;

/**
 * Initialize security features
 */
export const initializeSecurity = (): void => {
  // Set up activity tracking
  document.addEventListener('mousemove', updateLastActivity);
  document.addEventListener('keypress', updateLastActivity);
  document.addEventListener('click', updateLastActivity);
  document.addEventListener('scroll', updateLastActivity);

  // Set up session timeout check
  setInterval(checkSessionTimeout, 60000); // Check every minute
};

/**
 * Update last activity timestamp
 */
const updateLastActivity = (): void => {
  lastActivity = Date.now();
};

/**
 * Check if session has timed out
 */
const checkSessionTimeout = (): void => {
  const now = Date.now();
  if (now - lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
    handleSessionTimeout();
  }
};

/**
 * Handle session timeout
 */
const handleSessionTimeout = async (): Promise<void> => {
  try {
    // Clerk will handle session timeout
    window.location.href = '/sign-in?timeout=true';
  } catch (err) {
    error('Failed to handle session timeout', err);
  }
};

/**
 * Validate password strength
 * @param password - The password to validate
 * @returns Validation result
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user input
 * @param input - The input to sanitize
 * @returns Sanitized input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Handle login attempt
 * @returns Whether the attempt is allowed
 */
export const handleLoginAttempt = (): boolean => {
  loginAttempts++;
  if (loginAttempts > SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  return true;
};

/**
 * Reset login attempts
 */
export const resetLoginAttempts = (): void => {
  loginAttempts = 0;
};

/**
 * Generate secure random string
 * @param length - Length of the string
 * @returns Secure random string
 */
export const generateSecureRandomString = (length: number): string => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash sensitive data
 * @param data - Data to hash
 * @returns Hashed data
 */
export const hashSensitiveData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Encrypt sensitive data
 * @param data - Data to encrypt
 * @param key - Encryption key
 * @returns Encrypted data
 */
export const encryptData = async (
  data: string,
  key: string
): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = await window.crypto.subtle.digest(
      'SHA-256',
      encoder.encode(key)
    );
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      cryptoKey,
      dataBuffer
    );
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);
    return btoa(String.fromCharCode.apply(null, Array.from(result)));
  } catch (err) {
    error('Failed to encrypt data', err);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt sensitive data
 * @param encryptedData - Data to decrypt
 * @param key - Decryption key
 * @returns Decrypted data
 */
export const decryptData = async (
  encryptedData: string,
  key: string
): Promise<string> => {
  try {
    const decoder = new TextDecoder();
    const dataBuffer = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );
    const iv = dataBuffer.slice(0, 12);
    const encryptedBuffer = dataBuffer.slice(12);
    const keyBuffer = await window.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(key)
    );
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      cryptoKey,
      encryptedBuffer
    );
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    error('Failed to decrypt data', err);
    throw new Error('Decryption failed');
  }
}; 