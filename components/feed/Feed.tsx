// components/Feed.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeedItem } from "@/components/feed/FeedItem";
import { CommentItem } from "@/components/feed/comment-item";
import { usePostsState } from "@/hooks/use-posts-state";

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
  const { posts, loading, handleLike, handleDelete, handleComment, fetchPosts } = usePostsState();
  const [commentsByPost, setCommentsByPost] = useState<{ [postId: string]: Comment[] }>({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleFetchPosts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    await fetchPosts(pageNum, reset);
    setHasMore(posts.length % 10 === 0); // If not divisible by 10, no more posts
  }, [loading, fetchPosts, posts.length]);

  useEffect(() => {
    handleFetchPosts(1, true);
  }, []);

  // Infinite scroll logic
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
  if (observer.current) observer.current.disconnect();
  observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          handleFetchPosts(nextPage);
          return nextPage;
        });
      }
    });
  if (node) observer.current?.observe(node);
  }, [loading, hasMore, handleFetchPosts]);

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
              onDelete={handleDelete}
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