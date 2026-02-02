"use client";

import React, { useState, useEffect } from "react";
import {
    FaHeadphones,
    FaBook,
    FaPen,
    FaLock,
    FaClock,
    FaDownload,
    FaCheckCircle,
    FaClipboardList,
    FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentsAPI } from "@/lib/api";

export default function StudentResults() {
    const router = useRouter();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await studentsAPI.getMyProfile();
                if (response.success) {
                    setStudentData(response.data);
                } else {
                    setError("Failed to fetch results");
                }
            } catch (err) {
                console.error("Results error:", err);
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-500 text-sm">Loading results...</p>
            </div>
        );
    }

    const {
        scores,
        resultsPublished,
        adminRemarks,
        nameEnglish,
        examId,
        examDate,
        completedModules = []
    } = studentData || {};

    const isAllCompleted = completedModules.length >= 3;
    const hasStartedExam = completedModules.length > 0;

    // Check if today is exam day
    const isExamDay = () => {
        if (!examDate) return false;
        const today = new Date();
        const exam = new Date(examDate);
        return (
            today.getFullYear() === exam.getFullYear() &&
            today.getMonth() === exam.getMonth() &&
            today.getDate() === exam.getDate()
        );
    };

    const formatExamDate = (date) => {
        if (!date) return "Not set";
        return new Date(date).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleStartExam = () => {
        if (!isExamDay()) {
            alert(`Your exam is scheduled for ${formatExamDate(examDate)}. Please come back on that day.`);
            return;
        }
        localStorage.setItem(
            "examSession",
            JSON.stringify({
                examId: studentData.examId,
                sessionId: studentData.examId,
                studentName: studentData.nameEnglish,
                name: studentData.nameEnglish,
                email: studentData.email,
            })
        );
        router.push(`/exam/${examId}`);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Exam Results</h1>
                <p className="text-gray-500 text-sm mt-1">Your IELTS assessment scores</p>
            </div>

            {/* Case 1: Results Published - Show Scores */}
            {resultsPublished ? (
                <div className="space-y-4">
                    {/* Overall Band Card */}
                    <div className="bg-white border border-gray-200 rounded-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Candidate: {nameEnglish}</p>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Congratulations on completing your exam!
                                </h2>
                            </div>
                            <div className="bg-cyan-600 text-white px-6 py-4 rounded-md text-center min-w-[100px]">
                                <p className="text-[10px] uppercase tracking-wide opacity-80">Overall</p>
                                <p className="text-3xl font-bold">{scores?.overall || "—"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Module Scores */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <ScoreCard
                            title="Listening"
                            icon={FaHeadphones}
                            band={scores?.listening?.band}
                            raw={scores?.listening?.raw}
                            total={40}
                        />
                        <ScoreCard
                            title="Reading"
                            icon={FaBook}
                            band={scores?.reading?.band}
                            raw={scores?.reading?.raw}
                            total={40}
                        />
                        <ScoreCard
                            title="Writing"
                            icon={FaPen}
                            band={scores?.writing?.overallBand}
                            task1={scores?.writing?.task1Band}
                            task2={scores?.writing?.task2Band}
                        />
                    </div>

                    {/* Examiner Remarks */}
                    {adminRemarks && (
                        <div className="bg-white border border-gray-200 rounded-md p-5">
                            <h4 className="font-medium text-gray-800 mb-3">Examiner's Remarks</h4>
                            <div className="bg-gray-50 border border-gray-100 rounded-md p-4">
                                <p className="text-gray-600 text-sm italic">"{adminRemarks}"</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <FaCheckCircle className="text-green-500" size={12} />
                            <span>Results verified and published</span>
                        </div>
                        <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                            <FaDownload size={12} /> Download Report
                        </button>
                    </div>
                </div>
            ) : isAllCompleted ? (
                /* Case 2: Exam Completed but Results Not Published */
                <div className="bg-white border border-gray-200 rounded-md p-8">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-amber-100 rounded-md flex items-center justify-center mx-auto mb-4">
                            <FaClock className="text-amber-600 text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Results Under Review</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Your exam has been submitted and is being evaluated. Results are typically published within 24-48 hours.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Status</p>
                                <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-xs font-medium">
                                    Pending
                                </span>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Exam ID</p>
                                <p className="text-sm font-medium text-gray-700">{examId}</p>
                            </div>
                        </div>

                        <div className="bg-cyan-50 border border-cyan-100 rounded-md p-4">
                            <p className="text-cyan-700 text-sm">
                                <strong>Tip:</strong> Check back later or contact admin for updates.
                            </p>
                        </div>
                    </div>
                </div>
            ) : hasStartedExam ? (
                /* Case 3: Exam In Progress */
                <div className="bg-white border border-gray-200 rounded-md p-8">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-blue-100 rounded-md flex items-center justify-center mx-auto mb-4">
                            <FaClipboardList className="text-blue-600 text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Exam In Progress</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            You need to complete all 3 modules (Listening, Reading, Writing) to get your results.
                        </p>

                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-gray-700 font-medium">{completedModules.length}/3 completed</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all"
                                    style={{ width: `${(completedModules.length / 3) * 100}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleStartExam}
                            className="bg-cyan-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            Continue Exam <FaArrowRight size={12} />
                        </button>
                    </div>
                </div>
            ) : (
                /* Case 4: Exam Not Started */
                <div className="bg-white border border-gray-200 rounded-md p-8">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-4">
                            <FaClipboardList className="text-gray-500 text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Yet</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Your exam is scheduled for {formatExamDate(examDate)}.
                        </p>

                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Exam ID</p>
                            <p className="text-sm font-medium text-gray-700">{examId}</p>
                        </div>

                        <button
                            onClick={handleStartExam}
                            className="bg-cyan-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            Start Exam <FaArrowRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const ScoreCard = ({ title, icon: Icon, band, raw, total, task1, task2 }) => (
    <div className="bg-white border border-gray-200 rounded-md p-5">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-cyan-100 rounded-md flex items-center justify-center text-cyan-600">
                    <Icon size={14} />
                </div>
                <span className="font-medium text-gray-800">{title}</span>
            </div>
        </div>

        <div className="text-center py-3 bg-gray-50 rounded-md border border-gray-100 mb-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Band Score</p>
            <p className="text-2xl font-bold text-gray-800">
                {band !== undefined ? band.toFixed(1) : "—"}
            </p>
        </div>

        {raw !== undefined ? (
            <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Correct Answers</span>
                    <span className="font-medium">{raw}/{total}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-600 rounded-full"
                        style={{ width: `${(raw / total) * 100}%` }}
                    />
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-md p-2.5 text-center border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase">Task 1</p>
                    <p className="font-semibold text-gray-800">{task1 || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-2.5 text-center border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase">Task 2</p>
                    <p className="font-semibold text-gray-800">{task2 || "—"}</p>
                </div>
            </div>
        )}
    </div>
);
