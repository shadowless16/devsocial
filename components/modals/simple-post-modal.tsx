// components/modals/simple-post-modal.tsx
"use client";

import React, { useState, useRef } from "react";
import { X, ImageIcon, Video, Hash, Smile, Code, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMissionTracker } from "@/hooks/use-mission-tracker";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { MentionInput } from "@/components/ui/mention-input";
import { PollCreator } from "@/components/poll/poll-creator";

interface SimplePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
}

export function SimplePostModal({ isOpen, onClose, onSubmit }: SimplePostModalProps) {
  const { toast } = useToast();
  const { trackPost, trackCodePost, trackHashtagUsage } = useMissionTracker();
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollData, setPollData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-extract hashtags from content
  const extractHashtags = (text: string) => {
    const hashtagRegex = /#[\w]+/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map(tag => tag.toLowerCase());
  };

  // Auto code detection
  const detectCodeContent = (text: string): { isCode: boolean; language?: string } => {
    const codePatterns = [
      { pattern: /```[\s\S]*?```/g, language: null },
      { pattern: /function\s+\w+\s*\(/g, language: 'javascript' },
      { pattern: /const\s+\w+\s*=/g, language: 'javascript' },
      { pattern: /let\s+\w+\s*=/g, language: 'javascript' },
      { pattern: /def\s+\w+\s*\(/g, language: 'python' },
      { pattern: /print\s*\(/g, language: 'python' },
      { pattern: /public\s+class\s+\w+/g, language: 'java' },
      { pattern: /#include\s*<[^>]+>/g, language: 'cpp' },
      { pattern: /SELECT\s+.*FROM/gi, language: 'sql' },
    ];
    
    for (const { pattern, language } of codePatterns) {
      if (pattern.test(text)) {
        return { isCode: true, language: language || undefined };
      }
    }
    return { isCode: false };
  };

  const autoFormatCode = (text: string, language?: string): string => {
    if (text.includes('```')) return text;
    
    const lines = text.split('\n');
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && (
        /^[\s]*[{}();]/.test(trimmed) ||
        /[{}();]$/.test(trimmed) ||
        /^[\s]*(const|let|var|function|class|def|public|private|if|for|while|return)\s/.test(trimmed) ||
        /import\s+/.test(trimmed) ||
        /export\s+/.test(trimmed) ||
        /console\./.test(trimmed)
      );
    });
    
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    // Lower threshold for better detection
    if (nonEmptyLines.length >= 1 && (codeLines.length / nonEmptyLines.length > 0.2 || codeLines.length >= 2)) {
      const lang = language || 'javascript';
      return `\`\`\`${lang}\n${text}\n\`\`\``;
    }
    
    return text;
  };

  // Handle content change with auto-formatting and tag extraction
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Auto-detect and format code after a short delay
    setTimeout(() => {
      if (newContent.trim().length > 15 && !newContent.includes('```')) {
        const detection = detectCodeContent(newContent);
        if (detection.isCode) {
          const formattedContent = autoFormatCode(newContent, detection.language);
          if (formattedContent !== newContent) {
            setContent(formattedContent);
            const extractedTags = extractHashtags(formattedContent);
            if (detection.language) {
              const langTag = `#${detection.language}`;
              const allTags = [...new Set([...extractedTags, langTag])];
              setTags(allTags.slice(0, 5));
            } else {
              setTags(extractedTags.slice(0, 5));
            }
            return;
          }
        }
      }
      
      const extractedTags = extractHashtags(newContent);
      setTags(extractedTags.slice(0, 5));
    }, 500);
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: fileFormData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        
        setUploadProgress(((index + 1) / files.length) * 100);
        return data.secure_url || data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setMediaUrls(prev => [...prev, ...urls].slice(0, 4));
      
      toast({
        title: "Upload successful",
        description: `${urls.length} file(s) uploaded`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove media item
  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !pollData) {
      toast({
        title: "Content required",
        description: "Please write something or create a poll before posting.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      content: content.trim(),
      imageUrls: mediaUrls,
      tags,
      isAnonymous: false,
      poll: pollData ? {
        question: pollData.question,
        options: pollData.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          votes: 0,
          voters: [],
        })),
        settings: pollData.settings,
        endsAt: pollData.settings.duration ? new Date(Date.now() + pollData.settings.duration) : undefined,
        totalVotes: 0,
      } : undefined,
    };

    try {
      await onSubmit(postData);
      
      // Track missions
      await trackPost();
      if (content.includes('```')) {
        await trackCodePost();
      }
      if (tags.length > 0) {
        await trackHashtagUsage();
      }

      // Reset form
      setContent("");
      setMediaUrls([]);
      setTags([]);
      setPollData(null);
      setShowPollCreator(false);
      onClose();
      
      toast({
        title: "Posted successfully!",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      toast({
        title: "Failed to post",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  const isVideo = (url: string) => url.includes('video') || url.match(/\.(mp4|webm|ogg)$/i);
  const characterCount = content.length;
  const maxCharacters = 2000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Post</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Poll Creator */}
          {showPollCreator ? (
            <PollCreator
              onPollCreate={(poll) => {
                setPollData(poll);
                setShowPollCreator(false);
              }}
              onCancel={() => setShowPollCreator(false)}
            />
          ) : pollData ? (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Poll Preview</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPollData(null);
                    setShowPollCreator(true);
                  }}
                >
                  Edit
                </Button>
              </div>
              <p className="font-medium mb-2">{pollData.question}</p>
              {pollData.options.map((opt: any) => (
                <div key={opt.id} className="p-2 bg-white dark:bg-gray-800 rounded mb-1 text-sm">
                  {opt.text}
                </div>
              ))}
            </div>
          ) : (
          <>
          {/* Content Input */}
          <div className="mb-4">
            <MentionInput
              placeholder="What's on your mind?"
              value={content}
              onChange={handleContentChange}
              className="min-h-[120px] resize-none border-0 text-lg placeholder:text-gray-500 focus-visible:ring-0 p-0"
            />
            
            {/* Character Counter */}
            <div className="flex justify-between items-center mt-2">
              {isOverLimit && (
                <div className="text-sm text-red-500 font-medium">
                  ⚠️ Content too long! Please shorten your post.
                </div>
              )}
              <div className="ml-auto">
                <span className={`text-sm font-medium ${
                  isOverLimit ? 'text-red-500' : 
                  characterCount > maxCharacters * 0.9 ? 'text-orange-500' : 
                  'text-gray-500'
                }`}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>
            </div>
          </div>

          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden">
                  {isVideo(url) ? (
                    <video
                      src={url}
                      className="w-full h-32 object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Tags Display */}
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          </>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            {/* Media Upload Buttons */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                disabled={isUploading || mediaUrls.length >= 4}
              />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || mediaUrls.length >= 4}
                className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFileUpload(files);
                  };
                  input.click();
                }}
                disabled={isUploading || mediaUrls.length >= 4}
                className="h-9 w-9 p-0 rounded-full hover:bg-green-50 hover:text-green-600"
              >
                <Video className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const currentTags = content.match(/#[\w]+/g) || [];
                  if (currentTags.length === 0) {
                    setContent(prev => prev + ' #');
                  }
                }}
                className="h-9 w-9 p-0 rounded-full hover:bg-purple-50 hover:text-purple-600"
              >
                <Hash className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (content.trim() && !content.includes('```')) {
                    const detection = detectCodeContent(content);
                    const formatted = autoFormatCode(content, detection.language);
                    if (formatted !== content) {
                      setContent(formatted);
                      if (detection.language) {
                        const langTag = `#${detection.language}`;
                        const extractedTags = extractHashtags(formatted);
                        const allTags = [...new Set([...extractedTags, langTag])];
                        setTags(allTags.slice(0, 5));
                      }
                    }
                  }
                }}
                className="h-9 w-9 p-0 rounded-full hover:bg-orange-50 hover:text-orange-600"
              >
                <Code className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPollCreator(true)}
                disabled={showPollCreator || pollData}
                className="h-9 w-9 p-0 rounded-full hover:bg-indigo-50 hover:text-indigo-600"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>

              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="h-9 w-9 p-0 rounded-full hover:bg-yellow-50 hover:text-yellow-600"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                {showEmojiPicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowEmojiPicker(false)}
                    />
                    <div className="absolute bottom-12 left-0 z-50">
                      <EmojiPicker
                        onEmojiSelect={(emoji) => {
                          setContent(prev => prev + emoji);
                        }}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Post Button */}
            <Button
              type="submit"
              disabled={(!content.trim() && !pollData) || isUploading || isOverLimit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-full"
            >
              {isUploading ? `Uploading ${Math.round(uploadProgress)}%` : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}