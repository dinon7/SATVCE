import { motion, HTMLMotionProps } from 'framer-motion';
import { InputHTMLAttributes, forwardRef } from 'react';
import { animations } from '@/styles/animations';

interface InputProps extends Omit<HTMLMotionProps<"input">, "ref"> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    fullWidth = false,
    className = '',
    ...props
}, ref) => {
    const baseStyles = 'block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm';
    const errorStyles = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
        <motion.div
            className={`${widthStyles} ${className}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animations.fade.in}
        >
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <motion.input
                ref={ref}
                className={`${baseStyles} ${errorStyles}`}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                {...props}
            />
            {error && (
                <motion.p
                    className="mt-1 text-sm text-error-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {error}
                </motion.p>
            )}
        </motion.div>
    );
}); 