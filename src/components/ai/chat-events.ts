// Tiny event bridge so any component can open the floating AI assistant
// (mounted once in the public layout) without shared React state.

export const OPEN_CHAT_EVENT = 'rentnest:open-chat';

export interface OpenChatDetail {
    /** Optional message to send as soon as the assistant opens. */
    prompt?: string;
}

export function openChatAssistant(prompt?: string) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail: { prompt } }));
}
