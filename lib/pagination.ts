// lib/pagination.ts
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

export function createPaginationPipeline(options: PaginationOptions) {
  const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;
  
  return [
    { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
    { $skip: skip },
    { $limit: limit }
  ];
}

export function createPaginationResponse<T>(
  data: T[], 
  totalItems: number, 
  options: PaginationOptions
): PaginationResult<T> {
  const { page, limit } = options;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit
    }
  };
}