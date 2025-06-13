import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animations } from '@/styles/animations';

interface LayoutProps {
    children: ReactNode;
    className?: string;
}

export const Layout = ({ children, className = '' }: LayoutProps) => {
    return (
        <motion.div
            className={`min-h-screen bg-gray-50 ${className}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animations.pageTransition}
        >
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
                {children}
            </main>
        </motion.div>
    );
};

// Header Component
interface HeaderProps {
    children: ReactNode;
    className?: string;
}

export const Header = ({ children, className = '' }: HeaderProps) => (
    <motion.header
        className={`bg-white shadow-sm sticky top-0 z-50 ${className}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animations.fade.inDown}
    >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-7xl">
            {children}
        </div>
    </motion.header>
);

// Footer Component
interface FooterProps {
    children: ReactNode;
    className?: string;
}

export const Footer = ({ children, className = '' }: FooterProps) => (
    <motion.footer
        className={`bg-white border-t border-gray-200 ${className}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animations.fade.inUp}
    >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
            {children}
        </div>
    </motion.footer>
);

// Section Component
interface SectionProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

export const Section = ({ children, className = '', title }: SectionProps) => (
    <motion.section
        className={`mb-6 sm:mb-8 ${className}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animations.fade.in}
    >
        {title && (
            <motion.h2
                className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4"
                variants={animations.fade.in}
            >
                {title}
            </motion.h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {children}
        </div>
    </motion.section>
); 