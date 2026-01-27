export interface ToolResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

export interface AgentState {

    // Metadata
    current_date?: string;
}