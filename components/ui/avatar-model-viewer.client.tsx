"use client"

import React from 'react'
import '@google/model-viewer'

interface AvatarModelViewerProps {
  url: string
  className?: string
  size?: number
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

export default function AvatarModelViewer({ url, className = "", size = 100 }: AvatarModelViewerProps) {
  if (!url) return <div style={{ color: 'white' }}>No avatar</div>

  return (
    <div className={className} style={{ width: size, height: size }}>
      <model-viewer
        src={url}
        alt="3D Avatar"
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}