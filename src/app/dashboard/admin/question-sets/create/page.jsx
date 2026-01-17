"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    FaArrowLeft,
    FaSpinner,
    FaSave,
    FaPlus,
    FaTrash,
    FaHeadphones,
    FaBook,
    FaPen,
    FaQuestionCircle,
    FaCloudUploadAlt,
    FaCheck,
} from "react-icons/fa";
import { questionSetsAPI, uploadAPI } from "@/lib/api";

// Question Types for IELTS
const QUESTION_TYPES = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "matching", label: "Matching" },
    { value: "form-completion", label: "Form Completion" },
    { value: "note-completion", label: "Note Completion" },
    { value: "sentence-completion", label: "Sentence Completion" },
    { value: "summary-completion", label: "Summary Completion" },
    { value: "true-false-not-given", label: "True/False/Not Given" },
    { value: "yes-no-not-given", label: "Yes/No/Not Given" },
    { value: "short-answer", label: "Short Answer" },
    { value: "diagram-labeling", label: "Diagram Labeling" },
    { value: "fill-in-blank", label: "Fill in the Blank" },
];

// Default empty question
const createEmptyQuestion = (number) => ({
    questionNumber: number,
    questionType: "multiple-choice",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
});

// Default empty section
const createEmptySection = (number) => ({
    sectionNumber: number,
    title: `Section ${number}`,
    instructions: "",
    audioUrl: "",
    passage: "",
    questions: [createEmptyQuestion(1)],
});

// Default writing task
const createEmptyWritingTask = (number) => ({
    taskNumber: number,
    taskType: number === 1 ? "task1" : "task2",
    prompt: "",
    imageUrl: "",
    minWords: number === 1 ? 150 : 250,
    sampleAnswer: "",
});

