"use client";

import React, { useState, useEffect } from "react";
import {
    FaChartBar,
    FaFileDownload,
    FaInfoCircle,
    FaLock,
    FaRegSmileBeam,
    FaArrowLeft,
    FaHeadphones,
    FaBook,
    FaPen,
    FaTrophy
} from "react-icons/fa";
import Link from "next/link";
import { studentsAPI } from "@/lib/api";

export default function StudentResults() {
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
                    setError("Failed to fetch results data");
                }
            } catch (err) {
                console.error("Results list error:", err);
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
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold tracking-tight">Accessing academic records...</p>
            </div>
        );
    }

    const { scores, resultsPublished, adminRemarks } = studentData;

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/student" className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                    <FaArrowLeft />
                </Link>
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Final Assessment Results</h2>
                    <p className="text-slate-500 font-medium">Detailed breakdown of your IELTS performance scores.</p>
                </div>
            </div>

            {!resultsPublished ? (
                /* Un-published State */
                <div className="bg-white rounded-[3rem] p-16 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="w-28 h-28 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-10 border border-indigo-100/50 shadow-inner group">
                        <FaLock className="text-4xl text-indigo-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">Results Under Review</h3>
                    <p className="text-slate-500 max-w-lg mb-12 text-lg leading-relaxed font-medium">
                        Our examiners are currently reviewing your answer sheets. Results are typically published within 24-48 hours after exam completion.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Next Step</p>
                            <p className="text-sm font-bold text-slate-700">Check back after 24 hours</p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Support</p>
                            <p className="text-sm font-bold text-slate-700">admin@ielts.hub</p>
                        </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-100/30 rounded-full -translate-x-1/4 translate-y-1/4"></div>
                </div>
            ) : (
                /* Published State */
                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Main Results Column */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Summary Score Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 flex flex-col items-center justify-center shadow-inner">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-indigo-300 mb-2">Overall Score</p>
                                    <h2 className="text-7xl font-black">{scores?.overall || "0.0"}</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-black mb-2">Congratulations! 🎉</h3>
                                        <p className="text-indigo-200/70 font-medium text-lg leading-relaxed">
                                            You've successfully completed the IELTS Mock Assessment. Your overall performance is exceptional.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <button className="bg-white text-slate-900 px-8 h-12 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-lg">
                                            <FaFileDownload className="text-lg" /> Download Report
                                        </button>
                                        <div className="px-6 h-12 rounded-2xl border-2 border-white/20 flex items-center gap-3 font-bold text-white/80">
                                            <FaRegSmileBeam className="text-indigo-400" /> Verified Score
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        </div>

                        {/* Breakdown Sections */}
                        <div className="grid sm:grid-cols-2 gap-8">
                            <DetailedScore
                                title="Listening"
                                icon={FaHeadphones}
                                band={scores?.listening?.band}
                                raw={scores?.listening?.raw}
                                total={40}
                                color="indigo"
                            />
                            <DetailedScore
                                title="Reading"
                                icon={FaBook}
                                band={scores?.reading?.band}
                                raw={scores?.reading?.raw}
                                total={40}
                                color="emerald"
                            />
                            <DetailedScore
                                title="Writing"
                                icon={FaPen}
                                band={scores?.writing?.overallBand}
                                task1={scores?.writing?.task1Band}
                                task2={scores?.writing?.task2Band}
                                color="violet"
                            />
                            <div className="bg-white rounded-[2rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-70">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <FaTrophy className="text-slate-300 text-3xl" />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">More Statistics Coming Soon</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Examiner Feedback */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
                                    <FaInfoCircle />
                                </div>
                                <h4 className="font-black text-slate-800 text-xl tracking-tight">Examiner Notes</h4>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 italic text-slate-600 leading-relaxed font-medium">
                                "{adminRemarks || "No specific remarks provided by the examiner. You have done a great job overall."}"
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
                                <img src="https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Admin" />
                                <div>
                                    <p className="text-sm font-black text-slate-800">Chief Examiner</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IELTS HUB Academic Panel</p>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200">
                            <h4 className="text-xl font-black mb-6">Performance Tip</h4>
                            <p className="text-indigo-100/70 mb-8 leading-relaxed font-medium">
                                Your listening skills are impressive, but focusing more on 'Reading Section 3' can further boost your overall score to an 8.5 band.
                            </p>
                            <button className="w-full h-12 bg-white/10 backdrop-blur-md rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-all">
                                View Analysis
                            </button>
                        </div>
                    </div>
                    </div>
            )}
                </div>
            );
}

            const DetailedScore = ({title, icon: Icon, band, raw, total, color, task1, task2 }) => {
    const colorMap = {
                indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
            emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
            violet: "text-violet-600 bg-violet-50 border-violet-100"
    };

            return (
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 group transition-all hover:translate-y-[-4px]">
                <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorMap[color]} shadow-sm group-hover:rotate-12 transition-transform`}>
                        <Icon className="text-2xl" />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title} Band</p>
                        <h5 className="text-4xl font-black text-slate-800">{band !== undefined ? band.toFixed(1) : "—"}</h5>
                    </div>
                </div>

                {raw !== undefined ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Progress</span>
                            <span className="text-slate-800 text-sm font-black">{raw} / {total} Correct</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full transition-all duration-1000`}
                                style={{ width: `${(raw / total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Task 1</span>
                            <span className="text-xl font-black text-slate-800">{task1 || "—"}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Task 2</span>
                            <span className="text-xl font-black text-slate-800">{task2 || "—"}</span>
                        </div>
                    </div>
                )}
            </div>
            );
};
