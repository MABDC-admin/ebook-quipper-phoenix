'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Brand configs for each resource
const BRAND_CONFIG = {
    quipper: {
        gradient: 'from-green-500 to-emerald-600',
        lightBg: 'bg-emerald-50',
        accent: '#10b981',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        hoverShadow: 'hover:shadow-emerald-100',
        icon: '📚',
        tagline: 'Interactive Learning Platform',
        pattern: 'radial-gradient(circle at 90% 10%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(5,150,105,0.06) 0%, transparent 50%)',
    },
    phoenix: {
        gradient: 'from-orange-500 to-red-500',
        lightBg: 'bg-orange-50',
        accent: '#f97316',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        hoverShadow: 'hover:shadow-orange-100',
        icon: '🔥',
        tagline: 'Philippine Educational Publisher',
        pattern: 'radial-gradient(circle at 90% 10%, rgba(249,115,22,0.08) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(239,68,68,0.06) 0%, transparent 50%)',
    },
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/resources')
            .then(r => r.json())
            .then(data => {
                setResources(data.resources || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const user = session?.user;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-800 mb-2">
                    Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'User'}</span>
                </h1>
                <p className="text-slate-400 font-medium">Select a library to browse educational resources.</p>
            </div>

            {/* Resource Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-10 w-10 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {resources.map((resource) => {
                        const brand = BRAND_CONFIG[resource.slug] || {};
                        return (
                            <Link key={resource.id} href={`/resources/${resource.slug}`} className="group block active:scale-[0.98] transition-all duration-300">
                                <div
                                    className={`relative overflow-hidden rounded-3xl border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${brand.borderColor || 'border-slate-200'} ${brand.hoverShadow || ''}`}
                                    style={{ backgroundImage: brand.pattern }}
                                >
                                    {/* Top Color Bar */}
                                    <div className={`h-2 bg-gradient-to-r ${brand.gradient || 'from-indigo-500 to-purple-500'}`} />

                                    <div className="p-8">
                                        {/* Brand Logo */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`${brand.lightBg || 'bg-slate-50'} rounded-2xl p-5 border ${brand.borderColor || 'border-slate-200'} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-md`}>
                                                <span className="text-4xl">{brand.icon || resource.icon}</span>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:shadow-md ${brand.lightBg || 'bg-slate-50'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={brand.accent || '#6366f1'} strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <h2 className="text-2xl font-black text-slate-800 mb-1">{resource.name}</h2>
                                        <p className="text-sm text-slate-400 mb-1">{resource.description}</p>
                                        <p className={`text-xs font-bold ${brand.textColor || 'text-indigo-600'}`}>{brand.tagline}</p>

                                        {/* Bottom */}
                                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${brand.lightBg || 'bg-slate-50'} ${brand.textColor || 'text-indigo-600'}`}>
                                                    📂 Browse Folders
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-300 font-medium">Grade 1–8</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Your Role</p>
                    <p className="text-2xl font-black text-slate-800 capitalize">{user?.role}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Grade Level</p>
                    <p className="text-2xl font-black text-slate-800">{user?.gradeLevel || 'All'}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Libraries</p>
                    <p className="text-2xl font-black text-slate-800">{resources.length}</p>
                </div>
            </div>
        </div>
    );
}
