"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FaHeadphones,
    FaBook,
    FaPen,
    FaPlay,
    FaClock,
    FaQuestionCircle,
    FaArrowRight,
    FaLayerGroup,
    FaShieldAlt,
    FaGraduationCap,
    FaChartLine
} from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function ExamSelectionPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.examId;

    const examModules = [
        {
            id: "listening",
            name: "Listening",
            icon: <FaHeadphones className="text-3xl" />,
            duration: 40,
            questions: 40,
            sections: 4,
            description: "Audio-based comprehension",
            details: "4 recordings: conversations & lectures",
            questionTypes: "MCQ, Form/Note/Sentence Completion, Matching",
            gradient: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-500/10 to-purple-600/10",
            borderColor: "border-purple-500/20",
            hoverBorder: "hover:border-purple-400/50"
        },
        {
            id: "reading",
            name: "Reading",
            icon: <FaBook className="text-3xl" />,
            duration: 60,
            questions: 40,
            sections: 3,
            description: "Academic passage analysis",
            details: "3 passages with increasing difficulty",
            questionTypes: "T/F/NG, MCQ, Sentence Completion",
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-500/10 to-blue-600/10",
            borderColor: "border-blue-500/20",
            hoverBorder: "hover:border-blue-400/50"
        },
        {
            id: "writing",
            name: "Writing",
            icon: <FaPen className="text-3xl" />,
            duration: 60,
            questions: 2,
            sections: 2,
            description: "Academic writing tasks",
            details: "Task 1: 150 words • Task 2: 250 words",
            questionTypes: "Graph Report + Essay",
            gradient: "from-emerald-500 to-emerald-600",
            bgGradient: "from-emerald-500/10 to-emerald-600/10",
            borderColor: "border-emerald-500/20",
            hoverBorder: "hover:border-emerald-400/50"
        }
    ];

    const handleStartModule = (moduleId) => {
        router.push(`/exam/${examId}/${moduleId}`);
    };

    const handleStartFullExam = () => {
        router.push(`/exam/${examId}/full`);
    };

    const totalTime = examModules.reduce((sum, m) => sum + m.duration, 0);
    const totalQuestions = examModules.reduce((sum, m) => sum + m.questions, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#41bfb8]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#f79952]/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 py-6 px-4 border-b border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#41bfb8] to-[#2d9a94] rounded-xl flex items-center justify-center">
                            <LuGraduationCap className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white outfit">IELTS<span className="text-[#41bfb8]">Pro</span></h1>
                            <p className="text-slate-500 text-xs">BdCalling Academy</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm bg-white/5 px-4 py-2 rounded-lg">
                        <HiOutlineDocumentText />
                        <span>Exam ID: <span className="text-white font-mono">{examId}</span></span>
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 outfit">
                        IELTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#41bfb8] to-[#f79952]">Academic Test</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Select individual modules for practice, or take the complete exam for official format experience.
                    </p>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-10"
                >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-[#41bfb8]">{totalQuestions}</p>
                        <p className="text-slate-400 text-sm">Total Questions</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-[#f79952]">{totalTime}</p>
                        <p className="text-slate-400 text-sm">Minutes</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-emerald-400">9.0</p>
                        <p className="text-slate-400 text-sm">Max Band</p>
                    </div>
                </motion.div>

                {/* Full Exam Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-8"
                >
                    <div
                        onClick={handleStartFullExam}
                        className="relative bg-gradient-to-r from-[#41bfb8]/10 via-transparent to-[#f79952]/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 cursor-pointer hover:border-[#41bfb8]/50 transition-all group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#41bfb8]/10 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#41bfb8] via-[#41bfb8] to-[#f79952] rounded-2xl flex items-center justify-center shadow-xl shadow-[#41bfb8]/20 group-hover:scale-110 transition-transform">
                                    <FaLayerGroup className="text-white text-3xl" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-2xl font-bold text-white">Complete IELTS Exam</h2>
                                        <span className="bg-[#f79952]/20 text-[#f79952] px-2 py-0.5 rounded text-xs font-medium">Recommended</span>
                                    </div>
                                    <p className="text-slate-400 mb-4">Take all three sections: Listening → Reading → Writing</p>
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg">
                                            <FaClock className="text-[#41bfb8]" />
                                            {totalTime} minutes
                                        </span>
                                        <span className="flex items-center gap-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg">
                                            <FaQuestionCircle className="text-[#41bfb8]" />
                                            {totalQuestions} questions
                                        </span>
                                        <span className="flex items-center gap-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg">
                                            <FaChartLine className="text-[#41bfb8]" />
                                            Band 1-9
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button className="flex items-center gap-3 bg-gradient-to-r from-[#41bfb8] to-[#2d9a94] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-[#41bfb8]/25 transition-all cursor-pointer whitespace-nowrap group-hover:gap-4">
                                <FaPlay />
                                Start Full Exam
                                <FaArrowRight className="text-sm" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <span className="text-slate-500 text-sm px-4">OR PRACTICE INDIVIDUAL SECTIONS</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>

                {/* Individual Module Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {examModules.map((module, index) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            onClick={() => handleStartModule(module.id)}
                            className={`relative bg-gradient-to-br ${module.bgGradient} backdrop-blur-sm border ${module.borderColor} ${module.hoverBorder} rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group`}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                {module.icon}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{module.name}</h3>
                            <p className="text-slate-400 text-sm mb-1">{module.description}</p>
                            <p className="text-slate-500 text-xs mb-4">{module.details}</p>

                            <div className="space-y-2 mb-5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Duration</span>
                                    <span className="text-white font-medium">{module.duration} mins</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Questions</span>
                                    <span className="text-white font-medium">{module.questions}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Sections</span>
                                    <span className="text-white font-medium">{module.sections}</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mb-4">{module.questionTypes}</p>

                            <button className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${module.gradient} text-white py-3 rounded-xl font-medium transition-all cursor-pointer group-hover:shadow-lg`}>
                                <FaPlay className="text-sm" />
                                Start {module.name}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaGraduationCap className="text-amber-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-1">IELTS Band Score Information</h4>
                            <p className="text-slate-400 text-sm">
                                Most universities require Band 6.0-6.5 for undergraduate and 6.5-7.0 for graduate programs.
                                Practice regularly to improve your score!
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Security Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
                        <FaShieldAlt className="text-emerald-500" />
                        <span>Secure exam environment • Anti-cheat enabled</span>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-6 px-4 border-t border-white/5 mt-auto">
                <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
                    © 2024 IELTSPro - BdCalling Academy. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
