"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    FaArrowLeft,
    FaEdit,
    FaSpinner,
    FaCopy,
    FaCheck,
    FaUserGraduate,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaCalendar,
    FaMoneyBillWave,
    FaHeadphones,
    FaBook,
    FaPen,
    FaTrophy,
    FaExclamationTriangle,
    FaRedo,
    FaClock,
    FaGlobe,
    FaDesktop,
} from "react-icons/fa";
import { studentsAPI } from "@/lib/api";

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState(null);
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchStudent();
        }
    }, [params.id]);

    const fetchStudent = async () => {
        try {
            setLoading(true);
            const response = await studentsAPI.getById(params.id);

            if (response.success && response.data) {
                setStudent(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch student:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleResetExam = async () => {
        if (!confirm("Are you sure you want to reset this exam? The student will be able to take the exam again.")) {
            return;
        }

        try {
            setResetLoading(true);
            await studentsAPI.resetExam(student.examId);
            fetchStudent();
            alert("Exam reset successfully!");
        } catch (error) {
            alert("Failed to reset exam: " + error.message);
        } finally {
            setResetLoading(false);
        }
    };

    const statusColors = {
        "not-started": "bg-gray-100 text-gray-600 border-gray-200",
        "in-progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
        "completed": "bg-green-100 text-green-700 border-green-200",
        "terminated": "bg-red-100 text-red-700 border-red-200",
        "expired": "bg-purple-100 text-purple-700 border-purple-200",
    };

    const paymentColors = {
        pending: "bg-orange-100 text-orange-700 border-orange-200",
        paid: "bg-green-100 text-green-700 border-green-200",
        refunded: "bg-gray-100 text-gray-600 border-gray-200",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <FaSpinner className="animate-spin text-4xl text-cyan-500" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Student not found</p>
                <Link href="/dashboard/admin/students" className="text-cyan-600 hover:underline">
                    ← Back to Students
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/students"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Details</h1>
                        <p className="text-gray-500">View and manage student information</p>
                    </div>
                </div>
                <Link
                    href={`/dashboard/admin/students/${params.id}/edit`}
                    className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-cyan-600 hover:to-teal-700 transition-all flex items-center gap-2"
                >
                    <FaEdit />
                    Edit Student
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-3xl font-bold">
                                {student.nameEnglish?.charAt(0)}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{student.nameEnglish}</h2>
                        {student.nameBengali && (
                            <p className="text-gray-500">{student.nameBengali}</p>
                        )}

                        {/* Exam ID */}
                        <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-xs text-gray-500">Exam ID</p>
                                <code className="font-mono font-bold text-cyan-600 text-lg">
                                    {student.examId}
                                </code>
                            </div>
                            <button
                                onClick={() => copyToClipboard(student.examId, "examId")}
                                className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-cyan-600"
                            >
                                {copiedField === "examId" ? <FaCheck className="text-green-500" /> : <FaCopy />}
                            </button>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[student.examStatus]}`}>
                                {student.examStatus?.replace("-", " ")}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${paymentColors[student.paymentStatus]}`}>
                                {student.paymentStatus}
                            </span>
                            {!student.isActive && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FaEnvelope className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-gray-800">{student.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FaPhone className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-gray-800">{student.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FaIdCard className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">NID Number</p>
                                    <p className="text-gray-800">{student.nidNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => copyToClipboard(`Exam ID: ${student.examId}\nEmail: ${student.email}\nPassword: ${student.phone}`, "credentials")}
                                className="w-full px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 flex items-center justify-center gap-2"
                            >
                                {copiedField === "credentials" ? <FaCheck /> : <FaCopy />}
                                Copy Credentials
                            </button>
                            {(student.examStatus === "completed" || student.examStatus === "terminated") && (
                                <button
                                    onClick={handleResetExam}
                                    disabled={resetLoading}
                                    className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {resetLoading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                                    Reset Exam
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Exam Schedule */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaCalendar className="text-cyan-600" />
                            Exam Schedule
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Exam Date</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(student.examDate).toLocaleDateString()}
                                </p>
                            </div>
                            {student.examStartedAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Started At</p>
                                    <p className="font-medium text-gray-800">
                                        {new Date(student.examStartedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                            {student.examCompletedAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Completed At</p>
                                    <p className="font-medium text-gray-800">
                                        {new Date(student.examCompletedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Registration Date</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(student.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaMoneyBillWave className="text-cyan-600" />
                            Payment Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="font-medium text-gray-800">৳{student.paymentAmount}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Method</p>
                                <p className="font-medium text-gray-800 capitalize">{student.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Reference</p>
                                <p className="font-medium text-gray-800">{student.paymentReference || "N/A"}</p>
                            </div>
                            {student.paymentDate && (
                                <div>
                                    <p className="text-xs text-gray-500">Payment Date</p>
                                    <p className="font-medium text-gray-800">
                                        {new Date(student.paymentDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Question Sets */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Assigned Question Sets</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaHeadphones className="text-purple-600" />
                                    <span className="font-medium text-purple-700">Listening</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-800">
                                    Set #{student.assignedSets?.listeningSetNumber || "Not Assigned"}
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaBook className="text-blue-600" />
                                    <span className="font-medium text-blue-700">Reading</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-800">
                                    Set #{student.assignedSets?.readingSetNumber || "Not Assigned"}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaPen className="text-green-600" />
                                    <span className="font-medium text-green-700">Writing</span>
                                </div>
                                <p className="text-2xl font-bold text-green-800">
                                    Set #{student.assignedSets?.writingSetNumber || "Not Assigned"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scores (if exam completed) */}
                    {student.examStatus === "completed" && student.scores && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaTrophy className="text-yellow-500" />
                                Exam Scores
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-purple-600 font-medium">Listening</p>
                                    <p className="text-3xl font-bold text-purple-700 mt-1">
                                        {student.scores?.listening?.band?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-blue-600 font-medium">Reading</p>
                                    <p className="text-3xl font-bold text-blue-700 mt-1">
                                        {student.scores?.reading?.band?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-green-600 font-medium">Writing</p>
                                    <p className="text-3xl font-bold text-green-700 mt-1">
                                        {student.scores?.writing?.overallBand?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg p-4 text-center text-white">
                                    <p className="text-sm text-cyan-100 font-medium">Overall</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {student.scores?.overall?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Violations (if any) */}
                    {student.violations && student.violations.length > 0 && (
                        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                            <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                                <FaExclamationTriangle className="text-red-600" />
                                Security Violations ({student.violations.length})
                            </h3>
                            <div className="space-y-2">
                                {student.violations.map((violation, index) => (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-red-100 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800 capitalize">
                                                {violation.type?.replace("-", " ")}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Count: {violation.count} | {new Date(violation.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${violation.action === "terminated"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {violation.action}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Session Info */}
                    {student.examSessionId && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-800 mb-4">Session Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-gray-400" />
                                    <span className="text-gray-500">Session ID:</span>
                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{student.examSessionId}</code>
                                </div>
                                {student.ipAddress && (
                                    <div className="flex items-center gap-2">
                                        <FaGlobe className="text-gray-400" />
                                        <span className="text-gray-500">IP:</span>
                                        <span className="text-gray-800">{student.ipAddress}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
