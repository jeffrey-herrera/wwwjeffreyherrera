import { defineType, defineField } from 'sanity'
import React from 'react'
import { Rocket } from 'phosphor-react'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: () => React.createElement(Rocket, { size: 18, color: '#FF6900', weight: 'duotone' }),
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Brand', value: 'brand' },
          { title: 'Physical', value: 'physical' },
          { title: 'Digital', value: 'digital' }
        ]
      },
      validation: (Rule) => Rule.required()
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Technologies and skills used in this project'
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this project on the homepage',
      initialValue: false
    }),
    defineField({
      name: 'projectImage',
      title: 'Project Image',
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
      ]
    }),
    defineField({
      name: 'projectUrl',
      title: 'Project URL',
      type: 'url',
      description: 'Link to the live project'
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      description: 'Link to the project repository'
    })
  ],
  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'title', direction: 'asc' }
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    },
    {
      title: 'Title Z-A',
      name: 'titleDesc',
      by: [{ field: 'title', direction: 'desc' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      featured: 'featured',
      media: 'projectImage',
      tags: 'tags'
    },
    prepare(selection) {
      const { title, category, featured, media, tags } = selection
      const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Project'
      const featuredBadge = featured ? '⭐ ' : ''
      const tagCount = tags?.length ? ` • ${tags.length} tags` : ''
      
      return {
        title: `${featuredBadge}${title}`,
        subtitle: `${categoryLabel}${tagCount}${featured ? ' • Featured' : ''}`,
        media: media
      }
    }
  }
})
