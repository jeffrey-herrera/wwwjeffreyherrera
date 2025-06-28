// Content scheduling and preview system for managing publication states
import type { Project, Playlist, Playground } from '../sanity/types'

export interface ScheduledContent {
  _id: string
  title: string
  type: 'project' | 'playlist' | 'playground'
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  publishedAt?: string
  scheduledFor?: string
  lastModified: string
  preview?: {
    url: string
    token: string
    expiresAt: string
  }
}

export interface ContentPreview {
  content: Project | Playlist | Playground
  previewUrl: string
  shareableLink: string
  expiresAt: Date
}

export interface ScheduleConfig {
  autoPublish: boolean
  timezone: string
  notifications: {
    email?: string
    webhook?: string
  }
  previewDuration: number // hours
}

/**
 * Content status utilities
 */
export class ContentScheduler {
  private config: ScheduleConfig

  constructor(config: ScheduleConfig) {
    this.config = config
  }

  /**
   * Check if content should be published based on schedule
   */
  shouldPublish(content: ScheduledContent): boolean {
    if (content.status !== 'scheduled') return false
    if (!content.scheduledFor) return false

    const now = new Date()
    const scheduledDate = new Date(content.scheduledFor)
    
    return now >= scheduledDate
  }

  /**
   * Get content status with contextual information
   */
  getContentStatus(content: ScheduledContent): {
    status: string
    displayText: string
    color: string
    canPreview: boolean
    timeUntilPublish?: string
  } {
    const now = new Date()

    switch (content.status) {
      case 'draft':
        return {
          status: 'draft',
          displayText: 'Draft',
          color: 'gray',
          canPreview: true
        }

      case 'scheduled':
        if (!content.scheduledFor) {
          return {
            status: 'error',
            displayText: 'Schedule Error',
            color: 'red',
            canPreview: false
          }
        }

        const scheduledDate = new Date(content.scheduledFor)
        const timeUntil = this.formatTimeUntil(scheduledDate, now)
        
        if (now >= scheduledDate) {
          return {
            status: 'ready',
            displayText: 'Ready to Publish',
            color: 'green',
            canPreview: true,
            timeUntilPublish: 'Now'
          }
        }

        return {
          status: 'scheduled',
          displayText: 'Scheduled',
          color: 'blue',
          canPreview: true,
          timeUntilPublish: timeUntil
        }

      case 'published':
        return {
          status: 'published',
          displayText: 'Published',
          color: 'green',
          canPreview: false
        }

      case 'archived':
        return {
          status: 'archived',
          displayText: 'Archived',
          color: 'yellow',
          canPreview: true
        }

      default:
        return {
          status: 'unknown',
          displayText: 'Unknown',
          color: 'gray',
          canPreview: false
        }
    }
  }

  /**
   * Format time until scheduled publication
   */
  private formatTimeUntil(scheduledDate: Date, currentDate: Date): string {
    const diff = scheduledDate.getTime() - currentDate.getTime()
    
    if (diff <= 0) return 'Now'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  /**
   * Generate preview URL for content
   */
  generatePreviewUrl(content: ScheduledContent): string {
    const token = this.generatePreviewToken(content._id)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    
    switch (content.type) {
      case 'project':
        return `${baseUrl}/preview/work/${content._id}?token=${token}`
      case 'playlist':
        return `${baseUrl}/preview/playlists/${content._id}?token=${token}`
      case 'playground':
        return `${baseUrl}/preview/playground/${content._id}?token=${token}`
      default:
        return `${baseUrl}/preview/${content._id}?token=${token}`
    }
  }

  /**
   * Generate shareable preview link with expiration
   */
  generateShareablePreview(content: ScheduledContent): ContentPreview {
    const token = this.generatePreviewToken(content._id)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + this.config.previewDuration)

    const previewUrl = this.generatePreviewUrl(content)
    const shareableLink = `${previewUrl}&expires=${expiresAt.toISOString()}`

    return {
      content: content as any, // Type assertion for now
      previewUrl,
      shareableLink,
      expiresAt
    }
  }

  /**
   * Generate secure preview token
   */
  private generatePreviewToken(contentId: string): string {
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substr(2, 10)
    const hash = btoa(`${contentId}-${timestamp}-${randomPart}`).replace(/[^a-zA-Z0-9]/g, '')
    
    return hash.substr(0, 16)
  }

  /**
   * Validate preview token
   */
  validatePreviewToken(token: string, contentId: string): boolean {
    // In a real implementation, this would check against a secure store
    // For now, we'll do basic validation
    return token.length === 16 && /^[a-zA-Z0-9]+$/.test(token)
  }

