"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FaUserGraduate,
    FaHeadphones,
    FaBook,
    FaPen,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaPlus,
    FaEye,
    FaSpinner,
    FaTrophy,
    FaChartLine,
    FaCalendarAlt,
    FaUserPlus,
    FaClipboardList,
    FaExclamationTriangle,
    FaPlayCircle,
    FaChartBar,
    FaGraduationCap,
    FaBell,
    FaFilter,
} from "react-icons/fa";
import { studentsAPI, questionSetsAPI } from "@/lib/api";

// Enhanced Stat Card Component with Gradient and Animation
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, loading }) => {
    const gradientClasses = {
        cyan: "from-cyan-500 to-teal-600",
        orange: "from-orange-400 to-orange-600",
        green: "from-emerald-500 to-green-600",
        red: "from-rose-500 to-red-600",
        purple: "from-purple-500 to-indigo-600",
        blue: "from-blue-500 to-cyan-600",
        pink: "from-pink-500 to-rose-500",
    };

    return (
        <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradientClasses[gradient]} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            </div>
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses[gradient]} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="text-white text-xl" />
                </div>
                {loading ? (
                    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                )}
                <p className="text-gray-600 font-medium mt-1">{title}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
};

// Quick Action Button
const QuickActionButton = ({ title, description, icon: Icon, href, gradient }) => {
    const gradientClasses = {
        cyan: "from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700",
        orange: "from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700",
        green: "from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700",
        purple: "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
    };

    return (
        <Link
            href={href}
            className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${gradientClasses[gradient]} text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
        >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon className="text-xl" />
            </div>
            <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-white/80">{description}</p>
            </div>
        </Link>
    );
};

// Activity Item Component
const ActivityItem = ({ icon: Icon, title, description, time, status }) => {
    const statusColors = {
        success: "text-green-600 bg-green-100",
        warning: "text-yellow-600 bg-yellow-100",
        error: "text-red-600 bg-red-100",
        info: "text-blue-600 bg-blue-100",
    };

    return (
        <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
            <div className={`w-10 h-10 rounded-xl ${statusColors[status]} flex items-center justify-center flex-shrink-0`}>
                <Icon className="text-lg" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate">{title}</h4>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
        </div>
    );
};

