export interface ToolResponse<T = any> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}
