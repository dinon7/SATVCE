import { auth } from './firebase';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

interface ApiOptions extends RequestInit {
    requiresAuth?: boolean;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    // Prepare headers
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    });

    // Add auth token if required
    if (requiresAuth) {
        const user = auth.currentUser;
        if (!user) {
            throw new ApiError(401, 'No authenticated user');
        }
        const token = await user.getIdToken();
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Make request
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
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

// API client functions
export const apiClient = {
    // User
    async getProfile(): Promise<UserProfile> {
        return api<UserProfile>(endpoints.user.profile);
    },

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        return api<UserProfile>(endpoints.user.profile, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // AI
    async getAIResults(): Promise<AIResult[]> {
        return api<AIResult[]>(endpoints.ai.results);
    },

    async analyzeData(data: any): Promise<AIResult> {
        return api<AIResult>(endpoints.ai.analyze, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Career
    async getCareerSuggestions(): Promise<CareerSuggestion[]> {
        return api<CareerSuggestion[]>(endpoints.career.suggestions);
    },

    async getResources(tags?: string[]): Promise<Resource[]> {
        const queryParams = tags ? `?tags=${tags.join(',')}` : '';
        return api<Resource[]>(`${endpoints.career.resources}${queryParams}`);
    },
}; 