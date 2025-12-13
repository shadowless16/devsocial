const SERVICES = {
  gamification: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3001',
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3002',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003',
}

export async function proxyToService(
  service: keyof typeof SERVICES,
  path: string,
  options: RequestInit
) {
  const url = `${SERVICES[service]}${path}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    })
    
    return response
  } catch (error) {
    console.error(`Service proxy error (${service}):`, error)
    throw error
  }
}
