import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload helper function
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options?: {
    folder?: string;
    filename?: string;
  }
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    const uploadOptions = {
      folder: options?.folder || 'laundry-saas/service-icons',
      public_id: options?.filename || `icon-${timestamp}-${random}`,
      resource_type: 'image' as const,
      transformation: [
        {
          width: 512,
          height: 512,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error(error.message || 'Upload failed'));
        }

        if (!result) {
          return reject(new Error('Upload failed - no result'));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

// Delete helper function
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}