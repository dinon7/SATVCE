'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { animations } from '@/utils/animations';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

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

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    totalResources: number;
    totalQuizzes: number;
    totalReports: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [pendingResources, setPendingResources] = useState<PendingResource[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in');
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const token = await getToken();
                const response = await fetch('/api/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch admin stats');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch admin stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, getToken]);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            if (!user) return;

            try {
                const response = await fetch('/api/admin/activity', {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`
                    }
                });
                const data = await response.json();
                setRecentActivity(data);
            } catch (error) {
                console.error('Error fetching recent activity:', error);
            }
        };

        if (user) {
            fetchRecentActivity();
        }
    }, [user, getToken]);

    useEffect(() => {
        const fetchPendingResources = async () => {
            if (!user) return;

            try {
                const response = await fetch('/api/admin/pending-resources', {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`
                    }
                });
                const data = await response.json();
                setPendingResources(data);
            } catch (error) {
                console.error('Error fetching pending resources:', error);
            }
        };

        if (user) {
            fetchPendingResources();
        }
    }, [user, getToken]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!stats) {
        return <div>No stats available</div>;
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
                    Welcome, Admin {user?.firstName || 'User'}!
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
                            title: 'Total Courses',
                            value: stats.totalCourses,
                            icon: '📚',
                            color: 'bg-green-500'
                        },
                        {
                            title: 'Total Quizzes',
                            value: stats.totalQuizzes,
                            icon: '📝',
                            color: 'bg-orange-500'
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