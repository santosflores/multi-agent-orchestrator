import { describe, it, expect } from 'vitest';
import { getCurrentTimeHandler, currentTimeAgent } from './agent';

describe('getCurrentTimeHandler', () => {
    it('should return the current time in the given location', () => {
        const location = 'Monterrey MX';
        const result = getCurrentTimeHandler({ location });
        expect(result).toContain(location);
        expect(result).toContain('The current time in');
    });
});

describe('timeAgent', () => {
    it('has the correct name', () => {
        expect(currentTimeAgent.name).toBe('currentTime');
    });

    it('uses gemini-3-flash-preview model', () => {
        expect(currentTimeAgent.model).toBe('gemini-3-flash-preview');
    });

    it('has one tool configured', () => {
        expect(currentTimeAgent.tools).toHaveLength(1);
    });
});
