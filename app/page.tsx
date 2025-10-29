"use client"

export default function RootPage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/home')
  }
  
  return null
}
