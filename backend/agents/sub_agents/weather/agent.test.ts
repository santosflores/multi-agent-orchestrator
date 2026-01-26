import { describe, it, expect } from 'vitest';
import { weatherAgent, getCurrentWeatherHandler } from './agent';

describe('getCurrentWeatherHandler', () => {
    it('returns success status with the city name', () => {
        const result = getCurrentWeatherHandler({ location: 'San Francisco' });

        expect(result.status).toBe('success');
        expect(result.data.location).toBe('San Francisco');
        expect(result.data.temperature).toBe(22);
    });
});

describe('weatherAgent', () => {
    it('has the correct name', () => {
        expect(weatherAgent.name).toBe('weather');
    });

    it('uses gemini-3-flash-preview model', () => {
        expect(weatherAgent.model).toBe('gemini-3-flash-preview');
    });

    it('has one tool configured', () => {
        expect(weatherAgent.tools).toHaveLength(1);
    });
});