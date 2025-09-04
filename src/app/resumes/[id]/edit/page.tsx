import React from 'react'
import EditResumeClient from './EditResumeClient'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function EditPage(context: any) {
  const { params } = context
  const { id } = await params

  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume) return <div className="container mx-auto p-4">Resume not found</div>

  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.id !== resume.userId) {
    return <div className="container mx-auto p-4">You are not authorized to edit this resume.</div>
  }

  const defaultValues = resume
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4">
        <a href={`/resumes/${id}/view`} className="px-3 py-1 bg-luxury-800 text-luxury-50 rounded">← Back</a>
        <h1 className="text-2xl font-bold">Edit Resume</h1>
      </div>
      <EditResumeClient id={id} defaultValues={defaultValues} />
    </div>
  )
}
