import { sanityClient, groq } from './client'
import type { Project, Playlist } from './types'

// Project queries
export async function getAllProjects(): Promise<Project[]> {
  return sanityClient.fetch(groq`
    *[_type == "project"] | order(_createdAt desc) {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      title,
      featured,
      year,
      description,
      tags,
      slug,
      category
    }
  `)
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return sanityClient.fetch(groq`
    *[_type == "project" && featured == true] | order(_createdAt desc) {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      title,
      featured,
      year,
      description,
      tags,
      slug,
      category
    }
  `)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return sanityClient.fetch(groq`
    *[_type == "project" && slug.current == $slug][0] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      title,
      featured,
      year,
      description,
      tags,
      slug,
      category
    }
  `, { slug })
}

// Playlist queries
export async function getAllPlaylists(): Promise<Playlist[]> {
  return sanityClient.fetch(groq`
    *[_type == "playlist"] | order(publishedAt desc) {
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
    }
  `)
}

export async function getFeaturedPlaylists(): Promise<Playlist[]> {
  return sanityClient.fetch(groq`
    *[_type == "playlist" && featured == true] | order(publishedAt desc) {
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
    }
  `)
}

export async function getPlaylistBySlug(slug: string): Promise<Playlist | null> {
  return sanityClient.fetch(groq`
    *[_type == "playlist" && slug.current == $slug][0] {
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
    }
  `, { slug })
}

// Recent content
export async function getRecentContent() {
  return sanityClient.fetch(groq`
    *[_type in ["project", "playlist"]] | order(_createdAt desc)[0...6] {
      _id,
      _type,
      _createdAt,
      title,
      name,
      slug,
      featured
    }
  `)
}
