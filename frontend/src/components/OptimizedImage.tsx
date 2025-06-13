import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    quality?: number;
    fill?: boolean;
    sizes?: string;
    objectFit?: 'contain' | 'cover' | 'fill';
    aspectRatio?: string;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export const OptimizedImage = ({
    src,
    alt,
    className = '',
    priority = false,
    quality = 90,
    fill = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    objectFit = 'cover',
    aspectRatio,
    placeholder = 'empty',
    blurDataURL,
    onLoad,
    onError
}: OptimizedImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setError(false);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setError(true);
        onError?.();
    };

    const containerClasses = `
        relative
        ${aspectRatio ? `aspect-${aspectRatio}` : ''}
        ${className}
        ${isLoading ? 'animate-pulse bg-gray-200' : ''}
        ${error ? 'bg-gray-100' : ''}
    `;

    return (
        <motion.div
            className={containerClasses}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {!error ? (
                <Image
                    src={src}
                    alt={alt}
                    fill={fill}
                    sizes={sizes}
                    quality={quality}
                    priority={priority}
                    placeholder={placeholder}
                    blurDataURL={blurDataURL}
                    className={`
                        ${objectFit === 'contain' ? 'object-contain' : ''}
                        ${objectFit === 'cover' ? 'object-cover' : ''}
                        ${objectFit === 'fill' ? 'object-fill' : ''}
                        transition-opacity duration-300
                        ${isLoading ? 'opacity-0' : 'opacity-100'}
                    `}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
            )}
        </motion.div>
    );
}; 