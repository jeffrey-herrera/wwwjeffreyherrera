import type { Project, Playlist, Playground } from '../sanity/types'

export interface ContentRelationship {
  type: 'project' | 'playlist' | 'playground'
  item: Project | Playlist | Playground
  score: number
  reasons: string[]
}

export interface RelationshipAnalysis {
  related: ContentRelationship[]
  strongConnections: ContentRelationship[]
  timelineConnections: ContentRelationship[]
}

/**
 * Calculate similarity score between two sets of tags
 */
function calculateTagSimilarity(tags1: string[] = [], tags2: string[] = []): number {
  if (tags1.length === 0 || tags2.length === 0) return 0
  
  const set1 = new Set(tags1.map(tag => tag.toLowerCase()))
  const set2 = new Set(tags2.map(tag => tag.toLowerCase()))
  
  const intersection = new Set([...set1].filter(tag => set2.has(tag)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size // Jaccard similarity
}

/**
 * Calculate time-based similarity (same year/month)
 */
function calculateTimeSimilarity(
  item1: { year?: number; month?: string; publishedAt?: string },
  item2: { year?: number; month?: string; publishedAt?: string }
): number {
  let score = 0
  
  // Same year bonus
  if (item1.year && item2.year && item1.year === item2.year) {
    score += 0.5
    
    // Same month bonus (for playlists)
    if (item1.month && item2.month && item1.month === item2.month) {
      score += 0.3
    }
  }
  
  // Similar time period (within 1 year)
  if (item1.year && item2.year) {
    const yearDiff = Math.abs(item1.year - item2.year)
    if (yearDiff <= 1) {
      score += Math.max(0, 0.3 - (yearDiff * 0.15))
    }
  }
  
  return Math.min(score, 1) // Cap at 1.0
}

/**
 * Calculate category/type similarity
 */
function calculateCategorySimilarity(
  item1: { category?: string; type?: string },
  item2: { category?: string; type?: string }
): number {
  // Direct category match
  if (item1.category && item2.category && item1.category === item2.category) {
    return 0.8
  }
  
  // Type match for playground items
  if (item1.type && item2.type && item1.type === item2.type) {
    return 0.6
  }
  
  // Cross-type relationships (design + music)
  const designCategories = ['brand', 'digital', 'physical']
  const creativeTypes = ['image', 'experiment', 'writing']
  
  const isItem1Design = item1.category && designCategories.includes(item1.category)
  const isItem2Design = item2.category && designCategories.includes(item2.category)
  const isItem1Creative = item1.type && creativeTypes.includes(item1.type)
  const isItem2Creative = item2.type && creativeTypes.includes(item2.type)
  
  if ((isItem1Design && isItem2Creative) || (isItem1Creative && isItem2Design)) {
    return 0.4 // Cross-disciplinary connection
  }
  
  return 0
}

/**
 * Get intelligent content relationships for a given item
 */
export function getContentRelationships(
  targetItem: Project | Playlist | Playground,
  allProjects: Project[] = [],
  allPlaylists: Playlist[] = [],
  allPlayground: Playground[] = []
): RelationshipAnalysis {
  const relationships: ContentRelationship[] = []
  
  // Analyze relationships with projects
  allProjects.forEach(project => {
    if (project._id === targetItem._id) return
    
    const reasons: string[] = []
    let score = 0
    
    // Tag similarity
    const tagScore = calculateTagSimilarity(
      'tags' in targetItem ? targetItem.tags : [],
      project.tags || []
    )
    if (tagScore > 0.2) {
      score += tagScore * 0.4
      reasons.push(`Shared technologies: ${getSharedTags('tags' in targetItem ? targetItem.tags : [], project.tags || []).join(', ')}`)
    }
    
    // Time similarity
    const timeScore = calculateTimeSimilarity(targetItem, project)
    if (timeScore > 0.3) {
      score += timeScore * 0.3
      reasons.push(`Created in ${project.year}`)
    }
    
    // Category similarity
    const categoryScore = calculateCategorySimilarity(targetItem, project)
    if (categoryScore > 0.3) {
      score += categoryScore * 0.3
      reasons.push(`Similar category: ${project.category}`)
    }
    
    if (score > 0.2) {
      relationships.push({
        type: 'project',
        item: project,
        score,
        reasons
      })
    }
  })
  
  // Analyze relationships with playlists
  allPlaylists.forEach(playlist => {
    if (playlist._id === targetItem._id) return
    
    const reasons: string[] = []
    let score = 0
    
    // Time similarity (strong for playlists)
    const timeScore = calculateTimeSimilarity(targetItem, playlist)
    if (timeScore > 0.3) {
      score += timeScore * 0.6
      reasons.push(`From ${playlist.month} ${playlist.year}`)
    }
    
    // Featured track mood analysis (simple keyword matching)
    if (playlist.featuredTrack && 'description' in targetItem) {
      const trackWords = playlist.featuredTrack.toLowerCase().split(' ')
      const descWords = targetItem.description?.toLowerCase().split(' ') || []
      const sharedMoodWords = trackWords.filter(word => 
        descWords.some(descWord => descWord.includes(word) || word.includes(descWord))
      )
      if (sharedMoodWords.length > 0) {
        score += 0.2
        reasons.push(`Similar mood: ${playlist.featuredTrack}`)
      }
    }
    
    if (score > 0.2) {
      relationships.push({
        type: 'playlist',
        item: playlist,
        score,
        reasons
      })
    }
  })
  
  // Analyze relationships with playground items
  allPlayground.forEach(playground => {
    if (playground._id === targetItem._id) return
    
    const reasons: string[] = []
    let score = 0
    
    // Tag similarity
    const tagScore = calculateTagSimilarity(
      'tags' in targetItem ? targetItem.tags : [],
      playground.tags || []
    )
    if (tagScore > 0.2) {
      score += tagScore * 0.4
      reasons.push(`Shared interests: ${getSharedTags('tags' in targetItem ? targetItem.tags : [], playground.tags || []).join(', ')}`)
    }
    
    // Type/category similarity
    const categoryScore = calculateCategorySimilarity(targetItem, playground)
    if (categoryScore > 0.3) {
      score += categoryScore * 0.4
      reasons.push(`Similar type: ${playground.type}`)
    }
    
    // Time similarity
    const timeScore = calculateTimeSimilarity(targetItem, { 
      year: new Date(playground.publishedAt).getFullYear() 
    })
    if (timeScore > 0.3) {
      score += timeScore * 0.2
      reasons.push(`Published in ${new Date(playground.publishedAt).getFullYear()}`)
    }
    
    if (score > 0.2) {
      relationships.push({
        type: 'playground',
        item: playground,
        score,
        reasons
      })
    }
  })
  
  // Sort by score
  relationships.sort((a, b) => b.score - a.score)
  
  return {
    related: relationships.slice(0, 6), // Top 6 related items
    strongConnections: relationships.filter(r => r.score > 0.6).slice(0, 3),
    timelineConnections: relationships
      .filter(r => r.reasons.some(reason => reason.includes('Created in') || reason.includes('From')))
      .slice(0, 4)
  }
}

/**
 * Helper function to get shared tags between two arrays
 */
function getSharedTags(tags1: string[], tags2: string[]): string[] {
  const set1 = new Set(tags1.map(tag => tag.toLowerCase()))
  const set2 = new Set(tags2.map(tag => tag.toLowerCase()))
  
  return [...set1].filter(tag => set2.has(tag))
}

/**
 * Generate relationship insights for display
 */
export function generateRelationshipInsights(analysis: RelationshipAnalysis): string[] {
  const insights: string[] = []
  
  if (analysis.strongConnections.length > 0) {
    insights.push(`${analysis.strongConnections.length} strong connections found`)
  }
  
  if (analysis.timelineConnections.length > 0) {
    insights.push(`Part of a creative timeline with ${analysis.timelineConnections.length} related works`)
  }
  
  const projectConnections = analysis.related.filter(r => r.type === 'project').length
  const playlistConnections = analysis.related.filter(r => r.type === 'playlist').length
  const playgroundConnections = analysis.related.filter(r => r.type === 'playground').length
  
  if (projectConnections > 0 && playlistConnections > 0) {
    insights.push('Cross-disciplinary connections between design and music')
  }
  
  if (playgroundConnections > 0) {
    insights.push('Connected to experimental creative work')
  }
  
  return insights
}