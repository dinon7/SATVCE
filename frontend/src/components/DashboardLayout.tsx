'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { OptimizedImage } from './ui/OptimizedImage'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const profileImageUrl = user?.photoURL || '/images/default-avatar-200x200.png';

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Using a simple header for now, as GlobalLayout is not suitable with the sidebar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#eaedf1] px-10 py-3">
          <div className="flex items-center gap-4 text-[#101518]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path></svg>
            </div>
            <h2 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em]">VCE Navigator</h2>
          </div>
          {/* Placeholder for user info/settings icons if needed in header */}
          <div className="flex items-center gap-9">
            <a className="text-[#101518] text-sm font-medium leading-normal" href="#">Home</a>
            <a className="text-[#101518] text-sm font-medium leading-normal" href="#">Subjects</a>
            <a className="text-[#101518] text-sm font-medium leading-normal" href="#">Careers</a>
            <a className="text-[#101518] text-sm font-medium leading-normal" href="#">Preferences</a>
          </div>
          <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#eaedf1] text-[#101518] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
          >
            <div className="text-[#101518]" data-icon="Question" data-size="20px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                ></path>
              </svg>
            </div>
          </button>
          <div className="relative size-10 rounded-full overflow-hidden">
            <OptimizedImage
              src={profileImageUrl}
              alt={user?.displayName || 'User profile'}
              fill
              quality={85}
              sizes="40px"
              className="object-cover"
            />
          </div>
        </header>
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar */}
          <div className="layout-content-container flex flex-col w-80">
             <div className="flex h-full min-h-[700px] flex-col justify-between bg-gray-50 p-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-[#101518] text-base font-medium leading-normal">VCE Navigator</h1>
                <div className="flex flex-col gap-2">
                  {/* Dashboard Link */}
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#eaedf1]">
                    <div className="text-[#101518]" data-icon="House" data-size="24px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                      </svg>
                    </div>
                    <p className="text-[#101518] text-sm font-medium leading-normal">Dashboard</p>
                  </Link>
                  {/* Career Quiz Link */}
                  <Link href="/quiz" className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#101518]" data-icon="PresentationChart" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
                      </svg>
                    </div>
                    <p className="text-[#101518] text-sm font-medium leading-normal">Career Quiz</p>
                  </Link>
                  {/* Saved Preferences Link */}
                  <Link href="/preferences" className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#101518]" data-icon="Bookmark" data-size="24px" data-weight="regular">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z"></path>
                      </svg>
                    </div>
                    <p className="text-[#101518] text-sm font-medium leading-normal">Saved Preferences</p>
                  </Link>
                  {/* Subject Descriptions Link */}
                  <Link href="/subjects" className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#101518]" data-icon="BookOpen" data-size="24px" data-weight="regular">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"></path>
                      </svg>
                    </div>
                    <p className="text-[#101518] text-sm font-medium leading-normal">Subject Descriptions</p>
                  </Link>
                  {/* Resources Link */}
                  <Link href="/suggestions" className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#101518]" data-icon="Question" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                      </svg>
                    </div>
                    <p className="text-[#101518] text-sm font-medium leading-normal">Resources</p>
                  </Link>
                </div>
              </div>
              {/* Settings Link */}
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2">
                <div className="text-[#101518]" data-icon="Gear" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M232,128a104,104,0,0,1-208,0C24,74.17,74.17,24,128,24S232,74.17,232,128Zm-16,0a88,88,0,0,0-88-88S40,74.17,40,128,128,216,128,216,216,181.83,216,128Zm-88,32a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm0-48a16,16,0,1,0,16,16A16,16,0,0,0,128,112Z"></path>
                  </svg>
                </div>
                <p className="text-[#101518] text-sm font-medium leading-normal">Settings</p>
              </Link>
            </div>
          </div>
          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 