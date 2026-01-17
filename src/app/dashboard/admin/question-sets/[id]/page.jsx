"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    FaArrowLeft,
    FaEdit,
    FaSpinner,
    FaHeadphones,
    FaBook,
    FaPen,
    FaToggleOn,
    FaToggleOff,
    FaClone,
    FaQuestionCircle,
    FaClock,
    FaPlay,
} from "react-icons/fa";
import { questionSetsAPI } from "@/lib/api";

export default function QuestionSetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [set, setSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        if (params.id) {
            fetchQuestionSet();
        }
    }, [params.id]);

    const fetchQuestionSet = async () => {
        try {
            setLoading(true);
            const response = await questionSetsAPI.getById(params.id, true);

            if (response.success && response.data) {
                setSet(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch question set:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            await questionSetsAPI.toggleActive(params.id);
            fetchQuestionSet();
        } catch (error) {
            alert("Failed to toggle status: " + error.message);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "LISTENING":
                return <FaHeadphones className="text-purple-600" />;
            case "READING":
                return <FaBook className="text-blue-600" />;
            case "WRITING":
                return <FaPen className="text-green-600" />;
            default:
                return <FaQuestionCircle />;
        }
    };

    const getTypeBg = (type) => {
        switch (type) {
            case "LISTENING":
                return "bg-purple-100 text-purple-700";
            case "READING":
                return "bg-blue-100 text-blue-700";
            case "WRITING":
                return "bg-green-100 text-green-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const difficultyColors = {
        easy: "bg-green-100 text-green-700",
        medium: "bg-yellow-100 text-yellow-700",
        hard: "bg-red-100 text-red-700",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <FaSpinner className="animate-spin text-4xl text-cyan-500" />
            </div>
        );
    }

    if (!set) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Question set not found</p>
                <Link href="/dashboard/admin/question-sets" className="text-cyan-600 hover:underline">
                    ← Back to Question Sets
                </Link>
            </div>
        );
    }

    const isWriting = set.setType === "WRITING";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/question-sets"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            {getTypeIcon(set.setType)}
                            {set.title}
                        </h1>
                        <p className="text-gray-500">
                            <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">{set.setId}</code>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggleActive}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${set.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {set.isActive ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                        {set.isActive ? "Active" : "Inactive"}
                    </button>
                    <Link
                        href={`/dashboard/admin/question-sets/${params.id}/edit`}
                        className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-cyan-600 hover:to-teal-700 transition-all flex items-center gap-2"
                    >
                        <FaEdit />
                        Edit Set
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-gray-500 text-sm">Type</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-1 ${getTypeBg(set.setType)}`}>
                        {getTypeIcon(set.setType)}
                        <span className="font-medium">{set.setType}</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-gray-500 text-sm">Set Number</p>
                    <p className="text-2xl font-bold text-gray-800">#{set.setNumber}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-gray-500 text-sm">Duration</p>
                    <p className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaClock className="text-cyan-500" /> {set.duration} min
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-gray-500 text-sm">Difficulty</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 capitalize ${difficultyColors[set.difficulty]}`}>
                        {set.difficulty}
                    </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-gray-500 text-sm">Usage Count</p>
                    <p className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaClone className="text-purple-500" /> {set.usageCount || 0}
                    </p>
                </div>
            </div>

            {/* Description */}
            {set.description && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{set.description}</p>
                </div>
            )}

            {/* Writing Tasks */}
            {isWriting && set.writingTasks && (
                <div className="space-y-6">
                    {set.writingTasks.map((task, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-green-50 p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <FaPen className="text-green-600" />
                                    Task {task.taskNumber} - {task.taskType === "task1" ? "150+ words" : "250+ words"}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">{task.prompt}</p>
                                </div>
                                {task.imageUrl && (
                                    <div className="mt-4">
                                        <img
                                            src={task.imageUrl}
                                            alt="Task image"
                                            className="max-w-md rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                                {task.sampleAnswer && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-500 mb-2">Sample Answer:</p>
                                        <p className="text-gray-700 whitespace-pre-wrap text-sm">{task.sampleAnswer}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sections for Listening/Reading */}
            {!isWriting && set.sections && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Section Tabs */}
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {set.sections.map((section, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveSection(index)}
                                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${activeSection === index
                                    ? "border-b-2 border-cyan-500 text-cyan-600 bg-cyan-50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {section.title || `Section ${section.sectionNumber}`}
                                <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                    {section.questions?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Section Content */}
                    {set.sections[activeSection] && (
                        <div className="p-6">
                            {/* Instructions */}
                            {set.sections[activeSection].instructions && (
                                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-800">Instructions:</p>
                                    <p className="text-yellow-700">{set.sections[activeSection].instructions}</p>
                                </div>
                            )}

                            {/* Audio for Listening */}
                            {set.setType === "LISTENING" && set.sections[activeSection].audioUrl && (
                                <div className="mb-6 bg-gray-900 rounded-lg p-4 flex items-center gap-4">
                                    <button className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors">
                                        <FaPlay className="text-white ml-1" />
                                    </button>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">Section Audio</p>
                                        <p className="text-gray-400 text-sm">{set.sections[activeSection].audioUrl}</p>
                                    </div>
                                </div>
                            )}

                            {/* Passage for Reading */}
                            {set.setType === "READING" && set.sections[activeSection].passage && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-2">Reading Passage</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                            {set.sections[activeSection].passage}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Questions */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-4">
                                    Questions ({set.sections[activeSection].questions?.length || 0})
                                </h4>
                                <div className="space-y-4">
                                    {set.sections[activeSection].questions?.map((question, qIndex) => (
                                        <div
                                            key={qIndex}
                                            className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium flex-shrink-0">
                                                    Q{question.questionNumber || qIndex + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                            {question.questionType?.replace("-", " ")}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-800 mb-3">{question.questionText}</p>

                                                    {/* Options for MCQ */}
                                                    {question.options && question.options.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                                            {question.options.map((opt, optIndex) => (
                                                                <div
                                                                    key={optIndex}
                                                                    className={`px-3 py-2 rounded border text-sm ${opt === question.correctAnswer ||
                                                                        String.fromCharCode(65 + optIndex) === question.correctAnswer
                                                                        ? "bg-green-50 border-green-300 text-green-700"
                                                                        : "bg-white border-gray-200 text-gray-600"
                                                                        }`}
                                                                >
                                                                    <span className="font-medium">
                                                                        {String.fromCharCode(65 + optIndex)}.
                                                                    </span>{" "}
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Correct Answer */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">Correct Answer:</span>
                                                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                            {question.correctAnswer}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Meta Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Additional Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Total Questions</p>
                        <p className="font-medium text-gray-800">{set.totalQuestions || 0}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Created At</p>
                        <p className="font-medium text-gray-800">
                            {new Date(set.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p className="font-medium text-gray-800">
                            {new Date(set.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status</p>
                        <p className={`font-medium ${set.isActive ? "text-green-600" : "text-gray-500"}`}>
                            {set.isActive ? "Active" : "Inactive"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
