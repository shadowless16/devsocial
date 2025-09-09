// components/PostModal.tsx
"use client";

import React, { useState, useRef, FormEvent, useEffect } from "react";
import { X, ImageIcon, Code, Hash, Eye, EyeOff, Target, Search, Video, Upload, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MentionInput } from "@/components/ui/mention-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useToast } from "@/hooks/use-toast";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
}

const suggestedTags = [
  "#javascript",
  "#react",
  "#typescript",
  "#nextjs",
  "#tailwind",
  "#python",
  "#ai",
  "#webdev",
  "#backend",
  "#frontend",
  "#mobile",
  "#cybersecurity",
  "#devops",
  "#learning",
  "#career",
  "#tips",
];

const programmingLanguages = [
  {
    id: 'javascript',
    name: 'JavaScript',
    template: 'const greeting = "Hello, World!";\nconsole.log(greeting);',
    icon: '🟨'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    template: 'interface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "John",\n  age: 30\n};',
    icon: '🔷'
  },
  {
    id: 'python',
    name: 'Python',
    template: 'def hello_world():\n    print("Hello, World!")\n\nhello_world()',
    icon: '🐍'
  },
  {
    id: 'java',
    name: 'Java',
    template: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    icon: '☕'
  },
  {
    id: 'cpp',
    name: 'C++',
    template: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    icon: '⚡'
  },
  {
    id: 'go',
    name: 'Go',
    template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    icon: '🐹'
  },
  {
    id: 'rust',
    name: 'Rust',
    template: 'fn main() {\n    println!("Hello, World!");\n}',
    icon: '🦀'
  },
  {
    id: 'php',
    name: 'PHP',
    template: '<?php\necho "Hello, World!";\n?>',
    icon: '🐘'
  },
  {
    id: 'ruby',
    name: 'Ruby',
    template: 'puts "Hello, World!"',
    icon: '💎'
  },
  {
    id: 'swift',
    name: 'Swift',
    template: 'import Foundation\n\nprint("Hello, World!")',
    icon: '🍎'
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    template: 'fun main() {\n    println("Hello, World!")\n}',
    icon: '🎯'
  },
  {
    id: 'csharp',
    name: 'C#',
    template: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    icon: '🔵'
  },
  {
    id: 'html',
    name: 'HTML',
    template: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    icon: '🌐'
  },
  {
    id: 'css',
    name: 'CSS',
    template: '.hello-world {\n    color: #333;\n    font-size: 24px;\n    text-align: center;\n}',
    icon: '🎨'
  },
  {
    id: 'sql',
    name: 'SQL',
    template: 'SELECT * FROM users\nWHERE active = true\nORDER BY created_at DESC;',
    icon: '🗃️'
  }
];

const sampleChallenges = [
  {
    id: 1,
    title: "Build a Todo App",
    description: "Create a fully functional todo application with CRUD operations",
    xp: 100,
    difficulty: "Beginner",
    tags: ["javascript", "react"]
  },
  {
    id: 2,
    title: "Implement Binary Search",
    description: "Write an efficient binary search algorithm",
    xp: 150,
    difficulty: "Intermediate",
    tags: ["algorithms", "javascript"]
  },
  {
    id: 3,
    title: "Create a REST API",
    description: "Build a RESTful API with authentication and database integration",
    xp: 250,
    difficulty: "Advanced",
    tags: ["nodejs", "backend", "api"]
  },
  {
    id: 4,
    title: "CSS Animation Challenge",
    description: "Create smooth animations using pure CSS",
    xp: 80,
    difficulty: "Beginner",
    tags: ["css", "animation"]
  },
  {
    id: 5,
    title: "Database Optimization",
    description: "Optimize database queries for better performance",
    xp: 200,
    difficulty: "Advanced",
    tags: ["database", "sql", "performance"]
  }
];

