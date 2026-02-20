'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';

export default function SidebarWrapper({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isLoginPage = pathname === '/login';
    const showSidebar = session && !isLoginPage;

    return (
        <>
            {showSidebar && <Sidebar />}
            <main className={`min-h-screen transition-all duration-300 ${showSidebar ? 'ml-64' : ''}`}>
                {children}
            </main>
        </>
    );
}
