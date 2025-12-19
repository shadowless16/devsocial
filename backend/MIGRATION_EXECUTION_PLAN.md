# Full API Migration Execution Plan

## Migration Strategy: Batch by Category

We'll migrate all 100+ routes in organized batches. Each batch is a complete category.

## Route Categories (15 Total)

### Batch 1: Core Social Features (PRIORITY 1)
- ✅ **Auth** (8 routes) - Already done
- ✅ **Users** (12 routes) - Partially done
- ✅ **Posts** (8 routes) - Partially done
- **Comments** (3 routes)
- **Likes** (2 routes)
- **Follow System** (integrated in users)

### Batch 2: Content Discovery (PRIORITY 1)
- **Feed** (1 route)
- **Search** (4 routes)
- **Tags** (3 routes)
- **Trending** (1 route)

### Batch 3: Gamification (PRIORITY 1)
- ✅ **Gamification** (1 route) - Partially done
- ✅ **Leaderboard** (1 route) - Already done
- **Challenges** (5 routes)
- **XP Overtakes** (1 route)

### Batch 4: User Features (PRIORITY 2)
- **Profile** (3 routes)
- **Dashboard** (1 route)
- ✅ **Analytics** (7 routes) - Already done
- **Referrals** (3 routes)
- **Affiliations** (1 route)

### Batch 5: Communication (PRIORITY 2)
- **Messages** (3 routes)
- ✅ **Notifications** (6 routes) - Already done

### Batch 6: Community Features (PRIORITY 2)
- **Communities** (4 routes)
- **Projects** (5 routes)
- **Polls** (1 route)
- **Feedback** (3 routes)

### Batch 7: Content Management (PRIORITY 2)
- **Upload** (2 routes)
- **Link Preview** (1 route)
- **Save Avatar** (1 route)

### Batch 8: Learning & Career (PRIORITY 3)
- **Career Paths** (3 routes)
- **Knowledge Bank** (2 routes)

### Batch 9: AI Features (PRIORITY 3)
- **AI** (5 routes)

### Batch 10: Moderation (PRIORITY 3)
- **Mod** (2 routes)
- **Reports** (2 routes)

### Batch 11: Admin (PRIORITY 3)
- **Admin** (10 routes)

### Batch 12: System (PRIORITY 4)
- **Health** (1 route)
- **Docs** (1 route)
- **Well-known** (1 route)
- **MCP** (1 route)

### Batch 13: Cron Jobs (PRIORITY 4)
- **Cron** (3 routes)

### Batch 14: Delete These
- **Debug** (3 routes) - Remove
- **Test** (5 routes) - Remove
- **Proxy** (2 routes) - Remove (microservices artifacts)

## Implementation Order

### Phase 1: Core Features (Week 1)
1. Comments routes
2. Likes routes
3. Feed route
4. Search routes
5. Complete Users routes
6. Complete Posts routes

### Phase 2: Gamification & Discovery (Week 1)
7. Challenges routes
8. Tags routes
9. Trending route
10. XP Overtakes

### Phase 3: User Experience (Week 2)
11. Profile routes
12. Dashboard route
13. Referrals routes
14. Upload routes

### Phase 4: Social & Community (Week 2)
15. Messages routes
16. Communities routes
17. Projects routes
18. Polls routes
19. Feedback routes

### Phase 5: Advanced Features (Week 3)
20. Career Paths routes
21. Knowledge Bank routes
22. AI routes
23. Link Preview route

### Phase 6: Admin & Moderation (Week 3)
24. Mod routes
25. Reports routes
26. Admin routes

### Phase 7: System & Cleanup (Week 3)
27. Health, Docs, Well-known routes
28. Cron jobs
29. Delete debug/test/proxy routes

## Migration Checklist Per Route

For each route file:
- [ ] Read Next.js route handler
- [ ] Identify HTTP methods (GET, POST, PUT, DELETE)
- [ ] Extract business logic
- [ ] Identify dependencies (models, utils)
- [ ] Create Express route equivalent
- [ ] Add authentication middleware if needed
- [ ] Add validation if needed
- [ ] Test endpoint
- [ ] Update frontend API client
- [ ] Delete Next.js route file

## Automated Migration Script

I'll create a script that:
1. Scans each Next.js route file
2. Extracts the logic
3. Generates Express route boilerplate
4. Creates route files in backend/src/routes/
5. Updates backend/src/server.ts with new routes

## Estimated Timeline

- **Phase 1-2**: 3-4 days (core features)
- **Phase 3-4**: 3-4 days (user & social)
- **Phase 5-6**: 2-3 days (advanced & admin)
- **Phase 7**: 1 day (cleanup)

**Total: ~2 weeks of focused work**

## Next Steps

1. Start with Batch 1 (Comments, Likes)
2. Create route files in backend
3. Test each route
4. Update frontend to use backend
5. Delete Next.js routes
6. Repeat for each batch

Ready to begin?
