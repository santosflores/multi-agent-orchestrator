import { describe, it, expect } from 'vitest';
import { orchestratorAgent } from './agent';

describe('orchestratorAgent', () => {
    it('has the correct name', () => {
        expect(orchestratorAgent.name).toBe('orchestrator');
    });

    it('uses gemini-3-flash-preview model', () => {
        expect(orchestratorAgent.model).toBe('gemini-3-flash-preview');
    });

    it('has no tools configured', () => {
        expect(orchestratorAgent.tools).toHaveLength(0);
    });

    it('has two sub-agents configured', () => {
        expect(orchestratorAgent.subAgents).toHaveLength(2);
    });
});