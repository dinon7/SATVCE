'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export default function TaskList() {
    const { user, isLoaded } = useUser();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');

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

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            return;
        }

        fetchTasks();
    }, [user, isLoaded]);

    const toggleTask = async (taskId: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    completed: !task.completed,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            fetchTasks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            fetchTasks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (!isLoaded || loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (tasks.length === 0) {
        return <div className="text-center text-gray-500">No tasks yet</div>;
    }

    return (
        <div className="space-y-2">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-white rounded shadow"
                >
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="h-4 w-4 text-blue-500"
                        />
                        <span className={task.completed ? 'line-through text-gray-500' : ''}>
                            {task.title}
                        </span>
                    </div>
                    <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
} 