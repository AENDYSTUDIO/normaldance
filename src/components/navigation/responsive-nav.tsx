'use client'

import { useState, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button, Sheet, SheetContent, SheetTrigger } from '@/components/ui'
import { Menu, X, Home, Music, Wallet, User, Search, TrendingUp } from '@/components/icons'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/', label: 'Главная', icon: <Home className="h-4 w-4" /> },
  { href: '/tracks', label: 'Треки', icon: <Music className="h-4 w-4" /> },
  { href: '/discover', label: 'Поиск', icon: <Search className="h-4 w-4" /> },
  { href: '/trending', label: 'Тренды', icon: <TrendingUp className="h-4 w-4" /> },
  { href: '/wallet', label: 'Кошелек', icon: <Wallet className="h-4 w-4" /> },
  { href: '/profile', label: 'Профиль', icon: <User className="h-4 w-4" /> }
]

export const ResponsiveNav = memo(function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        pathname === item.href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
      onClick={() => setIsOpen(false)}
    >
      {item.icon}
      {item.label}
    </Link>
  )

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col space-y-2 mt-6">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
})