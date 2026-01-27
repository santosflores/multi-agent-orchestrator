import { z } from 'zod';

export interface ToolResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

export const AgentStateSchema = z.object({
    location: z.string().optional(),
    current_date: z.string().optional(),
    temperature: z.number().optional(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

export const SHARED_STATE_KEYS = Object.keys(AgentStateSchema.shape) as (keyof AgentState)[];