export function PostModal({ isOpen, onClose, onSubmit }: PostModalProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [postType, setPostType] = useState<'normal' | 'code' | 'challenge'>('normal');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [showChallengeDropdown, setShowChallengeDropdown] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [selectedAspect, setSelectedAspect] = useState<number | undefined>(undefined);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Auto code detection with language detection
  const detectCodeContent = (text: string): { isCode: boolean; language?: string } => {
    const codePatterns = [
      { pattern: /```[\s\S]*?```/g, language: null }, // Already formatted
      { pattern: /function\s+\w+\s*\(/g, language: 'javascript' },
      { pattern: /const\s+\w+\s*=/g, language: 'javascript' },
      { pattern: /let\s+\w+\s*=/g, language: 'javascript' },
      { pattern: /var\s+\w+\s*=/g, language: 'javascript' },
      { pattern: /class\s+\w+/g, language: 'javascript' },
      { pattern: /import\s+.*from/g, language: 'javascript' },
      { pattern: /export\s+(default\s+)?/g, language: 'javascript' },
      { pattern: /def\s+\w+\s*\(/g, language: 'python' },
      { pattern: /print\s*\(/g, language: 'python' },
      { pattern: /if\s+__name__\s*==\s*['"]__main__['"]/g, language: 'python' },
      { pattern: /public\s+class\s+\w+/g, language: 'java' },
      { pattern: /System\.out\.println/g, language: 'java' },
      { pattern: /#include\s*<[^>]+>/g, language: 'cpp' },
      { pattern: /std::/g, language: 'cpp' },
      { pattern: /cout\s*<</g, language: 'cpp' },
      { pattern: /package\s+main/g, language: 'go' },
      { pattern: /fmt\./g, language: 'go' },
      { pattern: /fn\s+main\s*\(/g, language: 'rust' },
      { pattern: /println!/g, language: 'rust' },
      { pattern: /<\?php/g, language: 'php' },
      { pattern: /echo\s+/g, language: 'php' },
      { pattern: /<\w+[^>]*>/g, language: 'html' },
      { pattern: /\{\s*[\w-]+\s*:\s*[^}]+\}/g, language: 'css' },
      { pattern: /SELECT\s+.*FROM/gi, language: 'sql' },
      { pattern: /INSERT\s+INTO/gi, language: 'sql' },
      { pattern: /;\s*$/gm, language: 'javascript' }, // Generic semicolon
      { pattern: /\/\*[\s\S]*?\*\//g, language: null }, // Block comments
      { pattern: /\/\/.*$/gm, language: null }, // Line comments
    ];
    
    for (const { pattern, language } of codePatterns) {
      if (pattern.test(text)) {
        // Only include language when it's a non-null string
        if (language) return { isCode: true, language };
        return { isCode: true };
      }
    }

    return { isCode: false };
  };

  // Auto-format code with detected language
  const autoFormatCode = (text: string, detectedLanguage?: string | null): string => {
    // Don't format if already has code blocks
    if (text.includes('```')) return text;
    
    // Check if the entire content looks like code
    const lines = text.split('\n');
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && (
        /^[\s]*[{}();]/.test(trimmed) ||
        /[{}();]$/.test(trimmed) ||
        /^[\s]*(const|let|var|function|class|def|public|private|if|for|while|return)\s/.test(trimmed)
      );
    });
    
    // If more than 30% of non-empty lines look like code, format the whole thing
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    if (nonEmptyLines.length > 2 && codeLines.length / nonEmptyLines.length > 0.3) {
      const language = detectedLanguage || 'javascript';
      return `\`\`\`${language}\n${text}\n\`\`\``;
    }
    
    return text;
  };

  // Handle content change with auto code detection and formatting
  const handleContentChange = (newContent: string) => {
    // Auto-detect code and format if needed
    if (postType === 'normal' && newContent.trim().length > 20) {
      const detection = detectCodeContent(newContent);
      if (detection.isCode) {
        const formattedContent = autoFormatCode(newContent, detection.language);
        if (formattedContent !== newContent) {
          setContent(formattedContent);
          setPostType('code');
          // Add language tag if detected
          if (detection.language) {
            const languageTag = `#${detection.language}`;
            if (!tags.includes(languageTag) && tags.length < 5) {
              setTags(prev => [...prev, languageTag]);
            }
          }
          return;
        } else {
          setPostType('code');
        }
      }
    }
    
    setContent(newContent);
  };

  // Reusable crop state reset function
  const resetCropState = () => {
    setOriginalImageUrl(null);
    setOriginalFile(null);
    setSelectedAspect(undefined);
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
    setCompletedCrop(null);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
  ): Promise<File | null> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          resolve(file);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setOriginalImageUrl(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const aspectRatios = [
    { label: 'Free', value: undefined },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4/3 },
    { label: '16:9', value: 16/9 },
    { label: '9:16', value: 9/16 },
    { label: '3:4', value: 3/4 },
  ];



  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    if (fileArray.length > 0) {
      handleUploadBegin();
      try {
        const urls = await uploadMultipleToCloudinary(fileArray, 'devsocial', 'posts', (progress: number) => {
          console.log(`Upload progress: ${progress}%`);
        });
        handleMediaUploadComplete(urls.map(url => url.secure_url));
      } catch (error) {
        handleUploadError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop || !originalImageUrl) return;

    try {
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-image.jpg'
      );
      
      if (croppedFile) {
        resetCropState();
        await handleFilesUpload([croppedFile]);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "Failed to crop image",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // Prevent page refresh
    
    // Separate images and videos from mediaUrls
    const imageUrls = mediaUrls.filter(url => !url.endsWith('.mp4') && !url.endsWith('.webm') && !url.endsWith('.mov') && !url.endsWith('.avi'));
    const videoUrls = mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.endsWith('.avi'));
    
    const postData = {
      content,
      tags,
      imageUrl: imageUrl || null, // Include the manual image URL if provided
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      isAnonymous,
      postType,
      selectedChallenge,
    };
    onSubmit(postData);
    resetForm();
  };

  const resetForm = () => {
    setContent("");
    setTags([]);
    setNewTag("");
    setIsAnonymous(false);
    setImageUrl("");
    setMediaUrls([]);
    setPostType('normal');
    setSelectedChallenge(null);
    setShowChallengeDropdown(false);
    setShowLanguageSelector(false);
    setLanguageFilter('');
    setUploadError(null);
    setIsUploading(false);
    setIsAiSummarizing(false);
    resetCropState();
  };

  const handleUploadBegin = () => {
    setIsUploading(true);
    setUploadError(null);
    const timer = setTimeout(() => {
      if (isUploading) {
        setIsUploading(false);
        setUploadError('Upload may have completed but response was not received. Please refresh to see if your files were uploaded.');
      }
    }, 30000);
    return () => clearTimeout(timer);
  };

  const handleUploadError = (error: Error) => {
    setUploadError(error.message);
    setIsUploading(false);
  };

  const handleMediaUploadComplete = (newUrls: string[]) => {
    setMediaUrls(prev => [...prev, ...newUrls]);
    setIsUploading(false);
  };

  const handleMediaRemove = (indexToRemove: number) => {
    setMediaUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag.startsWith("#") ? tag : `#${tag}`]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      addTag(newTag.trim());
    }
  };

  const handleCodeSnippetClick = () => {
    setShowLanguageSelector(!showLanguageSelector);
  };

  const selectLanguage = (language: any) => {
    const codeTemplate = `\n\n\`\`\`${language.id}\n${language.template}\n\`\`\`\n\n`;
    setContent(prev => prev + codeTemplate);
    setPostType('code');
    setShowLanguageSelector(false);
    const languageTag = `#${language.id}`;
    if (!tags.includes(languageTag) && tags.length < 5) {
      setTags(prev => [...prev, languageTag]);
    }
  };

  const filteredLanguages = programmingLanguages.filter(lang => 
    lang.name.toLowerCase().includes(languageFilter.toLowerCase())
  );

  const handleChallengeClick = () => {
    setShowChallengeDropdown(!showChallengeDropdown);
  };

  const selectChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    setShowChallengeDropdown(false);
    setPostType('challenge');
    challenge.tags.forEach((tag: string) => {
      const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
      if (!tags.includes(formattedTag) && tags.length < 5) {
        setTags(prev => [...prev, formattedTag]);
      }
    });
  };

  const removeChallenge = () => {
    setSelectedChallenge(null);
    setPostType('normal');
  };

  const handleAiSummarize = async () => {
    if (!content.trim()) return;
    
    setIsAiSummarizing(true);
    try {
      const response = await fetch('/api/posts/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to summarize content');
      }
      
      if (data.success && data.data?.summary) {
        setContent(data.data.summary);
        toast({
          title: "Content summarized",
          description: "Your post has been condensed using AI.",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : "Unable to summarize content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiSummarizing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-background rounded-t-lg sm:rounded-lg w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto border border-border mb-16 sm:mb-0">
        <div className="sticky top-0 bg-background z-10 flex items-center justify-between p-3 sm:p-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Create Post</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-4 space-y-4 sm:space-y-4 pb-6 sm:pb-4">
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <MentionInput
              value={content}
              onChange={handleContentChange}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              className="min-h-[100px] sm:min-h-[120px] resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use Markdown for formatting. For code snippets, use triple backticks, e.g., ```javascript console.log("Hello"); ```
            </p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{content.length}/2000 characters</span>
              {postType === 'code' && (
                <span className="text-blue-600 flex items-center gap-1">
                  ✨ Code detected & formatted automatically
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="image"
                type="url"
                placeholder="Paste image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Media (Optional)</Label>
            <Tabs defaultValue="images" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="images">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="videos">
                  <Video className="w-4 h-4 mr-2" />
                  Videos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="images" className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">Upload up to 4 images (max 4MB each)</p>
                  <div className="relative">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={mediaUrls.length >= 4 || isUploading}
                    />
                    {originalImageUrl && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-sm text-muted-foreground">Aspect Ratio:</span>
                          {aspectRatios.map((ratio) => (
                            <Button
                              key={ratio.label}
                              type="button"
                              size="sm"
                              variant={selectedAspect === ratio.value ? "default" : "outline"}
                              onClick={() => setSelectedAspect(ratio.value)}
                              className={`text-xs ${selectedAspect === ratio.value ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            >
                              {ratio.label}
                            </Button>
                          ))}
                        </div>
                        <div className="relative bg-muted rounded-lg p-2 sm:p-4 max-h-[50vh] overflow-auto">
                          <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={selectedAspect}
                            className="max-w-full"
                          >
                            <img
                              ref={imgRef}
                              src={originalImageUrl}
                              alt="Crop preview"
                              onLoad={onImageLoad}
                              className="max-w-full h-auto"
                              style={{ maxHeight: '40vh' }}
                            />
                          </ReactCrop>
                        </div>
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button
                            type="button"
                            onClick={handleCropComplete}
                            disabled={!completedCrop || isUploading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isUploading ? 'Uploading...' : 'Crop & Upload'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetCropState}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              if (originalFile) {
                                resetCropState();
                                await handleFilesUpload([originalFile]);
                              }
                            }}
                            disabled={!originalFile || isUploading}
                          >
                            Skip Crop
                          </Button>
                        </div>
                      </div>
                    )}
                    {!originalImageUrl && (
                      <Button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={mediaUrls.length >= 4 || isUploading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload Images'}
                      </Button>
                    )}
                  </div>
                </div>
                
                {mediaUrls.filter(url => !url.endsWith('.mp4') && !url.endsWith('.webm')).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mediaUrls.filter(url => !url.endsWith('.mp4') && !url.endsWith('.webm')).map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={url} 
                          alt={`Upload ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                          onClick={() => handleMediaRemove(mediaUrls.indexOf(url))}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="videos" className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">Upload 1 video (max 128MB)</p>
                  <div className="relative">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => { 
                        const files = e.target.files; 
                        if (files) handleFilesUpload(files);
                      }}
                      disabled={mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.webm')).length >= 1 || isUploading}
                    />
                    <Button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.webm')).length >= 1 || isUploading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Video'}
                    </Button>
                  </div>
                </div>
                
                {mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.webm')).length > 0 && (
                  <div className="space-y-2">
                    {mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.webm')).map((url, index) => (
                      <div key={index} className="relative">
                        <video 
                          controls
                          className="w-full max-h-64 rounded-lg"
                        >
                          <source src={url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleMediaRemove(mediaUrls.indexOf(url))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {isUploading && (
              <div className="flex items-center justify-center py-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-primary">Uploading files...</span>
              </div>
            )}
            
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-3">
            <Label>Tags (up to 5)</Label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag (e.g., javascript, react)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(newTag.trim())}
                disabled={!newTag.trim() || tags.length >= 5}
              >
                <Hash className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.slice(0, 8).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-emerald-50 hover:border-emerald-300"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {selectedChallenge && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-foreground">{selectedChallenge.title}</h3>
                    <Badge variant="outline" className={`text-xs ${
                      selectedChallenge.difficulty === 'Beginner' ? 'bg-green-50 text-green-700' :
                      selectedChallenge.difficulty === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {selectedChallenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      {selectedChallenge.xp} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{selectedChallenge.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedChallenge.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeChallenge}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isAnonymous ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
              <div>
                <Label htmlFor="anonymous" className="font-medium text-foreground">
                  Post Anonymously
                </Label>
                <p className="text-sm text-muted-foreground">Your identity will be hidden from other users</p>
              </div>
            </div>
            <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-4 sm:pt-4 border-t border-border gap-4 sm:gap-0 sticky bottom-0 bg-background pb-4 sm:pb-0 sm:static">
            <div className="flex items-center space-x-1 sm:space-x-2 relative overflow-x-auto">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAiSummarize}
                disabled={!content.trim() || isAiSummarizing}
                className="text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isAiSummarizing ? 'Summarizing...' : 'AI Summarize'}</span>
                <span className="sm:hidden">{isAiSummarizing ? '...' : 'AI'}</span>
              </Button>
              
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCodeSnippetClick}
                  className={`text-xs sm:text-sm h-8 px-2 sm:px-3 ${postType === 'code' ? 'bg-blue-50 border-blue-300' : ''} ${showLanguageSelector ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <Code className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">✨ Code Snippet</span>
                  <span className="sm:hidden">Code</span>
                </Button>
                
                {showLanguageSelector && (
                  <div className="absolute top-full left-0 mt-2 w-[90vw] sm:w-96 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search programming languages..."
                          value={languageFilter}
                          onChange={(e) => setLanguageFilter(e.target.value)}
                          className="border-0 focus:ring-0 p-0 text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Choose a language to insert a code template:</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {filteredLanguages.map((language) => (
                          <div
                            key={language.id}
                            onClick={() => selectLanguage(language)}
                            className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer rounded-md transition-colors"
                          >
                            <span className="text-xl">{language.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{language.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {language.template.split('\n')[0].substring(0, 30)}...
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {filteredLanguages.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          No languages found matching "{languageFilter}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleChallengeClick}
                  className={`${selectedChallenge ? 'bg-blue-50 border-blue-300' : ''} ${showChallengeDropdown ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  🎯 Challenge
                </Button>
                
                {showChallengeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-[90vw] sm:w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-sm text-muted-foreground mb-2 px-2">Select a challenge to attach:</p>
                      {sampleChallenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          onClick={() => selectChallenge(challenge)}
                          className="p-3 hover:bg-muted/50 cursor-pointer rounded-md border-b border-border last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">{challenge.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className={`text-xs ${
                                  challenge.difficulty === 'Beginner' ? 'bg-green-50 text-green-700' :
                                  challenge.difficulty === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-red-50 text-red-700'
                                }`}>
                                  {challenge.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                  {challenge.xp} XP
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                disabled={!content.trim() || isUploading}
              >
                {isUploading ? "Uploading..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}