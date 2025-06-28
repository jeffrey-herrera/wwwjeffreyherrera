import { defineType, defineField } from 'sanity'
import React from 'react'
import { Palette } from 'phosphor-react'

export default defineType({
  name: 'playground',
  title: 'Playground',
  type: 'document',
  icon: () => React.createElement(Palette, { size: 18, color: '#f97316', weight: 'duotone' }),
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'type',
      title: 'Content Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Writing', value: 'writing' },
          { title: 'Experiment', value: 'experiment' }
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the content'
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            }
          ]
        }
      ],
      description: 'Rich text content for writing pieces',
      hidden: ({ document }) => document?.type !== 'writing'
    }),
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ],
      description: 'Main image for image posts or cover image for other content'
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags to categorize your content'
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this content on the homepage',
      initialValue: false
    }),
    defineField({
      name: 'featuredOrder',
      title: 'Featured Order',
      type: 'number',
      description: 'Order for featured playground items (lower numbers appear first)',
      hidden: ({ document }) => !document?.featured,
      validation: (Rule) => Rule.min(0)
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'Link to live project or external content'
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      description: 'Link to source code repository'
    })
  ],
  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'featuredOrder', direction: 'asc' },
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Published Date, Newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    },
    {
      title: 'Published Date, Oldest',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      featured: 'featured',
      featuredOrder: 'featuredOrder',
      publishedAt: 'publishedAt',
      tags: 'tags',
      media: 'image'
    },
    prepare(selection) {
      const { title, type, featured, featuredOrder, publishedAt, tags, media } = selection
      
             // Format type with emoji
       const typeEmojis: Record<string, string> = {
         'image': '🖼️',
         'writing': '✍️',
         'experiment': '🧪'
       }
       
       const typeLabel = type ? `${typeEmojis[type] || '🎭'} ${type.charAt(0).toUpperCase() + type.slice(1)}` : '🎭 Playground item'
      const featuredBadge = featured ? '⭐ ' : ''
      const orderInfo = featured && featuredOrder ? ` #${featuredOrder}` : ''
      const tagCount = tags?.length ? ` • ${tags.length} tags` : ''
      
      // Format date
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Draft'
      
      return {
        title: `${featuredBadge}${title}`,
        subtitle: `${typeLabel} • ${date}${orderInfo}${tagCount}${featured ? ' • Featured' : ''}`,
        media: media
      }
    }
  }
})
