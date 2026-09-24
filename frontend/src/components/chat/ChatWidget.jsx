import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ChatApi } from '../../services/api';
import { cn, miniMarkdown } from '../../utils/format';

const SUGGESTIONS = [
  'Recommend a course for a beginner in AI',
  'Which courses help me become a freelancer?',
  'What do I get with Learner Plus?',
  'I want to improve my English for IELTS',
];

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm **GoEdu AI Mentor**. Tell me your goal, background or interests and I'll recommend the best-fit courses and a learning path for you.",
};

export function useChatSession() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([WELCOME]);
  const [conversationId, setConversationId] = useState(null);
  const [quota, setQuota] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [h, s] = await Promise.all([ChatApi.history(), ChatApi.status()]);
      setQuota(s);
      if (h.conversation) {
        setConversationId(h.conversation.id);
        setMessages(h.messages.length ? h.messages.map((m) => ({ role: m.role, content: m.content })) : [WELCOME]);
      }
    } catch { /* offline */ }
  };

  // reload history when the user logs in/out (quota + history are per user)
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const send = async (text) => {
    const message = String(text || '').trim();
    if (!message || sending) return;
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setSending(true);
    try {
      const res = await ChatApi.send(message, conversationId);
      setConversationId(res.conversation_id);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
      setQuota((q) => ({ ...(q || {}), ...res.quota, blocked: res.quota.limit_reached, retry_after_seconds: res.quota.limit_reached ? res.quota.window_minutes * 60 : 0 }));
    } catch (err) {
      if (err.status === 429) {
        setQuota((q) => ({ ...(q || {}), remaining: 0, blocked: true, retry_after_seconds: err.details?.retry_after_seconds || 1800, reset_at: err.details?.reset_at }));
      }
      setError(err.message);
      setMessages((m) => [...m, { role: 'assistant', content: err.message, isError: true }]);
    } finally {
      setSending(false);
    }
  };

  const reset = async () => {
    try {
      const res = await ChatApi.newConversation();
      setConversationId(res.conversation.id);
    } catch { setConversationId(null); }
    setMessages([WELCOME]);
    setError(null);
  };

  return { messages, send, sending, quota, error, reset, blocked: !!quota?.blocked };
}

export function QuotaBadge({ quota }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!quota?.blocked) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [quota?.blocked]);
  if (!quota) return null;
  if (quota.blocked) {
    const until = quota.reset_at ? new Date(quota.reset_at).getTime() : now + (quota.retry_after_seconds || 0) * 1000;
    const left = Math.max(0, Math.ceil((until - now) / 1000));
    const mm = String(Math.floor(left / 60)).padStart(2, '0');
    const ss = String(left % 60).padStart(2, '0');
    return <span className="text-[11px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-full">Limit reached · resets in {mm}:{ss}</span>;
  }
  return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">{quota.remaining}/{quota.limit} messages left</span>;
}

export function MessageList({ messages, sending, className }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' }); }, [messages, sending]);
  return (
    <div ref={ref} className={cn('overflow-y-auto p-4 space-y-3 scrollbar-hide', className)}>
      {messages.map((m, i) => (
        <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
          {m.role !== 'user' && (
            <span className="w-7 h-7 rounded-full bg-[#F3AC08] text-white flex items-center justify-center shrink-0 mt-1"><Bot size={15} /></span>
          )}
          <div
            className={cn(
              'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed chat-md',
              m.role === 'user'
                ? 'bg-[#111827] text-white rounded-br-md'
                : m.isError
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-100 dark:border-red-900/40'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 shadow-sm rounded-bl-md'
            )}
            dangerouslySetInnerHTML={{ __html: m.role === 'user' ? miniMarkdown(m.content) : miniMarkdown(m.content) }}
          />
        </div>
      ))}
      {sending && (
        <div className="flex gap-2 justify-start">
          <span className="w-7 h-7 rounded-full bg-[#F3AC08] text-white flex items-center justify-center shrink-0 mt-1"><Bot size={15} /></span>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatComposer({ onSend, sending, blocked, draft, setDraft, autoFocus, id = 'cai-input' }) {
  const submit = (e) => {
    e.preventDefault();
    if (blocked) return;
    onSend(draft);
    setDraft('');
  };
  return (
    <form onSubmit={submit} className="flex items-end gap-2 p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <textarea
        id={id}
        autoFocus={autoFocus}
        rows={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}
        placeholder={blocked ? 'Message limit reached. Please wait...' : 'Ask about courses, careers, pricing...'}
        disabled={blocked || sending}
        className="flex-1 resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60 max-h-32"
      />
      <button type="submit" disabled={blocked || sending || !draft.trim()} className="h-10 w-10 rounded-xl bg-[#ED8E22] hover:bg-[#d47c1a] text-white flex items-center justify-center disabled:opacity-50 transition-colors" aria-label="Send">
        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </form>
  );
}

export default function ChatWidget() {
  const { isOpen, openChat, closeChat, draft, setDraft } = useChat();
  const session = useChatSession();

  return (
    <>
      {/* bubble */}
      <button
        id="cai-bubble"
        onClick={() => (isOpen ? closeChat() : openChat())}
        aria-label="Open AI Mentor chat"
        className={cn(
          'fixed bottom-5 right-5 z-[95] h-14 w-14 rounded-full bg-[#ED8E22] text-white shadow-xl shadow-orange-300/50 dark:shadow-none flex items-center justify-center transition-all hover:scale-105 animate-pulse-glow',
          isOpen && 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        <MessageCircle size={26} />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#111827] text-[10px] flex items-center justify-center"><Sparkles size={11} /></span>
      </button>

      {/* panel */}
      <div
        id="cai-panel"
        className={cn(
          'fixed z-[96] bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[400px] h-[100dvh] sm:h-[620px] sm:max-h-[calc(100vh-40px)] bg-[#FFFCF6] dark:bg-gray-900 sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right',
          isOpen ? 'open opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#111827] text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3AC08] flex items-center justify-center"><Bot size={22} /></div>
            <div>
              <p className="font-bold text-sm leading-tight">GoEdu AI Mentor</p>
              <p className="text-[11px] text-gray-300 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online · Course recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={session.reset} className="p-2 rounded-lg hover:bg-white/10" aria-label="New chat" title="Start new chat"><RotateCcw size={16} /></button>
            <button onClick={closeChat} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close chat"><X size={18} /></button>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center justify-between bg-amber-50/70 dark:bg-gray-800/60 border-b border-amber-100 dark:border-gray-800">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">10 messages, then a 30 minute break</span>
          <QuotaBadge quota={session.quota} />
        </div>
        <MessageList messages={session.messages} sending={session.sending} className="flex-1" />
        {session.messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => session.send(s)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700">{s}</button>
            ))}
          </div>
        )}
        <ChatComposer onSend={session.send} sending={session.sending} blocked={session.blocked} draft={draft} setDraft={setDraft} autoFocus={isOpen} />
      </div>
    </>
  );
}
