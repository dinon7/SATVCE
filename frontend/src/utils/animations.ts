import { motion } from 'framer-motion';

// Fade in animation
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 }
};

// Slide in from left
export const slideInLeft = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
};

// Slide in from right
export const slideInRight = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
};

// Scale up animation
export const scaleUp = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
};

// Stagger children animation
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Bounce animation
export const bounce = {
    initial: { y: -20, opacity: 0 },
    animate: { 
        y: 0, 
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    },
    exit: { y: -20, opacity: 0 }
};

// Rotate animation
export const rotate = {
    initial: { rotate: -180, opacity: 0 },
    animate: { 
        rotate: 0, 
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    },
    exit: { rotate: 180, opacity: 0 }
};

// Hover animations
export const hoverScale = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
};

export const hoverLift = {
    whileHover: { y: -5 },
    whileTap: { y: 0 }
};

// Loading spinner animation
export const spin = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
        }
    }
};

// Page transition
export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
};

// Card hover effect
export const cardHover = {
    initial: { scale: 1 },
    whileHover: { 
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        transition: {
            duration: 0.2
        }
    }
};

// List item animation
export const listItem = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3 }
};

// Success animation
export const successAnimation = {
    initial: { scale: 0 },
    animate: { 
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
};

// Error animation
export const errorAnimation = {
    initial: { x: 0 },
    animate: { 
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.5
        }
    }
};

// Progress bar animation
export const progressBar = {
    initial: { width: 0 },
    animate: { 
        width: "100%",
        transition: {
            duration: 1,
            ease: "easeInOut"
        }
    }
};

// Typewriter effect
export const typewriter = {
    initial: { width: 0 },
    animate: { 
        width: "100%",
        transition: {
            duration: 1,
            ease: "easeInOut"
        }
    }
};

// Export all animations as a single object
export const animations = {
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleUp,
    staggerContainer,
    bounce,
    rotate,
    hoverScale,
    hoverLift,
    spin,
    pageTransition,
    cardHover,
    listItem,
    successAnimation,
    errorAnimation,
    progressBar,
    typewriter
}; 