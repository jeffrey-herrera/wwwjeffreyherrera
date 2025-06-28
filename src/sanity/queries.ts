import { sanityClient, groq } from './client'
import { withErrorHandling, withRetry, logger } from '../utils/errorHandling'
import type { Project, Playlist, About, Playground } from './types'

// Cache configuration
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// Enhanced query function with caching and error handling
async function query<T>(
  queryString: string,
  params: Record<string, any> = {},
  cacheKey?: string
): Promise<T> {
  // Check cache first
  if (cacheKey) {
    const cached = getCached<T>(cacheKey)
    if (cached) {
      logger.info(`Cache hit for ${cacheKey}`)
      return cached
    }
  }

  const executeQuery = async () => {
    const startTime = Date.now()
    const result = await sanityClient.fetch<T>(queryString, params)
    const duration = Date.now() - startTime
    
    logger.info(`Query executed in ${duration}ms`, {
      query: queryString.slice(0, 100) + '...',
      params,
      resultCount: Array.isArray(result) ? result.length : 1,
    })

    return result
  }

  try {
    const result = await withRetry(executeQuery)
    
    // Cache the result
    if (cacheKey) {
      setCache(cacheKey, result)
    }
    
    return result
  } catch (error) {
    logger.error('Sanity query failed', error as Error, {
      query: queryString,
      params,
    })
    throw error
  }
}

// Project queries
export const getAllProjects = withErrorHandling(
  async (): Promise<Project[]> => {
    return query<Project[]>(
      groq`*[_type == "project"] | order(coalesce(featuredOrder, _createdAt) desc) {
        _id,
        title,
        slug,
        description,
        "tags": tags[]->name,
        category,
        featured,
        featuredOrder,
        "image": image {
          asset,
          alt,
          caption
        },
        _createdAt,
        _updatedAt
      }`,
      {},
      'all-projects'
    )
  },
  'getAllProjects'
)

// Generic function to get featured items of any type
const getFeaturedItems = async <T>(
  type: string,
  selectFields: string,
  cacheKey: string
): Promise<T[]> => {
  return query<T[]>(
    groq`*[_type == "${type}" && featured == true] | order(coalesce(featuredOrder, _createdAt) desc) {
      ${selectFields}
    }`,
    {},
    cacheKey
  )
}

export const getFeaturedProjects = withErrorHandling(
  async (): Promise<Project[]> => {
    return getFeaturedItems<Project>(
      'project',
      `_id,
        title,
        slug,
        description,
        "tags": tags[]->name,
        category,
        featured,
        featuredOrder,
        "image": image {
          asset,
          alt,
          caption
        },
        _createdAt,
        _updatedAt`,
      'featured-projects'
    )
  },
  'getFeaturedProjects'
)

export const getProjectBySlug = withErrorHandling(
  async (slug: string): Promise<Project | null> => {
    return query<Project | null>(
      groq`*[_type == "project" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        description,
        content,
        "tags": tags[]->name,
        category,
        featured,
        featuredOrder,
        "image": image {
          asset,
          alt,
          caption
        },
        "gallery": gallery[] {
          asset,
          alt,
          caption
        },
        externalUrl,
        githubUrl,
        _createdAt,
        _updatedAt
      }`,
      { slug },
      `project-${slug}`
    )
  },
  'getProjectBySlug'
)

