"use client";

import { useCallback } from 'react';
import { usePosts } from '@/contexts/app-context';
import { apiClient } from '@/lib/api/api-client';

export function usePostsState() {
  const { posts, loading, fetchPosts, likePost, deletePost } = usePosts();

  const handleLike = useCallback(async (postId: string) => {
    await likePost(postId);
  }, [likePost]);

  const handleDelete = useCallback(async (postId: string) => {
    await deletePost(postId);
  }, [deletePost]);

  const handleComment = useCallback(async (postId: string, content: string) => {
    try {
      const response = await apiClient.createComment(postId, content);
      if (response.success) {
        // Optionally refresh posts or update comment count
        // This could be handled by the context in the future
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Failed to post comment:', errorMessage);
      throw error;
    }
  }, []);

  const refreshPosts = useCallback(async () => {
    await fetchPosts(1, true);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    handleLike,
    handleDelete,
    handleComment,
    refreshPosts,
    fetchPosts,
  };
}