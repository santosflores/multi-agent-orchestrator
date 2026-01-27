import { describe, it, expect, vi } from 'vitest';
import { ensureSession } from './session';
import type { InMemoryRunner, Session } from '@google/adk';

// Mock InMemoryRunner
function createMockRunner(appName: string = 'test-app', mockSessionId: string = 'new-session-123', mockUserId: string = 'anonymous') {
    return {
        appName,
        sessionService: {
            createSession: vi.fn().mockResolvedValue({ id: mockSessionId, userId: mockUserId }),
            getSession: vi.fn().mockResolvedValue(null) // Default to not found
        }
    } as unknown as InMemoryRunner;
}

describe('ensureSession', () => {
    describe('when sessionId is NOT provided', () => {
        it('creates a new session using the runner sessionService', async () => {
            const mockRunner = createMockRunner('my-app', 'created-session-id');

            const result = await ensureSession(mockRunner);

            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    appName: 'my-app',
                    userId: 'anonymous'
                })
            );
            // Verify sessionId is NOT in the call args (due to exactOptionalPropertyTypes logic)
            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith(
                expect.not.objectContaining({ sessionId: expect.anything() })
            );

            expect(result?.id).toBe('created-session-id');
        });

        it('uses default userId "anonymous" when userId is not provided', async () => {
            const mockRunner = createMockRunner();
            const result = await ensureSession(mockRunner);

            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'anonymous'
                })
            );
            expect(result?.userId).toBe('anonymous');
        });

        it('uses provided userId when creating a new session', async () => {
            const mockRunner = createMockRunner('my-app', 'created-session-id', 'custom-user-id');

            const result = await ensureSession(mockRunner, undefined, 'custom-user-id');

            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'custom-user-id'
                })
            );
            expect(result?.userId).toBe('custom-user-id');
        });
    });

    describe('when sessionId IS provided', () => {
        it('returns existing session if found', async () => {
            const mockRunner = createMockRunner();
            const existingSessionId = 'existing-session-456';

            // Mock getSession success
            vi.mocked(mockRunner.sessionService.getSession).mockResolvedValue({ id: existingSessionId } as Session);

            const result = await ensureSession(mockRunner, existingSessionId);

            expect(mockRunner.sessionService.getSession).toHaveBeenCalledWith({
                appName: 'test-app',
                userId: 'anonymous',
                sessionId: existingSessionId
            });
            expect(mockRunner.sessionService.createSession).not.toHaveBeenCalled();
            expect(result?.id).toBe(existingSessionId);
        });

        it('creates new session with provided ID if session lookup fails (throws)', async () => {
            const mockRunner = createMockRunner('app', 'new-created-id');
            const targetSessionId = 'target-session-id';

            // Mock getSession throwing error
            vi.mocked(mockRunner.sessionService.getSession).mockRejectedValue(new Error('Session not found'));

            const result = await ensureSession(mockRunner, targetSessionId);

            expect(mockRunner.sessionService.getSession).toHaveBeenCalled();
            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith({
                appName: 'app',
                userId: 'anonymous',
                sessionId: targetSessionId
            });
            // Result comes from createSession return value
            expect(result?.id).toBe('new-created-id');
        });

        it('creates new session with provided ID if session lookup returns null', async () => {
            const mockRunner = createMockRunner('app', 'new-created-id');
            const targetSessionId = 'target-session-id';

            // Mock getSession returning null (not found)
            vi.mocked(mockRunner.sessionService.getSession).mockResolvedValue(undefined);

            const result = await ensureSession(mockRunner, targetSessionId);

            expect(mockRunner.sessionService.getSession).toHaveBeenCalled();
            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith({
                appName: 'app',
                userId: 'anonymous',
                sessionId: targetSessionId
            });
            expect(result?.id).toBe('new-created-id');
        });

        it('uses provided userId when checking/creating session', async () => {
            const mockRunner = createMockRunner();
            const sessionId = 's-1';
            const userId = 'u-1';

            // Mock not found
            vi.mocked(mockRunner.sessionService.getSession).mockResolvedValue(undefined);

            await ensureSession(mockRunner, sessionId, userId);

            expect(mockRunner.sessionService.getSession).toHaveBeenCalledWith(
                expect.objectContaining({ userId })
            );
            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith(
                expect.objectContaining({ userId })
            );
        });
    });

    describe('edge cases', () => {
        it('handles empty string sessionId by treating it as falsy (creates new random session)', async () => {
            const mockRunner = createMockRunner('app', 'random-session-id');

            const result = await ensureSession(mockRunner, '');

            // Empty string defaults to "not provided" logic
            expect(mockRunner.sessionService.getSession).not.toHaveBeenCalled();
            expect(mockRunner.sessionService.createSession).toHaveBeenCalled();
            expect(mockRunner.sessionService.createSession).toHaveBeenCalledWith(
                expect.not.objectContaining({ id: expect.anything() })
            );
            expect(result?.id).toBe('random-session-id');
        });
    });
});
