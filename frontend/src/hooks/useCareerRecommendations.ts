import { useState } from 'react';
import { CareerRecommendation } from '@/types/career';
import { apiClient } from '@/lib/api';

export function useCareerRecommendations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);

    const fetchRecommendations = async (answers: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/api/careers/recommendations', { answers });
            setRecommendations(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, recommendations, fetchRecommendations };
} 