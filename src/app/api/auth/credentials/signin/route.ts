import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyPassword } from '../../../../../lib/auth'

export async function POST(req: Request) {
  let email: string | undefined
  let password: string | undefined
  try {
    const body = await req.json()
    email = body.email
    password = body.password
  } catch {
    const form = await req.formData()
    email = form.get('email') as string | undefined
    password = form.get('password') as string | undefined
  }
  if (!email || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const ok = await verifyPassword(password, user.password)
  if (!ok) return NextResponse.json({ error: 'Invalid' }, { status: 401 })
  return NextResponse.json({ id: user.id })
}
