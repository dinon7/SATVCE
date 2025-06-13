"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">VCE Guide</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/quiz" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/quiz') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Take Quiz
            </Link>
            <Link 
              href="/subjects" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/subjects') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Subjects
            </Link>
            <Link 
              href="/resources" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/resources') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Resources
            </Link>
            <Link 
              href="/login" 
              className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 