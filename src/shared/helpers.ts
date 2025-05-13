import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

// Type predicate

export function isUniqueContraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export function generateOtp() {
  return randomInt(100000, 1000000)
}
