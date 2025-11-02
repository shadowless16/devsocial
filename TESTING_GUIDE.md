# Testing Guide: User Tagging & Profile Navigation

## Quick Test Checklist

### 1. User Tagging in Comments (Feed Page)

#### Test Steps:
1. Navigate to the main feed (`/`)
2. Find any post and click the comment button
3. In the comment input field, type `@`
4. **Expected**: A dropdown appears with user suggestions
5. Type a few characters (e.g., `@jo`)
6. **Expected**: Dropdown filters to show matching users
7. Use arrow keys to navigate the suggestions
8. **Expected**: Selected item highlights
9. Press Enter or click on a user
10. **Expected**: Username is inserted into the comment field
11. Complete your comment and submit
12. **Expected**: Comment appears with clickable @mention

#### What to Verify:
- [ ] Dropdown appears when typing `@`
- [ ] User avatars display correctly in dropdown
- [ ] Dropdown filters as you type
- [ ] Keyboard navigation works (up/down arrows)
- [ ] Enter/Tab inserts the username
- [ ] Clicking a suggestion inserts the username
- [ ] Submitted comment shows @mention as a blue link
- [ ] Clicking @mention navigates to user profile

### 2. User Tagging in Comments (Post Detail Page)

#### Test Steps:
1. Click on any post to open detail view (`/post/[id]`)
2. Scroll to the comment section
3. Type `@` in the main comment input
4. **Expected**: Same dropdown behavior as feed
5. Submit a comment with a mention
6. Click "Reply" on an existing comment
7. Type `@` in the reply input
8. **Expected**: Dropdown appears in reply input too
9. Submit the reply with a mention

#### What to Verify:
- [ ] Main comment input supports tagging
- [ ] Reply inputs support tagging
- [ ] Mentions render as clickable links in comments
- [ ] Mentions render as clickable links in replies

### 3. Profile Navigation from Feed

#### Test Steps:
1. Navigate to the main feed
2. Find a post (not anonymous)
3. Hover over the user's avatar
4. **Expected**: Cursor changes to pointer
5. Click the avatar
6. **Expected**: Navigate to `/profile/[username]`
7. Go back to feed
8. Click on the user's display name
9. **Expected**: Navigate to profile
10. Go back to feed
11. Click on the username (e.g., `@johndoe`)
12. **Expected**: Navigate to profile

#### What to Verify:
- [ ] Avatar is clickable
- [ ] Display name is clickable
- [ ] Username is clickable
- [ ] Hover effects work (color change)
- [ ] Navigation works correctly
- [ ] Anonymous posts are NOT clickable

### 4. Profile Navigation from Post Detail

#### Test Steps:
1. Open any post detail page
2. Test clicking on:
   - Post author's avatar
   - Post author's display name
   - Post author's username
   - Comment author's avatar
   - Comment author's display name
   - Comment author's username
   - Reply author's avatar
   - Reply author's display name
   - Reply author's username

#### What to Verify:
- [ ] All user elements in post header are clickable
- [ ] All user elements in comments are clickable
- [ ] All user elements in replies are clickable
- [ ] Each click navigates to correct profile
- [ ] Clicking doesn't trigger post navigation

### 5. Profile Navigation from Mentions

#### Test Steps:
1. Find a comment with an @mention
2. Hover over the @mention
3. **Expected**: Link styling (blue, underline on hover)
4. Click the @mention
5. **Expected**: Navigate to mentioned user's profile
6. Verify the profile page loads correctly

#### What to Verify:
- [ ] @mentions are styled as links
- [ ] @mentions are clickable
- [ ] Navigation goes to correct profile
- [ ] Works in both comments and replies

### 6. Edge Cases

#### Anonymous Posts:
1. Find an anonymous post
2. Try clicking on "Anonymous" text
3. **Expected**: Should NOT navigate anywhere
4. Avatar should NOT be clickable

#### Multiple Mentions:
1. Create a comment with multiple mentions: `Hey @user1 and @user2, check this out!`
2. **Expected**: Both mentions are clickable
3. Click each mention
4. **Expected**: Navigate to respective profiles

#### Mention at Different Positions:
1. Test mention at start: `@user check this`
2. Test mention in middle: `Hey @user how are you`
3. Test mention at end: `Great work @user`
4. **Expected**: All mentions are clickable

### 7. User Experience

#### Hover Effects:
- [ ] User avatars show pointer cursor on hover
- [ ] Display names change color on hover (emerald-600)
- [ ] Usernames change color on hover (emerald-600)
- [ ] @mentions show underline on hover

#### Loading States:
- [ ] Comment submission shows loading state
- [ ] Disabled state prevents multiple submissions
- [ ] Toast notifications appear on success/error

#### Keyboard Accessibility:
- [ ] Tab key navigates through clickable elements
- [ ] Enter key activates links
- [ ] Escape closes mention dropdown
- [ ] Arrow keys navigate mention suggestions

## Common Issues & Solutions

### Issue: Dropdown doesn't appear
**Solution**: Make sure you're typing `@` in the comment input field, not just viewing

### Issue: Mentions not clickable
**Solution**: Verify the comment was submitted (not just typed)

### Issue: Navigation doesn't work
**Solution**: Check browser console for errors, ensure profile route exists

### Issue: TypeScript errors
**Solution**: Run `pnpm tsc --noEmit` to check for type errors

### Issue: Dropdown shows no users
**Solution**: Ensure there are users in the database and API is working

## Performance Testing

1. **Large User List**: Type `@` and verify dropdown loads quickly
2. **Multiple Comments**: Open a post with many comments, verify all mentions work
3. **Rapid Clicking**: Click multiple user elements quickly, verify navigation is smooth
4. **Mobile View**: Test on mobile viewport, verify touch interactions work

## Browser Testing

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

## API Testing

Verify these endpoints work:
- `GET /api/users/search?q=username` - User search for mentions
- `POST /api/comments/[postId]` - Comment creation with mentions
- `GET /api/users/[username]` - Profile page data

## Success Criteria

✅ All user tagging features work as expected
✅ All profile navigation links work correctly
✅ No TypeScript errors
✅ No console errors during normal usage
✅ Smooth user experience with proper feedback
✅ Works on both desktop and mobile
✅ Accessible via keyboard navigation

## Reporting Issues

If you find any issues:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Take screenshots if applicable
4. Note browser and device information
5. Report with all details above
