# AI Services Architecture

This directory contains **TWO SEPARATE AI SYSTEMS** with clear responsibilities.

## 🤖 System Overview

### 1. **Mistral AI** - Background Service
**File:** `mistral-background-service.ts`  
**Purpose:** Behind-the-scenes automation  
**API Key:** `MISTRAL_API_KEY`

**Use Cases:**
- ✅ Content moderation (toxic/spam detection)
- ✅ Badge condition validation
- ✅ Post quality scoring for XP bonuses
- ✅ Automated content analysis
- ✅ Helpful solution detection

**DO NOT USE FOR:**
- ❌ User-facing features
- ❌ Real-time user interactions
- ❌ Search or summarization

---

### 2. **Gemini AI** - Public Service
**File:** `gemini-public-service.ts`  
**Purpose:** User-facing features  
**API Key:** `GEMINI_API_KEY`

**Use Cases:**
- ✅ Post summarization (user-requested)
- ✅ Code explanation
- ✅ Search enhancement
- ✅ Image analysis
- ✅ Audio transcription
- ✅ Text enhancement

**DO NOT USE FOR:**
- ❌ Automated moderation
- ❌ Background quality scoring
- ❌ Badge checking

---

## 📋 Usage Examples

### Background Tasks (Mistral)
```typescript
import { mistralBackgroundService } from '@/lib/ai/mistral-background-service'

// Moderate content automatically
const modResult = await mistralBackgroundService.moderateContent(postContent)
if (!modResult.isSafe) {
  // Flag or remove post
}

// Analyze quality for XP bonus
const quality = await mistralBackgroundService.analyzeQuality(postContent)
await awardXP(userId, 'quality_bonus', quality.xpBonus)

// Check badge eligibility
const badgeCheck = await mistralBackgroundService.checkBadgeCondition(
  'Helper of the People',
  'Provided 25 helpful solutions',
  userRecentPosts
)
```

### Public Features (Gemini)
```typescript
import { geminiPublicService } from '@/lib/ai/gemini-public-service'

// User clicks "Summarize" button
const summary = await geminiPublicService.summarizePost(postContent)

// User clicks "Explain" button
const explanation = await geminiPublicService.explainPost(postContent)

// Enhanced search
const keywords = await geminiPublicService.generateSearchKeywords(query)
```

---

## 🔒 Why Two Systems?

### Cost Efficiency
- **Mistral**: Cheaper for batch processing, runs on schedule
- **Gemini**: Better for real-time user interactions

### Separation of Concerns
- **Background tasks** don't block user experience
- **Public features** are rate-limited per user
- Clear boundaries prevent confusion

### Scalability
- Background jobs can be queued and processed async
- Public features respond immediately to user requests

---

## 🚨 Important Rules

1. **NEVER mix the two services**
   - Don't use Gemini for moderation
   - Don't use Mistral for user-facing features

2. **Always handle errors gracefully**
   - Background tasks: Log and continue
   - Public features: Show user-friendly message

3. **Rate limiting**
   - Background: No limits (controlled by schedule)
   - Public: Strict per-user limits (see rate-limit middleware)

4. **Cost monitoring**
   - Track API usage separately for each service
   - Set budget alerts

---

## 📊 Migration from Old System

**Old:** `lib/ai-service.ts` (Gemini for everything)  
**New:** Split into two services

**Migration checklist:**
- [x] Create `mistral-background-service.ts`
- [x] Create `gemini-public-service.ts`
- [ ] Update `app/api/posts/route.ts` to use Mistral for quality
- [ ] Update search endpoints to use Gemini
- [ ] Update user-facing features to use Gemini
- [ ] Deprecate old `ai-service.ts`

---

## 🔧 Environment Variables

```env
# Mistral (Background)
MISTRAL_API_KEY=your_mistral_key
MISTRAL_API_BASE=https://api.mistral.ai
AI_PROVIDER=mistral

# Gemini (Public)
GEMINI_API_KEY=your_gemini_key
```

---

**Last Updated:** 2024
**Maintainer:** DevSocial Team
