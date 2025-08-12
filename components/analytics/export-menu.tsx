"use client"

import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ExportMenuProps {
  data?: any
  filename?: string
}

export function ExportMenu({ data, filename = "analytics-report" }: ExportMenuProps) {
  const { toast } = useToast()

  const handleExportCSV = () => {
    // Mock CSV export functionality
    toast({
      title: "Export Started",
      description: `${filename}.csv is being prepared for download.`,
    })

    // In a real implementation, you would:
    // 1. Convert data to CSV format
    // 2. Create blob and download link
    // 3. Trigger download
  }

  const handleExportPDF = () => {
    // Mock PDF export functionality
    toast({
      title: "Export Started",
      description: `${filename}.pdf is being prepared for download.`,
    })

    // In a real implementation, you would:
    // 1. Generate PDF report
    // 2. Create blob and download link
    // 3. Trigger download
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
