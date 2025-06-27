import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Jeffrey Herrera Website',

  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'wtlgwnno',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // About page (singleton)
            S.listItem()
              .title('About Page')
              .id('about')
              .child(
                S.document()
                  .schemaType('about')
                  .documentId('about')
                  .title('About Page')
              ),
            
            // Divider
            S.divider(),
            
            // Projects
            S.listItem()
              .title('Projects')
              .child(
                S.documentTypeList('project')
                  .title('Projects')
                  .filter('_type == "project"')
              ),
            
            // Playground
            S.listItem()
              .title('Playground')
              .child(
                S.documentTypeList('playground')
                  .title('Playground')
                  .filter('_type == "playground"')
              ),
            
            // Playlists
            S.listItem()
              .title('Playlists')
              .child(
                S.documentTypeList('playlist')
                  .title('Playlists')
                  .filter('_type == "playlist"')
              ),
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
