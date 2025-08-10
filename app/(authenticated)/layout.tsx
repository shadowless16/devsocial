import type React from "react"
import { AuthLayoutClient } from "@/components/layout/auth-layout-client"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>
}
