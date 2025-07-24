import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
const addPermissionsForAdmin = async () => {
  const permissions = await prisma.permission.findMany()
  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: 'ADMIN',
    },
  })
  await prisma.role.update({
    where: {
      id: adminRole.id,
    },
    data: {
      permissions: {
        set: permissions.map((item) => ({
          id: item.id,
        })),
      },
    },
  })
}

addPermissionsForAdmin()
