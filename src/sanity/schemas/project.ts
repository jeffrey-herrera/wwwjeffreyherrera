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
  ],
  orderings: [
    {
      title: 'Recently Created',
      name: 'recentlyCreated',
      by: [{ field: '_createdAt', direction: 'desc' }]
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
      media: 'image',
      tags: 'tags'
    },
    prepare(selection) {
      const { title, category, media, tags } = selection
      const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Project'
      const tagCount = tags?.length ? ` • ${tags.length} tags` : ''
      
      return {
        title: title,
        subtitle: `${categoryLabel}${tagCount}`,
        media: media
      }
    }
  }
})
