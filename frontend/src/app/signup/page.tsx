"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();

  // Clerk's <SignUp /> supports an afterSignUpUrl prop for redirect
  // Optionally, you can use Clerk events for more control

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    // (Clerk will handle this, but you can add logic if needed)
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <Link href="/" className="mb-6 text-2xl font-bold text-blue-700 hover:underline">
          VCE Career Guidance
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Create your account</h2>
        <p className="text-gray-500 mb-6 text-center">
          Sign up to start your personalized VCE career journey.
        </p>
        <SignUp
          appearance={{
            elements: {
              card: "shadow-none border border-gray-200 rounded-lg",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
            },
          }}
          afterSignUpUrl="/quiz"
          redirectUrl="/quiz"
        />
        <div className="mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
} 