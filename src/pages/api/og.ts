// Dynamic Open Graph image generation API endpoint
import type { APIRoute } from 'astro'
import { OGImageGenerator, type OGImageOptions } from '../../utils/seoAutomation'
import { extractImageColors, type ColorPalette } from '../../utils/colorExtraction'

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const searchParams = url.searchParams
    
    // Extract parameters
    const title = searchParams.get('title') || 'Jeffrey Herrera'
    const subtitle = searchParams.get('subtitle') || undefined
    const category = searchParams.get('category') || undefined
    const template = (searchParams.get('template') as OGImageOptions['template']) || 'minimal'
    const width = parseInt(searchParams.get('w') || '1200')
    const height = parseInt(searchParams.get('h') || '630')
    const imageUrl = searchParams.get('image')
    const colorsParam = searchParams.get('colors')

    let palette: ColorPalette | undefined

    // Parse color palette if provided
    if (colorsParam) {
      try {
        const colors = JSON.parse(decodeURIComponent(colorsParam))
        palette = {
          dominant: colors.dominant || '#f97316',
          secondary: colors.secondary || '#64748b',
          accent: colors.accent || '#06b6d4',
          text: colors.text || '#1a1a1a',
          background: colors.background || '#ffffff',
          muted: colors.muted || '#6b7280'
        }
      } catch (error) {
        console.warn('Failed to parse color palette:', error)
      }
    }

    // Extract colors from image if URL provided and no palette
    if (imageUrl && !palette) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        // This would need to be implemented server-side with a proper image processing library
        // For now, we'll use default colors
        palette = {
          dominant: '#f97316',
          secondary: '#64748b',
          accent: '#06b6d4',
          text: '#1a1a1a',
          background: '#ffffff',
          muted: '#6b7280'
        }
      } catch (error) {
        console.warn('Failed to extract colors from image:', error)
      }
    }

    // Generate SVG
    const svg = OGImageGenerator.generateSVG({
      title,
      subtitle,
      category,
      template,
      width,
      height,
      palette
    })

    // Return SVG response
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000'
      }
    })

  } catch (error) {
    console.error('OG image generation error:', error)
    
    // Return a simple fallback SVG
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f97316" />
        <text x="600" y="315" font-family="system-ui, sans-serif" font-size="72" 
              font-weight="bold" text-anchor="middle" fill="white">
          Jeffrey Herrera
        </text>
      </svg>
    `
    
    return new Response(fallbackSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300' // Cache fallback for 5 minutes
      }
    })
  }
}

// Prerender this endpoint for static generation
export const prerender = false