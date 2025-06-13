'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { animations } from '@/utils/animations';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface DashboardStats {
    totalUsers: number;
    totalQuizzes: number;
    totalReports: number;
    activeUsers: number;
}

interface RecentActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
}

interface PendingResource {
    id: string;
    title: string;
    category: string;
    submittedBy: string;
    submittedAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [pendingResources, setPendingResources] = useState<PendingResource[]>([]);

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Fetch dashboard statistics
                const statsResponse = await fetch('/api/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${await user?.getIdToken()}`
                    }
                });
                const statsData = await statsResponse.json();
                setStats(statsData);

                // Fetch recent activity
                const activityResponse = await fetch('/api/admin/activity', {
                    headers: {
                        'Authorization': `Bearer ${await user?.getIdToken()}`
                    }
                });
                const activityData = await activityResponse.json();
                setRecentActivity(activityData);

                // Fetch pending resources
                const resourcesResponse = await fetch('/api/admin/pending-resources', {
                    headers: {
                        'Authorization': `Bearer ${await user?.getIdToken()}`
                    }
                });
                const resourcesData = await resourcesResponse.json();
                setPendingResources(resourcesData);
            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user, isAdmin, router]);

    if (loading) {
        return (
            <motion.div
                className="flex justify-center items-center min-h-screen"
                {...animations.fadeIn}
            >
                <LoadingSpinner />
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8"
            {...animations.pageTransition}
        >
            {/* Welcome Section */}
            <motion.div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-2">
                    Welcome, Admin {user?.displayName}!
                </h1>
                <p className="text-purple-100">
                    Manage the VCE Subject Selection & Career Guidance platform.
                </p>
            </motion.div>

            {/* Quick Stats */}
            {stats && (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {[
                        {
                            title: 'Total Users',
                            value: stats.totalUsers,
                            icon: '👥',
                            color: 'bg-blue-500'
                        },
                        {
                            title: 'Total Quizzes',
                            value: stats.totalQuizzes,
                            icon: '📝',
                            color: 'bg-green-500'
                        },
                        {
                            title: 'Total Reports',
                            value: stats.totalReports,
                            icon: '📊',
                            color: 'bg-yellow-500'
                        },
                        {
                            title: 'Active Users',
                            value: stats.activeUsers,
                            icon: '🌟',
                            color: 'bg-purple-500'
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            className={`${stat.color} rounded-lg p-6 text-white`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        >
                            <div className="text-4xl mb-2">{stat.icon}</div>
                            <h3 className="text-lg font-semibold mb-1">{stat.title}</h3>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                {[
                    {
                        title: 'Manage Subjects',
                        description: 'Add, edit, or remove VCE subjects',
                        icon: '📚',
                        path: '/admin/subjects'
                    },
                    {
                        title: 'Manage Careers',
                        description: 'Update career information and pathways',
                        icon: '💼',
                        path: '/admin/careers'
                    },
                    {
                        title: 'System Settings',
                        description: 'Configure platform settings',
                        icon: '⚙️',
                        path: '/admin/settings'
                    }
                ].map((action, index) => (
                    <motion.div
                        key={index}
                        className="bg-white rounded-lg shadow-lg p-6 cursor-pointer"
                        whileHover={{ y: -5 }}
                        onClick={() => router.push(action.path)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                        <div className="text-4xl mb-4">{action.icon}</div>
                        <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                        <p className="text-gray-600">{action.description}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Pending Resources */}
            {pendingResources.length > 0 && (
                <motion.div
                    className="bg-white rounded-lg shadow-lg p-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <h2 className="text-2xl font-bold mb-4">Pending Resources</h2>
                    <div className="space-y-4">
                        {pendingResources.map((resource, index) => (
                            <motion.div
                                key={resource.id}
                                className="border rounded-lg p-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{resource.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            Submitted by {resource.submittedBy} on {resource.submittedAt}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <motion.button
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {/* Handle approve */}}
                                        >
                                            Approve
                                        </motion.button>
                                        <motion.button
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {/* Handle reject */}}
                                        >
                                            Reject
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
                <motion.div
                    className="bg-white rounded-lg shadow-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                className="flex items-center space-x-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                            >
                                <div className="text-2xl">{activity.type === 'user' ? '👤' : '📝'}</div>
                                <div>
                                    <p className="font-medium">{activity.description}</p>
                                    <p className="text-sm text-gray-600">
                                        {activity.user} • {activity.timestamp}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
} 