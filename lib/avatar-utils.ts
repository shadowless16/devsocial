// Utility function to handle ReadyPlayerMe avatar URLs
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) return "/placeholder.svg";

  // Defensive: remove surrounding whitespace and surrounding quotes
  let url = String(avatarUrl).trim();
  // strip leading/trailing single or double quotes
  url = url.replace(/^['"]+|['"]+$/g, '');

  // Check if it's a ReadyPlayerMe URL
  if (url.includes('models.readyplayer.me')) {
    // Remove query parameters (anything after '?') and convert .glb to .png
    const baseUrl = url.split('?')[0];
    return baseUrl.replace(/\.glb$/i, '.png');
  }

  return url;
}