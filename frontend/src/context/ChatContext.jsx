import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Controls the floating "AI Mentor" chat widget so any button on the site
 * (hero "Let AI Recommend", CTA section, nav) can open it and pre-fill a prompt.
 */
const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const openChat = useCallback((prompt) => {
    if (typeof prompt === 'string') setDraft(prompt);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ isOpen, openChat, closeChat: () => setOpen(false), toggleChat: () => setOpen((v) => !v), draft, setDraft }),
    [isOpen, openChat, draft]
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
};
