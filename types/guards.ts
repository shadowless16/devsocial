// Type Guards and Type Checking Utilities

import type { User, Post, Comment, Author } from './index'
import type { ApiResponse } from './api'

// ============= Basic Type Guards =============

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

// ============= API Response Type Guards =============

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    isObject(value) &&
    'success' in value &&
    isBoolean(value.success)
  )
}

export function isSuccessResponse<T>(value: unknown): value is ApiResponse<T> & { success: true; data: T } {
  return isApiResponse(value) && value.success === true && 'data' in value
}

export function isErrorResponse(value: unknown): value is ApiResponse & { success: false; error: string } {
  return isApiResponse(value) && value.success === false
}

// ============= Model Type Guards =============

export function isUser(value: unknown): value is User {
  return (
    isObject(value) &&
    'username' in value &&
    'displayName' in value &&
    'avatar' in value &&
    isString(value.username) &&
    isString(value.displayName) &&
    isString(value.avatar)
  )
}

export function isAuthor(value: unknown): value is Author {
  return (
    isObject(value) &&
    'username' in value &&
    'displayName' in value &&
    'avatar' in value &&
    'level' in value &&
    isString(value.username) &&
    isString(value.displayName) &&
    isString(value.avatar) &&
    isNumber(value.level)
  )
}

export function isPost(value: unknown): value is Post {
  return (
    isObject(value) &&
    'id' in value &&
    'content' in value &&
    'author' in value &&
    'createdAt' in value &&
    isString(value.id) &&
    isString(value.content) &&
    isString(value.createdAt)
  )
}

export function isComment(value: unknown): value is Comment {
  return (
    isObject(value) &&
    'id' in value &&
    'content' in value &&
    'author' in value &&
    'createdAt' in value &&
    isString(value.id) &&
    isString(value.content) &&
    isAuthor(value.author) &&
    isString(value.createdAt)
  )
}

// ============= Validation Helpers =============

export function assertIsString(value: unknown, fieldName: string): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(`${fieldName} must be a string`)
  }
}

export function assertIsNumber(value: unknown, fieldName: string): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(`${fieldName} must be a number`)
  }
}

export function assertIsObject(value: unknown, fieldName: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new TypeError(`${fieldName} must be an object`)
  }
}

export function assertIsArray<T>(value: unknown, fieldName: string): asserts value is T[] {
  if (!isArray(value)) {
    throw new TypeError(`${fieldName} must be an array`)
  }
}

// ============= Safe Parsing Utilities =============

export function parseString(value: unknown, defaultValue = ''): string {
  return isString(value) ? value : defaultValue
}

export function parseNumber(value: unknown, defaultValue = 0): number {
  return isNumber(value) ? value : defaultValue
}

export function parseBoolean(value: unknown, defaultValue = false): boolean {
  return isBoolean(value) ? value : defaultValue
}

export function parseArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  return isArray<T>(value) ? value : defaultValue
}

export function parseObject<T extends Record<string, unknown>>(value: unknown, defaultValue: T): T {
  return isObject(value) ? (value as T) : defaultValue
}

// ============= Optional Field Helpers =============

export function getOptionalString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key]
  return isString(value) ? value : undefined
}

export function getOptionalNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const value = obj[key]
  return isNumber(value) ? value : undefined
}

export function getOptionalBoolean(obj: Record<string, unknown>, key: string): boolean | undefined {
  const value = obj[key]
  return isBoolean(value) ? value : undefined
}

export function getOptionalArray<T>(obj: Record<string, unknown>, key: string): T[] | undefined {
  const value = obj[key]
  return isArray<T>(value) ? value : undefined
}

// ============= Required Field Helpers =============

export function getRequiredString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key]
  assertIsString(value, key)
  return value
}

export function getRequiredNumber(obj: Record<string, unknown>, key: string): number {
  const value = obj[key]
  assertIsNumber(value, key)
  return value
}

export function getRequiredBoolean(obj: Record<string, unknown>, key: string): boolean {
  const value = obj[key]
  if (!isBoolean(value)) {
    throw new TypeError(`${key} must be a boolean`)
  }
  return value
}

export function getRequiredArray<T>(obj: Record<string, unknown>, key: string): T[] {
  const value = obj[key]
  assertIsArray<T>(value, key)
  return value
}

// ============= Mongoose ID Validation =============

export function isValidObjectId(value: unknown): boolean {
  if (!isString(value)) return false
  return /^[0-9a-fA-F]{24}$/.test(value)
}

export function assertIsValidObjectId(value: unknown, fieldName: string): asserts value is string {
  if (!isValidObjectId(value)) {
    throw new TypeError(`${fieldName} must be a valid MongoDB ObjectId`)
  }
}
