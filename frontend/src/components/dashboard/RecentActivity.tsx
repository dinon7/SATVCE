import { motion } from 'framer-motion';
import { animations } from '@/styles/animations';

interface Activity {
    id: string;
    type: 'task' | 'quiz' | 'preference';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
    return (
        <motion.div
            className="space-y-4"
            variants={animations.stagger.container}
        >
            {activities.map((activity, index) => (
                <motion.div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                    variants={animations.stagger.item}
                    whileHover={animations.interactive.hover}
                >
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}; 