// Advanced micro-interaction system for enhanced user experience
import { defaultAnalytics } from './analytics'

export interface InteractionConfig {
  trigger: 'hover' | 'click' | 'focus' | 'scroll' | 'mousemove' | 'touch'
  animation: string
  duration: number
  delay?: number
  easing?: string
  repeat?: boolean | number
  feedback?: 'haptic' | 'audio' | 'visual'
}

export interface ScrollRevealConfig {
  threshold: number
  rootMargin: string
  animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate'
  duration: number
  delay?: number
  stagger?: number
}

export interface HoverEffectConfig {
  scale?: number
  rotate?: number
  translateY?: number
  brightness?: number
  saturate?: number
  blur?: number
  duration?: number
  easing?: string
}

/**
 * Advanced micro-interaction management system
 */
export class MicroInteractionManager {
  private observers = new Map<string, IntersectionObserver>()
  private activeAnimations = new Map<string, Animation>()
  private scrollElements = new Set<Element>()
  private hoverElements = new Set<Element>()

  constructor() {
    this.initializeGlobalListeners()
    this.setupScrollReveal()
    this.setupHoverEffects()
    this.setupClickFeedback()
  }

  /**
   * Initialize global interaction listeners
   */
  private initializeGlobalListeners(): void {
    // Enhanced cursor interactions
    this.setupEnhancedCursor()
    
    // Keyboard navigation improvements
    this.setupKeyboardEnhancements()
    
    // Touch gesture support
    this.setupTouchEnhancements()
    
    // Focus management
    this.setupFocusManagement()
  }

