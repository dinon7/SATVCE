import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animations } from '@/styles/animations';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'bordered';
    hover?: boolean;
    onClick?: () => void;
}

export const Card = ({
    children,
    className = '',
    variant = 'default',
    hover = false,
    onClick
}: CardProps) => {
    const baseStyles = 'rounded-lg bg-white h-full';
    
    const variantStyles = {
        default: 'shadow-sm',
        elevated: 'shadow-md hover:shadow-lg transition-shadow duration-200',
        bordered: 'border border-gray-200'
    };

    const hoverStyles = hover ? 'cursor-pointer' : '';

    return (
        <motion.div
            className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
            onClick={onClick}
            whileHover={hover ? animations.interactive.hover : undefined}
            whileTap={hover ? animations.interactive.tap : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animations.fade.in}
        >
            {children}
        </motion.div>
    );
};

// Card Header Component
interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 ${className}`}>
        {children}
    </div>
);

// Card Body Component
interface CardBodyProps {
    children: ReactNode;
    className?: string;
}

export const CardBody = ({ children, className = '' }: CardBodyProps) => (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 ${className}`}>
        {children}
    </div>
);

// Card Footer Component
interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 ${className}`}>
        {children}
    </div>
); 