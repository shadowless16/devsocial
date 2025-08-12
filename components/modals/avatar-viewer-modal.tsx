"use client"

import React, { Suspense, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import dynamic from 'next/dynamic'

// Dynamically import Three.js components with no SSR
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false })
const useGLTF = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.useGLTF })), { ssr: false })

interface AvatarViewerModalProps {
  isOpen: boolean
  onClose: () => void
  avatarUrl: string
  username: string
}

function AvatarModel({ url }: { url: string }) {
  const [gltf, setGltf] = useState<any>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@react-three/drei').then(({ useGLTF }) => {
        try {
          const model = useGLTF(url)
          setGltf(model)
        } catch (error) {
          console.error('Error loading 3D model:', error)
        }
      })
    }
  }, [url])
  
  if (!gltf?.scene) return null
  
  return <primitive object={gltf.scene} scale={2} position={[0, -1, 0]} />
}

export function AvatarViewerModal({ isOpen, onClose, avatarUrl, username }: AvatarViewerModalProps) {
  const [mounted, setMounted] = useState(false)
  const is3D = avatarUrl?.endsWith('.glb')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{username}'s 3D Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center p-4">
          {is3D ? (
            <div className="w-96 h-96 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Suspense fallback={null}>
                  <AvatarModel url={avatarUrl} />
                  <OrbitControls 
                    enableZoom={true} 
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={2}
                  />
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <Avatar className="w-80 h-80">
              <AvatarImage src={avatarUrl} alt={`${username}'s avatar`} />
              <AvatarFallback className="text-6xl">
                {username.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}