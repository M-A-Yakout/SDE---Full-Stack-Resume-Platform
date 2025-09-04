"use client"
import React from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <button onClick={handleLogout} className="px-3 py-1 bg-gray-700 text-white rounded">Logout</button>
  )
}
