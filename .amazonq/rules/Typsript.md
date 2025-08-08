# TypeScript Rules & Project Guidelines

This document defines the TypeScript configuration rules and practices for this Next.js project.  
AI agents and contributors must follow these rules when writing or modifying TypeScript code.

---

## tsconfig.json – Practical Defaults
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "strict": false
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
Coding Guidelines
Avoid overly strict TypeScript rules unless necessary for production safety.

Prefer interface for object shapes and type for unions.

Allow any in early prototyping, but replace with real types before production.

Use as const for fixed value sets.

Always keep next-env.d.ts updated.

Never commit code with TypeScript compile errors.

AI Agent Instructions
Always generate TypeScript that respects the tsconfig.json above.

When suggesting code, prefer simplicity over excessive type complexity.

Ensure imports match file casing exactly (case-sensitive paths).

Use relative imports for local files, absolute imports only for node_modules.

Don’t enforce rules that are not listed here.