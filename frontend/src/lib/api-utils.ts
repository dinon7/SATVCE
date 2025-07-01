import { toast } from '@/components/ui/use-toast';

async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }

        return response.json();
    } catch (error) {
        toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'An error occurred',
            variant: 'destructive',
        });
        throw error;
    }
}

export { api }; 