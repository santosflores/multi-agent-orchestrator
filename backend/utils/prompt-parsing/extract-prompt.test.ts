import { describe, it, expect } from 'vitest';
import { extractPrompt } from './extract-prompt';

describe('extractPrompt', () => {
    describe('direct prompt field', () => {
        it('returns prompt when provided as string', () => {
            const result = extractPrompt({ prompt: 'Hello, world!' });
            expect(result).toBe('Hello, world!');
        });

        it('returns empty string for empty prompt', () => {
            const result = extractPrompt({ prompt: '' });
            expect(result).toBe('');
        });
    });

    describe('AG-UI messages array format', () => {
        it('extracts prompt from last user message with string content', () => {
            const result = extractPrompt({
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'First message' },
                    { role: 'assistant', content: 'Response' },
                    { role: 'user', content: 'Second message' }
                ]
            });
            expect(result).toBe('Second message');
        });

        it('extracts prompt from nested content.text object', () => {
            const result = extractPrompt({
                messages: [
                    { role: 'user', content: { text: 'Nested text content' } }
                ]
            });
            expect(result).toBe('Nested text content');
        });

        it('returns empty string when no user messages exist', () => {
            const result = extractPrompt({
                messages: [
                    { role: 'system', content: 'System prompt' },
                    { role: 'assistant', content: 'Response' }
                ]
            });
            expect(result).toBe('');
        });

        it('returns empty string for empty messages array', () => {
            const result = extractPrompt({ messages: [] });
            expect(result).toBe('');
        });
    });

    describe('edge cases', () => {
        it('returns empty string for empty body', () => {
            const result = extractPrompt({});
            expect(result).toBe('');
        });

        it('prioritizes direct prompt over messages array', () => {
            const result = extractPrompt({
                prompt: 'Direct prompt',
                messages: [{ role: 'user', content: 'Message prompt' }]
            });
            expect(result).toBe('Direct prompt');
        });

        it('handles malformed message objects gracefully', () => {
            const result = extractPrompt({
                messages: [
                    null,
                    undefined,
                    { role: 'user' }, // missing content
                    { role: 'user', content: { notText: 'value' } }
                ]
            });
            expect(result).toBe('');
        });
    });
});
