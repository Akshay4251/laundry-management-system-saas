// app/api/settings/business/logo/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/settings/business/logo - Upload logo
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
      return errorResponse('Permission denied', 403);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('No business associated', 400);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'laundrypro/business-logos',
          public_id: `business-${businessId}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' },
            { format: 'webp' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Update business with new logo URL
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { logoUrl: uploadResult.secure_url },
    });

    return successResponse({ logoUrl: updatedBusiness.logoUrl }, 'Logo uploaded successfully');
  } catch (error) {
    console.error('Error uploading logo:', error);
    return errorResponse('Failed to upload logo', 500);
  }
}

// DELETE /api/settings/business/logo - Remove logo
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
      return errorResponse('Permission denied', 403);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('No business associated', 400);
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(`laundrypro/business-logos/business-${businessId}`);
    } catch (e) {
      console.log('Cloudinary delete failed (may not exist):', e);
    }

    // Update business
    await prisma.business.update({
      where: { id: businessId },
      data: { logoUrl: null },
    });

    return successResponse(null, 'Logo removed successfully');
  } catch (error) {
    console.error('Error removing logo:', error);
    return errorResponse('Failed to remove logo', 500);
  }
}