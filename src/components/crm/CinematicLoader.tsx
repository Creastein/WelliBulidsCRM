"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicLoaderProps {
    onComplete: () => void;
}

export default function CinematicLoader({ onComplete }: CinematicLoaderProps) {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Simulate loading progress
        const duration = 2400; // total animation time before strictly exiting
        const interval = 30;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const val = Math.min(Math.floor((currentStep / steps) * 100), 100);
            setProgress(val);

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(() => {
                    setIsVisible(false);
                    setTimeout(onComplete, 800); // Wait for exit animation to finish
                }, 200);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Subtle Radial Glow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(249,115,22,0.03)_0%,rgba(10,10,10,0)_60%)] rounded-full blur-3xl pointer-events-none" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* SVG Logo Line Drawing */}
                        <motion.div
                            className="w-16 h-16 md:w-20 md:h-20 mb-8 relative text-orange-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Abstract Geometric Logo (W + B concept) */}
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                                <motion.path
                                    d="M 20,20 L 35,80 L 50,40 L 65,80 L 80,20"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                                />
                                <motion.path
                                    d="M 50,40 L 50,20 M 35,80 L 20,80 M 65,80 L 80,80"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 1 }}
                                />
                            </svg>
                        </motion.div>

                        {/* Typography Reveal */}
                        <div className="overflow-hidden h-12 flex items-center justify-center">
                            <motion.h1
                                className="text-3xl md:text-4xl font-display text-white tracking-[0.2em]"
                                initial={{ y: 50, opacity: 0, letterSpacing: "0.1em" }}
                                animate={{ y: 0, opacity: 1, letterSpacing: "0.2em" }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                            >
                                WELLIBUILDS
                            </motion.h1>
                        </div>

                        <div className="overflow-hidden h-6 mt-1 flex items-center justify-center">
                            <motion.p
                                className="text-[9px] md:text-[10px] font-mono text-orange-400/60 uppercase tracking-[0.4em]"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                            >
                                Executive Dashboard
                            </motion.p>
                        </div>
                    </div>

                    {/* Minimalist Progress Line at bottom */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1, ease: "linear" }}
                        />
                    </div>

                    {/* Minimalist Progress Text */}
                    <motion.div
                        className="absolute bottom-6 right-8 text-[10px] font-mono text-gray-500 tracking-widest hidden md:block"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        SYS.INIT // {progress.toString().padStart(3, '0')}%
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
