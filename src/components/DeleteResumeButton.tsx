"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteResumeButton({ id }: { id: string }) {
  const router = useRouter()
  const handleDelete = async () => {
    if (!confirm('Delete this resume? This cannot be undone.')) return
    const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return alert(json.error || 'Failed to delete')
    router.push('/dashboard')
  }

  return (
    <button onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
  )
}
