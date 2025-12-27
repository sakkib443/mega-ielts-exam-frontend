"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FaPen,
    FaClock,
    FaCheck,
    FaExclamationTriangle,
    FaTimes,
    FaPlay,
    FaChevronLeft,
    FaChevronRight,
    FaLightbulb,
    FaSave
} from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function WritingExamPage() {
    const params = useParams();
    const router = useRouter();

    const [currentTask, setCurrentTask] = useState(0);
    const [answers, setAnswers] = useState({ task1: "", task2: "" });
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showTips, setShowTips] = useState(false);

    // IELTS Writing Tasks
    const tasks = [
        {
            id: "task1",
            title: "Task 1",
            subtitle: "Academic Report",
            timeRecommend: 20,
            instruction: `The chart below shows the percentage of households with internet access in three different countries between 2000 and 2020.

Summarize the information by selecting and reporting the main features and make comparisons where relevant.

Write at least 150 words.`,
            imageDesc: "[Line Graph: Internet access in Japan, Brazil, and Nigeria from 2000-2020]",
            sampleData: `Data Points:
• 2000: Japan 30%, Brazil 5%, Nigeria 1%
• 2010: Japan 78%, Brazil 41%, Nigeria 24%
• 2020: Japan 93%, Brazil 81%, Nigeria 58%`,
            minWords: 150,
            maxMarks: 9,
            tips: [
                "Spend about 20 minutes on this task",
                "Write at least 150 words",
                "Identify the main trends and significant features",
                "Make comparisons between the data sets",
                "Use appropriate vocabulary for describing trends",
                "Don't include personal opinions - be objective"
            ],
            criteria: ["Task Achievement", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"]
        },
        {
            id: "task2",
            title: "Task 2",
            subtitle: "Essay",
            timeRecommend: 40,
            instruction: `Some people believe that universities should focus on providing academic skills and knowledge rather than preparing students for employment.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
            minWords: 250,
            maxMarks: 9,
            tips: [
                "Spend about 40 minutes on this task",
                "Write at least 250 words",
                "Plan your essay structure before writing",
                "Include an introduction, body paragraphs, and conclusion",
                "Clearly state your position/opinion",
                "Support your arguments with examples",
                "Use a range of vocabulary and sentence structures"
            ],
            criteria: ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"]
        }
    ];

    const currentTaskData = tasks[currentTask];
    const currentAnswer = answers[currentTaskData.id] || "";
    const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

    // Band Score Calculation for Writing
    const getWritingBandScore = (task1Words, task2Words) => {
        // Simplified band score based on word count and completion
        let task1Score = 0;
        let task2Score = 0;

        // Task 1 scoring (150 words required)
        if (task1Words >= 150) task1Score = 6.5;
        else if (task1Words >= 120) task1Score = 5.5;
        else if (task1Words >= 80) task1Score = 4.5;
        else if (task1Words >= 40) task1Score = 3.5;
        else task1Score = 2.5;

        // Task 2 scoring (250 words required, weighted double)
        if (task2Words >= 250) task2Score = 6.5;
        else if (task2Words >= 200) task2Score = 5.5;
        else if (task2Words >= 150) task2Score = 4.5;
        else if (task2Words >= 80) task2Score = 3.5;
        else task2Score = 2.5;

        // Task 2 counts double
        const overallBand = (task1Score + task2Score * 2) / 3;
        return Math.round(overallBand * 2) / 2; // Round to nearest 0.5
    };

    useEffect(() => {
        if (showInstructions) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showInstructions]);

    // Auto-save simulation
    useEffect(() => {
        if (!showInstructions && (answers.task1 || answers.task2)) {
            const autoSave = setInterval(() => {
                setLastSaved(new Date());
            }, 30000);
            return () => clearInterval(autoSave);
        }
    }, [answers, showInstructions]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleTextChange = (value) => {
        setAnswers((prev) => ({ ...prev, [currentTaskData.id]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const task1Words = answers.task1?.trim().split(/\s+/).filter(Boolean).length || 0;
        const task2Words = answers.task2?.trim().split(/\s+/).filter(Boolean).length || 0;

        const bandScore = getWritingBandScore(task1Words, task2Words);

        // For writing, we use band score directly (max 9)
        const totalScore = Math.round(bandScore * 2); // Convert to out of 18 for consistency

        localStorage.setItem(`exam_${params.examId}_writing`, JSON.stringify({
            answers,
            score: totalScore,
            total: 18,
            bandScore,
            task1Words,
            task2Words,
            timeSpent: 60 * 60 - timeLeft
        }));

        router.push(`/exam/${params.examId}/result?module=writing&score=${totalScore}&total=18&band=${bandScore}`);
    };

    const meetsMinWords = wordCount >= currentTaskData.minWords;

    // Instructions Screen
    if (showInstructions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <FaPen className="text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">IELTS Writing Test</h1>
                            <p className="text-slate-400">Academic • 2 Tasks • 60 Minutes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h4 className="font-semibold text-emerald-300">Task 1</h4>
                            <p className="text-slate-400 text-sm">Describe visual data</p>
                            <p className="text-emerald-400 text-sm mt-2">Minimum 150 words • 20 mins</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h4 className="font-semibold text-emerald-300">Task 2</h4>
                            <p className="text-slate-400 text-sm">Write an essay</p>
                            <p className="text-emerald-400 text-sm mt-2">Minimum 250 words • 40 mins</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <h3 className="font-semibold text-emerald-300 mb-2">Assessment Criteria</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                <div>• Task Achievement/Response</div>
                                <div>• Coherence & Cohesion</div>
                                <div>• Lexical Resource</div>
                                <div>• Grammatical Range & Accuracy</div>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <h3 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                                <FaExclamationTriangle />
                                Important Notes
                            </h3>
                            <ul className="text-slate-300 text-sm space-y-1">
                                <li>• Task 2 contributes <strong>twice as much</strong> as Task 1 to your score</li>
                                <li>• Writing below the minimum word count will lose marks</li>
                                <li>• Your work is auto-saved every 30 seconds</li>
                                <li>• Write in complete sentences and paragraphs</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all cursor-pointer"
                    >
                        <FaPlay />
                        Start Writing Test
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Header */}
            <header className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <FaPen className="text-lg" />
                            </div>
                            <div>
                                <h1 className="font-semibold">IELTS Writing</h1>
                                <p className="text-xs text-slate-400">{currentTaskData.title} • {currentTaskData.subtitle}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {lastSaved && (
                                <span className="hidden md:flex items-center gap-1 text-slate-500 text-sm">
                                    <FaSave className="text-emerald-400" />
                                    Saved
                                </span>
                            )}

                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono ${timeLeft < 300 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10"
                                }`}>
                                <FaClock />
                                <span className="text-lg">{formatTime(timeLeft)}</span>
                            </div>

                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Task Tabs */}
                <div className="flex gap-4 mb-6">
                    {tasks.map((task, index) => {
                        const taskWordCount = answers[task.id]?.trim().split(/\s+/).filter(Boolean).length || 0;
                        const taskMeetsMin = taskWordCount >= task.minWords;

                        return (
                            <button
                                key={task.id}
                                onClick={() => setCurrentTask(index)}
                                className={`flex-1 p-5 rounded-2xl border-2 transition-all cursor-pointer ${currentTask === index
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-lg">{task.title}</span>
                                    {answers[task.id] && (
                                        <span className={`flex items-center gap-1 text-sm ${taskMeetsMin ? "text-emerald-400" : "text-amber-400"}`}>
                                            {taskMeetsMin && <FaCheck className="text-xs" />}
                                            {taskWordCount} words
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm text-left">{task.subtitle}</p>
                                <p className="text-slate-500 text-xs text-left mt-1">
                                    Min. {task.minWords} words • {task.timeRecommend} mins
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Instructions Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        <motion.div
                            key={currentTaskData.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                                    {currentTaskData.title}
                                </span>
                            </div>

                            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                {currentTaskData.instruction}
                            </div>

                            {currentTaskData.sampleData && (
                                <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-600 text-sm">
                                    <p className="text-slate-400 text-xs mb-2">Reference Data:</p>
                                    <pre className="text-slate-300 whitespace-pre-line font-sans">{currentTaskData.sampleData}</pre>
                                </div>
                            )}

                            {currentTaskData.imageDesc && (
                                <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-dashed border-slate-600 text-center text-slate-400 text-sm">
                                    {currentTaskData.imageDesc}
                                </div>
                            )}
                        </motion.div>

                        {/* Tips */}
                        <button
                            onClick={() => setShowTips(!showTips)}
                            className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
                        >
                            <span className="flex items-center gap-2 text-slate-300">
                                <FaLightbulb className="text-amber-400" />
                                Writing Tips
                            </span>
                            <FaChevronRight className={`text-slate-500 transition-transform ${showTips ? 'rotate-90' : ''}`} />
                        </button>

                        {showTips && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4"
                            >
                                <ul className="space-y-2">
                                    {currentTaskData.tips.map((tip, i) => (
                                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                            <FaCheck className="text-amber-400 mt-1 flex-shrink-0 text-xs" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Assessment Criteria */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <p className="text-slate-400 text-sm mb-3">Assessment Criteria</p>
                            <div className="flex flex-wrap gap-2">
                                {currentTaskData.criteria.map((c, i) => (
                                    <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Writing Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                            {/* Writing Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-emerald-500/5">
                                <span className="text-slate-300 font-medium">Your Response</span>
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center gap-2 text-sm ${meetsMinWords ? "text-emerald-400" : "text-amber-400"}`}>
                                        {meetsMinWords && <FaCheck className="text-xs" />}
                                        {wordCount} / {currentTaskData.minWords} words
                                    </span>
                                </div>
                            </div>

                            {/* Word count progress bar */}
                            <div className="h-1.5 bg-white/5">
                                <motion.div
                                    className={`h-full ${meetsMinWords ? "bg-emerald-500" : "bg-amber-500"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((wordCount / currentTaskData.minWords) * 100, 100)}%` }}
                                ></motion.div>
                            </div>

                            {/* Text Area */}
                            <textarea
                                value={currentAnswer}
                                onChange={(e) => handleTextChange(e.target.value)}
                                placeholder={`Start writing your ${currentTaskData.subtitle.toLowerCase()} here...`}
                                className="flex-1 bg-transparent p-6 resize-none focus:outline-none text-white/90 leading-relaxed placeholder-slate-600"
                                style={{ fontFamily: 'Georgia, serif', fontSize: '17px', lineHeight: '1.8' }}
                            />

                            {/* Writing Footer */}
                            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.02]">
                                <p className="text-slate-500 text-xs">
                                    Auto-saves every 30 seconds
                                </p>
                            </div>
                        </div>

                        {/* Task Navigation */}
                        <div className="flex justify-between items-center mt-4">
                            <button
                                onClick={() => setCurrentTask(0)}
                                disabled={currentTask === 0}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${currentTask === 0 ? "text-slate-600 cursor-not-allowed" : "text-slate-300 hover:bg-white/10"
                                    }`}
                            >
                                <FaChevronLeft className="text-sm" />
                                Task 1
                            </button>

                            {currentTask === 0 ? (
                                <button
                                    onClick={() => setCurrentTask(1)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
                                >
                                    Continue to Task 2
                                    <FaChevronRight className="text-sm" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
                                >
                                    Submit Writing Test
                                    <FaCheck />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Submit Writing Test?</h3>
                            <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-3 mb-6">
                            {tasks.map((task, index) => {
                                const taskWordCount = answers[task.id]?.trim().split(/\s+/).filter(Boolean).length || 0;
                                const taskMeetsMin = taskWordCount >= task.minWords;

                                return (
                                    <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <span className="font-medium">{task.title}</span>
                                            <p className="text-slate-500 text-sm">{task.subtitle}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`${taskMeetsMin ? "text-emerald-400" : "text-amber-400"}`}>
                                                {taskWordCount} words
                                            </span>
                                            <p className="text-slate-500 text-xs">min. {task.minWords}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-3 border border-white/20 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                Continue Writing
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
