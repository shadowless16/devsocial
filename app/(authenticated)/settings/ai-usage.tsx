// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Sparkles, Mic, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AIUsageData {
  summaries: { used: number; limit: number; remaining: number };
  transcriptions: { used: number; limit: number; remaining: number };
  imageAnalysis: { used: number; limit: number; remaining: number };
  isPremium: boolean;
}

export function AIUsageSettings() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<AIUsageData | null>(null);

  const fetchUsage = async () => {
    try {
      const [summaryRes, transcriptionRes, imageRes] = await Promise.all([
        fetch('/api/posts/summarize/usage'),
        fetch('/api/ai/transcribe/usage'),
        fetch('/api/ai/analyze-image/usage')
      ]);

      const summaryData = await summaryRes.json();
      const transcriptionData = await transcriptionRes.json();
      const imageData = await imageRes.json();

      setUsage({
        summaries: summaryData.success ? summaryData.data : { used: 0, limit: 5, remaining: 5 },
        transcriptions: transcriptionData.success ? transcriptionData.data : { used: 0, limit: 10, remaining: 10 },
        imageAnalysis: imageData.success ? imageData.data : { used: 0, limit: 10, remaining: 10 },
        isPremium: summaryData.data?.isPremium || false
      });
    } catch (error: unknown) {
      console.error('Failed to fetch AI usage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load AI usage data
      </div>
    );
  }

  const UsageItem = ({ 
    icon: Icon, 
    title, 
    used, 
    limit, 
    color 
  }: { 
    icon: unknown; 
    title: string; 
    used: number; 
    limit: number; 
    color: string;
  }) => {
    const percentage = (used / limit) * 100;
    const isUnlimited = limit >= 999999;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <span className="text-sm text-gray-600">
            {isUnlimited ? '∞ Unlimited' : `${used}/${limit}`}
          </span>
        </div>
        {!isUnlimited && (
          <Progress value={percentage} className="h-2" />
        )}
        <p className="text-xs text-gray-500">
          {isUnlimited 
            ? 'You have unlimited access' 
            : `${limit - used} remaining this month`}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Features Usage</h3>
          <p className="text-sm text-gray-600">Track your monthly AI feature usage</p>
        </div>
        {usage.isPremium && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            Premium
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        <UsageItem
          icon={FileText}
          title="Text Summarization"
          used={usage.summaries.used}
          limit={usage.summaries.limit}
          color="text-blue-600"
        />

        <UsageItem
          icon={Mic}
          title="Voice Transcription"
          used={usage.transcriptions.used}
          limit={usage.transcriptions.limit}
          color="text-red-600"
        />

        <UsageItem
          icon={ImageIcon}
          title="Image Analysis"
          used={usage.imageAnalysis.used}
          limit={usage.imageAnalysis.limit}
          color="text-green-600"
        />
      </div>

      {!usage.isPremium && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900">Upgrade to Premium</h4>
              <p className="text-sm text-purple-700 mt-1">
                Get 100 uses per month for each AI feature
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        Usage resets on the 1st of each month
      </div>
    </div>
  );
}
