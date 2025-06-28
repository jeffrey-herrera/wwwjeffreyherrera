// Smart SEO automation with dynamic Open Graph image generation
import type { Project, Playlist, Playground } from '../sanity/types'
import { urlFor } from '../sanity/image'
import { extractImageColors, type ColorPalette } from './colorExtraction'

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  ogImage: string
  ogImageAlt: string
  canonicalUrl: string
  structuredData: Record<string, any>
  meta: {
    robots: string
    author: string
    publishedTime?: string
    modifiedTime?: string
    section?: string
    tags?: string[]
  }
}

export interface OGImageOptions {
  title: string
  subtitle?: string
  category?: string
  image?: any // Sanity image
  palette?: ColorPalette
  template: 'project' | 'playlist' | 'article' | 'minimal'
  width?: number
  height?: number
}

/**
 * SEO automation engine for generating comprehensive metadata
 */
export class SEOGenerator {
  private baseUrl: string
  private defaultAuthor: string
  private siteName: string

  constructor(config: {
    baseUrl: string
    defaultAuthor: string
    siteName: string
  }) {
    this.baseUrl = config.baseUrl
    this.defaultAuthor = config.defaultAuthor
    this.siteName = config.siteName
  }

  /**
   * Generate comprehensive SEO data for projects
   */
  generateProjectSEO(project: Project, path: string): SEOData {
    const title = `${project.title} | ${this.siteName}`
    const description = this.truncateDescription(
      project.description || `${project.category} project by ${this.defaultAuthor}`,
      160
    )
    
    const keywords = this.generateKeywords([
      project.title,
      project.category,
      ...(project.tags || []),
      'design',
      'portfolio',
      this.defaultAuthor
    ])

    const ogImage = this.generateOGImageUrl({
      title: project.title,
      subtitle: project.category,
      category: project.year?.toString(),
      image: project.image,
      template: 'project'
    })

    const structuredData = this.generateProjectStructuredData(project)

    return {
      title,
      description,
      keywords,
      ogImage,
      ogImageAlt: `${project.title} - ${project.category} project`,
      canonicalUrl: `${this.baseUrl}${path}`,
      structuredData,
      meta: {
        robots: 'index, follow',
        author: this.defaultAuthor,
        publishedTime: project.publishedAt,
        section: 'portfolio',
        tags: project.tags
      }
    }
  }

  /**
   * Generate SEO data for playlists
   */
  generatePlaylistSEO(playlist: Playlist, path: string): SEOData {
    const title = `${playlist.name} | Music Playlist | ${this.siteName}`
    const description = this.truncateDescription(
      playlist.description || 
      `${playlist.month} ${playlist.year} music playlist curated by ${this.defaultAuthor}`,
      160
    )

    const keywords = this.generateKeywords([
      playlist.name,
      'music',
      'playlist',
      playlist.month,
      playlist.year?.toString(),
      'spotify',
      this.defaultAuthor
    ])

    const ogImage = this.generateOGImageUrl({
      title: playlist.name,
      subtitle: `${playlist.month} ${playlist.year}`,
      category: 'Music Playlist',
      image: playlist.coverArt,
      template: 'playlist'
    })

    const structuredData = this.generatePlaylistStructuredData(playlist)

    return {
      title,
      description,
      keywords,
      ogImage,
      ogImageAlt: `${playlist.name} - ${playlist.month} ${playlist.year} playlist`,
      canonicalUrl: `${this.baseUrl}${path}`,
      structuredData,
      meta: {
        robots: 'index, follow',
        author: this.defaultAuthor,
        publishedTime: playlist.publishedAt,
        section: 'music',
        tags: [playlist.month, playlist.year?.toString()].filter(Boolean)
      }
    }
  }

