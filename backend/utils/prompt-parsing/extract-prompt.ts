/**
 * Extracts the user prompt from various request body formats.
 *
 * Supports:
 * - Direct `prompt` field
 * - AG-UI `messages` array format with role-based filtering
 * - Nested `content.text` objects
 */
export function extractPrompt(body: Record<string, unknown>): string {
    // Direct prompt field
    if (typeof body.prompt === 'string' && body.prompt) {
        return body.prompt;
    }

    // AG-UI messages array format
    if (Array.isArray(body.messages)) {
        const userMessages = body.messages.filter(
            (m: unknown): m is { role: string; content: string | { text?: string } } =>
                typeof m === 'object' && m !== null && (m as { role?: unknown }).role === 'user'
        );

        if (userMessages.length > 0) {
            const lastMessage = userMessages[userMessages.length - 1];
            if (!lastMessage) {
                return '';
            }
            const content = lastMessage.content;

            if (typeof content === 'string') {
                return content;
            }

            if (typeof content === 'object' && content !== null && typeof content.text === 'string') {
                return content.text;
            }
        }
    }

    return '';
}
