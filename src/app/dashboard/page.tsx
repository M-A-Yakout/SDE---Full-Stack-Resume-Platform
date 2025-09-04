import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import DeleteResumeButton from '@/components/DeleteResumeButton'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="mt-4">Please log in to see your resumes.</div>
      </div>
    )
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <Link href="/resumes/new" className="bg-blue-600 text-white px-3 py-1 rounded">New Resume</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6">
        {resumes.length === 0 ? (
          <div>No resumes yet. Create one to get started.</div>
        ) : (
          <ul className="space-y-3">
            {resumes.map((r: any) => (
              <li key={r.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.title || 'Untitled'}</div>
                  <div className="text-sm text-gray-400">Updated: {new Date(r.updatedAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/resumes/${r.id}/view`} className="px-3 py-1 bg-gray-800 text-white rounded">View</Link>
                  <a href={r.pdfUrl || `/api/pdf/${r.id}`} className="px-3 py-1 bg-blue-600 text-white rounded">Download as PDF</a>
                  <DeleteResumeButton id={r.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
