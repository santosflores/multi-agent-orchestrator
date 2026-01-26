import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureSession, SessionInfo } from './session';
import type { InMemoryRunner, CreateSessionRequest } from '@google/adk';

// Mock InMemoryRunner
function createMockRunner(appName: string = 'test-app', mockSessionId: string = 'new-session-123'): InMemoryRunner {
    return {
        appName,
        sessionService: {
            createSession: vi.fn().mockResolvedValue({ id: mockSessionId })
        }
    } as unknown as InMemoryRunner;
}

describe('ensureSession', () => {
    describe('when sessionId is NOT provided', () => {
        it('creates a new session using the runner sessionService', async () => {
            const mockRunner = createMockRunner('my-app', 'created-session-id');

            const result = await ensureSession(mockRunner);

            expect(mockRunner.sessionService.createSession).toHaveBeenCalledOnce();
            expect(result.sessionId).toBe('created-session-id');
        });

        it('uses default userId "test_user" when userId is not provided', async () => {
            const mockRunner = createMockRunner();

            const result = await ensureSession(mockRunner);

            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith({
                appName: 'test-app',
                userId: 'test_user'
            });
            expect(result.userId).toBe('test_user');
        });

        it('uses provided userId when creating a new session', async () => {
            const mockRunner = createMockRunner('my-app');

            const result = await ensureSession(mockRunner, undefined, 'custom-user-id');

            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith({
                appName: 'my-app',
                userId: 'custom-user-id'
            });
            expect(result.userId).toBe('custom-user-id');
        });

        it('returns a valid SessionInfo object', async () => {
            const mockRunner = createMockRunner('app', 'fresh-session');

            const result = await ensureSession(mockRunner);

            expect(result).toEqual<SessionInfo>({
                sessionId: 'fresh-session',
                userId: 'test_user'
            });
        });
    });

    describe('when sessionId IS provided', () => {
        it('returns the provided sessionId without creating a new session', async () => {
            const mockRunner = createMockRunner();
            const existingSessionId = 'existing-session-456';

            const result = await ensureSession(mockRunner, existingSessionId);

            expect(mockRunner.sessionService.createSession).not.toHaveBeenCalled();
            expect(result.sessionId).toBe(existingSessionId);
        });

        it('uses default userId "test_user" when userId is not provided', async () => {
            const mockRunner = createMockRunner();

            const result = await ensureSession(mockRunner, 'some-session');

            expect(result.userId).toBe('test_user');
        });

        it('uses provided userId in the returned SessionInfo', async () => {
            const mockRunner = createMockRunner();

            const result = await ensureSession(mockRunner, 'some-session', 'my-custom-user');

            expect(result).toEqual<SessionInfo>({
                sessionId: 'some-session',
                userId: 'my-custom-user'
            });
        });

        it('handles empty string sessionId by treating it as falsy and creating new session', async () => {
            const mockRunner = createMockRunner('app', 'new-generated-session');

            const result = await ensureSession(mockRunner, '');

            expect(mockRunner.sessionService.createSession).toHaveBeenCalled();
            expect(result.sessionId).toBe('new-generated-session');
        });
    });

    describe('edge cases', () => {
        it('handles runner with different appName values', async () => {
            const mockRunner = createMockRunner('production-app');

            await ensureSession(mockRunner);

            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith(
                expect.objectContaining({ appName: 'production-app' })
            );
        });

        it('propagates errors from sessionService.createSession', async () => {
            const mockRunner = createMockRunner();
            (mockRunner.sessionService.createSession as ReturnType<typeof vi.fn>).mockRejectedValue(
                new Error('Session creation failed')
            );

            await expect(ensureSession(mockRunner)).rejects.toThrow('Session creation failed');
        });
    });
});
