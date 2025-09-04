import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(req: Request, context: any) {
  try {
    const { params } = context
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, personal, education, experience, skills } = body

    // Ensure the resume belongs to the user
    const existing = await prisma.resume.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updated = await prisma.resume.update({ where: { id }, data: { title, personal, education, experience, skills, version: { increment: 1 } } })
    return NextResponse.json({ id: updated.id })
  } catch (err: any) {
    console.error('Resume PUT error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { params } = context
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await prisma.resume.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.resume.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Resume DELETE error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
