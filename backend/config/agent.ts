const getEnv = (key: string, required = false): string => {
    const value = process.env[key];
    if (required && !value) {
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value || '';
};

export const AGENT_MODEL = getEnv('FLASH_MODEL') || 'gemini-2.0-flash-exp';
export const OPEN_WEATHER_API_KEY = getEnv('OPEN_WEATHER_API_KEY');
export const GEMINI_API_KEY = getEnv('GEMINI_API_KEY', true);
export const GOOGLE_CLOUD_PROJECT = getEnv('GOOGLE_CLOUD_PROJECT');