import { InMemoryRunner, CreateSessionRequest, Session } from '@google/adk';

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'anonymous';

/**
 * Ensures a valid session exists, creating one if necessary.
 * Returns the sessionId and userId to use for the request.
 */
export async function ensureSession(
    runner: InMemoryRunner,
    sessionId?: string,
    userId?: string
): Promise<Session> {
    const resolvedUserId = userId || DEFAULT_USER_ID;

    // If sessionId provided, check if it exists
    if (sessionId) {
        try {
            const existing = await runner.sessionService.getSession({
                appName: runner.appName,
                userId: resolvedUserId,
                sessionId
            });
            if (existing) {
                console.log(`[Session] Found existing session: ${sessionId} with state:`, JSON.stringify(existing.state));
                return existing;
            }
        } catch {
            // Session doesn't exist, will create below
        }
    }

    // Create new session (with provided sessionId if available)
    const config: CreateSessionRequest = {
        appName: runner.appName,
        userId: resolvedUserId,
        ...(sessionId && { sessionId }) // Only include if defined (exactOptionalPropertyTypes compat)
    };
    const session = await runner.sessionService.createSession(config);
    return session;
}
