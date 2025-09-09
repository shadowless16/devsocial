"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, FileText, Loader2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface PostAIActionsProps {
  postContent: string;
  postId: string;
  className?: string;
}

export function PostAIActions({ postContent, postId, className = "" }: PostAIActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'summarize' | 'explain' | null>(null);
  const [summarizeUsage, setSummarizeUsage] = useState(0);
  const [explainUsage, setExplainUsage] = useState(0);
  const [summarizeLimit] = useState(50); // Monthly limit
  const [explainLimit] = useState(5); // Daily limit
  const { toast } = useToast();

  // Load usage on component mount
  useEffect(() => {
    const fetchSummarizeUsage = async () => {
      try {
        const response = await fetch('/api/posts/summarize/usage');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSummarizeUsage(data.data.used);
          }
        }
      } catch (error) {
        console.error('Failed to fetch summarize usage:', error);
      }
    };
    
    fetchSummarizeUsage();
  }, []);

  const handleAIAction = async (type: 'summarize' | 'explain') => {
    if (!postContent.trim() || postContent.length < 10) {
      toast({
        title: "Content too short",
        description: "Post content must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    const currentUsage = type === 'summarize' ? summarizeUsage : explainUsage;
    const currentLimit = type === 'summarize' ? summarizeLimit : explainLimit;
    
    if (currentUsage >= currentLimit) {
      toast({
        title: "Usage limit reached",
        description: `You've reached your ${type === 'summarize' ? 'monthly' : 'daily'} limit of ${currentLimit} ${type} actions.`,
        variant: "destructive",
      });
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    setActionType(type);
    setAiResponse(null);

    try {
      const endpoint = type === 'summarize' ? '/api/posts/summarize' : '/api/posts/explain';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }
      
      if (data.success && data.data) {
        const result = type === 'summarize' ? data.data.summary : data.data.explanation;
        setAiResponse(result);
        
        // Update usage count
        if (type === 'summarize') {
          const remainingUsage = data.data.remainingUsage || 0;
          setSummarizeUsage(summarizeLimit - remainingUsage);
        } else {
          const remainingUsage = data.data.remainingUsage || 0;
          setExplainUsage(explainLimit - remainingUsage);
        }
        
        toast({
          title: `AI ${type} generated`,
          description: `Successfully generated ${type} for this post.`,
        });
      } else {
        throw new Error(data.message || 'Failed to process request');
      }
    } catch (error) {
      toast({
        title: "AI processing failed",
        description: error instanceof Error ? error.message : "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResponse = () => {
    setAiResponse(null);
    setActionType(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* AI Action Buttons */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
              onClick={() => handleAIAction('summarize')}
              disabled={isProcessing || summarizeUsage >= summarizeLimit}
            >
              {isProcessing && actionType === 'summarize' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              <span className="text-xs">Summarize</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Summary of this post ({summarizeLimit - summarizeUsage} left this month)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 rounded-full px-3 text-muted-foreground hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50"
              onClick={() => handleAIAction('explain')}
              disabled={isProcessing || explainUsage >= explainLimit}
            >
              {isProcessing && actionType === 'explain' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              <span className="text-xs">Explain</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Explanation of this post ({explainLimit - explainUsage} left today)</TooltipContent>
        </Tooltip>

        {(summarizeUsage > 0 || explainUsage > 0) && (
          <div className="flex gap-1">
            {summarizeUsage > 0 && (
              <Badge variant="outline" className="text-xs">
                S: {summarizeUsage}/{summarizeLimit}
              </Badge>
            )}
            {explainUsage > 0 && (
              <Badge variant="outline" className="text-xs">
                E: {explainUsage}/{explainLimit}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* AI Response Display */}
      {aiResponse && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  AI {actionType === 'summarize' ? 'Summary' : 'Explanation'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={clearResponse}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-sm text-blue-800 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded text-xs">{children}</code>,
                  pre: ({ children }) => <pre className="bg-blue-100 text-blue-900 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {aiResponse}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}