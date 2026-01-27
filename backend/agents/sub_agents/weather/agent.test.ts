import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../config/agent', () => ({
    AGENT_MODEL: 'gemini-3-flash-preview',
    OPEN_WEATHER_API_KEY: 'test-api-key'
}));

import { weatherAgent, getCurrentWeatherHandler } from './agent';

describe('getCurrentWeatherHandler', () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('returns success status with weather data when API calls succeed', async () => {
        // Mock Geocoding API response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: 37.7749, lon: -122.4194, name: 'San Francisco' }]
        });

        // Mock 2.5 API response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                main: { temp: 22.0 },
                weather: [{ description: 'partly cloudy' }],
                name: 'San Francisco'
            })
        });

        const result = await getCurrentWeatherHandler({ location: 'San Francisco' });

        expect(result.status).toBe('success');
        expect(result.data).toEqual({
            location: 'San Francisco',
            temperature: 22,
            condition: 'partly cloudy'
        });

        // Verify API calls
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenNthCalledWith(1, expect.stringContaining('api.openweathermap.org/geo/1.0/direct'));
        expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringContaining('api.openweathermap.org/data/2.5/weather'));
    });

    it('returns error status when city is not found', async () => {
        // Mock Geocoding API response (empty array)
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        const result = await getCurrentWeatherHandler({ location: 'Unknown City' });

        expect(result.status).toBe('error');
        expect(result.message).toContain('Location not found');
    });

    it('returns error status when Geocoding API fails', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Internal Server Error'
        });

        const result = await getCurrentWeatherHandler({ location: 'City' });

        expect(result.status).toBe('error');
        expect(result.message).toContain('Failed to fetch coordinates');
    });

    it('returns error status when Weather API fails', async () => {
        // Mock Geocoding API response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: 37.7749, lon: -122.4194, name: 'San Francisco' }]
        });

        // Mock Weather API failure
        mockFetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Unauthorized'
        });

        const result = await getCurrentWeatherHandler({ location: 'San Francisco' });

        expect(result.status).toBe('error');
        expect(result.message).toContain('Failed to fetch weather data');
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