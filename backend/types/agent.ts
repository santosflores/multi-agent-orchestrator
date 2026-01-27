export interface ToolResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

export interface AgentState {
    location?: string;
    current_date?: string;
}

export const SHARED_STATE_KEYS = ['location', 'current_date'] as const;