'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

// School branding — removing PNG dependency
const SCHOOL_NAME = 'MABDC';
const SCHOOL_EMOJI = '🏫';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Quipper', href: '/resources/quipper', icon: '📘' },
    { label: 'Phoenix', href: '/resources/phoenix', icon: '🔥' },
];

const ADMIN_ITEMS = [
    { label: 'User Management', href: '/admin', icon: '👥' },
];

const ROLE_COLORS = {
    admin: 'bg-red-50 text-red-600 border-red-200',
    teacher: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    student: 'bg-blue-50 text-blue-600 border-blue-200',
};

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    if (!session) return null;

    const user = session.user;
    const isAdmin = user?.role === 'admin';

    return (
        <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 shadow-sm`}>
            {/* Header */}
            <div className="p-5 border-b border-slate-100 h-[73px] flex items-center">
                <div className="flex items-center justify-between w-full">
                    <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'justify-center w-full' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 hover:scale-105 active:scale-95">
                            <span className="text-xl flex items-center justify-center">{SCHOOL_EMOJI}</span>
                        </div>
                        {!collapsed && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                <h1 className="text-slate-800 font-black text-lg leading-tight">{SCHOOL_NAME}</h1>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">eBook Portal</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 transition-opacity duration-300 ${collapsed ? 'text-center opacity-50' : 'px-3 opacity-100'}`}>
                    {collapsed ? '—' : 'Library'}
                </p>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group active:scale-[0.98] ${isActive
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm translate-x-1'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:translate-x-1'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <span className={`text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <span className="font-semibold text-sm animate-in fade-in slide-in-from-left-1 duration-300">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <>
                        <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-3 transition-opacity duration-300 ${collapsed ? 'text-center opacity-50' : 'px-3 opacity-100'}`}>
                            {collapsed ? '—' : 'Admin'}
                        </p>
                        {ADMIN_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 active:scale-[0.98] ${isActive
                                        ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm translate-x-1'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:translate-x-1'
                                        } ${collapsed ? 'justify-center px-0' : ''}`}
                                >
                                    <span className={`text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                                        {item.icon}
                                    </span>
                                    {!collapsed && (
                                        <span className="font-semibold text-sm animate-in fade-in slide-in-from-left-1 duration-300">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100">
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-800 font-bold text-sm truncate">{user?.name}</p>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${ROLE_COLORS[user?.role] || ROLE_COLORS.student}`}>
                                {user?.role}
                            </span>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all"
                            title="Sign out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    )}
                </div>
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="w-full mt-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
        </aside>
    );
}
