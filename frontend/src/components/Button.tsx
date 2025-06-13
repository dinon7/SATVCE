import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { theme } from '@/styles/theme';
import { animations } from '@/styles/animations';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    onClick,
    className = '',
    type = 'button'
}: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantStyles = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
        error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <motion.button
            type={type}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? animations.interactive.hover : undefined}
            whileTap={!disabled && !loading ? animations.interactive.tap : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animations.fade.in}
        >
            {loading ? (
                <motion.div
                    className="mr-2"
                    animate={animations.loading.spin.animate}
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </motion.div>
            ) : null}
            {children}
        </motion.button>
    );
}; 