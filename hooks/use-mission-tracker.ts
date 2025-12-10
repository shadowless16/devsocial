"use client"

import { useCallback } from "react"
import { apiClient } from "@/lib/api/api-client"

export function useMissionTracker() {
  const trackProgress = useCallback(async (metric: string, increment: number = 1, metadata?: unknown) => {
    try {
      await apiClient.trackMissionProgress(metric, increment, metadata as Record<string, unknown>)
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Failed to track mission progress:", errorMessage)
    }
  }, [])

  const trackFollow = useCallback(() => trackProgress("follows"), [trackProgress])
  const trackPost = useCallback(() => trackProgress("posts"), [trackProgress])
  const trackLike = useCallback(() => trackProgress("likes_given"), [trackProgress])
  const trackComment = useCallback(() => trackProgress("comments"), [trackProgress])
  const trackCodePost = useCallback(() => trackProgress("code_posts"), [trackProgress])
  const trackProjectShare = useCallback(() => trackProgress("projects_shared"), [trackProgress])
  const trackHashtagUsage = useCallback((hashtag?: string) => 
    trackProgress("hashtag_usage", 1, { hashtag }), [trackProgress])

  return {
    trackProgress,
    trackFollow,
    trackPost,
    trackLike,
    trackComment,
    trackCodePost,
    trackProjectShare,
    trackHashtagUsage,
  }
}