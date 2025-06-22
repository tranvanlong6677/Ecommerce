import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  const permissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })

  const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string }[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = String(layer.route?.stack[0]?.method).toUpperCase() as keyof typeof HTTPMethod
        const name = `${method} ${path}`
        return { path, method, name }
      }
    })
    .filter((item) => item !== undefined)

  // Tạo object permissionInDbMap để lưu trữ các permission đã có trong database với key là method-path
  const permissionInDbMap: Record<string, (typeof permissionsInDb)[number]> = permissionsInDb.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  //   Tạo object availableRoutesMap để lưu trữ các route đã có trong database với key là method-path
  const availableRoutesMap: Record<string, (typeof availableRoutes)[number]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  //   Tìm permission có trong database nhưng không có trong availableRoutes
  const permissionsToDelete = permissionsInDb.filter((item) => !availableRoutesMap[`${item.method}-${item.path}`])

  //   Tìm permission có trong availableRoutes nhưng không có trong database
  const permissionsToCreate = availableRoutes.filter((item) => !permissionInDbMap[`${item.method}-${item.path}`])

  // Xóa permission không tồn tại trong availableRoutes
  if (permissionsToDelete.length > 0) {
    await prisma.permission.deleteMany({
      where: {
        // Dùng in để xóa nhiều permission cùng lúc
        id: { in: permissionsToDelete.map((item) => item.id) },
      },
    })
    console.log(`Đã xóa ${permissionsToDelete.length} permission`)
  } else {
    console.log('Không có permission để xóa')
  }

  //   Thêm permission mới có trong availableRoutes nhưng không có trong database
  if (permissionsToCreate.length > 0) {
    await prisma.permission.createMany({
      data: permissionsToCreate,
      skipDuplicates: true,
    })
    console.log(`Đã thêm ${permissionsToCreate.length} permission`)
  } else {
    console.log('Không có permission mới để thêm')
  }

  //   Thêm vào database
  //   try {
  //     const result = await prisma.permission.createMany({
  //       data: availableRoutes,
  //       skipDuplicates: true,
  //     })
  //     console.log(result)
  //   } catch (error) {
  //     console.log(error)
  //   }

  process.exit(0)
}
bootstrap()
