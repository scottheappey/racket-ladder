import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`📊 Current users in database: ${userCount}`)
    
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.log('❌ Database connection failed:', error instanceof Error ? error.message : String(error))
    return false
  }
}

testConnection()