  /**
   * Generate SEO data for playground items
   */
  generatePlaygroundSEO(item: Playground, path: string): SEOData {
    const title = `${item.title} | ${this.siteName}`
    const description = this.truncateDescription(
      item.description || `${item.type} experiment by ${this.defaultAuthor}`,
      160
    )

    const keywords = this.generateKeywords([
      item.title,
      item.type,
      'experiment',
      'creative',
      'playground',
      this.defaultAuthor
    ])

    const ogImage = this.generateOGImageUrl({
      title: item.title,
      subtitle: item.type,
      category: 'Playground',
      image: item.image,
      template: 'article'
    })

    const structuredData = this.generatePlaygroundStructuredData(item)

    return {
      title,
      description,
      keywords,
      ogImage,
      ogImageAlt: `${item.title} - ${item.type} experiment`,
      canonicalUrl: `${this.baseUrl}${path}`,
      structuredData,
      meta: {
        robots: 'index, follow',
        author: this.defaultAuthor,
        publishedTime: item.publishedAt,
        section: 'playground'
      }
    }
  }

  /**
   * Generate dynamic Open Graph image URL
   */
  generateOGImageUrl(options: OGImageOptions): string {
    const params = new URLSearchParams()
    
    params.set('title', options.title)
    params.set('template', options.template)
    
    if (options.subtitle) params.set('subtitle', options.subtitle)
    if (options.category) params.set('category', options.category)
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    
    // Include image if available
    if (options.image) {
      const imageUrl = urlFor(options.image).width(400).height(400).url()
      params.set('image', encodeURIComponent(imageUrl))
    }

    // Include color palette if available
    if (options.palette) {
      params.set('colors', encodeURIComponent(JSON.stringify({
        dominant: options.palette.dominant,
        secondary: options.palette.secondary,
        accent: options.palette.accent
      })))
    }

    return `${this.baseUrl}/api/og?${params.toString()}`
  }

  /**
   * Generate keywords from content
   */
  private generateKeywords(terms: (string | undefined)[]): string[] {
    const filtered = terms.filter(Boolean) as string[]
    const lowercased = filtered.map(term => term.toLowerCase())
    const unique = [...new Set(lowercased)]
    
    // Add common design/portfolio terms
    const commonTerms = [
      'design', 'creative', 'portfolio', 'visual', 'art',
      'user experience', 'interface', 'branding'
    ]
    
    return [...unique, ...commonTerms].slice(0, 15) // Limit to 15 keywords
  }

  /**
   * Truncate description to specified length with ellipsis
   */
  private truncateDescription(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    
    const truncated = text.substring(0, maxLength - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }

  /**
   * Generate structured data for projects
   */
  private generateProjectStructuredData(project: Project): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description: project.description,
      creator: {
        '@type': 'Person',
        name: this.defaultAuthor
      },
      datePublished: project.publishedAt,
      genre: project.category,
      keywords: project.tags?.join(', '),
      image: project.image ? urlFor(project.image).width(1200).height(630).url() : undefined,
      url: `${this.baseUrl}/work/${project.slug.current}`
    }
  }

  /**
   * Generate structured data for playlists
   */
  private generatePlaylistStructuredData(playlist: Playlist): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'MusicPlaylist',
      name: playlist.name,
      description: playlist.description,
      creator: {
        '@type': 'Person',
        name: this.defaultAuthor
      },
      datePublished: playlist.publishedAt,
      numTracks: playlist.trackCount,
      genre: 'Various',
      image: playlist.coverArt ? urlFor(playlist.coverArt).width(1200).height(630).url() : undefined,
      url: playlist.spotifyUrl
    }
  }

  /**
   * Generate structured data for playground items
   */
  private generatePlaygroundStructuredData(item: Playground): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.title,
      description: item.description,
      author: {
        '@type': 'Person',
        name: this.defaultAuthor
      },
      datePublished: item.publishedAt,
      articleSection: 'Playground',
      keywords: `${item.type}, experiment, creative`,
      image: item.image ? urlFor(item.image).width(1200).height(630).url() : undefined,
      url: `${this.baseUrl}/playground/${item.slug.current}`
    }
  }
}

/**
 * Dynamic Open Graph image generator
 */
