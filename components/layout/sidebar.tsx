'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { MenuItem } from '@/types/navigation';

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
      { title: 'Order Details', href: '/orders/details' },
    ],
  },
  {
    title: 'Inventory',
    icon: Box,
    children: [
      { title: 'Stock Overview', href: '/inventory/stock' },
      { title: 'Allocation Status', href: '/inventory/allocation' },
      { title: 'Delivery Tracking', href: '/inventory/delivery' },
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

export default function Sidebar({ className, userRole = 'user' }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems[item.title] ?? false;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? pathname === item.href : false;

    return (
      <div key={item.title} className="w-full">
        {item.href ? (
          <Link href={item.href}>
            <div
              className={cn(
                'flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                depth > 0 && 'ml-4'
              )}
            >
              <div className="flex items-center flex-1">
                {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                <span>{item.title}</span>
              </div>
            </div>
          </Link>
        ) : (
          <div
            className={cn(
              'flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer',
              'text-gray-300 hover:bg-gray-700 hover:text-white',
              depth > 0 && 'ml-4'
            )}
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.title);
              }
            }}
          >
            <div className="flex items-center flex-1">
              {item.icon && <item.icon className="h-5 w-5 mr-2" />}
              <span>{item.title}</span>
            </div>
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
          <div className="mt-1 mb-1">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col w-64 bg-gray-900 text-white p-3 space-y-2',
        className
      )}
    >
      <div className="px-3 py-4">
        <h2 className="text-xl font-bold">ASUS Sales</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {navigationItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  );
}
