'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { animations } from '@/styles/animations';

const heroImage = '/images/hero-bg.jpg';
const feature1Image = '/images/feature1.jpg';
const feature2Image = '/images/feature2.jpg';
const feature3Image = '/images/feature3.jpg';

export const HomeContent = () => {
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] rounded-2xl overflow-hidden">
                <Image
                    src={heroImage}
                    alt="Students studying together"
                    fill
                    priority
                    quality={90}
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30">
                    <div className="container mx-auto px-4 h-full flex flex-col justify-center">
                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                            initial="initial"
                            animate="animate"
                            variants={animations.fade.inUp}
                        >
                            Your Path to Success
                        </motion.h1>
                        <motion.p
                            className="text-lg sm:text-xl text-white/90 max-w-2xl"
                            initial="initial"
                            animate="animate"
                            variants={animations.fade.inUp}
                            transition={{ delay: 0.2 }}
                        >
                            Discover your perfect career path with our comprehensive VCE subject and career guidance platform.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <motion.div
                    className="relative h-64 rounded-xl overflow-hidden"
                    initial="initial"
                    animate="animate"
                    variants={animations.fade.in}
                >
                    <Image
                        src={feature1Image}
                        alt="Subject Selection"
                        fill
                        quality={85}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="absolute bottom-0 p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Subject Selection</h3>
                            <p className="text-white/90">Make informed decisions about your VCE subjects</p>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                    className="relative h-64 rounded-xl overflow-hidden"
                    initial="initial"
                    animate="animate"
                    variants={animations.fade.in}
                    transition={{ delay: 0.2 }}
                >
                    <Image
                        src={feature2Image}
                        alt="Career Exploration"
                        fill
                        quality={85}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="absolute bottom-0 p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Career Exploration</h3>
                            <p className="text-white/90">Discover career paths that match your interests</p>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                    className="relative h-64 rounded-xl overflow-hidden"
                    initial="initial"
                    animate="animate"
                    variants={animations.fade.in}
                    transition={{ delay: 0.4 }}
                >
                    <Image
                        src={feature3Image}
                        alt="Personalized Guidance"
                        fill
                        quality={85}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="absolute bottom-0 p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Personalized Guidance</h3>
                            <p className="text-white/90">Get tailored recommendations for your future</p>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}; 