"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FaPlay,
    FaInfoCircle,
    FaCheckCircle,
    FaShieldAlt,
    FaExclamationTriangle,
    FaKeyboard,
    FaHeadphones,
    FaBook,
    FaPen,
    FaClock,
    FaLaptop,
    FaWifi
} from "react-icons/fa";
import { LuGraduationCap, LuShieldCheck } from "react-icons/lu";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function HomePage() {
    const router = useRouter();
    const [examId, setExamId] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const handleStartExam = async (e) => {
        e.preventDefault();

        if (!examId.trim()) {
            setError("Please enter your Exam ID");
            return;
        }

        if (examId.trim().length < 4) {
            setError("Invalid Exam ID. Please check and try again.");
            return;
        }

        if (!agreed) {
            setError("Please accept the terms and conditions");
            return;
        }

        setError("");
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(`/exam/${examId.trim()}`);
    };

    const examSections = [
        { name: "Listening", icon: <FaHeadphones />, duration: "30 min", questions: 40, color: "purple" },
        { name: "Reading", icon: <FaBook />, duration: "60 min", questions: 40, color: "blue" },
        { name: "Writing", icon: <FaPen />, duration: "60 min", questions: 2, color: "emerald" },
    ];

    const requirements = [
        { icon: <FaLaptop />, text: "Desktop or laptop computer" },
        { icon: <FaHeadphones />, text: "Headphones for listening" },
        { icon: <FaWifi />, text: "Stable internet connection" },
        { icon: <FaClock />, text: "2.5 hours of uninterrupted time" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#41bfb8]/8 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#f79952]/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#41bfb8]/5 to-[#f79952]/5 rounded-full blur-[150px]"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="py-6 px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between max-w-7xl mx-auto"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#41bfb8] to-[#2d9a94] rounded-xl flex items-center justify-center shadow-lg shadow-[#41bfb8]/20">
                                <LuGraduationCap className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white outfit">IELTS<span className="text-[#41bfb8]">Pro</span></h1>
                                <p className="text-slate-500 text-xs">Online Examination System</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <LuShieldCheck className="text-emerald-500" />
                            <span>Secure Platform</span>
                        </div>
                    </motion.div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Info Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <h2 className="text-4xl font-bold text-white mb-4 outfit leading-tight">
                                Professional IELTS
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#41bfb8] to-[#f79952]">
                                    Examination System
                                </span>
                            </h2>
                            <p className="text-slate-400 mb-8">
                                Experience a realistic IELTS test environment with our advanced online examination platform.
                                Get instant results for Listening and Reading sections.
                            </p>

                            {/* Exam Sections Preview */}
                            <div className="space-y-4 mb-8">
                                {examSections.map((section, index) => (
                                    <motion.div
                                        key={section.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className={`flex items-center gap-4 p-4 rounded-xl bg-${section.color}-500/10 border border-${section.color}-500/20`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-${section.color}-500/20 flex items-center justify-center text-${section.color}-400 text-xl`}>
                                            {section.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium">{section.name}</h3>
                                            <p className="text-slate-500 text-sm">{section.duration} • {section.questions} {section.questions === 2 ? 'tasks' : 'questions'}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Requirements */}
                            <div className="grid grid-cols-2 gap-3">
                                {requirements.map((req, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 + index * 0.05 }}
                                        className="flex items-center gap-2 text-slate-400 text-sm"
                                    >
                                        <span className="text-[#41bfb8]">{req.icon}</span>
                                        {req.text}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right - Login Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
                        >
                            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                                {/* Card Header */}
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#41bfb8] to-[#2d9a94] rounded-2xl flex items-center justify-center shadow-lg shadow-[#41bfb8]/25">
                                        <HiOutlineDocumentText className="text-white text-3xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white outfit">Start Your Exam</h3>
                                    <p className="text-slate-400 text-sm mt-2">Enter your unique Exam ID to begin</p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleStartExam} className="space-y-5">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Exam ID</label>
                                        <div className="relative">
                                            <FaKeyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                value={examId}
                                                onChange={(e) => {
                                                    setExamId(e.target.value.toUpperCase());
                                                    setError("");
                                                }}
                                                placeholder="e.g., IELTS2024"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:border-[#41bfb8] focus:bg-white/[0.07] outline-none transition-all text-lg font-mono tracking-widest"
                                                autoComplete="off"
                                                spellCheck="false"
                                            />
                                        </div>
                                    </div>

                                    {/* Agreement */}
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={agreed}
                                                onChange={(e) => {
                                                    setAgreed(e.target.checked);
                                                    setError("");
                                                }}
                                                className="w-5 h-5 rounded border-2 border-slate-600 bg-transparent checked:bg-[#41bfb8] checked:border-[#41bfb8] appearance-none cursor-pointer transition-all"
                                            />
                                            {agreed && (
                                                <FaCheckCircle className="absolute inset-0 text-white w-5 h-5 pointer-events-none" />
                                            )}
                                        </div>
                                        <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                                            I agree to the exam rules and understand that my activity will be monitored during the test.
                                        </span>
                                    </label>

                                    {/* Error */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
                                        >
                                            <FaExclamationTriangle />
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#41bfb8] to-[#2d9a94] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-[#41bfb8]/25 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Verifying Exam ID...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlay />
                                                Start Examination
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Security Note */}
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <div className="flex items-start gap-3 text-slate-500 text-xs">
                                        <FaShieldAlt className="text-amber-500 mt-0.5" />
                                        <p>
                                            This exam is conducted in a secure environment. Tab switching, screen recording, and copy-paste are monitored.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-6 px-8 border-t border-white/5">
                    <div className="max-w-7xl mx-auto flex items-center justify-between text-slate-500 text-sm">
                        <p>© 2024 IELTSPro. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                            <span>Support</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
