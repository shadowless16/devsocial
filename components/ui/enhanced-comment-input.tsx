"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MentionInput } from "@/components/ui/mention-input";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Smile, Code } from "lucide-react";

interface EnhancedCommentInputProps {
  placeholder?: string;
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export function EnhancedCommentInput({ 
  placeholder = "Write a reply...", 
  onSubmit, 
  disabled = false 
}: EnhancedCommentInputProps) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
    if (!content.trim() || disabled) return;
    onSubmit(content.trim());
    setContent("");
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
    <div className="space-y-2">
      <div className="relative">
        <MentionInput
          placeholder={placeholder}
          value={content}
          onChange={setContent}
          className="min-h-[80px] resize-none text-sm pr-20"
        />
        
        {/* Action buttons */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-7 w-7 p-0 rounded-full hover:bg-yellow-50 hover:text-yellow-600"
            >
              <Smile className="h-3 w-3" />
            </Button>
            {showEmojiPicker && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowEmojiPicker(false)}
                />
                <div className="absolute bottom-8 right-0 z-50">
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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCodeFormat}
            className="h-7 w-7 p-0 rounded-full hover:bg-orange-50 hover:text-orange-600"
          >
            <Code className="h-3 w-3" />
          </Button>
        </div>
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
  );
}