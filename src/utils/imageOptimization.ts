// Advanced image optimization pipeline with multiple formats and responsive sizing

import { urlFor } from '../sanity/image'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface ImageVariant {
  width: number
  height?: number
  format: 'webp' | 'avif' | 'jpg' | 'png'
  quality: number
  descriptor: string // e.g., '1x', '2x', '400w'
}

export interface ResponsiveImageSet {
  src: string
  srcSet: string
  sizes: string
  webpSrcSet?: string
  avifSrcSet?: string
  placeholder: string
  dominantColor: string
  aspectRatio: number
  variants: ImageVariant[]
}

export interface OptimizationPreset {
  name: string
  breakpoints: number[]
  formats: ('webp' | 'avif' | 'jpg')[]
  quality: number
  aspectRatio?: number
}

// Predefined optimization presets
export const OPTIMIZATION_PRESETS: Record<string, OptimizationPreset> = {
  hero: {
    name: 'Hero Image',
    breakpoints: [400, 800, 1200, 1600, 2000],
    formats: ['avif', 'webp', 'jpg'],
    quality: 85,
    aspectRatio: 16 / 9
  },
  
  card: {
    name: 'Card Image',
    breakpoints: [200, 400, 600, 800],
    formats: ['avif', 'webp', 'jpg'],
    quality: 80,
    aspectRatio: 1
  },
  
  thumbnail: {
    name: 'Thumbnail',
    breakpoints: [100, 200, 300, 400],
    formats: ['webp', 'jpg'],
    quality: 75,
    aspectRatio: 1
  },
  
  gallery: {
    name: 'Gallery Image',
    breakpoints: [300, 600, 900, 1200],
    formats: ['avif', 'webp', 'jpg'],
    quality: 85
  },
  
  profile: {
    name: 'Profile Image',
    breakpoints: [150, 300, 450, 600],
    formats: ['webp', 'jpg'],
    quality: 80,
    aspectRatio: 3 / 4
  }
}

/**
 * Generate responsive image set with multiple formats and sizes
 */
export function generateResponsiveImageSet(
  source: SanityImageSource, 
  preset: OptimizationPreset,
  customSizes?: string
): ResponsiveImageSet {
  
  const variants: ImageVariant[] = []
  const srcSets: Record<string, string[]> = {
    jpg: [],
    webp: [],
    avif: []
  }
  
  // Generate variants for each breakpoint and format
  preset.breakpoints.forEach(width => {
    preset.formats.forEach(format => {
      const height = preset.aspectRatio ? Math.round(width / preset.aspectRatio) : undefined
      
      const variant: ImageVariant = {
        width,
        height,
        format,
        quality: preset.quality,
        descriptor: `${width}w`
      }
      
      variants.push(variant)
      
      // Generate Sanity URL for this variant
      let urlBuilder = urlFor(source).width(width).quality(preset.quality)
      
      if (height) {
        urlBuilder = urlBuilder.height(height).fit('crop').crop('center')
      }
      
      // Apply format
      switch (format) {
        case 'webp':
          urlBuilder = urlBuilder.format('webp')
          break
        case 'avif':
          urlBuilder = urlBuilder.format('webp') // Fallback to webp for avif
          break
        case 'jpg':
          urlBuilder = urlBuilder.format('jpg')
          break
      }
      
      const url = urlBuilder.url()
      srcSets[format].push(`${url} ${width}w`)
    })
  })
  
  // Generate base src (smallest JPG)
  const baseSrc = urlFor(source)
    .width(preset.breakpoints[0])
    .quality(preset.quality)
    .format('jpg')
    .url()
  
  // Generate placeholder (tiny, blurred)
  const placeholder = urlFor(source)
    .width(40)
    .height(preset.aspectRatio ? Math.round(40 / preset.aspectRatio) : 40)
    .blur(50)
    .quality(20)
    .format('jpg')
    .url()
  
  // Generate dominant color placeholder
  const dominantColor = urlFor(source)
    .width(1)
    .height(1)
    .format('jpg')
    .url()
  
  // Default sizes if not provided
  const sizes = customSizes || generateDefaultSizes(preset)
  
  return {
    src: baseSrc,
    srcSet: srcSets.jpg.join(', '),
    webpSrcSet: srcSets.webp.length ? srcSets.webp.join(', ') : undefined,
    avifSrcSet: srcSets.avif.length ? srcSets.avif.join(', ') : undefined,
    sizes,
    placeholder,
    dominantColor,
    aspectRatio: preset.aspectRatio || 1,
    variants
  }
}

/**
 * Generate default sizes attribute based on preset
 */
function generateDefaultSizes(preset: OptimizationPreset): string {
  switch (preset.name) {
    case 'Hero Image':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px'
    case 'Card Image':
      return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px'
    case 'Thumbnail':
      return '(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 150px'
    case 'Gallery Image':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px'
    case 'Profile Image':
      return '(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 200px'
    default:
      return '100vw'
  }
}

/**
 * Generate critical CSS for image placeholders
 */
export function generatePlaceholderCSS(imageSet: ResponsiveImageSet): string {
  return `
    .image-placeholder {
      background-color: ${imageSet.dominantColor};
      background-image: url('${imageSet.placeholder}');
      background-size: cover;
      background-position: center;
      filter: blur(2px);
      transform: scale(1.1);
      transition: all 0.3s ease;
    }
    
    .image-loaded .image-placeholder {
      opacity: 0;
    }
  `
}

