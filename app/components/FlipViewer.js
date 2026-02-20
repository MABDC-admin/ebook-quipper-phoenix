'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const Page = React.forwardRef((props, ref) => {
    return (
        <div className="bg-white shadow-2xl relative overflow-hidden" ref={ref} data-density="hard">
            <div className="w-full h-full flex flex-col">
                {props.children}
                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300">
                    {props.number}
                </div>
            </div>
        </div>
    );
});

Page.displayName = 'Page';

export default function FlipViewer({ file, onClose }) {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const flipBookRef = useRef(null);

    const loadPdf = useCallback(async () => {
        try {
            const pdfUrl = `/api/pdf/${file.id}`;
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            setPageCount(pdf.numPages);

            const pageImages = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 }); // High res
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                pageImages.push(canvas.toDataURL('image/webp', 0.8));
            }
            setPages(pageImages);
        } catch (error) {
            console.error('Error loading PDF for FlipBook:', error);
        }
        setLoading(false);
    }, [file.id]);

    useEffect(() => {
        // eslint-disable-next-line
        loadPdf();
    }, [loadPdf]);

    const onPage = (e) => {
        setCurrentPage(e.data);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10">
                <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-white font-black text-xs uppercase tracking-[0.3em] animate-pulse">Preparing FlipBook...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 md:p-10 select-none overflow-auto dark-viewer-scrollbar">
            {/* FlipBook Container */}
            <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden flex items-center justify-center max-w-full">
                <HTMLFlipBook
                    width={550}
                    height={733}
                    size="stretch"
                    minWidth={315}
                    maxWidth={1000}
                    minHeight={420}
                    maxHeight={1350}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    onFlip={onPage}
                    className="demo-book"
                    ref={flipBookRef}
                >
                    {pages.map((image, index) => (
                        <Page key={index} number={index + 1}>
                            <img src={image} alt={`Page ${index + 1}`} className="w-full h-full object-contain pointer-events-none" />
                        </Page>
                    ))}
                </HTMLFlipBook>
            </div>

            {/* Controls Overlay */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900/80 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                <button
                    onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 border border-white/5"
                >
                    ◀
                </button>
                <div className="text-white font-black text-xs uppercase tracking-widest min-w-[120px] text-center">
                    Page <span className="text-indigo-400">{currentPage + 1}</span> of {pageCount}
                </div>
                <button
                    onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 border border-white/5"
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