  /**
   * Setup enhanced cursor interactions
   */
  private setupEnhancedCursor(): void {
    if (typeof window === 'undefined') return

    // Create custom cursor element
    const cursor = document.createElement('div')
    cursor.className = 'custom-cursor'
    cursor.innerHTML = `
      <div class="cursor-dot"></div>
      <div class="cursor-ring"></div>
    `
    document.body.appendChild(cursor)

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    })

    // Smooth cursor following
    const updateCursor = () => {
      const dx = mouseX - cursorX
      const dy = mouseY - cursorY
      
      cursorX += dx * 0.1
      cursorY += dy * 0.1
      
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`
      requestAnimationFrame(updateCursor)
    }
    updateCursor()

    // Cursor state changes
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'))
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'))

    // Interactive element detection
    document.addEventListener('mouseover', (e) => {
      const target = e.target as Element
      if (target.matches('a, button, [role="button"], .interactive')) {
        cursor.classList.add('hovering')
      }
    })

    document.addEventListener('mouseout', (e) => {
      const target = e.target as Element
      if (target.matches('a, button, [role="button"], .interactive')) {
        cursor.classList.remove('hovering')
      }
    })
  }

  /**
   * Setup scroll-triggered reveal animations
   */
  private setupScrollReveal(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    const defaultConfig: ScrollRevealConfig = {
      threshold: 0.1,
      rootMargin: '-50px 0px',
      animation: 'fadeIn',
      duration: 600,
      delay: 0,
      stagger: 100
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const config = this.getElementConfig(element, defaultConfig)
          
          setTimeout(() => {
            this.triggerScrollReveal(element, config)
          }, config.delay + (config.stagger || 0) * index)
          
          observer.unobserve(element)
        }
      })
    }, {
      threshold: defaultConfig.threshold,
      rootMargin: defaultConfig.rootMargin
    })

    // Observe elements with scroll reveal
    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
      observer.observe(el)
      this.scrollElements.add(el)
    })

    this.observers.set('scroll-reveal', observer)
  }

  /**
   * Setup enhanced hover effects
   */
  private setupHoverEffects(): void {
    if (typeof window === 'undefined') return

    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement
      if (target.matches('[data-hover-effect]')) {
        this.triggerHoverEffect(target, 'enter')
      }
    })

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement
      if (target.matches('[data-hover-effect]')) {
        this.triggerHoverEffect(target, 'leave')
      }
    })
  }

  /**
   * Setup click feedback animations
   */
  private setupClickFeedback(): void {
    if (typeof window === 'undefined') return

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      
      // Ripple effect for buttons
      if (target.matches('button, [role="button"], .btn')) {
        this.createRippleEffect(target, e)
      }

      // Bounce effect for interactive elements
      if (target.matches('.card, .project-card, .playlist-card')) {
        this.triggerBounceEffect(target)
      }

      // Track interaction
      if (defaultAnalytics) {
        defaultAnalytics.trackInteraction({
          type: 'click',
          element: target.tagName.toLowerCase(),
          id: target.id || target.className,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * Setup keyboard navigation enhancements
   */
  private setupKeyboardEnhancements(): void {
    if (typeof window === 'undefined') return

    document.addEventListener('keydown', (e) => {
      // Focus ring animations
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav')
        
        setTimeout(() => {
          const focusedElement = document.activeElement as HTMLElement
          if (focusedElement) {
            this.triggerFocusAnimation(focusedElement)
          }
        }, 50)
      }

      // Escape key interactions
      if (e.key === 'Escape') {
        this.cancelAllAnimations()
      }
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav')
    })
  }

  /**
   * Setup touch gesture enhancements
   */
  private setupTouchEnhancements(): void {
    if (typeof window === 'undefined') return

    let touchStartY = 0
    let touchStartTime = 0

    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY
      touchStartTime = Date.now()
      
      const target = e.target as HTMLElement
      if (target.matches('.touchable, .card, button')) {
        target.classList.add('touch-active')
      }
    })

    document.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement
      target.classList.remove('touch-active')
      
      const touchEndY = e.changedTouches[0].clientY
      const touchDuration = Date.now() - touchStartTime
      const touchDistance = Math.abs(touchEndY - touchStartY)
      
      // Detect swipe gestures
      if (touchDistance > 50 && touchDuration < 300) {
        const direction = touchEndY > touchStartY ? 'down' : 'up'
        this.triggerSwipeAnimation(target, direction)
      }
    })
  }

  /**
   * Setup focus management and animations
   */
  private setupFocusManagement(): void {
    if (typeof window === 'undefined') return

    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement
      this.triggerFocusAnimation(target)
    })

    document.addEventListener('focusout', (e) => {
      const target = e.target as HTMLElement
      target.classList.remove('focus-animated')
    })
  }

  /**
   * Trigger scroll reveal animation
   */
  private triggerScrollReveal(element: HTMLElement, config: ScrollRevealConfig): void {
    element.style.opacity = '0'
    element.style.transform = this.getInitialTransform(config.animation)
    element.style.transition = `all ${config.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    
    requestAnimationFrame(() => {
      element.style.opacity = '1'
      element.style.transform = 'none'
      element.classList.add('scroll-revealed')
    })
  }

  /**
   * Trigger hover effect
   */
  private triggerHoverEffect(element: HTMLElement, state: 'enter' | 'leave'): void {
    const config = this.getHoverConfig(element)
    
    if (state === 'enter') {
      element.style.transition = `all ${config.duration}ms ${config.easing}`
      element.style.transform = `
        scale(${config.scale}) 
        rotate(${config.rotate}deg) 
        translateY(${config.translateY}px)
      `
      element.style.filter = `
        brightness(${config.brightness}) 
        saturate(${config.saturate}) 
        blur(${config.blur}px)
      `
      element.classList.add('hover-active')
    } else {
      element.style.transform = 'none'
      element.style.filter = 'none'
      element.classList.remove('hover-active')
    }
  }

  /**
   * Create ripple effect
   */
  private createRippleEffect(element: HTMLElement, event: MouseEvent): void {
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    const ripple = document.createElement('div')
    ripple.className = 'ripple-effect'
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 600ms ease-out;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `
    
    element.style.position = 'relative'
    element.style.overflow = 'hidden'
    element.appendChild(ripple)
    
    setTimeout(() => ripple.remove(), 600)
  }

  /**
   * Trigger bounce effect
   */
  private triggerBounceEffect(element: HTMLElement): void {
    element.style.animation = 'bounce-click 300ms ease-out'
    
    setTimeout(() => {
      element.style.animation = ''
    }, 300)
  }

  /**
   * Trigger focus animation
   */
  private triggerFocusAnimation(element: HTMLElement): void {
    element.classList.add('focus-animated')
    
    // Create focus ring
    const focusRing = document.createElement('div')
    focusRing.className = 'focus-ring'
    focusRing.style.cssText = `
      position: absolute;
      inset: -4px;
      border: 2px solid #f97316;
      border-radius: inherit;
      pointer-events: none;
      animation: focus-ring 300ms ease-out;
      z-index: 1000;
    `
    
    element.style.position = 'relative'
    element.appendChild(focusRing)
    
    setTimeout(() => focusRing.remove(), 300)
  }

  /**
   * Trigger swipe animation
   */
  private triggerSwipeAnimation(element: HTMLElement, direction: 'up' | 'down'): void {
    const translateY = direction === 'up' ? -10 : 10
    
    element.style.transition = 'transform 200ms ease-out'
    element.style.transform = `translateY(${translateY}px)`
    
    setTimeout(() => {
      element.style.transform = 'none'
    }, 200)
  }

  /**
   * Get element configuration
   */
  private getElementConfig<T>(element: HTMLElement, defaultConfig: T): T {
    try {
      const configAttr = element.getAttribute('data-config')
      if (configAttr) {
        return { ...defaultConfig, ...JSON.parse(configAttr) }
      }
    } catch (error) {
      console.warn('Invalid config data:', error)
    }
    return defaultConfig
  }

  /**
   * Get hover configuration
   */
  private getHoverConfig(element: HTMLElement): Required<HoverEffectConfig> {
    const defaults: Required<HoverEffectConfig> = {
      scale: 1.05,
      rotate: 0,
      translateY: -2,
      brightness: 1.1,
      saturate: 1.2,
      blur: 0,
      duration: 200,
      easing: 'ease-out'
    }
    
    return this.getElementConfig(element, defaults)
  }

  /**
   * Get initial transform for animations
   */
  private getInitialTransform(animation: string): string {
    switch (animation) {
      case 'slideUp':
        return 'translateY(50px)'
      case 'slideLeft':
        return 'translateX(50px)'
      case 'slideRight':
        return 'translateX(-50px)'
      case 'scale':
        return 'scale(0.8)'
      case 'rotate':
        return 'rotate(5deg)'
      default:
        return 'translateY(20px)'
    }
  }

  /**
   * Cancel all active animations
   */
  private cancelAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.cancel())
    this.activeAnimations.clear()
  }

  /**
   * Add new scroll reveal elements
   */
  public observeNewElements(): void {
    const observer = this.observers.get('scroll-reveal')
    if (!observer) return

    document.querySelectorAll('[data-scroll-reveal]:not(.scroll-revealed)').forEach(el => {
      if (!this.scrollElements.has(el)) {
        observer.observe(el)
        this.scrollElements.add(el)
      }
    })
  }

  /**
   * Destroy all observers and clean up
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.scrollElements.clear()
    this.hoverElements.clear()
    this.cancelAllAnimations()
  }
}

/**
 * Animation utility functions
 */
export class AnimationUtils {
  /**
   * Create staggered animations for a group of elements
   */
  static staggerAnimation(
    elements: NodeListOf<Element> | Element[],
    animation: (element: Element, index: number) => void,
    delay: number = 100
  ): void {
    Array.from(elements).forEach((element, index) => {
      setTimeout(() => animation(element, index), delay * index)
    })
  }

  /**
   * Create a parallax effect for an element
   */
  static createParallax(element: HTMLElement, speed: number = 0.5): void {
    if (typeof window === 'undefined') return

    const updateParallax = () => {
      const scrolled = window.pageYOffset
      const parallax = scrolled * speed
      element.style.transform = `translateY(${parallax}px)`
    }

    window.addEventListener('scroll', updateParallax, { passive: true })
    updateParallax()
  }

  /**
   * Create a typewriter effect
   */
  static typewriter(element: HTMLElement, text: string, speed: number = 50): Promise<void> {
    return new Promise((resolve) => {
      element.textContent = ''
      let index = 0

      const typeChar = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index)
          index++
          setTimeout(typeChar, speed)
        } else {
          resolve()
        }
      }

      typeChar()
    })
  }

  /**
   * Create a count-up animation
   */
  static countUp(element: HTMLElement, target: number, duration: number = 1000): void {
    const start = parseInt(element.textContent || '0')
    const increment = (target - start) / (duration / 16)
    let current = start

    const updateCount = () => {
      current += increment
      if (current < target) {
        element.textContent = Math.floor(current).toString()
        requestAnimationFrame(updateCount)
      } else {
        element.textContent = target.toString()
      }
    }

    updateCount()
  }

  /**
   * Create a morphing shape animation
   */
  static morphShape(element: SVGPathElement, newPath: string, duration: number = 500): void {
    const currentPath = element.getAttribute('d') || ''
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Simple path interpolation (would need a proper library for complex paths)
      if (progress === 1) {
        element.setAttribute('d', newPath)
      } else {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }
}

// Export default instance
export const defaultMicroInteractions = new MicroInteractionManager()

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      defaultMicroInteractions.observeNewElements()
    })
  } else {
    defaultMicroInteractions.observeNewElements()
  }
}