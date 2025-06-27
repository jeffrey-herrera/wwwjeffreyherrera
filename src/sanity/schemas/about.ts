import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
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
      type: 'text',
      description: 'A brief description about yourself',
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
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of your key skills'
    }),
    defineField({
      name: 'experience',
      title: 'Experience',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'company',
              title: 'Company',
              type: 'string',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'role',
              title: 'Role',
              type: 'string',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'period',
              title: 'Time Period',
              type: 'string',
              description: 'e.g. "2021 - Present" or "2019 - 2021"'
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text'
            }
          ]
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
          name: 'linkedin',
          title: 'LinkedIn URL',
          type: 'url'
        },
        {
          name: 'twitter',
          title: 'Twitter URL',
          type: 'url'
        },
        {
          name: 'github',
          title: 'GitHub URL',
          type: 'url'
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