  /**
   * Schedule content for future publication
   */
  scheduleContent(
    contentId: string, 
    publishDate: Date, 
    options: {
      notifyOnPublish?: boolean
      autoArchiveAfter?: number // days
    } = {}
  ): {
    scheduledFor: string
    previewUrl: string
    message: string
  } {
    const scheduledFor = publishDate.toISOString()
    
    // Generate preview URL
    const content: ScheduledContent = {
      _id: contentId,
      title: '', // Would be fetched from actual content
      type: 'project', // Would be determined from content
      status: 'scheduled',
      scheduledFor,
      lastModified: new Date().toISOString()
    }
    
    const previewUrl = this.generatePreviewUrl(content)
    
    // Calculate time until publish
    const now = new Date()
    const timeUntil = this.formatTimeUntil(publishDate, now)
    
    return {
      scheduledFor,
      previewUrl,
      message: `Content scheduled to publish in ${timeUntil}`
    }
  }

  /**
   * Get upcoming scheduled content
   */
  getUpcomingContent(
    allContent: ScheduledContent[], 
    limit: number = 10
  ): ScheduledContent[] {
    const now = new Date()
    
    return allContent
      .filter(content => 
        content.status === 'scheduled' && 
        content.scheduledFor && 
        new Date(content.scheduledFor) > now
      )
      .sort((a, b) => 
        new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime()
      )
      .slice(0, limit)
  }

  /**
   * Get content ready to publish
   */
  getReadyToPublish(allContent: ScheduledContent[]): ScheduledContent[] {
    return allContent.filter(content => this.shouldPublish(content))
  }

  /**
   * Get draft content statistics
   */
  getDraftStatistics(allContent: ScheduledContent[]): {
    totalDrafts: number
    scheduledCount: number
    readyToPublish: number
    byType: Record<string, number>
  } {
    const drafts = allContent.filter(c => c.status === 'draft')
    const scheduled = allContent.filter(c => c.status === 'scheduled')
    const ready = this.getReadyToPublish(allContent)

    const byType = allContent.reduce((acc, content) => {
      if (content.status === 'draft') {
        acc[content.type] = (acc[content.type] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      totalDrafts: drafts.length,
      scheduledCount: scheduled.length,
      readyToPublish: ready.length,
      byType
    }
  }

  /**
   * Generate editorial calendar data
   */
  generateCalendar(
    allContent: ScheduledContent[], 
    month: number, 
    year: number
  ): {
    date: string
    items: ScheduledContent[]
  }[] {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    const scheduledInMonth = allContent.filter(content => {
      if (!content.scheduledFor) return false
      const scheduleDate = new Date(content.scheduledFor)
      return scheduleDate >= startDate && scheduleDate <= endDate
    })

    // Group by day
    const calendar: Record<string, ScheduledContent[]> = {}
    
    scheduledInMonth.forEach(content => {
      const date = new Date(content.scheduledFor!).toISOString().split('T')[0]
      if (!calendar[date]) calendar[date] = []
      calendar[date].push(content)
    })

    // Convert to array format
    return Object.entries(calendar)
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}

/**
 * Preview management utilities
 */
export class PreviewManager {
  private activeTokens = new Map<string, { contentId: string; expiresAt: Date }>()

  /**
   * Create a new preview session
   */
  createPreviewSession(contentId: string, durationHours: number = 24): {
    token: string
    url: string
    expiresAt: Date
  } {
    const token = this.generateSecureToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + durationHours)

    this.activeTokens.set(token, { contentId, expiresAt })
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${baseUrl}/preview/${contentId}?token=${token}`

    return { token, url, expiresAt }
  }

  /**
   * Validate preview session
   */
  validateSession(token: string, contentId: string): boolean {
    const session = this.activeTokens.get(token)
    if (!session) return false
    
    if (session.contentId !== contentId) return false
    if (new Date() > session.expiresAt) {
      this.activeTokens.delete(token)
      return false
    }

    return true
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = new Date()
    let cleaned = 0

    for (const [token, session] of this.activeTokens.entries()) {
      if (now > session.expiresAt) {
        this.activeTokens.delete(token)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    this.cleanupExpiredSessions()
    return this.activeTokens.size
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(16)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array)
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }
    
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}

// Export default instances
export const defaultScheduler = new ContentScheduler({
  autoPublish: true,
  timezone: 'America/New_York',
  notifications: {},
  previewDuration: 24
})

export const defaultPreviewManager = new PreviewManager()