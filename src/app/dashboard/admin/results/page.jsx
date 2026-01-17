"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaSpinner,
    FaChevronLeft,
    FaChevronRight,
    FaDownload,
    FaTrophy,
    FaTimesCircle,
    FaChartLine,
    FaHeadphones,
    FaBook,
    FaPen,
    FaUserGraduate,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaTimes,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaPrint,
    FaDownload as FaDownloadAlt,
} from "react-icons/fa";
import { studentsAPI } from "@/lib/api";

// Band Score Gauge Component
const BandScoreGauge = ({ score, label, color }) => {
    const percentage = (score / 9) * 100;
    const colorClasses = {
        purple: { bg: "bg-purple-100", fill: "bg-purple-500", text: "text-purple-700" },
        blue: { bg: "bg-blue-100", fill: "bg-blue-500", text: "text-blue-700" },
        green: { bg: "bg-green-100", fill: "bg-green-500", text: "text-green-700" },
        cyan: { bg: "bg-cyan-100", fill: "bg-cyan-500", text: "text-cyan-700" },
    };

    const colors = colorClasses[color] || colorClasses.cyan;

    return (
        <div className="text-center">
            <div className={`relative w-20 h-20 mx-auto mb-2 rounded-full ${colors.bg}`}>
                <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${percentage * 2} 200`}
                        className={colors.text}
                        strokeLinecap="round"
                    />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${colors.text}`}>
                    {score?.toFixed(1) || "N/A"}
                </span>
            </div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
    );
};

