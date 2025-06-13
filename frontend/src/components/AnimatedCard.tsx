import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    onClick?: () => void;
}

export const AnimatedCard = ({
    children,
    delay = 0,
    className = '',
    onClick
}: AnimatedCardProps) => {
    return (
        <motion.div
            className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            whileHover={{ y: -5 }}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}; 