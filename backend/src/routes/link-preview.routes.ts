import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import fetch from 'node-fetch'

const router = Router()

interface ApiError {
  message: string
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

// POST /api/link-preview - Generate metadata preview for a URL
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DevSocial/1.0; +https://devsocial.com)'
      }
    })

    const html = await response.text()

    const getMetaContent = (property: string): string | null => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
        new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) return match[1]
      }
      return null
    }

    const title = getMetaContent('og:title') || 
                  getMetaContent('twitter:title') || 
                  html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 
                  'No title'

    const description = getMetaContent('og:description') || 
                       getMetaContent('twitter:description') || 
                       getMetaContent('description') || 
                       ''

    const image = getMetaContent('og:image') || 
                  getMetaContent('twitter:image') || 
                  ''

    let siteName = getMetaContent('og:site_name')
    if (!siteName) {
      try {
        siteName = new URL(url).hostname
      } catch {
        siteName = 'Unknown'
      }
    }

    res.json({
      success: true,
      data: {
        title: title.trim(),
        description: description.trim(),
        image: image.trim(),
        url,
        siteName
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Link preview error:', errorMessage)
    res.status(500).json({ success: false, message: `Failed to fetch link preview: ${errorMessage}` })
  }
})

export default router
