# Vercel Deployment Rules

## Critical: Avoid Client Reference Manifest Errors

**NEVER create duplicate page.tsx files in route groups that conflict with each other.**

### Forbidden Patterns:
- ❌ Having both `/app/(authenticated)/page.tsx` AND `/app/(authenticated)/home/page.tsx`
- ❌ Using server-side `redirect()` in client components
- ❌ Duplicate content rendering between layout and page components

### Required Patterns:
- ✅ Use layout for structure, individual pages for content
- ✅ Handle root route redirects in layout with `useRouter`
- ✅ Delete conflicting root page files when specific route pages exist
- ✅ Keep layouts simple - just structure, no business logic

### Error Prevention:
If you see `ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/(authenticated)/page_client-reference-manifest.js'`:
1. Check for duplicate page.tsx files in same route group
2. Remove root page.tsx if specific route pages exist
3. Move redirect logic to layout component
4. Ensure no duplicate content rendering