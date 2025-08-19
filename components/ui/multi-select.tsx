import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  allowCustom?: boolean
  maxItems?: number
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Type to search or add custom...",
  allowCustom = false,
  maxItems
}: MultiSelectProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)

  const filteredOptions = options.filter(
    option => 
      !selected.includes(option) && 
      option.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleAddItem = (item: string) => {
    if (!selected.includes(item) && (!maxItems || selected.length < maxItems)) {
      onSelectionChange([...selected, item])
      setInputValue("")
      setIsOpen(false)
    }
  }

  const handleRemoveItem = (item: string) => {
    onSelectionChange(selected.filter(i => i !== item))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      if (allowCustom && !options.includes(inputValue.trim())) {
        handleAddItem(inputValue.trim())
      } else if (filteredOptions.length > 0) {
        handleAddItem(filteredOptions[0])
      }
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(item => (
          <Badge key={item} className="gap-1 bg-emerald-100 text-emerald-700">
            {item}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-emerald-900" 
              onClick={() => handleRemoveItem(item)} 
            />
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={maxItems ? selected.length >= maxItems : false}
        />
        
        {isOpen && (inputValue || filteredOptions.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.slice(0, 10).map(option => (
              <button
                key={option}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                onClick={() => handleAddItem(option)}
              >
                {option}
              </button>
            ))}
            
            {allowCustom && inputValue.trim() && !options.includes(inputValue.trim()) && (
              <button
                className="w-full px-3 py-2 text-left hover:bg-emerald-50 focus:bg-emerald-50 border-t text-emerald-600"
                onClick={() => handleAddItem(inputValue.trim())}
              >
                Add "{inputValue.trim()}"
              </button>
            )}
            
            {filteredOptions.length === 0 && !allowCustom && (
              <div className="px-3 py-2 text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}