export class OGImageGenerator {
  /**
   * Generate Open Graph image as SVG
   */
  static generateSVG(options: OGImageOptions): string {
    const { title, subtitle, category, template, palette } = options
    const width = options.width || 1200
    const height = options.height || 630

    // Default color palette
    const colors = palette || {
      dominant: '#f97316',
      secondary: '#64748b', 
      accent: '#06b6d4',
      text: '#1a1a1a',
      background: '#ffffff',
      muted: '#6b7280'
    }

    const templates = {
      project: this.generateProjectTemplate(width, height, title, subtitle, category, colors),
      playlist: this.generatePlaylistTemplate(width, height, title, subtitle, category, colors),
      article: this.generateArticleTemplate(width, height, title, subtitle, category, colors),
      minimal: this.generateMinimalTemplate(width, height, title, subtitle, category, colors)
    }

    return templates[template] || templates.minimal
  }

  /**
   * Project template with geometric design
   */
  private static generateProjectTemplate(
    width: number, 
    height: number, 
    title: string, 
    subtitle?: string, 
    category?: string, 
    colors?: ColorPalette
  ): string {
    const c = colors!
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${c.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${c.secondary}20;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${c.dominant};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${c.accent};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)" />
        
        <!-- Geometric shapes -->
        <circle cx="${width * 0.85}" cy="${height * 0.25}" r="120" fill="${c.dominant}30" />
        <rect x="${width * 0.7}" y="${height * 0.6}" width="200" height="200" rx="20" fill="${c.accent}20" transform="rotate(15)" />
        
        <!-- Content area -->
        <rect x="60" y="0" width="8" height="100%" fill="url(#accent)" />
        
        <!-- Text content -->
        <text x="120" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="${c.text}">
          ${this.escapeXML(this.truncateText(title, 30))}
        </text>
        
        ${subtitle ? `
          <text x="120" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="${c.secondary}">
            ${this.escapeXML(subtitle)}
          </text>
        ` : ''}
        
        ${category ? `
          <rect x="120" y="320" width="${category.length * 14 + 24}" height="40" rx="20" fill="${c.dominant}" />
          <text x="132" y="345" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="white">
            ${this.escapeXML(category)}
          </text>
        ` : ''}
        
        <!-- Bottom branding -->
        <text x="120" y="${height - 60}" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${c.muted}">
          Jeffrey Herrera — Design Director
        </text>
      </svg>
    `
  }

  /**
   * Playlist template with music-themed design
   */
  private static generatePlaylistTemplate(
    width: number, 
    height: number, 
    title: string, 
    subtitle?: string, 
    category?: string, 
    colors?: ColorPalette
  ): string {
    const c = colors!
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="musicBg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" style="stop-color:${c.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${c.dominant}15;stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#musicBg)" />
        
        <!-- Vinyl record design -->
        <circle cx="${width * 0.8}" cy="${height * 0.5}" r="150" fill="${c.text}" opacity="0.1" />
        <circle cx="${width * 0.8}" cy="${height * 0.5}" r="100" fill="${c.dominant}" opacity="0.2" />
        <circle cx="${width * 0.8}" cy="${height * 0.5}" r="25" fill="${c.text}" opacity="0.3" />
        
        <!-- Sound waves -->
        <path d="M 60 ${height * 0.3} Q 200 ${height * 0.2} 340 ${height * 0.3}" stroke="${c.accent}" stroke-width="4" fill="none" opacity="0.6" />
        <path d="M 60 ${height * 0.5} Q 200 ${height * 0.4} 340 ${height * 0.5}" stroke="${c.dominant}" stroke-width="6" fill="none" />
        <path d="M 60 ${height * 0.7} Q 200 ${height * 0.6} 340 ${height * 0.7}" stroke="${c.accent}" stroke-width="4" fill="none" opacity="0.6" />
        
        <!-- Text content -->
        <text x="60" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="700" fill="${c.text}">
          ${this.escapeXML(this.truncateText(title, 25))}
        </text>
        
        ${subtitle ? `
          <text x="60" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="${c.secondary}">
            ${this.escapeXML(subtitle)}
          </text>
        ` : ''}
        
        <text x="60" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="${c.dominant}" font-weight="600">
          ♪ PLAYLIST
        </text>
        
        <!-- Bottom branding -->
        <text x="60" y="${height - 60}" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${c.muted}">
          Curated by Jeffrey Herrera
        </text>
      </svg>
    `
  }

