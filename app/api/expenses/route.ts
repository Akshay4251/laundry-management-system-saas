// app/api/expenses/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createExpenseSchema,
  expenseQuerySchema,
} from "@/lib/validations/expense";
import {
  successResponse,
  errorResponse,
  handleZodError,
  handlePrismaError,
} from "@/lib/api-response";
import { Prisma, ExpenseCategory, ExpensePaymentMethod } from "@prisma/client";

// ============= Helper: Get Date Range Filter =============
function getDateRangeFilter(range: string): { gte?: Date; lte?: Date } | undefined {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return { gte: startOfToday };
    case "week": {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return { gte: startOfWeek };
    }
    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: startOfMonth };
    }
    case "quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      return { gte: startOfQuarter };
    }
    case "year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { gte: startOfYear };
    }
    default:
      return undefined;
  }
}

/**
 * GET /api/expenses
 * List expenses with search, filter, and pagination
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
    const queryValidation = expenseQuerySchema.safeParse({
      search: searchParams.get("search"),
      category: searchParams.get("category"),
      dateRange: searchParams.get("dateRange"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      paymentMethod: searchParams.get("paymentMethod"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    if (!queryValidation.success) {
      return handleZodError(queryValidation.error);
    }

    const {
      search,
      category,
      dateRange,
      startDate,
      endDate,
      paymentMethod,
      page,
      limit,
      sortBy,
      sortOrder,
    } = queryValidation.data;

    // Build date filter
    let dateFilter: Prisma.DateTimeFilter | undefined;
    
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (dateRange && dateRange !== "all") {
      dateFilter = getDateRangeFilter(dateRange);
    }

    const where: Prisma.ExpenseWhereInput = {
      businessId,
      deletedAt: null,
      ...(search && {
        OR: [
          { description: { contains: search, mode: "insensitive" } },
          { vendor: { contains: search, mode: "insensitive" } },
          { receipt: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && category !== "all" && {
        category: category as ExpenseCategory,
      }),
      ...(paymentMethod && paymentMethod !== "all" && {
        paymentMethod: paymentMethod as ExpensePaymentMethod,
      }),
      ...(dateFilter && { date: dateFilter }),
    };

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    // Transform expenses
    const transformedExpenses = expenses.map((expense) => ({
      id: expense.id,
      businessId: expense.businessId,
      storeId: expense.storeId,
      description: expense.description,
      category: expense.category,
      amount: parseFloat(expense.amount.toString()),
      date: expense.date.toISOString(),
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendor,
      receipt: expense.receipt,
      notes: expense.notes,
      createdBy: expense.createdBy,
      deletedAt: expense.deletedAt?.toISOString() || null,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      data: transformedExpenses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Expenses fetch error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to fetch expenses", 500);
  }
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse("Business not found", 404);
    }

    const body = await req.json();
    const validationResult = createExpenseSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const data = validationResult.data;

    const expense = await prisma.expense.create({
      data: {
        businessId,
        description: data.description,
        category: data.category,
        amount: data.amount,
        date: new Date(data.date),
        paymentMethod: data.paymentMethod,
        vendor: data.vendor || null,
        receipt: data.receipt || null,
        notes: data.notes || null,
        storeId: data.storeId || null,
        createdBy: session.user.id,
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
      "Expense created successfully",
      201
    );
  } catch (error) {
    console.error("Expense creation error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse("Failed to create expense", 500);
  }
}