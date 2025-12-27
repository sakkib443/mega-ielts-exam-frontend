"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaHeadphones,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaFlag,
    FaCheck,
    FaVolumeUp,
    FaPause,
    FaPlay,
    FaExclamationTriangle,
    FaTimes,
    FaListOl
} from "react-icons/fa";
import { HiOutlineVolumeUp } from "react-icons/hi";

export default function ListeningExamPage() {
    const params = useParams();
    const router = useRouter();

    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(40 * 60);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Audio states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [audioLoaded, setAudioLoaded] = useState(false);

    const audioRef = useRef(null);

    /*
      IELTS LISTENING TEST - 4 Sections, 40 Questions
      
      Each section has an audio file and questions based on the audio content.
      For a real implementation, you would:
      1. Record proper IELTS-style audio
      2. Host them on your server or CDN
      3. Update the URLs below
      
      Currently using sample audio - replace with your own recordings.
    */

    // Audio URLs - Replace these with your own IELTS audio recordings
    const sectionAudios = {
        0: "/audio/listening-section1.mp3", // Library Conversation
        1: "/audio/listening-section2.mp3", // Sports Center Announcement
        2: "/audio/listening-section3.mp3", // Student Discussion
        3: "/audio/listening-section4.mp3"  // Academic Lecture
    };

    // Fallback to online sample audio for demo
    const fallbackAudios = {
        0: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    };

    // IELTS Listening Sections with Transcript-based Questions
    // The answers should match what is said in the audio
    const sections = [
        {
            id: 1,
            title: "Section 1",
            subtitle: "Conversation - Library Membership",
            description: "You will hear a conversation between a student and a library staff member about joining the library.",
            transcript: `
        [Audio Transcript - Section 1]
        
        Staff: Good morning, welcome to City Central Library. How can I help you?
        
        Student: Hi, I'd like to apply for a library card please.
        
        Staff: Certainly. Can I have your name please?
        
        Student: Yes, it's Sarah Mitchell - that's M-I-T-C-H-E-L-L.
        
        Staff: Thank you Sarah. And your address?
        
        Student: 45 Oak Street, Apartment 12.
        
        Staff: And your contact number?
        
        Student: It's 07845-329156.
        
        Staff: What's your occupation?
        
        Student: I'm a teacher at the local primary school.
        
        Staff: Would you like the Standard or Premium membership? Standard is free, 
               Premium costs 25 pounds per year but allows you to borrow 15 books instead of 5.
        
        Student: I'll take the Premium membership please.
        
        Staff: The library is open Monday to Saturday, 9 AM to 9 PM. We're closed on Sundays.
               The late return fee is 50 pence per day.
               The children's section is on the first floor.
      `,
            questions: [
                { id: 1, type: "form", text: "Name: Sarah _______", instruction: "Write the SURNAME only", correctAnswer: "Mitchell", marks: 1 },
                { id: 2, type: "form", text: "Address: 45 _______ Street", instruction: "Write ONE WORD only", correctAnswer: "Oak", marks: 1 },
                { id: 3, type: "form", text: "Phone: 07845-_______", instruction: "Write the NUMBER", correctAnswer: "329156", marks: 1 },
                { id: 4, type: "form", text: "Occupation: _______", instruction: "Write ONE WORD only", correctAnswer: "teacher", marks: 1 },
                { id: 5, type: "form", text: "Membership type: _______", instruction: "Write ONE WORD only", correctAnswer: "Premium", marks: 1 },
                { id: 6, type: "mcq", text: "What time does the library close on weekdays?", options: ["6 PM", "8 PM", "9 PM", "10 PM"], correctAnswer: "9 PM", marks: 1 },
                { id: 7, type: "mcq", text: "How many books can Premium members borrow?", options: ["5", "10", "15", "20"], correctAnswer: "15", marks: 1 },
                { id: 8, type: "mcq", text: "What is the late return fee per day?", options: ["25 pence", "50 pence", "75 pence", "1 pound"], correctAnswer: "50 pence", marks: 1 },
                { id: 9, type: "mcq", text: "When is the library closed?", options: ["Monday", "Saturday", "Sunday", "Friday"], correctAnswer: "Sunday", marks: 1 },
                { id: 10, type: "mcq", text: "Where is the children's section?", options: ["Ground floor", "First floor", "Second floor", "Basement"], correctAnswer: "First floor", marks: 1 },
            ]
        },
        {
            id: 2,
            title: "Section 2",
            subtitle: "Monologue - Sports Center",
            description: "You will hear an announcement about a new community sports center.",
            transcript: `
        [Audio Transcript - Section 2]
        
        Good morning everyone, and welcome to this presentation about our new 
        Riverside Community Sports Center.
        
        The center will officially open on March 15th, just two months from now.
        
        I'm pleased to announce that the final cost of the project was 12 million pounds,
        which came in under budget.
        
        Let me tell you about our facilities. We have 3 swimming pools - one Olympic-sized
        pool, one medium pool, and a children's pool.
        
        Parking is free for visitors, and you can park for up to 4 hours.
        
        The main gym is located on the ground floor for easy access.
        
        Now, regarding the layout of the building:
        - The swimming pools are in the basement level
        - The tennis courts are on the rooftop
        - The cafeteria is on level 2
        
        For the first month after opening, we're offering a 50% discount on all memberships.
        
        And children under 12 get free access to all facilities when accompanied by an adult.
      `,
            questions: [
                { id: 11, type: "sentence", text: "The sports center will open on _______ 15th.", instruction: "Write ONE WORD only", correctAnswer: "March", marks: 1 },
                { id: 12, type: "sentence", text: "The total cost of construction was _______ million pounds.", instruction: "Write a NUMBER", correctAnswer: "12", marks: 1 },
                { id: 13, type: "sentence", text: "The center has _______ swimming pools.", instruction: "Write a NUMBER", correctAnswer: "3", marks: 1 },
                { id: 14, type: "sentence", text: "Free parking is available for up to _______ hours.", instruction: "Write a NUMBER", correctAnswer: "4", marks: 1 },
                { id: 15, type: "sentence", text: "The main gym is located on the _______ floor.", instruction: "Write ONE WORD only", correctAnswer: "ground", marks: 1 },
                { id: 16, type: "matching", text: "Swimming pools are located in the:", options: ["Ground floor", "Level 2", "Rooftop", "Basement"], correctAnswer: "Basement", marks: 1 },
                { id: 17, type: "matching", text: "Tennis courts are located on the:", options: ["Ground floor", "Level 2", "Rooftop", "Basement"], correctAnswer: "Rooftop", marks: 1 },
                { id: 18, type: "matching", text: "Cafeteria is located on:", options: ["Ground floor", "Level 2", "Level 3", "Basement"], correctAnswer: "Level 2", marks: 1 },
                { id: 19, type: "mcq", text: "The first month membership discount is:", options: ["25%", "30%", "40%", "50%"], correctAnswer: "50%", marks: 1 },
                { id: 20, type: "mcq", text: "Children under what age get free access?", options: ["5", "10", "12", "16"], correctAnswer: "12", marks: 1 },
            ]
        },
        {
            id: 3,
            title: "Section 3",
            subtitle: "Discussion - Research Project",
            description: "You will hear a conversation between two students discussing their research project with their tutor.",
            transcript: `
        [Audio Transcript - Section 3]
        
        Tutor: So, how is your research project coming along?
        
        Student 1: We've decided to focus on the social media impact on young people.
        
        Student 2: Yes, specifically we're looking at mental health effects.
        
        Tutor: Interesting. How many participants are you planning to survey?
        
        Student 1: We're aiming for 200 participants.
        
        Tutor: And what method will you use?
        
        Student 2: We've decided on online surveys - they're the most practical for reaching our target age group of 18 to 25 years old.
        
        Tutor: Good choice. How long will each survey take?
        
        Student 1: About 15 minutes per participant.
        
        Tutor: And when is the deadline for this project?
        
        Student 2: May 30th.
        
        Tutor: Which software will you use for data analysis?
        
        Student 1: We're using SPSS software.
        
        Tutor: For the final presentation, what format will you use?
        
        Student 2: We're planning to use slides and also create a poster.
        
        Tutor: Excellent. Professor Johnson will be your faculty advisor for this project.
      `,
            questions: [
                { id: 21, type: "mcq", text: "What is the main topic of the research?", options: ["Climate change", "Social media impact", "Economic trends", "Education reform"], correctAnswer: "Social media impact", marks: 1 },
                { id: 22, type: "mcq", text: "How many participants will they survey?", options: ["100", "150", "200", "250"], correctAnswer: "200", marks: 1 },
                { id: 23, type: "mcq", text: "What research method will they use?", options: ["Interviews", "Online surveys", "Focus groups", "Observation"], correctAnswer: "Online surveys", marks: 1 },
                { id: 24, type: "mcq", text: "When is the project deadline?", options: ["March 30", "April 30", "May 30", "June 30"], correctAnswer: "May 30", marks: 1 },
                { id: 25, type: "mcq", text: "Who is their faculty advisor?", options: ["Professor Smith", "Professor Johnson", "Professor Williams", "Professor Brown"], correctAnswer: "Professor Johnson", marks: 1 },
                { id: 26, type: "note", text: "Research focus: Effects on _______ health", instruction: "Write ONE WORD only", correctAnswer: "mental", marks: 1 },
                { id: 27, type: "note", text: "Age group studied: 18 to _______ years", instruction: "Write a NUMBER", correctAnswer: "25", marks: 1 },
                { id: 28, type: "note", text: "Survey duration: _______ minutes", instruction: "Write a NUMBER", correctAnswer: "15", marks: 1 },
                { id: 29, type: "note", text: "Data analysis software: _______", instruction: "Write ONE WORD only", correctAnswer: "SPSS", marks: 1 },
                { id: 30, type: "note", text: "Presentation format: _______ and poster", instruction: "Write ONE WORD only", correctAnswer: "slides", marks: 1 },
            ]
        },
        {
            id: 4,
            title: "Section 4",
            subtitle: "Academic Lecture - Sleep and Memory",
            description: "You will hear a university lecture on the psychology of sleep and its effects on memory.",
            transcript: `
        [Audio Transcript - Section 4]
        
        Good afternoon, everyone. Today's lecture focuses on how sleep affects 
        long-term memory consolidation.
        
        Research from our department, conducted over 3 years with 150 university 
        students, has revealed fascinating findings about the relationship between 
        sleep and memory.
        
        Our studies show that 8 hours of sleep is optimal for memory consolidation.
        
        The critical process of memory consolidation occurs during REM sleep - that's
        Rapid Eye Movement sleep, when we dream.
        
        We found that sleep deprivation primarily affects long-term memory, rather
        than short-term memory.
        
        In our experiments, students who had adequate sleep performed 35% better
        on memory tests compared to sleep-deprived students.
        
        Interestingly, the best time for studying new information appears to be
        late morning, between 10 AM and noon.
        
        For optimal retention, I recommend reviewing material before sleep.
        This allows the brain to process information during the night.
        
        Finally, for the best results, study sessions should be spaced every 
        2-3 days rather than cramming everything in one session.
        
        For further reading, please refer to the course textbook, chapter 7.
      `,
            questions: [
                { id: 31, type: "summary", text: "The lecture discusses how _______ affects memory.", instruction: "Write ONE WORD only", correctAnswer: "sleep", marks: 1 },
                { id: 32, type: "summary", text: "The optimal sleep duration for memory is _______ hours.", instruction: "Write a NUMBER", correctAnswer: "8", marks: 1 },
                { id: 33, type: "summary", text: "Memory consolidation occurs during _______ sleep.", instruction: "Write ONE WORD only", correctAnswer: "REM", marks: 1 },
                { id: 34, type: "summary", text: "The research studied _______ university students.", instruction: "Write a NUMBER", correctAnswer: "150", marks: 1 },
                { id: 35, type: "summary", text: "The research was conducted over _______ years.", instruction: "Write a NUMBER", correctAnswer: "3", marks: 1 },
                { id: 36, type: "mcq", text: "Sleep deprivation primarily affects which type of memory?", options: ["Short-term", "Long-term", "Visual", "Auditory"], correctAnswer: "Long-term", marks: 1 },
                { id: 37, type: "mcq", text: "Well-rested students performed how much better?", options: ["15%", "25%", "35%", "45%"], correctAnswer: "35%", marks: 1 },
                { id: 38, type: "mcq", text: "What time of day is best for studying new information?", options: ["Early morning", "Late morning", "Afternoon", "Evening"], correctAnswer: "Late morning", marks: 1 },
                { id: 39, type: "mcq", text: "When should you review material for best retention?", options: ["After breakfast", "After lunch", "After dinner", "Before sleep"], correctAnswer: "Before sleep", marks: 1 },
                { id: 40, type: "mcq", text: "How often should study sessions be spaced?", options: ["Every day", "Every 2-3 days", "Every week", "Every month"], correctAnswer: "Every 2-3 days", marks: 1 },
            ]
        }
    ];

    const currentSec = sections[currentSection];
    const allQuestions = sections.flatMap(s => s.questions);
    const globalQuestionIndex = sections.slice(0, currentSection).reduce((acc, s) => acc + s.questions.length, 0) + currentQuestion;
    const currentQ = currentSec.questions[currentQuestion];
    const totalQuestions = allQuestions.length;
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);

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

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setAudioLoaded(true);
        };
        const handleEnded = () => setIsPlaying(false);
        const handleError = () => {
            // Try fallback audio if main audio fails
            if (audio.src !== fallbackAudios[currentSection]) {
                audio.src = fallbackAudios[currentSection];
                audio.load();
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [currentSection]);

    useEffect(() => {
        if (audioRef.current && !showInstructions) {
            setAudioLoaded(false);
            // Try main audio first, fallback if not found
            audioRef.current.src = sectionAudios[currentSection];
            audioRef.current.load();
            setCurrentTime(0);
            setIsPlaying(false);
        }
    }, [currentSection, showInstructions]);

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
            audioRef.current.play().catch(() => {
                // Use fallback audio
                audioRef.current.src = fallbackAudios[currentSection];
                audioRef.current.play();
            });
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

    const toggleFlag = () => {
        setFlaggedQuestions((prev) =>
            prev.includes(currentQ.id) ? prev.filter((id) => id !== currentQ.id) : [...prev, currentQ.id]
        );
    };

    const goNext = () => {
        if (currentQuestion < currentSec.questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        } else if (currentSection < sections.length - 1) {
            setCurrentSection((prev) => prev + 1);
            setCurrentQuestion(0);
        }
    };

    const goPrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
        } else if (currentSection > 0) {
            setCurrentSection((prev) => prev - 1);
            setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
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

        localStorage.setItem(`exam_${params.examId}_listening`, JSON.stringify({
            answers,
            score,
            total: totalMarks,
            bandScore,
            timeSpent: 40 * 60 - timeLeft,
            correctAnswers: allQuestions.reduce((acc, q) => ({ ...acc, [q.id]: q.correctAnswer }), {})
        }));

        router.push(`/exam/${params.examId}/result?module=listening&score=${score}&total=${totalMarks}&band=${bandScore}`);
    };

    const answeredCount = Object.keys(answers).filter(k => answers[k] !== "").length;

    const getQuestionTypeLabel = (type) => {
        const types = {
            mcq: "Multiple Choice",
            form: "Form Completion",
            sentence: "Sentence Completion",
            note: "Note Completion",
            summary: "Summary Completion",
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
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <FaHeadphones className="text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">IELTS Listening Test</h1>
                            <p className="text-slate-400">4 Sections • 40 Questions • 40 Minutes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {sections.map((sec) => (
                            <div key={sec.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h4 className="font-semibold text-purple-300">{sec.title}</h4>
                                <p className="text-slate-400 text-sm">{sec.subtitle}</p>
                                <p className="text-xs text-slate-500 mt-1">10 questions</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                            <h3 className="font-semibold text-purple-300 mb-2">How It Works</h3>
                            <ul className="text-slate-300 text-sm space-y-1">
                                <li>• 🎧 Listen to the audio for each section</li>
                                <li>• 📝 Answer questions based on what you hear</li>
                                <li>• ⏸️ You can pause and replay the audio</li>
                                <li>• ✍️ Fill in the blanks with words/numbers from the audio</li>
                            </ul>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <h3 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                                <FaExclamationTriangle />
                                Important Tips
                            </h3>
                            <ul className="text-slate-300 text-sm space-y-1">
                                <li>• Listen for specific details like names, numbers, dates</li>
                                <li>• Spelling must be correct</li>
                                <li>• Write exactly what you hear (no extra words)</li>
                                <li>• Read questions before listening</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all cursor-pointer"
                    >
                        <FaPlay />
                        Start Listening Test
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <audio ref={audioRef} preload="auto" />

            {/* Header */}
            <header className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <FaHeadphones className="text-lg" />
                            </div>
                            <div>
                                <h1 className="font-semibold">IELTS Listening</h1>
                                <p className="text-xs text-slate-400">{currentSec.title} • Q{globalQuestionIndex + 1}/40</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg">
                                <FaListOl className="text-purple-400" />
                                <span>{answeredCount}/40</span>
                            </div>

                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono ${timeLeft < 300 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10"
                                }`}>
                                <FaClock />
                                <span className="text-lg">{formatTime(timeLeft)}</span>
                            </div>

                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                        {/* Audio Player with Transcript Info */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-purple-300">{currentSec.title}: {currentSec.subtitle}</h3>
                                    <p className="text-slate-400 text-sm">{currentSec.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlay}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${isPlaying
                                            ? "bg-purple-500 text-white animate-pulse"
                                            : "bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:scale-105"
                                        }`}
                                >
                                    {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg ml-1" />}
                                </button>

                                <div className="flex-1 space-y-1">
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
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #a855f7 ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 100)) * 100}%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                                    <FaVolumeUp className="text-purple-400" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            </div>

                            {isPlaying && (
                                <div className="flex items-center gap-2 mt-3 text-purple-300 text-sm bg-purple-500/10 rounded-lg px-3 py-2">
                                    <HiOutlineVolumeUp className="animate-pulse text-lg" />
                                    <span>🎧 Listen carefully for answers to the questions below</span>
                                </div>
                            )}

                            {/* Transcript hint */}
                            <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                <p className="text-xs text-slate-500">
                                    💡 <strong>Demo Mode:</strong> In a real test, listen to the audio. For practice, the transcript content matches the questions.
                                </p>
                            </div>
                        </div>

                        {/* Question Card */}
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
                                        <span className="bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium">
                                            Question {globalQuestionIndex + 1}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300">
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

                                <h2 className="text-xl font-medium mb-6 leading-relaxed whitespace-pre-line">{currentQ.text}</h2>

                                {currentQ.type === "mcq" || currentQ.type === "matching" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentQ.options.map((option, index) => (
                                            <label
                                                key={index}
                                                onClick={() => handleAnswer(currentQ.id, option)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${answers[currentQ.id] === option
                                                        ? "border-purple-500 bg-purple-500/20 shadow-lg"
                                                        : "border-white/10 hover:border-purple-400/50 bg-white/[0.02]"
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQ.id] === option ? "border-purple-500 bg-purple-500" : "border-slate-500"
                                                    }`}>
                                                    {answers[currentQ.id] === option && <FaCheck className="text-xs text-white" />}
                                                </div>
                                                <span className="font-medium">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={answers[currentQ.id] || ""}
                                            onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                                            placeholder="Type what you hear..."
                                            className="w-full max-w-md bg-white/5 border-2 border-white/20 rounded-xl px-5 py-4 text-xl font-medium focus:border-purple-500 focus:bg-purple-500/5 outline-none transition-all"
                                        />
                                        <p className="text-slate-400 text-sm">
                                            <span className="bg-slate-700 px-2 py-0.5 rounded text-xs mr-2">Tip</span>
                                            {currentQ.instruction}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                    <button
                                        onClick={goPrev}
                                        disabled={globalQuestionIndex === 0}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${globalQuestionIndex === 0 ? "text-slate-600 cursor-not-allowed" : "text-slate-300 hover:bg-white/10"
                                            }`}
                                    >
                                        <FaChevronLeft className="text-sm" />
                                        Previous
                                    </button>

                                    {globalQuestionIndex < totalQuestions - 1 ? (
                                        <button
                                            onClick={goNext}
                                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
                                        >
                                            Next
                                            <FaChevronRight className="text-sm" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
                                        >
                                            Finish Test
                                            <FaCheck />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5 h-fit sticky top-24">
                        <h3 className="font-semibold mb-4 text-slate-300">Question Navigator</h3>

                        <div className="flex gap-1 mb-4">
                            {sections.map((sec, idx) => (
                                <button
                                    key={sec.id}
                                    onClick={() => { setCurrentSection(idx); setCurrentQuestion(0); }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${currentSection === idx ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                                        }`}
                                >
                                    S{idx + 1}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 mb-6">
                            {currentSec.questions.map((q, idx) => {
                                const isAnswered = answers[q.id] && answers[q.id] !== "";
                                const isFlagged = flaggedQuestions.includes(q.id);
                                const isCurrent = currentQuestion === idx;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`aspect-square rounded-lg text-xs font-medium transition-all cursor-pointer relative ${isCurrent
                                                ? "bg-purple-500 text-white ring-2 ring-purple-400"
                                                : isAnswered
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : "bg-white/5 text-slate-400 border border-white/10"
                                            }`}
                                    >
                                        {idx + 1}
                                        {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full"></span>}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-2 text-xs text-slate-400 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                                <span>Answered ({answeredCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-white/5 border border-white/10"></div>
                                <span>Unanswered ({totalQuestions - answeredCount})</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-slate-500 text-xs">Total Questions</p>
                            <p className="text-3xl font-bold text-purple-400">40</p>
                        </div>

                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="lg:hidden w-full mt-4 bg-purple-500 py-3 rounded-xl font-medium cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
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
                            <h3 className="text-xl font-bold">Submit IELTS Listening?</h3>
                            <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">Answered</span>
                                <span className="font-semibold text-purple-400">{answeredCount} / 40</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${(answeredCount / 40) * 100}%` }}></div>
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
                                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl font-medium cursor-pointer disabled:opacity-70"
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
