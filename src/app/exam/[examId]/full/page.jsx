"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FaHeadphones,
    FaBook,
    FaPen,
    FaArrowRight,
    FaCheck,
    FaClock,
    FaSpinner
} from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";

export default function FullExamPage() {
    const params = useParams();
    const router = useRouter();

    const [currentModule, setCurrentModule] = useState(0);
    const [moduleResults, setModuleResults] = useState({});
    const [showTransition, setShowTransition] = useState(true);
    const [countdown, setCountdown] = useState(5);

    const modules = [
        { id: "listening", name: "Listening", icon: <FaHeadphones />, duration: 40, questions: 40, color: "purple" },
        { id: "reading", name: "Reading", icon: <FaBook />, duration: 60, questions: 40, color: "blue" },
        { id: "writing", name: "Writing", icon: <FaPen />, duration: 60, questions: 2, color: "emerald" }
    ];

    // Calculate overall band score
    const calculateOverallBand = () => {
        const listening = moduleResults.listening?.bandScore || 0;
        const reading = moduleResults.reading?.bandScore || 0;
        const writing = moduleResults.writing?.bandScore || 0;

        if (listening && reading && writing) {
            const overall = (listening + reading + writing) / 3;
            return Math.round(overall * 2) / 2; // Round to nearest 0.5
        }
        return 0;
    };

    // Check for completed modules in localStorage
    useEffect(() => {
        const checkResults = () => {
            const results = {};

            const listening = localStorage.getItem(`exam_${params.examId}_listening`);
            if (listening) results.listening = JSON.parse(listening);

            const reading = localStorage.getItem(`exam_${params.examId}_reading`);
            if (reading) results.reading = JSON.parse(reading);

            const writing = localStorage.getItem(`exam_${params.examId}_writing`);
            if (writing) results.writing = JSON.parse(writing);

            setModuleResults(results);

            // Determine which module to show
            if (!results.listening) {
                setCurrentModule(0);
            } else if (!results.reading) {
                setCurrentModule(1);
            } else if (!results.writing) {
                setCurrentModule(2);
            } else {
                // All complete - redirect to results
                const overallBand = calculateOverallBand();
                const totalScore = (results.listening?.score || 0) + (results.reading?.score || 0) + (results.writing?.score || 0);
                const totalPossible = 40 + 40 + 18;

                localStorage.setItem(`exam_${params.examId}_full`, JSON.stringify({
                    listening: results.listening,
                    reading: results.reading,
                    writing: results.writing,
                    overallBand,
                    totalScore,
                    totalPossible
                }));

                router.push(`/exam/${params.examId}/result?module=full&score=${totalScore}&total=${totalPossible}&band=${overallBand}`);
            }
        };

        checkResults();

        // Check periodically for updates
        const interval = setInterval(checkResults, 1000);
        return () => clearInterval(interval);
    }, [params.examId]);

    // Countdown for transition
    useEffect(() => {
        if (showTransition && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            startCurrentModule();
        }
    }, [showTransition, countdown]);

    const startCurrentModule = () => {
        const module = modules[currentModule];
        router.push(`/exam/${params.examId}/${module.id}`);
    };

    const currentMod = modules[currentModule];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#41bfb8]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#f79952]/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 py-4 px-4 border-b border-white/5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#41bfb8] to-[#2d9a94] rounded-lg flex items-center justify-center">
                            <LuGraduationCap className="text-white text-lg" />
                        </div>
                        <span className="text-white font-semibold">IELTS Full Exam</span>
                    </div>
                    <span className="text-slate-500 text-sm">Exam ID: {params.examId}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-2xl">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            {modules.map((mod, idx) => {
                                const isComplete = moduleResults[mod.id];
                                const isCurrent = idx === currentModule;

                                return (
                                    <div key={mod.id} className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isComplete ? `bg-${mod.color}-500 text-white` :
                                                isCurrent ? `bg-${mod.color}-500/20 border-2 border-${mod.color}-500 text-${mod.color}-400` :
                                                    'bg-white/5 text-slate-500'
                                            }`}>
                                            {isComplete ? <FaCheck /> : mod.icon}
                                        </div>
                                        {idx < modules.length - 1 && (
                                            <div className={`w-16 md:w-24 h-1 mx-2 rounded ${isComplete ? `bg-${mod.color}-500` : 'bg-white/10'
                                                }`}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            {modules.map(mod => (
                                <span key={mod.id}>{mod.name}</span>
                            ))}
                        </div>
                    </div>

                    {/* Transition Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
                    >
                        <div className={`w-24 h-24 bg-gradient-to-br from-${currentMod.color}-500 to-${currentMod.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-${currentMod.color}-500/20`}>
                            <span className="text-4xl text-white">{currentMod.icon}</span>
                        </div>

                        <h1 className="text-3xl font-bold mb-2">
                            {currentModule === 0 ? 'Starting' : 'Next Section'}
                        </h1>
                        <h2 className={`text-2xl font-bold text-${currentMod.color}-400 mb-4`}>
                            {currentMod.name} Test
                        </h2>

                        <div className="flex items-center justify-center gap-6 mb-8">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{currentMod.duration}</p>
                                <p className="text-slate-500 text-sm">minutes</p>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{currentMod.questions}</p>
                                <p className="text-slate-500 text-sm">questions</p>
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="mb-6">
                            <p className="text-slate-400 mb-2">Starting in</p>
                            <div className="relative w-20 h-20 mx-auto">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="45"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="6"
                                        fill="none"
                                    />
                                    <motion.circle
                                        cx="50" cy="50" r="45"
                                        stroke={`url(#grad-${currentMod.color})`}
                                        strokeWidth="6"
                                        fill="none"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: "283 283", strokeDashoffset: 0 }}
                                        animate={{ strokeDashoffset: 283 - (283 * (5 - countdown) / 5) }}
                                    />
                                    <defs>
                                        <linearGradient id={`grad-${currentMod.color}`}>
                                            <stop offset="0%" stopColor="#41bfb8" />
                                            <stop offset="100%" stopColor="#f79952" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">{countdown}</span>
                            </div>
                        </div>

                        <button
                            onClick={startCurrentModule}
                            className={`inline-flex items-center gap-3 bg-gradient-to-r from-${currentMod.color}-500 to-${currentMod.color}-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all cursor-pointer`}
                        >
                            Start Now
                            <FaArrowRight />
                        </button>

                        {/* Previous Results */}
                        {Object.keys(moduleResults).length > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <p className="text-slate-400 text-sm mb-3">Completed Sections</p>
                                <div className="flex justify-center gap-4">
                                    {modules.map(mod => {
                                        const result = moduleResults[mod.id];
                                        if (!result) return null;
                                        return (
                                            <div key={mod.id} className={`bg-${mod.color}-500/10 border border-${mod.color}-500/20 rounded-lg px-4 py-2`}>
                                                <p className="text-xs text-slate-400">{mod.name}</p>
                                                <p className={`text-lg font-bold text-${mod.color}-400`}>Band {result.bandScore}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-4 px-4 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
                    IELTS Full Exam Mode • BdCalling Academy
                </div>
            </footer>
        </div>
    );
}
