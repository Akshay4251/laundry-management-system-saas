// app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // ✅ Correct import
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth(); // ✅ FIX: Just call auth() directly, no getServerSession

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If super admin, return session data (no database record)
    if (session.user.isSuperAdmin) {
      return NextResponse.json({
        success: true,
        data: {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.name,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          businessId: null,
          business: null,
        },
      });
    }

    // For regular users, fetch full data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        business: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        businessId: user.businessId,
        business: user.business,
        isSuperAdmin: false,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}