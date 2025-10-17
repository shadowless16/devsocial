# AI Architecture - Two-Tier System

## 🎯 Overview

DevSocial now uses **TWO SEPARATE AI SYSTEMS** with clear responsibilities:

1. **Mistral AI** - Background automation (moderation, quality scoring, badge checking)
2. **Gemini AI** - User-facing features (search, summarization, explanations)

---

## 📁 File Structure

```
lib/
├── ai/
│   ├── mistral-background-service.ts  ← Background AI (Mistral)
│   ├── gemini-public-service.ts       ← Public AI (Gemini)
│   └── README.md                       ← Documentation
├── ai-service.ts                       ← DEPRECATED (backward compatibility)
└── gemini-service.ts                   ← DEPRECATED (backward compatibility)
```

---

## 🤖 Mistral AI - Background Service

**File:** `lib/ai/mistral-background-service.ts`  
**API Key:** `MISTRAL_API_KEY`  
**Model:** `mistral-small-latest`

### Features

#### 1. Content Moderation
```typescript
import { mistralBackgroundService } from '@/lib/ai/mistral-background-service'

const result = await mistralBackgroundService.moderateContent(postContent)
// Returns: { isSafe, isSpam, isToxic, confidence, reason, suggestedAction }
```

#### 2. Quality Analysis
```typescript
const quality = await mistralBackgroundService.analyzeQuality(postContent)
// Returns: { score, xpBonus, category, reasoning, hasCode, isEducational }
```

#### 3. Badge Condition Checking
```typescript
const check = await mistralBackgroundService.checkBadgeCondition(
  'Helper of the People',
  'Provided 25 helpful solutions',
  userRecentPosts
)
// Returns: { eligible, confidence, reasoning, suggestedBadge }
```

#### 4. Helpful Solution Detection
```typescript
const isHelpful = await mistralBackgroundService.isHelpfulSolution(
  commentText,
  originalPostText
)
// Returns: boolean
```

#### 5. Batch Moderation
```typescript
const results = await mistralBackgroundService.batchModerate([post1, post2, post3])
// Returns: ModerationResult[]
```

### When to Use
- ✅ Automated content moderation
- ✅ Post quality scoring for XP bonuses
- ✅ Badge eligibility validation
- ✅ Scheduled background jobs
- ✅ Batch processing

### When NOT to Use
- ❌ User-requested features
- ❌ Real-time user interactions
- ❌ Search or summarization

---

## 🌟 Gemini AI - Public Service

**File:** `lib/ai/gemini-public-service.ts`  
**API Key:** `GEMINI_API_KEY`  
**Model:** `gemini-2.5-flash`

### Features

#### 1. Post Summarization
```typescript
import { geminiPublicService } from '@/lib/ai/gemini-public-service'

const summary = await geminiPublicService.summarizePost(postContent)
```

#### 2. Code Explanation
```typescript
const explanation = await geminiPublicService.explainPost(postContent)
```

#### 3. Search Enhancement
```typescript
const keywords = await geminiPublicService.generateSearchKeywords(query)
const rankedResults = await geminiPublicService.semanticSearch(query, posts)
const summary = await geminiPublicService.summarizeSearchResults(query, results)
```

#### 4. Image Analysis
```typescript
const analysis = await geminiPublicService.analyzeImage(imageBase64, mimeType)
const description = await geminiPublicService.describeImage(imageBase64, mimeType)
```

#### 5. Audio Transcription
```typescript
const transcript = await geminiPublicService.transcribeAudio(audioBase64, mimeType)
```

#### 6. Text Enhancement
```typescript
const enhanced = await geminiPublicService.enhanceText(content, instruction)
```

### When to Use
- ✅ User clicks "Summarize" button
- ✅ User clicks "Explain" button
- ✅ Enhanced search results
- ✅ Image/audio processing
- ✅ Real-time user requests

### When NOT to Use
- ❌ Automated moderation
- ❌ Background quality scoring
- ❌ Badge checking

---

## 🔄 Migration Status

### ✅ Completed
- [x] Created `mistral-background-service.ts`
- [x] Created `gemini-public-service.ts`
- [x] Updated `app/api/posts/route.ts` to use Mistral for quality analysis
- [x] Deprecated old `ai-service.ts` (backward compatible)
- [x] Deprecated old `gemini-service.ts` (backward compatible)
- [x] Installed `@mistralai/mistralai` package

### 📋 Next Steps
1. Add content moderation to post creation
2. Implement badge checking with AI
3. Add batch moderation cron job
4. Add rate limiting for public AI features
5. Monitor API costs separately

---

## 💰 Cost Optimization

### Background AI (Mistral)
- Runs on schedule (every 5-15 minutes)
- Batch processing
- No per-user limits
- **Estimated:** $50-200/month

### Public AI (Gemini)
- Per-user request
- Rate limited (3-5 requests/day for free users)
- Premium users get more
- **Estimated:** $500-2000/month (with limits)

### Recommendations
1. Cache common queries
2. Use cheaper models for simple tasks
3. Set budget alerts
4. Monitor usage per service

---

## 🔐 Environment Variables

```env
# Mistral (Background)
MISTRAL_API_KEY=your_mistral_key
MISTRAL_API_BASE=https://api.mistral.ai
AI_PROVIDER=mistral

# Gemini (Public)
GEMINI_API_KEY=your_gemini_key
```

---

## 📊 Usage Examples

### Post Creation with Quality Analysis
```typescript
// app/api/posts/route.ts
import { mistralBackgroundService } from '@/lib/ai/mistral-background-service'

// After post creation
const quality = await mistralBackgroundService.analyzeQuality(content)
await awardXP(userId, 'quality_bonus', quality.xpBonus)
```

### User-Requested Summarization
```typescript
// app/api/posts/summarize/route.ts
import { geminiPublicService } from '@/lib/ai/gemini-public-service'

const summary = await geminiPublicService.summarizePost(content)
return NextResponse.json({ summary })
```

### Badge Checking (Future)
```typescript
// utils/badge-checker.ts
import { mistralBackgroundService } from '@/lib/ai/mistral-background-service'

const userPosts = await Post.find({ author: userId }).limit(10)
const check = await mistralBackgroundService.checkBadgeCondition(
  badge.name,
  badge.condition,
  userPosts.map(p => p.content)
)

if (check.eligible && check.confidence > 80) {
  await awardBadge(userId, badge.id)
}
```

---

## 🚨 Important Rules

1. **NEVER mix the two services**
   - Background tasks = Mistral
   - User features = Gemini

2. **Always handle errors gracefully**
   - Background: Log and continue
   - Public: Show user-friendly message

3. **Rate limiting**
   - Background: No limits (controlled by schedule)
   - Public: Strict per-user limits

4. **Cost monitoring**
   - Track separately
   - Set budget alerts
   - Review monthly

---

**Last Updated:** 2025/10/17 
**Status:** ✅ Active  
**Next Review:** After implementing badge checking
