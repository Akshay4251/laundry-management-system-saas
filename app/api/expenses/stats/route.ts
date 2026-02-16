// app/api/expenses/stats/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

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
    const dateRange = searchParams.get("dateRange") || "month";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const where: Prisma.ExpenseWhereInput = {
      businessId,
      deletedAt: null,
      ...(dateRange !== "all" && { date: { gte: startDate } }),
    };

    // Get aggregated stats
    const [aggregate, byCategory, byPaymentMethod] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ["category"],
        where,
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ["paymentMethod"],
        where,
        _sum: { amount: true },
      }),
    ]);

    const stats = {
      totalAmount: parseFloat(aggregate._sum.amount?.toString() || "0"),
      count: aggregate._count,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = parseFloat(item._sum.amount?.toString() || "0");
        return acc;
      }, {} as Record<string, number>),
      byPaymentMethod: byPaymentMethod.reduce((acc, item) => {
        acc[item.paymentMethod] = parseFloat(item._sum.amount?.toString() || "0");
        return acc;
      }, {} as Record<string, number>),
    };

    return successResponse({ stats });
  } catch (error) {
    console.error("Expense stats error:", error);
    return errorResponse("Failed to fetch expense stats", 500);
  }
}