"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
    FaCheckCircle,
    FaRedo,
    FaHome,
    FaHeadphones,
    FaBook,
    FaPen,
    FaLayerGroup
} from "react-icons/fa";
import { studentsAPI } from "@/lib/api";

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
    const [fullResults, setFullResults] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null);
    const savedRef = useRef(false);

    // Save scores to backend when writing is completed (exam finished)
    useEffect(() => {
        const saveExamResults = async () => {
            // Only save when writing module is completed (final module)
            if (module !== "writing" || savedRef.current) return;

            try {
                // Get all section results from localStorage
                const listeningData = localStorage.getItem(`exam_${params.examId}_listening`);
                const readingData = localStorage.getItem(`exam_${params.examId}_reading`);
                const writingData = localStorage.getItem(`exam_${params.examId}_writing`);

                // Parse results
                const listening = listeningData ? JSON.parse(listeningData) : null;
                const reading = readingData ? JSON.parse(readingData) : null;
                const writing = writingData ? JSON.parse(writingData) : null;

                // Build scores object
                const scores = {};

                if (listening) {
                    scores.listening = {
                        score: listening.score || 0,
                        total: listening.total || 40,
                        band: listening.bandScore || 0
                    };
                }

                if (reading) {
                    scores.reading = {
                        score: reading.score || 0,
                        total: reading.total || 40,
                        band: reading.bandScore || 0
                    };
                }

                if (writing) {
                    scores.writing = {
                        task1Words: writing.task1Words || 0,
                        task2Words: writing.task2Words || 0,
                        band: writing.bandScore || 0
                    };
                }

                // Save to backend
                savedRef.current = true;
                const response = await studentsAPI.completeExam(params.examId, scores);

                if (response.success) {
                    setSaveStatus("saved");
                    console.log("Exam results saved to backend successfully");

                    // Clear localStorage after successful save
                    localStorage.removeItem(`exam_${params.examId}_listening`);
                    localStorage.removeItem(`exam_${params.examId}_reading`);
                    localStorage.removeItem(`exam_${params.examId}_writing`);
                    localStorage.removeItem("examSession");
                }
            } catch (error) {
                console.error("Failed to save exam results:", error);
                setSaveStatus("error");
            }
        };

        saveExamResults();
    }, [module, params.examId]);

    // Animate scores
    useEffect(() => {
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

        if (module === "full") {
            const saved = localStorage.getItem(`exam_${params.examId}_full`);
            if (saved) setFullResults(JSON.parse(saved));
        }

        return () => {
            clearInterval(timer);
            clearInterval(bandTimer);
        };
    }, [score, band, module, params.examId]);

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const getBandInfo = (bandScore) => {
        if (bandScore >= 8.5) return { level: "Expert", color: "text-green-600", bgColor: "bg-green-100", desc: "Excellent command of English" };
        if (bandScore >= 7.5) return { level: "Very Good", color: "text-green-600", bgColor: "bg-green-100", desc: "Operational command with occasional inaccuracies" };
        if (bandScore >= 6.5) return { level: "Competent", color: "text-blue-600", bgColor: "bg-blue-100", desc: "Generally effective command of English" };
        if (bandScore >= 5.5) return { level: "Modest", color: "text-amber-600", bgColor: "bg-amber-100", desc: "Partial command of English" };
        if (bandScore >= 4.5) return { level: "Limited", color: "text-orange-600", bgColor: "bg-orange-100", desc: "Basic competence in familiar situations" };
        return { level: "Beginner", color: "text-red-600", bgColor: "bg-red-100", desc: "Needs improvement" };
    };

    const bandInfo = getBandInfo(band);

    const moduleInfo = {
        listening: { name: "Listening", icon: <FaHeadphones className="text-xl" />, bgColor: "bg-cyan-100", textColor: "text-cyan-600" },
        reading: { name: "Reading", icon: <FaBook className="text-xl" />, bgColor: "bg-blue-100", textColor: "text-blue-600" },
        writing: { name: "Writing", icon: <FaPen className="text-xl" />, bgColor: "bg-green-100", textColor: "text-green-600" },
        full: { name: "Full Exam", icon: <FaLayerGroup className="text-xl" />, bgColor: "bg-cyan-100", textColor: "text-cyan-600" }
    };

    const currentModule = moduleInfo[module] || moduleInfo.listening;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-cyan-600 font-bold text-xl">IELTS</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600">Test Result</span>
                    </div>
                    <span className="text-gray-500 text-sm">Exam ID: {params.examId}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-xl">
                    {/* Result Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                        {/* Module Badge */}
                        <div className="flex items-center justify-center mb-6">
                            <div className={`inline-flex items-center gap-3 ${currentModule.bgColor} ${currentModule.textColor} px-5 py-2.5 rounded-lg`}>
                                {currentModule.icon}
                                <span className="font-semibold">{currentModule.name} Complete</span>
                                <FaCheckCircle />
                            </div>
                        </div>

                        {/* Band Score Display */}
                        <div className="text-center mb-8">
                            <div className="relative inline-block mb-4">
                                <div className="w-32 h-32 rounded-full border-4 border-cyan-600 flex flex-col items-center justify-center bg-cyan-50">
                                    <span className="text-xs text-gray-500">Band Score</span>
                                    <span className="text-4xl font-bold text-cyan-600">{animatedBand.toFixed(1)}</span>
                                </div>
                            </div>

                            <div className={`inline-block ${bandInfo.bgColor} ${bandInfo.color} px-4 py-2 rounded-lg mb-2`}>
                                <p className="font-bold text-lg">{bandInfo.level}</p>
                            </div>
                            <p className="text-gray-500">{bandInfo.desc}</p>
                        </div>

                        {/* Score Details */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                <p className="text-gray-500 text-sm mb-1">Correct Answers</p>
                                <p className="text-2xl font-bold text-gray-800">{animatedScore}<span className="text-lg text-gray-400">/{total}</span></p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                <p className="text-gray-500 text-sm mb-1">Percentage</p>
                                <p className="text-2xl font-bold text-gray-800">{percentage}%</p>
                            </div>
                        </div>

                        {/* Band Score Scale */}
                        <div className="mb-6">
                            <p className="text-gray-500 text-sm mb-2 text-center">IELTS Band Scale</p>
                            <div className="relative h-2 bg-gradient-to-r from-red-400 via-amber-400 via-green-400 to-green-500 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-800 shadow"
                                    style={{ left: `${((band - 1) / 8) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>1</span>
                                <span>5</span>
                                <span>9</span>
                            </div>
                        </div>

                        {/* Full Exam Breakdown */}
                        {module === "full" && fullResults && (
                            <div className="mb-6">
                                <h3 className="text-gray-700 font-semibold mb-3 text-center">Section Breakdown</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { name: "Listening", data: fullResults.listening, icon: <FaHeadphones />, color: "cyan" },
                                        { name: "Reading", data: fullResults.reading, icon: <FaBook />, color: "blue" },
                                        { name: "Writing", data: fullResults.writing, icon: <FaPen />, color: "green" }
                                    ].map((section, i) => (
                                        <div key={i} className={`bg-${section.color}-50 border border-${section.color}-200 rounded-lg p-3 text-center`}>
                                            <div className={`text-${section.color}-600 mb-1 flex justify-center`}>{section.icon}</div>
                                            <p className="text-xs text-gray-500">{section.name}</p>
                                            <p className="text-lg font-bold text-gray-800">{section.data?.bandScore || "N/A"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* University Requirements */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <p className="text-gray-600 text-sm mb-2">Your Score Meets Requirements For:</p>
                            <div className="flex flex-wrap gap-2">
                                {band >= 6.0 && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Undergraduate Programs</span>}
                                {band >= 6.5 && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Many Graduate Programs</span>}
                                {band >= 7.0 && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Top Universities</span>}
                                {band < 6.0 && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">Foundation Courses</span>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push(`/exam/${params.examId}`)}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 border border-gray-200 py-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-gray-700"
                            >
                                <FaRedo />
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer"
                            >
                                <FaHome />
                                Home
                            </button>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <p className="text-center text-gray-400 text-sm mt-6">
                        This is an indicative score. Official IELTS scores may vary.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 px-4">
                <div className="max-w-3xl mx-auto text-center text-gray-400 text-sm">
                    © 2024 IELTS Exam - BdCalling Academy
                </div>
            </footer>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-gray-600">Loading results...</div>
            </div>
        }>
            <ResultContent />
        </Suspense>
    );
}
