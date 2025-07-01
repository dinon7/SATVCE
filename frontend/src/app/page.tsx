'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { animations } from '@/utils/animations';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuth();

    const handleAction = (path: string) => {
        // Allow direct access to quiz regardless of auth status
        if (path === '/quiz') {
            router.push(path);
            return;
        }
        
        // For other actions, check auth status
        if (user) {
            router.push('/dashboard');
        } else {
            router.push(path);
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
            {...animations.pageTransition}
        >
            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <motion.div
                    className="text-center mb-16 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute inset-0 -z-10">
                        <OptimizedImage
                            src="/images/hero/hero-bg-1920x1080.svg"
                            alt="Hero background"
                            fill
                            priority
                            quality={90}
                            sizes="100vw"
                            className="object-cover opacity-10"
                        />
                    </div>
                    <motion.h1
                        className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        VCE Subject Selection & Career Guidance
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        Make informed decisions about your future with our AI-powered career guidance tool.
                        Discover the perfect subjects for your dream career.
                    </motion.p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="flex flex-col md:flex-row justify-center gap-6 mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <motion.button
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction('/quiz')}
                    >
                        Take the Quiz
                    </motion.button>
                    <motion.button
                        className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction('/login')}
                    >
                        Login
                    </motion.button>
                    <motion.button
                        className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction('/signup')}
                    >
                        Sign Up
                    </motion.button>
                </motion.div>

                {/* Features Section */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    {[
                        {
                            title: "AI-Powered Career Quiz",
                            description: "Get personalized career recommendations based on your interests and skills.",
                            icon: "🎯",
                            image: "/images/features/quiz-800x600.svg"
                        },
                        {
                            title: "Subject Selection Guide",
                            description: "Find the perfect VCE subjects that align with your career goals.",
                            icon: "📚",
                            image: "/images/features/subjects-800x600.svg"
                        },
                        {
                            title: "University Course Matching",
                            description: "Discover university courses that match your selected subjects and career path.",
                            icon: "🎓",
                            image: "/images/features/courses-800x600.svg"
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-lg overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="relative h-48 mb-4">
                                <OptimizedImage
                                    src={feature.image}
                                    alt={feature.title}
                                    fill
                                    quality={85}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover rounded-lg"
                                />
                            </div>
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-gray-600 mb-8">
                        Join thousands of students who have found their perfect career path.
                    </p>
                    <motion.button
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-lg font-semibold shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction('/signup')}
                    >
                        Get Started Now
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
}