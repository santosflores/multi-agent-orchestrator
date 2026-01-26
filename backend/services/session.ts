import { InMemoryRunner, CreateSessionRequest } from '@google/adk';

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'anonymous';
export interface SessionInfo {
    sessionId: string;
    userId: string;
}

/**
 * Ensures a valid session exists, creating one if necessary.
 * Returns the sessionId and userId to use for the request.
 */
export async function ensureSession(
    runner: InMemoryRunner,
    sessionId?: string,
    userId?: string
): Promise<SessionInfo> {
    const resolvedUserId = userId || DEFAULT_USER_ID;

    if (!sessionId) {
        const config: CreateSessionRequest = {
            appName: runner.appName,
            userId: resolvedUserId
        };
        const session = await runner.sessionService.createSession(config);
        return {
            sessionId: session.id,
            userId: resolvedUserId
        };
    }

    return {
        sessionId,
        userId: resolvedUserId
    };
}
