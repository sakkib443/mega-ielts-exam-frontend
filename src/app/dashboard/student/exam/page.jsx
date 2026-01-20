"use client";

import React, { useState, useEffect } from "react";
import {
    FaHeadphones,
    FaBook,
    FaPen,
    FaCheckCircle,
    FaArrowRight,
    FaLock,
    FaExclamationCircle,
    FaInfoCircle,
    FaClock
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentsAPI } from "@/lib/api";

export default function StudentExams() {
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
                    setError("Failed to fetch exam data");
                }
            } catch (err) {
                console.error("Exam list error:", err);
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
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium tracking-tight">Loading exam modules...</p>
            </div>
        );
    }

    const { examId, completedModules = [], examStatus } = studentData;

    const modules = [
        {
            id: "listening",
            title: "Listening Module",
            description: "Assess your ability to understand spoken English in various contexts.",
            icon: FaHeadphones,
            color: "blue",
            duration: "30-40 Minutes",
            questions: 40
        },
        {
            id: "reading",
            title: "Reading Module",
            description: "Test your reading skills through a wide range of texts and questions.",
            icon: FaBook,
            color: "emerald",
            duration: "60 Minutes",
            questions: 40
        },
        {
            id: "writing",
            title: "Writing Module",
            description: "Evaluate your English writing proficiency through two specific tasks.",
            icon: FaPen,
            color: "violet",
            duration: "60 Minutes",
            questions: 2
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">My Exam Modules</h2>
                    <p className="text-slate-500 font-medium mt-1">Complete all three modules to finish your IELTS assessment.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Overall Progress</p>
                        <p className="text-sm font-black text-indigo-600">{completedModules.length}/3 Completed</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <FaCheckCircle className="text-indigo-500 text-xl" />
                    </div>
                </div>
            </div>

            {/* Exam Modules Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {modules.map((mod) => {
                    const isCompleted = completedModules.includes(mod.id) || completedModules.includes(mod.id.toUpperCase());

                    return (
                        <div
                            key={mod.id}
                            className={`group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 transition-all flex flex-col ${isCompleted ? 'opacity-90' : 'hover:border-indigo-200 hover:shadow-indigo-100'
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-${mod.color}-50 text-${mod.color}-600 flex items-center justify-center mb-8 border border-${mod.color}-100 transition-transform group-hover:-rotate-6 shadow-sm`}>
                                <mod.icon className="text-2xl" />
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-3">{mod.title}</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium flex-1">
                                {mod.description}
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><FaClock className="text-[10px]" /> Duration</span>
                                    <span className="text-slate-700 text-sm font-black">{mod.duration}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><FaInfoCircle className="text-[10px]" /> Questions</span>
                                    <span className="text-slate-700 text-sm font-black">{mod.questions} Items</span>
                                </div>
                            </div>

                            {isCompleted ? (
                                <div className="bg-emerald-50 text-emerald-600 h-14 rounded-2xl flex items-center justify-center gap-2 font-black shadow-inner">
                                    <FaCheckCircle /> Completed
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        localStorage.setItem("examSession", JSON.stringify({
                                            examId: studentData.examId,
                                            name: studentData.nameEnglish,
                                            email: studentData.email
                                        }));
                                        router.push(`/exam/${examId}/${mod.id}`);
                                    }}
                                    className={`bg-indigo-600 text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all`}
                                >
                                    Start Now <FaArrowRight />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Support Box */}
            <div className="bg-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center flex-shrink-0 animate-bounce">
                        <FaLock className="text-3xl text-indigo-300" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black mb-2">Important Exam Rules</h4>
                        <p className="text-indigo-100/60 max-w-2xl font-medium leading-relaxed">
                            Once you start a module, do not refresh the page or exit the browser. Any violation tracking might lead to exam termination. Ensure a stable internet connection before starting.
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>
        </div>
    );
}
