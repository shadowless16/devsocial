// components/feed/comment-item.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimeAgo } from "@/utils/formatDate";
import { EnhancedCommentInput } from "@/components/ui/enhanced-comment-input";

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

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply?: (parentCommentId: string, content: string) => void;
  isReply?: boolean;
  depth?: number;
  replies?: Comment[];
}

export function CommentItem({ comment, onLike, onReply, isReply = false, depth = 0 }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // Calculate visual styling based on depth
  const getIndentationStyle = () => {
    if (depth === 0) return {};
    return {
      marginLeft: `${Math.min(depth * 24, 96)}px`, // 24px per level, max 96px
      position: 'relative' as const
    };
  };
  
  const borderLeftClass = depth > 0 ? "border-l-2 border-gray-300 pl-3" : "";
  const backgroundClass = depth > 0 ? "bg-gray-50/70" : "bg-white";
  const cardShadowClass = depth > 0 ? 'shadow-sm border-l-4 border-l-blue-100' : 'shadow-md';
  
  // Add connecting line for nested comments
  const connectingLineClass = depth > 0 ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200" : "";

  return (
    <div style={getIndentationStyle()} className={`${borderLeftClass} ${connectingLineClass} relative`}>
      <Card className={`${backgroundClass} ${cardShadowClass} transition-all duration-200 hover:shadow-lg`}>
        <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <UserAvatar 
            user={comment.author}
            className="w-8 h-8"
          />

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900">{comment.author.displayName}</h4>
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                L{comment.author.level}
              </Badge>
              <span className="text-xs text-gray-500">@{comment.author.username}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
            </div>

            <p className="text-gray-900 text-sm mb-3">{comment.content}</p>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(comment.id)}
                className={`flex items-center space-x-1 text-xs ${
                  comment.isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
                }`}
              >
                <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
                <span>{comment.likesCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <MessageCircle className="w-3 h-3" />
                <span>Reply</span>
                {comment.replies && comment.replies.length > 0 && (
                  <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {comment.replies.length}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>

            {showReplyInput && (
              <div className="mt-3">
                <EnhancedCommentInput
                  placeholder={`Reply to @${comment.author.username}...`}
                  onSubmit={(content) => {
                    if (onReply) {
                      onReply(comment.id, content);
                      setShowReplyInput(false);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
        </CardContent>
      </Card>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              isReply={true}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}