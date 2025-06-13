import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../Input';
import { Button } from '../Button';
import { animations } from '@/styles/animations';
import { useAuth } from '@/hooks/useAuth';

interface TaskFormProps {
    onTaskCreated?: () => void;
}

export const TaskForm = ({ onTaskCreated }: TaskFormProps) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    userId: user.uid,
                    status: 'pending'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                dueDate: ''
            });

            // Notify parent component
            onTaskCreated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            variants={animations.fade.in}
        >
            {error && (
                <motion.div
                    className="p-4 bg-error-50 text-error-600 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.div>
            )}

            <Input
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
                disabled={loading}
            />

            <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
                required
                disabled={loading}
            />

            <Input
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
                disabled={loading}
            />

            <div className="flex justify-end space-x-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData({
                        title: '',
                        description: '',
                        dueDate: ''
                    })}
                    disabled={loading}
                >
                    Clear
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                >
                    Create Task
                </Button>
            </div>
        </motion.form>
    );
}; 