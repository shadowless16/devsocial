import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
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
    security: [{ bearerAuth: [] }, { cookieAuth: [] }]
  },
  apis: ['./app/api/**/*.ts', './docs/swagger/**/*.yaml']
}

export const swaggerSpec = swaggerJsdoc(options)
