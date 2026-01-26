"use client";

import { useState, useEffect, useCallback } from "react";
import { FaExclamationTriangle, FaTimes, FaShieldAlt, FaEyeSlash } from "react-icons/fa";
import { studentsAPI } from "@/lib/api";

/**
 * Exam Security Component
 * - Detects and reports tab switching
 * - Detects fullscreen exit
 * - Shows warning overlay
 * - Reports violations to backend
 */
export default function ExamSecurity({ examId, onViolationLimit = () => { } }) {
    // SECURITY MUTED FOR DEVELOPMENT
    return null;

    const [violations, setViolations] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningType, setWarningType] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const MAX_VIOLATIONS = 3;

    // Report violation to backend
    const reportViolation = useCallback(async (type) => {
        try {
            if (examId) {
                await studentsAPI.reportViolation(examId, type);
            }
        } catch (err) {
            console.error("Failed to report violation:", err);
        }
    }, [examId]);

    // Handle visibility change (tab switch)
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            setViolations(prev => {
                const newCount = prev + 1;
                if (newCount >= MAX_VIOLATIONS) {
                    onViolationLimit();
                }
                return newCount;
            });
            setWarningType("tab-switch");
            setShowWarning(true);
            reportViolation("tab-switch");
        }
    }, [reportViolation, onViolationLimit]);

    // Handle fullscreen change
    const handleFullscreenChange = useCallback(() => {
        const isNowFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isNowFullscreen);

        if (!isNowFullscreen && violations > 0) {
            setViolations(prev => {
                const newCount = prev + 1;
                if (newCount >= MAX_VIOLATIONS) {
                    onViolationLimit();
                }
                return newCount;
            });
            setWarningType("fullscreen-exit");
            setShowWarning(true);
            reportViolation("fullscreen-exit");
        }
    }, [violations, reportViolation, onViolationLimit]);

    // Detect right-click
    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        setWarningType("right-click");
        setShowWarning(true);
    }, []);

    // Detect copy/cut/paste
    const handleCopyPaste = useCallback((e) => {
        e.preventDefault();
        setWarningType("copy-paste");
        setShowWarning(true);
    }, []);

    // Detect keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+Tab, Alt+Tab, etc.)
    const handleKeyDown = useCallback((e) => {
        // Block Ctrl+C, Ctrl+V, Ctrl+X
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
            e.preventDefault();
            setWarningType("keyboard-shortcut");
            setShowWarning(true);
        }
        // Block Ctrl+Tab
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
        }
        // Block Alt+Tab (limited browser support)
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
        }
        // Block F12 (Dev Tools)
        if (e.key === 'F12') {
            e.preventDefault();
            setViolations(prev => prev + 1);
            setWarningType("dev-tools");
            setShowWarning(true);
            reportViolation("dev-tools");
        }
    }, [reportViolation]);

    // Request fullscreen on mount
    const requestFullscreen = useCallback(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.log("Fullscreen request failed:", err);
            });
        }
    }, []);

    // Setup event listeners
    useEffect(() => {
        // Add event listeners
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("cut", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);
        document.addEventListener("keydown", handleKeyDown);

        // Request fullscreen after a short delay
        const timer = setTimeout(() => {
            requestFullscreen();
        }, 1000);

        // Cleanup
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("cut", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
            document.removeEventListener("keydown", handleKeyDown);
            clearTimeout(timer);
        };
    }, [handleVisibilityChange, handleFullscreenChange, handleContextMenu, handleCopyPaste, handleKeyDown, requestFullscreen]);

    // Warning messages
    const getWarningMessage = () => {
        switch (warningType) {
            case "tab-switch":
                return {
                    title: "⚠️ Tab Switch Detected!",
                    message: "You left the exam window. This has been recorded as a violation.",
                    icon: <FaEyeSlash className="text-4xl" />
                };
            case "fullscreen-exit":
                return {
                    title: "⚠️ Fullscreen Exited!",
                    message: "You exited fullscreen mode. Please stay in fullscreen during the exam.",
                    icon: <FaExclamationTriangle className="text-4xl" />
                };
            case "right-click":
                return {
                    title: "🚫 Right-Click Disabled",
                    message: "Right-clicking is not allowed during the exam.",
                    icon: <FaShieldAlt className="text-4xl" />
                };
            case "copy-paste":
                return {
                    title: "🚫 Copy/Paste Disabled",
                    message: "Copy, cut, and paste are not allowed during the exam.",
                    icon: <FaShieldAlt className="text-4xl" />
                };
            case "keyboard-shortcut":
                return {
                    title: "🚫 Shortcuts Blocked",
                    message: "Keyboard shortcuts are disabled during the exam.",
                    icon: <FaShieldAlt className="text-4xl" />
                };
            case "dev-tools":
                return {
                    title: "⚠️ Developer Tools Detected!",
                    message: "Opening developer tools is a serious violation.",
                    icon: <FaExclamationTriangle className="text-4xl" />
                };
            default:
                return {
                    title: "⚠️ Warning",
                    message: "Please follow exam rules.",
                    icon: <FaExclamationTriangle className="text-4xl" />
                };
        }
    };

    const warning = getWarningMessage();

    return (
        <>
            {/* Violation Counter (Always Visible) */}
            {violations > 0 && (
                <div className="fixed top-4 right-4 z-[9999] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <FaExclamationTriangle />
                    <span className="font-bold">Violations: {violations}/{MAX_VIOLATIONS}</span>
                </div>
            )}

            {/* Warning Overlay */}
            {showWarning && (
                <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-pulse">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                            {warning.icon}
                        </div>

                        <h2 className="text-2xl font-bold text-red-600 mb-3">
                            {warning.title}
                        </h2>

                        <p className="text-gray-600 mb-4">
                            {warning.message}
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-700 font-semibold">
                                Violation Count: {violations} of {MAX_VIOLATIONS}
                            </p>
                            <p className="text-red-600 text-sm mt-1">
                                {violations >= MAX_VIOLATIONS
                                    ? "Maximum violations reached. Your exam may be terminated."
                                    : `${MAX_VIOLATIONS - violations} more violation(s) will result in exam termination.`
                                }
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setShowWarning(false);
                                requestFullscreen();
                            }}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaTimes />
                            Acknowledge & Continue
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
