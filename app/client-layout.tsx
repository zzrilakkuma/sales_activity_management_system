'use client';

import { PropsWithChildren } from 'react';
import SidebarNavigation from '@/components/sidebar';
import { Home, Package, Box, Users, BarChart, Settings } from 'lucide-react';
import { MenuItem } from '@/types/navigation';
import { SessionProvider } from "next-auth/react";

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

export default function ClientLayout({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <div className="flex h-screen">
        <SidebarNavigation items={navigationItems} userRole="admin" />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
