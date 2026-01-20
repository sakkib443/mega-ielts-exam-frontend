"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaHeadphones,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaCheck,
    FaVolumeUp,
    FaPause,
    FaPlay,
    FaTimes,
    FaSpinner
} from "react-icons/fa";
import { questionSetsAPI, studentsAPI } from "@/lib/api";

export default function ListeningExamPage() {
    const params = useParams();
    const router = useRouter();

    const [currentSection, setCurrentSection] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(40 * 60);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Data loading states
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [questionSet, setQuestionSet] = useState(null);
    const [session, setSession] = useState(null);

    // Audio states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const audioRef = useRef(null);

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
                setSession(parsed);

                // IMPORTANT: Fetch fresh completion status from DATABASE
                try {
                    const verifyResponse = await studentsAPI.verifyExamId(parsed.examId);
                    if (verifyResponse.success && verifyResponse.data) {
                        const dbCompletedModules = verifyResponse.data.completedModules || [];
                        const isFinished = dbCompletedModules.length >= 3;

                        // Security check: If listening is already completed OR all 3 are done, redirect back
                        if (dbCompletedModules.includes("listening") || isFinished) {
                            // Update localStorage to keep in sync
                            parsed.completedModules = dbCompletedModules;
                            localStorage.setItem("examSession", JSON.stringify(parsed));

                            router.push(`/exam/${params.examId}`);
                            return;
                        }
                    }
                } catch (apiError) {
                    console.error("Failed to verify completion from DB, using localStorage:", apiError);
                    // Fallback to localStorage check
                    if (parsed.completedModules && (parsed.completedModules.includes("listening") || parsed.completedModules.length >= 3)) {
                        router.push(`/exam/${params.examId}`);
                        return;
                    }
                }

                // Check if listening set is assigned
                const listeningSetNumber = parsed.assignedSets?.listeningSetNumber;
                if (!listeningSetNumber) {
                    setLoadError("No listening test assigned for this exam.");
                    setIsLoading(false);
                    return;
                }

                // Fetch question set from backend
                const response = await questionSetsAPI.getForExam("LISTENING", listeningSetNumber);

                if (response.success && response.data) {
                    setQuestionSet(response.data);
                } else {
                    setLoadError("Failed to load listening test questions.");
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

    // Build sections from question set
    const sections = questionSet?.sections || [];
    const audioUrl = questionSet?.mainAudioUrl || "/audio/Listening-1.mpeg";

    const currentSec = sections[currentSection] || { questions: [] };
    const allQuestions = sections.flatMap(s => s.questions || []);

    // Debug: Log question structure
    console.log("Question sample:", allQuestions[0]);

    // Show all questions for the current section (usually 10)
    const currentQuestions = currentSec.questions || [];
    const globalStartIndex = sections.slice(0, currentSection).reduce((acc, s) => acc + (s.questions?.length || 0), 0);

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

    // Audio handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current && !showInstructions && audioUrl) {
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            setCurrentTime(0);
            setIsPlaying(false);
        }
    }, [showInstructions, audioUrl]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
    };

    const handleAnswer = (qId, value) => {
        setAnswers((prev) => ({ ...prev, [qId]: value }));
    };

    const goNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection((prev) => prev + 1);
            setCurrentPage(0);
        } else {
            setShowSubmitModal(true);
        }
    };

    const goPrev = () => {
        if (currentSection > 0) {
            setCurrentSection((prev) => prev - 1);
            setCurrentPage(0);
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

            // For MCQ/matching, extract the letter (A, B, C, D) from the selected option
            let studentAnswerForComparison = userAnswer.toString().trim();
            if ((q.questionType === "multiple-choice" || q.questionType === "matching") && userAnswer) {
                // Extract the first letter if it's like "A. Some text" or "B. Some text"
                const letterMatch = userAnswer.toString().match(/^([A-Za-z])\./);
                if (letterMatch) {
                    studentAnswerForComparison = letterMatch[1].toUpperCase();
                }
            }

            return {
                questionNumber: q.questionNumber,
                questionText: q.questionText || "", // Include question text
                questionType: q.questionType || "fill-in-blank",
                studentAnswer: studentAnswerForComparison, // Store extracted letter for MCQ
                studentAnswerFull: userAnswer, // Store full answer text for reference
                correctAnswer: q.correctAnswer,
                isCorrect: false // Will be recalculated on backend
            };
        });

        // Get session data from state
        const storedSession = localStorage.getItem("examSession");
        let sessionData = storedSession ? JSON.parse(storedSession) : session;
        const examId = sessionData?.examId || session?.examId;

        // Save to backend with answers
        try {
            const response = await studentsAPI.saveModuleScore(examId, "listening", {
                score: score,
                total: totalMarks,
                band: bandScore,
                answers: detailedAnswers // Send answers to backend
            });
            console.log("Listening data saved with answers");

            // Update localStorage
            if (response.success && sessionData) {
                sessionData.completedModules = response.data?.completedModules || [...(sessionData.completedModules || []), "listening"];
                sessionData.scores = response.data?.scores || {
                    ...(sessionData.scores || {}),
                    listening: { band: bandScore, raw: score, correctAnswers: score, totalQuestions: totalMarks }
                };
                localStorage.setItem("examSession", JSON.stringify(sessionData));
            }
        } catch (error) {
            console.error("Failed to save listening score:", error);
            // Still update localStorage even if backend fails
            if (sessionData) {
                sessionData.completedModules = [...(sessionData.completedModules || []), "listening"];
                sessionData.scores = {
                    ...(sessionData.scores || {}),
                    listening: { band: bandScore, raw: score, correctAnswers: score, totalQuestions: totalMarks }
                };
                localStorage.setItem("examSession", JSON.stringify(sessionData));
            }
        }

        // Go back to exam selection page
        router.push(`/exam/${params.examId}`);
    };

    const answeredCount = Object.keys(answers).filter(k => answers[k] !== "").length;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-cyan-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading listening test...</p>
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
                        className="bg-cyan-600 text-white px-6 py-2 rounded hover:bg-cyan-700"
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
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-cyan-600">
                        <span className="text-cyan-600 font-bold text-2xl">IELTS</span>
                        <span className="text-gray-600">| Listening Test</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Listening Test Instructions</h1>

                    <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                            <strong>Set:</strong> {questionSet?.title || `Listening Set #${questionSet?.setNumber}`}
                        </p>
                        <p className="text-gray-700 mb-3">
                            <strong>Time:</strong> {questionSet?.duration || 40} minutes
                        </p>
                        <p className="text-gray-700 mb-3">
                            <strong>Questions:</strong> {totalQuestions} questions in {sections.length} parts
                        </p>
                        <p className="text-gray-700">
                            <strong>Instructions:</strong> Listen to the audio and answer the questions.
                            You will hear each section only once.
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
                        <h3 className="font-semibold text-amber-800 mb-2">Important Notes:</h3>
                        <ul className="text-amber-700 text-sm space-y-1">
                            <li>• Listen carefully - audio plays once only</li>
                            <li>• Write exactly what you hear</li>
                            <li>• Spelling must be correct</li>
                            <li>• Use headphones for best experience</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full bg-cyan-600 text-white py-3 rounded font-semibold hover:bg-cyan-700 transition-colors cursor-pointer"
                    >
                        Start Listening Test
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <audio ref={audioRef} preload="auto" />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-cyan-600 font-bold text-xl">IELTS</span>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaHeadphones className="text-cyan-600" />
                                <span>Listening Test - Set #{questionSet?.setNumber}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded ${timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"}`}>
                                <FaClock />
                                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Part Header */}
            <div className="bg-cyan-50 border-b border-cyan-100 px-4 py-3">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-lg font-semibold text-gray-800">{currentSec.title || `Part ${currentSection + 1}`}</h2>
                    <p className="text-gray-600 text-sm">{currentSec.instructions || "Answer the questions below."}</p>
                </div>
            </div>

            {/* Audio Player */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 bg-cyan-600 text-white rounded-full flex items-center justify-center hover:bg-cyan-700 transition-colors cursor-pointer"
                        >
                            {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                        </button>

                        <div className="flex-1">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={(e) => {
                                    if (audioRef.current) {
                                        audioRef.current.currentTime = parseFloat(e.target.value);
                                    }
                                }}
                                className="w-full h-2 bg-gray-300 rounded appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #0891b2 ${(currentTime / (duration || 100)) * 100}%, #d1d5db ${(currentTime / (duration || 100)) * 100}%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <FaVolumeUp className="text-gray-500" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-300 rounded appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">
                        Questions {globalStartIndex + 1}–{globalStartIndex + currentQuestions.length}
                    </h3>
                </div>

                <div className="space-y-3 mb-6">
                    {currentQuestions.map((currentQ, qIdx) => {
                        const globalIndex = globalStartIndex + qIdx;
                        const questionId = currentQ.questionNumber;

                        return (
                            <div key={questionId} id={`q-${questionId}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-cyan-200 transition-colors shadow-sm">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="bg-cyan-600 text-white px-2.5 py-0.5 rounded text-sm font-bold shadow-sm">
                                        {globalIndex + 1}
                                    </span>
                                    <p className="text-gray-800 font-medium leading-relaxed">{currentQ.questionText}</p>
                                </div>

                                {currentQ.questionType === "multiple-choice" || currentQ.questionType === "matching" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-10">
                                        {(currentQ.options || []).map((option, index) => (
                                            <label
                                                key={index}
                                                onClick={() => handleAnswer(questionId, option)}
                                                className={`flex items-center gap-3 p-2.5 border rounded-xl cursor-pointer transition-all duration-200 ${answers[questionId] === option
                                                    ? "border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600 shadow-sm"
                                                    : "border-gray-100 hover:border-cyan-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${answers[questionId] === option ? "border-cyan-600 bg-cyan-600" : "border-gray-300"
                                                    }`}>
                                                    {answers[questionId] === option && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                </div>
                                                <span className={`text-sm ${answers[questionId] === option ? "text-cyan-900 font-semibold" : "text-gray-700"}`}>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="ml-10">
                                        <input
                                            type="text"
                                            value={answers[questionId] || ""}
                                            onChange={(e) => handleAnswer(questionId, e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-2.5 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition-all"
                                        />
                                        <p className="text-gray-400 text-[11px] mt-2 italic font-medium tracking-wide uppercase">ONE WORD AND/OR A NUMBER</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={goPrev}
                        disabled={currentSection === 0}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${currentSection === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm"
                            }`}
                    >
                        <FaChevronLeft />
                        Previous Part
                    </button>

                    <div className="text-sm font-semibold text-gray-500">
                        Part {currentSection + 1} of {sections.length}
                    </div>

                    <button
                        onClick={goNext}
                        className={`flex items-center gap-2 bg-gradient-to-r ${currentSection === sections.length - 1 ? 'from-green-600 to-green-700 shadow-green-200' : 'from-cyan-600 to-cyan-700 shadow-cyan-200'} text-white px-8 py-2.5 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all shadow-md`}
                    >
                        {currentSection === sections.length - 1 ? (
                            <>Finish Test <FaCheck /></>
                        ) : (
                            <>Next Part <FaChevronRight /></>
                        )}
                    </button>
                </div>

                {/* Question Navigator */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-600 text-sm">Parts:</span>
                        <div className="flex gap-1">
                            {sections.map((sec, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentSection(idx); setCurrentPage(0); }}
                                    className={`w-8 h-8 rounded text-sm font-medium cursor-pointer ${currentSection === idx ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {(currentSec.questions || []).map((q, idx) => {
                            const questionId = q.questionNumber;
                            const isAnswered = answers[questionId] && answers[questionId] !== "";
                            const globalQNum = sections.slice(0, currentSection).reduce((acc, s) => acc + (s.questions?.length || 0), 0) + idx + 1;
                            const scrollToIndex = () => {
                                const element = document.getElementById(`q-${questionId}`);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            };

                            return (
                                <button
                                    key={questionId}
                                    onClick={scrollToIndex}
                                    className={`w-8 h-8 rounded text-sm font-medium cursor-pointer transition-all ${isAnswered
                                        ? "bg-green-600 text-white shadow-md border border-green-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-cyan-100 hover:text-cyan-700 border border-gray-200 shadow-sm"
                                        }`}
                                >
                                    {globalQNum}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <span>Answered: {answeredCount}/{totalQuestions}</span>
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Submit Listening Test?</h3>
                            <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Answered</span>
                                <span className="font-semibold text-cyan-600">{answeredCount} / {totalQuestions}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                                <div className="h-full bg-cyan-600" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
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
                                className="flex-1 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 cursor-pointer disabled:opacity-70"
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
