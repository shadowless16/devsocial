// Auto-cleanup old auth cookies on version mismatch
export function cleanupOldAuthCookies() {
  if (typeof window === 'undefined') return

  const APP_VERSION = '2.0.0' // Increment this when auth changes
  const VERSION_KEY = 'app_version'
  
  const currentVersion = localStorage.getItem(VERSION_KEY)
  
  if (currentVersion !== APP_VERSION) {
    // Clear all next-auth cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      if (name.includes('next-auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
    
    localStorage.setItem(VERSION_KEY, APP_VERSION)
    console.log('[Auth] Cleaned up old cookies for new version')
  }
}
