import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const hashPassword = async (pw: string) => {
  return bcrypt.hash(pw, 12)
}

export const verifyPassword = async (pw: string, hash: string) => {
  return bcrypt.compare(pw, hash)
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}
