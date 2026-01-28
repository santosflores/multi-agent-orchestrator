import { describe, it, expect } from 'vitest';
import { orchestratorAgent } from './agent';

describe('orchestratorAgent', () => {
    it('has the correct name', () => {
        expect(orchestratorAgent.name).toBe('default');
    });

    it('uses the configured model', () => {
        expect(orchestratorAgent.model).toBe('gemini-2.0-flash-exp');
    });

    it('has no tools configured', () => {
        expect(orchestratorAgent.tools).toHaveLength(0);
    });

    it('has two sub-agents configured', () => {
        expect(orchestratorAgent.subAgents).toHaveLength(2);
    });
});