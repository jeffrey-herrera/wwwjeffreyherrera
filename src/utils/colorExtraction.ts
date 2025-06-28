// Dynamic color palette extraction from images

export interface ColorPalette {
  dominant: string
  secondary: string
  accent: string
  text: string
  background: string
  muted: string
}

export interface ExtractedColors {
  rgb: [number, number, number]
  hex: string
  hsl: [number, number, number]
  luminance: number
  saturation: number
}

/**
 * Extract color palette from an image element
 */
export async function extractImageColors(imageElement: HTMLImageElement): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Set canvas size (smaller for performance)
      const maxSize = 150
      const scale = Math.min(maxSize / imageElement.width, maxSize / imageElement.height)
      canvas.width = imageElement.width * scale
      canvas.height = imageElement.height * scale

      // Draw image to canvas
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

      // Extract pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const colors = extractColorsFromImageData(imageData)
      
      // Generate palette
      const palette = generatePaletteFromColors(colors)
      resolve(palette)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Extract dominant colors from image data using color quantization
 */
function extractColorsFromImageData(imageData: ImageData): ExtractedColors[] {
  const pixels = imageData.data
  const colorCounts = new Map<string, { count: number; rgb: [number, number, number] }>()
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const alpha = pixels[i + 3]
    
    // Skip transparent pixels
    if (alpha < 128) continue
    
    // Quantize colors to reduce variations
    const qR = Math.round(r / 32) * 32
    const qG = Math.round(g / 32) * 32
    const qB = Math.round(b / 32) * 32
    
    const key = `${qR},${qG},${qB}`
    
    if (colorCounts.has(key)) {
      colorCounts.get(key)!.count++
    } else {
      colorCounts.set(key, { count: 1, rgb: [qR, qG, qB] })
    }
  }
  
  // Sort by frequency and get top colors
  const sortedColors = Array.from(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Take top 10 colors
  
  // Convert to ExtractedColors format
  return sortedColors.map(({ rgb }) => {
    const [r, g, b] = rgb
    return {
      rgb,
      hex: rgbToHex(r, g, b),
      hsl: rgbToHsl(r, g, b),
      luminance: calculateLuminance(r, g, b),
      saturation: rgbToHsl(r, g, b)[1]
    }
  })
}

/**
 * Generate a cohesive color palette from extracted colors
 */
function generatePaletteFromColors(colors: ExtractedColors[]): ColorPalette {
  if (colors.length === 0) {
    return getDefaultPalette()
  }
  
  // Filter out very dark or very light colors for better contrast
  const filteredColors = colors.filter(color => 
    color.luminance > 0.1 && color.luminance < 0.9
  )
  
  const workingColors = filteredColors.length > 0 ? filteredColors : colors
  
  // Find dominant color (most frequent, well-saturated)
  const dominant = findDominantColor(workingColors)
  
  // Find secondary color (complementary or analogous)
  const secondary = findSecondaryColor(workingColors, dominant)
  
  // Find accent color (high contrast, vibrant)
  const accent = findAccentColor(workingColors, dominant)
  
  // Generate text and background colors based on luminance
  const textColor = dominant.luminance > 0.5 ? '#1a1a1a' : '#ffffff'
  const backgroundColor = dominant.luminance > 0.5 ? '#ffffff' : '#1a1a1a'
  
  // Create muted version of dominant color
  const muted = adjustColorSaturation(dominant.hex, 0.3)
  
  return {
    dominant: dominant.hex,
    secondary: secondary.hex,
    accent: accent.hex,
    text: textColor,
    background: backgroundColor,
    muted
  }
}

/**
 * Find the most suitable dominant color
 */
function findDominantColor(colors: ExtractedColors[]): ExtractedColors {
  // Prefer colors with good saturation and medium luminance
  const scored = colors.map(color => ({
    ...color,
    score: color.saturation * (1 - Math.abs(color.luminance - 0.5))
  }))
  
  return scored.sort((a, b) => b.score - a.score)[0] || colors[0]
}

/**
 * Find a complementary secondary color
 */
function findSecondaryColor(colors: ExtractedColors[], dominant: ExtractedColors): ExtractedColors {
  const dominantHue = dominant.hsl[0]
  
  // Look for analogous colors (30-60 degrees away) or complementary (180 degrees)
  const candidates = colors.filter(color => {
    const hueDiff = Math.abs(color.hsl[0] - dominantHue)
    const normalizedDiff = Math.min(hueDiff, 360 - hueDiff)
    return normalizedDiff > 30 && normalizedDiff < 180
  })
  
  return candidates[0] || colors[1] || dominant
}

/**
 * Find a vibrant accent color
 */
function findAccentColor(colors: ExtractedColors[], dominant: ExtractedColors): ExtractedColors {
  // Look for highly saturated colors that contrast with dominant
  const candidates = colors.filter(color => 
    color.saturation > 0.6 && 
    Math.abs(color.luminance - dominant.luminance) > 0.3
  )
  
  return candidates[0] || colors[2] || dominant
}

/**
 * Utility functions
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
    
    switch (max) {
      case r: h = (g - b) / diff + (g < b ? 6 : 0); break
      case g: h = (b - r) / diff + 2; break
      case b: h = (r - g) / diff + 4; break
    }
    h /= 6
  }
  
  return [h * 360, s, l]
}

function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function adjustColorSaturation(hex: string, factor: number): string {
  const r = parseInt(hex.substr(1, 2), 16)
  const g = parseInt(hex.substr(3, 2), 16)
  const b = parseInt(hex.substr(5, 2), 16)
  
  const [h, s, l] = rgbToHsl(r, g, b)
  const newS = Math.max(0, Math.min(1, s * factor))
  
  return hslToHex(h, newS, l)
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  
  let [r, g, b] = [0, 0, 0]
  
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  
  return rgbToHex(r, g, b)
}

function getDefaultPalette(): ColorPalette {
  return {
    dominant: '#f97316', // Orange-500
    secondary: '#64748b', // Slate-500
    accent: '#06b6d4',    // Cyan-500
    text: '#1a1a1a',
    background: '#ffffff',
    muted: '#d1d5db'      // Gray-300
  }
}

/**
 * Generate CSS custom properties from palette
 */
export function generateCSSVariables(palette: ColorPalette, prefix: string = 'theme'): string {
  return `
    --${prefix}-dominant: ${palette.dominant};
    --${prefix}-secondary: ${palette.secondary};
    --${prefix}-accent: ${palette.accent};
    --${prefix}-text: ${palette.text};
    --${prefix}-background: ${palette.background};
    --${prefix}-muted: ${palette.muted};
  `.trim()
}

/**
 * Apply palette to element as CSS custom properties
 */
export function applyPaletteToElement(element: HTMLElement, palette: ColorPalette, prefix: string = 'theme'): void {
  Object.entries(palette).forEach(([key, value]) => {
    element.style.setProperty(`--${prefix}-${key}`, value)
  })
}

/**
 * Create a color-adaptive theme class
 */
export function createThemeClass(palette: ColorPalette): string {
  const isDark = calculateLuminance(
    parseInt(palette.dominant.substr(1, 2), 16),
    parseInt(palette.dominant.substr(3, 2), 16),
    parseInt(palette.dominant.substr(5, 2), 16)
  ) < 0.5
  
  return isDark ? 'theme-dark' : 'theme-light'
}