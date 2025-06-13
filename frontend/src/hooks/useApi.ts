import { useState, useCallback } from 'react';
import { apiClient, ApiError, AIResult, CareerSuggestion, Resource } from '@/lib/api';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useApi<T>() {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async (promise: Promise<T>) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await promise;
            setState({ data, loading: false, error: null });
            return data;
        } catch (error) {
            const message = error instanceof ApiError 
                ? error.message 
                : 'An unexpected error occurred';
            setState({ data: null, loading: false, error: message });
            throw error;
        }
    }, []);

    return {
        ...state,
        execute,
    };
}

// Specific hooks for different API endpoints
export function useProfile() {
    const { data, loading, error, execute } = useApi<typeof apiClient.getProfile extends () => Promise<infer T> ? T : never>();

    const getProfile = useCallback(() => execute(apiClient.getProfile()), [execute]);
    const updateProfile = useCallback((data: Parameters<typeof apiClient.updateProfile>[0]) => 
        execute(apiClient.updateProfile(data)), [execute]);

    return {
        profile: data,
        loading,
        error,
        getProfile,
        updateProfile,
    };
}

export function useAI() {
    const { data: results, loading: resultsLoading, error: resultsError, execute: executeResults } = useApi<AIResult[]>();
    const { data: analysis, loading: analysisLoading, error: analysisError, execute: executeAnalysis } = useApi<AIResult>();

    const getResults = useCallback(() => executeResults(apiClient.getAIResults()), [executeResults]);
    const analyzeData = useCallback((data: Parameters<typeof apiClient.analyzeData>[0]) => 
        executeAnalysis(apiClient.analyzeData(data)), [executeAnalysis]);

    return {
        results,
        analysis,
        loading: resultsLoading || analysisLoading,
        error: resultsError || analysisError,
        getResults,
        analyzeData,
    };
}

export function useCareer() {
    const { data: suggestions, loading: suggestionsLoading, error: suggestionsError, execute: executeSuggestions } = useApi<CareerSuggestion[]>();
    const { data: resources, loading: resourcesLoading, error: resourcesError, execute: executeResources } = useApi<Resource[]>();

    const getSuggestions = useCallback(() => executeSuggestions(apiClient.getCareerSuggestions()), [executeSuggestions]);
    const getResources = useCallback((tags?: string[]) => 
        executeResources(apiClient.getResources(tags)), [executeResources]);

    return {
        suggestions,
        resources,
        loading: suggestionsLoading || resourcesLoading,
        error: suggestionsError || resourcesError,
        getSuggestions,
        getResources,
    };
} 