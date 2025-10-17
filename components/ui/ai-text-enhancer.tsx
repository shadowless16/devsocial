"use client";

import { useState } from "react";
import { Sparkles, Wand2, Hash, Smile, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface AITextEnhancerProps {
  content: string;
  onEnhance: (newContent: string) => void;
}

export function AITextEnhancer({ content, onEnhance }: AITextEnhancerProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const enhanceText = async (action: string) => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Write something first before enhancing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/ai/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, action }),
      });

      const data = await response.json();

      if (data.success && data.data?.enhanced) {
        onEnhance(data.data.enhanced);
        toast({
          title: "Enhanced!",
          description: `${data.data.remainingUsage} enhancements remaining`,
        });
      } else {
        throw new Error(data.message || "Enhancement failed");
      }
    } catch (error: any) {
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to enhance text",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          className="h-9 w-9 p-0 rounded-full hover:bg-purple-50 hover:text-purple-600"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => enhanceText("professional")}>
          <Briefcase className="w-4 h-4 mr-2" />
          Make Professional
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => enhanceText("funny")}>
          <Smile className="w-4 h-4 mr-2" />
          Make Funny
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => enhanceText("casual")}>
          <Wand2 className="w-4 h-4 mr-2" />
          Make Casual
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => enhanceText("hashtags")}>
          <Hash className="w-4 h-4 mr-2" />
          Suggest Hashtags
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
