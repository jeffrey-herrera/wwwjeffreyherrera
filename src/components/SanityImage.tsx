import React from 'react'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { getOptimizedImageProps, getResponsiveImageProps, imageSizes } from '../sanity/image'

interface SanityImageProps {
  source: SanityImageSource
  alt: string
  size?: keyof typeof imageSizes | { width: number; height: number }
  responsive?: boolean
  className?: string
  quality?: number
  format?: 'webp' | 'jpg' | 'png' | 'auto'
  fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min'
  scales?: number[]
  priority?: boolean
}

export function SanityImage({
  source,
  alt,
  size = { width: 400, height: 300 },
  responsive = true,
  className = '',
  quality = 85,
  format = 'webp',
  fit = 'crop',
  scales = [1, 1.5, 2],
  priority = false
}: SanityImageProps) {
  if (!source) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={typeof size === 'object' ? { width: size.width, height: size.height } : undefined}
      >
        No image
      </div>
    )
  }

  // Determine dimensions
  let dimensions: { width: number; height: number }
  
  if (typeof size === 'string') {
    // This is a preset size like 'playlist.card'
    const [category, variant] = size.split('.') as [keyof typeof imageSizes, string]
    dimensions = imageSizes[category][variant as keyof typeof imageSizes[typeof category]] as { width: number; height: number }
  } else {
    dimensions = size
  }

  if (responsive) {
    const props = getResponsiveImageProps(source, dimensions, {
      quality,
      format,
      fit,
      scales
    })

    return (
      <img
        {...props}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
      />
    )
  }

  const props = getOptimizedImageProps(source, size, {
    quality,
    format,
    fit
  })

  return (
    <img
      {...props}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
    />
  )
}

// Preset components for common use cases
export function PlaylistCover({ source, alt, variant = 'card', className = '', priority = false }: {
  source: SanityImageSource
  alt: string
  variant?: 'thumbnail' | 'card' | 'hero'
  className?: string
  priority?: boolean
}) {
  return (
    <SanityImage
      source={source}
      alt={alt}
      size={`playlist.${variant}` as keyof typeof imageSizes}
      className={className}
      priority={priority}
    />
  )
}

export function ProjectImage({ source, alt, variant = 'card', className = '', priority = false }: {
  source: SanityImageSource
  alt: string
  variant?: 'thumbnail' | 'card' | 'hero'
  className?: string
  priority?: boolean
}) {
  return (
    <SanityImage
      source={source}
      alt={alt}
      size={`project.${variant}` as keyof typeof imageSizes}
      className={className}
      priority={priority}
    />
  )
}

export function PlaygroundImage({ source, alt, variant = 'card', className = '', priority = false }: {
  source: SanityImageSource
  alt: string
  variant?: 'thumbnail' | 'card' | 'featured'
  className?: string
  priority?: boolean
}) {
  return (
    <SanityImage
      source={source}
      alt={alt}
      size={`playground.${variant}` as keyof typeof imageSizes}
      className={className}
      priority={priority}
    />
  )
}

export function Avatar({ source, alt, variant = 'medium', className = '', priority = false }: {
  source: SanityImageSource
  alt: string
  variant?: 'small' | 'medium' | 'large'
  className?: string
  priority?: boolean
}) {
  return (
    <SanityImage
      source={source}
      alt={alt}
      size={`avatar.${variant}` as keyof typeof imageSizes}
      className={`rounded-full ${className}`}
      priority={priority}
    />
  )
}
