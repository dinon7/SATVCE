'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUp(email, password);
      // After successful signup, redirect to quiz
      router.push('/quiz');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d151c]">
            {/* Link logo to homepage */}
            <Link href="/">
              <div className="size-4 cursor-pointer">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </Link>
            <h2 className="text-[#0d151c] text-lg font-bold leading-tight tracking-[-0.015em]">VCE Navigator</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              {/* Placeholder links */}
              <Link className="text-[#0d151c] text-sm font-medium leading-normal" href="#">Home</Link>
              <Link className="text-[#0d151c] text-sm font-medium leading-normal" href="#">Subjects</Link>
              <Link className="text-[#0d151c] text-sm font-medium leading-normal" href="#">Careers</Link>
              <Link className="text-[#0d151c] text-sm font-medium leading-normal" href="#">Support</Link>
            </div>
            {/* Link to Login page */}
            <Link href="/login">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf4] text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Log In</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Main Content - Centered */}
        <div className="flex flex-1 justify-center items-center p-5">
          <div className="layout-content-container flex flex-col w-full max-w-[512px] py-5">
            <h2 className="text-[#0d151c] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Create your account</h2>
            
            {error && (
              <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="flex flex-col gap-4 px-4 py-3">
              {/* First Name Input */}
              <label className="flex flex-col">
                <p className="text-[#0d151c] text-base font-medium leading-normal pb-2">First Name</p>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d151c] focus:outline-0 focus:ring-0 border border-[#cedce8] bg-slate-50 focus:border-[#cedce8] h-14 placeholder:text-[#49749c] p-[15px] text-base font-normal leading-normal"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>

              {/* Last Name Input */}
              <label className="flex flex-col">
                <p className="text-[#0d151c] text-base font-medium leading-normal pb-2">Last Name</p>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d151c] focus:outline-0 focus:ring-0 border border-[#cedce8] bg-slate-50 focus:border-[#cedce8] h-14 placeholder:text-[#49749c] p-[15px] text-base font-normal leading-normal"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>

              {/* Email Input */}
              <label className="flex flex-col">
                <p className="text-[#0d151c] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d151c] focus:outline-0 focus:ring-0 border border-[#cedce8] bg-slate-50 focus:border-[#cedce8] h-14 placeholder:text-[#49749c] p-[15px] text-base font-normal leading-normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              {/* Password Input */}
              <label className="flex flex-col">
                <p className="text-[#0d151c] text-base font-medium leading-normal pb-2">Password</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d151c] focus:outline-0 focus:ring-0 border border-[#cedce8] bg-slate-50 focus:border-[#cedce8] h-14 placeholder:text-[#49749c] p-[15px] text-base font-normal leading-normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#0b80ee] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="truncate">{loading ? 'Creating account...' : 'Create Account'}</span>
              </button>
            </form>

            {/* Log In Button/Link */}
            <div className="flex px-4 py-3">
              {/* Link to Login page */}
              <Link href="/login" className="flex-1">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#e7edf4] text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em] w-full"
                >
                  <span className="truncate">Already have an account? Log In</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Optional: Add footer if needed */}
        {/* <footer className="...">...</footer> */}

      </div>
    </div>
  );
} 