import path from 'path'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'

const loadYamlFile = (filename: string) => {
  try {
    const filePath = path.join(process.cwd(), 'docs', 'swagger', filename)
    const fileContents = readFileSync(filePath, 'utf8')
    return load(fileContents) as any
  } catch (e) {
    return { paths: {} }
  }
}

const authPaths = loadYamlFile('auth.yaml')
const postsPaths = loadYamlFile('posts.yaml')
const usersPaths = loadYamlFile('users.yaml')
const commentsPaths = loadYamlFile('comments.yaml')
const likesPaths = loadYamlFile('likes.yaml')
const gamificationPaths = loadYamlFile('gamification.yaml')
const analyticsPaths = loadYamlFile('analytics.yaml')

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DevSocial API Documentation',
    version: '1.0.0',
    description: 'A gamified social media platform API for developers and tech enthusiasts',
    contact: {
      name: 'DevSocial Team',
      email: 'support@devsocial.com'
    }
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://devsocial.vercel.app',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          email: { type: 'string' },
          avatar: { type: 'string' },
          bio: { type: 'string' },
          level: { type: 'number' },
          points: { type: 'number' },
          role: { type: 'string', enum: ['user', 'moderator', 'admin'] },
          badges: { type: 'array', items: { type: 'string' } },
          isBlocked: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          content: { type: 'string' },
          author: { $ref: '#/components/schemas/User' },
          likes: { type: 'array', items: { type: 'string' } },
          commentsCount: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } },
          isAnonymous: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          content: { type: 'string' },
          author: { $ref: '#/components/schemas/User' },
          post: { type: 'string' },
          likes: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' }
        }
      }
    }
  },
  paths: {
    ...authPaths.paths,
    ...postsPaths.paths,
    ...usersPaths.paths,
    ...commentsPaths.paths,
    ...likesPaths.paths,
    ...gamificationPaths.paths,
    ...analyticsPaths.paths
  },
  tags: [
    { name: 'Authentication', description: 'User authentication endpoints' },
    { name: 'Posts', description: 'Post management endpoints' },
    { name: 'Users', description: 'User profile and management' },
    { name: 'Comments', description: 'Comment operations' },
    { name: 'Likes', description: 'Like/unlike operations' },
    { name: 'Gamification', description: 'Leaderboard and challenges' },
    { name: 'Analytics', description: 'User analytics and dashboard' }
  ],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }]
}
