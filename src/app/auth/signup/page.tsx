"use client"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Sign up failed')
      }

      // After successful signup, sign in automatically
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Account created but couldn't sign in automatically")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-900 text-luxury-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-luxury-800 p-8 rounded-lg shadow-xl border border-luxury-700">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-luxury-gold to-luxury-bronze bg-clip-text text-transparent">
            Create Account
          </h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-luxury-200">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 rounded bg-luxury-900 border border-luxury-700 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-luxury-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 rounded bg-luxury-900 border border-luxury-700 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-luxury-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 rounded bg-luxury-900 border border-luxury-700 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors"
                placeholder="Choose a strong password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded bg-luxury-gold text-luxury-900 font-semibold hover:bg-luxury-bronze transition-colors duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-luxury-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-luxury-gold hover:text-luxury-bronze">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
