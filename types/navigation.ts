import { LucideIcon } from 'lucide-react'

export interface SubMenuItem {
  title: string
  href: string
}

export interface MenuItem {
  title: string
  icon: LucideIcon
  href?: string
  submenu?: SubMenuItem[]
}

export interface NavigationProps {
  items: MenuItem[]
  userRole?: 'admin' | 'manager' | 'employee'
}

