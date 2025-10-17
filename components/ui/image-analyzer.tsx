"use client";

import { useState } from "react";
import { ScanText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageAnalyzerProps {
  imageUrl: string;
  onAnalysis: (text: string) => void;
}

export function ImageAnalyzer({ imageUrl, onAnalysis }: ImageAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeImage = async () => {
    setAnalyzing(true);
    
    try {
      // Fetch image as blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, "image.jpg");
      formData.append("action", "analyze");

      const apiResponse = await fetch("/api/ai/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await apiResponse.json();

      if (data.success && data.data?.analysis) {
        onAnalysis(data.data.analysis);
        toast({
          title: "Image described!",
          description: `${data.data.remainingUsage} analyses remaining this month`,
        });
      } else {
        throw new Error(data.message || "Analysis failed");
      }
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={analyzeImage}
      disabled={analyzing}
      className="absolute bottom-2 left-2 h-7 text-xs gap-1"
    >
      {analyzing ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <ScanText className="h-3 w-3" />
          Describe
        </>
      )}
    </Button>
  );
}
