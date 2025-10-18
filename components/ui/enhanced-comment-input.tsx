"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MentionInput } from "@/components/ui/mention-input";
import EmojiPicker from "emoji-picker-react";
import { Smile, Code, Image, X } from "lucide-react";

interface EnhancedCommentInputProps {
  placeholder?: string;
  onSubmit: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export function EnhancedCommentInput({ 
  placeholder = "Write a reply...", 
  onSubmit, 
  disabled = false 
}: EnhancedCommentInputProps) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (nonEmptyLines.length >= 1 && (codeLines.length / nonEmptyLines.length > 0.2 || codeLines.length >= 2)) {
      const lang = language || 'javascript';
      return `\`\`\`${lang}\n${text}\n\`\`\``;
    }
    
    return text;
  };

  const handleSubmit = () => {
    if ((!content.trim() && !imagePreview) || disabled) return;
    onSubmit(content.trim(), imagePreview || undefined);
    setContent("");
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImagePreview(data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCodeFormat = () => {
    if (content.trim() && !content.includes('```')) {
      const detection = detectCodeContent(content);
      const formatted = autoFormatCode(content, detection.language);
      if (formatted !== content) {
        setContent(formatted);
      }
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="relative">
          <MentionInput
            placeholder={placeholder}
            value={content}
            onChange={setContent}
            className="min-h-[80px] resize-none text-sm pr-28"
          />
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mt-2 inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="hidden sm:flex h-7 w-7 p-0 rounded-full hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 shrink-0"
            >
              <Smile className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-7 w-7 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 shrink-0"
            >
              <Image className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCodeFormat}
              className="h-7 w-7 p-0 rounded-full hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 shrink-0"
            >
              <Code className="h-3 w-3" />
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Press Enter to submit, Shift+Enter for new line
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || disabled}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-full"
          >
            Reply
          </Button>
        </div>
      </div>

      {/* Emoji Picker Portal */}
      {showEmojiPicker && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] sm:bottom-24">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setContent(prev => prev + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
              width={280}
              height={350}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </>
      )}
    </>
  );
}