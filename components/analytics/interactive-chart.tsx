"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InteractiveChartProps {
  title: string
  description?: string
  children: React.ReactNode
  data?: any[]
  onDataPointClick?: (data: any) => void
  showZoomControls?: boolean
  showExpandButton?: boolean
}

export function InteractiveChart({
  title,
  description,
  children,
  data,
  onDataPointClick,
  showZoomControls = true,
  showExpandButton = true,
}: InteractiveChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)

  const handleDataPointClick = (dataPoint: any) => {
    setSelectedDataPoint(dataPoint)
    onDataPointClick?.(dataPoint)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-1">
            {showZoomControls && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            {showExpandButton && (
              <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                  </DialogHeader>
                  <div className="h-[60vh]">{children}</div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div onClick={() => data && handleDataPointClick(data)}>{children}</div>
          {selectedDataPoint && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-2">Selected Data Point:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedDataPoint).map(([key, value]) => (
                  <Badge key={key} variant="outline">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
