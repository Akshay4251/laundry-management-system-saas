// app/api/customers/check-duplicate/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * GET /api/customers/check-duplicate?phone=1234567890&excludeId=xxx
 * Check if a phone number is already in use
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const excludeId = searchParams.get("excludeId"); // For update operations

    if (!phone) {
      return errorResponse("Phone number is required", 400);
    }

    // 3. Normalize phone (remove formatting)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");

    // 4. Check for existing customer
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        businessId: businessId,
        phone: normalizedPhone,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
      },
    });

    return successResponse({
      isDuplicate: !!existingCustomer,
      customer: existingCustomer || null,
    });
  } catch (error) {
    console.error("Duplicate check error:", error);
    return errorResponse("Failed to check duplicate", 500);
  }
}