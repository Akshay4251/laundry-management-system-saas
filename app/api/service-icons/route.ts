// app/api/service-icons/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { createServiceIconSchema } from '@/lib/validations/service';
import { ItemCategory } from '@prisma/client'; // ✅ CHANGED

// ============================================================================
// GET /api/service-icons - Get predefined icons library
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get('category'); // ✅ Get as string first

    const where: Record<string, unknown> = {
      isActive: true,
    };

    // ✅ Only add category filter if it's a valid ItemCategory (not 'ALL')
    if (categoryParam && categoryParam !== 'ALL' && Object.values(ItemCategory).includes(categoryParam as ItemCategory)) {
      where.category = categoryParam as ItemCategory;
    }

    const icons = await prisma.serviceIcon.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by category
    const grouped = icons.reduce((acc, icon) => {
      if (!acc[icon.category]) {
        acc[icon.category] = [];
      }
      acc[icon.category].push({
        id: icon.id,
        name: icon.name,
        imageUrl: icon.imageUrl,
        category: icon.category,
        tags: icon.tags,
      });
      return acc;
    }, {} as Record<string, Array<{ id: string; name: string; imageUrl: string; category: string; tags: string[] }>>);

    return apiResponse.success({
      icons,
      grouped,
      total: icons.length,
    });
  } catch (error) {
    console.error('GET /api/service-icons error:', error);
    return apiResponse.error('Failed to fetch icons');
  }
}

// ============================================================================
// POST /api/service-icons - Add icon to library (Admin only)
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const body = await req.json();
    const validationResult = createServiceIconSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.badRequest(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const data = validationResult.data;

    const icon = await prisma.serviceIcon.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        category: data.category as ItemCategory, // ✅ CHANGED
        tags: data.tags,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    return apiResponse.created(icon, 'Icon added to library');
  } catch (error) {
    console.error('POST /api/service-icons error:', error);
    return apiResponse.error('Failed to add icon');
  }
}