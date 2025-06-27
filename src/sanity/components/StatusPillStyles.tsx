import React, { useEffect } from 'react'

export function StatusPillStyles() {
  useEffect(() => {
    // Add basic styles
    const style = document.createElement('style')
    style.id = 'sanity-status-pill-styles'
    style.textContent = `
      /* Status pill styling */
      [data-ui="Badge"][data-tone="positive"] {
        background-color: #10B981 !important;
        color: white !important;
      }
      
      [data-ui="Badge"][data-tone="caution"] {
        background-color: #F59E0B !important;
        color: white !important;
      }
      
      /* Simple direct override for muted text */
      [data-ui="Text"][data-muted="true"] {
        color: rgba(0, 0, 0, 0.3) !important;
      }
    `
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById('sanity-status-pill-styles')
    if (existingStyle) {
      document.head.removeChild(existingStyle)
    }
    
    document.head.appendChild(style)
    
    // Function to fix orange background elements
    const fixOrangeBackgrounds = () => {
      const orangeElements = document.querySelectorAll('[style*="background-color: rgb(255, 105, 0)"], [style*="background: rgb(255, 105, 0)"]')
      
      orangeElements.forEach(element => {
        // Force white text on the element itself
        if (element instanceof HTMLElement) {
          element.style.color = 'white'
          
          // Force white text on all child elements
          const allChildren = element.querySelectorAll('*')
          allChildren.forEach(child => {
            if (child instanceof HTMLElement) {
              child.style.color = 'white'
              // Also handle SVG icons
              if (child.tagName === 'svg' || child.querySelector('svg')) {
                child.style.fill = 'white'
                const svgs = child.querySelectorAll('svg')
                svgs.forEach(svg => {
                  if (svg instanceof HTMLElement) {
                    svg.style.fill = 'white'
                    svg.style.color = 'white'
                  }
                })
              }
            }
          })
        }
      })
    }
    
    // Run immediately
    fixOrangeBackgrounds()
    
    // Set up observer to watch for changes
    const observer = new MutationObserver(() => {
      fixOrangeBackgrounds()
    })
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })
    
    // Also run on a timer as backup
    const interval = setInterval(fixOrangeBackgrounds, 100)
    
    // Cleanup function
    return () => {
      observer.disconnect()
      clearInterval(interval)
      const styleToRemove = document.getElementById('sanity-status-pill-styles')
      if (styleToRemove) {
        document.head.removeChild(styleToRemove)
      }
    }
  }, [])

  return null // This component only adds styles
}

export default StatusPillStyles 