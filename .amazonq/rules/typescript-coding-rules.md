# TypeScript Coding Rules for Build Success

## 🚨 Critical Rules to Prevent Build Failures

### 1. **Always Type API Responses**
```typescript
// ❌ BAD - Will cause build errors
const response = await apiClient.getData()
const value = response.data.someProperty // Error: 'data' is unknown

// ✅ GOOD - Type the response
const response = await apiClient.getData()
const data = response.data as { someProperty: string }
const value = data.someProperty
```

### 2. **Handle Unknown Types Safely**
```typescript
// ❌ BAD
const error = response.error.message // Error: Property 'error' does not exist

// ✅ GOOD
const error = (response as any).error?.message || 'Unknown error'
```

### 3. **Always Provide Default Values**
```typescript
// ❌ BAD
const user = getUser()
const name = user.name // Might be undefined

// ✅ GOOD
const user = getUser()
const name = user?.name || 'Unknown'
```

### 4. **Type Function Parameters**
```typescript
// ❌ BAD
function handleSubmit(data) { // Parameter 'data' implicitly has 'any' type

// ✅ GOOD
function handleSubmit(data: FormData) {
```

### 5. **Use Proper Event Types**
```typescript
// ❌ BAD
const handleClick = (e) => { // Parameter 'e' implicitly has 'any' type

// ✅ GOOD
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
```

### 6. **Type State Variables**
```typescript
// ❌ BAD
const [data, setData] = useState() // No type specified

// ✅ GOOD
const [data, setData] = useState<User | null>(null)
```

### 7. **Handle Async/Await Properly**
```typescript
// ❌ BAD
const result = await fetch('/api/data')
const data = result.json() // Missing await

// ✅ GOOD
const result = await fetch('/api/data')
const data = await result.json()
```

### 8. **Use Non-Null Assertion Carefully**
```typescript
// ❌ BAD - Only use when 100% sure
const element = document.getElementById('id')!

// ✅ GOOD - Check first
const element = document.getElementById('id')
if (element) {
  // Use element safely
}
```

### 9. **Type Component Props**
```typescript
// ❌ BAD
function MyComponent({ title, onClick }) {

// ✅ GOOD
interface MyComponentProps {
  title: string
  onClick: () => void
}
function MyComponent({ title, onClick }: MyComponentProps) {
```

### 10. **Handle Array Operations Safely**
```typescript
// ❌ BAD
const first = items[0].name // Might be undefined

// ✅ GOOD
const first = items[0]?.name || 'No name'
```

## 🔧 Quick Fixes for Common Errors

### "Property does not exist on type"
```typescript
// Use type assertion
const value = (obj as any).property
// Or optional chaining
const value = obj?.property
```

### "Object is possibly undefined"
```typescript
// Use optional chaining and nullish coalescing
const value = obj?.property ?? 'default'
```

### "Argument of type 'unknown' is not assignable"
```typescript
// Type the unknown value
const typedValue = value as ExpectedType
```

### "Cannot find name"
```typescript
// Import the type/interface
import type { SomeType } from './types'
```

## 📋 Pre-Build Checklist

Before running `pnpm build`, ensure:

- [ ] All API responses are typed with `as Type` or proper interfaces
- [ ] All function parameters have types
- [ ] All state variables have initial types
- [ ] All event handlers have proper event types
- [ ] No `any` types without explicit intention
- [ ] All async operations are properly awaited
- [ ] All optional properties use `?.` operator
- [ ] All imports are properly typed

## 🚀 Build Success Pattern

```typescript
// This pattern prevents most build errors:

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

const handleApiCall = async () => {
  try {
    const response = await apiClient.request<ApiResponse<UserData>>('/api/users')
    
    if (response.success && response.data) {
      const userData = response.data as UserData
      // Use userData safely
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error'
    console.error(errorMessage)
  }
}
```

## 🎯 Remember

- **Type everything explicitly**
- **Use `as Type` for API responses**
- **Always handle undefined/null cases**
- **Test build frequently with `pnpm build`**
- **When in doubt, use `any` temporarily then fix later**