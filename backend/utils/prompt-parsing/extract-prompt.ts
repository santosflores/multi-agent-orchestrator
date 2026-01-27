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
        for (let i = body.messages.length - 1; i >= 0; i--) {
            const m = body.messages[i];
            if (typeof m === 'object' && m !== null && (m as { role?: unknown }).role === 'user') {
                const content = (m as { content?: unknown }).content;

                if (typeof content === 'string') {
                    return content;
                }

                if (typeof content === 'object' && content !== null && typeof (content as { text?: unknown }).text === 'string') {
                    return (content as { text: string }).text;
                }

                return '';
            }
        }
    }

    return '';
}
