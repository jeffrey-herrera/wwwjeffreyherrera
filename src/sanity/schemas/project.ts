import { defineType, defineField } from 'sanity'
import React from 'react'
import { Rocket } from 'phosphor-react'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: () => React.createElement(Rocket, { size: 18, color: '#f97316', weight: 'duotone' }),
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
      name: 'featuredOrder',
      title: 'Featured Order',
      type: 'number',
      description: 'Order for featured projects (lower numbers appear first)',
      hidden: ({ document }) => !document?.featured,
      validation: (Rule) => Rule.min(0)
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().min(2020).max(new Date().getFullYear() + 1)
    }),
    defineField({
      name: 'image',
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
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'gallery',
      title: 'Project Gallery',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          { name: 'alt', type: 'string', title: 'Alt text' },
          { name: 'caption', type: 'string', title: 'Caption' }
        ]
      }],
      description: 'Additional images for the project page'
    }),
    defineField({
      name: 'content',
      title: 'Project Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailed project description and case study'
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
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
        { field: 'featuredOrder', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' }
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
      featuredOrder: 'featuredOrder',
      year: 'year',
      media: 'image',
      tags: 'tags'
    },
    prepare(selection) {
      const { title, category, featured, featuredOrder, year, media, tags } = selection
      const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Project'
      const featuredBadge = featured ? '⭐ ' : ''
      const orderInfo = featured && featuredOrder ? ` #${featuredOrder}` : ''
      const yearInfo = year ? ` • ${year}` : ''
      const tagCount = tags?.length ? ` • ${tags.length} tags` : ''
      
      return {
        title: `${featuredBadge}${title}`,
        subtitle: `${categoryLabel}${yearInfo}${orderInfo}${tagCount}${featured ? ' • Featured' : ''}`,
        media: media
      }
    }
  }
})
