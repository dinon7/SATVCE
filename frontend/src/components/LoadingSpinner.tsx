import { motion } from 'framer-motion';
import { animations } from '@/styles/animations';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <motion.div
            className={`flex justify-center items-center ${className}`}
            initial="initial"
            animate="animate"
            variants={animations.fade.in}
        >
            <motion.div
                className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full`}
                animate={animations.loading.spin.animate}
            />
        </motion.div>
    );
}; 