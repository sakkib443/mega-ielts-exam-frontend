"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FaTrophy,
    FaCheckCircle,
    FaTimesCircle,
    FaArrowRight,
    FaRedo,
    FaHome,
    FaHeadphones,
    FaBook,
    FaPen,
    FaLayerGroup,
    FaDownload,
    FaMedal,
    FaStar
} from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";

function ResultContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const module = searchParams.get("module") || "listening";
    const score = parseInt(searchParams.get("score") || "0");
    const total = parseInt(searchParams.get("total") || "40");
    const band = parseFloat(searchParams.get("band") || "0");

    const [animatedScore, setAnimatedScore] = useState(0);
    const [animatedBand, setAnimatedBand] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [fullResults, setFullResults] = useState(null);

    useEffect(() => {
        // Animate score
        const duration = 1500;
        const steps = 50;
        const increment = score / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        // Animate band score
        let bandCurrent = 0;
        const bandIncrement = band / steps;
        const bandTimer = setInterval(() => {
            bandCurrent += bandIncrement;
            if (bandCurrent >= band) {
                setAnimatedBand(band);
                clearInterval(bandTimer);
            } else {
                setAnimatedBand(Math.round(bandCurrent * 2) / 2);
            }
        }, duration / steps);

        // Confetti for good scores
        if (band >= 6.0) {
            setTimeout(() => setShowConfetti(true), 500);
        }

        if (module === "full") {
            const saved = localStorage.getItem(`exam_${params.examId}_full`);
            if (saved) setFullResults(JSON.parse(saved));
        }

        return () => {
            clearInterval(timer);
            clearInterval(bandTimer);
        };
    }, [score, total, band, module, params.examId]);

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const getBandInfo = (bandScore) => {
        if (bandScore >= 8.5) return { level: "Expert", color: "emerald", desc: "Excellent command of English", emoji: "🏆" };
        if (bandScore >= 7.5) return { level: "Very Good", color: "emerald", desc: "Operational command with occasional inaccuracies", emoji: "🌟" };
        if (bandScore >= 6.5) return { level: "Competent", color: "blue", desc: "Generally effective command of English", emoji: "👍" };
        if (bandScore >= 5.5) return { level: "Modest", color: "amber", desc: "Partial command of English", emoji: "📚" };
        if (bandScore >= 4.5) return { level: "Limited", color: "orange", desc: "Basic competence in familiar situations", emoji: "💪" };
        return { level: "Beginner", color: "red", desc: "Needs improvement", emoji: "📖" };
    };

    const bandInfo = getBandInfo(band);

    const moduleInfo = {
        listening: { name: "Listening", icon: <FaHeadphones className="text-2xl" />, gradient: "from-purple-500 to-purple-600", color: "purple" },
        reading: { name: "Reading", icon: <FaBook className="text-2xl" />, gradient: "from-blue-500 to-blue-600", color: "blue" },
        writing: { name: "Writing", icon: <FaPen className="text-2xl" />, gradient: "from-emerald-500 to-emerald-600", color: "emerald" },
        full: { name: "Full Exam", icon: <FaLayerGroup className="text-2xl" />, gradient: "from-[#41bfb8] to-[#f79952]", color: "teal" }
    };

    const currentModule = moduleInfo[module] || moduleInfo.listening;

    // Confetti component
    const Confetti = () => (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {[...Array(60)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        y: -20,
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        rotate: 0,
                        opacity: 1
                    }}
                    animate={{
                        y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                        rotate: Math.random() * 720,
                        opacity: 0
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: Math.random() * 1.5,
                        ease: "linear"
                    }}
                    className={`absolute w-3 h-3 ${["bg-[#41bfb8]", "bg-[#f79952]", "bg-purple-500", "bg-emerald-500", "bg-amber-400", "bg-pink-500"][Math.floor(Math.random() * 6)]
                        }`}
                    style={{ borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
            {showConfetti && <Confetti />}

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
                        <span className="text-white font-semibold">IELTSPro</span>
                    </div>
                    <span className="text-slate-500 text-sm">Exam ID: {params.examId}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
                <div className="w-full max-w-2xl">
                    {/* Result Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                    >
                        {/* Module Badge */}
                        <div className="flex items-center justify-center mb-6">
                            <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${currentModule.gradient} px-6 py-3 rounded-2xl shadow-lg`}>
                                {currentModule.icon}
                                <span className="font-semibold text-lg">{currentModule.name} Complete</span>
                            </div>
                        </div>

                        {/* Band Score Display */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2, stiffness: 100 }}
                                className="relative inline-block mb-4"
                            >
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#41bfb8] to-[#f79952] p-1 shadow-xl shadow-[#41bfb8]/20">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center">
                                        <span className="text-sm text-slate-400">Band Score</span>
                                        <span className="text-5xl font-bold text-white">{animatedBand.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="absolute -right-4 -top-2">
                                    <span className="text-4xl">{bandInfo.emoji}</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                            >
                                <p className={`text-2xl font-bold text-${bandInfo.color}-400 mb-1`}>{bandInfo.level}</p>
                                <p className="text-slate-400">{bandInfo.desc}</p>
                            </motion.div>
                        </div>

                        {/* Score Details */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="grid grid-cols-2 gap-4 mb-8"
                        >
                            <div className="bg-white/5 rounded-xl p-5 text-center">
                                <p className="text-slate-400 text-sm mb-2">Correct Answers</p>
                                <p className="text-3xl font-bold text-white">{animatedScore}<span className="text-lg text-slate-500">/{total}</span></p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-5 text-center">
                                <p className="text-slate-400 text-sm mb-2">Percentage</p>
                                <p className="text-3xl font-bold text-white">{percentage}%</p>
                            </div>
                        </motion.div>

                        {/* Band Score Scale */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="mb-8"
                        >
                            <p className="text-slate-400 text-sm mb-3 text-center">IELTS Band Scale</p>
                            <div className="relative h-3 bg-gradient-to-r from-red-500 via-amber-500 via-emerald-500 to-emerald-400 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ left: "0%" }}
                                    animate={{ left: `${((band - 1) / 8) * 100}%` }}
                                    transition={{ delay: 1.5, duration: 1 }}
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-slate-900 shadow-lg"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>1</span>
                                <span>5</span>
                                <span>9</span>
                            </div>
                        </motion.div>

                        {/* Full Exam Breakdown */}
                        {module === "full" && fullResults && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="mb-8"
                            >
                                <h3 className="text-lg font-semibold mb-4 text-center text-slate-300">Section Breakdown</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { name: "Listening", data: fullResults.listening, icon: <FaHeadphones />, color: "purple" },
                                        { name: "Reading", data: fullResults.reading, icon: <FaBook />, color: "blue" },
                                        { name: "Writing", data: fullResults.writing, icon: <FaPen />, color: "emerald" }
                                    ].map((section, i) => (
                                        <div key={i} className={`bg-${section.color}-500/10 border border-${section.color}-500/20 rounded-xl p-4 text-center`}>
                                            <div className={`text-${section.color}-400 mb-2 flex justify-center`}>{section.icon}</div>
                                            <p className="text-xs text-slate-400">{section.name}</p>
                                            <p className="text-xl font-bold text-white">{section.data?.bandScore || "N/A"}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* University Requirements */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6 }}
                            className="bg-white/5 rounded-xl p-4 mb-8"
                        >
                            <p className="text-slate-400 text-sm mb-2">Your Score Meets Requirements For:</p>
                            <div className="flex flex-wrap gap-2">
                                {band >= 6.0 && <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">Undergraduate Programs</span>}
                                {band >= 6.5 && <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">Many Graduate Programs</span>}
                                {band >= 7.0 && <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">Top Universities</span>}
                                {band < 6.0 && <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm">Foundation Courses</span>}
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8 }}
                            className="flex gap-4"
                        >
                            <button
                                onClick={() => router.push(`/exam/${params.examId}`)}
                                className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <FaRedo />
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#41bfb8] to-[#2d9a94] py-4 rounded-xl font-medium hover:shadow-xl hover:shadow-[#41bfb8]/20 transition-all cursor-pointer"
                            >
                                <FaHome />
                                Home
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Footer Note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="text-center text-slate-500 text-sm mt-6"
                    >
                        This is an indicative score. Official IELTS scores may vary.
                    </motion.p>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-4 px-4 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
                    © 2024 IELTSPro - BdCalling Academy
                </div>
            </footer>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Loading results...</div>
            </div>
        }>
            <ResultContent />
        </Suspense>
    );
}
