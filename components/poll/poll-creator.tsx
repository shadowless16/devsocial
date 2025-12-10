"use client"

import { useState } from "react"
import { Plus, X, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface PollOption {
  id: string
  text: string
}

interface PollSettings {
  multipleChoice: boolean
  maxChoices: number
  duration?: number
  showResults: "always" | "afterVote" | "afterEnd"
  allowAddOptions: boolean
}

interface PollData {
  question: string
  options: PollOption[]
  settings: PollSettings
}

interface PollCreatorProps {
  onPollCreate: (poll: PollData) => void
  onCancel: () => void
}

export function PollCreator({ onPollCreate, onCancel }: PollCreatorProps) {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ])
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<PollSettings>({
    multipleChoice: false,
    maxChoices: 1,
    showResults: "afterVote",
    allowAddOptions: false,
  })

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: Date.now().toString(), text: "" }])
    }
  }

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id))
    }
  }

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)))
  }

  const handleCreate = () => {
    const validOptions = options.filter((opt) => opt.text.trim())
    if (question.trim() && validOptions.length >= 2) {
      onPollCreate({
        question: question.trim(),
        options: validOptions,
        settings,
      })
    }
  }

  const isValid = question.trim() && options.filter((opt) => opt.text.trim()).length >= 2

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Create Poll</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="question">Poll Question</Label>
          <Input
            id="question"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">{question.length}/200</p>
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                maxLength={100}
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <Button variant="outline" size="sm" onClick={addOption} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          )}
        </div>

        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full justify-start"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            {showSettings ? "Hide" : "Show"} Settings
          </Button>

          {showSettings && (
            <div className="mt-3 space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="multiple">Multiple Choice</Label>
                <Switch
                  id="multiple"
                  checked={settings.multipleChoice}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, multipleChoice: checked, maxChoices: checked ? 2 : 1 })
                  }
                />
              </div>

              {settings.multipleChoice && (
                <div>
                  <Label htmlFor="maxChoices">Max Choices</Label>
                  <Select
                    value={settings.maxChoices.toString()}
                    onValueChange={(value) => setSettings({ ...settings, maxChoices: parseInt(value) })}
                  >
                    <SelectTrigger id="maxChoices" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} options
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="duration">Poll Duration</Label>
                <Select
                  value={settings.duration?.toString() || "none"}
                  onValueChange={(value) =>
                    setSettings({ ...settings, duration: value === "none" ? undefined : parseInt(value) })
                  }
                >
                  <SelectTrigger id="duration" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No limit</SelectItem>
                    <SelectItem value="3600000">1 hour</SelectItem>
                    <SelectItem value="21600000">6 hours</SelectItem>
                    <SelectItem value="86400000">1 day</SelectItem>
                    <SelectItem value="259200000">3 days</SelectItem>
                    <SelectItem value="604800000">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="showResults">Show Results</Label>
                <Select
                  value={settings.showResults}
                  onValueChange={(value: string) => setSettings({ ...settings, showResults: value as "always" | "afterVote" | "afterEnd" })}
                >
                  <SelectTrigger id="showResults" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always visible</SelectItem>
                    <SelectItem value="afterVote">After voting</SelectItem>
                    <SelectItem value="afterEnd">After poll ends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowAdd">Allow users to add options</Label>
                <Switch
                  id="allowAdd"
                  checked={settings.allowAddOptions}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowAddOptions: checked })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!isValid} className="flex-1">
          Create Poll
        </Button>
      </div>
    </Card>
  )
}
