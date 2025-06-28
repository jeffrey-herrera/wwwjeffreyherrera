import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'wtlgwnno',
  dataset: 'production',
  token: import.meta.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
})

// Helper function for building GROQ queries
export function groq(strings: TemplateStringsArray, ...values: any[]) {
  return strings.reduce((result, string, i) => {
    return result + string + (values[i] || '')
  }, '')
}
