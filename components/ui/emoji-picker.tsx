"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojiCategories = {
  "Smileys": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐"
  ],
  "Tech": [
    "💻", "⌨️", "🖥️", "🖨️", "🖱️", "💾", "💿", "📀", "🔌", "🔋", "📱", "📲", "☎️", "📞", "📟", "📠", "📡", "🛰️", "💡", "🔦", "🔍", "🔎", "🔬", "🔭", "📊", "📈", "📉", "💹", "🗂️", "📁", "📂", "🗃️", "📋", "📌", "📍", "📎", "🖇️", "📏", "📐", "✂️", "🖊️", "🖋️", "✒️", "🖌️", "🖍️", "📝", "✏️", "🔒", "🔓", "🔏", "🔐", "🔑", "🗝️", "🔨", "⚙️", "🔧", "🔩", "⚡", "🚀", "🛸", "🤖", "👾", "🕹️", "🎮"
  ],
  "Animals": [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🕸", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊"
  ],
  "Food": [
    "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪"
  ],
  "Activities": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸", "🥌", "🎿", "⛷", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️", "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖", "🏵", "🎗", "🎫", "🎟", "🎪", "🤹", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🥁", "🪘", "🎹", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟", "🎯", "🎳", "🎮", "🎰", "🧩"
  ],
  "Travel": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍", "🛵", "🚲", "🛴", "🛹", "🛼", "🚁", "🛸", "✈️", "🛩", "🛫", "🛬", "🪂", "💺", "🚀", "🛰", "🚉", "🚊", "🚝", "🚞", "🚋", "🚃", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚟", "🚠", "🚡", "🛎", "🧳", "⌛", "⏳", "⌚", "⏰", "⏱", "⏲", "🕰"
  ]
};

const emojiNames: { [key: string]: string[] } = {
  "😀": ["grinning", "happy", "smile", "face"],
  "😂": ["joy", "laugh", "funny", "tears"],
  "❤️": ["heart", "love", "red"],
  "💻": ["computer", "laptop", "code", "programming"],
  "🚀": ["rocket", "launch", "space", "fast"],
  "🔥": ["fire", "hot", "lit", "flame"],
  "💡": ["idea", "light", "bulb", "think"],
  "⚡": ["lightning", "fast", "power", "electric"],
  "🤖": ["robot", "ai", "bot", "artificial"],
  "💾": ["disk", "save", "storage", "floppy"],
  "⌨️": ["keyboard", "type", "input", "keys"],
  "🖥️": ["monitor", "screen", "display", "desktop"],
  "📱": ["phone", "mobile", "cell", "smartphone"],
  "🐶": ["dog", "puppy", "pet", "animal"],
  "🐱": ["cat", "kitten", "pet", "feline"],
  "🍎": ["apple", "fruit", "red", "healthy"],
  "🍕": ["pizza", "food", "italian", "slice"],
  "⚽": ["soccer", "football", "ball", "sport"],
  "🚗": ["car", "vehicle", "drive", "auto"],
  "🎵": ["music", "note", "song", "melody"],
  "🎮": ["game", "controller", "play", "gaming"],
  "🏆": ["trophy", "winner", "champion", "award"],
  "✈️": ["airplane", "plane", "flight", "travel"],
  "🏠": ["house", "home", "building", "residence"]
};

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("Smileys");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmojis = searchTerm
    ? Object.values(emojiCategories).flat().filter(emoji => {
        const names = emojiNames[emoji] || [];
        const searchLower = searchTerm.toLowerCase();
        return names.some(name => name.toLowerCase().includes(searchLower)) || 
               emoji.includes(searchTerm);
      })
    : emojiCategories[selectedCategory as keyof typeof emojiCategories] || [];

  return (
    <div className="emoji-picker absolute bottom-12 left-0 w-80 max-w-[95vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[60]">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search emojis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
      </div>

      {!searchTerm && (
        <div className="flex overflow-x-auto p-2 border-b border-gray-200 dark:border-gray-700">
          {Object.keys(emojiCategories).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              className="whitespace-nowrap text-xs px-3 py-1 h-8 mx-1"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {(filteredEmojis || []).slice(0, 64).map((emoji, index) => {
            const names = emojiNames[emoji] || [];
            const tooltip = names.length > 0 ? names[0] : emoji;
            
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={() => {
                  onEmojiSelect(emoji);
                  onClose();
                }}
                title={tooltip}
              >
                {emoji}
              </Button>
            );
          })}
        </div>
        {filteredEmojis && filteredEmojis.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
}