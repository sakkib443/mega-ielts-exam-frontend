"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaBook,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaCheck,
    FaTimes,
    FaSpinner
} from "react-icons/fa";
import { questionSetsAPI, studentsAPI } from "@/lib/api";

export default function ReadingExamPage() {
    const params = useParams();
    const router = useRouter();

    const [currentPassage, setCurrentPassage] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [fontSize, setFontSize] = useState(16);

    // Data loading states
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [questionSet, setQuestionSet] = useState(null);
    const [session, setSession] = useState(null);

    // Load session and question set
    useEffect(() => {
        const loadData = async () => {
            try {
                // Get session from localStorage
                const storedSession = localStorage.getItem("examSession");
                if (!storedSession) {
                    setLoadError("No exam session found. Please start from the home page.");
                    setIsLoading(false);
                    return;
                }

                const parsed = JSON.parse(storedSession);

                // Security check: If reading is already completed, redirect back
                if (parsed.completedModules && parsed.completedModules.includes("reading")) {
                    router.push(`/exam/${params.examId}`);
                    return;
                }

                setSession(parsed);

                // Check if reading set is assigned
                const readingSetNumber = parsed.assignedSets?.readingSetNumber;
                if (!readingSetNumber) {
                    setLoadError("No reading test assigned for this exam.");
                    setIsLoading(false);
                    return;
                }

                // Fetch question set from backend
                const response = await questionSetsAPI.getForExam("READING", readingSetNumber);

                if (response.success && response.data) {
                    setQuestionSet(response.data);
                } else {
                    setLoadError("Failed to load reading test questions.");
                }
            } catch (err) {
                console.error("Load error:", err);
                setLoadError(err.message || "Failed to load exam data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [params.examId]);

    // Build passages from question set sections
    const passages = (questionSet?.sections || []).map((section, index) => ({
        id: section.sectionNumber || index + 1,
        title: section.title || `Passage ${index + 1}`,
        source: section.source || "",
        content: section.passage || "",
        questions: (section.questions || []).map(q => ({
            id: q.questionNumber,
            questionNumber: q.questionNumber,
            type: q.questionType,
            text: q.questionText,
            options: q.options || [],
            instruction: q.instruction || "Write your answer",
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1
        }))
    }));

    const currentPass = passages[currentPassage] || { questions: [], content: "" };
    const allQuestions = passages.flatMap(p => p.questions);

    // Show all questions for the current passage (usually 13-14)
    const currentQuestions = currentPass.questions || [];

    const totalQuestions = allQuestions.length;
    const totalMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const getBandScore = (rawScore) => {
        if (rawScore >= 39) return 9.0;
        if (rawScore >= 37) return 8.5;
        if (rawScore >= 35) return 8.0;
        if (rawScore >= 33) return 7.5;
        if (rawScore >= 30) return 7.0;
        if (rawScore >= 27) return 6.5;
        if (rawScore >= 23) return 6.0;
        if (rawScore >= 19) return 5.5;
        if (rawScore >= 15) return 5.0;
        if (rawScore >= 12) return 4.5;
        if (rawScore >= 9) return 4.0;
        if (rawScore >= 6) return 3.5;
        if (rawScore >= 4) return 3.0;
        return 2.5;
    };

    // Timer
    useEffect(() => {
        if (showInstructions || isLoading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showInstructions, isLoading]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswer = (qId, value) => {
        setAnswers((prev) => ({ ...prev, [qId]: value }));
    };

    const goNext = () => {
        if (currentPassage < passages.length - 1) {
            setCurrentPassage((prev) => prev + 1);
            setCurrentQuestion(0);
        } else {
            setShowSubmitModal(true);
        }
    };

    const goPrev = () => {
        if (currentPassage > 0) {
            setCurrentPassage((prev) => prev - 1);
            setCurrentQuestion(0);
        }
    };

    const calculateScore = () => {
        let score = 0;
        allQuestions.forEach(q => {
            const userAnswer = answers[q.questionNumber];
            if (userAnswer) {
                const normalizedUser = userAnswer.toString().trim().toLowerCase();
                const normalizedCorrect = q.correctAnswer?.toString().trim().toLowerCase();
                if (normalizedUser === normalizedCorrect) {
                    score += q.marks || 1;
                }
            }
        });
        return score;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const score = calculateScore();
        const bandScore = getBandScore(score);

        // Prepare detailed answers for admin review
        const detailedAnswers = allQuestions.map(q => {
            const userAnswer = answers[q.questionNumber] || "";

            // For MCQ/TFNG/matching, extract the letter or answer from selected option
            let studentAnswerForComparison = userAnswer.toString().trim();
            const qType = q.type || q.questionType || "";

            if ((qType === "multiple-choice" || qType === "mcq" || qType === "matching") && userAnswer) {
                // Extract the first letter if it's like "A. Some text" or "B. Some text"
                const letterMatch = userAnswer.toString().match(/^([A-Za-z])\./);
                if (letterMatch) {
                    studentAnswerForComparison = letterMatch[1].toUpperCase();
                }
            }

            return {
                questionNumber: q.questionNumber,
                questionText: q.text || q.questionText || "", // Include question text
                questionType: qType || "fill-in-blank",
                studentAnswer: studentAnswerForComparison, // Store extracted answer
                studentAnswerFull: userAnswer, // Store full answer text for reference
                correctAnswer: q.correctAnswer,
                isCorrect: false // Will be recalculated on backend
            };
        });

        // Get session data from localStorage or state
        const storedSession = localStorage.getItem("examSession");
        let sessionData = storedSession ? JSON.parse(storedSession) : session;
        const examId = sessionData?.examId || session?.examId;

        // Save to backend
        try {
            const response = await studentsAPI.saveModuleScore(examId, "reading", {
                score: score,
                total: totalMarks,
                band: bandScore,
                answers: detailedAnswers // Send answers to backend
            });
            console.log("Reading data saved with answers");

            // Update localStorage
            if (response.success && sessionData) {
                sessionData.completedModules = response.data?.completedModules || [...(sessionData.completedModules || []), "reading"];
                sessionData.scores = response.data?.scores || {
                    ...(sessionData.scores || {}),
                    reading: { band: bandScore, raw: score, correctAnswers: score, totalQuestions: totalMarks }
                };
                localStorage.setItem("examSession", JSON.stringify(sessionData));
            }
        } catch (error) {
            console.error("Failed to save reading score:", error);
            // Still update localStorage even if backend fails
            if (sessionData) {
                sessionData.completedModules = [...(sessionData.completedModules || []), "reading"];
                sessionData.scores = {
                    ...(sessionData.scores || {}),
                    reading: { band: bandScore, raw: score, correctAnswers: score, totalQuestions: totalMarks }
                };
                localStorage.setItem("examSession", JSON.stringify(sessionData));
            }
        }

        // Go back to exam selection page
        router.push(`/exam/${params.examId}`);
    };

    const answeredCount = Object.keys(answers).filter(k => answers[k] !== "").length;

    // Get question type label
    const getQuestionTypeLabel = (type) => {
        switch (type) {
            case "true-false-not-given":
            case "tfng":
                return "True/False/Not Given";
            case "yes-no-not-given":
                return "Yes/No/Not Given";
            case "multiple-choice":
            case "mcq":
                return "Multiple Choice";
            case "fill-in-blank":
            case "fill":
            case "sentence-completion":
            case "summary-completion":
                return "Sentence Completion";
            case "matching":
                return "Matching";
            default:
                return type;
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading reading test...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (loadError) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTimes className="text-2xl text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Cannot Load Test</h2>
                    <p className="text-gray-600 mb-4">{loadError}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    // Instructions Screen
    if (showInstructions) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-600">
                        <span className="text-blue-600 font-bold text-2xl">IELTS</span>
                        <span className="text-gray-600">| Reading Test</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Reading Test Instructions</h1>

                    <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                            <strong>Set:</strong> {questionSet?.title || `Reading Set #${questionSet?.setNumber}`}
                        </p>
                        <p className="text-gray-700 mb-3">
                            <strong>Time:</strong> {questionSet?.duration || 60} minutes
                        </p>
                        <p className="text-gray-700 mb-3">
                            <strong>Questions:</strong> {totalQuestions} questions in {passages.length} passages
                        </p>
                        <p className="text-gray-700">
                            <strong>Instructions:</strong> Read the passages and answer the questions.
                            You can move between questions and passages freely.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                        <h3 className="font-semibold text-blue-800 mb-2">Question Types:</h3>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li>• True/False/Not Given</li>
                            <li>• Multiple Choice</li>
                            <li>• Sentence Completion</li>
                            <li>• Matching</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Start Reading Test
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-blue-600 font-bold text-xl">IELTS</span>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaBook className="text-blue-600" />
                                <span>Reading Test - Set #{questionSet?.setNumber}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {passages.map((p, idx) => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setCurrentPassage(idx); setCurrentQuestion(0); }}
                                        className={`px-3 py-1 rounded text-sm font-medium cursor-pointer ${currentPassage === idx ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        P{idx + 1}
                                    </button>
                                ))}
                            </div>

                            <div className={`flex items-center gap-2 px-3 py-1 rounded ${timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"}`}>
                                <FaClock />
                                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Passage Panel */}
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                            <h3 className="font-semibold text-gray-800">{currentPass.title}</h3>
                            {currentPass.source && (
                                <p className="text-xs text-gray-500">{currentPass.source}</p>
                            )}
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]" style={{ fontSize: `${fontSize}px` }}>
                            {currentPass.content.split('\n\n').map((para, index) => (
                                <p key={index} className="text-gray-700 leading-relaxed mb-4">{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Question Panel */}
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded px-4 py-3">
                            <h3 className="font-semibold text-gray-800">Questions {passages.slice(0, currentPassage).reduce((acc, p) => acc + p.questions.length, 0) + 1}–{passages.slice(0, currentPassage + 1).reduce((acc, p) => acc + p.questions.length, 0)}</h3>
                        </div>

                        {/* Question */}
                        {/* Questions List */}
                        <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                            {currentQuestions.map((q, idx) => {
                                const globalIdx = passages.slice(0, currentPassage).reduce((acc, p) => acc + p.questions.length, 0) + idx + 1;

                                return (
                                    <div key={q.id} id={`q-${q.questionNumber}`} className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                                                Question {globalIdx}
                                            </span>
                                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                                {getQuestionTypeLabel(q.type)}
                                            </span>
                                        </div>

                                        <p className="text-gray-800 mb-5 font-medium leading-relaxed">{q.text}</p>

                                        {(q.type === "multiple-choice" || q.type === "mcq" ||
                                            q.type === "true-false-not-given" || q.type === "tfng" ||
                                            q.type === "yes-no-not-given" || q.type === "matching") && q.options?.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {q.options.map((option, oIdx) => (
                                                    <label
                                                        key={oIdx}
                                                        onClick={() => handleAnswer(q.questionNumber, option)}
                                                        className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-200 ${answers[q.questionNumber] === option
                                                            ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-sm"
                                                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${answers[q.questionNumber] === option ? "border-blue-600 bg-blue-600" : "border-gray-300"
                                                            }`}>
                                                            {answers[q.questionNumber] === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                        </div>
                                                        <span className={`text-[15px] ${answers[q.questionNumber] === option ? "text-blue-900 font-semibold" : "text-gray-700"}`}>{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-2 group">
                                                <input
                                                    type="text"
                                                    value={answers[q.questionNumber] || ""}
                                                    onChange={(e) => handleAnswer(q.questionNumber, e.target.value)}
                                                    placeholder="Type your answer here..."
                                                    className="w-full max-w-lg border border-gray-300 rounded-xl px-5 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                                                />
                                                <p className="text-gray-400 text-xs mt-2.5 ml-1 italic">{q.instruction || "Write your answer"}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
                            <button
                                onClick={goPrev}
                                disabled={currentPassage === 0}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all ${currentPassage === 0
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm"
                                    }`}
                            >
                                <FaChevronLeft />
                                Previous Passage
                            </button>

                            <div className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                    Passage {currentPassage + 1} of {passages.length}
                                </span>
                            </div>

                            <button
                                onClick={goNext}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-2.5 rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all shadow-md shadow-blue-200"
                            >
                                {currentPassage === passages.length - 1 ? (
                                    "Finish Test"
                                ) : (
                                    <>Next Passage <FaChevronRight /></>
                                )}
                            </button>
                        </div>

                        {/* Question Navigator */}
                        <div className="bg-white border border-gray-200 rounded p-4">
                            <div className="flex flex-wrap gap-1 mb-3">
                                {currentPass.questions.map((q, idx) => {
                                    const isAnswered = answers[q.questionNumber] && answers[q.questionNumber] !== "";
                                    const scrollToIndex = () => {
                                        const element = document.getElementById(`q-${q.questionNumber}`);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }
                                    };

                                    return (
                                        <button
                                            key={q.questionNumber}
                                            onClick={scrollToIndex}
                                            className={`w-8 h-8 rounded text-sm font-medium cursor-pointer transition-all ${isAnswered
                                                ? "bg-green-600 text-white border border-green-700 shadow-md"
                                                : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 border border-gray-200 shadow-sm"
                                                }`}
                                        >
                                            {passages.slice(0, currentPassage).reduce((acc, p) => acc + p.questions.length, 0) + idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-gray-500 text-sm">
                                Answered: {answeredCount}/{totalQuestions}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Submit Reading Test?</h3>
                            <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Answered</span>
                                <span className="font-semibold text-blue-600">{answeredCount} / {totalQuestions}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
                            </div>
                        </div>

                        {totalQuestions - answeredCount > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                                <p className="text-amber-700 text-sm">{totalQuestions - answeredCount} questions unanswered!</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                            >
                                Review
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer disabled:opacity-70"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
