import { z } from "zod"

// Auth validation schemas
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  birthMonth: z.number().min(1).max(12),
  birthDay: z.number().min(1).max(31),
  // Accept any string for affiliation to accommodate the large dynamic list
  affiliation: z.string().max(100).optional(),
})

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
})

// Post validation schemas
export const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  isAnonymous: z.boolean().optional().default(false),
  imageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(50)).max(5, "Maximum 5 tags allowed").optional().default([]),
})

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required").max(500, "Content must be less than 500 characters"),
})

// User profile validation schemas
export const updateProfileSchema = z.object({
  bio: z.string().max(250, "Bio must be less than 250 characters").optional(),
  // Allow any string for affiliation here as well
  affiliation: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
})

// Report validation schemas
export const createReportSchema = z.object({
  reportedItemType: z.enum(["post", "comment"]),
  reportedItemId: z.string().min(1, "Reported item ID is required"),
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters"),
})
