// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isSuperAdminEmail } from '@/lib/super-admin-auth';
import { getTrialEndDate, getPlanFeatures, getPlanLimits } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, business_name } = body;

    // Validation
    if (!email || !password || !full_name || !business_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Prevent registration with super admin email
    if (isSuperAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Cannot register with this email' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get trial features and limits
    const trialFeatures = getPlanFeatures('TRIAL');
    const trialLimits = getPlanLimits('TRIAL');
    const trialEndsAt = getTrialEndDate();

    // Create user, business, and settings in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create business first
      const business = await tx.business.create({
        data: {
          businessName: business_name,
          planType: 'TRIAL',
          planStatus: 'TRIAL',
          trialEndsAt: trialEndsAt,
        },
      });

      // Create business settings with trial features
      await tx.businessSettings.create({
        data: {
          businessId: business.id,
          pickupEnabled: trialFeatures.pickupEnabled,
          deliveryEnabled: trialFeatures.deliveryEnabled,
          workshopEnabled: trialFeatures.workshopEnabled,
          multiStoreEnabled: trialFeatures.multiStoreEnabled,
          smsNotifications: trialFeatures.smsNotifications,
          emailNotifications: trialFeatures.emailNotifications,
          whatsappIntegration: trialFeatures.whatsappIntegration,
          advancedReports: trialFeatures.advancedReports,
          maxStores: trialLimits.maxStores,
          maxStaff: trialLimits.maxStaff,
          maxMonthlyOrders: trialLimits.maxMonthlyOrders,
        },
      });

      // Create default store
      await tx.store.create({
        data: {
          businessId: business.id,
          name: 'Main Store',
          isActive: true,
        },
      });

      // Create user
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          fullName: full_name,
          role: 'OWNER',
          businessId: business.id,
        },
        include: {
          business: true,
        },
      });

      // Create default user preferences
      await tx.userPreferences.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    console.log('✅ New user registered:', user.email, '| Trial ends:', trialEndsAt.toISOString());

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          businessId: user.businessId,
          business: user.business,
          trialEndsAt: trialEndsAt.toISOString(),
        },
        message: 'User registered successfully. Your 14-day trial has started!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}