"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Users, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDataMode } from "@/contexts/data-mode-context"
import { useState } from "react"

export function DataModeToggle() {
  const { dataMode, setDataMode } = useDataMode()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteGenerated = async () => {
    if (!confirm('This will delete ALL generated users and their posts. Are you sure?')) {
      return
    }
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/users/manage-generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_generated' })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        // Switch to real mode since generated users are deleted
        setDataMode('real')
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error deleting users:', errorMessage)
      alert('Failed to delete generated users')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={dataMode} onValueChange={setDataMode}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="real">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Real Users
            </div>
          </SelectItem>
          <SelectItem value="generated">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Generated
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      {dataMode === 'generated' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteGenerated}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700"
          title="Delete all generated users"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}