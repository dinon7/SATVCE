import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ClientLayout } from '@/components/ClientLayout'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VCE Career Guidance',
  description: 'Plan your future with confidence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <ClientLayout>
              <main className="flex-grow">
                {children}
              </main>
            </ClientLayout>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 