/**
 * Generates a unique tag/barcode ID for laundry items
 * Format: LP-{ORDER_PREFIX}-{ITEM_CODE}-{RANDOM}
 * Example: LP-ORD2401-SHT-A7F3
 */
export function generateTag(orderNumber: string, itemName: string): string {
  // Extract order prefix (e.g., "ORD-2401-001" -> "2401001")
  const orderPrefix = orderNumber.replace(/[^0-9]/g, '').slice(-6);
  
  // Generate item code from name (first 3 letters, uppercase)
  const itemCode = itemName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase();
  
  // Generate random suffix (4 characters)
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
  
  return `LP-${orderPrefix}-${itemCode}-${randomSuffix}`;
}

/**
 * Validates a tag format
 */
export function validateTag(tag: string): boolean {
  const pattern = /^LP-\d{6}-[A-Z]{3}-[A-Z0-9]{4}$/;
  return pattern.test(tag);
}

/**
 * Generates QR code data URL for a tag
 * @param tag The tag ID to encode
 * @returns Promise resolving to data URL
 */
export async function generateQRCode(tag: string): Promise<string> {
  // TODO: Implement actual QR code generation using a library like 'qrcode'
  // For now, return placeholder
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="20">${tag}</text></svg>`;
}