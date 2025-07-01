import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">VCE Guidance</h3>
            <p className="text-gray-600">
              Helping Victorian students make informed decisions about their future.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/quiz" className="text-gray-600 hover:text-primary">
                  Take Quiz
                </a>
              </li>
              <li>
                <a href="/subjects" className="text-gray-600 hover:text-primary">
                  Subjects
                </a>
              </li>
              <li>
                <a href="/careers" className="text-gray-600 hover:text-primary">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-600">
              Have questions? Reach out to us at{" "}
              <a href="mailto:support@vceguidance.com" className="text-primary hover:underline">
                support@vceguidance.com
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} VCE Guidance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 