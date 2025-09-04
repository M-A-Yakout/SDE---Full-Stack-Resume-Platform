import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  try {
    // Use server-side session retrieval so this API works in server environment
    const session = await getServerSession(authOptions)
    const user = session?.user
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { title, personal, education, experience, skills } = body

    const resume = await prisma.resume.create({ 
      data: { 
        title, 
        personal: personal || {}, 
        education: education || [], 
        experience: experience || [], 
        skills: skills || [], 
        userId: user.id 
      } 
    })

    return NextResponse.json({ id: resume.id })
  } catch (error) {
    console.error('Resume save error:', error)
    const message = (error as any)?.message || 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
