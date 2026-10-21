import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@uniquestudios.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = 'Admin User'

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  })

  if (existing) {
    console.log('Admin user already exists:', email)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.adminUser.create({
    data: {
      email,
      password: passwordHash,
      name,
      role: 'admin',
      active: true,
    },
  })

  console.log('Created admin user:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })