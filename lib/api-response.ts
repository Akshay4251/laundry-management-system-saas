// lib/api-response.ts

import { NextResponse } from "next/server";

// ============= Types =============
export type ApiError = {
  success: false;
  error: string;
  message: string;
  details?: unknown;
  field?: string;
};

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type PaginatedData<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

// ============= Success Response =============
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiSuccess<T>,
    { status }
  );
}

// ============= Error Response =============
export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown,
  field?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: getErrorType(status),
      message,
      details,
      field,
    } as ApiError,
    { status }
  );
}

// ============= Error Type Mapping =============
function getErrorType(status: number): string {
  const errorTypes: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    500: "INTERNAL_SERVER_ERROR",
  };
  return errorTypes[status] || "ERROR";
}

// ============= Zod Error Handler =============
export function handleZodError(error: any) {
  const firstError = error.errors?.[0];
  return errorResponse(
    firstError?.message || "Validation failed",
    422,
    error.errors,
    firstError?.path?.join(".")
  );
}

// ============= Prisma Error Handler =============
export function handlePrismaError(error: any) {
  console.error("Prisma Error:", error);

  // Unique constraint violation
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field";
    return errorResponse(
      `A record with this ${field} already exists`,
      409,
      error.meta
    );
  }

  // Foreign key constraint violation
  if (error.code === "P2003") {
    return errorResponse("Related record not found", 404, error.meta);
  }

  // Record not found
  if (error.code === "P2025") {
    return errorResponse("Record not found", 404);
  }

  // Default Prisma error
  return errorResponse(
    "Database operation failed",
    500,
    process.env.NODE_ENV === "development" ? error.message : undefined
  );
}

// ============= API Response Object (Object-based API) =============
/**
 * Provides a clean object-based API for common responses
 * Usage: apiResponse.success(data), apiResponse.error(message), etc.
 */
export const apiResponse = {
  /**
   * Success response (200 OK)
   * @param data - Response data
   * @param message - Optional success message
   */
  success: <T>(data: T, message?: string) => {
    return successResponse(data, message, 200);
  },

  /**
   * Created response (201 Created)
   * @param data - Created resource data
   * @param message - Optional success message
   */
  created: <T>(data: T, message = "Created successfully") => {
    return successResponse(data, message, 201);
  },

  /**
   * Error response (500 Internal Server Error by default)
   * @param message - Error message
   * @param status - HTTP status code (default: 500)
   * @param details - Additional error details
   */
  error: (message: string, status = 500, details?: unknown) => {
    return errorResponse(message, status, details);
  },

  /**
   * Unauthorized response (401 Unauthorized)
   * @param message - Error message (default: "Unauthorized")
   */
  unauthorized: (message = "Unauthorized") => {
    return errorResponse(message, 401);
  },

  /**
   * Not Found response (404 Not Found)
   * @param message - Error message (default: "Not found")
   */
  notFound: (message = "Not found") => {
    return errorResponse(message, 404);
  },

  /**
   * Bad Request response (400 Bad Request)
   * @param message - Error message
   * @param details - Additional error details (e.g., validation errors)
   */
  badRequest: (message: string, details?: unknown) => {
    return errorResponse(message, 400, details);
  },

  /**
   * Forbidden response (403 Forbidden)
   * @param message - Error message (default: "Forbidden")
   */
  forbidden: (message = "Forbidden") => {
    return errorResponse(message, 403);
  },

  /**
   * Conflict response (409 Conflict)
   * @param message - Error message
   * @param details - Additional conflict details
   */
  conflict: (message: string, details?: unknown) => {
    return errorResponse(message, 409, details);
  },

  /**
   * Validation Error response (422 Unprocessable Entity)
   * @param message - Error message
   * @param details - Validation error details
   * @param field - Field that failed validation
   */
  validationError: (message: string, details?: unknown, field?: string) => {
    return errorResponse(message, 422, details, field);
  },

  /**
   * Paginated success response (200 OK)
   * @param data - Array of items
   * @param pagination - Pagination metadata
   * @param message - Optional success message
   */
  paginated: <T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    },
    message?: string
  ) => {
    return successResponse<PaginatedData<T>>(
      {
        data,
        pagination,
      },
      message,
      200
    );
  },
};

// ============= Helper: Create Pagination Object =============
/**
 * Helper function to create pagination metadata
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 */
export function createPagination(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore,
  };
}