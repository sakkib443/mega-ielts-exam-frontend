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

    // Process all questions to ensure continuous numbering 1-40
    const allQuestions = sections.flatMap(s => s.questions || []).map((q, idx) => ({
        ...q,
        // Use the questionNumber from data if it exists and looks valid (not restarting at 1)
        // Otherwise use index + 1
        displayNumber: q.questionNumber || (idx + 1)
    }));

    // Group questions for display in current section
    const currentQuestions = (currentSec.questions || []).map(q => {
        const found = allQuestions.find(aq => aq._id === q._id || (aq.questionNumber === q.questionNumber && aq.questionText === q.questionText));
        return found ? found : q;
    });

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

            {/* Audio Player - Simple */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 bg-cyan-600 text-white rounded-full flex items-center justify-center hover:bg-cyan-700 transition-colors cursor-pointer shadow"
                        >
                            {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                        </button>

                        {/* Progress Bar - Draggable */}
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={currentTime}
                                    onChange={(e) => {
                                        const newTime = parseFloat(e.target.value);
                                        setCurrentTime(newTime);
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = newTime;
                                        }
                                    }}
                                    className="w-full h-2 rounded-full cursor-pointer"
                                    style={{
                                        WebkitAppearance: 'none',
                                        appearance: 'none',
                                        background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${(currentTime / (duration || 100)) * 100}%, #e5e7eb ${(currentTime / (duration || 100)) * 100}%, #e5e7eb 100%)`,
                                        outline: 'none',
                                    }}
                                />
                                <style jsx>{`
                                    input[type="range"]::-webkit-slider-thumb {
                                        -webkit-appearance: none;
                                        appearance: none;
                                        width: 16px;
                                        height: 16px;
                                        background: #0891b2;
                                        border-radius: 50%;
                                        cursor: pointer;
                                        border: 2px solid white;
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                    }
                                    input[type="range"]::-moz-range-thumb {
                                        width: 16px;
                                        height: 16px;
                                        background: #0891b2;
                                        border-radius: 50%;
                                        cursor: pointer;
                                        border: 2px solid white;
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                    }
                                `}</style>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span className="font-mono">{formatTime(currentTime)}</span>
                                <span className="font-mono">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <FaVolumeUp className="text-gray-500" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-300 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - 100% Cambridge Style */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header Info */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold tracking-widest text-cyan-600 uppercase">
                                PART {currentSection + 1}
                            </h2>
                            <div className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                                Questions {globalStartIndex + 1}–{globalStartIndex + currentQuestions.length}
                            </div>
                        </div>

                        {/* Section Instructions */}
                        {currentSec.instructions && (
                            <div className="space-y-1">
                                <p className="text-gray-800 font-medium italic">Complete the notes below.</p>
                                <p className="text-gray-800 font-bold">
                                    {currentSec.instructions}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        {/* Section Title */}
                        <h1 className="text-xl font-bold text-gray-900 mb-5 border-b-2 border-gray-100 pb-1 inline-block">
                            {currentSec.title}
                        </h1>

                        {/* Note/Passage Rendering */}
                        {currentSec.passage ? (
                            <div className="max-w-3xl">
                                <div className="text-gray-800 leading-relaxed font-sans text-base">
                                    {currentSec.passage.split('\n').map((line, lineIdx) => {
                                        const trimmedLine = line.trim();
                                        if (!trimmedLine && lineIdx > 0) return <div key={lineIdx} className="h-3" />;

                                        // Detect headings (lines without bullets and not empty)
                                        const isHeading = trimmedLine && !trimmedLine.startsWith('-') && !line.includes('{');
                                        const isBullet = trimmedLine.startsWith('-');

                                        return (
                                            <div
                                                key={lineIdx}
                                                className={`
                                                    ${isHeading ? 'font-bold text-gray-900 mt-4 mb-2 text-[17px]' : 'mb-1'}
                                                    ${isBullet ? 'pl-6 relative' : ''}
                                                `}
                                            >
                                                {isBullet && <span className="absolute left-1.5 top-0 text-gray-400">•</span>}
                                                {line.split(/(\{{\d+}\}|\{\d+\})/g).map((part, index) => {
                                                    const match = part.match(/\{?\{(\d+)\}\}?/);
                                                    if (match) {
                                                        const qNum = parseInt(match[1]);
                                                        // Find the corresponding question object to get its proper displayNumber
                                                        const qObj = currentQuestions.find(q => q.questionNumber === qNum);
                                                        const displayNum = qObj ? qObj.displayNumber : qNum;

                                                        // Render question input
                                                        return (
                                                            <span key={index} className="inline-flex items-center align-middle mx-1 my-0.5">
                                                                <span className="inline-block border border-gray-300 font-bold px-1.5 py-0 text-[13px] bg-gray-50 min-w-[28px] text-center text-gray-600 rounded">
                                                                    {displayNum}
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={answers[qNum] || ""}
                                                                    onChange={(e) => handleAnswer(qNum, e.target.value)}
                                                                    className="ml-1.5 border-b border-gray-300 px-2 py-0.5 w-36 text-gray-800 focus:outline-none focus:border-cyan-500 bg-transparent transition-all text-base font-medium placeholder:text-gray-300"
                                                                    placeholder="........"
                                                                />
                                                            </span>
                                                        );
                                                    }
                                                    // Render normal text (stripping the leading dash if it's a bullet)
                                                    let displayPart = part;
                                                    if (isBullet && index === 0) {
                                                        displayPart = displayPart.replace(/^-/, '').trim();
                                                    }
                                                    return <span key={index}>{displayPart}</span>;
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Fallback for regular questions / Grouped Questions */
                            <div className="space-y-6">
                                {(() => {
                                    const blocks = [];
                                    let i = 0;
                                    const qs = currentQuestions;

                                    while (i < qs.length) {
                                        const q = qs[i];
                                        // Remove trailing parenthetical instructions to group "Choose TWO" questions
                                        const cleanText = q.questionText.replace(/\s*\([^)]+\)\s*$/g, '').trim();
                                        const group = [q];
                                        let j = i + 1;

                                        if (q.questionType === 'matching') {
                                            // Group consecutive matching questions
                                            while (j < qs.length && qs[j].questionType === 'matching') {
                                                group.push(qs[j]);
                                                j++;
                                            }
                                            blocks.push({
                                                type: 'matching',
                                                text: q.questionText || "Choose the correct letter, A-G, next to questions.",
                                                questions: group,
                                                isGrouped: true
                                            });
                                        } else {
                                            // Detect if next questions are part of the same block
                                            while (j < qs.length &&
                                                qs[j].questionText.replace(/\s*\([^)]+\)\s*$/g, '').trim() === cleanText &&
                                                qs[j].questionType === q.questionType &&
                                                q.questionType !== 'note-completion') {
                                                group.push(qs[j]);
                                                j++;
                                            }
                                            blocks.push({
                                                type: q.questionType,
                                                text: cleanText,
                                                questions: group,
                                                isGrouped: group.length > 1
                                            });
                                        }
                                        i = j;
                                    }

                                    return blocks.map((block, bIdx) => {
                                        const isMulti = block.type === 'multiple-choice' && block.isGrouped;
                                        const isMatching = block.type === 'matching';
                                        const qNumbers = block.questions.map(q => q.questionNumber);
                                        const firstQ = block.questions[0];

                                        if (isMatching) {
                                            return (
                                                <div key={bIdx} className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
                                                    {/* Opinions Box */}
                                                    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                                                        <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-200">
                                                            <h4 className="font-bold text-gray-700 text-sm">Opinions</h4>
                                                        </div>
                                                        <div className="p-4 bg-white grid grid-cols-1 gap-2">
                                                            {(firstQ.options || []).map((opt, idx) => (
                                                                <div key={idx} className="flex gap-4 text-[15px]">
                                                                    <span className="font-bold text-gray-900 w-4">{String.fromCharCode(65 + idx)}</span>
                                                                    <span className="text-gray-600">{opt}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Matching Questions List */}
                                                    <div className="space-y-3">
                                                        {block.questions.map((q, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 group">
                                                                <div className="bg-white border border-gray-400 text-gray-700 w-8 h-8 flex items-center justify-center rounded font-bold text-sm flex-shrink-0">
                                                                    {q.displayNumber}
                                                                </div>
                                                                <p className="text-gray-700 font-medium text-[16px] flex-1">{q.questionText}</p>
                                                                <div className="w-28">
                                                                    <select
                                                                        value={answers[q.questionNumber] || ""}
                                                                        onChange={(e) => handleAnswer(q.questionNumber, e.target.value)}
                                                                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base font-semibold text-gray-800 focus:border-cyan-500 focus:outline-none appearance-none text-center"
                                                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.3rem center', backgroundSize: '1.2em' }}
                                                                    >
                                                                        <option value=""></option>
                                                                        {(firstQ.options || []).map((_, oIdx) => (
                                                                            <option key={oIdx} value={String.fromCharCode(65 + oIdx)}>
                                                                                {String.fromCharCode(65 + oIdx)}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const handleMultiSelect = (option) => {
                                            const currentSelected = qNumbers.map(n => answers[n]).filter(Boolean);
                                            const isAlreadySelected = currentSelected.includes(option);

                                            if (isAlreadySelected) {
                                                // Deselect: Find which question had this option and clear it
                                                const qToClear = qNumbers.find(n => answers[n] === option);
                                                if (qToClear) handleAnswer(qToClear, "");
                                            } else {
                                                // Select: Find the first empty question ID in the group
                                                if (currentSelected.length < qNumbers.length) {
                                                    const emptyQ = qNumbers.find(n => !answers[n]);
                                                    if (emptyQ) handleAnswer(emptyQ, option);
                                                }
                                            }
                                        };

                                        return (
                                            <div key={bIdx} className="bg-white border border-gray-100 rounded-xl p-5 hover:bg-gray-50/50 transition-all">
                                                <div className="flex items-start gap-3 mb-4">
                                                    <span className="text-gray-700 font-bold text-lg pt-0.5">
                                                        {qNumbers.length > 1 ? `${block.questions[0].displayNumber} & ${block.questions[block.questions.length - 1].displayNumber}` : block.questions[0].displayNumber}
                                                    </span>
                                                    <div className="flex-1">
                                                        {isMulti && <p className="text-cyan-600 text-[11px] font-bold uppercase tracking-widest mb-1">Choose {block.questions.length} letters, A-E</p>}
                                                        <p className="text-gray-800 font-semibold text-[17px] leading-snug">{block.text}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 ml-8 max-w-2xl">
                                                    {(firstQ.options || []).map((option, idx) => {
                                                        const label = String.fromCharCode(65 + idx);
                                                        const isSelected = qNumbers.some(n => answers[n] === option || answers[n] === label);

                                                        return (
                                                            <div
                                                                key={idx}
                                                                onClick={() => isMulti ? handleMultiSelect(label) : handleAnswer(firstQ.questionNumber, label)}
                                                                className="flex items-start gap-4 cursor-pointer group/item"
                                                            >
                                                                <div className={`
                                                                    w-9 h-9 flex items-center justify-center rounded-lg font-bold text-[15px] border transition-all flex-shrink-0
                                                                    ${isSelected ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-gray-300 text-gray-500 group-hover/item:border-cyan-300"}
                                                                `}>
                                                                    {label}
                                                                </div>

                                                                <div className={`
                                                                    mt-1.5 flex-1 text-[16px] leading-relaxed transition-colors
                                                                    ${isSelected ? "text-cyan-700 font-bold" : "text-gray-600 font-medium group-hover/item:text-gray-900"}
                                                                `}>
                                                                    {option.replace(/^[A-E]\.\s*/, '')}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {!isMulti && firstQ.questionType !== "multiple-choice" && firstQ.questionType !== "matching" && (
                                                        <div className="max-w-md mt-1">
                                                            <input
                                                                type="text"
                                                                value={answers[firstQ.questionNumber] || ""}
                                                                onChange={(e) => handleAnswer(firstQ.questionNumber, e.target.value)}
                                                                placeholder="Write your answer..."
                                                                className="w-full border-b border-gray-300 bg-transparent px-2 py-1 text-base focus:border-cyan-500 focus:outline-none transition-all"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation and Navigator wrapped in container */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={goPrev}
                        disabled={currentSection === 0}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${currentSection === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm"
                            }`}
                    >
                        <FaChevronLeft />
                        Previous Part
                    </button>

                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Part {currentSection + 1} of {sections.length}
                    </div>

                    <button
                        onClick={goNext}
                        className={`flex items-center gap-2 bg-gradient-to-r ${currentSection === sections.length - 1 ? 'from-green-600 to-green-700 shadow-green-200' : 'from-cyan-600 to-cyan-700 shadow-cyan-200'} text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all shadow-md`}
                    >
                        {currentSection === sections.length - 1 ? (
                            <>Finish Test <FaCheck /></>
                        ) : (
                            <>Next Part <FaChevronRight /></>
                        )}
                    </button>
                </div>

                {/* Question Navigator */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Parts:</span>
                        <div className="flex gap-1">
                            {sections.map((sec, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentSection(idx); setCurrentPage(0); }}
                                    className={`w-7 h-7 rounded text-[12px] font-bold cursor-pointer ${currentSection === idx ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
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
                                    className={`w-8 h-8 rounded text-[12px] font-bold cursor-pointer transition-all ${isAnswered
                                        ? "bg-green-600 text-white shadow-sm border border-green-700"
                                        : "bg-white text-gray-400 hover:border-cyan-300 border border-gray-200"
                                        }`}
                                >
                                    {globalQNum}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Answered: {answeredCount}/{totalQuestions}</span>
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Submit Listening Test?</h3>
                            <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Progress</span>
                                <span className="font-bold text-cyan-600 text-sm">{answeredCount} / {totalQuestions}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-600 transition-all duration-700 ease-out"
                                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {totalQuestions - answeredCount > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-center">
                                <p className="text-amber-700 text-xs font-bold uppercase tracking-wider">
                                    {totalQuestions - answeredCount} questions unanswered
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-sm text-gray-600 transition-all"
                            >
                                Review
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-bold text-sm shadow-lg shadow-cyan-200 transition-all disabled:opacity-70"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Test"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
