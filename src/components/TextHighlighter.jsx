"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FaHighlighter, FaEraser, FaStickyNote, FaTimes } from "react-icons/fa";

/**
 * TextHighlighter Component
 * Allows users to highlight text in yellow and add notes
 * Persists highlights across page navigation
 */
export default function TextHighlighter({ children, passageId = "default" }) {
    const containerRef = useRef(null);
    const [highlights, setHighlights] = useState([]);
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState("");
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [noteText, setNoteText] = useState("");

    // Hover state for showing remove button
    const [hoveredHighlightId, setHoveredHighlightId] = useState(null);
    const [hoverPopupPosition, setHoverPopupPosition] = useState({ x: 0, y: 0 });
    const [hoveredHighlightData, setHoveredHighlightData] = useState(null);

    // Reset highlights when passageId changes (navigating to different passage)
    useEffect(() => {
        setHighlights([]);
    }, [passageId]);

    // Handle text selection
    const handleMouseUp = useCallback((e) => {
        if (e.target.closest('.highlight-toolbar') || e.target.closest('.hover-popup')) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            setShowToolbar(false);
            setShowNoteInput(false);
            return;
        }

        // Get the raw text content (strips any HTML tags like <mark>)
        const text = selection.toString().trim();

        if (text && text.length > 0) {
            // Create a temporary range to get proper bounding rect
            const range = selection.getRangeAt(0);

            // Clone the range to avoid modifying the original selection
            const clonedRange = range.cloneRange();

            // Get bounding rect from the cloned range
            const rect = clonedRange.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();

            if (containerRect && rect.width > 0 && rect.height > 0) {
                setToolbarPosition({
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.bottom - containerRect.top + 8,
                });
                setSelectedText(text);
                setShowToolbar(true);
            } else {
                setShowToolbar(false);
                setShowNoteInput(false);
            }
        } else {
            setShowToolbar(false);
            setShowNoteInput(false);
        }
    }, []);


    // Hide toolbar when clicking outside
    const handleMouseDown = useCallback((e) => {
        if (!e.target.closest('.highlight-toolbar') && !e.target.closest('.hover-popup')) {
            setTimeout(() => {
                const selection = window.getSelection();
                if (!selection?.toString().trim()) {
                    setShowToolbar(false);
                    setShowNoteInput(false);
                }
            }, 100);
        }
    }, []);

    // Add highlight
    const handleHighlight = useCallback((withNote = false) => {
        if (!selectedText) return;

        const newHighlight = {
            id: Date.now().toString(),
            text: selectedText,
            color: "#FFFF00",
            note: withNote ? noteText.trim() : "",
            createdAt: new Date().toISOString(),
        };

        setHighlights((prev) => [...prev, newHighlight]);
        setShowToolbar(false);
        setShowNoteInput(false);
        setNoteText("");
        setSelectedText("");
        window.getSelection()?.removeAllRanges();
    }, [selectedText, noteText]);

    // Remove highlight for selected text
    const handleRemoveHighlight = useCallback(() => {
        if (!selectedText) return;

        setHighlights((prev) => prev.filter((h) => h.text !== selectedText));
        setShowToolbar(false);
        window.getSelection()?.removeAllRanges();
        setSelectedText("");
    }, [selectedText]);

    // Remove highlight by ID (from hover popup)
    const handleRemoveHighlightById = useCallback((highlightId) => {
        setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
        setHoveredHighlightId(null);
        setHoveredHighlightData(null);
    }, []);

    // Handle note action
    const handleAddNote = useCallback(() => {
        setShowNoteInput(true);
    }, []);

    // Save note and highlight
    const handleSaveNote = useCallback(() => {
        handleHighlight(true);
    }, [handleHighlight]);

    // Apply highlights to a single text string - returns React elements instead of HTML
    const applyHighlightsToText = useCallback((text, baseKey = 0) => {
        if (!text || typeof text !== 'string' || highlights.length === 0) return null;

        // Build an array of highlight ranges first
        const ranges = [];

        // Sort highlights by text length (longest first) to prioritize longer matches
        const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);

        // Track which character positions are already highlighted
        const highlightedPositions = new Set();

        sortedHighlights.forEach((highlight) => {
            // Find all occurrences of this highlight text
            let searchIndex = 0;
            while (searchIndex < text.length) {
                const foundIndex = text.indexOf(highlight.text, searchIndex);
                if (foundIndex === -1) break;

                const endIndex = foundIndex + highlight.text.length;

                // Check if any part of this range is already highlighted
                let alreadyHighlighted = false;
                for (let i = foundIndex; i < endIndex; i++) {
                    if (highlightedPositions.has(i)) {
                        alreadyHighlighted = true;
                        break;
                    }
                }

                if (!alreadyHighlighted) {
                    // Mark positions as highlighted
                    for (let i = foundIndex; i < endIndex; i++) {
                        highlightedPositions.add(i);
                    }
                    ranges.push({
                        start: foundIndex,
                        end: endIndex,
                        highlight: highlight
                    });
                }

                searchIndex = foundIndex + 1;
            }
        });

        if (ranges.length === 0) return null;

        // Sort ranges by start position
        ranges.sort((a, b) => a.start - b.start);

        // Build React elements array
        const elements = [];
        let lastEnd = 0;

        ranges.forEach((range, idx) => {
            // Add non-highlighted text before this range
            if (range.start > lastEnd) {
                elements.push(text.substring(lastEnd, range.start));
            }
            // Add highlighted text as a span element
            const highlightedText = text.substring(range.start, range.end);
            elements.push(
                <span
                    key={`hl-${baseKey}-${idx}`}
                    data-id={range.highlight.id}
                    data-note={encodeURIComponent(range.highlight.note || '')}
                    className="text-highlight"
                >
                    {highlightedText}
                </span>
            );
            lastEnd = range.end;
        });

        // Add any remaining text after the last highlight
        if (lastEnd < text.length) {
            elements.push(text.substring(lastEnd));
        }

        return elements;
    }, [highlights]);


    // Helper function to escape HTML entities
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };


    // Handle hover on highlights to show remove button
    const handleContentMouseOver = useCallback((e) => {
        const mark = e.target.closest('.text-highlight');
        if (mark && !showToolbar) {
            const highlightId = mark.dataset.id;
            const note = decodeURIComponent(mark.dataset.note || '');
            const highlight = highlights.find(h => h.id === highlightId);

            if (highlight) {
                const rect = mark.getBoundingClientRect();
                const containerRect = containerRef.current?.getBoundingClientRect();

                if (containerRect) {
                    setHoverPopupPosition({
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top - 8,
                    });
                    setHoveredHighlightId(highlightId);
                    setHoveredHighlightData({ ...highlight, note });
                }
            }
        }
    }, [highlights, showToolbar]);

    const handleContentMouseOut = useCallback((e) => {
        const relatedTarget = e.relatedTarget;
        // Don't hide if moving to the popup itself
        if (relatedTarget?.closest('.hover-popup')) return;

        if (e.target.closest('.text-highlight')) {
            // Small delay to allow moving to popup
            setTimeout(() => {
                const popup = document.querySelector('.hover-popup:hover');
                if (!popup) {
                    setHoveredHighlightId(null);
                    setHoveredHighlightData(null);
                }
            }, 100);
        }
    }, []);

    // Render children with highlights applied - uses React elements instead of dangerouslySetInnerHTML
    const renderChildrenWithHighlights = useMemo(() => {
        if (!children || highlights.length === 0) return children;

        let keyCounter = 0;

        const processNode = (node, key = 0) => {
            // Handle string nodes
            if (typeof node === 'string') {
                const processed = applyHighlightsToText(node, keyCounter++);
                if (processed) {
                    return <React.Fragment key={key}>{processed}</React.Fragment>;
                }
                return node;
            }

            // Handle React elements
            if (React.isValidElement(node)) {
                const nodeChildren = node.props.children;

                // If children is a simple string, process it
                if (typeof nodeChildren === 'string') {
                    const processed = applyHighlightsToText(nodeChildren, keyCounter++);
                    if (processed) {
                        return React.cloneElement(node, { key }, processed);
                    }
                    return node;
                }

                // If children is array, process each child
                if (Array.isArray(nodeChildren)) {
                    const processedChildren = nodeChildren.map((child, idx) => processNode(child, idx));
                    return React.cloneElement(node, { key }, processedChildren);
                }

                // If children is a single element, process it
                if (nodeChildren) {
                    const processedChild = processNode(nodeChildren, 0);
                    return React.cloneElement(node, { key }, processedChild);
                }

                return node;
            }

            // Handle arrays
            if (Array.isArray(node)) {
                return node.map((child, idx) => processNode(child, idx));
            }

            return node;
        };

        return processNode(children);
    }, [children, highlights, applyHighlightsToText]);


    return (
        <div
            ref={containerRef}
            className="relative text-highlighter-container"
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseOver={handleContentMouseOver}
            onMouseOut={handleContentMouseOut}
        >
            {renderChildrenWithHighlights}

            {/* Hover Popup with Remove Button - Shows when hovering on highlighted text */}
            {hoveredHighlightId && hoveredHighlightData && !showToolbar && (
                <div
                    className="hover-popup absolute z-50 bg-gray-800 rounded-lg shadow-xl p-1.5 border border-gray-700"
                    style={{
                        left: `${hoverPopupPosition.x}px`,
                        top: `${hoverPopupPosition.y}px`,
                        transform: "translate(-50%, -100%)",
                    }}
                    onMouseLeave={() => {
                        setHoveredHighlightId(null);
                        setHoveredHighlightData(null);
                    }}
                >
                    <div className="flex items-center gap-1">
                        {/* Remove/Deselect Button */}
                        <button
                            onClick={() => handleRemoveHighlightById(hoveredHighlightId)}
                            className="flex items-center gap-1.5 px-2 py-1 text-white text-xs hover:bg-red-500 rounded transition-colors"
                            title="Remove Highlight"
                        >
                            <FaEraser size={11} />
                            <span>Remove</span>
                        </button>

                        {/* Show note if exists */}
                        {hoveredHighlightData.note && (
                            <div className="flex items-center gap-1 px-2 py-1 text-gray-300 text-xs border-l border-gray-600">
                                <FaStickyNote className="text-yellow-400" size={10} />
                                <span className="max-w-[120px] truncate">{hoveredHighlightData.note}</span>
                            </div>
                        )}
                    </div>

                    {/* Arrow pointing down */}
                    <div
                        className="absolute w-2 h-2 bg-gray-800 border-r border-b border-gray-700 transform rotate-45"
                        style={{
                            bottom: "-5px",
                            left: "50%",
                            marginLeft: "-4px",
                        }}
                    />
                </div>
            )}

            {/* Floating Toolbar - Shows when selecting text */}
            {showToolbar && (
                <div
                    className="highlight-toolbar absolute z-50 flex items-center gap-1 bg-gray-800 rounded-lg shadow-xl p-1.5 border border-gray-700"
                    style={{
                        left: `${toolbarPosition.x}px`,
                        top: `${toolbarPosition.y}px`,
                        transform: "translateX(-50%)",
                    }}
                >
                    {!showNoteInput ? (
                        <>
                            <button
                                onClick={() => handleHighlight(false)}
                                className="flex items-center justify-center w-8 h-8 rounded hover:brightness-90 transition-all"
                                title="Highlight"
                                style={{ backgroundColor: "#FFFF00" }}
                            >
                                <FaHighlighter className="text-gray-800 text-sm" />
                            </button>

                            <button
                                onClick={handleRemoveHighlight}
                                className="flex items-center justify-center w-8 h-8 rounded bg-gray-700 hover:bg-red-500 transition-colors"
                                title="Remove Highlight"
                            >
                                <FaEraser className="text-white text-sm" />
                            </button>

                            <button
                                onClick={handleAddNote}
                                className="flex items-center justify-center w-8 h-8 rounded bg-gray-700 hover:bg-blue-500 transition-colors"
                                title="Add Note"
                            >
                                <FaStickyNote className="text-white text-sm" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 p-1">
                            <input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add a note..."
                                className="px-2 py-1 text-sm rounded border-none outline-none bg-gray-700 text-white placeholder-gray-400 w-40"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveNote();
                                    if (e.key === "Escape") {
                                        setShowNoteInput(false);
                                        setNoteText("");
                                    }
                                }}
                            />
                            <button
                                onClick={handleSaveNote}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setShowNoteInput(false);
                                    setNoteText("");
                                }}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    )}

                    <div
                        className="absolute w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"
                        style={{
                            top: "-7px",
                            left: "50%",
                            marginLeft: "-6px",
                        }}
                    />
                </div>
            )}

            <style jsx global>{`
                .text-highlight {
                    background-color: #FFFF00 !important;
                    padding: 1px 2px;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .text-highlight:hover {
                    background-color: #FFD700 !important;
                }
                .text-highlighter-container {
                    user-select: text;
                    -webkit-user-select: text;
                    -moz-user-select: text;
                    -ms-user-select: text;
                }
            `}</style>
        </div>
    );
}
