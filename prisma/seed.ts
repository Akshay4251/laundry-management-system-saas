// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default treatments for all businesses
const DEFAULT_TREATMENTS = [
  {
    name: 'Wash Only',
    code: 'WASH',
    description: 'Machine wash with detergent',
    isCombo: false,
    turnaroundHours: 24,
    sortOrder: 1,
  },
  {
    name: 'Iron Only',
    code: 'IRON',
    description: 'Steam iron and press',
    isCombo: false,
    turnaroundHours: 12,
    sortOrder: 2,
  },
  {
    name: 'Wash + Iron',
    code: 'WASH_IRON',
    description: 'Complete wash and iron service',
    isCombo: true,
    turnaroundHours: 24,
    sortOrder: 3,
  },
  {
    name: 'Dry Clean',
    code: 'DRY_CLEAN',
    description: 'Professional dry cleaning',
    isCombo: false,
    turnaroundHours: 48,
    sortOrder: 4,
  },
  {
    name: 'Dry Clean + Press',
    code: 'DRY_CLEAN_PRESS',
    description: 'Dry cleaning with professional pressing',
    isCombo: true,
    turnaroundHours: 48,
    sortOrder: 5,
  },
  {
    name: 'Steam Press',
    code: 'STEAM_PRESS',
    description: 'Steam press only',
    isCombo: false,
    turnaroundHours: 6,
    sortOrder: 6,
  },
];

async function seedTreatmentsForBusiness(businessId: string) {
  console.log(`Seeding treatments for business: ${businessId}`);

  for (const treatment of DEFAULT_TREATMENTS) {
    await prisma.treatment.upsert({
      where: {
        businessId_code: {
          businessId,
          code: treatment.code,
        },
      },
      update: {},
      create: {
        businessId,
        ...treatment,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${DEFAULT_TREATMENTS.length} treatments`);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Get all businesses
  const businesses = await prisma.business.findMany({
    select: { id: true, businessName: true },
  });

  console.log(`Found ${businesses.length} businesses`);

  // Seed treatments for each business
  for (const business of businesses) {
    await seedTreatmentsForBusiness(business.id);
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });