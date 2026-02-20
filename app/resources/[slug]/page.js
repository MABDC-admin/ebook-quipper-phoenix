'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const FileViewer = dynamic(() => import('../../components/FileViewer'), { ssr: false });

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// Multiple thumbnail URL strategies for maximum coverage
const getThumbnailUrls = (fileId) => [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
    `https://lh3.googleusercontent.com/d/${fileId}=w400`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=s400`,
];

const BRAND_CONFIG = {
    quipper: {
        accent: '#10b981',
        lightBg: 'bg-emerald-50',
        borderActive: 'border-emerald-200',
        textAccent: 'text-emerald-600',
        pillBg: 'bg-emerald-50 text-emerald-600',
        headerGradient: 'from-emerald-500 to-green-600',
    },
    phoenix: {
        accent: '#f97316',
        lightBg: 'bg-orange-50',
        borderActive: 'border-orange-200',
        textAccent: 'text-orange-600',
        pillBg: 'bg-orange-50 text-orange-600',
        headerGradient: 'from-orange-500 to-red-500',
    },
};

// Thumbnail component with cascading fallback
function BookThumbnail({ file, icon }) {
    const [srcIndex, setSrcIndex] = useState(0);
    const [failed, setFailed] = useState(false);
    const urls = getThumbnailUrls(file.id);

    // Also include the Drive API thumbnailLink if available
    const allUrls = [...urls];
    if (file.thumbnailLink) {
        allUrls.push(file.thumbnailLink.replace('=s220', '=s400'));
    }

    const handleError = () => {
        if (srcIndex < allUrls.length - 1) {
            setSrcIndex(srcIndex + 1);
        } else {
            setFailed(true);
        }
    };

    if (failed) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <span className="text-5xl opacity-40">{icon}</span>
            </div>
        );
    }

    return (
        <img
            src={allUrls[srcIndex]}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleError}
            loading="lazy"
            referrerPolicy="no-referrer"
        />
    );
}

export default function ResourcePage() {
    const { slug } = useParams();
    const { data: session } = useSession();
    const [resource, setResource] = useState(null);
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [currentFolderName, setCurrentFolderName] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    const [gradeFilter, setGradeFilter] = useState('all');

    const brand = BRAND_CONFIG[slug] || BRAND_CONFIG.quipper;

    const loadFolders = async (parentId) => {
        setLoading(true);
        try {
            const res = await fetch(
                `${DRIVE_API_URL}?key=${API_KEY}&q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name,mimeType)&orderBy=name&pageSize=200`
            );
            const data = await res.json();
            setFolders(data.files || []);
        } catch (err) {
            console.error('Failed:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetch(`/api/resources/${slug}`)
            .then(r => r.json())
            .then(data => {
                setResource(data.resource);
                if (data.resource?.driveFolderId) loadFolders(data.resource.driveFolderId);
            })
            .catch(() => setLoading(false));
    }, [slug]);

    const loadFiles = async (folderId, folderName) => {
        setLoadingFiles(true);
        setCurrentFolder(folderId);
        setCurrentFolderName(folderName);
        try {
            const res = await fetch(
                `${DRIVE_API_URL}?key=${API_KEY}&q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webContentLink,thumbnailLink,webViewLink,size)&orderBy=name&pageSize=200`
            );
            const data = await res.json();
            // User requested to remove all PNGs and only retain PDF and PPTX/PPT
            const filteredFiles = (data.files || []).filter(file => {
                const mime = file.mimeType;
                return mime === 'application/pdf' ||
                    mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                    mime === 'application/vnd.ms-powerpoint';
            });
            setFiles(filteredFiles);
        } catch (err) {
            console.error('Failed:', err);
        }
        setLoadingFiles(false);
    };

    // Extract grade number from folder name
    // Tries "Grade N" first, then falls back to first standalone number 1-12
    const extractGradeNum = (name) => {
        // Pattern 1: explicit "Grade N"
        const gradeMatch = name.match(/grade\s*(\d+)/i);
        if (gradeMatch) return parseInt(gradeMatch[1]);
        // Pattern 2: first number 1-12 after a space (catches "English 5", "MAPEH 5", "Filipino 8")
        const numMatch = name.match(/(?:^|\s)(\d{1,2})(?:\s|$|[^0-9])/);
        if (numMatch) {
            const n = parseInt(numMatch[1]);
            if (n >= 1 && n <= 12) return n;
        }
        return null;
    };

    // Build filter pill labels: group numeric grades, keep non-numeric as-is
    const visibleFolders = folders.filter(f => f.name.toLowerCase() !== 'phoenix' && f.name.toLowerCase() !== 'quipper');

    const gradeNumbers = [...new Set(visibleFolders.map(f => extractGradeNum(f.name)).filter(n => n !== null))].sort((a, b) => a - b);
    const nonGradeFolders = visibleFolders.filter(f => extractGradeNum(f.name) === null);
    const filterLabels = [
        ...gradeNumbers.map(g => ({ key: `grade-${g}`, label: `Grade ${g}`, type: 'grade', value: g })),
        ...nonGradeFolders.map(f => ({ key: f.id, label: f.name, type: 'folder', folder: f })),
    ];

    // Sort all folders for display
    const sortedFolders = [...visibleFolders].sort((a, b) => {
        const ga = extractGradeNum(a.name) ?? 1000;
        const gb = extractGradeNum(b.name) ?? 1000;
        if (ga !== gb) return ga - gb;
        return a.name.localeCompare(b.name);
    });

    // Apply filter
    const filteredFolders = gradeFilter === 'all'
        ? sortedFolders
        : gradeFilter.startsWith('grade-')
            ? sortedFolders.filter(f => extractGradeNum(f.name) === parseInt(gradeFilter.replace('grade-', '')))
            : sortedFolders.filter(f => f.name === gradeFilter);

    const getFileIcon = (mimeType) => {
        if (mimeType === 'application/pdf') return '📕';
        if (mimeType?.includes('document')) return '📄';
        if (mimeType?.includes('spreadsheet')) return '📊';
        if (mimeType?.includes('presentation')) return '📽️';
        if (mimeType?.includes('image')) return '🖼️';
        if (mimeType?.includes('video')) return '🎬';
        return '📎';
    };

    const getFileTypeLabel = (mimeType) => {
        if (mimeType === 'application/pdf') return 'PDF';
        if (mimeType?.includes('document')) return 'DOC';
        if (mimeType?.includes('spreadsheet')) return 'SHEET';
        if (mimeType?.includes('presentation')) return 'SLIDES';
        if (mimeType?.includes('image')) return 'IMG';
        return 'FILE';
    };

    const handleNextFile = () => {
        if (!viewingFile || files.length <= 1) return;
        const currentIndex = files.findIndex(f => f.id === viewingFile.id);
        const nextIndex = (currentIndex + 1) % files.length;
        setViewingFile(files[nextIndex]);
    };

    const handlePrevFile = () => {
        if (!viewingFile || files.length <= 1) return;
        const currentIndex = files.findIndex(f => f.id === viewingFile.id);
        const prevIndex = (currentIndex - 1 + files.length) % files.length;
        setViewingFile(files[prevIndex]);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${brand.headerGradient} shadow-md`}>
                    <span className="text-3xl">{resource?.icon || '📚'}</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800">{resource?.name || 'Loading...'}</h1>
                    <p className="text-slate-400 text-sm">{resource?.description}</p>
                </div>
            </div>

            {/* Breadcrumb + Filter */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {currentFolder && (
                    <button
                        onClick={() => { setCurrentFolder(null); setCurrentFolderName(''); setFiles([]); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back
                    </button>
                )}
                {currentFolderName && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${brand.pillBg}`}>
                        📁 {currentFolderName}
                    </span>
                )}

                {(filterLabels.length > 0 && slug !== 'phoenix') && (
                    <>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Level:</span>
                        <button onClick={() => { setGradeFilter('all'); setCurrentFolder(null); setCurrentFolderName(''); setFiles([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-90 ${gradeFilter === 'all' && !currentFolder ? `${brand.pillBg} border ${brand.borderActive}` : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'}`}>
                            All
                        </button>
                        {filterLabels.map(item => (
                            <button key={item.key} onClick={() => {
                                if (item.type === 'grade') {
                                    // Numeric grade — filter folder grid
                                    setGradeFilter(`grade-${item.value}`);
                                    setCurrentFolder(null); setCurrentFolderName(''); setFiles([]);
                                } else {
                                    // Non-numeric folder — open files directly
                                    setGradeFilter(item.folder.name);
                                    loadFiles(item.folder.id, item.folder.name);
                                }
                            }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-90 ${(item.type === 'grade' && gradeFilter === `grade-${item.value}`) ||
                                    (item.type === 'folder' && gradeFilter === item.folder.name)
                                    ? `${brand.pillBg} border ${brand.borderActive}`
                                    : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'
                                    }`}>
                                {item.label}
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* Loading */}
            {(loading || loadingFiles) && (
                <div className="flex items-center justify-center py-20">
                    <div className="h-10 w-10 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            )}

            {/* Folder Grid */}
            {!loading && !currentFolder && (
                <div className={`grid gap-4 ${slug === 'phoenix' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                    {filteredFolders.map((folder) => (
                        <button key={folder.id} onClick={() => loadFiles(folder.id, folder.name)}
                            className={`group text-left p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-300 shadow-sm active:scale-[0.97]`}>
                            <div className="text-3xl mb-3">📁</div>
                            <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 leading-tight line-clamp-2">{folder.name}</h3>
                        </button>
                    ))}
                </div>
            )}

            {/* File Grid — Bookshelf with enforced first-page thumbnails */}
            {!loadingFiles && currentFolder && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {files.map((file) => (
                        <button
                            key={file.id}
                            onClick={() => setViewingFile(file)}
                            className="group text-left rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-xl transition-all duration-300 shadow-sm active:scale-[0.97]"
                        >
                            {/* Book Cover — Enforced first-page thumbnail */}
                            <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                                <BookThumbnail file={file} icon={getFileIcon(file.mimeType)} />

                                {/* File type badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm bg-white/90 ${brand.textAccent}`}>
                                        {getFileTypeLabel(file.mimeType)}
                                    </span>
                                </div>
                            </div>

                            {/* File Info */}
                            <div className="p-3">
                                <h3 className="text-xs font-bold text-slate-600 group-hover:text-slate-800 leading-tight line-clamp-2">
                                    {file.name}
                                </h3>
                            </div>
                        </button>
                    ))}
                    {files.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-300">
                            <span className="text-5xl block mb-4">📭</span>
                            <p className="font-bold">No files in this folder</p>
                        </div>
                    )}
                </div>
            )}

            {viewingFile && (
                <FileViewer
                    file={viewingFile}
                    onClose={() => setViewingFile(null)}
                    onNext={handleNextFile}
                    onPrev={handlePrevFile}
                    hasNext={files.length > 1}
                    hasPrev={files.length > 1}
                />
            )}
        </div>
    );
}
