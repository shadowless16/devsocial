/**
 * Theme Validator Component
 * Use this component to test and validate theme consistency across your app
 * Only include this in development builds
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeValidator() {
  const [inputValue, setInputValue] = useState("")
  const [textareaValue, setTextareaValue] = useState("")
  const [switchValue, setSwitchValue] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle className="text-foreground">Theme Validator</CardTitle>
        <CardDescription className="text-muted-foreground">
          Test component to validate theme consistency across light and dark modes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Elements */}
        <div className="space-y-2">
          <Label className="text-foreground">Text Elements</Label>
          <div className="space-y-1">
            <p className="text-foreground">Primary text (foreground)</p>
            <p className="text-muted-foreground">Muted text (muted-foreground)</p>
            <p className="text-primary">Primary colored text</p>
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-4">
          <Label className="text-foreground">Form Elements</Label>
          
          <div className="space-y-2">
            <Label htmlFor="test-input" className="text-foreground">Input Field</Label>
            <Input
              id="test-input"
              placeholder="Type here to test input focus..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-textarea" className="text-foreground">Textarea</Label>
            <Textarea
              id="test-textarea"
              placeholder="Type here to test textarea focus..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Select Dropdown</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="test-switch"
              checked={switchValue}
              onCheckedChange={setSwitchValue}
            />
            <Label htmlFor="test-switch" className="text-foreground">Toggle Switch</Label>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Label className="text-foreground">Button Variants</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <Label className="text-foreground">Badges</Label>
          <div className="flex flex-wrap gap-2">
            <Badge>Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
            <Badge variant="destructive">Destructive Badge</Badge>
          </div>
        </div>

        {/* Background Elements */}
        <div className="space-y-2">
          <Label className="text-foreground">Background Elements</Label>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-foreground">Muted background with foreground text</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-card-foreground">Card background with card foreground text</p>
          </div>
        </div>

        {/* Focus Test */}
        <div className="space-y-2">
          <Label className="text-foreground">Focus Test</Label>
          <p className="text-muted-foreground text-sm">
            Tab through the form elements above to test focus states. 
            All focus rings should be mint green (primary color), not blue or black.
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={() => {
              if (typeof window === 'undefined') return
              const html = document.documentElement
              if (html.classList.contains('dark')) {
                html.classList.remove('dark')
                localStorage.setItem('theme', 'light')
              } else {
                html.classList.add('dark')
                localStorage.setItem('theme', 'dark')
              }
            }}
            variant="outline"
          >
            Toggle Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}