  /**
   * Article template for playground items
   */
  private static generateArticleTemplate(
    width: number, 
    height: number, 
    title: string, 
    subtitle?: string, 
    category?: string, 
    colors?: ColorPalette
  ): string {
    const c = colors!
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="2" fill="${c.accent}" opacity="0.1" />
          </pattern>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="${c.background}" />
        <rect width="100%" height="100%" fill="url(#dots)" />
        
        <!-- Header bar -->
        <rect x="0" y="0" width="100%" height="8" fill="${c.dominant}" />
        
        <!-- Content card -->
        <rect x="80" y="120" width="${width - 160}" height="${height - 240}" rx="16" fill="white" stroke="${c.secondary}30" stroke-width="2" />
        
        <!-- Text content -->
        <text x="120" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="60" font-weight="700" fill="${c.text}">
          ${this.escapeXML(this.truncateText(title, 35))}
        </text>
        
        ${subtitle ? `
          <text x="120" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="${c.secondary}">
            ${this.escapeXML(subtitle)}
          </text>
        ` : ''}
        
        ${category ? `
          <text x="120" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${c.dominant}" font-weight="600">
            ${this.escapeXML(category.toUpperCase())}
          </text>
        ` : ''}
        
        <!-- Decorative elements -->
        <rect x="${width - 200}" y="200" width="80" height="4" rx="2" fill="${c.accent}" />
        <rect x="${width - 200}" y="220" width="120" height="4" rx="2" fill="${c.dominant}" />
        <rect x="${width - 200}" y="240" width="60" height="4" rx="2" fill="${c.secondary}" />
        
        <!-- Bottom branding -->
        <text x="120" y="${height - 80}" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${c.muted}">
          Jeffrey Herrera / Playground
        </text>
      </svg>
    `
  }

  /**
   * Minimal template for general use
   */
  private static generateMinimalTemplate(
    width: number, 
    height: number, 
    title: string, 
    subtitle?: string, 
    category?: string, 
    colors?: ColorPalette
  ): string {
    const c = colors!
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="100%" height="100%" fill="${c.background}" />
        
        <!-- Simple accent -->
        <rect x="0" y="${height - 12}" width="100%" height="12" fill="${c.dominant}" />
        
        <!-- Text content centered -->
        <text x="${width / 2}" y="${height / 2 - 40}" font-family="system-ui, -apple-system, sans-serif" 
              font-size="68" font-weight="800" text-anchor="middle" fill="${c.text}">
          ${this.escapeXML(this.truncateText(title, 30))}
        </text>
        
        ${subtitle ? `
          <text x="${width / 2}" y="${height / 2 + 20}" font-family="system-ui, -apple-system, sans-serif" 
                font-size="36" text-anchor="middle" fill="${c.secondary}">
            ${this.escapeXML(subtitle)}
          </text>
        ` : ''}
        
        <!-- Bottom branding -->
        <text x="${width / 2}" y="${height - 60}" font-family="system-ui, -apple-system, sans-serif" 
              font-size="28" text-anchor="middle" fill="${c.muted}">
          Jeffrey Herrera
        </text>
      </svg>
    `
  }

  /**
   * Utility methods
   */
  private static truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
  }

  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}

// Export default instance
export const defaultSEOGenerator = new SEOGenerator({
  baseUrl: 'https://jeffreyherrera.com', // Update with actual domain
  defaultAuthor: 'Jeffrey Herrera',
  siteName: 'Jeffrey Herrera'
})