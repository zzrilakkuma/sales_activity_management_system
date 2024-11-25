'use client';

import { PropsWithChildren } from 'react';
import { useSession } from "next-auth/react";
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';
import SidebarNavigation from '@/components/layout/sidebar';
import { Home, Package, Box, Users, BarChart, Settings } from 'lucide-react';
import { MenuItem } from '@/types/navigation';

const navigationItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: 'Orders',
    icon: Package,
    href: '/orders',
  },
  {
    title: 'Inventory',
    icon: Box,
    href: '/inventory',
    children: [
      { title: 'Stock', href: '/inventory/stock' },
      { title: 'Categories', href: '/inventory/categories' },
    ],
  },
  {
    title: 'Users',
    icon: Users,
    href: '/users',
    children: [
      { title: 'Customers', href: '/users/customers' },
      { title: 'Staff', href: '/users/staff' },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart,
    href: '/analytics',
    children: [
      { title: 'Sales', href: '/analytics/sales' },
      { title: 'Performance', href: '/analytics/performance' },
    ],
  },
  { title: 'Settings', icon: Settings, href: '/settings' },
];

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
        <SidebarNavigation items={navigationItems} userRole="admin" />
      )}
      <main className={`flex-1 overflow-y-auto ${session && !isLoginPage ? 'p-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}