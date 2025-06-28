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
  featuredOrder?: number
  year: number
  description: string
  tags: string[]
  slug: Slug
  category: string
  image: SanityImage
  gallery?: SanityImage[]
  content?: PortableTextBlock[]
  externalUrl?: string
  githubUrl?: string
}

// Playlist type based on your existing schema
export interface Playlist extends SanityDocument {
  _type: 'playlist'
  featured: boolean
  featuredOrder?: number
  name: string
  coverArt: SanityImage
  publishedAt: string
  slug: Slug
  year: number
  spotifyUrl: string
  month: string
  featuredTrack?: string
  description?: string
}

// Portable Text types for rich content
export interface PortableTextBlock {
  _type: 'block'
  _key: string
  style: string
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks?: string[]
  }>
  markDefs?: Array<{
    _type: string
    _key: string
    href?: string
    blank?: boolean
  }>
}

// About page content
export interface About extends SanityDocument {
  _type: 'about'
  title: string
  bio: PortableTextBlock[]
  shortBio?: string
  profileImage: SanityImage
  contact: {
    email: string
    instagram?: string
    linkedin?: string
  }
}

// Playground content (experimental posts, images, writing)
export interface Playground extends SanityDocument {
  _type: 'playground'
  title: string
  type: 'image' | 'writing' | 'experiment'
  description?: string
  content?: PortableTextBlock[] // Rich text for writing
  image?: SanityImage
  tags?: string[]
  publishedAt: string
  slug: Slug
  featured: boolean
  featuredOrder?: number
  externalUrl?: string
  githubUrl?: string
}
