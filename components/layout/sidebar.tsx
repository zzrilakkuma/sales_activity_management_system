'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  Box,
  Users,
  BarChart,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { MenuItem } from '@/types/navigation';
import { Button } from '@/components/ui/button';

const navigationItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: 'Order Management',
    icon: Package,
    children: [
      { title: 'New Order', href: '/orders/new' },
      { title: 'Order List', href: '/orders' },
    ],
  },
  {
    title: 'Inventory',
    icon: Box,
    children: [
      { title: 'Stock Overview', href: '/inventory/stock' },
      { title: 'Allocation Status', href: '/inventory/allocation' },
    ],
  },
  {
    title: 'Customer Management',
    icon: Users,
    children: [
      { title: 'Customer List', href: '/customers/list' },
      { title: 'Customer Analytics', href: '/customers/analytics' },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart,
    children: [
      { title: 'Sales Reports', href: '/reports/sales' },
      { title: 'Inventory Reports', href: '/reports/inventory' },
      { title: 'Shipping Reports', href: '/reports/shipping' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

interface SidebarProps {
  className?: string;
  userRole?: string;
}

const Sidebar = ({ className, userRole = 'user' }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (title: string) => {
    setOpenItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/login'
      });
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className={cn('flex h-full flex-col bg-gray-900 text-white', className)}>
      <div className="flex-1">
        <div className="px-3 py-4">
          <h2 className="px-4 text-lg font-semibold tracking-tight">
            ASUS Sales System
          </h2>
        </div>
        <div className="space-y-1">
          {navigationItems.map(item => renderMenuItem(item))}
        </div>
      </div>
      <div className="border-t border-gray-800 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-gray-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  function renderMenuItem(item: MenuItem, depth = 0) {
    const isExpanded = openItems[item.title] ?? false;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? pathname === item.href : false;

    return (
      <div key={item.title} className="px-3">
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              'flex items-center py-2 px-4 text-sm font-medium rounded-md',
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        ) : (
          <div
            onClick={() => toggleItem(item.title)}
            className={cn(
              'flex items-center py-2 px-4 text-sm font-medium text-gray-300 rounded-md',
              'hover:bg-gray-800 hover:text-white cursor-pointer'
            )}
          >
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            <span>{item.title}</span>
            {hasChildren && (
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        )}
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }
};

export default Sidebar;
