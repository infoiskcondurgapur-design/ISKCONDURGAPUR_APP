'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Do not show the sidebar on the login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#F8F9FC]">
            <AdminSidebar />
            
            {/* Main Content Area - padded left on desktop to account for the fixed sidebar */}
            <main className="flex-1 w-full md:ml-72 transition-all duration-300">
                {/* Add top padding on mobile to account for the fixed hamburger header */}
                <div className="md:pt-0 pt-16 h-full min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
