import { useState, useRef, useEffect, useCallback } from 'react';

export default function FileViewer({ file, onClose, onNext, onPrev, hasNext, hasPrev }) {
    const isPDF = file?.mimeType === 'application/pdf';
    const isImage = file?.mimeType?.startsWith('image/');

    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [penColor, setPenColor] = useState('#ef4444');
    const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
    const [lineWidth, setLineWidth] = useState(3);
    const [toolbarPos, setToolbarPos] = useState({ x: 100, y: 100 });
    const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const toolbarRef = useRef(null);

    if (!file) return null;

    // Auto-fullscreen on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.requestFullscreen().catch(() => {
                // Ignore errors if browser blocks auto-FS
            });
            setIsFullScreen(true);
        }
    }, []);

    // Fullscreen Toggle
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    const clearAnnotations = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, []);

    useEffect(() => {
        const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Clear annotations when file changes
    useEffect(() => {
        if (isAnnotating) clearAnnotations();
    }, [file?.id, isAnnotating, clearAnnotations]);

    // Annotation Logic (Canvas)
    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.scrollHeight;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    useEffect(() => {
        if (isAnnotating) {
            setTimeout(initCanvas, 100);
        }
    }, [isAnnotating, iframeLoaded]);

    const startDrawing = (e) => {
        if (!isAnnotating) return;
        isDrawingRef.current = true;
        const rect = canvasRef.current.getBoundingClientRect();
        const ctx = canvasRef.current.getContext('2d');

        ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
        ctx.strokeStyle = penColor;
        ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

        ctx.beginPath();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + canvasRef.current.parentElement.scrollTop;
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawingRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const ctx = canvasRef.current.getContext('2d');
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + canvasRef.current.parentElement.scrollTop;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
    };

    // Dragging Logic for Toolbar
    const handleDragStart = (e) => {
        const rect = toolbarRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        setIsDraggingToolbar(true);
    };

    useEffect(() => {
        const handleDragMove = (e) => {
            if (!isDraggingToolbar) return;

            const x = e.clientX - dragOffset.current.x;
            const y = e.clientY - dragOffset.current.y;

            // Constrain to viewport (basic)
            const maxX = window.innerWidth - 300;
            const maxY = window.innerHeight - 100;

            setToolbarPos({
                x: Math.max(0, Math.min(x, maxX)),
                y: Math.max(0, Math.min(y, maxY))
            });
        };

        const handleDragEnd = () => {
            setIsDraggingToolbar(false);
        };

        if (isDraggingToolbar) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDraggingToolbar]);

    return (
        <div dir="ltr" className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 backdrop-blur-md">
            <div className="absolute inset-0 bg-slate-950/80" onClick={onClose} />

            <div
                ref={containerRef}
                dir="ltr"
                className={`relative w-full bg-slate-900 overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${isFullScreen ? 'h-screen max-w-none rounded-none' : 'h-[98vh] max-w-[99vw] rounded-3xl border border-white/10'}`}
            >
                {/* Immersive Glass Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-2xl sticky top-0 z-30 shadow-2xl shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/10">
                            {isPDF ? '📕' : '🖼️'}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-white truncate tracking-tight">{file.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isAnnotating ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-500'}`} />
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                    {isAnnotating ? `ANNOTATING: ${tool}` : 'Google Drive Reader'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File Navigation */}
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
                        <button
                            onClick={onPrev}
                            disabled={!hasPrev}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 ${hasPrev ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                            title="Previous File"
                        >
                            ◀
                        </button>
                        <div className="px-4 text-[10px] font-black text-white uppercase tracking-tighter select-none">
                            File Navigation
                        </div>
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 ${hasNext ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                            title="Next File"
                        >
                            ▶
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAnnotating(!isAnnotating)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isAnnotating ? 'bg-emerald-500 text-white shadow-lg scale-110' : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'}`}
                            title="Annotation Tools"
                        >
                            ✏️
                        </button>

                        <button onClick={toggleFullScreen} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all shadow-sm active:scale-90" title="Full Screen">
                            {isFullScreen ? '↙️' : '↗️'}
                        </button>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all shadow-sm active:scale-90" title="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className={`flex-1 overflow-hidden relative bg-slate-900 ${isAnnotating ? 'cursor-crosshair' : ''}`}>
                    {!iframeLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-900">
                            <div className="h-10 w-10 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin mb-4" />
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Connecting to Drive...</p>
                        </div>
                    )}

                    {/* Annotation Canvas Overlay */}
                    {isAnnotating && (
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className="absolute inset-0 z-20 block pointer-events-auto"
                        />
                    )}

                    <iframe
                        src={`https://drive.google.com/file/d/${file.id}/preview`}
                        className="w-full h-full border-none bg-white relative z-10"
                        title={file.name}
                        allow="autoplay"
                        onLoad={() => setIframeLoaded(true)}
                    />

                    {/* Floating Draggable Toolbar */}
                    {isAnnotating && (
                        <div
                            ref={toolbarRef}
                            style={{
                                left: `${toolbarPos.x}px`,
                                top: `${toolbarPos.y}px`,
                            }}
                            className={`fixed z-50 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-3 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-shadow ${isDraggingToolbar ? 'shadow-2xl scale-105 cursor-grabbing' : 'cursor-default'}`}
                        >
                            {/* Drag Handle */}
                            <div
                                onMouseDown={handleDragStart}
                                className="w-full h-6 mb-1 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-lg transition-colors group"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <div className="w-8 h-0.5 bg-white/20 group-hover:bg-white/40 rounded-full" />
                                    <div className="w-8 h-0.5 bg-white/20 group-hover:bg-white/40 rounded-full" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTool('pen')}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${tool === 'pen' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        title="Pen"
                                    >
                                        🖌️
                                    </button>
                                    <button
                                        onClick={() => setTool('eraser')}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${tool === 'eraser' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        title="Eraser"
                                    >
                                        🧽
                                    </button>
                                </div>

                                <div className="h-px bg-white/10 mx-1" />

                                <div className="flex flex-col gap-2">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">Thickness</p>
                                    <div className="flex justify-between gap-1">
                                        {[2, 5, 8].map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setLineWidth(size)}
                                                className={`flex-1 h-8 flex items-center justify-center rounded-lg text-[9px] font-black transition-all ${lineWidth === size ? 'bg-white text-indigo-900 shadow-md' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {size === 2 ? 'S' : size === 5 ? 'M' : 'L'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 mx-1" />

                                <div className="flex flex-col gap-2">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">Color</p>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ffffff', '#000000'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setPenColor(color)}
                                                className={`w-7 h-7 rounded-full border border-white/10 transition-all ${penColor === color ? 'scale-110 border-white shadow-lg' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <div className="relative h-8 rounded-lg border border-white/5 overflow-hidden shadow-inner cursor-pointer mt-1">
                                        <input
                                            type="color"
                                            value={penColor}
                                            onChange={(e) => setPenColor(e.target.value)}
                                            className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer"
                                            title="Custom Color"
                                        />
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[8px] font-black text-white mix-blend-difference uppercase">
                                            Custom
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 mx-1" />

                                <button
                                    onClick={clearAnnotations}
                                    className="w-full py-2 rounded-xl flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest active:scale-95"
                                >
                                    <span>🗑️</span>
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Immersive Footer */}
                {!isFullScreen && (
                    <div className="px-6 py-4 border-t border-white/5 bg-slate-900/60 backdrop-blur-2xl flex justify-between items-center z-30 shadow-2xl shrink-0">
                        <div className="flex items-center gap-4">
                            {file.webContentLink && (
                                <a href={file.webContentLink} target="_blank" rel="noreferrer"
                                    className="px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center gap-3 shadow-lg active:scale-95 group">
                                    <span>📥</span>
                                    Download
                                </a>
                            )}
                        </div>
                        <button onClick={onClose} className="px-10 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-950/40 active:scale-95">
                            Close Reading
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
