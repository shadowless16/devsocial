# 🚨 Strict TypeScript Rules (Zero `any`, Zero `unknown`)

## 1. Always Define API Response Types
```ts
interface DataResponse {
  someProperty: string
}

const response = await apiClient.get<DataResponse>()
const value = response.data.someProperty
```

## 2. Safe Typed Error Handling (No `any`, No `unknown`)
```ts
interface ApiError {
  message: string
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

try {
  // ...
} catch (error: unknown) {
  const errMsg = isApiError(error) ? error.message : 'Unknown error'
}
```

## 3. Always Provide Safe Defaults
```ts
const user: User | null = getUser()
const name = user?.name ?? 'Unknown'
```

## 4. Type Every Function Parameter
```ts
function handleSubmit(data: FormData) {
  // ...
}
```

## 5. Use Proper Event Types
```ts
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
}
```

## 6. Type All React State Variables
```ts
const [data, setData] = useState<User | null>(null)
```

## 7. Correct Async/Await Usage
```ts
const result = await fetch('/api/data')
const data: ApiPayload = await result.json()
```

## 8. Avoid Non-Null Assertion (!)
```ts
const element = document.getElementById('id')
if (element) {
  // safe usage
}
```

## 9. Type Component Props
```ts
interface MyComponentProps {
  title: string
  onClick: () => void
}

function MyComponent({ title, onClick }: MyComponentProps) {
  // ...
}
```

## 10. Safe Array Operations
```ts
const first = items.at(0)?.name ?? 'No name'
```

---

# 🔧 Quick Fixes (Strict Mode)

### ❗ "Property does not exist"
```ts
// Solution: Type your object
interface Obj {
  property: string
}
const value = (obj as Obj).property
```

### ❗ "Object is possibly undefined"
```ts
const value = obj?.property ?? 'default'
```

### ❗ "Argument not assignable"
```ts
// Fix: cast to specific type, not any/unknown
const input = value as ExpectedType
```

### ❗ "Cannot find name"
```ts
import type { SomeType } from './types'
```

---

# 📋 Pre-Build Checklist (Next.js 15 Strict)

- [ ] All API calls use generics (`apiClient.get<Type>()`)
- [ ] All functions have typed parameters
- [ ] All state values typed (`useState<Type>()`)
- [ ] All errors handled through type guards
- [ ] Props interfaces defined for every component
- [ ] No `any`, no `unknown` anywhere in code
- [ ] No non-null assertions (`!`)
- [ ] Async operations fully awaited
- [ ] Arrays and objects safely accessed with `?.` and `??`

---

# 🚀 Build Success Pattern (Enterprise Safe)

```ts
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface UserData {
  id: string
  username: string
  email: string
}

export async function handleApiCall() {
  try {
    const response = await apiClient.request<ApiResponse<UserData>>('/api/users')

    if (response.success && response.data) {
      const user = response.data
      // safe usage
    }
  } catch (error: unknown) {
    const errorMsg =
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string'
        ? (error as { message: string }).message
        : 'Unknown error'

    console.error(errorMsg)
  }
}
```

---

# ⚙️ Next.js 15 Param Typing Requirement
```ts
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // ...
}
```

---

# 🎯 Final Principles

- Type **everything**
- No `any`
- No `unknown`
- Always use interfaces
- Always validate errors
- Always default with `??`
- Build frequently (`pnpm build`)