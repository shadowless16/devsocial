// components/Feed.tsx
"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts?page=1&limit=10");
        const data = await response.json();
        if (data.success) {
          setPosts(data.data.posts.map((post: any) => ({
            ...post,
            id: post._id,
            isLiked: false,
            viewsCount: post.viewsCount || 0,
            createdAt: new Date(post.createdAt).toLocaleDateString(),
          })));
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
    fetchPosts();
  }, []);

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
      {posts.map((post) => (
        <FeedItem
          key={post.id}
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
      ))}
    </div>
  );
}