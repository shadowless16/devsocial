# Swagger Documentation - Quick Start

## 🚀 Access Your API Documentation

### View Interactive Docs
```
http://localhost:3000/api-docs
```

### Get OpenAPI JSON
```
http://localhost:3000/api/docs
```

## 📦 What's Included

✅ **Swagger UI** - Interactive API testing interface  
✅ **OpenAPI 3.0 Spec** - Industry-standard API documentation  
✅ **All Endpoints Documented** - Authentication, Posts, Users, Comments, Likes, Gamification, Analytics  
✅ **Request/Response Schemas** - Complete data models  
✅ **Authentication Support** - Test protected endpoints  

## 🎯 Quick Actions

### Test an Endpoint
1. Go to `http://localhost:3000/api-docs`
2. Find your endpoint (e.g., "GET /api/posts")
3. Click "Try it out"
4. Fill parameters
5. Click "Execute"

### Authenticate
1. Click "Authorize" button (🔒 icon)
2. Enter: `Bearer YOUR_JWT_TOKEN`
3. Click "Authorize"
4. Test protected endpoints

### Export for Postman
```bash
# Import this URL in Postman
http://localhost:3000/api/docs
```

## 📁 Files Created

```
lib/swagger.ts                  # Main configuration
app/api/docs/route.ts          # API spec endpoint
app/api-docs/page.tsx          # Swagger UI page
docs/swagger/*.yaml            # Endpoint documentation
docs/API_DOCUMENTATION.md      # Human-readable docs
docs/SWAGGER_SETUP.md          # Detailed setup guide
```

## ✏️ Add New Endpoint

Create/edit YAML in `docs/swagger/`:

```yaml
paths:
  /api/your-endpoint:
    get:
      tags:
        - YourCategory
      summary: What this endpoint does
      responses:
        '200':
          description: Success
```

Restart server to see changes.

## 🔧 Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# View docs
open http://localhost:3000/api-docs
```

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference
- **SWAGGER_SETUP.md** - Detailed setup and maintenance guide
- **QUICK_START_SWAGGER.md** - This file

## 🎉 You're Ready!

Your API documentation is fully set up and ready to use. Visit `/api-docs` to explore!
