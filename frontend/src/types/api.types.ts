export interface ApiResponse<T = null> {
    success: boolean
    message: string | null
    data: T | null
}

export interface ApiErrorResponse<> {
    success: false
    message: string | null
    data: null
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {}

export interface ApiPaginatedResponse<T>
    extends ApiResponse<{
        items: T[]
        pagination: {
            page: number
            limit: number
            total: number
        }
    }> {}
