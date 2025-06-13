import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { animations } from '@/styles/animations';
import { useAuth } from '@/hooks/useAuth';

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
    userId: string;
}

export const TaskList = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;

            try {
                const response = await fetch('/api/tasks', {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }

                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user]);

    const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            setTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            setTasks(prev => prev.filter(task => task.id !== taskId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-error-600">{error}</p>
                <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                    className="mt-4"
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">No tasks found. Create your first task!</p>
            </div>
        );
    }

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <motion.div
            className="space-y-4"
            variants={animations.stagger.container}
        >
            {tasks.map((task, index) => (
                <motion.div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg"
                    variants={animations.stagger.item}
                    whileHover={animations.interactive.hover}
                >
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)} border-0 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            <span className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                        >
                            Delete
                        </Button>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}; 