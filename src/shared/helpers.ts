import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'

// Type predicate

export function isUniqueContraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}

export const generateRandomFileName = (fileName: string) => {
  const ext = extname(fileName)
  return `${uuidv4()}${ext}`
}

export function generateOtp() {
  return randomInt(100000, 1000000)
}
