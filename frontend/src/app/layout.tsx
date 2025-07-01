import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ClientLayout } from '@/components/ClientLayout'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import EnhancedHeader from '@/components/ui/EnhancedHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VCE Career Guidance',
  description: 'Your personalized career guidance platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col bg-white">
              <EnhancedHeader variant="default" />
              <AuthProvider>
                <ClientLayout>
                  <main className="flex-grow">
                    {children}
                  </main>
                </ClientLayout>
              </AuthProvider>
              <Footer />
            </div>
            <Toaster position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
} 