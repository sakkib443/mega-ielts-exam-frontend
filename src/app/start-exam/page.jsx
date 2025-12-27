"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FaPlay,
    FaInfoCircle,
    FaCheckCircle,
    FaClock,
    FaShieldAlt,
    FaExclamationTriangle,
    FaKeyboard
} from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";

export default function ExamEntryPage() {
    const router = useRouter();
    const [examId, setExamId] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleStartExam = async (e) => {
        e.preventDefault();

        if (!examId.trim()) {
            setError("Please enter your Exam ID");
            return;
        }

        if (examId.trim().length < 4) {
            setError("Invalid Exam ID format");
            return;
        }

        setError("");
        setIsLoading(true);

        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 800));

        // Navigate to exam selection page
        router.push(`/exam/${examId.trim()}`);
    };

    const instructions = [
        "Ensure you have a stable internet connection throughout the test",
        "Use a desktop or laptop computer for best experience",
        "Keep your browser in fullscreen mode during the exam",
        "Do not switch tabs or minimize the window",
        "Each section has a specific time limit",
        "Answers are auto-saved every 30 seconds",
        "You cannot go back once a section is submitted",
        "Results will be displayed immediately after completion"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#41bfb8]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#f79952]/10 rounded-full blur-3xl"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#41bfb8]/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#41bfb8] to-[#2d9a94] rounded-2xl flex items-center justify-center shadow-lg shadow-[#41bfb8]/25">
                            <LuGraduationCap className="text-white text-3xl" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-bold text-white outfit">IELTS<span className="text-[#41bfb8]">Pro</span></h1>
                            <p className="text-slate-400 text-sm">Online Examination System</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2 outfit">Welcome to IELTS Exam</h2>
                        <p className="text-slate-400">
                            Enter your Exam ID to start your test session
                        </p>
                    </div>

                    {/* Exam ID Form */}
                    <form onSubmit={handleStartExam} className="mb-8">
                        <div className="relative mb-4">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <FaKeyboard />
                            </div>
                            <input
                                type="text"
                                value={examId}
                                onChange={(e) => {
                                    setExamId(e.target.value.toUpperCase());
                                    setError("");
                                }}
                                placeholder="Enter Exam ID (e.g., IELTS2024)"
                                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-[#41bfb8] focus:ring-2 focus:ring-[#41bfb8]/20 outline-none transition-all text-lg tracking-wider"
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mb-4 flex items-center gap-2"
                            >
                                <FaExclamationTriangle />
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#41bfb8] to-[#2d9a94] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-[#41bfb8]/25 transition-all cursor-pointer disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <FaPlay />
                                    Start Exam
                                </>
                            )}
                        </button>
                    </form>

                    {/* Instructions */}
                    <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <FaInfoCircle className="text-[#41bfb8]" />
                            Important Instructions
                        </h3>

                        <ul className="space-y-2">
                            {instructions.map((instruction, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                    className="flex items-start gap-3 text-slate-300 text-sm"
                                >
                                    <FaCheckCircle className="text-[#41bfb8] mt-0.5 flex-shrink-0 text-xs" />
                                    {instruction}
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Warning */}
                    <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <FaShieldAlt className="text-amber-400 mt-0.5" />
                            <div>
                                <p className="text-amber-400 font-medium text-sm">Anti-Cheat System Active</p>
                                <p className="text-amber-400/70 text-xs mt-1">
                                    Tab switching and window minimizing are monitored. Multiple violations may result in automatic submission.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-slate-500 text-sm mt-6"
                >
                    © 2024 IELTSPro. All rights reserved.
                </motion.p>
            </div>
        </div>
    );
}
