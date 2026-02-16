// app/api/customers/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createCustomerSchema,
  customerQuerySchema,
} from "@/lib/validations/customer";
import {
  successResponse,
  errorResponse,
  handleZodError,
  handlePrismaError,
} from "@/lib/api-response";
import { Prisma } from "@prisma/client";
import { createNotificationForBusiness } from '@/lib/notifications/create-notification';

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse(
        "Business not found. Please contact support.",
        404
      );
    }

    const body = await req.json();
    const validationResult = createCustomerSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const data = validationResult.data;

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        businessId: businessId,
        phone: data.phone,
        deletedAt: null,
      },
    });

    if (existingCustomer) {
      return errorResponse(
        "A customer with this phone number already exists",
        409,
        { existingCustomerId: existingCustomer.id }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        businessId: businessId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        tags: data.tags || [],
      },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🔔 CREATE NEW CUSTOMER NOTIFICATION
    // ═══════════════════════════════════════════════════════════════════════

    try {
      await createNotificationForBusiness({
        businessId,
        type: 'CUSTOMER_CREATED',
        title: '👤 New customer registered',
        message: `${customer.fullName} has been added to your customer list`,
        data: {
          customerId: customer.id,
          customerName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
        },
      });
    } catch (notifError) {
      console.error('Failed to create customer notification:', notifError);
      // Don't fail the customer creation if notification fails
    }

    // Transform customer to match expected type
    const transformedCustomer = {
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      lastOrderDate: customer.lastOrderDate?.toISOString() || null,
      deletedAt: customer.deletedAt?.toISOString() || null,
      totalSpent: parseFloat(customer.totalSpent.toString()),
    };

    return successResponse(
      { customer: transformedCustomer },
      "Customer created successfully",
      201
    );
  } catch (error) {
    console.error("Customer creation error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse(
      "Failed to create customer",
      500,
      process.env.NODE_ENV === "development" ? String(error) : undefined
    );
  }
}

/**
 * GET /api/customers
 * List customers with search, filter, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    const { searchParams } = new URL(req.url);
    const queryValidation = customerQuerySchema.safeParse({
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      tags: searchParams.get("tags"),
      includeDeleted: searchParams.get("includeDeleted"),
    });

    if (!queryValidation.success) {
      return handleZodError(queryValidation.error);
    }

    const { search, page, limit, sortBy, sortOrder, tags, includeDeleted } = 
      queryValidation.data;

    const where: Prisma.CustomerWhereInput = {
      businessId: businessId,
      ...(!includeDeleted && { deletedAt: null }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tags && {
        tags: {
          hasSome: tags.split(",").map((t) => t.trim()),
        },
      }),
    };

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const transformedCustomers = customers.map((customer) => ({
      id: customer.id,
      businessId: customer.businessId,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
      tags: customer.tags,
      lastOrderDate: customer.lastOrderDate?.toISOString() || null,
      totalOrders: customer.totalOrders,
      totalSpent: parseFloat(customer.totalSpent.toString()),
      deletedAt: customer.deletedAt?.toISOString() || null,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      _count: customer._count,
    }));

    const totalPages = Math.ceil(total / limit);
    
    return successResponse({
      data: transformedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Customers fetch error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to fetch customers", 500);
  }
}