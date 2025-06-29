import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { sanityClient } from './client'

// Initialize the image URL builder
const builder = imageUrlBuilder(sanityClient)

// Helper function to generate image URLs with error handling
export function urlFor(source: SanityImageSource) {
  if (!source) {
    throw new Error('Image source is required')
  }
  
  if (typeof source === 'object' && !source.asset && !source._ref) {
    throw new Error('Invalid image source: missing asset or _ref')
  }
  
  return builder.image(source)
}

// Preset image sizes for consistent usage across the site
export const imageSizes = {
  // Profile/avatar images
  avatar: {
    small: { width: 64, height: 64 },
    medium: { width: 128, height: 128 },
    large: { width: 256, height: 256 }
  },
  
  // Playlist cover art
  playlist: {
    thumbnail: { width: 200, height: 200 },
    card: { width: 300, height: 300 },
    hero: { width: 600, height: 600 }
  },
  
  // Project images
  project: {
    thumbnail: { width: 300, height: 200 },
    card: { width: 500, height: 300 },
    hero: { width: 1200, height: 800 }
  },
  
  // Playground images
  playground: {
    thumbnail: { width: 200, height: 200 },
    card: { width: 400, height: 400 },
    featured: { width: 800, height: 600 }
  }
}

// Optimized image component props helper
export function getOptimizedImageProps(
  source: SanityImageSource,
  size: keyof typeof imageSizes | { width: number; height: number },
  options: {
    quality?: number
    format?: 'webp' | 'jpg' | 'png' | 'auto'
    fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min'
  } = {}
) {
  const {
    quality = 85,
    format = 'webp',
    fit = 'crop'
  } = options

  let dimensions: { width: number; height: number }
  
  if (typeof size === 'string') {
    // Use preset sizes - need to access nested objects
    const category = size.split('.')[0] as keyof typeof imageSizes
    const variant = size.split('.')[1] as keyof typeof imageSizes[typeof category]
    dimensions = imageSizes[category][variant] as { width: number; height: number }
  } else {
    dimensions = size
  }

  const url = urlFor(source)
    .width(dimensions.width)
    .height(dimensions.height)
    .quality(quality)
    .format(format)
    .fit(fit)
    .url()

  return {
    src: url,
    width: dimensions.width,
    height: dimensions.height,
    loading: 'lazy' as const
  }
}

// Generate responsive image srcset
export function getResponsiveImageProps(
  source: SanityImageSource,
  baseSize: { width: number; height: number },
  options: {
    quality?: number
    format?: 'webp' | 'jpg' | 'png' | 'auto'
    fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min'
    scales?: number[]
  } = {}
) {
  const {
    quality = 85,
    format = 'webp',
    fit = 'crop',
    scales = [1, 1.5, 2]
  } = options

  const srcset = scales
    .map(scale => {
      const width = Math.round(baseSize.width * scale)
      const height = Math.round(baseSize.height * scale)
      
      const url = urlFor(source)
        .width(width)
        .height(height)
        .quality(quality)
        .format(format)
        .fit(fit)
        .url()
      
      return `${url} ${scale}x`
    })
    .join(', ')

  const fallbackUrl = urlFor(source)
    .width(baseSize.width)
    .height(baseSize.height)
    .quality(quality)
    .format('jpg') // Fallback to JPG for better compatibility
    .fit(fit)
    .url()

  return {
    src: fallbackUrl,
    srcSet: srcset,
    width: baseSize.width,
    height: baseSize.height,
    loading: 'lazy' as const
  }
}
