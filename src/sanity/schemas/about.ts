import { defineType, defineField } from 'sanity'
import React from 'react'
import { User } from 'phosphor-react'

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  icon: () => React.createElement(User, { size: 18, color: '#FF6900', weight: 'duotone' }),
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: true
                  }
                ]
              }
            ]
          }
        }
      ],
      description: 'Rich text bio with formatting options',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile Image',
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
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (Rule) => Rule.required().email()
        },
        {
          name: 'instagram',
          title: 'Instagram URL',
          type: 'url',
          description: 'Full Instagram profile URL'
        },
        {
          name: 'linkedin',
          title: 'LinkedIn URL',
          type: 'url',
          description: 'Full LinkedIn profile URL'
        }
      ]
    })
  ],
  preview: {
    select: {
      title: 'title'
    }
  }
})
