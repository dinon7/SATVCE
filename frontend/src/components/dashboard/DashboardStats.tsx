import { motion } from 'framer-motion';
import { Card } from '../Card';
import { animations } from '@/styles/animations';

interface DashboardStatsProps {
    quizCount: number;
    preferencesCount: number;
    activityCount: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <motion.div
        variants={animations.fade.in}
        whileHover={animations.interactive.hover}
    >
        <Card className={`bg-gradient-to-br ${color} text-white`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </Card>
    </motion.div>
);

export const DashboardStats = ({ quizCount, preferencesCount, activityCount }: DashboardStatsProps) => {
    const stats = [
        {
            title: 'Quiz Results',
            value: quizCount,
            icon: '📊',
            color: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Saved Preferences',
            value: preferencesCount,
            icon: '⭐',
            color: 'from-green-500 to-green-600'
        },
        {
            title: 'Recent Activities',
            value: activityCount,
            icon: '📝',
            color: 'from-yellow-500 to-yellow-600'
        }
    ];

    return (
        <>
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </>
    );
}; 