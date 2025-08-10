# API Documentation

Complete API reference for DevSocial platform endpoints.

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string"
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "jwt-token-string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "xp": 0,
    "level": 1
  }
}
```

## User Management

### GET /users/profile
Get current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "bio": "string",
    "xp": 1250,
    "level": 3,
    "badges": ["early-adopter", "social-butterfly"],
    "followersCount": 42,
    "followingCount": 38
  }
}
```

### PUT /users/profile
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "string",
  "bio": "string",
  "location": "string",
  "website": "string"
}
```

### GET /users/[username]
Get public profile of any user.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "username": "string",
    "fullName": "string",
    "bio": "string",
    "xp": 1250,
    "level": 3,
    "badges": ["early-adopter"],
    "isFollowing": false
  }
}
```

## Posts & Content

### GET /posts
Get posts feed with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Posts per page (default: 10)
- `type` (string): "following" | "trending" | "all"

**Response (200):**
```json
{
  "success": true,
  "posts": [
    {
      "id": "string",
      "content": "string",
      "author": {
        "username": "string",
        "fullName": "string",
        "avatar": "string"
      },
      "likesCount": 15,
      "commentsCount": 3,
      "isLiked": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 47
  }
}
```

### POST /posts
Create a new post.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string",
  "tags": ["javascript", "react"],
  "isAnonymous": false,
  "media": ["image-url-1", "image-url-2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "post": {
    "id": "string",
    "content": "string",
    "author": {
      "username": "string",
      "fullName": "string"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /posts/[id]
Delete a post (author only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

## Likes & Interactions

### POST /likes/posts/[postId]
Like or unlike a post.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "isLiked": true,
  "likesCount": 16
}
```

### POST /likes/comments/[commentId]
Like or unlike a comment.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "isLiked": true,
  "likesCount": 5
}
```

## Comments

### GET /comments/[postId]
Get comments for a specific post.

**Response (200):**
```json
{
  "success": true,
  "comments": [
    {
      "id": "string",
      "content": "string",
      "author": {
        "username": "string",
        "fullName": "string"
      },
      "likesCount": 2,
      "isLiked": false,
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

### POST /comments/[postId]
Add a comment to a post.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string"
}
```

## Gamification

### GET /leaderboard
Get leaderboard rankings.

**Query Parameters:**
- `period` (string): "weekly" | "monthly" | "all-time"
- `limit` (number): Number of users to return (default: 50)

**Response (200):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "username": "string",
        "fullName": "string",
        "avatar": "string"
      },
      "xp": 5420,
      "level": 12
    }
  ]
}
```

### GET /challenges
Get active challenges.

**Response (200):**
```json
{
  "success": true,
  "challenges": [
    {
      "id": "string",
      "title": "Weekly Coding Challenge",
      "description": "string",
      "xpReward": 500,
      "difficulty": "medium",
      "deadline": "2024-01-22T23:59:59Z",
      "participantsCount": 127
    }
  ]
}
```

## Search

### GET /search
Search posts, users, and tags.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): "posts" | "users" | "tags" | "all"
- `page` (number): Page number
- `limit` (number): Results per page

**Response (200):**
```json
{
  "success": true,
  "results": {
    "posts": [...],
    "users": [...],
    "tags": [...]
  }
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": ["Username is required", "Email must be valid"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate limited:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```