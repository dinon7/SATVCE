import { motion } from 'framer-motion';

interface ErrorMessageProps {
    message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
    return (
        <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="flex items-center"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span className="font-medium">{message}</span>
            </motion.div>
        </motion.div>
    );
}; 