# AI Features Guide - DevSocial

## 🎯 Overview
DevSocial now uses **Google Gemini 2.5 Flash** for all AI features, providing text, audio, and image processing capabilities.

## ✨ Available Features

### 1. Text Summarization
**Endpoint**: `/api/posts/summarize`
**Purpose**: Create concise summaries of posts (under 100 characters)

```typescript
const response = await fetch('/api/posts/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: postText })
});

const { summary, remainingUsage } = await response.json();
```

### 2. Audio Transcription 🎤
**Endpoint**: `/api/ai/transcribe`
**Purpose**: Convert voice notes to text
**Max Size**: 10MB
**Formats**: MP3, WAV, M4A, OGG, WEBM

```typescript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('/api/ai/transcribe', {
  method: 'POST',
  body: formData
});

const { transcription, remainingUsage } = await response.json();
```

### 3. Image Analysis 🖼️
**Endpoint**: `/api/ai/analyze-image`
**Purpose**: OCR + image description
**Max Size**: 5MB
**Formats**: JPG, PNG, WEBP, GIF

```typescript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('action', 'analyze'); // or 'describe'

const response = await fetch('/api/ai/analyze-image', {
  method: 'POST',
  body: formData
});

const { analysis, remainingUsage } = await response.json();
```

## 📊 Usage Limits

| User Type | Summarization | Transcription | Image Analysis |
|-----------|--------------|---------------|----------------|
| Free      | 5/month      | 10/month      | 10/month       |
| Premium   | 100/month    | 100/month     | 100/month      |
| AkDavid   | ∞ Unlimited  | ∞ Unlimited   | ∞ Unlimited    |

## 🎨 UI Integration Ideas

### Voice Note Button (Post Creation)
```tsx
import { Mic } from 'lucide-react';

<Button onClick={startRecording}>
  <Mic className="w-4 h-4" />
  Voice Note
</Button>
```

### Image OCR Button (Image Upload)
```tsx
import { ScanText } from 'lucide-react';

<Button onClick={analyzeImage}>
  <ScanText className="w-4 h-4" />
  Extract Text
</Button>
```

### Usage Display (Settings)
```tsx
<div className="space-y-2">
  <div>Summaries: {used}/{limit}</div>
  <div>Transcriptions: {used}/{limit}</div>
  <div>Image Analysis: {used}/{limit}</div>
</div>
```

## 🔧 Implementation Examples

### Complete Voice Note Component
```tsx
'use client';

import { useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VoiceNoteRecorder({ onTranscription }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData
      });

      const { transcription } = await response.json();
      onTranscription(transcription);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  return (
    <Button onClick={recording ? stopRecording : startRecording}>
      {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      {recording ? 'Stop' : 'Record'}
    </Button>
  );
}
```

### Image OCR Component
```tsx
'use client';

import { useState } from 'react';
import { ScanText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImageOCR({ imageFile, onExtractedText }) {
  const [loading, setLoading] = useState(false);

  const analyzeImage = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('action', 'analyze');

    const response = await fetch('/api/ai/analyze-image', {
      method: 'POST',
      body: formData
    });

    const { analysis } = await response.json();
    onExtractedText(analysis);
    setLoading(false);
  };

  return (
    <Button onClick={analyzeImage} disabled={loading}>
      <ScanText className="w-4 h-4" />
      {loading ? 'Analyzing...' : 'Extract Text'}
    </Button>
  );
}
```

## 🚀 Quick Start

1. **Install dependencies** (already done):
   ```bash
   pnpm install @google/generative-ai
   ```

2. **Environment variable** (REQUIRED):
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Test the APIs**:
   ```bash
   # Test transcription
   curl -X POST http://localhost:3000/api/ai/transcribe \
     -F "audio=@test.mp3"

   # Test image analysis
   curl -X POST http://localhost:3000/api/ai/analyze-image \
     -F "image=@test.jpg" \
     -F "action=analyze"
   ```

## 💡 Use Cases

### Voice Notes
- Quick post creation while driving
- Accessibility for users with typing difficulties
- Faster content creation

### Image OCR
- Extract code from screenshots
- Read text from memes/images
- Auto-generate alt text for accessibility
- Extract data from documents

### Text Summarization
- TL;DR for long posts
- Quick preview in notifications
- Feed optimization

## 🔒 Security & Privacy

- All audio/image data is sent to Google Gemini API
- No data is stored on our servers
- Files are processed in memory only
- Usage is tracked per user for rate limiting
- API key is stored in `.env.local` (never commit this file!)

## 📈 Future Enhancements

- [ ] Real-time voice transcription
- [ ] Multi-language support
- [ ] Video transcription
- [ ] Code explanation from images
- [ ] Sentiment analysis
- [ ] Content moderation

## 🐛 Troubleshooting

### "Monthly limit reached"
- Upgrade to premium or wait for next month
- AkDavid has unlimited access

### "File too large"
- Audio: Max 10MB
- Images: Max 5MB
- Compress files before uploading

### "Transcription unavailable"
- Check audio quality
- Ensure audio contains speech
- Try different audio format

## 📞 Support

For issues or questions, contact the DevSocial team or check the main README.md

---

**Powered by Google Gemini 2.5 Flash** 🚀
