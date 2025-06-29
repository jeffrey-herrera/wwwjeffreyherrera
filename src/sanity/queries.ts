import { sanityClient, groq } from './client'
import type { Project, Playlist, About, Playground } from './types'

// Cache configuration
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// Simple query function with caching
async function query<T>(
  queryString: string,
  params: Record<string, any> = {},
  cacheKey?: string
): Promise<T> {
  // Check cache first
  if (cacheKey) {
    const cached = getCached<T>(cacheKey)
    if (cached) {
      return cached
    }
  }

  try {
    const result = await sanityClient.fetch<T>(queryString, params)
    
    // Cache the result
    if (cacheKey) {
      setCache(cacheKey, result)
    }

    return result
  } catch (error) {
    console.error('Sanity query error:', error)
    throw error
  }
}

// Project queries
export async function getAllProjects(): Promise<Project[]> {
  return query<Project[]>(
    groq`*[_type == "project"] | order(featured desc, featuredOrder asc, _createdAt desc) {
      _id,
      title,
      slug,
      description,
      "tags": tags[]->name,
      "image": image {
        asset,
        alt,
        caption
      },
      featured,
      featuredOrder,
      liveUrl,
      githubUrl,
      "content": content,
      _createdAt,
      _updatedAt
    }`,
    {},
    'all-projects'
  )
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return query<Project | null>(
    groq`*[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      content,
      "tags": tags[]->name,
      "image": image {
        asset,
        alt,
        caption
      },
      featured,
      featuredOrder,
      liveUrl,
      githubUrl,
      _createdAt,
      _updatedAt
    }`,
    { slug },
    `project-${slug}`
  )
}

// Playlist queries
export async function getAllPlaylists(): Promise<Playlist[]> {
  return query<Playlist[]>(
    groq`*[_type == "playlist"] | order(featured desc, featuredOrder asc, year desc, month desc) {
      _id,
      name,
      month,
      year,
      featuredTrack,
      slug,
      featured,
      featuredOrder,
      spotifyUrl,
      "coverArt": coverArt {
        asset,
        alt
      },
      _createdAt,
      _updatedAt
    }`,
    {},
    'all-playlists'
  )
}

export async function getPlaylistBySlug(slug: string): Promise<Playlist | null> {
  return query<Playlist | null>(
    groq`*[_type == "playlist" && slug.current == $slug][0] {
      _id,
      name,
      month,
      year,
      featuredTrack,
      slug,
      featured,
      featuredOrder,
      spotifyUrl,
      _createdAt,
      _updatedAt
    }`,
    { slug },
    `playlist-${slug}`
  )
}

// Playground queries
export async function getAllPlaygroundItems(): Promise<Playground[]> {
  return query<Playground[]>(
    groq`*[_type == "playground"] | order(coalesce(featuredOrder, _createdAt) desc) {
      _id,
      title,
      slug,
      description,
      featured,
      featuredOrder,
      liveUrl,
      githubUrl,
      _createdAt,
      _updatedAt
    }`,
    {},
    'all-playground'
  )
}

export async function getPlaygroundItemBySlug(slug: string): Promise<Playground | null> {
  return query<Playground | null>(
    groq`*[_type == "playground" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      content,
      featured,
      featuredOrder,
      liveUrl,
      githubUrl,
      _createdAt,
      _updatedAt
    }`,
    { slug },
    `playground-${slug}`
  )
}

// About queries
export async function getAbout(): Promise<About | null> {
  return query<About | null>(
    groq`*[_type == "about"][0] {
      _id,
      title,
      bio,
      "profileImage": profileImage {
        asset,
        alt
      },
      contact,
      _createdAt,
      _updatedAt
    }`,
    {},
    'about'
  )
}

// Count queries for navigation
export async function getProjectsCount(): Promise<number> {
  return query<number>(
    groq`count(*[_type == "project"])`,
    {},
    'projects-count'
  )
}

export async function getPlaygroundCount(): Promise<number> {
  return query<number>(
    groq`count(*[_type == "playground"])`,
    {},
    'playground-count'
  )
}

export async function getPlaylistsCount(): Promise<number> {
  return query<number>(
    groq`count(*[_type == "playlist"])`,
    {},
    'playlists-count'
  )
}