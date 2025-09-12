// components/Feed.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeedItem } from "@/components/feed/FeedItem";
import { CommentItem } from "@/components/feed/comment-item";

interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  } | null;
  content: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  videoUrls?: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  xpAwarded: number;
  createdAt: string;
  isAnonymous: boolean;
  isLiked: boolean;
}

interface Comment {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  };
  content: string;
  likesCount: number;
  createdAt: string;
  isLiked: boolean;
  replies?: Comment[];
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<{ [postId: string]: Comment[] }>({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      const data = await response.json();
      if (data.success) {
        const newPosts = data.data.posts.map((post: any) => ({
          ...post,
          id: post._id,
          isLiked: false,
          viewsCount: post.viewsCount || 0,
          createdAt: new Date(post.createdAt).toLocaleDateString(),
        }));
        
        setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
        setHasMore(newPosts.length === 10); // If less than 10, no more posts
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchPosts(1, true);

    // Optimistic post created listener
    const handlePostCreated = (e: any) => {
      try {
        const p = e?.detail;
        if (!p) return;
        const normalized = {
          ...p,
          id: p.id || p._id || p._id?.toString(),
          isLiked: p.isLiked || false,
          viewsCount: p.viewsCount || p.viewsCount || 0,
          createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        } as Post;
        setPosts(prev => [normalized, ...prev]);
      } catch (err) {
        console.debug('Failed to handle post:created', err);
      }
    };

    window.addEventListener('post:created', handlePostCreated as EventListener);

    return () => {
      window.removeEventListener('post:created', handlePostCreated as EventListener);
    };
  }, [fetchPosts]);

  // Infinite scroll logic
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
  if (observer.current) observer.current.disconnect();
  observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchPosts(nextPage);
          return nextPage;
        });
      }
    });
  if (node) observer.current?.observe(node);
  }, [loading, hasMore, fetchPosts]);

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      const data = await response.json();
      if (data.success) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: data.data.comments.map((comment: any) => ({
            ...comment,
            id: comment._id,
            isLiked: false,
            createdAt: new Date(comment.createdAt).toLocaleDateString(),
          })),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/likes/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: data.data.liked, likesCount: data.data.likesCount }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });
      const data = await response.json();
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, commentsCount: p.commentsCount + 1 }
              : p
          )
        );
        await fetchComments(postId);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleCommentLike = async (commentId: string, postId: string) => {
    try {
      const response = await fetch(`/api/likes/comments/${commentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: prev[postId].map((c) =>
c.id === commentId
              ? { ...c, isLiked: data.data.liked, likesCount: data.data.likesCount }
              : c
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  // Fetch comments when showComments is toggled
  const handleShowComments = (postId: string, show: boolean) => {
    if (show && !commentsByPost[postId]) {
      fetchComments(postId);
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        return (
          <div key={post.id} ref={isLast ? lastPostElementRef : null}>
            <FeedItem
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShowComments={(show: boolean) => handleShowComments(post.id, show)}
            >
              {commentsByPost[post.id]?.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={comment.replies || []}
                  onLike={() => handleCommentLike(comment.id, post.id)}
                />
              ))}
            </FeedItem>
          </div>
        );
      })}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          You've reached the end of the feed!
        </div>
      )}
    </div>
  );
}