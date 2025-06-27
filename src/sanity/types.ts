// Base Sanity document type
export interface SanityDocument {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  _rev: string
}

// Slug type
export interface Slug {
  current: string
}

// Image type
export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
}

// Project type based on your existing schema
export interface Project extends SanityDocument {
  _type: 'project'
  title: string
  featured: boolean
  year: number
  description: string
  tags: string[]
  slug: Slug
  category: string
}

// Playlist type based on your existing schema
export interface Playlist extends SanityDocument {
  _type: 'playlist'
  featured: boolean
  name: string
  coverArt: SanityImage
  publishedAt: string
  slug: Slug
  year: number
  spotifyUrl: string
  month: string
  featuredTrack: string
}
