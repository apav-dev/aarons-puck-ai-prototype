/**
 * Helper function to determine if a color is light or dark
 * This can be safely imported in client components
 */
export function isLightColor(hex: string | undefined | null): boolean {
  // Handle undefined/null/empty values
  if (!hex || typeof hex !== "string") {
    return false; // Default to dark if invalid
  }

  // Remove # if present
  const color = hex.replace("#", "");
  
  // Validate hex color format (must be 6 hex digits)
  if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
    return false; // Default to dark if invalid format
  }

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

