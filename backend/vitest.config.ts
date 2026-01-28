import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.ts'],
        env: {
            GEMINI_API_KEY: 'dummy-key-for-tests',
            GOOGLE_CLOUD_PROJECT: 'test-project'
        }
    },
});
