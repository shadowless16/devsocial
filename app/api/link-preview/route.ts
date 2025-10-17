import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
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

    const siteName = getMetaContent('og:site_name') || new URL(url).hostname

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      url,
      siteName
    })

  } catch (error) {
    console.error('Link preview error:', error)
    return NextResponse.json({ error: 'Failed to fetch link preview' }, { status: 500 })
  }
}