// Recent Exam Card
const RecentExamCard = ({ student, onView }) => {
    const statusConfig = {
        "not-started": { color: "bg-gray-100 text-gray-600", icon: FaClock, label: "Not Started" },
        "in-progress": { color: "bg-yellow-100 text-yellow-700", icon: FaPlayCircle, label: "In Progress" },
        "completed": { color: "bg-green-100 text-green-700", icon: FaCheckCircle, label: "Completed" },
        "terminated": { color: "bg-red-100 text-red-700", icon: FaTimesCircle, label: "Terminated" },
    };

    const config = statusConfig[student.examStatus] || statusConfig["not-started"];
    const StatusIcon = config.icon;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {student.nameEnglish?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800">{student.nameEnglish}</h4>
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-cyan-600 font-mono">
                            {student.examId}
                        </code>
                    </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <StatusIcon className="text-xs" />
                    {config.label}
                </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-4 text-sm text-gray-500">
                    <span>{new Date(student.examDate).toLocaleDateString()}</span>
                    {student.scores?.overall && (
                        <span className="flex items-center gap-1 text-cyan-600 font-semibold">
                            <FaTrophy className="text-yellow-500" />
                            {student.scores.overall.toFixed(1)}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => onView(student)}
                    className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1"
                >
                    <FaEye /> View
                </button>
            </div>
        </div>
    );
};

// Score Distribution Chart (Simple Bar)
const ScoreDistribution = ({ data }) => {
    const maxValue = Math.max(...Object.values(data), 1);
    const colors = {
        listening: "bg-purple-500",
        reading: "bg-blue-500",
        writing: "bg-green-500",
    };

    return (
        <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="capitalize text-gray-600">{key}</span>
                        <span className="font-medium text-gray-800">{value} sets</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${colors[key]} rounded-full transition-all duration-500`}
                            style={{ width: `${(value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [questionStats, setQuestionStats] = useState(null);
    const [recentStudents, setRecentStudents] = useState([]);
    const [todayActivities, setTodayActivities] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [studentStatsRes, questionStatsRes, studentsRes] = await Promise.all([
                studentsAPI.getStatistics().catch(() => null),
                questionSetsAPI.getStatistics().catch(() => null),
                studentsAPI.getAll({ limit: 6 }).catch(() => null),
            ]);

            if (studentStatsRes?.data) {
                setStats(studentStatsRes.data);
            }

            if (questionStatsRes?.data) {
                setQuestionStats(questionStatsRes.data);
            }

            if (studentsRes?.data?.students) {
                setRecentStudents(studentsRes.data.students);

                // Generate activities from students
                const activities = studentsRes.data.students.slice(0, 5).map(s => ({
                    icon: s.examStatus === "completed" ? FaCheckCircle :
                        s.examStatus === "in-progress" ? FaPlayCircle : FaUserGraduate,
                    title: s.nameEnglish,
                    description: s.examStatus === "completed" ? "Completed exam" :
                        s.examStatus === "in-progress" ? "Taking exam" : "Registered",
                    time: getTimeAgo(s.updatedAt || s.createdAt),
                    status: s.examStatus === "completed" ? "success" :
                        s.examStatus === "terminated" ? "error" :
                            s.examStatus === "in-progress" ? "warning" : "info",
                }));
                setTodayActivities(activities);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diff = (now - past) / 1000;

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const handleViewStudent = (student) => {
        window.location.href = `/dashboard/admin/students/${student._id}`;
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 transform translate-x-20 -translate-y-20">
                    <div className="w-full h-full rounded-full bg-white/10"></div>
                </div>
                <div className="absolute right-20 bottom-0 w-64 h-64 transform translate-y-20">
                    <div className="w-full h-full rounded-full bg-white/5"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
                            <p className="text-cyan-100 max-w-xl">
                                Manage your IELTS examination system efficiently. Track students, monitor exams, and view results all in one place.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm text-cyan-100">Today</p>
                                <p className="text-xl font-semibold">
                                    {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" })}
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                <FaCalendarAlt className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-cyan-100 text-sm">Today's Exams</p>
                            <p className="text-2xl font-bold">{loading ? "..." : stats?.todayExams || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-cyan-100 text-sm">In Progress</p>
                            <p className="text-2xl font-bold">{loading ? "..." : stats?.examStatus?.inProgress || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-cyan-100 text-sm">Completed Today</p>
                            <p className="text-2xl font-bold">{loading ? "..." : stats?.todayCompleted || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-cyan-100 text-sm">Pending Payments</p>
                            <p className="text-2xl font-bold">{loading ? "..." : stats?.payments?.pending || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats?.totalStudents || 0}
                    subtitle="Registered students"
                    icon={FaUserGraduate}
                    gradient="cyan"
                    loading={loading}
                />
                <StatCard
                    title="Completed Exams"
                    value={stats?.examStatus?.completed || 0}
                    subtitle="Successfully finished"
                    icon={FaCheckCircle}
                    gradient="green"
                    loading={loading}
                />
                <StatCard
                    title="Paid Payments"
                    value={stats?.payments?.paid || 0}
                    subtitle="Payment confirmed"
                    icon={FaMoneyBillWave}
                    gradient="purple"
                    loading={loading}
                />
                <StatCard
                    title="Question Sets"
                    value={(questionStats?.listening || 0) + (questionStats?.reading || 0) + (questionStats?.writing || 0)}
                    subtitle="Available for exams"
                    icon={FaClipboardList}
                    gradient="orange"
                    loading={loading}
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaPlayCircle className="text-cyan-600" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickActionButton
                        title="Register Student"
                        description="Create new exam ID"
                        icon={FaUserPlus}
                        href="/dashboard/admin/students/create"
                        gradient="cyan"
                    />
                    <QuickActionButton
                        title="Add Listening Set"
                        description="New question set"
                        icon={FaHeadphones}
                        href="/dashboard/admin/question-sets/create?type=LISTENING"
                        gradient="purple"
                    />
                    <QuickActionButton
                        title="View Results"
                        description="All exam scores"
                        icon={FaTrophy}
                        href="/dashboard/admin/results"
                        gradient="green"
                    />
                    <QuickActionButton
                        title="Manage Students"
                        description="View all students"
                        icon={FaUserGraduate}
                        href="/dashboard/admin/students"
                        gradient="orange"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Students - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FaGraduationCap className="text-cyan-600" />
                                Recent Exam Activities
                            </h3>
                            <Link
                                href="/dashboard/admin/students"
                                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 mb-3"></div>
                                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                    </div>
                                ))
                            ) : recentStudents.length > 0 ? (
                                recentStudents.map((student) => (
                                    <RecentExamCard
                                        key={student._id}
                                        student={student}
                                        onView={handleViewStudent}
                                    />
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-12">
                                    <FaUserGraduate className="text-5xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No students registered yet</p>
                                    <Link
                                        href="/dashboard/admin/students/create"
                                        className="inline-flex items-center gap-2 mt-4 text-cyan-600 hover:text-cyan-700"
                                    >
                                        <FaPlus /> Register your first student
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Question Sets Overview */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClipboardList className="text-cyan-600" />
                            Question Sets
                        </h3>
                        <ScoreDistribution
                            data={{
                                listening: questionStats?.listening || 0,
                                reading: questionStats?.reading || 0,
                                writing: questionStats?.writing || 0,
                            }}
                        />
                        <Link
                            href="/dashboard/admin/question-sets"
                            className="mt-4 block text-center text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                        >
                            Manage Question Sets →
                        </Link>
                    </div>

                    {/* Exam Status Overview */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaChartBar className="text-cyan-600" />
                            Exam Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                                    Not Started
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {stats?.examStatus?.notStarted || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                                    In Progress
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {stats?.examStatus?.inProgress || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                                    Completed
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {stats?.examStatus?.completed || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                                    Terminated
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {stats?.examStatus?.terminated || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Average Scores */}
                    {stats?.averageScores && (
                        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-6 text-white">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <FaTrophy className="text-yellow-300" />
                                Average Band Scores
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                    <p className="text-cyan-100 text-xs">Listening</p>
                                    <p className="text-xl font-bold">
                                        {stats.averageScores.avgListening?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                    <p className="text-cyan-100 text-xs">Reading</p>
                                    <p className="text-xl font-bold">
                                        {stats.averageScores.avgReading?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                    <p className="text-cyan-100 text-xs">Writing</p>
                                    <p className="text-xl font-bold">
                                        {stats.averageScores.avgWriting?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-white/20 rounded-xl p-3 text-center">
                                    <p className="text-cyan-100 text-xs">Overall</p>
                                    <p className="text-xl font-bold">
                                        {stats.averageScores.avgOverall?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FaBell className="text-cyan-600" />
                        Recent Activity
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : todayActivities.length > 0 ? (
                        todayActivities.map((activity, index) => (
                            <ActivityItem key={index} {...activity} />
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No recent activity
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
