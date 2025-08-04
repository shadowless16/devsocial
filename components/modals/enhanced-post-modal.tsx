"use client";

import type React from "react";
import { useState } from "react";
import { X, ImageIcon, Code, Hash, Eye, EyeOff, Target, Search, Video, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@/utils/uploadthing";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Programming languages with sample code templates
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
];

export function EnhancedPostModal({ isOpen, onClose, onSubmit }: PostModalProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<{ images: string[], videos: string[] }>({ images: [], videos: [] });
  const [postType, setPostType] = useState<'normal' | 'code' | 'challenge'>('normal');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [showChallengeDropdown, setShowChallengeDropdown] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      content,
      tags,
      isAnonymous,
      imageUrls: mediaUrls.images,
      videoUrls: mediaUrls.videos,
      postType,
      challenge: selectedChallenge
    });
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setContent("");
    setTags([]);
    setNewTag("");
    setIsAnonymous(false);
    setMediaUrls({ images: [], videos: [] });
    setPostType('normal');
    setSelectedChallenge(null);
    setShowChallengeDropdown(false);
    setShowLanguageSelector(false);
    setLanguageFilter('');
    setUploadError(null);
  };

  const handleImageUploadComplete = (res: any) => {
    if (res && res[0]) {
      setMediaUrls(prev => ({
        ...prev,
        images: [...prev.images, (res[0] as any).url ?? (res[0] as any).fileUrl]
      }));
      setUploadError(null);
    }
    setIsUploading(false);
  };

  const handleVideoUploadComplete = (res: any) => {
    if (res && res[0]) {
      setMediaUrls(prev => ({
        ...prev,
        videos: [...prev.videos, (res[0] as any).url ?? (res[0] as any).fileUrl]
      }));
      setUploadError(null);
    }
    setIsUploading(false);
  };

  const removeMedia = (type: 'images' | 'videos', index: number) => {
    setMediaUrls(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag.startsWith("#") ? tag : `#${tag}`]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      addTag(newTag.trim());
    }
  };

  const selectLanguage = (language: any) => {
    const codeTemplate = `\n\n\`\`\`${language.id}\n${language.template}\n\`\`\`\n\n`;
    setContent(prev => prev + codeTemplate);
    setPostType('code');
    setShowLanguageSelector(false);
    // Auto-add language tag
    const languageTag = `#${language.id}`;
    if (!tags.includes(languageTag) && tags.length < 5) {
      setTags(prev => [...prev, languageTag]);
    }
  };

  const filteredLanguages = programmingLanguages.filter(lang => 
    lang.name.toLowerCase().includes(languageFilter.toLowerCase())
  );

  const selectChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    setShowChallengeDropdown(false);
    setPostType('challenge');
    // Auto-add relevant tags
    challenge.tags.forEach((tag: string) => {
      const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
      if (!tags.includes(formattedTag) && tags.length < 5) {
        setTags(prev => [...prev, formattedTag]);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use Markdown for formatting. For code snippets, use triple backticks.
            </p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{content.length}/2000 characters</span>
            </div>
          </div>

          {/* Media Upload Section */}
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Upload up to 4 images (max 4MB each)</p>
                  <UploadButton<OurFileRouter>
                    endpoint="imageUploader"
                    onUploadBegin={() => {
                      setIsUploading(true);
                      setUploadError(null);
                    }}
                    onClientUploadComplete={handleImageUploadComplete}
                    onUploadError={(error: Error) => {
                      setUploadError(error.message);
                      setIsUploading(false);
                    }}
                    disabled={mediaUrls.images.length >= 4}
                    className="ut-button:bg-emerald-600 ut-button:hover:bg-emerald-700 ut-button:text-white ut-button:text-sm"
                    content={{
                      button({ ready }) {
                        if (ready) return <div><Upload className="w-4 h-4 mr-2 inline" />Upload Images</div>;
                        return "Getting ready...";
                      },
                      allowedContent({ ready, fileTypes, isUploading }) {
                        if (!ready) return "Checking what you allow";
                        if (isUploading) return "Uploading...";
                        return "";
                      },
                    }}
                  />
                </div>
                
                {mediaUrls.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaUrls.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Upload ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMedia('images', index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="videos" className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Upload 1 video (max 128MB)</p>
                  <UploadButton<OurFileRouter>
                    endpoint="videoUploader"
                    onUploadBegin={() => {
                      setIsUploading(true);
                      setUploadError(null);
                    }}
                    onClientUploadComplete={handleVideoUploadComplete}
                    onUploadError={(error: Error) => {
                      setUploadError(error.message);
                      setIsUploading(false);
                    }}
                    disabled={mediaUrls.videos.length >= 1}
                    className="ut-button:bg-emerald-600 ut-button:hover:bg-emerald-700 ut-button:text-white ut-button:text-sm"
                    content={{
                      button({ ready }) {
                        if (ready) return <div><Upload className="w-4 h-4 mr-2 inline" />Upload Video</div>;
                        return "Getting ready...";
                      },
                      allowedContent({ ready, fileTypes, isUploading }) {
                        if (!ready) return "Checking what you allow";
                        if (isUploading) return "Uploading...";
                        return "";
                      },
                    }}
                  />
                </div>
                
                {mediaUrls.videos.length > 0 && (
                  <div className="space-y-2">
                    {mediaUrls.videos.map((url, index) => (
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
                          onClick={() => removeMedia('videos', index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tags Section */}
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
              <p className="text-sm text-gray-600">Suggested tags:</p>
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

          {/* Selected Challenge Display */}
          {selectedChallenge && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">{selectedChallenge.title}</h3>
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
                  <p className="text-sm text-blue-700 mb-2">{selectedChallenge.description}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedChallenge(null);
                    setPostType('normal');
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isAnonymous ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              <div>
                <Label htmlFor="anonymous" className="font-medium">
                  Post Anonymously
                </Label>
                <p className="text-sm text-gray-600">Your identity will be hidden from other users</p>
              </div>
            </div>
            <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className={postType === 'code' ? 'bg-blue-50 border-blue-300' : ''}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code Snippet
                </Button>
                
                {showLanguageSelector && (
                  <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search programming languages..."
                          value={languageFilter}
                          onChange={(e) => setLanguageFilter(e.target.value)}
                          className="border-0 focus:ring-0 p-0 text-sm"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      <div className="grid grid-cols-2 gap-1">
                        {filteredLanguages.map((language) => (
                          <div
                            key={language.id}
                            onClick={() => selectLanguage(language)}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                          >
                            <span className="text-xl">{language.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{language.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowChallengeDropdown(!showChallengeDropdown)}
                  className={selectedChallenge ? 'bg-blue-50 border-blue-300' : ''}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Challenge
                </Button>
                
                {showChallengeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-sm text-gray-600 mb-2 px-2">Select a challenge to attach:</p>
                      {sampleChallenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          onClick={() => selectChallenge(challenge)}
                          className="p-3 hover:bg-gray-50 cursor-pointer rounded-md border-b border-gray-100 last:border-b-0"
                        >
                          <h4 className="font-medium text-sm text-gray-900">{challenge.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{challenge.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
