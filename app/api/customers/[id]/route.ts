//app/api/customers/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCustomerSchema } from "@/lib/validations/customer";
import {
  successResponse,
  errorResponse,
  handleZodError,
  handlePrismaError,
} from "@/lib/api-response";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/customers/[id]
 * Get a single customer with order history
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    // 2. Fetch customer with orders
    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        businessId: businessId,
      },
      include: {
        orders: {
          include: {
            items: true,
            payments: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Last 10 orders
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    return successResponse({ customer });
  } catch (error) {
    console.error("Customer fetch error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to fetch customer", 500);
  }
}

/**
 * PATCH /api/customers/[id]
 * Update customer details
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    // 2. Verify customer exists and belongs to this business
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        businessId: businessId,
      },
    });

    if (!existingCustomer) {
      return errorResponse("Customer not found", 404);
    }

    // 3. Parse and validate input
    const body = await req.json();
    const validationResult = updateCustomerSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const data = validationResult.data;

    // 4. If phone is being updated, check for duplicates
    if (data.phone && data.phone !== existingCustomer.phone) {
      const duplicate = await prisma.customer.findFirst({
        where: {
          businessId: businessId,
          phone: data.phone,
          id: { not: params.id },
        },
      });

      if (duplicate) {
        return errorResponse(
          "Another customer with this phone number already exists",
          409
        );
      }
    }

    // 5. Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.address !== undefined && { address: data.address || null }),
      },
    });

    return successResponse(
      { customer: updatedCustomer },
      "Customer updated successfully"
    );
  } catch (error) {
    console.error("Customer update error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to update customer", 500);
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer (hard delete - no orders)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    // 2. Verify customer exists and belongs to this business
    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        businessId: businessId,
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // 3. Check if customer has any orders
    if (customer._count.orders > 0) {
      return errorResponse(
        `Cannot delete customer with ${customer._count.orders} order(s). Customer data is preserved for order history.`,
        400,
        { orderCount: customer._count.orders }
      );
    }

    // 4. Delete customer (only if no orders)
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return successResponse(
      { customerId: params.id },
      "Customer deleted successfully"
    );
  } catch (error) {
    console.error("Customer deletion error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to delete customer", 500);
  }
}