// Playlist queries
export const getAllPlaylists = withErrorHandling(
  async (): Promise<Playlist[]> => {
    return query<Playlist[]>(
      groq`*[_type == "playlist"] | order(coalesce(featuredOrder, year) desc, month desc) {
        _id,
        name,
        month,
        year,
        featuredTrack,
        spotifyUrl,
        featured,
        featuredOrder,
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
  },
  'getAllPlaylists'
)

export const getFeaturedPlaylists = withErrorHandling(
  async (): Promise<Playlist[]> => {
    return query<Playlist[]>(
      groq`*[_type == "playlist" && featured == true] | order(coalesce(featuredOrder, year) desc, month desc) {
        _id,
        name,
        month,
        year,
        featuredTrack,
        spotifyUrl,
        featured,
        featuredOrder,
        "coverArt": coverArt {
          asset,
          alt
        },
        _createdAt,
        _updatedAt
      }`,
      {},
      'featured-playlists'
    )
  },
  'getFeaturedPlaylists'
)

export const getPlaylistBySlug = withErrorHandling(
  async (slug: string): Promise<Playlist | null> => {
    return query<Playlist | null>(
      groq`*[_type == "playlist" && slug.current == $slug][0] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        featured,
        name,
        coverArt,
        publishedAt,
        slug,
        year,
        spotifyUrl,
        month,
        featuredTrack
      }`,
      { slug },
      `playlist-${slug}`
    )
  },
  'getPlaylistBySlug'
)

// Playground queries
export const getAllPlaygroundItems = withErrorHandling(
  async (): Promise<Playground[]> => {
    return query<Playground[]>(
      groq`*[_type == "playground"] | order(coalesce(featuredOrder, _createdAt) desc) {
        _id,
        title,
        slug,
        description,
        featured,
        featuredOrder,
        "image": image {
          asset,
          alt,
          caption
        },
        _createdAt,
        _updatedAt
      }`,
      {},
      'all-playground'
    )
  },
  'getAllPlaygroundItems'
)

export const getPlaygroundItemBySlug = withErrorHandling(
  async (slug: string): Promise<Playground | null> => {
    return query<Playground | null>(
      groq`*[_type == "playground" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        description,
        content,
        featured,
        featuredOrder,
        "image": image {
          asset,
          alt,
          caption
        },
        externalUrl,
        githubUrl,
        _createdAt,
        _updatedAt
      }`,
      { slug },
      `playground-${slug}`
    )
  },
  'getPlaygroundItemBySlug'
)

export const getFeaturedPlaygroundItems = withErrorHandling(
  async (): Promise<Playground[]> => {
    return getFeaturedItems<Playground>(
      'playground',
      `_id,
        title,
        slug,
        description,
        featured,
        featuredOrder,
        "image": image {
          asset,
          alt,
          caption
        },
        _createdAt,
        _updatedAt`,
      'featured-playground'
    )
  },
  'getFeaturedPlaygroundItems'
)

// About queries
export const getAbout = withErrorHandling(
  async (): Promise<About | null> => {
    return query<About | null>(
      groq`*[_type == "about"][0] {
        _id,
        title,
        bio,
        "profileImage": profileImage {
          asset,
          alt,
          caption
        },
        skills,
        experience,
        contact,
        _createdAt,
        _updatedAt
      }`,
      {},
      'about'
    )
  },
  'getAbout'
)

// Count queries for navigation
export const getProjectsCount = withErrorHandling(
  async (): Promise<number> => {
    return query<number>(
      groq`count(*[_type == "project"])`,
      {},
      'projects-count'
    )
  },
  'getProjectsCount'
)

export const getPlaygroundCount = withErrorHandling(
  async (): Promise<number> => {
    return query<number>(
      groq`count(*[_type == "playground"])`,
      {},
      'playground-count'
    )
  },
  'getPlaygroundCount'
)

export const getPlaylistsCount = withErrorHandling(
  async (): Promise<number> => {
    return query<number>(
      groq`count(*[_type == "playlist"])`,
      {},
      'playlists-count'
    )
  },
  'getPlaylistsCount'
)

// Optimized single query for all counts
export const getAllCounts = withErrorHandling(
  async (): Promise<{
    projects: number;
    playground: number;
    playlists: number;
  }> => {
    return query<{
      projects: number;
      playground: number;
      playlists: number;
    }>(
      groq`{
        "projects": count(*[_type == "project"]),
        "playground": count(*[_type == "playground"]),
        "playlists": count(*[_type == "playlist"])
      }`,
      {},
      'all-counts'
    )
  },
  'getAllCounts'
)

// Recent content
export const getRecentContent = withErrorHandling(
  async () => {
    return query(
      groq`*[_type in ["project", "playlist", "playground"]] | order(_createdAt desc)[0...6] {
        _id,
        _type,
        _createdAt,
        title,
        name,
        slug,
        featured
      }`,
      {},
      'recent-content'
    )
  },
  'getRecentContent'
)

// Utility function to clear cache (useful for development)
export function clearCache(): void {
  cache.clear()
  logger.info('Cache cleared')
}

// Preload critical data
export async function preloadCriticalData(): Promise<void> {
  try {
    await Promise.allSettled([
      getFeaturedProjects(),
      getFeaturedPlaylists(),
      getAbout(),
    ])
    logger.info('Critical data preloaded')
  } catch (error) {
    logger.error('Failed to preload critical data', error as Error)
  }
}
