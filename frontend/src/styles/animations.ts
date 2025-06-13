import { Variants } from 'framer-motion';

export const animations = {
    // Page transitions
    pageTransition: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
    },

    // Fade animations
    fade: {
        in: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.2 }
        },
        inUp: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
            transition: { duration: 0.3 }
        },
        inDown: {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
            transition: { duration: 0.3 }
        }
    },

    // Scale animations
    scale: {
        in: {
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 },
            transition: { duration: 0.2 }
        },
        up: {
            initial: { scale: 0.9, y: 20, opacity: 0 },
            animate: { scale: 1, y: 0, opacity: 1 },
            exit: { scale: 0.9, y: -20, opacity: 0 },
            transition: { duration: 0.3 }
        }
    },

    // Slide animations
    slide: {
        left: {
            initial: { x: -20, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: 20, opacity: 0 },
            transition: { duration: 0.3 }
        },
        right: {
            initial: { x: 20, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: -20, opacity: 0 },
            transition: { duration: 0.3 }
        }
    },

    // List animations
    list: {
        container: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        },
        item: {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 }
        }
    },

    // Interactive animations
    interactive: {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
        },
        lift: {
            y: -5,
            transition: { duration: 0.2 }
        }
    },

    // Loading animations
    loading: {
        spin: {
            animate: {
                rotate: 360,
                transition: {
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }
            }
        },
        pulse: {
            animate: {
                scale: [1, 1.1, 1],
                opacity: [1, 0.5, 1],
                transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }
        }
    },

    // Stagger animations
    stagger: {
        container: {
            animate: {
                transition: {
                    staggerChildren: 0.1
                }
            }
        },
        item: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
        }
    },

    // Modal animations
    modal: {
        overlay: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.2 }
        },
        content: {
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: -20 },
            transition: { duration: 0.3 }
        }
    }
} as const;

// Type-safe animation variants
export type AnimationKey = keyof typeof animations;
export type AnimationVariant = Variants;

// Helper function to combine animations
export function combineAnimations(...keys: AnimationKey[]): AnimationVariant {
    return keys.reduce((acc, key) => ({
        ...acc,
        ...animations[key]
    }), {});
} 