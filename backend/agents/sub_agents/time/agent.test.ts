import { describe, it, expect } from 'vitest';
import { getCurrentTimeHandler, currentTimeAgent } from './agent';

describe('getCurrentTimeHandler', () => {
    it('should return the current time and resolve timezone for Monterrey MX', () => {
        const location = 'Monterrey MX';
        const result = getCurrentTimeHandler({ location });

        expect(result.status).toBe('success');
        expect(result.data.location).toBe(location);
        expect(result.data.timezone).toBe('America/Monterrey');
        expect(result.data.time).toBeDefined();

        // Match the basic format of time (e.g., HH:MM:SS or HH:MM AM/PM)
        expect(result.data.time).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should return the current time and resolve timezone for Tokyo', () => {
        const location = 'Tokyo';
        const result = getCurrentTimeHandler({ location });

        expect(result.status).toBe('success');
        expect(result.data.location).toBe(location);
        expect(result.data.timezone).toBe('Asia/Tokyo');
        expect(result.data.time).toBeDefined();
    });

    it('should return an error for an unknown location', () => {
        const location = 'This is not a real city 123456';
        const result = getCurrentTimeHandler({ location });

        expect(result.status).toBe('error');
        expect(result.message).toContain('Could not resolve timezone');
    });
});

describe('timeAgent', () => {
    it('has the correct name', () => {
        expect(currentTimeAgent.name).toBe('currentTime');
    });

    it('uses the correct model from config', () => {
        // We don't hardcode the model here as it comes from config
        expect(currentTimeAgent.model).toBeDefined();
    });

    it('has one tool configured', () => {
        expect(currentTimeAgent.tools).toHaveLength(1);
    });
});

