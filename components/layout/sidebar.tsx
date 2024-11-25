'use client';

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { NavigationProps, MenuItem, SubMenuItem } from '@/types/navigation'

const SidebarNavigation: React.FC<NavigationProps> = ({ items, userRole = 'employee' }) => {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const isAllowed = (item: MenuItem) => {
    if (userRole === 'admin') return true
    if (userRole === 'manager' && item.title !== 'Settings') return true
    if (userRole === 'employee' && ['Dashboard', 'Order Management', 'Inventory'].includes(item.title)) return true
    return false
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <h2 className="text-lg font-semibold">ASUS Sales Management</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {items.filter(isAllowed).map((item, index) => (
              <SidebarMenuItem key={index}>
                {item.submenu ? (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.submenu.map((subItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                              <Link href={subItem.href}>{subItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive(item.href!)}>
                    <Link href={item.href!}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <p className="text-sm text-muted-foreground"> 2023 ASUS</p>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export default SidebarNavigation
