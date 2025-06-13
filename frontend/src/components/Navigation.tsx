'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { animations } from '@/utils/animations';

interface NavItem {
    label: string;
    path: string;
    icon: string;
    roles: ('student' | 'admin')[];
}

const studentNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['student'] },
    { label: 'Career Quiz', path: '/quiz', icon: '🎯', roles: ['student'] },
    { label: 'Subjects', path: '/subjects', icon: '📚', roles: ['student'] },
    { label: 'Careers', path: '/careers', icon: '💼', roles: ['student'] },
    { label: 'Courses', path: '/courses', icon: '🎓', roles: ['student'] },
    { label: 'Resources', path: '/resources', icon: '📖', roles: ['student'] },
    { label: 'Preferences', path: '/preferences', icon: '⭐', roles: ['student'] }
];

const adminNavItems: NavItem[] = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: '📊', roles: ['admin'] },
    { label: 'Manage Subjects', path: '/admin/subjects', icon: '📚', roles: ['admin'] },
    { label: 'Manage Careers', path: '/admin/careers', icon: '💼', roles: ['admin'] },
    { label: 'Manage Courses', path: '/admin/courses', icon: '🎓', roles: ['admin'] },
    { label: 'Manage Resources', path: '/admin/resources', icon: '📖', roles: ['admin'] },
    { label: 'Analytics', path: '/admin/analytics', icon: '📈', roles: ['admin'] },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️', roles: ['admin'] }
];

export const Navigation = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAdmin, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = isAdmin ? adminNavItems : studentNavItems;

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => router.push('/')}
                    >
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">VCE Guide</span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                        {user ? (
                            <>
                                {navItems.map((item) => (
                                    <motion.button
                                        key={item.path}
                                        className={`px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 text-sm lg:text-base ${
                                            pathname === item.path
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(item.path)}
                                    >
                                        <span className="text-base lg:text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </motion.button>
                                ))}
                                <motion.button
                                    className="px-3 lg:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm lg:text-base"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <motion.button
                                    className="px-3 lg:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm lg:text-base"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/login')}
                                >
                                    Login
                                </motion.button>
                                <motion.button
                                    className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm lg:text-base"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/signup')}
                                >
                                    Sign Up
                                </motion.button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </motion.button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            className="md:hidden absolute left-0 right-0 bg-white shadow-lg"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="py-2 space-y-1">
                                {user ? (
                                    <>
                                        {navItems.map((item) => (
                                            <motion.button
                                                key={item.path}
                                                className={`w-full px-4 py-3 rounded-lg flex items-center space-x-3 text-sm ${
                                                    pathname === item.path
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    router.push(item.path);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                <span>{item.label}</span>
                                            </motion.button>
                                        ))}
                                        <motion.button
                                            className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSignOut}
                                        >
                                            Sign Out
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <motion.button
                                            className="w-full px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                router.push('/login');
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            Login
                                        </motion.button>
                                        <motion.button
                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                router.push('/signup');
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            Sign Up
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}; 