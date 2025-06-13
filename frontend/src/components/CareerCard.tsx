import { motion } from 'framer-motion';
import { OptimizedImage } from './ui/OptimizedImage';
import { animations } from '@/styles/animations';

interface Career {
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    industry?: string;
    salaryRange?: string;
    growth?: string;
    demand?: string;
    requiredSkills?: string[];
}

interface CareerCardProps {
    career: Career;
    onClick?: () => void;
}

export const CareerCard = ({
    career,
    onClick
}: CareerCardProps) => {
    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={onClick}
            whileHover={{ y: -4 }}
            initial="initial"
            animate="animate"
            variants={animations.fade.in}
        >
            <div className="relative h-48">
                <OptimizedImage
                    src={career.imageUrl}
                    alt={career.title}
                    fill
                    quality={85}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                    <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">
                        {career.category}
                    </span>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {career.title}
                </h3>
                <p className="text-gray-600">
                    {career.description}
                </p>
            </div>
        </motion.div>
    );
}; 