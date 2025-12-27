"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBook,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaFlag,
    FaCheck,
    FaExpand,
    FaCompress,
    FaExclamationTriangle,
    FaTimes,
    FaPlay,
    FaListOl
} from "react-icons/fa";

export default function ReadingExamPage() {
    const params = useParams();
    const router = useRouter();

    const [currentPassage, setCurrentPassage] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passageExpanded, setPassageExpanded] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [fontSize, setFontSize] = useState(16);

    // IELTS Reading - 3 Passages, 40 Questions (13-14 per passage)
    const passages = [
        {
            id: 1,
            title: "The Rise of Artificial Intelligence",
            source: "Scientific Review Journal, 2023",
            content: `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. From its theoretical foundations in the 1950s to its current applications in virtually every industry, AI has fundamentally changed how we live, work, and interact with technology.

The term "artificial intelligence" was first coined by John McCarthy in 1956 at the Dartmouth Conference, which is widely considered the birthplace of AI as a field of study. The early pioneers envisioned machines that could simulate human intelligence, learning from experience and adapting to new situations.

Over the decades, AI research has experienced several cycles of optimism and disappointment, often referred to as "AI winters." However, the past fifteen years have witnessed unprecedented advances, driven primarily by three factors: the availability of massive datasets, dramatically increased computing power, and breakthrough algorithms, particularly in deep learning.

Deep learning, a subset of machine learning, uses artificial neural networks inspired by the human brain. These networks consist of multiple layers that can learn hierarchical representations of data. This approach has achieved remarkable success in areas such as image recognition, natural language processing, and game playing.

The practical applications of AI have expanded rapidly. In healthcare, AI systems can analyze medical images with accuracy comparable to or exceeding that of human specialists. In transportation, autonomous vehicles use AI to navigate complex environments. In finance, algorithms process vast amounts of data to detect fraud and make trading decisions in milliseconds.

Despite these achievements, significant challenges remain. AI systems can perpetuate and amplify biases present in their training data. Questions about accountability, transparency, and the ethical use of AI demand careful consideration. Furthermore, concerns about AI's impact on employment have sparked important debates about the future of work.

The development of artificial general intelligence (AGI) — systems that can perform any intellectual task that a human can — remains a long-term goal. While some researchers predict AGI within decades, others believe it may require fundamental breakthroughs we have not yet conceived. The path forward will require not only technical innovation but also thoughtful governance and international cooperation.`,
            questions: [
                // Questions 1-5: T/F/NG
                { id: 1, type: "tfng", text: "John McCarthy created the term 'artificial intelligence' in 1956.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "TRUE", marks: 1 },
                { id: 2, type: "tfng", text: "AI research has always progressed steadily without any setbacks.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                { id: 3, type: "tfng", text: "Deep learning networks are designed based on the human brain structure.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "TRUE", marks: 1 },
                { id: 4, type: "tfng", text: "AI in healthcare has completely replaced human doctors.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                { id: 5, type: "tfng", text: "All AI researchers agree on when AGI will be achieved.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                // Questions 6-9: MCQ
                { id: 6, type: "mcq", text: "According to the passage, which of the following has NOT contributed to recent AI advances?", options: ["Large datasets", "Quantum computing", "Better algorithms", "More computing power"], correctAnswer: "Quantum computing", marks: 1 },
                { id: 7, type: "mcq", text: "What is deep learning described as in the passage?", options: ["A type of human learning", "A subset of machine learning", "A replacement for AI", "A social science"], correctAnswer: "A subset of machine learning", marks: 1 },
                { id: 8, type: "mcq", text: "The periods of reduced AI research interest are called:", options: ["AI breaks", "AI winters", "AI summers", "AI gaps"], correctAnswer: "AI winters", marks: 1 },
                { id: 9, type: "mcq", text: "What concern about AI is mentioned regarding employment?", options: ["AI creates too many jobs", "AI has no effect on jobs", "AI may impact future of work", "AI only affects one industry"], correctAnswer: "AI may impact future of work", marks: 1 },
                // Questions 10-13: Sentence Completion
                { id: 10, type: "fill", text: "The Dartmouth Conference is considered the _______ of AI as a field.", instruction: "Write ONE WORD only", correctAnswer: "birthplace", marks: 1 },
                { id: 11, type: "fill", text: "Deep learning networks consist of multiple _______ that learn data representations.", instruction: "Write ONE WORD only", correctAnswer: "layers", marks: 1 },
                { id: 12, type: "fill", text: "AI systems may perpetuate _______ found in their training data.", instruction: "Write ONE WORD only", correctAnswer: "biases", marks: 1 },
                { id: 13, type: "fill", text: "AGI refers to systems that can perform any _______ task like humans.", instruction: "Write ONE WORD only", correctAnswer: "intellectual", marks: 1 },
            ]
        },
        {
            id: 2,
            title: "Ocean Plastic Pollution: A Global Crisis",
            source: "Environmental Studies Quarterly, 2023",
            content: `The world's oceans, which cover more than 70% of the Earth's surface, are facing an unprecedented crisis: plastic pollution. Every year, an estimated 8 million metric tons of plastic waste enters the oceans, creating a growing environmental catastrophe that threatens marine ecosystems and, ultimately, human health.

Plastics were first developed in the early 20th century and gained widespread use after World War II due to their durability, versatility, and low cost. However, the very properties that make plastics useful — their resistance to degradation — have made them a persistent environmental problem. A plastic bottle can take up to 450 years to break down, during which time it poses risks to marine life.

The sources of ocean plastic are diverse. Land-based sources, including littering, inadequate waste management, and industrial activities, account for approximately 80% of marine plastic pollution. The remaining 20% comes from sea-based sources such as fishing operations, shipping, and offshore industries. Rivers play a crucial role, acting as conduits that transport plastic waste from inland areas to the ocean.

One of the most visible manifestations of ocean plastic pollution is the Great Pacific Garbage Patch, a vast accumulation of debris located between Hawaii and California. Contrary to popular imagination, it is not a solid island of trash but rather a dispersed concentration of microplastics and larger debris spread across an area roughly twice the size of Texas.

Microplastics — fragments smaller than 5 millimeters — present particular challenges. They are ingested by marine organisms at all levels of the food chain, from tiny zooplankton to large marine mammals. Studies have found microplastics in seafood consumed by humans, raising concerns about potential health effects that are still being investigated.

Various solutions are being pursued at different scales. At the individual level, reducing single-use plastic consumption and improving recycling habits can make a difference. Governments are implementing bans on certain plastic products and investing in waste management infrastructure. Innovative technologies are being developed to remove plastic from the oceans, though experts emphasize that prevention at the source is more effective than cleanup.

International cooperation is essential given the transboundary nature of ocean pollution. The United Nations Environment Assembly has begun negotiations on a global plastics treaty, which could establish binding international commitments to address the crisis. Success will require collaboration among governments, industries, and citizens worldwide.`,
            questions: [
                // Questions 14-18: T/F/NG
                { id: 14, type: "tfng", text: "Approximately 8 million metric tons of plastic enters the oceans annually.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "TRUE", marks: 1 },
                { id: 15, type: "tfng", text: "Plastics became popular before World War II.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                { id: 16, type: "tfng", text: "The Great Pacific Garbage Patch is a solid island of trash.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                { id: 17, type: "tfng", text: "Microplastics have been found in seafood that humans eat.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "TRUE", marks: 1 },
                { id: 18, type: "tfng", text: "The health effects of microplastics on humans are fully understood.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                // Questions 19-22: MCQ
                { id: 19, type: "mcq", text: "What percentage of ocean plastic comes from land-based sources?", options: ["20%", "50%", "70%", "80%"], correctAnswer: "80%", marks: 1 },
                { id: 20, type: "mcq", text: "What size defines microplastics?", options: ["Less than 1mm", "Less than 5mm", "Less than 10mm", "Less than 50mm"], correctAnswer: "Less than 5mm", marks: 1 },
                { id: 21, type: "mcq", text: "According to experts, what is more effective than ocean cleanup?", options: ["Better fishing nets", "Larger ships", "Prevention at source", "More landfills"], correctAnswer: "Prevention at source", marks: 1 },
                { id: 22, type: "mcq", text: "How long can a plastic bottle take to break down?", options: ["45 years", "150 years", "450 years", "1000 years"], correctAnswer: "450 years", marks: 1 },
                // Questions 23-27: Completion
                { id: 23, type: "fill", text: "Oceans cover more than _______% of Earth's surface.", instruction: "Write a NUMBER", correctAnswer: "70", marks: 1 },
                { id: 24, type: "fill", text: "Rivers act as _______ transporting plastic from land to oceans.", instruction: "Write ONE WORD only", correctAnswer: "conduits", marks: 1 },
                { id: 25, type: "fill", text: "The Great Pacific Garbage Patch is approximately twice the size of _______.", instruction: "Write ONE WORD only", correctAnswer: "Texas", marks: 1 },
                { id: 26, type: "fill", text: "The _______ Nations is working on a global plastics treaty.", instruction: "Write ONE WORD only", correctAnswer: "United", marks: 1 },
                { id: 27, type: "fill", text: "Sea-based sources include fishing, shipping, and _______ industries.", instruction: "Write ONE WORD only", correctAnswer: "offshore", marks: 1 },
            ]
        },
        {
            id: 3,
            title: "The Psychology of Habit Formation",
            source: "Behavioral Science Review, 2023",
            content: `Habits are the invisible architecture of daily life. Research suggests that approximately 40% of our everyday actions are not conscious decisions but habits — automatic behaviors triggered by contextual cues. Understanding how habits form, persist, and can be changed has become a central focus of psychological research with significant practical implications.

The habit loop, a concept popularized by journalist Charles Duhigg, consists of three components: the cue, the routine, and the reward. The cue is a trigger that initiates the behavior; the routine is the behavior itself; and the reward is the positive reinforcement that makes the behavior worth repeating. Over time, this loop becomes increasingly automatic as neural pathways in the brain strengthen through repetition.

Neuroscience has revealed that habits are primarily processed in the basal ganglia, a region deep in the brain associated with motor control, procedural learning, and emotional responses. When we perform habitual actions, our prefrontal cortex — responsible for conscious decision-making — shows reduced activity. This neural efficiency allows us to perform complex actions while freeing cognitive resources for other tasks.

The formation of new habits typically follows a predictable timeline, though this varies considerably among individuals. While the popular claim that habits take 21 days to form has been widely circulated, research by Phillippa Lally at University College London found that the average time for a new behavior to become automatic is 66 days, with a range spanning from 18 to 254 days depending on the complexity of the behavior.

Breaking unwanted habits presents unique challenges because the neural pathways underlying established habits remain intact even when the behavior is stopped. This explains why people often relapse into old habits during times of stress or when encountering familiar cues. Successful habit change typically involves not just stopping the old behavior but replacing it with a new routine that serves a similar function.

Environmental design has emerged as a powerful strategy for habit change. By modifying our surroundings to make desired behaviors easier and undesired behaviors harder, we can leverage the automatic nature of habits to our advantage. This approach, sometimes called "choice architecture," recognizes that our decisions are heavily influenced by the contexts in which they are made.

The implications of habit research extend to public health, education, and organizational management. Interventions designed around habit science have shown promise in promoting exercise, improving dietary choices, and increasing medication adherence. As our understanding of the mechanisms underlying habits continues to grow, so too does our ability to design effective strategies for behavior change.`,
            questions: [
                // Questions 28-32: T/F/NG
                { id: 28, type: "tfng", text: "About 40% of daily actions are habits rather than conscious decisions.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "TRUE", marks: 1 },
                { id: 29, type: "tfng", text: "The 21-day habit formation rule has been scientifically verified.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                { id: 30, type: "tfng", text: "Neural pathways for old habits disappear when the behavior stops.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                { id: 31, type: "tfng", text: "Charles Duhigg is a neuroscientist who discovered the habit loop.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                { id: 32, type: "tfng", text: "Phillippa Lally's research was conducted at Oxford University.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE", marks: 1 },
                // Questions 33-36: MCQ
                { id: 33, type: "mcq", text: "What are the three components of the habit loop?", options: ["Start, middle, end", "Cue, routine, reward", "Think, act, reflect", "Plan, do, review"], correctAnswer: "Cue, routine, reward", marks: 1 },
                { id: 34, type: "mcq", text: "Where are habits primarily processed in the brain?", options: ["Prefrontal cortex", "Basal ganglia", "Hippocampus", "Cerebellum"], correctAnswer: "Basal ganglia", marks: 1 },
                { id: 35, type: "mcq", text: "According to Lally's research, the average time to form a habit is:", options: ["21 days", "45 days", "66 days", "90 days"], correctAnswer: "66 days", marks: 1 },
                { id: 36, type: "mcq", text: "What strategy involves modifying surroundings to change habits?", options: ["Cognitive therapy", "Environmental design", "Meditation", "Group therapy"], correctAnswer: "Environmental design", marks: 1 },
                // Questions 37-40: Completion
                { id: 37, type: "fill", text: "\"Choice _______\" modifies environments to influence decisions.", instruction: "Write ONE WORD only", correctAnswer: "architecture", marks: 1 },
                { id: 38, type: "fill", text: "The basal ganglia is associated with motor control and _______ learning.", instruction: "Write ONE WORD only", correctAnswer: "procedural", marks: 1 },
                { id: 39, type: "fill", text: "Habit formation time ranges from 18 to _______ days.", instruction: "Write a NUMBER", correctAnswer: "254", marks: 1 },
                { id: 40, type: "fill", text: "People often relapse into old habits during times of _______.", instruction: "Write ONE WORD only", correctAnswer: "stress", marks: 1 },
            ]
        }
    ];

    const currentPass = passages[currentPassage];
    const allQuestions = passages.flatMap(p => p.questions);
    const globalQuestionIndex = passages.slice(0, currentPassage).reduce((acc, p) => acc + p.questions.length, 0) + currentQuestion;
    const currentQ = currentPass.questions[currentQuestion];
    const totalQuestions = allQuestions.length; // 40 questions
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);

    // Band Score Calculation
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
        if (showInstructions) return;

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
    }, [showInstructions]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswer = (qId, value) => {
        setAnswers((prev) => ({ ...prev, [qId]: value }));
    };

    const toggleFlag = () => {
        setFlaggedQuestions((prev) =>
            prev.includes(currentQ.id) ? prev.filter((id) => id !== currentQ.id) : [...prev, currentQ.id]
        );
    };

    const goNext = () => {
        if (currentQuestion < currentPass.questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        } else if (currentPassage < passages.length - 1) {
            setCurrentPassage((prev) => prev + 1);
            setCurrentQuestion(0);
        }
    };

    const goPrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
        } else if (currentPassage > 0) {
            setCurrentPassage((prev) => prev - 1);
            setCurrentQuestion(passages[currentPassage - 1].questions.length - 1);
        }
    };

    const calculateScore = () => {
        let score = 0;
        allQuestions.forEach(q => {
            const userAnswer = answers[q.id];
            if (userAnswer) {
                const normalizedUser = userAnswer.toString().trim().toLowerCase();
                const normalizedCorrect = q.correctAnswer.toString().trim().toLowerCase();
                if (normalizedUser === normalizedCorrect) {
                    score += q.marks;
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

        localStorage.setItem(`exam_${params.examId}_reading`, JSON.stringify({
            answers,
            score,
            total: totalMarks,
            bandScore,
            timeSpent: 60 * 60 - timeLeft,
            correctAnswers: allQuestions.reduce((acc, q) => ({ ...acc, [q.id]: q.correctAnswer }), {})
        }));

        router.push(`/exam/${params.examId}/result?module=reading&score=${score}&total=${totalMarks}&band=${bandScore}`);
    };

    const answeredCount = Object.keys(answers).filter(k => answers[k] !== "").length;

    const getQuestionTypeLabel = (type) => {
        const types = {
            mcq: "Multiple Choice",
            tfng: "True/False/Not Given",
            fill: "Sentence Completion",
            matching: "Matching"
        };
        return types[type] || "Question";
    };

    // Instructions Screen
    if (showInstructions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <FaBook className="text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">IELTS Reading Test</h1>
                            <p className="text-slate-400">3 Passages • 40 Questions • 60 Minutes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {passages.map((pass, idx) => (
                            <div key={pass.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-300 text-sm">Passage {idx + 1}</h4>
                                <p className="text-slate-400 text-xs mt-1 line-clamp-1">{pass.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{pass.questions.length} questions</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <h3 className="font-semibold text-blue-300 mb-2">Question Types</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                <div>• True/False/Not Given</div>
                                <div>• Multiple Choice</div>
                                <div>• Sentence Completion</div>
                                <div>• Matching</div>
                            </div>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <h3 className="font-semibold text-emerald-300 mb-2">Tips for Success</h3>
                            <ul className="text-slate-300 text-sm space-y-1">
                                <li>• Skim passage first, then read questions</li>
                                <li>• Spend about 20 minutes per passage</li>
                                <li>• Answer all questions - no penalty for wrong answers</li>
                                <li>• Use the flag feature to mark difficult questions</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all cursor-pointer"
                    >
                        <FaPlay />
                        Start Reading Test
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Header */}
            <header className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <FaBook className="text-lg" />
                            </div>
                            <div>
                                <h1 className="font-semibold">IELTS Reading</h1>
                                <p className="text-xs text-slate-400">Passage {currentPassage + 1} • Q{globalQuestionIndex + 1}/40</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                {passages.map((p, idx) => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setCurrentPassage(idx); setCurrentQuestion(0); }}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPassage === idx ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        P{idx + 1}
                                    </button>
                                ))}
                            </div>

                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg">
                                <FaListOl className="text-blue-400" />
                                <span>{answeredCount}/40</span>
                            </div>

                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono ${timeLeft < 300 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10"
                                }`}>
                                <FaClock />
                                <span className="text-lg">{formatTime(timeLeft)}</span>
                            </div>

                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className={`grid gap-6 ${passageExpanded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
                    {/* Passage Panel */}
                    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-blue-500/5">
                            <div>
                                <h3 className="font-semibold text-blue-300">{currentPass.title}</h3>
                                <p className="text-xs text-slate-500">{currentPass.source}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                                    <button onClick={() => setFontSize(prev => Math.max(14, prev - 1))} className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer">A-</button>
                                    <span className="text-slate-500 text-xs">{fontSize}</span>
                                    <button onClick={() => setFontSize(prev => Math.min(20, prev + 1))} className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer">A+</button>
                                </div>
                                <button onClick={() => setPassageExpanded(!passageExpanded)} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-400">
                                    {passageExpanded ? <FaCompress /> : <FaExpand />}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-250px)]" style={{ fontSize: `${fontSize}px` }}>
                            {currentPass.content.split('\n\n').map((para, index) => (
                                <p key={index} className="text-slate-300 leading-relaxed mb-5">{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Question Panel */}
                    {!passageExpanded && (
                        <div className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQ.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium">
                                                Question {globalQuestionIndex + 1}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${currentQ.type === 'tfng' ? 'bg-amber-500/20 text-amber-300' :
                                                    currentQ.type === 'mcq' ? 'bg-purple-500/20 text-purple-300' :
                                                        'bg-emerald-500/20 text-emerald-300'
                                                }`}>
                                                {getQuestionTypeLabel(currentQ.type)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={toggleFlag}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${flaggedQuestions.includes(currentQ.id)
                                                    ? "bg-amber-500/20 text-amber-400"
                                                    : "bg-white/5 text-slate-400 hover:text-white"
                                                }`}
                                        >
                                            <FaFlag className="text-sm" />
                                        </button>
                                    </div>

                                    <h2 className="text-lg font-medium mb-6 leading-relaxed">{currentQ.text}</h2>

                                    {currentQ.type === "mcq" || currentQ.type === "tfng" ? (
                                        <div className="space-y-3">
                                            {currentQ.options.map((option, index) => (
                                                <label
                                                    key={index}
                                                    onClick={() => handleAnswer(currentQ.id, option)}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[currentQ.id] === option
                                                            ? "border-blue-500 bg-blue-500/10"
                                                            : "border-white/10 hover:border-white/30 bg-white/[0.02]"
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQ.id] === option ? "border-blue-500 bg-blue-500" : "border-slate-500"
                                                        }`}>
                                                        {answers[currentQ.id] === option && <FaCheck className="text-xs text-white" />}
                                                    </div>
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="text"
                                                value={answers[currentQ.id] || ""}
                                                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                                                placeholder="Type your answer..."
                                                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-lg focus:border-blue-500 outline-none transition-all"
                                            />
                                            <p className="text-slate-500 text-sm mt-2 italic">{currentQ.instruction}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                        <button
                                            onClick={goPrev}
                                            disabled={globalQuestionIndex === 0}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${globalQuestionIndex === 0 ? "text-slate-600 cursor-not-allowed" : "text-slate-300 hover:bg-white/10"
                                                }`}
                                        >
                                            <FaChevronLeft className="text-sm" />
                                            Previous
                                        </button>

                                        {globalQuestionIndex < totalQuestions - 1 ? (
                                            <button
                                                onClick={goNext}
                                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2 rounded-xl font-medium cursor-pointer"
                                            >
                                                Next
                                                <FaChevronRight className="text-sm" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setShowSubmitModal(true)}
                                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2 rounded-xl font-medium cursor-pointer"
                                            >
                                                Finish Test
                                                <FaCheck />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Quick Navigator */}
                            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {currentPass.questions.map((q, idx) => {
                                        const isAnswered = answers[q.id] && answers[q.id] !== "";
                                        const isFlagged = flaggedQuestions.includes(q.id);
                                        const isCurrent = currentQuestion === idx;

                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentQuestion(idx)}
                                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer relative ${isCurrent
                                                        ? "bg-blue-500 text-white"
                                                        : isAnswered
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                            : "bg-white/5 text-slate-400"
                                                    }`}
                                            >
                                                {idx + 1}
                                                {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full"></span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-slate-500 text-sm">
                                    Answered: {answeredCount}/{totalQuestions} • Total: 40 marks
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Submit IELTS Reading?</h3>
                            <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">Answered</span>
                                <span className="font-semibold text-blue-400">{answeredCount} / 40</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${(answeredCount / 40) * 100}%` }}></div>
                            </div>
                        </div>

                        {40 - answeredCount > 0 && (
                            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                                <FaExclamationTriangle className="text-amber-400 mt-0.5" />
                                <p className="text-amber-300 text-sm">{40 - answeredCount} questions unanswered!</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-3 border border-white/20 rounded-xl hover:bg-white/5 cursor-pointer"
                            >
                                Review
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl font-medium cursor-pointer disabled:opacity-70"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
