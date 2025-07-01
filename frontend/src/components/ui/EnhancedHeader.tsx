"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Bell, 
  Search, 
  Settings, 
  HelpCircle, 
  Menu, 
  X,
  Home,
  BookOpen,
  Briefcase,
  Heart,
  FileText,
  Users,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from './OptimizedImage'

interface EnhancedHeaderProps {
  variant?: 'default' | 'dashboard' | 'minimal'
  showSearch?: boolean
  showNotifications?: boolean
  className?: string
}

export default function EnhancedHeader({ 
  variant = 'default', 
  showSearch = true, 
  showNotifications = true,
  className = "" 
}: EnhancedHeaderProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Quiz', href: '/quiz', icon: FileText },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Careers', href: '/careers', icon: Briefcase },
    { name: 'Resources', href: '/resources', icon: FileText },
    { name: 'Preferences', href: '/preferences', icon: Heart },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  const handleNotificationClick = () => {
    // TODO: Implement notifications
    console.log('Notifications clicked')
  }

  const handleSettingsClick = () => {
    router.push('/preferences')
  }

  const handleHelpClick = () => {
    // TODO: Implement help/support
    console.log('Help clicked')
  }

  if (variant === 'minimal') {
    return (
      <header className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VCE Navigator</span>
            </Link>
            
            {user && (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  {user.imageUrl ? (
                    <OptimizedImage
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">VCE Navigator</span>
                <p className="text-xs text-gray-500">Career Guidance Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {variant === 'dashboard' && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search subjects, careers, resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {showNotifications && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* Help */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpClick}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            {user ? (
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                {user.imageUrl ? (
                  <OptimizedImage
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/sign-in')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => router.push('/sign-up')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
            
            {/* Mobile Search */}
            {showSearch && (
              <div className="mt-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
} 