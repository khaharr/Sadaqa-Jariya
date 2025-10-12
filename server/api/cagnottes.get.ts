// server/api/cagnottes.get.ts
import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Récupération des cagnottes...')
    
    const cagnottes = await prisma.cagnotte.findMany({
      orderBy: { created_at: 'desc' },
    })
    
    console.log('📦 Données récupérées:', JSON.stringify(cagnottes, null, 2))
    console.log('🔢 Nombre de cagnottes:', cagnottes.length)
    
    return cagnottes
  } catch (error) {
    console.error('❌ Erreur Prisma:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des cagnottes'
    })
  }
})