export default function CreateQuestionSetPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeFromUrl = searchParams.get("type") || "LISTENING";

    const [loading, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Audio upload states
    const [audioUploading, setAudioUploading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        setType: typeFromUrl,
        title: "",
        description: "",
        duration: typeFromUrl === "LISTENING" ? 40 : typeFromUrl === "READING" ? 60 : 60,
        difficulty: "medium",
        mainAudioUrl: "",
        audioDuration: 0,
    });

    // Sections for Listening/Reading
    const [sections, setSections] = useState([createEmptySection(1)]);

    // Writing tasks
    const [writingTasks, setWritingTasks] = useState([
        createEmptyWritingTask(1),
        createEmptyWritingTask(2),
    ]);

    const isWriting = formData.setType === "WRITING";

    // Handle audio file upload
    const handleAudioUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
        if (!validTypes.includes(file.type)) {
            setError("Invalid file type. Please upload MP3, WAV, or OGG audio files.");
            return;
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            setError("File size too large. Maximum allowed is 50MB.");
            return;
        }

        setAudioFile(file);
        setAudioUploading(true);
        setUploadProgress("Uploading audio...");
        setError("");

        try {
            const result = await uploadAPI.uploadAudio(file);
            if (result.success) {
                setFormData((prev) => ({
                    ...prev,
                    mainAudioUrl: result.data.url,
                    audioDuration: Math.round(result.data.duration || 0),
                }));
                setUploadProgress("Upload complete!");
                setTimeout(() => setUploadProgress(""), 2000);
            }
        } catch (err) {
            setError(err.message || "Failed to upload audio file");
            setUploadProgress("");
        } finally {
            setAudioUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setFormData((prev) => ({
            ...prev,
            setType: newType,
            duration: newType === "LISTENING" ? 40 : 60,
        }));
    };

    // Section handlers
    const addSection = () => {
        setSections((prev) => [...prev, createEmptySection(prev.length + 1)]);
    };

    const removeSection = (index) => {
        if (sections.length > 1) {
            setSections((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const updateSection = (index, field, value) => {
        setSections((prev) =>
            prev.map((section, i) =>
                i === index ? { ...section, [field]: value } : section
            )
        );
    };

    // Question handlers
    const addQuestion = (sectionIndex) => {
        setSections((prev) =>
            prev.map((section, i) => {
                if (i === sectionIndex) {
                    const newQNum = section.questions.length + 1;
                    return {
                        ...section,
                        questions: [...section.questions, createEmptyQuestion(newQNum)],
                    };
                }
                return section;
            })
        );
    };

    const removeQuestion = (sectionIndex, questionIndex) => {
        setSections((prev) =>
            prev.map((section, i) => {
                if (i === sectionIndex && section.questions.length > 1) {
                    return {
                        ...section,
                        questions: section.questions.filter((_, qi) => qi !== questionIndex),
                    };
                }
                return section;
            })
        );
    };

    const updateQuestion = (sectionIndex, questionIndex, field, value) => {
        setSections((prev) =>
            prev.map((section, i) => {
                if (i === sectionIndex) {
                    return {
                        ...section,
                        questions: section.questions.map((q, qi) =>
                            qi === questionIndex ? { ...q, [field]: value } : q
                        ),
                    };
                }
                return section;
            })
        );
    };

    const updateQuestionOption = (sectionIndex, questionIndex, optionIndex, value) => {
        setSections((prev) =>
            prev.map((section, i) => {
                if (i === sectionIndex) {
                    return {
                        ...section,
                        questions: section.questions.map((q, qi) => {
                            if (qi === questionIndex) {
                                const newOptions = [...q.options];
                                newOptions[optionIndex] = value;
                                return { ...q, options: newOptions };
                            }
                            return q;
                        }),
                    };
                }
                return section;
            })
        );
    };

    // Writing task handlers
    const updateWritingTask = (index, field, value) => {
        setWritingTasks((prev) =>
            prev.map((task, i) => (i === index ? { ...task, [field]: value } : task))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const setData = {
                ...formData,
                ...(isWriting
                    ? { writingTasks }
                    : {
                        sections: sections.map(s => ({
                            ...s,
                            questions: s.questions.map((q, idx) => ({
                                ...q,
                                questionNumber: idx + 1,
                            }))
                        }))
                    }),
            };

            const response = await questionSetsAPI.create(setData);

            if (response.success) {
                router.push("/dashboard/admin/question-sets");
            }
        } catch (err) {
            setError(err.message || "Failed to create question set");
        } finally {
            setSaving(false);
        }
    };

    const getTypeIcon = () => {
        switch (formData.setType) {
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

    const getTypeColor = () => {
        switch (formData.setType) {
            case "LISTENING":
                return "purple";
            case "READING":
                return "blue";
            case "WRITING":
                return "green";
            default:
                return "gray";
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/admin/question-sets"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FaArrowLeft className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {getTypeIcon()}
                        Create {formData.setType} Set
                    </h1>
                    <p className="text-gray-500">Add questions and configure the set</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Set Type *
                            </label>
                            <select
                                name="setType"
                                value={formData.setType}
                                onChange={handleTypeChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            >
                                <option value="LISTENING">Listening</option>
                                <option value="READING">Reading</option>
                                <option value="WRITING">Writing</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., Cambridge 18 Test 1"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={2}
                                placeholder="Brief description of this set..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                                min={1}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Difficulty *
                            </label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Audio Upload for Listening */}
                    {formData.setType === "LISTENING" && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <FaHeadphones className="inline mr-2 text-purple-600" />
                                Main Audio File *
                            </label>

                            {/* Upload Area */}
                            <div className="space-y-4">
                                {!formData.mainAudioUrl ? (
                                    <label className={`
                                        relative flex flex-col items-center justify-center 
                                        w-full h-40 border-2 border-dashed rounded-xl 
                                        cursor-pointer transition-all duration-200
                                        ${audioUploading
                                            ? "bg-purple-50 border-purple-300"
                                            : "bg-gray-50 border-gray-300 hover:bg-purple-50 hover:border-purple-400"
                                        }
                                    `}>
                                        <input
                                            type="file"
                                            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                                            onChange={handleAudioUpload}
                                            disabled={audioUploading}
                                            className="hidden"
                                        />

                                        {audioUploading ? (
                                            <div className="flex flex-col items-center">
                                                <FaSpinner className="text-3xl text-purple-600 animate-spin mb-2" />
                                                <span className="text-purple-600 font-medium">{uploadProgress}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FaCloudUploadAlt className="text-4xl text-gray-400 mb-3" />
                                                <span className="text-gray-600 font-medium">Click to upload audio file</span>
                                                <span className="text-gray-400 text-sm mt-1">MP3, WAV, OGG (max 50MB)</span>
                                            </div>
                                        )}
                                    </label>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <FaCheck className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-green-700 font-medium">Audio uploaded successfully!</p>
                                                    <p className="text-green-600 text-sm">
                                                        {audioFile?.name || "Audio file"}
                                                        {formData.audioDuration > 0 && ` • ${Math.floor(formData.audioDuration / 60)}:${String(formData.audioDuration % 60).padStart(2, '0')}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, mainAudioUrl: "", audioDuration: 0 }));
                                                    setAudioFile(null);
                                                }}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        {/* Audio Preview */}
                                        <div className="mt-4">
                                            <audio
                                                controls
                                                src={formData.mainAudioUrl}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Or enter URL manually */}
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <span className="text-gray-400 text-sm">or enter URL manually</span>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Audio URL
                                        </label>
                                        <input
                                            type="url"
                                            name="mainAudioUrl"
                                            value={formData.mainAudioUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://..."
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Audio Duration (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            name="audioDuration"
                                            value={formData.audioDuration}
                                            onChange={handleInputChange}
                                            min={0}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Writing Tasks */}
                {isWriting && (
                    <div className="space-y-6">
                        {writingTasks.map((task, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaPen className="text-green-600" />
                                    Task {task.taskNumber} ({task.taskType === "task1" ? "150+ words" : "250+ words"})
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Task Prompt *
                                        </label>
                                        <textarea
                                            value={task.prompt}
                                            onChange={(e) => updateWritingTask(index, "prompt", e.target.value)}
                                            rows={4}
                                            required
                                            placeholder="Write the task prompt here..."
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Image URL (for Task 1)
                                            </label>
                                            <input
                                                type="url"
                                                value={task.imageUrl}
                                                onChange={(e) => updateWritingTask(index, "imageUrl", e.target.value)}
                                                placeholder="https://..."
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Minimum Words
                                            </label>
                                            <input
                                                type="number"
                                                value={task.minWords}
                                                onChange={(e) => updateWritingTask(index, "minWords", Number(e.target.value))}
                                                min={1}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sample Answer (Optional)
                                        </label>
                                        <textarea
                                            value={task.sampleAnswer}
                                            onChange={(e) => updateWritingTask(index, "sampleAnswer", e.target.value)}
                                            rows={4}
                                            placeholder="Sample answer for reference..."
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sections for Listening/Reading */}
                {!isWriting && (
                    <div className="space-y-6">
                        {sections.map((section, sIndex) => (
                            <div key={sIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {/* Section Header */}
                                <div className={`bg-${getTypeColor()}-50 p-4 border-b border-gray-200 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        {getTypeIcon()}
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={(e) => updateSection(sIndex, "title", e.target.value)}
                                            className="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-cyan-500 focus:outline-none px-1"
                                        />
                                    </div>
                                    {sections.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSection(sIndex)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Section Instructions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Instructions
                                        </label>
                                        <textarea
                                            value={section.instructions}
                                            onChange={(e) => updateSection(sIndex, "instructions", e.target.value)}
                                            rows={2}
                                            placeholder="Instructions for this section..."
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>

                                    {/* Passage for Reading */}
                                    {formData.setType === "READING" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reading Passage
                                            </label>
                                            <textarea
                                                value={section.passage}
                                                onChange={(e) => updateSection(sIndex, "passage", e.target.value)}
                                                rows={6}
                                                placeholder="Paste the reading passage here..."
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                    )}

                                    {/* Questions */}
                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium text-gray-700">
                                                Questions ({section.questions.length})
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => addQuestion(sIndex)}
                                                className="text-cyan-600 hover:bg-cyan-50 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                                            >
                                                <FaPlus /> Add Question
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {section.questions.map((question, qIndex) => (
                                                <div
                                                    key={qIndex}
                                                    className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                                                            Q{qIndex + 1}
                                                        </span>
                                                        {section.questions.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeQuestion(sIndex, qIndex)}
                                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                Question Type
                                                            </label>
                                                            <select
                                                                value={question.questionType}
                                                                onChange={(e) =>
                                                                    updateQuestion(sIndex, qIndex, "questionType", e.target.value)
                                                                }
                                                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                                            >
                                                                {QUESTION_TYPES.map((type) => (
                                                                    <option key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                Correct Answer
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={question.correctAnswer}
                                                                onChange={(e) =>
                                                                    updateQuestion(sIndex, qIndex, "correctAnswer", e.target.value)
                                                                }
                                                                placeholder="A, B, C, D or text"
                                                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Question Text
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={question.questionText}
                                                            onChange={(e) =>
                                                                updateQuestion(sIndex, qIndex, "questionText", e.target.value)
                                                            }
                                                            placeholder="Enter the question..."
                                                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                                        />
                                                    </div>

                                                    {/* Options for MCQ */}
                                                    {question.questionType === "multiple-choice" && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                Options
                                                            </label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {question.options.map((opt, optIndex) => (
                                                                    <input
                                                                        key={optIndex}
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) =>
                                                                            updateQuestionOption(sIndex, qIndex, optIndex, e.target.value)
                                                                        }
                                                                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                                        className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Section Button */}
                        <button
                            type="button"
                            onClick={addSection}
                            className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaPlus />
                            Add Section
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                        {error}
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 sticky bottom-4 bg-white p-4 rounded-xl border border-gray-200 shadow-lg">
                    <Link
                        href="/dashboard/admin/question-sets"
                        className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:from-cyan-600 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        Create Question Set
                    </button>
                </div>
            </form>
        </div>
    );
}
