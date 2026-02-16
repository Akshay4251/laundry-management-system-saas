// app/api/expenses/[id]/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateExpenseSchema } from "@/lib/validations/expense";
import {
  successResponse,
  errorResponse,
  handleZodError,
  handlePrismaError,
} from "@/lib/api-response";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/expenses/[id]
 * Get a single expense by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    const { id } = await params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null,
      },
    });

    if (!expense) {
      return errorResponse("Expense not found", 404);
    }

    const transformedExpense = {
      ...expense,
      amount: parseFloat(expense.amount.toString()),
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      deletedAt: expense.deletedAt?.toISOString() || null,
    };

    return successResponse({ expense: transformedExpense });
  } catch (error) {
    console.error("Expense fetch error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to fetch expense", 500);
  }
}

/**
 * PATCH /api/expenses/[id]
 * Update an expense
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    const { id } = await params;

    // Verify expense exists and belongs to business
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null,
      },
    });

    if (!existingExpense) {
      return errorResponse("Expense not found", 404);
    }

    const body = await req.json();
    const validationResult = updateExpenseSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const data = validationResult.data;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
        ...(data.vendor !== undefined && { vendor: data.vendor || null }),
        ...(data.receipt !== undefined && { receipt: data.receipt || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.storeId !== undefined && { storeId: data.storeId || null }),
      },
    });

    const transformedExpense = {
      ...expense,
      amount: parseFloat(expense.amount.toString()),
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      deletedAt: expense.deletedAt?.toISOString() || null,
    };

    return successResponse(
      { expense: transformedExpense },
      "Expense updated successfully"
    );
  } catch (error) {
    console.error("Expense update error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to update expense", 500);
  }
}

/**
 * DELETE /api/expenses/[id]
 * Soft delete an expense
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    const { id } = await params;

    // Verify expense exists and belongs to business
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null,
      },
    });

    if (!existingExpense) {
      return errorResponse("Expense not found", 404);
    }

    // Soft delete
    await prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return successResponse(null, "Expense deleted successfully");
  } catch (error) {
    console.error("Expense deletion error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to delete expense", 500);
  }
}