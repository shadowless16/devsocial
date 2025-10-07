# DevSocial Feed Algorithm & Engagement Thresholds

## Overview
The DevSocial feed uses a sophisticated ranking algorithm that balances recency, engagement, and user preferences to create a personalized experience.

## Algorithm Components

### 1. Base Score Calculation
```
Base Score = (Likes × 3) + (Comments × 5) + (Views × 0.1) + (Poll Votes × 2)
```

### 2. Time Decay Factor
```
Time Decay = 1 / (1 + (hours_since_post / 24))
```
- Posts lose ~50% relevance after 24 hours
- Ensures fresh content appears higher

### 3. Engagement Rate
```
Engagement Rate = (Likes + Comments + Poll Votes) / Views
```
- Rewards posts with high interaction relative to views
- Minimum 10 views required for calculation

### 4. Author Reputation Multiplier
```
Reputation = (Author Level / 10) + (Author XP / 10000)
```
- Higher level authors get slight boost (max 2x)
- Encourages quality content from established users

### 5. Poll Boost
```
Poll Boost = Active Poll ? 1.5 : 1.0
```
- Active polls get 50% boost to encourage participation
- Expires when poll ends

### 6. Final Ranking Score
```
Final Score = (Base Score × Time Decay × Engagement Rate × Reputation × Poll Boost) + Randomness
```
- Small randomness factor (±5%) prevents stagnation

## Engagement Thresholds

### When You'll See Algorithm Effects

#### Minimum Viable Community (10-50 users)
- **Posts Needed**: 50+ posts
- **Daily Activity**: 10+ posts/day
- **What You'll Notice**:
  - Basic time-based sorting
  - Popular posts stay visible longer
  - Polls get slight visibility boost

#### Growing Community (50-200 users)
- **Posts Needed**: 200+ posts
- **Daily Activity**: 30+ posts/day
- **What You'll Notice**:
  - Engagement rate matters significantly
  - High-quality posts surface faster
  - Author reputation starts affecting visibility
  - Polls with high participation dominate feed

#### Established Community (200-1000 users)
- **Posts Needed**: 1000+ posts
- **Daily Activity**: 100+ posts/day
- **What You'll Notice**:
  - Full algorithm in effect
  - Personalized feed based on interactions
  - Trending section highly dynamic
  - Poll results influence content discovery

#### Large Community (1000+ users)
- **Posts Needed**: 5000+ posts
- **Daily Activity**: 500+ posts/day
- **What You'll Notice**:
  - Machine learning recommendations
  - Topic clustering
  - Advanced poll analytics
  - Real-time trending updates

## Poll-Specific Algorithm

### Poll Visibility Boost
Polls receive enhanced visibility based on:

1. **Participation Rate**
   ```
   Participation = Total Votes / Post Views
   Boost = 1 + (Participation × 2)
   ```
   - High participation = up to 3x visibility

2. **Time Remaining**
   ```
   Urgency Boost = Time Remaining < 6 hours ? 1.3 : 1.0
   ```
   - Polls ending soon get 30% boost

3. **Controversy Score**
   ```
   Controversy = 1 - |Option1% - Option2%| / 100
   ```
   - Close polls (controversial) get higher visibility
   - Encourages participation in tight races

4. **Multiple Choice Bonus**
   ```
   Complexity Bonus = Multiple Choice ? 1.2 : 1.0
   ```
   - More complex polls get slight boost

### Poll Ranking Formula
```
Poll Score = Base Score × Time Decay × Participation Boost × Urgency Boost × Controversy × Complexity Bonus
```

## Testing the Algorithm

### Phase 1: Seed Data (0-10 users)
- Create 20-30 posts manually
- Mix of regular posts and polls
- Vary engagement (likes, comments)
- **Expected**: Basic chronological feed

### Phase 2: Early Growth (10-50 users)
- Encourage 5-10 posts per user
- Create 10+ polls with varied topics
- Get users to vote and comment
- **Expected**: Popular content stays visible, polls get boosted

### Phase 3: Active Community (50-200 users)
- Maintain 30+ posts/day
- Run 5+ active polls simultaneously
- Encourage diverse engagement patterns
- **Expected**: Clear separation between high/low quality content

### Phase 4: Scale Testing (200+ users)
- Simulate high volume (100+ posts/day)
- Multiple concurrent polls
- Varied user levels and reputation
- **Expected**: Full algorithm effects visible

## Metrics to Track

### Content Health
- **Post Velocity**: Posts per hour
- **Engagement Rate**: Avg interactions per post
- **Poll Participation**: % of users voting
- **Comment Depth**: Avg comments per post

### Algorithm Performance
- **Feed Diversity**: Unique authors in top 20
- **Freshness**: Avg age of top posts
- **Engagement Distribution**: Gini coefficient
- **Poll Completion Rate**: % of polls reaching 50+ votes

### User Satisfaction
- **Session Duration**: Time spent in feed
- **Scroll Depth**: How far users scroll
- **Return Rate**: Daily active users
- **Poll Creation Rate**: Polls per 100 posts

## Optimization Tips

### For Content Creators
1. **Post Timing**: Peak hours (9-11 AM, 6-9 PM)
2. **Use Polls**: 2-3x more engagement than regular posts
3. **Engage Early**: First hour critical for visibility
4. **Quality Over Quantity**: High engagement rate > post volume

### For Platform Growth
1. **Seed Polls**: Create 1-2 polls daily until community active
2. **Highlight Trending**: Show top polls in sidebar
3. **Gamify Voting**: Award XP for poll participation
4. **Poll Notifications**: Alert users about ending polls

## Advanced Features (Future)

### Personalization Layer
- User interest clustering
- Following-based boosting
- Topic preferences
- Interaction history

### Machine Learning
- Content quality prediction
- Spam detection
- Optimal posting time suggestions
- Poll outcome predictions

### Real-Time Adjustments
- Trending topic detection
- Viral content amplification
- Engagement velocity tracking
- Dynamic XP rewards

## Implementation Notes

### Database Indexes Required
```javascript
// Posts collection
db.posts.createIndex({ createdAt: -1, likesCount: -1 })
db.posts.createIndex({ "poll.endsAt": 1 })
db.posts.createIndex({ "poll.totalVotes": -1 })

// Users collection
db.users.createIndex({ level: -1, xp: -1 })
```

### Caching Strategy
- Cache feed for 30 seconds per user
- Invalidate on new post/vote
- Pre-compute trending polls every 5 minutes
- Store engagement metrics in Redis

### Performance Targets
- Feed load: < 200ms
- Poll vote: < 100ms
- Real-time updates: < 1s latency
- Support: 10,000 concurrent users

## Conclusion

The algorithm becomes effective with:
- **Minimum**: 50 users, 200 posts, 20 polls
- **Optimal**: 200+ users, 1000+ posts, 50+ active polls
- **Scale**: 1000+ users for full ML features

Start seeing effects after:
- **Week 1**: Basic engagement patterns
- **Week 2**: Clear content quality separation
- **Month 1**: Full algorithm impact
- **Month 3**: Personalized recommendations

Focus on poll creation and participation to accelerate algorithm effectiveness!
