"use client";

import { Sparkles, Award, MessageCircle, HelpCircle, Code, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QualityBadgeProps {
  category: string;
  score?: number;
  xpBonus?: number;
}

export function QualityBadge({ category, score, xpBonus }: QualityBadgeProps) {
  const badges = {
    helpful: {
      icon: Lightbulb,
      label: "Helpful",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      description: "This post provides helpful information"
    },
    tutorial: {
      icon: Code,
      label: "Tutorial",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      description: "Excellent tutorial or guide"
    },
    discussion: {
      icon: MessageCircle,
      label: "Discussion",
      color: "bg-green-100 text-green-700 border-green-200",
      description: "Great discussion starter"
    },
    question: {
      icon: HelpCircle,
      label: "Question",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      description: "Well-formed question"
    },
    showcase: {
      icon: Award,
      label: "Showcase",
      color: "bg-pink-100 text-pink-700 border-pink-200",
      description: "Project showcase"
    }
  };

  const badgeInfo = badges[category as keyof typeof badges];
  if (!badgeInfo || category === 'low-quality' || category === 'spam') return null;

  const Icon = badgeInfo.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-xs gap-1 ${badgeInfo.color}`}>
            <Icon className="w-3 h-3" />
            {badgeInfo.label}
            {xpBonus && xpBonus > 0 && (
              <span className="ml-1">+{xpBonus} XP</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{badgeInfo.description}</p>
          {score && <p className="text-xs text-muted-foreground mt-1">Quality: {score}/10</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
