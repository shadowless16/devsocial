# Swagger Documentation Setup Guide

## Overview
This guide explains how to use and maintain the Swagger API documentation for DevSocial.

## Accessing Documentation

### Interactive Swagger UI
Visit: `http://localhost:3000/api-docs`

This provides an interactive interface where you can:
- Browse all API endpoints
- Test endpoints directly from the browser
- View request/response schemas
- See authentication requirements

### OpenAPI JSON Spec
Access the raw OpenAPI specification at: `http://localhost:3000/api/docs`

## Project Structure

```
devsocial/
├── lib/
│   └── swagger.ts              # Swagger configuration
├── app/
│   ├── api/
│   │   └── docs/
│   │       └── route.ts        # API route serving OpenAPI spec
│   └── api-docs/
│       └── page.tsx            # Swagger UI page
└── docs/
    ├── swagger/                # YAML documentation files
    │   ├── auth.yaml          # Authentication endpoints
    │   ├── posts.yaml         # Posts endpoints
    │   ├── users.yaml         # Users endpoints
    │   ├── comments.yaml      # Comments endpoints
    │   ├── gamification.yaml  # Gamification endpoints
    │   ├── likes.yaml         # Likes endpoints
    │   └── analytics.yaml     # Analytics endpoints
    └── API_DOCUMENTATION.md    # Human-readable docs
```

## Adding New Endpoints

### Method 1: YAML Files (Recommended)
Create or update YAML files in `docs/swagger/`:

```yaml
paths:
  /api/your-endpoint:
    get:
      tags:
        - YourTag
      summary: Brief description
      parameters:
        - in: query
          name: paramName
          schema:
            type: string
      responses:
        '200':
          description: Success response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/YourSchema'
```

### Method 2: JSDoc Comments
Add JSDoc comments directly in your route files:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     tags:
 *       - YourTag
 *     summary: Brief description
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET() {
  // Your code
}
```

## Adding New Schemas

Edit `lib/swagger.ts` and add to `components.schemas`:

```typescript
YourSchema: {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' }
  }
}
```

## Testing Endpoints

1. Start development server: `pnpm dev`
2. Navigate to `http://localhost:3000/api-docs`
3. Click on an endpoint to expand
4. Click "Try it out"
5. Fill in parameters
6. Click "Execute"
7. View response

## Authentication in Swagger UI

For protected endpoints:
1. Click the "Authorize" button (lock icon)
2. Enter your JWT token in the format: `Bearer <your-token>`
3. Click "Authorize"
4. Now you can test protected endpoints

## Exporting Documentation

### Export as JSON
```bash
curl http://localhost:3000/api/docs > openapi.json
```

### Import to Postman
1. Open Postman
2. Click "Import"
3. Select "Link"
4. Enter: `http://localhost:3000/api/docs`
5. Click "Continue"

### Generate Client SDKs
Use OpenAPI Generator:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api/docs \
  -g typescript-axios \
  -o ./generated-client
```

## Best Practices

1. **Keep Documentation Updated**: Update Swagger docs when adding/modifying endpoints
2. **Use Descriptive Summaries**: Write clear, concise endpoint descriptions
3. **Include Examples**: Add example requests/responses
4. **Document All Parameters**: Include all query params, path params, and body fields
5. **Specify Response Codes**: Document all possible HTTP status codes
6. **Use Schema References**: Reuse schemas with `$ref` to avoid duplication
7. **Tag Endpoints**: Group related endpoints with tags
8. **Add Security Requirements**: Specify which endpoints require authentication

## Common Issues

### Swagger UI Not Loading
- Check that `swagger-ui-react` is installed
- Verify the `/api/docs` endpoint returns valid JSON
- Check browser console for errors

### Endpoints Not Appearing
- Ensure YAML files are in `docs/swagger/` directory
- Check that file paths are correct in `swagger.ts` apis array
- Restart development server after adding new files

### Authentication Not Working
- Verify token format: `Bearer <token>`
- Check that security schemes are defined in `swagger.ts`
- Ensure endpoints have security requirements specified

## Maintenance

### Regular Updates
- Review and update documentation monthly
- Add new endpoints as they're created
- Remove deprecated endpoints
- Update schemas when models change

### Version Control
- Commit Swagger files with code changes
- Document breaking changes in API
- Use semantic versioning for API versions

## Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [OpenAPI Generator](https://openapi-generator.tech/)
