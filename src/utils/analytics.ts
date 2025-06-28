// Performance monitoring and analytics utilities

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay  
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Custom metrics
  pageLoadTime?: number
  domContentLoaded?: number
  navigationStart?: number
  
  // Context
  url: string
  userAgent: string
  timestamp: number
  sessionId: string
  userId?: string
}

export interface InteractionEvent {
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'playlist_play' | 'project_view' | 'connection_explore'
  element?: string
  elementId?: string
  elementClass?: string
  url: string
  timestamp: number
  sessionId: string
  metadata?: Record<string, any>
}

export interface ContentEngagement {
  contentType: 'project' | 'playlist' | 'playground' | 'connection'
  contentId: string
  contentTitle: string
  action: 'view' | 'interact' | 'share' | 'external_link' | 'related_click'
  duration?: number
  scrollDepth?: number
  timestamp: number
  sessionId: string
  referrer?: string
}

export interface ErrorEvent {
  type: 'javascript' | 'network' | 'performance' | 'user'
  message: string
  stack?: string
  url: string
  lineNumber?: number
  columnNumber?: number
  timestamp: number
  sessionId: string
  userAgent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class AnalyticsManager {
  private sessionId: string
  private userId?: string
  private startTime: number
  private isEnabled: boolean
  private queue: Array<PerformanceMetrics | InteractionEvent | ContentEngagement | ErrorEvent> = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = performance.now()
    this.isEnabled = typeof window !== 'undefined' && !this.isLocalDevelopment()
    
    if (this.isEnabled) {
      this.initializeTracking()
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private isLocalDevelopment(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('local'))
  }

  private initializeTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      this.trackPagePerformance()
    })

    // Track Core Web Vitals
    this.trackCoreWebVitals()

    // Track interactions
    this.trackInteractions()

    // Track errors
    this.trackErrors()

    // Flush queue periodically
    this.flushTimer = setInterval(() => {
      this.flush()
    }, 5000) // Flush every 5 seconds

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }

  private trackPagePerformance(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      const metrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        ttfb: navigation.responseStart - navigation.navigationStart,
        navigationStart: navigation.navigationStart,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId
      }

      this.addToQueue(metrics)
    }
  }

  private trackCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    this.observeMetric('largest-contentful-paint', (entry) => {
      this.addToQueue({
        lcp: entry.value,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId
      })
    })

    // FID (First Input Delay) 
    this.observeMetric('first-input', (entry) => {
      this.addToQueue({
        fid: entry.processingStart - entry.startTime,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId
      })
    })

    // CLS (Cumulative Layout Shift)
    this.observeMetric('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.addToQueue({
          cls: entry.value,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: this.sessionId
        })
      }
    })
  }

  private observeMetric(entryType: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback)
      })
      observer.observe({ type: entryType, buffered: true })
    } catch (error) {
      // PerformanceObserver not supported
      console.warn(`PerformanceObserver for ${entryType} not supported`)
    }
  }

  private trackInteractions(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      this.trackInteraction('click', target, {
        x: event.clientX,
        y: event.clientY
      })
    })

    // Scroll depth tracking
    let maxScrollDepth = 0
    let scrollTimer: NodeJS.Timeout | null = null
    
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100)
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        
        // Debounce scroll tracking
        if (scrollTimer) clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
          this.trackInteraction('scroll', null, { scrollDepth: maxScrollDepth })
        }, 1000)
      }
    })

    // Hover tracking for important elements
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('playlist-card') || 
          target.classList.contains('card') ||
          target.closest('.related-content')) {
        this.trackInteraction('hover', target)
      }
    })
  }

  private trackInteraction(type: InteractionEvent['type'], element: HTMLElement | null, metadata?: Record<string, any>): void {
    const interaction: InteractionEvent = {
      type,
      element: element?.tagName?.toLowerCase(),
      elementId: element?.id,
      elementClass: element?.className,
      url: window.location.href,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata
    }

    this.addToQueue(interaction)
  }

  private trackErrors(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        severity: 'high'
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'javascript',
        message: `Unhandled promise rejection: ${event.reason}`,
        url: window.location.href,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        severity: 'medium'
      })
    })

    // Network errors (fetch failures)
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          this.trackError({
            type: 'network',
            message: `Fetch failed: ${response.status} ${response.statusText}`,
            url: args[0] as string,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            severity: response.status >= 500 ? 'high' : 'medium'
          })
        }
        return response
      } catch (error) {
        this.trackError({
          type: 'network',
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          url: args[0] as string,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          severity: 'high'
        })
        throw error
      }
    }
  }

  // Public methods for manual tracking
  public trackContentEngagement(engagement: Omit<ContentEngagement, 'timestamp' | 'sessionId'>): void {
    if (!this.isEnabled) return

    this.addToQueue({
      ...engagement,
      timestamp: Date.now(),
      sessionId: this.sessionId
    })
  }

  public trackError(error: Omit<ErrorEvent, 'timestamp' | 'sessionId' | 'userAgent'>): void {
    if (!this.isEnabled) return

    this.addToQueue({
      ...error,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent
    })
  }

  public setUserId(userId: string): void {
    this.userId = userId
  }

  private addToQueue(event: PerformanceMetrics | InteractionEvent | ContentEngagement | ErrorEvent): void {
    this.queue.push(event)
    
    // Auto-flush if queue gets too large
    if (this.queue.length >= 50) {
      this.flush()
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      // In production, send to your analytics endpoint
      // For now, we'll use console.log and localStorage for demo
      if (this.isLocalDevelopment()) {
        console.group('📊 Analytics Events')
        events.forEach(event => console.log(event))
        console.groupEnd()
      } else {
        // Send to analytics service
        await this.sendToAnalytics(events)
      }
      
      // Store locally for demo purposes
      const existing = JSON.parse(localStorage.getItem('portfolio-analytics') || '[]')
      localStorage.setItem('portfolio-analytics', JSON.stringify([...existing, ...events].slice(-100))) // Keep last 100 events
    } catch (error) {
      console.error('Failed to flush analytics:', error)
      // Re-add events to queue for retry
      this.queue.unshift(...events)
    }
  }

  private async sendToAnalytics(events: Array<PerformanceMetrics | InteractionEvent | ContentEngagement | ErrorEvent>): Promise<void> {
    // This would send to your analytics service (e.g., Google Analytics, Mixpanel, custom endpoint)
    // For demo purposes, we'll just log
    console.log('📊 Sending analytics events:', events.length)
    
    // Example: Send to custom endpoint
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(events)
    // })
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager()

// Export tracking functions for easy use
export const trackContentView = (contentType: ContentEngagement['contentType'], contentId: string, contentTitle: string) => {
  analytics.trackContentEngagement({
    contentType,
    contentId,
    contentTitle,
    action: 'view',
    referrer: document.referrer
  })
}

export const trackContentInteraction = (contentType: ContentEngagement['contentType'], contentId: string, contentTitle: string, action: ContentEngagement['action']) => {
  analytics.trackContentEngagement({
    contentType,
    contentId,
    contentTitle,
    action
  })
}

export const trackPlaylistPlay = (playlistId: string, playlistName: string) => {
  analytics.trackContentEngagement({
    contentType: 'playlist',
    contentId: playlistId,
    contentTitle: playlistName,
    action: 'external_link'
  })
}

export const trackConnectionExplore = (fromId: string, toId: string, connectionType: string) => {
  analytics.trackContentEngagement({
    contentType: 'connection',
    contentId: `${fromId}-${toId}`,
    contentTitle: `Connection: ${connectionType}`,
    action: 'related_click'
  })
}