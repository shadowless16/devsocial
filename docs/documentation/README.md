# DevSocial Documentation Hub

Welcome to the comprehensive documentation for DevSocial - a gamified social media platform for developers.

## 📚 Documentation Structure

### Core Documentation
- **[API Documentation](./api-documentation.md)** - Complete API reference with endpoints, request/response examples
- **[User Guides](./user-guides.md)** - Step-by-step guides for end users
- **[Developer Guides](./developer-guides.md)** - Technical implementation details and architecture
- **[Configuration Guides](./configuration-guides.md)** - Environment setup and deployment instructions
- **[Component Documentation](./component-documentation.md)** - UI component usage and props reference
- **[Contributing Guidelines](./contributing-guidelines.md)** - How to contribute to the project

### Project Information
- **[Project Structure](./project-structure.md)** - Complete folder structure and organization
- **[README Updates](./readme-updates.md)** - Enhanced project overview and setup instructions

## 🚀 Quick Start

1. **New Users**: Start with [User Guides](./user-guides.md)
2. **Developers**: Check [Developer Guides](./developer-guides.md) and [API Documentation](./api-documentation.md)
3. **Contributors**: Read [Contributing Guidelines](./contributing-guidelines.md)
4. **Deployment**: Follow [Configuration Guides](./configuration-guides.md)

## 📁 Current Project Structure

```
devsocial-frontend/
├── app/                          # Next.js 14 App Directory
│   ├── (authenticated)/          # Protected routes
│   ├── api/                     # API routes
│   └── auth/                    # Authentication pages
├── components/                   # Reusable components
├── contexts/                     # React contexts
├── docs/                        # Documentation files
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities and configs
├── models/                      # Mongoose schemas
├── utils/                       # Utility functions
└── types/                       # TypeScript types
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS + shadcn/ui

---

*Last updated: $(date)*