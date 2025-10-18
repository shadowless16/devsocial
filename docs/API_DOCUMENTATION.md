# DevSocial API Documentation

## Overview
Complete API documentation for the DevSocial platform - a gamified social media platform for developers.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://devsocial.vercel.app`

## Authentication
All authenticated endpoints require either:
- **Bearer Token**: Include in `Authorization` header as `Bearer <token>`
- **Session Cookie**: Automatically handled by NextAuth.js

## Interactive Documentation
Visit `/api-docs` for interactive Swagger UI documentation where you can test all endpoints.

## API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{username}` - Get user by username
- `POST /api/users/follow/{userId}` - Follow/unfollow user
- `GET /api/users/{username}/followers` - Get user followers
- `GET /api/users/{username}/following` - Get user following

### Posts
- `GET /api/posts` - Get posts feed (supports pagination, filtering)
- `POST /api/posts` - Create new post
- `GET /api/posts/{id}` - Get single post
- `DELETE /api/posts/{id}` - Delete post

### Comments
- `GET /api/comments/{postId}` - Get post comments
- `POST /api/comments/{postId}` - Add comment
- `DELETE /api/comments/delete/{commentId}` - Delete comment

### Likes
- `POST /api/likes/posts/{postId}` - Like/unlike post
- `POST /api/likes/comments/{commentId}` - Like/unlike comment

### Gamification
- `GET /api/leaderboard` - Get leaderboard rankings
- `GET /api/challenges` - Get active challenges
- `POST /api/challenges/{challengeId}/join` - Join challenge
- `POST /api/challenges/{challengeId}/submit` - Submit challenge solution

### Analytics
- `GET /api/dashboard` - Get user dashboard analytics
- `GET /api/analytics` - Get detailed analytics

### Admin (Admin Only)
- `GET /api/admin/users` - Get all users with filters
- `POST /api/admin/users/{userId}/block` - Block/unblock user
- `POST /api/admin/users/{userId}/role` - Update user role

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
API endpoints are rate-limited to prevent abuse:
- **Authenticated users**: 100 requests per minute
- **Unauthenticated users**: 20 requests per minute

## Pagination
List endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Example: `GET /api/posts?page=2&limit=50`

## Filtering
Posts endpoint supports filtering:
- `filter=all` - All posts
- `filter=following` - Posts from followed users
- `filter=trending` - Trending posts

## WebSocket Events
Real-time features use Socket.io:
- `new_post` - New post in feed
- `new_notification` - User notifications
- `new_message` - Chat messages
- `user_typing` - Typing indicators
- `post_liked` - Real-time like updates
- `xp_gained` - XP animations

## Data Models

### User
```typescript
{
  _id: string
  username: string
  displayName: string
  email: string
  avatar: string
  bio: string
  level: number
  points: number
  role: 'user' | 'moderator' | 'admin'
  badges: string[]
  isBlocked: boolean
  createdAt: Date
}
```

### Post
```typescript
{
  _id: string
  content: string
  author: User
  likes: string[]
  commentsCount: number
  tags: string[]
  isAnonymous: boolean
  createdAt: Date
}
```

### Comment
```typescript
{
  _id: string
  content: string
  author: User
  post: string
  likes: string[]
  createdAt: Date
}
```

## Testing
Use tools like:
- **Swagger UI**: `/api-docs` (built-in)
- **Postman**: Import OpenAPI spec from `/api/docs`
- **cURL**: Command-line testing

## Support
For API support, contact: support@devsocial.com
