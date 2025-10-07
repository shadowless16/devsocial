// components/PostModal.tsx
"use client";

import React, { useState, useRef, FormEvent, useEffect } from "react";
import { X, ImageIcon, Hash, Eye, EyeOff, Video, Upload, Trash2, BarChart3 } from "lucide-react";
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
import { useMissionTracker } from "@/hooks/use-mission-tracker";
import { PollCreator } from "@/components/poll/poll-creator";

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



export function PostModal({ isOpen, onClose, onSubmit }: PostModalProps) {
  const { toast } = useToast();
  const { trackPost, trackCodePost, trackHashtagUsage } = useMissionTracker();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [postType, setPostType] = useState<'normal' | 'code' | 'challenge' | 'poll'>('normal');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollData, setPollData] = useState<any>(null);

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
        1.0
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
      imageUrl: imageUrl || null,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      isAnonymous,
      postType,
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
    
    // Track mission progress
    if (postType === 'code') {
      trackCodePost();
    } else {
      trackPost();
    }
    
    // Track hashtag usage
    tags.forEach(tag => {
      if (tag.startsWith('#')) {
        trackHashtagUsage(tag.substring(1));
      }
    });
    
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
    setUploadError(null);
    setIsUploading(false);
    setShowPollCreator(false);
    setPollData(null);
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
          {!showPollCreator && (
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={postType === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPostType('normal');
                  setShowPollCreator(false);
                  setPollData(null);
                }}
                className="flex-1"
              >
                Post
              </Button>
              <Button
                type="button"
                variant={postType === 'poll' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPostType('poll');
                  setShowPollCreator(true);
                }}
                className="flex-1"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Poll
              </Button>
            </div>
          )}

          {showPollCreator ? (
            <PollCreator
              onPollCreate={(poll) => {
                setPollData(poll);
                setShowPollCreator(false);
              }}
              onCancel={() => {
                setShowPollCreator(false);
                setPostType('normal');
              }}
            />
          ) : pollData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Poll Preview</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPollData(null);
                    setShowPollCreator(true);
                  }}
                >
                  Edit Poll
                </Button>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="font-semibold">{pollData.question}</p>
                {pollData.options.map((opt: any) => (
                  <div key={opt.id} className="p-2 bg-background rounded border">
                    {opt.text}
                  </div>
                ))}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {pollData.settings.multipleChoice && (
                    <span>Multiple choice (max {pollData.settings.maxChoices})</span>
                  )}
                  {pollData.settings.duration && (
                    <span>• Duration: {Math.floor(pollData.settings.duration / 3600000)}h</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
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
            <div className="flex justify-between text-xs">
              <span className={`${
                content.length > 1800 ? 'text-red-500 font-medium' : 
                content.length > 1500 ? 'text-yellow-500' : 
                'text-muted-foreground'
              }`}>
                {content.length}/2000 characters
                {content.length > 2000 && (
                  <span className="ml-2 text-red-500 font-medium">
                    ⚠️ Too long! Please shorten your post.
                  </span>
                )}
              </span>
              {postType === 'code' && (
                <span className="text-blue-600 flex items-center gap-1">
                  ✨ Code detected & formatted automatically
                </span>
              )}
            </div>
          </div>
          )}

          {!showPollCreator && (
          <>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mediaUrls.filter(url => !url.endsWith('.mp4') && !url.endsWith('.webm')).map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Upload ${index + 1}`} 
                          className="w-full h-auto rounded-lg"
                          style={{ maxHeight: '40vh' }}
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
                          className="w-full h-auto rounded-lg"
                          style={{ maxHeight: '50vh' }}
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
          </>
          )}

          <div className="flex justify-end pt-4 border-t border-border gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-sm h-9 px-4">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4"
              disabled={(postType !== 'poll' && !content.trim()) || isUploading || content.length > 2000 || (postType === 'poll' && !pollData)}
            >
              {isUploading ? "Uploading..." : content.length > 2000 ? "Too Long" : postType === 'poll' && !pollData ? "Create Poll First" : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
