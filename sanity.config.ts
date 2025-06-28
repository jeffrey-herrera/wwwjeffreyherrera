import { defineConfig, buildLegacyTheme } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemas'
import { WelcomeWidget } from './src/sanity/components/WelcomeWidget'
import { StatusPillStyles } from './src/sanity/components/StatusPillStyles'
import React from 'react'
import { 
  House, 
  User, 
  Briefcase, 
  Rocket, 
  Palette, 
  MusicNotes, 
  Lightning,
  Star,
  ChartBar,
  FileText,
  Eye
  } from 'phosphor-react'

// Custom theme with orange branding
const props = {
  '--my-white': '#fff',
  '--my-black': '#1a1a1a',
  '--my-orange': '#f97316',
  '--my-light-gray': '#f8f9fa',
  '--my-dark-gray': '#2d3748',
}

export const customTheme = buildLegacyTheme({
  /* Base theme colors */
  '--black': props['--my-black'],
  '--white': props['--my-white'],
  '--gray': '#718096',
  '--gray-base': '#718096',

  '--component-bg': props['--my-white'],
  '--component-text-color': props['--my-black'],

  /* Brand - This controls active states! */
  '--brand-primary': props['--my-orange'],

  // Default button
  '--default-button-color': '#666',
  '--default-button-primary-color': props['--my-orange'],
  '--default-button-success-color': '#10B981', // Green for published
  '--default-button-warning-color': '#F59E0B', // Amber for draft
  '--default-button-danger-color': '#EF4444', // Red for errors

  /* State colors for status pills */
  '--state-info-color': props['--my-orange'],
  '--state-success-color': '#10B981', // Green for published status
  '--state-warning-color': '#F59E0B', // Amber for draft status  
  '--state-danger-color': '#EF4444', // Red for error states

  /* Navbar */
  '--main-navigation-color': props['--my-orange'],
  '--main-navigation-color--inverted': props['--my-white'],

  '--focus-color': props['--my-orange'],
})

export default defineConfig({
  name: 'default',
  title: 'Jeffrey Herrera Website',

  projectId: 'wtlgwnno',
  dataset: 'production',

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content Management')
          .items([
            // Dashboard
            S.listItem()
              .title('Dashboard')
              .icon(() => React.createElement(House, { size: 18, color: 'currentColor', weight: 'duotone' }))
              .child(
                S.component(() => React.createElement(React.Fragment, null, 
                  React.createElement(StatusPillStyles),
                  React.createElement(WelcomeWidget)
                ))
                  .title('Welcome Dashboard')
              ),
            
            S.divider(),
            
            // About page (singleton)
            S.listItem()
              .title('About Page')
              .icon(() => React.createElement(User, { size: 18, color: 'currentColor', weight: 'duotone' }))
              .id('about')
              .child(
                S.document()
                  .schemaType('about')
                  .documentId('about')
                  .title('About Page')
              ),
            
            S.divider(),
            
            // Portfolio section
            S.listItem()
              .title('Portfolio')
              .icon(() => React.createElement(Briefcase, { size: 18, color: 'currentColor', weight: 'duotone' }))
              .schemaType('project')
              .child(
                S.documentTypeList('project')
                  .title('Portfolio')
                  .filter('_type == "project"')
                  .defaultOrdering([
                    {field: 'featured', direction: 'desc'},
                    {field: 'title', direction: 'asc'}
                  ])
              ),
            
            // Creative section
            S.listItem()
              .title('Playground')
              .icon(() => React.createElement(Palette, { size: 18, color: 'currentColor', weight: 'duotone' }))
              .schemaType('playground')
              .child(
                S.documentTypeList('playground')
                  .title('Playground')
                  .filter('_type == "playground"')
                  .defaultOrdering([
                    {field: 'featured', direction: 'desc'},
                    {field: 'publishedAt', direction: 'desc'}
                  ])
              ),
            
            // Music section
            S.listItem()
              .title('Playlists')
              .icon(() => React.createElement(MusicNotes, { size: 18, color: 'currentColor', weight: 'duotone' }))
              .schemaType('playlist')
              .child(
                S.documentTypeList('playlist')
                  .title('Playlists')
                  .filter('_type == "playlist"')
                  .defaultOrdering([
                    {field: 'featured', direction: 'desc'},
                    {field: 'publishedAt', direction: 'desc'}
                  ])
              ),
            
            S.divider(),
            
            // Quick Actions
            S.listItem()
              .title('Quick Actions')
              .icon(() => React.createElement(Lightning, { size: 18, color: 'currentColor', weight: 'duotone' }))
              .child(
                S.list()
                  .title('Quick Actions')
                  .items([
                    S.listItem()
                      .title('All Content (Recent)')
                      .icon(() => React.createElement(ChartBar, { size: 16, color: 'currentColor', weight: 'duotone' }))
                      .child(
                        S.documentTypeList('project')
                          .title('All Content')
                          .filter('_type in ["project", "playground", "playlist"]')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('Featured Content')
                      .icon(() => React.createElement(Star, { size: 16, color: 'currentColor', weight: 'fill' }))
                      .child(
                        S.documentTypeList('project')
                          .title('All Featured Content')
                          .filter('_type in ["project", "playground", "playlist"] && featured == true')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('Draft Content')
                      .icon(() => React.createElement(FileText, { size: 16, color: 'currentColor', weight: 'duotone' }))
                      .child(
                        S.documentTypeList('project')
                          .title('Draft Content')
                          .filter('_type in ["project", "playground", "playlist"] && !defined(publishedAt)')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                      ),
                  ])
              ),
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },

  theme: customTheme,
})