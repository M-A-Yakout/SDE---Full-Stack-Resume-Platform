import React from 'react'
import ResumePreview from '../../../../components/ResumePreview'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import DeleteResumeButton from '@/components/DeleteResumeButton'

export default async function ViewPage(context: any) {
  const { params } = context
  const { id } = await params

  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume) {
    return (
      <div className="container mx-auto p-4">Resume not found</div>
    )
  }

  // For now only allow owner to view (feel free to change to public if desired)
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.id !== resume.userId) {
    return (
      <div className="container mx-auto p-4">You are not authorized to view this resume.</div>
    )
  }

  const data = resume
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="px-3 py-1 bg-luxury-800 text-luxury-50 rounded">← Back</a>
          <h1 className="text-2xl font-bold">{data.title || 'Resume'}</h1>
        </div>
        <div className="flex gap-2">
          <a href={`/api/pdf/${id}`} className="bg-gray-800 text-white px-3 py-1 rounded">Download as PDF</a>
          <a href={`/resumes/${id}/edit`} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</a>
          <DeleteResumeButton id={id} />
        </div>
      </div>
      <div className="mt-4">
        <ResumePreview data={data} />
      </div>
    </div>
  )
}
