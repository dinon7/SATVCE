// import { auth } from './firebase'; // Removed: Clerk handles all auth
// import { CareerRecommendation, CareerReport } from '@/types/career';
import { CareerPreference } from '@/types/career';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

interface ApiOptions extends RequestInit {
    requiresAuth?: boolean;
}

// Updated: Accept token as parameter
export async function api<T>(endpoint: string, options: ApiOptions = {}, token?: string): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    // Prepare headers
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    });

    // Add Clerk auth token if required
    if (requiresAuth && token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Determine the base URL based on the endpoint
    // Frontend API routes (starting with /api/) should use the current origin
    // Backend API routes should use the backend URL
    let baseUrl: string;
    if (endpoint.startsWith('/api/quiz/') || endpoint.startsWith('/api/user/') || endpoint.startsWith('/api/ai/') || endpoint.startsWith('/api/career/')) {
        // Frontend API routes - use current origin
        baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    } else {
        // Backend API routes - use backend URL
        baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    }

    // Make request
    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    // Handle response
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new ApiError(response.status, error.message || 'An error occurred');
    }

    // Parse response
    const data = await response.json().catch(() => null);
    return data as T;
}

// API endpoints
export const endpoints = {
    // User
    user: {
        profile: '/api/user/profile',
        preferences: '/api/user/preferences',
    },
    // AI
    ai: {
        analyze: '/api/ai/analyze',
        results: '/api/user/ai-results',
    },
    // Career
    career: {
        suggestions: '/api/user/career-suggestions',
        resources: '/api/resources',
        recommendations: '/api/career/recommendations',
        report: '/api/career/report',
        preferences: '/api/career/preferences',
        all: '/api/v1/careers',
    },
};

// Type definitions for API responses
export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    preferences: {
        subjects: string[];
        careers: string[];
        universities: string[];
    };
    createdAt: string;
    updatedAt: string;
}

export interface AIResult {
    id: string;
    userId: string;
    data: {
        analysis: string;
        recommendations: string[];
        confidence: number;
    };
    createdAt: string;
}

export interface CareerSuggestion {
    id: string;
    userId: string;
    data: {
        career: string;
        description: string;
        requiredSkills: string[];
        salaryRange: string;
        growthPotential: string;
    };
    createdAt: string;
}

export interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    tags: string[];
    createdAt: string;
}

export interface CareerRecommendation {
    title: string;
    description: string;
    requiredSkills: string[];
    jobOutlook: string;
    salaryRange: string;
    educationRequirements: string[];
    confidence: number;
    isInterested?: boolean;
}

export interface CareerReport {
    recommendations: CareerRecommendation[];
    study_resources: string[];
    generated_at: string;
}

export interface Career {
    id: string;
    title: string;
    description: string;
    avg_salary: number;
    industry: string;
    required_skills: string[];
}

// API client functions (all accept token as last argument)
export const apiClient = {
    // User
    async getProfile(token?: string): Promise<UserProfile> {
        return api<UserProfile>(endpoints.user.profile, {}, token);
    },

    async updateProfile(data: Partial<UserProfile>, token?: string): Promise<UserProfile> {
        return api<UserProfile>(endpoints.user.profile, {
            method: 'POST',
            body: JSON.stringify(data),
        }, token);
    },

    // AI
    async getAIResults(token?: string): Promise<AIResult[]> {
        return api<AIResult[]>(endpoints.ai.results, {}, token);
    },

    async analyzeData(data: any, token?: string): Promise<AIResult> {
        return api<AIResult>(endpoints.ai.analyze, {
            method: 'POST',
            body: JSON.stringify(data),
        }, token);
    },

    // Career
    async getCareerSuggestions(token?: string): Promise<CareerSuggestion[]> {
        return api<CareerSuggestion[]>(endpoints.career.suggestions, {}, token);
    },

    async getResources(tags?: string[], token?: string): Promise<Resource[]> {
        const queryParams = tags ? `?tags=${tags.join(',')}` : '';
        return api<Resource[]>(`${endpoints.career.resources}${queryParams}`, {}, token);
    },

    async getCareerRecommendations(token?: string): Promise<CareerRecommendation[]> {
        return api<CareerRecommendation[]>(endpoints.career.recommendations, {}, token);
    },

    async getCareerReport(selectedCareers: string[], token?: string): Promise<CareerReport> {
        return api<CareerReport>(endpoints.career.report, {
            method: 'POST',
            body: JSON.stringify({ selected_careers: selectedCareers }),
        }, token);
    },

    async getCareers(token?: string): Promise<Career[]> {
        return api<Career[]>(endpoints.career.all, {}, token);
    },

    async updateCareerPreference(careerTitle: string, isInterested: boolean, token?: string): Promise<void> {
        return api<void>(endpoints.career.recommendations, {
            method: 'POST',
            body: JSON.stringify({ careerTitle, isInterested }),
        }, token);
    },

    // Career preferences
    async saveCareerPreference(careerTitle: string, isInterested: boolean, token?: string) {
        return api<{ message: string }>(`${endpoints.career.preferences}/${careerTitle}`, {
            method: 'POST',
            body: JSON.stringify({ is_interested: isInterested }),
        }, token);
    },

    async getCareerPreferences(token?: string) {
        return api<CareerPreference[]>(endpoints.career.preferences, {}, token);
    },

    // Add other methods as needed, always passing token as last argument
    async submitInitialAnswers(answers: Record<string, any>, token?: string): Promise<any> {
        return api<any>('/api/quiz/answers', {
            method: 'POST',
            body: JSON.stringify(answers),
        }, token);
    },

    async submitInitialAnswersSimple(answers: Record<string, any>): Promise<any> {
        // Use relative URL for frontend API route
        const response = await fetch('/api/quiz/answers-simple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(answers),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new ApiError(response.status, error.message || 'An error occurred');
        }

        return response.json();
    },

    async submitAllAnswers(answers: Record<string, any>, token?: string): Promise<any> {
        return api<any>('/api/quiz/generate-results', {
            method: 'POST',
            body: JSON.stringify(answers),
        }, token);
    },
}; 