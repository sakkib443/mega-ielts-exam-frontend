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
    FaChartLine,
    FaTrophy,
    FaGraduationCap,
    FaFileAlt,
    FaSpinner
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
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <FaSpinner className="animate-spin text-5xl text-indigo-600 mb-4" />
                <p className="text-slate-600 font-semibold text-lg">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaExclamationCircle className="text-red-600 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-red-900 font-bold text-xl mb-2">Error Loading Dashboard</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
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
    const progressPercentage = (completedModules.length / 3) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Welcome back, {nameEnglish.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-600 text-lg">Here's your IELTS exam progress overview</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={FaGraduationCap}
                        label="Exam Status"
                        value={examStatus}
                        color="indigo"
                        badge
                    />
                    <StatCard
                        icon={FaTrophy}
                        label="Modules Completed"
                        value={`${completedModules.length} / 3`}
                        color="emerald"
                    />
                    <StatCard
                        icon={FaCalendarAlt}
                        label="Exam Date"
                        value={new Date(examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        color="violet"
                    />
                    <StatCard
                        icon={FaCheckCircle}
                        label="Payment Status"
                        value={paymentStatus}
                        color={paymentStatus === 'paid' ? 'emerald' : 'amber'}
                        badge
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 h-24"></div>
                            <div className="px-6 pb-6 -mt-12">
                                <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border-4 border-white">
                                    {studentData.photo ? (
                                        <img src={studentData.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUser className="text-4xl text-slate-400" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">{nameEnglish}</h2>
                                <p className="text-slate-600 text-sm mb-6">IELTS Candidate</p>

                                <div className="space-y-4">
                                    <InfoItem icon={FaIdCard} label="Exam ID" value={examId} />
                                    <InfoItem icon={FaEnvelope} label="Email" value={email} />
                                    <InfoItem icon={FaPhone} label="Phone" value={phone} />
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-lg text-white">
                            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                                Contact our support team for any assistance with your exam.
                            </p>
                            <button className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Exam Progress</h3>
                                    <p className="text-slate-600">Track your module completion</p>
                                </div>
                                {!isAllCompleted ? (
                                    <button
                                        onClick={() => {
                                            localStorage.setItem("examSession", JSON.stringify({
                                                examId: studentData.examId,
                                                name: studentData.nameEnglish,
                                                email: studentData.email
                                            }));
                                            router.push(`/exam/${examId}`);
                                        }}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        Continue Exam <FaArrowRight />
                                    </button>
                                ) : (
                                    <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                                        <FaCheckCircle /> Completed
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                                    <span className="text-sm font-bold text-indigo-600">{completedModules.length} / 3 Modules</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Module Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ModuleCard
                                    title="Listening"
                                    icon={FaHeadphones}
                                    completed={completedModules.includes('listening')}
                                    color="blue"
                                />
                                <ModuleCard
                                    title="Reading"
                                    icon={FaBook}
                                    completed={completedModules.includes('reading')}
                                    color="emerald"
                                />
                                <ModuleCard
                                    title="Writing"
                                    icon={FaPen}
                                    completed={completedModules.includes('writing')}
                                    color="violet"
                                />
                            </div>
                        </div>

                        {/* Results Card */}
                        {resultsPublished ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">Exam Results</h3>
                                        <p className="text-slate-600">Your official IELTS band scores</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-8 py-6 rounded-2xl shadow-xl">
                                        <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-1">Overall Band</p>
                                        <p className="text-5xl font-bold">{scores?.overall || "0.0"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                                        subtitle={`T1: ${scores?.writing?.task1Band || '—'} • T2: ${scores?.writing?.task2Band || '—'}`}
                                        color="violet"
                                    />
                                </div>

                                {studentData.adminRemarks && (
                                    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-6">
                                        <div className="flex items-start gap-3">
                                            <FaFileAlt className="text-amber-600 text-xl mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-amber-900 mb-2">Examiner's Remarks</h4>
                                                <p className="text-amber-800 leading-relaxed italic">"{studentData.adminRemarks}"</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaClock className="text-4xl text-amber-600 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Results Under Review</h3>
                                <p className="text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                                    Your exam is being evaluated by our examiners. Results will be published shortly.
                                </p>
                                <div className="w-full max-w-sm mx-auto h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-2/3 animate-pulse"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, badge }) => {
    const colorClasses = {
        indigo: "from-indigo-500 to-indigo-600",
        emerald: "from-emerald-500 to-emerald-600",
        violet: "from-violet-500 to-violet-600",
        amber: "from-amber-500 to-amber-600"
    };

    const badgeClasses = {
        'completed': 'bg-emerald-100 text-emerald-700',
        'in-progress': 'bg-amber-100 text-amber-700',
        'not-started': 'bg-slate-100 text-slate-700',
        'paid': 'bg-emerald-100 text-emerald-700',
        'pending': 'bg-amber-100 text-amber-700'
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="text-xl" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                    {badge ? (
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${badgeClasses[value] || 'bg-slate-100 text-slate-700'}`}>
                            {value}
                        </span>
                    ) : (
                        <p className="text-lg font-bold text-slate-900">{value}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Info Item Component
const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
            <Icon className="text-sm" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{value || 'N/A'}</p>
        </div>
    </div>
);

// Module Card Component
const ModuleCard = ({ title, icon: Icon, completed, color }) => {
    const colorClasses = {
        blue: completed ? "from-blue-500 to-blue-600" : "from-slate-300 to-slate-400",
        emerald: completed ? "from-emerald-500 to-emerald-600" : "from-slate-300 to-slate-400",
        violet: completed ? "from-violet-500 to-violet-600" : "from-slate-300 to-slate-400"
    };

    return (
        <div className={`rounded-xl p-6 transition-all ${completed ? 'bg-white border-2 border-slate-200 shadow-md' : 'bg-slate-50 border border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-md`}>
                    {completed ? <FaCheckCircle className="text-lg" /> : <Icon className="text-lg" />}
                </div>
                <h4 className={`font-bold ${completed ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h4>
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                {completed ? '✓ Completed' : 'Pending'}
            </p>
        </div>
    );
};

// Score Card Component
const ScoreCard = ({ title, icon: Icon, band, raw, total, subtitle, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
        violet: "bg-violet-50 text-violet-600 border-violet-200"
    };

    return (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} border flex items-center justify-center`}>
                    <Icon className="text-lg" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">{title}</h4>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
            </div>
            <div className="text-center py-3 bg-white rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Band Score</p>
                <p className="text-3xl font-bold text-slate-900">{band !== undefined ? band.toFixed(1) : "—"}</p>
            </div>
            {raw !== undefined && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                        <span>Correct Answers</span>
                        <span>{raw} / {total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            style={{ width: `${(raw / total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};
