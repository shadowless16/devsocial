export const FEATURE_FLAGS = {
  USE_GAMIFICATION_SERVICE: process.env.USE_GAMIFICATION_SERVICE === 'true',
  USE_NOTIFICATION_SERVICE: process.env.USE_NOTIFICATION_SERVICE === 'true',
  USE_ANALYTICS_SERVICE: process.env.USE_ANALYTICS_SERVICE === 'true',
  USE_POSTS_SERVICE: process.env.USE_POSTS_SERVICE === 'true',
  USE_USER_SERVICE: process.env.USE_USER_SERVICE === 'true',
  USE_AUTH_SERVICE: process.env.USE_AUTH_SERVICE === 'true',
} as const

export function isServiceEnabled(service: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[service] ?? false
}
