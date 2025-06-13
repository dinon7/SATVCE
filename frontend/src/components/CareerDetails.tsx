import { motion } from 'framer-motion';
import { Career } from '@/types/career';

interface CareerDetailsProps {
    career: Career;
    onClose: () => void;
}

export const CareerDetails = ({ career, onClose }: CareerDetailsProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
        >
            <motion.button
                onClick={onClose}
                className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </motion.button>

            <motion.h2
                className="text-2xl font-bold mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {career.title}
            </motion.h2>

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {/* Market Data Section */}
                {career.marketData && (
                    <motion.div
                        className="bg-gray-50 p-4 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <h3 className="text-lg font-semibold mb-3">Market Data</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium">Current Demand:</span> {career.marketData.current_demand}</p>
                            <p><span className="font-medium">Salary Trends:</span> {career.marketData.salary_trends}</p>
                            <p><span className="font-medium">Job Growth:</span> {career.marketData.job_growth}</p>
                            <p><span className="font-medium">Remote Work:</span> {career.marketData.remote_work_availability}</p>
                            <div>
                                <span className="font-medium">Top Skills in Demand:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {career.marketData.top_skills_demand.map((skill, index) => (
                                        <motion.span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2, delay: 0.3 + index * 0.1 }}
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                            <p><span className="font-medium">Industry Trends:</span> {career.marketData.industry_trends}</p>
                        </div>
                    </motion.div>
                )}

                {/* Education Paths Section */}
                {career.educationPaths && (
                    <motion.div
                        className="bg-gray-50 p-4 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <h3 className="text-lg font-semibold mb-3">Education Paths</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Required Degrees</h4>
                                <ul className="list-disc list-inside text-gray-600">
                                    {career.educationPaths.required_degrees.map((degree, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: 0.4 + index * 0.1 }}
                                        >
                                            {degree}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Certifications</h4>
                                <div className="flex flex-wrap gap-2">
                                    {career.educationPaths.certifications.map((cert, index) => (
                                        <motion.span
                                            key={index}
                                            className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
                                        >
                                            {cert}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Prerequisites</h4>
                                <div className="flex flex-wrap gap-2">
                                    {career.educationPaths.prerequisites.map((prereq, index) => (
                                        <motion.span
                                            key={index}
                                            className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2, delay: 0.6 + index * 0.1 }}
                                        >
                                            {prereq}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Recommended Courses</h4>
                                <ul className="list-disc list-inside text-gray-600">
                                    {career.educationPaths.recommended_courses.map((course, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: 0.7 + index * 0.1 }}
                                        >
                                            {course}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Online Learning Resources</h4>
                                <ul className="list-disc list-inside text-gray-600">
                                    {career.educationPaths.online_learning_resources.map((resource, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: 0.8 + index * 0.1 }}
                                        >
                                            {resource}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}; 