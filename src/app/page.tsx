// app/page.tsx (Next.js 13+ App Router)
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-900 text-luxury-50">
      {/* Loader */}
      <div className="mt-12 flex justify-center">
        <div className="loader-wrapper">
          <div className="loader"></div>
          <span className="loader-letter">AI</span>
          <span className="loader-letter">Gen</span>
          <span className="loader-letter">era</span>
          <span className="loader-letter">t</span>
          <span className="loader-letter">in</span>
          <span className="loader-letter">g</span>
        </div>
      </div>

      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-luxury-gold via-luxury-silver to-luxury-bronze bg-clip-text text-transparent">
          Luxury Resume Platform
        </h1>
        <p className="mb-8 text-lg text-luxury-200">
          Create stunning, professional resumes with AI-powered insights and elegant design.
        </p>

        <div className="flex justify-center gap-6">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-luxury-800 text-luxury-gold border-2 border-luxury-gold px-6 py-3 rounded-lg hover:bg-luxury-700 transition-colors duration-200 font-semibold"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="bg-luxury-800 text-luxury-silver border-2 border-luxury-silver px-6 py-3 rounded-lg hover:bg-luxury-700 transition-colors duration-200 font-semibold"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-luxury-gold text-luxury-900 px-6 py-3 rounded-lg hover:bg-luxury-bronze transition-colors duration-200 font-semibold"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
