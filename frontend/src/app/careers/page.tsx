'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animations } from '@/utils/animations';
import { CareerCard } from '@/components/CareerCard';
import { CareerDetails } from '@/components/CareerDetails';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';
import { Career } from '@/types/career';

export default function CareersPage() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await fetch('/api/careers', {
                    headers: {
                        'Authorization': `Bearer ${await user?.getIdToken()}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch careers');
                const data = await response.json();
                setCareers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchCareers();
    }, [user]);

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

    if (error) {
        return (
            <motion.div
                className="flex justify-center items-center min-h-screen"
                {...animations.errorAnimation}
            >
                <ErrorMessage message={error} />
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8"
            {...animations.pageTransition}
        >
            <motion.h1
                className="text-4xl font-bold mb-8 text-center"
                {...animations.fadeIn}
            >
                Explore Career Paths
            </motion.h1>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                {...animations.staggerContainer}
            >
                <AnimatePresence>
                    {careers.map((career) => (
                        <motion.div
                            key={career.id}
                            {...animations.cardHover}
                            onClick={() => setSelectedCareer(career)}
                        >
                            <CareerCard career={career} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {selectedCareer && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <CareerDetails
                                career={selectedCareer}
                                onClose={() => setSelectedCareer(null)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
} 