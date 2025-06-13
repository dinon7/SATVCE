'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface UserProfile {
    name: string;
    email: string;
    hasCompletedQuiz: boolean;
    isAdmin: boolean;
    quizAnswers: Record<number, string>;
    // Add other profile fields as needed
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    userProfile: UserProfile | null;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    signUp: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
    updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(true);
            if (user) {
                // Fetch user profile
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('/api/users/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const profile = await response.json();
                        setUserProfile(profile);
                        if (profile.isAdmin) {
                            router.push('/admin-dashboard');
                        } else if (profile.hasCompletedQuiz) {
                            router.push('/dashboard');
                        } else {
                            router.push('/quiz');
                        }
                    } else {
                        // Profile missing, prompt user to complete it
                        router.push('/complete-profile');
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    router.push('/complete-profile');
                }
            } else {
                setUserProfile(null);
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const signIn = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential;
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            throw error;
        }
    };

    const updateUserProfile = async (profile: Partial<UserProfile>) => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch('/api/users/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profile)
        });
        if (response.ok) {
            const updatedProfile = await response.json();
            setUserProfile(updatedProfile);
        } else {
            throw new Error('Failed to update profile');
        }
    };

    const value = {
        user,
        loading,
        userProfile,
        signIn,
        signUp,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 