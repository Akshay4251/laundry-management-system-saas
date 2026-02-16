// lib/customer-api-response.ts

import { NextResponse } from 'next/server';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export const customerApiResponse = {
  success<T>(data: T, message?: string, status = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    if (message) response.message = message;
    return NextResponse.json(response, { 
      status,
      headers: corsHeaders,
    });
  },

  error(message: string, status = 500, errors?: Record<string, string[]>) {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    if (errors) response.errors = errors;
    return NextResponse.json(response, { 
      status,
      headers: corsHeaders,
    });
  },

  unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  },

  notFound(message = 'Not found') {
    return this.error(message, 404);
  },

  badRequest(message: string, errors?: Record<string, string[]>) {
    return this.error(message, 400, errors);
  },
};

export function handleCorsPreflightRequest() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}