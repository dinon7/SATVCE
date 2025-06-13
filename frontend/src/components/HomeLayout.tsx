'use client';

import Link from 'next/link';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">VCE Navigator</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link className="text-[#0d141c] text-sm font-medium leading-normal" href="#">Home</Link>
              <Link className="text-[#0d141c] text-sm font-medium leading-normal" href="#">About</Link>
              <Link className="text-[#0d141c] text-sm font-medium leading-normal" href="#">Contact</Link>
            </div>
            <div className="flex gap-2">
              {/* Link to Signup page */}
              <Link href="/signup">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#0c7ff2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Get Started</span>
                </button>
              </Link>
              {/* Link to Login page */}
              <Link href="/login">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Sign In</span>
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-center">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <Link className="text-[#49739c] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</Link>
                <Link className="text-[#49739c] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</Link>
                <Link className="text-[#49739c] text-base font-normal leading-normal min-w-40" href="#">Contact Us</Link>
              </div>
              <p className="text-[#49739c] text-base font-normal leading-normal">@2024 VCE Navigator. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
} 