/**
 * Calculate optimal image loading strategy
 */
export interface LoadingStrategy {
  loading: 'lazy' | 'eager'
  decoding: 'sync' | 'async' | 'auto'
  fetchPriority: 'high' | 'low' | 'auto'
  preload: boolean
}

export function calculateLoadingStrategy(
  preset: OptimizationPreset,
  isAboveFold: boolean = false,
  isCritical: boolean = false
): LoadingStrategy {
  
  // Critical images (hero, above-fold)
  if (isCritical || isAboveFold) {
    return {
      loading: 'eager',
      decoding: 'sync',
      fetchPriority: 'high',
      preload: true
    }
  }
  
  // Hero images get priority
  if (preset.name === 'Hero Image') {
    return {
      loading: 'eager',
      decoding: 'async',
      fetchPriority: 'high',
      preload: true
    }
  }
  
  // Regular images
  return {
    loading: 'lazy',
    decoding: 'async',
    fetchPriority: 'auto',
    preload: false
  }
}

/**
 * Generate preload links for critical images
 */
export function generatePreloadLinks(imageSets: ResponsiveImageSet[]): string[] {
  return imageSets.map(imageSet => {
    const links: string[] = []
    
    // Preload AVIF if available
    if (imageSet.avifSrcSet) {
      links.push(
        `<link rel="preload" as="image" type="image/avif" imagesrcset="${imageSet.avifSrcSet}" imagesizes="${imageSet.sizes}">`
      )
    }
    
    // Preload WebP if available
    if (imageSet.webpSrcSet) {
      links.push(
        `<link rel="preload" as="image" type="image/webp" imagesrcset="${imageSet.webpSrcSet}" imagesizes="${imageSet.sizes}">`
      )
    }
    
    // Fallback JPG preload
    links.push(
      `<link rel="preload" as="image" imagesrcset="${imageSet.srcSet}" imagesizes="${imageSet.sizes}">`
    )
    
    return links
  }).flat()
}

/**
 * Progressive image enhancement utilities
 */
export class ProgressiveImageLoader {
  private observer: IntersectionObserver | null = null
  private loadedImages = new Set<string>()
  
  constructor() {
    this.initializeObserver()
  }
  
  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target as HTMLElement)
          }
        })
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    )
  }
  
  public observeImage(element: HTMLElement): void {
    if (!this.observer) return
    this.observer.observe(element)
  }
  
  private async loadImage(element: HTMLElement): Promise<void> {
    const imageId = element.dataset.imageId
    if (!imageId || this.loadedImages.has(imageId)) return
    
    try {
      const img = element.querySelector('img') as HTMLImageElement
      if (!img) return
      
      // Get responsive image data
      const avifSrcSet = element.dataset.avifSrcset
      const webpSrcSet = element.dataset.webpSrcset
      const jpgSrcSet = element.dataset.jpgSrcset || img.srcset
      const sizes = element.dataset.sizes || img.sizes
      
      // Create picture element for format selection
      if (avifSrcSet || webpSrcSet) {
        const picture = document.createElement('picture')
        
        // Add AVIF source
        if (avifSrcSet) {
          const avifSource = document.createElement('source')
          avifSource.srcset = avifSrcSet
          avifSource.sizes = sizes
          avifSource.type = 'image/avif'
          picture.appendChild(avifSource)
        }
        
        // Add WebP source
        if (webpSrcSet) {
          const webpSource = document.createElement('source')
          webpSource.srcset = webpSrcSet
          webpSource.sizes = sizes
          webpSource.type = 'image/webp'
          picture.appendChild(webpSource)
        }
        
        // Update img with JPG fallback
        img.srcset = jpgSrcSet
        img.sizes = sizes
        
        // Replace img with picture
        picture.appendChild(img)
        element.replaceChild(picture, element.querySelector('img, picture')!)
      } else {
        // Simple responsive image
        img.srcset = jpgSrcSet
        img.sizes = sizes
      }
      
      // Wait for image to load
      await this.waitForImageLoad(img)
      
      // Mark as loaded
      element.classList.add('image-loaded')
      this.loadedImages.add(imageId)
      
      // Track loading performance
      if (window.trackContentInteraction) {
        window.trackContentInteraction('project', imageId, 'Image loaded', 'interact')
      }
      
      // Stop observing
      if (this.observer) {
        this.observer.unobserve(element)
      }
      
    } catch (error) {
      console.warn('Failed to load progressive image:', error)
    }
  }
  
  private waitForImageLoad(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (img.complete) {
        resolve()
        return
      }
      
      img.addEventListener('load', () => resolve())
      img.addEventListener('error', reject)
      
      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Image load timeout')), 10000)
    })
  }
  
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Export singleton instance
export const progressiveLoader = new ProgressiveImageLoader()

/**
 * Image optimization metrics tracking
 */
export function trackImagePerformance(imageId: string, metrics: {
  loadTime: number
  size: number
  format: string
  fromCache: boolean
}): void {
  if (window.analytics) {
    window.analytics.trackContentEngagement({
      contentType: 'project',
      contentId: imageId,
      contentTitle: `Image Performance: ${metrics.format}`,
      action: 'view',
      metadata: {
        loadTime: metrics.loadTime,
        size: metrics.size,
        format: metrics.format,
        fromCache: metrics.fromCache
      }
    })
  }
}