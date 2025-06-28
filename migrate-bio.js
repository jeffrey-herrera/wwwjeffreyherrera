import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'wtlgwnno',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, // You'll need to set this
  apiVersion: '2024-01-01'
})

async function migrateBioField() {
  try {
    // Fetch the about document
    const aboutDoc = await client.fetch('*[_type == "about"][0]')
    
    if (!aboutDoc) {
      console.log('No about document found')
      return
    }

    // Check if bio is still a string
    if (typeof aboutDoc.bio === 'string') {
      console.log('Converting bio from string to portable text...')
      
      // Convert string to portable text format
      const portableTextBio = [
        {
          _type: 'block',
          _key: 'bio-block-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'bio-span-1',
              text: aboutDoc.bio,
              marks: []
            }
          ],
          markDefs: []
        }
      ]

      // Update the document
      await client
        .patch(aboutDoc._id)
        .set({ bio: portableTextBio })
        .commit()

      console.log('✅ Bio field successfully migrated to portable text!')
    } else {
      console.log('Bio field is already in portable text format')
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

migrateBioField() 