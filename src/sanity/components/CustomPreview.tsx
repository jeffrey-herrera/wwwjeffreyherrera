import React from 'react'

interface CustomPreviewProps {
  title: string
  subtitle?: string
  description?: string
  media?: any
  badge?: string
  status?: 'draft' | 'published' | 'featured'
}

export function CustomPreview({ 
  title, 
  subtitle, 
  description, 
  media, 
  badge,
  status 
}: CustomPreviewProps) {
  const statusColors = {
    draft: '#fbbf24',
    published: '#10b981', 
    featured: '#f59e0b'
  }

  const statusEmojis = {
    draft: '📝',
    published: '✅',
    featured: '⭐'
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '8px 0'
    }}>
      {media && (
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {typeof media === 'string' ? (
            <span style={{ fontSize: '24px' }}>{media}</span>
          ) : (
            media
          )}
        </div>
      )}
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '2px'
        }}>
          {badge && (
            <span style={{ fontSize: '16px' }}>{badge}</span>
          )}
          <h4 style={{ 
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {title}
          </h4>
        </div>
        
        {subtitle && (
          <p style={{ 
            margin: 0,
            fontSize: '12px',
            color: '#6b7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {subtitle}
          </p>
        )}
        
        {description && (
          <p style={{ 
            margin: '4px 0 0 0',
            fontSize: '11px',
            color: '#9ca3af',
            fontStyle: 'italic'
          }}>
            {description}
          </p>
        )}
      </div>
      
      {status && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: statusColors[status] + '20',
          border: `1px solid ${statusColors[status]}40`
        }}>
          <span style={{ fontSize: '10px' }}>{statusEmojis[status]}</span>
          <span style={{ 
            fontSize: '10px', 
            fontWeight: '500',
            color: statusColors[status]
          }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
    </div>
  )
}

export default CustomPreview 