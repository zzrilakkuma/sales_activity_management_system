'use client';

import { PropsWithChildren } from 'react';
import { useSession } from "next-auth/react";
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';
import SidebarNavigation from '@/components/layout/sidebar';

export default function AuthLayout({ children }: PropsWithChildren) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (status === 'loading') {
    return null;
  }

  if (!session && !isLoginPage) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      {session && !isLoginPage && (
        <SidebarNavigation userRole="admin" />
      )}
      <main className={`flex-1 overflow-y-auto ${session && !isLoginPage ? 'p-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}