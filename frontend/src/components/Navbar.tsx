"use client";

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"

export default function Navbar() {
  const router = useRouter()

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            VCE Guidance
          </Link>

          <div className="flex items-center space-x-4">
            <SignedIn>
              <Link href="/quiz" className="text-gray-600 hover:text-primary">
                Take Quiz
              </Link>
              <Link href="/subjects" className="text-gray-600 hover:text-primary">
                Subjects
              </Link>
              <Link href="/careers" className="text-gray-600 hover:text-primary">
                Careers
              </Link>
              <Link href="/preferences" className="text-gray-600 hover:text-primary">
                Preferences
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Login</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  )
} 