// Result Card Component
const ResultCard = ({ result, onView }) => {
    const statusConfig = {
        completed: { color: "bg-green-100 text-green-700 border-green-200", icon: FaTrophy, label: "Completed" },
        terminated: { color: "bg-red-100 text-red-700 border-red-200", icon: FaTimesCircle, label: "Terminated" },
        "in-progress": { color: "bg-amber-100 text-amber-700 border-amber-200", icon: FaClock, label: "In Progress" },
    };

    const config = statusConfig[result.examStatus] || statusConfig.completed;
    const StatusIcon = config.icon;

    const getBandColor = (score) => {
        if (score >= 7) return "from-green-500 to-emerald-600";
        if (score >= 5.5) return "from-cyan-500 to-teal-600";
        if (score >= 4) return "from-orange-400 to-orange-600";
        return "from-red-500 to-rose-600";
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                                {result.nameEnglish?.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">{result.nameEnglish}</h3>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-cyan-600 font-mono">
                                {result.examId}
                            </code>
                        </div>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                        <StatusIcon className="text-xs" />
                        {config.label}
                    </span>
                </div>

                {/* Contact Info */}
                <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <FaEnvelope className="text-gray-400" />
                        {result.email}
                    </span>
                </div>
            </div>

            {/* Scores */}
            <div className="p-5">
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-purple-100 flex items-center justify-center mb-1">
                            <FaHeadphones className="text-purple-600" />
                        </div>
                        <p className="text-lg font-bold text-purple-700">
                            {result.scores?.listening?.band?.toFixed(1) || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">Listening</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-blue-100 flex items-center justify-center mb-1">
                            <FaBook className="text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-blue-700">
                            {result.scores?.reading?.band?.toFixed(1) || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">Reading</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-green-100 flex items-center justify-center mb-1">
                            <FaPen className="text-green-600" />
                        </div>
                        <p className="text-lg font-bold text-green-700">
                            {result.scores?.writing?.overallBand?.toFixed(1) || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">Writing</p>
                    </div>
                    <div className="text-center">
                        <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${getBandColor(result.scores?.overall || 0)} flex items-center justify-center mb-1 shadow-lg`}>
                            <FaTrophy className="text-white" />
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                            {result.scores?.overall?.toFixed(1) || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">Overall</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt className="text-gray-400" />
                        {result.examCompletedAt
                            ? new Date(result.examCompletedAt).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })
                            : "N/A"}
                    </div>
                    <button
                        onClick={() => onView(result)}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors text-sm font-medium"
                    >
                        <FaEye /> View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

// Detailed Result Modal
const ResultDetailModal = ({ result, onClose }) => {
    if (!result) return null;

    const getBandDescription = (score) => {
        if (score >= 8.5) return "Expert user";
        if (score >= 7.5) return "Very good user";
        if (score >= 6.5) return "Good user";
        if (score >= 5.5) return "Competent user";
        if (score >= 4.5) return "Modest user";
        if (score >= 3.5) return "Limited user";
        return "Basic user";
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                                {result.nameEnglish?.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{result.nameEnglish}</h2>
                            {result.nameBengali && (
                                <p className="text-cyan-100">{result.nameBengali}</p>
                            )}
                            <code className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-lg text-sm font-mono">
                                Exam ID: {result.examId}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Overall Score */}
                <div className="p-6 border-b border-gray-100">
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 transform translate-x-32 -translate-y-32">
                            <div className="w-full h-full rounded-full bg-white/10"></div>
                        </div>
                        <div className="relative z-10">
                            <FaTrophy className="text-5xl text-yellow-300 mx-auto mb-4" />
                            <p className="text-cyan-100 mb-2">Overall Band Score</p>
                            <p className="text-6xl font-bold mb-2">
                                {result.scores?.overall?.toFixed(1) || "N/A"}
                            </p>
                            <p className="text-cyan-100 text-lg">
                                {getBandDescription(result.scores?.overall || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Scores */}
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Section Breakdown</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Listening */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                                    <FaHeadphones className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Listening</p>
                                    <p className="text-xs text-gray-500">30 minutes</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-purple-700">
                                    {result.scores?.listening?.band?.toFixed(1) || "N/A"}
                                </p>
                                <p className="text-sm text-purple-600 mt-1">
                                    {result.scores?.listening?.correctAnswers || 0}/40 correct
                                </p>
                            </div>
                        </div>

                        {/* Reading */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                                    <FaBook className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Reading</p>
                                    <p className="text-xs text-gray-500">60 minutes</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-blue-700">
                                    {result.scores?.reading?.band?.toFixed(1) || "N/A"}
                                </p>
                                <p className="text-sm text-blue-600 mt-1">
                                    {result.scores?.reading?.correctAnswers || 0}/40 correct
                                </p>
                            </div>
                        </div>

                        {/* Writing */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                                    <FaPen className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Writing</p>
                                    <p className="text-xs text-gray-500">60 minutes</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-green-700">
                                    {result.scores?.writing?.overallBand?.toFixed(1) || "N/A"}
                                </p>
                                <p className="text-sm text-green-600 mt-1">
                                    Evaluated by examiner
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Exam Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-1">Status</p>
                            <p className={`font-semibold ${result.examStatus === "completed" ? "text-green-600" : "text-red-600"}`}>
                                {result.examStatus === "completed" ? (
                                    <span className="flex items-center gap-1">
                                        <FaCheckCircle /> Completed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <FaTimesCircle /> Terminated
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-1">Exam Date</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(result.examDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-1">Completed At</p>
                            <p className="font-semibold text-gray-800">
                                {result.examCompletedAt
                                    ? new Date(result.examCompletedAt).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-1">Violations</p>
                            <p className={`font-semibold ${result.totalViolations > 0 ? "text-red-600" : "text-green-600"}`}>
                                {result.totalViolations || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Violations Warning */}
                {result.totalViolations > 0 && (
                    <div className="p-6 border-b border-gray-100">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-800 mb-1">
                                        Security Violations Detected
                                    </p>
                                    <p className="text-sm text-red-600">
                                        This student had {result.totalViolations} violation(s) during the exam.
                                        This may include tab switching, copy attempts, or other suspicious activities.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 flex items-center justify-between">
                    <Link
                        href={`/dashboard/admin/students/${result._id}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors font-medium"
                    >
                        <FaUserGraduate /> View Full Profile
                    </Link>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ResultsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        examStatus: "",
        fromDate: "",
        toDate: "",
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); // grid or table

    useEffect(() => {
        fetchResults();
    }, [pagination.page, filters]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...(searchTerm && { searchTerm }),
                ...(filters.examStatus && { examStatus: filters.examStatus }),
                ...(filters.fromDate && { fromDate: filters.fromDate }),
                ...(filters.toDate && { toDate: filters.toDate }),
            };

            const response = await studentsAPI.getAllResults(params);

            if (response.success && response.data) {
                setResults(response.data.results);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.pagination,
                }));
            }
        } catch (error) {
            console.error("Failed to fetch results:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchResults();
    };

    // Calculate statistics
    const stats = {
        total: pagination.total,
        avgScore: results.length > 0
            ? (results.reduce((sum, r) => sum + (r.scores?.overall || 0), 0) / results.length).toFixed(1)
            : 0,
        completed: results.filter(r => r.examStatus === "completed").length,
        terminated: results.filter(r => r.examStatus === "terminated").length,
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" />
                        Exam Results
                    </h1>
                    <p className="text-gray-500 mt-1">View and analyze all student exam performances</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <FaChartLine className="text-lg" />
                        </div>
                        <span className="text-cyan-100 text-sm">Total Results</span>
                    </div>
                    <p className="text-3xl font-bold">{pagination.total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <FaTrophy className="text-purple-600" />
                        </div>
                        <span className="text-gray-500 text-sm">Avg. Band Score</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.avgScore}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <FaCheckCircle className="text-green-600" />
                        </div>
                        <span className="text-gray-500 text-sm">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <FaTimesCircle className="text-red-600" />
                        </div>
                        <span className="text-gray-500 text-sm">Terminated</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{stats.terminated}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or exam ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            />
                        </div>
                    </form>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-5 py-3 border rounded-xl transition-colors flex items-center gap-2 font-medium ${showFilters ? "bg-cyan-50 border-cyan-500 text-cyan-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <FaFilter />
                        Filters
                    </button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.examStatus}
                                onChange={(e) => setFilters(prev => ({ ...prev, examStatus: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                            <input
                                type="date"
                                value={filters.fromDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                            <input
                                type="date"
                                value={filters.toDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ examStatus: "", fromDate: "", toDate: "" })}
                                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Grid */}
            <div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                                    <div className="flex-1">
                                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="text-center">
                                            <div className="w-12 h-12 mx-auto rounded-lg bg-gray-200 mb-2"></div>
                                            <div className="h-3 w-8 mx-auto bg-gray-200 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((result) => (
                            <ResultCard
                                key={result._id}
                                result={result}
                                onView={setSelectedResult}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No exam results found</h3>
                        <p className="text-gray-500 mb-4">
                            Results will appear here once students complete their exams
                        </p>
                        <Link
                            href="/dashboard/admin/students"
                            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            <FaUserGraduate /> View all students
                        </Link>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            <FaChevronLeft className="text-sm" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            <FaChevronRight className="text-sm" />
                        </button>
                    </div>
                </div>
            )}

            {/* Result Detail Modal */}
            {selectedResult && (
                <ResultDetailModal
                    result={selectedResult}
                    onClose={() => setSelectedResult(null)}
                />
            )}
        </div>
    );
}
