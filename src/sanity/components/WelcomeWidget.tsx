import React, { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { 
  House, 
  Rocket, 
  Palette, 
  MusicNotes, 
  ChartBar, 
  FileText, 
  User
} from 'phosphor-react'

interface ContentStats {
  projects: { published: number; drafts: number }
  playground: { published: number; drafts: number }
  playlists: { published: number; drafts: number }
}

export function WelcomeWidget() {
  const client = useClient()
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsPublished, projectsDrafts, playgroundPublished, playgroundDrafts, playlistsPublished, playlistsDrafts] = await Promise.all([
          client.fetch('count(*[_type == "project" && !(_id in path("drafts.**"))])'),
          client.fetch('count(*[_type == "project" && (_id in path("drafts.**"))])'),
          client.fetch('count(*[_type == "playground" && !(_id in path("drafts.**"))])'),
          client.fetch('count(*[_type == "playground" && (_id in path("drafts.**"))])'),
          client.fetch('count(*[_type == "playlist" && !(_id in path("drafts.**"))])'),
          client.fetch('count(*[_type == "playlist" && (_id in path("drafts.**"))])'),
        ])

        setStats({
          projects: { published: projectsPublished, drafts: projectsDrafts },
          playground: { published: playgroundPublished, drafts: playgroundDrafts },
          playlists: { published: playlistsPublished, drafts: playlistsDrafts }
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up real-time listener for document changes
    const subscription = client.listen('*[_type in ["project", "playground", "playlist"]]').subscribe((update) => {
      // Re-fetch stats when any document is created, updated, or deleted
      fetchStats()
    })

    // Also refresh stats every 30 seconds as a fallback
    const interval = setInterval(fetchStats, 30000)

    // Cleanup function
    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [client])

  const baseFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  const primaryOrange = '#f97316'
  const lightGray = '#F8F9FA'
  const darkGray = '#2D3748'
  const mediumGray = '#718096'

  return (
    <div style={{
      background: lightGray,
      color: darkGray,
      padding: '32px',
      borderRadius: '16px',
      margin: '24px',
      fontFamily: baseFont,
      border: '1px solid #E2E8F0'
    }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <User size={32} color={primaryOrange} weight="duotone" />
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '4px',
            letterSpacing: '-0.5px',
            color: darkGray
          }}>
            {greeting}, Jeffrey!
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '16px', 
            color: mediumGray,
            fontWeight: '400'
          }}>
            {currentDate}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Rocket size={28} color={primaryOrange} weight="duotone" />
            <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px', color: darkGray }}>
              Projects
            </div>
          </div>
          {loading ? (
            <div style={{ fontSize: '14px', color: mediumGray }}>Loading...</div>
          ) : (
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ChartBar size={16} color={primaryOrange} weight="fill" />
                <span style={{ fontWeight: '600', color: darkGray }}>
                  {stats?.projects.published || 0} Published
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color={mediumGray} weight="fill" />
                <span style={{ fontWeight: '400', color: mediumGray }}>
                  {stats?.projects.drafts || 0} Drafts
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Palette size={28} color={primaryOrange} weight="duotone" />
            <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px', color: darkGray }}>
              Playground
            </div>
          </div>
          {loading ? (
            <div style={{ fontSize: '14px', color: mediumGray }}>Loading...</div>
          ) : (
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ChartBar size={16} color={primaryOrange} weight="fill" />
                <span style={{ fontWeight: '600', color: darkGray }}>
                  {stats?.playground.published || 0} Published
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color={mediumGray} weight="fill" />
                <span style={{ fontWeight: '400', color: mediumGray }}>
                  {stats?.playground.drafts || 0} Drafts
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <MusicNotes size={28} color={primaryOrange} weight="duotone" />
            <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px', color: darkGray }}>
              Playlists
            </div>
          </div>
          {loading ? (
            <div style={{ fontSize: '14px', color: mediumGray }}>Loading...</div>
          ) : (
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ChartBar size={16} color={primaryOrange} weight="fill" />
                <span style={{ fontWeight: '600', color: darkGray }}>
                  {stats?.playlists.published || 0} Published
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color={mediumGray} weight="fill" />
                <span style={{ fontWeight: '400', color: mediumGray }}>
                  {stats?.playlists.drafts || 0} Drafts
                </span>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

export default WelcomeWidget 