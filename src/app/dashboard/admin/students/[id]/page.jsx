"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaUser,
    FaArrowLeft,
    FaEye,
    FaEdit,
    FaTimes,
    FaSpinner,
    FaSave
} from "react-icons/fa";
import { studentsAPI } from "@/lib/api";

const ModuleCard = ({ title, band, subInfo, onView, onEdit }) => (
    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-slate-800 capitalize">{title}</h3>
            <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${band > 0 ? 'bg-blue-100/50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                Band: {band || "-"}
            </span>
        </div>
        <p className="text-sm text-slate-500 mb-6 font-medium">{subInfo}</p>
        <div className="flex gap-3">
            <button
                onClick={onView}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 hover:text-blue-600 transition-colors"
            >
                <FaEye className="text-slate-400" /> View
            </button>
            <button
                onClick={onEdit}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
                <FaEdit /> Edit
            </button>
        </div>
    </div>
);

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors">
                    <FaTimes />
                </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);

function StudentContent() {
    const params = useParams();
    const router = useRouter();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState({ show: false, type: '', module: '', answers: null, score: '' });

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await studentsAPI.getById(params.id);
                if (response.success) setStudent(response.data);
            } catch (error) {
                console.error("Failed to fetch student:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [params.id]);

    const handleViewAnswers = async (module) => {
        setModalData({ show: true, type: 'answers', module, answers: [], loading: true });
        try {
            const response = await studentsAPI.getAnswerSheet(params.id, module);
            if (response.success) {
                setModalData(prev => ({ ...prev, answers: response.data.answers, loading: false }));
            }
        } catch (error) {
            console.error("Failed to fetch answers:", error);
            setModalData(prev => ({ ...prev, loading: false }));
        }
    };

    const handleUpdateScore = async () => {
        try {
            const response = await studentsAPI.updateScore(params.id, modalData.module.toLowerCase(), modalData.score);
            if (response.success) {
                setStudent(response.data);
                setModalData({ show: false, type: '', module: '', answers: null, score: '' });
                alert("Score updated successfully!");
            }
        } catch (error) {
            alert("Failed to update score");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-sky-50"><FaSpinner className="animate-spin text-2xl text-blue-400" /></div>;
    if (!student) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Student not found</div>;

    return (
        <div className="min-h-screen bg-sky-50 p-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-semibold mb-8 transition-colors group">
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to List
            </button>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-blue-100 p-8 mb-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-300 text-4xl border border-blue-100 shadow-inner">
                    <FaUser />
                </div>
                <div className="flex-1 relative z-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">{student.nameEnglish}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-slate-500">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium border border-slate-200">Roll: {student.rollNumber || student.examId}</span>
                        <span className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-600 font-medium border border-emerald-100 capitalize">{student.examStatus || 'Active'}</span>
                    </div>
                </div>
                <div className="relative z-10 bg-blue-600 px-8 py-5 rounded-2xl text-center min-w-[160px] text-white shadow-xl shadow-blue-200/50">
                    <span className="block text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Overall Band</span>
                    <span className="block text-5xl font-black">{student.scores?.overall || "-"}</span>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ModuleCard
                    title="Listening"
                    band={student.scores?.listening?.band}
                    subInfo={`Correct Answers: ${student.scores?.listening?.correctAnswers || 0}/40`}
                    onView={() => handleViewAnswers('Listening')}
                    onEdit={() => setModalData({ show: true, type: 'edit', module: 'Listening', score: student.scores?.listening?.band || '' })}
                />
                <ModuleCard
                    title="Reading"
                    band={student.scores?.reading?.band}
                    subInfo={`Correct Answers: ${student.scores?.reading?.correctAnswers || 0}/40`}
                    onView={() => handleViewAnswers('Reading')}
                    onEdit={() => setModalData({ show: true, type: 'edit', module: 'Reading', score: student.scores?.reading?.band || '' })}
                />
                <ModuleCard
                    title="Writing"
                    band={student.scores?.writing?.overallBand}
                    subInfo={`Tasks Submitted: ${student.completedModules?.includes('writing') ? 'Yes' : 'No'}`}
                    onView={() => handleViewAnswers('Writing')}
                    onEdit={() => setModalData({ show: true, type: 'edit', module: 'Writing', score: student.scores?.writing?.overallBand || '' })}
                />
            </div>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Student Information</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <span className="text-slate-500 font-medium">Email Address</span>
                            <span className="text-slate-900 font-semibold">{student.email}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <span className="text-slate-500 font-medium">Phone Number</span>
                            <span className="text-slate-900 font-semibold">{student.phone}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <span className="text-slate-500 font-medium">Payment Status</span>
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded capitalize">{student.paymentStatus || 'Paid'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Exam Metadata</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <span className="text-slate-500 font-medium">Exam Date</span>
                            <span className="text-slate-900 font-semibold">{student.examDate ? new Date(student.examDate).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <span className="text-slate-500 font-medium">Violations Detected</span>
                            <span className={`${student.totalViolations > 0 ? 'text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded font-bold' : 'text-slate-900 font-semibold'}`}>
                                {student.totalViolations}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalData.show && (
                <Modal
                    title={modalData.type === 'edit' ? `Edit Score: ${modalData.module}` : `Submissions: ${modalData.module}`}
                    onClose={() => setModalData({ show: false, type: '', module: '', answers: null, score: '' })}
                >
                    {modalData.type === 'edit' ? (
                        <div className="space-y-6 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Band Score (0-9)</label>
                                <input
                                    type="number" step="0.5" min="0" max="9"
                                    value={modalData.score}
                                    onChange={(e) => setModalData(prev => ({ ...prev, score: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-all font-bold text-lg text-slate-800"
                                    placeholder="Enter score..."
                                />
                            </div>
                            <button
                                onClick={handleUpdateScore}
                                className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                <FaSave /> Save Changes
                            </button>
                        </div>
                    ) : modalData.loading ? (
                        <div className="py-12 text-center"><FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto" /></div>
                    ) : modalData.module?.toLowerCase() === 'writing' ? (
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Task 1</h4>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed">
                                    {modalData.answers?.task1 || 'No submission.'}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Task 2</h4>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed">
                                    {modalData.answers?.task2 || 'No submission.'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {modalData.answers?.map((ans, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 shadow-sm">
                                            {ans.questionNumber}
                                        </span>
                                        <span className={`font-bold text-base ${ans.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {ans.studentAnswer || '(Blank)'}
                                        </span>
                                    </div>
                                    {!ans.isCorrect && (
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Correct</span>
                                            <span className="text-xs bg-slate-200/50 px-2 py-1 rounded text-slate-600 font-mono font-bold">
                                                {ans.correctAnswer}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}

export default function StudentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-sky-50 flex items-center justify-center"><FaSpinner className="animate-spin text-2xl text-blue-400" /></div>}>
            <StudentContent />
        </Suspense>
    );
}
