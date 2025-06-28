import { defineType, defineField } from 'sanity'
import React from 'react'
import { MusicNotes } from 'phosphor-react'

export default defineType({
  name: 'playlist',
  title: 'Playlist',
  type: 'document',
  icon: () => React.createElement(MusicNotes, { size: 18, color: '#f97316', weight: 'duotone' }),
  fields: [
    defineField({
      name: 'name',
      title: 'Playlist Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'month',
      title: 'Month',
      type: 'string',
      options: {
        list: [
          { title: 'January', value: 'Jan' },
          { title: 'February', value: 'Feb' },
          { title: 'March', value: 'Mar' },
          { title: 'April', value: 'Apr' },
          { title: 'May', value: 'May' },
          { title: 'June', value: 'Jun' },
          { title: 'July', value: 'Jul' },
          { title: 'August', value: 'Aug' },
          { title: 'September', value: 'Sep' },
          { title: 'October', value: 'Oct' },
          { title: 'November', value: 'Nov' },
          { title: 'December', value: 'Dec' }
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().min(2020).max(new Date().getFullYear() + 1)
    }),
    defineField({
      name: 'coverArt',
      title: 'Cover Art',
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
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'featuredTrack',
      title: 'Featured Track',
      type: 'string',
      description: 'The standout track from this playlist'
    }),
    defineField({
      name: 'spotifyUrl',
      title: 'Spotify URL',
      type: 'url',
      validation: (Rule) => Rule.required().custom(url => {
        if (url && !url.includes('spotify.com')) {
          return 'Must be a valid Spotify URL'
        }
        return true
      })
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
      description: 'Show this playlist on the homepage',
      initialValue: false
    }),
    defineField({
      name: 'featuredOrder',
      title: 'Featured Order',
      type: 'number',
      description: 'Order for featured playlists (lower numbers appear first)',
      hidden: ({ document }) => !document?.featured,
      validation: (Rule) => Rule.min(0)
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional description of the playlist mood or theme'
    })
  ],
  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'featuredOrder', direction: 'asc' },
        { field: 'year', direction: 'desc' },
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
      title: 'name',
      month: 'month',
      year: 'year',
      featured: 'featured',
      featuredOrder: 'featuredOrder',
      featuredTrack: 'featuredTrack',
      publishedAt: 'publishedAt',
      media: 'coverArt'
    },
    prepare(selection) {
      const { title, month, year, featured, featuredOrder, featuredTrack, publishedAt, media } = selection
      
      const featuredBadge = featured ? '🌟 ' : ''
      const orderInfo = featured && featuredOrder ? ` #${featuredOrder}` : ''
      const trackInfo = featuredTrack ? ` • ${featuredTrack}` : ''
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Draft'
      
      return {
        title: `${featuredBadge}🎵 ${title}`,
        subtitle: `${month} ${year} • ${date}${orderInfo}${trackInfo}${featured ? ' • Featured' : ''}`,
        media: media
      }
    }
  }
})
