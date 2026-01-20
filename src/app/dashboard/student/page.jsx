"use client";

import React, { useState, useEffect } from "react";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationCircle,
    FaClock,
    FaArrowRight,
    FaHeadphones,
    FaBook,
    FaPen,
    FaChartLine
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentsAPI } from "@/lib/api";

export default function StudentDashboard() {
    const router = useRouter();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Fetch student profile using logged in user's session
                const response = await studentsAPI.getMyProfile();
                if (response.success) {
                    setStudentData(response.data);
                } else {
                    setError("Failed to fetch student data");
                }
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading dashboard information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl flex items-center gap-4">
                <FaExclamationCircle className="text-red-500 text-3xl flex-shrink-0" />
                <div>
                    <h3 className="text-red-800 font-bold text-lg">Error Loading Dashboard</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    const {
        nameEnglish,
        email,
        phone,
        examId,
        examStatus,
        examDate,
        paymentStatus,
        scores,
        resultsPublished,
        completedModules = []
    } = studentData;

    const isAllCompleted = completedModules.length >= 3;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Hero Section / Welcome */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-violet-800 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl shadow-indigo-200">
                <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                            Welcome Back
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">
                            Hi, {nameEnglish.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-indigo-100/80 text-lg max-w-md mb-8 leading-relaxed font-medium">
                            Welcome to your IELTS Command Center. Track your progress, check your results, and manage your exam journey.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {!isAllCompleted ? (
                                <button
                                    onClick={() => {
                                        // Set session for compatibility with older exam logic
                                        localStorage.setItem("examSession", JSON.stringify({
                                            examId: studentData.examId,
                                            name: studentData.nameEnglish,
                                            email: studentData.email
                                        }));
                                        router.push(`/exam/${examId}`);
                                    }}
                                    className="bg-white text-indigo-700 px-8 h-14 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                                >
                                    Continue Exam <FaArrowRight />
                                </button>
                            ) : (
                                <div className="bg-emerald-500 text-white px-8 h-14 rounded-2xl font-bold flex items-center gap-3 shadow-lg">
                                    Exam Completed <FaCheckCircle />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden lg:flex justify-end pr-8">
                        {/* Summary Card inside Hero */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 w-80 shadow-inner">
                            <h4 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-6">Exam Snapshot</h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-indigo-100/60 text-sm">Status</span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${examStatus === 'completed' ? 'bg-emerald-500 text-white' :
                                        examStatus === 'in-progress' ? 'bg-amber-500 text-white' : 'bg-white/20 text-white'
                                        }`}>
                                        {examStatus}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-indigo-100/60 text-sm">Modules Done</span>
                                    <span className="text-2xl font-black">{completedModules.length}/3</span>
                                </div>
                                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${(completedModules.length / 3) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-50">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 relative group overflow-hidden">
                                <FaUser className="text-3xl" />
                                {studentData.photo && <img src={studentData.photo} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 truncate">{nameEnglish}</h3>
                                <p className="text-slate-400 text-sm font-bold">Student Profile</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <InfoRow icon={FaIdCard} label="Exam ID" value={examId} color="indigo" />
                            <InfoRow icon={FaEnvelope} label="Email Address" value={email} color="sky" />
                            <InfoRow icon={FaPhone} label="Phone Number" value={phone} color="emerald" />
                            <InfoRow icon={FaCalendarAlt} label="Exam Date" value={new Date(examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} color="rose" />
                            <InfoRow icon={FaClock} label="Payment Status" value={paymentStatus} color="amber" badge />
                        </div>
                    </div>

                    {/* Quick Links / Help */}
                    <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100/50">
                        <h4 className="text-indigo-900 font-black mb-6">Need Assistance?</h4>
                        <p className="text-indigo-700/70 text-sm mb-6 font-medium leading-relaxed">
                            Having trouble with your exam or profile information? Contact our academic support team.
                        </p>
                        <button className="w-full h-12 bg-white text-indigo-700 font-bold rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all active:scale-95 shadow-sm">
                            Support Helpdesk
                        </button>
                    </div>
                </div>

                {/* Score Section */}
                <div className="lg:col-span-2 space-y-8">
                    {resultsPublished ? (
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-8 border-b border-slate-50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">Exam Results</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-tighter text-xs mt-1">Published by Academic Department</p>
                                </div>
                                <div className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] flex items-center gap-4 shadow-xl shadow-indigo-200">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100/70">Overall Band</p>
                                        <h2 className="text-4xl font-black">{scores?.overall || "0.0"}</h2>
                                    </div>
                                    <FaChartLine className="text-3xl text-indigo-100/50" />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <ScoreCard
                                    title="Listening"
                                    icon={FaHeadphones}
                                    band={scores?.listening?.band}
                                    raw={scores?.listening?.raw}
                                    total={40}
                                    color="blue"
                                />
                                <ScoreCard
                                    title="Reading"
                                    icon={FaBook}
                                    band={scores?.reading?.band}
                                    raw={scores?.reading?.raw}
                                    total={40}
                                    color="emerald"
                                />
                                <ScoreCard
                                    title="Writing"
                                    icon={FaPen}
                                    band={scores?.writing?.overallBand}
                                    task1={scores?.writing?.task1Band}
                                    task2={scores?.writing?.task2Band}
                                    color="violet"
                                />
                                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 flex flex-col justify-center items-center text-center">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                        <FaCheckCircle className="text-2xl" />
                                    </div>
                                    <h4 className="font-black text-slate-700 mb-1">Results Verified</h4>
                                    <p className="text-slate-400 text-xs font-bold leading-relaxed">Your results have been checked and verified by official examiners.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-8 border border-amber-100 animate-pulse">
                                <FaClock className="text-4xl text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-4">Results are Pending</h3>
                            <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">
                                Your exam modules are under review. Results will be visible here once the admin publishes them.
                            </p>
                            <div className="w-full max-w-md h-2 bg-slate-50 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-amber-400 w-3/4 animate-pulse"></div>
                            </div>
                            <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest">Grading in Progress</p>
                        </div>
                    )}

                    {/* Admin Remarks */}
                    {resultsPublished && studentData.adminRemarks && (
                        <div className="bg-white rounded-[2rem] p-8 border border-indigo-100 shadow-xl shadow-indigo-100/50 border-l-[10px] border-l-indigo-600">
                            <h4 className="text-lg font-black text-slate-800 mb-4">Examiner Remarks</h4>
                            <p className="text-slate-600 leading-relaxed font-medium italic">
                                "{studentData.adminRemarks}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const InfoRow = ({ icon: Icon, label, value, color, badge }) => (
    <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center flex-shrink-0 border border-${color}-100`}>
            <Icon />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">{label}</p>
            {badge ? (
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${value === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                    {value}
                </span>
            ) : (
                <p className="text-sm font-bold text-slate-700 truncate">{value || 'N/A'}</p>
            )}
        </div>
    </div>
);

const ScoreCard = ({ title, icon: Icon, band, raw, total, color, task1, task2 }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100"
    };

    return (
        <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100 group">
            <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 ${colorClasses[color]} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                    <Icon className="text-xl" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title} Band</p>
                    <h5 className="text-2xl font-black text-slate-800">{band !== undefined ? band.toFixed(1) : "—"}</h5>
                </div>
            </div>
            <div className="space-y-3">
                {raw !== undefined ? (
                    <>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Raw Score</span>
                            <span className="text-slate-700">{raw} / {total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full bg-${color === 'blue' ? 'blue' : color === 'emerald' ? 'emerald' : 'violet'}-500 rounded-full`} style={{ width: `${(raw / total) * 100}%` }}></div>
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-2 rounded-xl border border-slate-200/50">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Task 1</p>
                            <p className="text-sm font-black text-slate-700">{task1 || "—"}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/50">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Task 2</p>
                            <p className="text-sm font-black text-slate-700">{task2 || "—"}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
