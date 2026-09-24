import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ChatApi } from '../../services/api';
import { cn, miniMarkdown } from '../../utils/format';

/**
 * GoEdu AI Assistant - floating chat widget modelled on the goedu.ac chatbot:
 * amber gradient header, pre-chat name/e-mail form (stored in MySQL), session
 * history, expand mode, timestamps and Font Awesome icons everywhere.
 */
export const ASSISTANT_NAME = 'GoEdu AI Assistant';
export const WELCOME_TEXT = 'Hello and welcome to GoEdu! If you need any help, I am here to assist!';
const VISITOR_KEY = 'goedu-chat-visitor';
const GRADIENT = 'bg-gradient-to-br from-[#F5B622] to-[#D09B1D]';

const welcome = () => ({ role: 'assistant', content: WELCOME_TEXT, created_at: new Date().toISOString() });

const readVisitor = () => {
  try { return JSON.parse(localStorage.getItem(VISITOR_KEY) || 'null'); } catch { return null; }
};
const writeVisitor = (v) => {
  try { v ? localStorage.setItem(VISITOR_KEY, JSON.stringify({ name: v.name, email: v.email, phone: v.phone })) : localStorage.removeItem(VISITOR_KEY); } catch { /* ignore */ }
};

export const formatTime = (d) => {
  const date = d ? new Date(d) : new Date();
  return (Number.isNaN(date.getTime()) ? new Date() : date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/** Icon helper: every icon in the chat UI is a Font Awesome glyph. */
export const Fa = ({ icon, className, ...rest }) => <i className={cn(icon, className)} aria-hidden="true" {...rest} />;

/* ------------------------------------------------------------------ */
/* Session hook (shared by the widget and the /ai-mentor page)         */
/* ------------------------------------------------------------------ */
export function useChatSession() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([welcome()]);
  const [conversationId, setConversationId] = useState(null);
  const [visitor, setVisitor] = useState(null);
  const [identified, setIdentified] = useState(false);
  const [ready, setReady] = useState(false);
  const [quota, setQuota] = useState(null);
  const [sending, setSending] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyHistory = (h) => {
    if (h.conversation) {
      setConversationId(h.conversation.id);
      setMessages(h.messages.length ? h.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, created_at: m.created_at })) : [welcome()]);
    } else {
      setConversationId(null);
      setMessages([welcome()]);
    }
  };

  const load = useCallback(async () => {
    try {
      let s = await ChatApi.status();
      // returning visitor on a browser the server does not know yet -> re-link them
      if (!s.identified) {
        const saved = readVisitor();
        if (saved?.email) {
          try { const r = await ChatApi.identify(saved); s = { ...s, identified: true, visitor: r.visitor }; } catch { /* keep the form */ }
        }
      }
      setQuota(s);
      setVisitor(s.visitor || null);
      setIdentified(!!s.identified);
      if (s.visitor) writeVisitor(s.visitor);
      if (s.identified) applyHistory(await ChatApi.history());
    } catch {
      /* offline: keep the welcome message */
    } finally {
      setReady(true);
    }
  }, []);

  // reload when the user logs in/out (quota, identity and history are per user)
  useEffect(() => { load(); }, [load, user?.id]);

  /** Pre-chat form submit: stores name + e-mail in MySQL (chat_visitors). */
  const identify = async (payload) => {
    setError(null);
    const r = await ChatApi.identify(payload);
    setVisitor(r.visitor);
    setIdentified(true);
    writeVisitor(r.visitor);
    try { applyHistory(await ChatApi.history()); } catch { setMessages([welcome()]); }
    return r.visitor;
  };

  const send = async (text) => {
    const message = String(text || '').trim();
    if (!message || sending) return;
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: message, created_at: new Date().toISOString() }]);
    setSending(true);
    try {
      // keep the typing dots on screen for a beat so the reply feels typed, not instant
      const [res] = await Promise.all([ChatApi.send(message, conversationId), new Promise((r) => setTimeout(r, 900))]);
      setConversationId(res.conversation_id);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, created_at: new Date().toISOString() }]);
      setQuota((q) => ({ ...(q || {}), ...res.quota, blocked: res.quota.limit_reached, retry_after_seconds: res.quota.limit_reached ? res.quota.window_minutes * 60 : 0 }));
    } catch (err) {
      if (err.status === 429) {
        setQuota((q) => ({ ...(q || {}), remaining: 0, blocked: true, retry_after_seconds: err.details?.retry_after_seconds || 1800, reset_at: err.details?.reset_at }));
      }
      if (err.details?.code === 'IDENTITY_REQUIRED') { setIdentified(false); writeVisitor(null); }
      setError(err.message);
      setMessages((m) => [...m, { role: 'assistant', content: err.message, isError: true, created_at: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  };

  const reset = async () => {
    try {
      const res = await ChatApi.newConversation();
      setConversationId(res.conversation.id);
    } catch { setConversationId(null); }
    setMessages([welcome()]);
    setError(null);
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try { setSessions((await ChatApi.sessions()).sessions || []); } catch { setSessions([]); } finally { setSessionsLoading(false); }
  };

  const switchSession = async (id) => {
    try { applyHistory(await ChatApi.history(id)); } catch { /* ignore */ }
  };

  return {
    messages, send, sending, quota, error, reset, blocked: !!quota?.blocked,
    visitor, identified, ready, identify,
    conversationId, sessions, sessionsLoading, loadSessions, switchSession,
  };
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
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
    return <span className="text-[11px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-full"><Fa icon="fa-solid fa-hourglass-half" className="mr-1" />Limit reached · resets in {mm}:{ss}</span>;
  }
  return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">{quota.remaining}/{quota.limit} messages left</span>;
}

const Avatar = ({ size = 'sm' }) => (
  <span className={cn('rounded-full bg-gray-100 dark:bg-gray-700 text-[#D09B1D] flex items-center justify-center shrink-0', size === 'sm' ? 'w-6 h-6 text-[12px]' : 'w-12 h-12 text-xl bg-white/20 dark:bg-white/20 text-white')}>
    <Fa icon="fa-brands fa-openai" />
  </span>
);

export function MessageList({ messages, sending, className }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' }); }, [messages, sending]);
  return (
    <div ref={ref} className={cn('overflow-y-auto px-3 py-6 space-y-3 scrollbar-hide', className)}>
      {messages.map((m, i) => (
        <div key={m.id || i} className={cn('flex flex-col w-full cai-msg', m.role === 'user' ? 'items-end' : 'items-start')}>
          {m.role !== 'user' && (
            <div className="flex items-center gap-2 mb-1.5">
              <Avatar />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{ASSISTANT_NAME}</span>
            </div>
          )}
          <div
            className={cn(
              'max-w-[92%] rounded-[18px] px-4 py-2.5 text-[15px] leading-normal shadow-xs chat-md break-words',
              m.role === 'user'
                ? cn(GRADIENT, 'text-white rounded-br-[4px]')
                : m.isError
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-100 dark:border-red-900/40 rounded-bl-[4px]'
                  : 'bg-[#f1f5f9] dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-[4px]'
            )}
            dangerouslySetInnerHTML={{ __html: miniMarkdown(m.content) }}
          />
          <span className={cn('text-[11px] text-gray-400 mt-1 px-1', m.role === 'user' && 'text-right')}>{formatTime(m.created_at)}</span>
        </div>
      ))}
      {sending && (
        <div className="flex flex-col items-start cai-msg">
          <div className="flex items-center gap-2 mb-1.5"><Avatar /><span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{ASSISTANT_NAME}</span></div>
          <div className="bg-[#f3f4f6] dark:bg-gray-800 rounded-[20px] rounded-bl-[4px] px-4 py-3 flex gap-1 items-center">
            <span className="cai-dot" /><span className="cai-dot" /><span className="cai-dot" />
          </div>
        </div>
      )}
    </div>
  );
}

/** Pre-chat form (name + e-mail) - identical flow to goedu.ac; data lands in MySQL. */
export function PreChatForm({ onSubmit, compact }) {
  const saved = readVisitor() || {};
  const [name, setName] = useState(saved.name || '');
  const [email, setEmail] = useState(saved.email || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) { setErr('Please enter a valid e-mail address'); return; }
    setErr('');
    setBusy(true);
    try { await onSubmit({ name: name.trim(), email: email.trim() }); } catch (ex) { setErr(ex.message || 'Could not start the chat'); } finally { setBusy(false); }
  };
  const input = 'w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-[15px] outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-[#F5B622] transition-colors';
  return (
    <form onSubmit={submit} className={cn('flex-1 flex flex-col justify-center px-6', compact ? 'py-6' : 'py-8')}>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">👋 Welcome!</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Please enter your details to start.</p>
      <div className="mb-5">
        <label htmlFor="cai-name-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Name</label>
        <input id="cai-name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={input} />
      </div>
      <div className="mb-5">
        <label htmlFor="cai-email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Email *</label>
        <input id="cai-email-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" className={cn(input, err && 'border-red-500')} />
        {err && <p className="text-xs text-red-600 mt-1.5">{err}</p>}
      </div>
      <button type="submit" disabled={busy} className={cn(GRADIENT, 'w-full py-3.5 rounded-xl text-white font-semibold text-base disabled:opacity-60 flex items-center justify-center gap-2')}>
        {busy ? <Fa icon="fa-solid fa-spinner fa-spin" /> : <Fa icon="fa-solid fa-comments" />} Get Started
      </button>
    </form>
  );
}

export function ChatComposer({ onSend, sending, blocked, draft, setDraft, autoFocus, id = 'cai-input', quota }) {
  const submit = (e) => {
    e.preventDefault();
    if (blocked || !draft.trim()) return;
    onSend(draft);
    setDraft('');
  };
  const disabled = blocked || sending || !draft.trim();
  return (
    <div className="bg-white dark:bg-gray-900">
      {blocked && <div className="px-4 pt-2 flex justify-center"><QuotaBadge quota={quota} /></div>}
      <form onSubmit={submit} className="p-3">
        <div className="flex items-center bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-full pl-5 pr-1.5 py-1.5 focus-within:border-[#cbd5e1] focus-within:ring-[3px] focus-within:ring-amber-400/20 transition-all">
          <input
            id={id}
            autoFocus={autoFocus}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(e); } }}
            placeholder={blocked ? 'Message limit reached. Please wait...' : 'Type your message...'}
            disabled={blocked}
            autoComplete="off"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none py-2.5 text-[15px] text-[#1e293b] dark:text-gray-100 placeholder:text-[#94a3b8] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disabled}
            aria-label="Send"
            className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all', disabled ? 'bg-[#e2e8f0] dark:bg-gray-700 text-[#94a3b8] cursor-not-allowed' : cn(GRADIENT, 'text-white shadow-[0_4px_12px_rgba(245,182,34,0.25)] hover:brightness-95 hover:scale-105'))}
          >
            {sending ? <Fa icon="fa-solid fa-spinner fa-spin" className="text-[16px]" /> : <Fa icon="fa-solid fa-paper-plane" className="text-[16px]" />}
          </button>
        </div>
      </form>
    </div>
  );
}

export function SessionsPanel({ session, onBack, onPick }) {
  useEffect(() => { session.loadSessions(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-10 flex flex-col cai-slide-in">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center" aria-label="Back"><Fa icon="fa-solid fa-chevron-left" className="text-sm" /></button>
        <h3 className="font-semibold text-base text-gray-900 dark:text-white m-0 flex-1">Chat Sessions</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {session.sessionsLoading && <p className="text-center py-5 text-gray-400 text-sm"><Fa icon="fa-solid fa-spinner fa-spin" className="mr-2" />Loading...</p>}
        {!session.sessionsLoading && session.sessions.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No sessions yet</p>}
        {session.sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s.id)}
            className={cn('w-full text-left px-4 py-3 mb-2 rounded-xl border transition-colors', s.id === session.conversationId ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800')}
          >
            <p className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1"><Fa icon="fa-regular fa-message" className="mr-2 text-gray-400" />{s.title || 'New chat'}</p>
            <p className="text-xs text-gray-500 flex gap-3"><span>{s.message_count} messages</span><span>{new Date(s.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating widget                                                     */
/* ------------------------------------------------------------------ */
export default function ChatWidget() {
  const { isOpen, openChat, closeChat, draft, setDraft } = useChat();
  const session = useChatSession();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const menuRef = useRef(null);

  // close the header menu on outside click
  useEffect(() => {
    if (!menuOpen) return undefined;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  // full-screen on phones: lock page scroll while the chat is open
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 480px)').matches;
    if (isOpen && mobile) document.documentElement.classList.add('cai-chat-active');
    else document.documentElement.classList.remove('cai-chat-active');
    if (!isOpen) { setMenuOpen(false); setShowSessions(false); }
    return () => document.documentElement.classList.remove('cai-chat-active');
  }, [isOpen]);

  const toggle = () => (isOpen ? closeChat() : openChat());

  return (
    <div id="cai-widget" className={cn('fixed z-[999] bottom-6 right-6 font-inter', isOpen && 'chat-open')}>
      {/* floating bubble - Font Awesome OpenAI mark, turns into a close X while open */}
      <button
        id="cai-bubble"
        onClick={toggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className={cn('relative w-[60px] h-[60px] rounded-full bg-[#F5B622] hover:bg-[#E0A51C] text-white transition-colors duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B622] focus-visible:ring-offset-2', isOpen && 'max-[480px]:hidden')}
      >
        <span className={cn('absolute inset-0 flex items-center justify-center transition-all duration-300', isOpen ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0')}><Fa icon="fa-brands fa-openai" className="text-[28px]" /></span>
        <span className={cn('absolute inset-0 flex items-center justify-center transition-all duration-300', isOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90')}><Fa icon="fa-solid fa-xmark" className="text-[26px]" /></span>
      </button>

      {/* panel */}
      <div
        id="cai-panel"
        className={cn(
          'absolute right-0 bottom-20 bg-white dark:bg-gray-900 rounded-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex-col overflow-hidden transition-[width,height,opacity,transform] duration-300 max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)]',
          expanded ? 'w-[700px] h-[800px]' : 'w-[420px] h-[680px]',
          isOpen ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-5',
          'max-[480px]:!fixed max-[480px]:!inset-0 max-[480px]:!w-full max-[480px]:!h-[100dvh] max-[480px]:!max-w-none max-[480px]:!max-h-none max-[480px]:!rounded-none max-[480px]:!shadow-none'
        )}
      >
        {/* header */}
        <div className={cn(GRADIENT, 'relative text-white px-5 py-4 min-h-[72px] flex items-center justify-between')}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar size="lg" />
            <p className="font-semibold text-base tracking-[-0.2px] truncate">{ASSISTANT_NAME}</p>
          </div>
          <div className="flex items-center gap-1" ref={menuRef}>
            <button onClick={() => setExpanded((v) => !v)} title={expanded ? 'Collapse' : 'Expand'} aria-label={expanded ? 'Collapse' : 'Expand'} className="hidden sm:flex w-9 h-9 rounded-full hover:bg-white/10 items-center justify-center"><Fa icon={expanded ? 'fa-solid fa-compress' : 'fa-solid fa-expand'} className="text-[17px]" /></button>
            <button onClick={() => setMenuOpen((v) => !v)} title="More" aria-label="More" className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center"><Fa icon="fa-solid fa-ellipsis-vertical" className="text-[18px]" /></button>
            <button onClick={closeChat} title="Close" aria-label="Close" className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center"><Fa icon="fa-solid fa-xmark" className="text-[20px]" /></button>
            {menuOpen && (
              <div className="absolute top-16 right-3 w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-black/5 dark:border-gray-700 p-1 z-[100] cai-pop-in">
                <button onClick={() => { setMenuOpen(false); session.reset(); setShowSessions(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><Fa icon="fa-solid fa-plus" className="text-gray-500 w-4" /> Start New Chat</button>
                <button onClick={() => { setMenuOpen(false); setShowSessions(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><Fa icon="fa-solid fa-clock-rotate-left" className="text-gray-500 w-4" /> All Sessions</button>
                <Link to="/ai-mentor" onClick={() => { setMenuOpen(false); closeChat(); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><Fa icon="fa-solid fa-up-right-from-square" className="text-gray-500 w-4" /> Open full page</Link>
              </div>
            )}
          </div>
        </div>

        {/* body */}
        <div className="relative flex-1 flex flex-col min-h-0">
          {showSessions && session.identified && (
            <SessionsPanel session={session} onBack={() => setShowSessions(false)} onPick={async (id) => { await session.switchSession(id); setShowSessions(false); }} />
          )}
          {!session.ready ? (
            <div className="flex-1 flex items-center justify-center text-gray-400"><Fa icon="fa-solid fa-spinner fa-spin" className="text-2xl" /></div>
          ) : !session.identified ? (
            <PreChatForm onSubmit={session.identify} />
          ) : (
            <>
              <MessageList messages={session.messages} sending={session.sending} className="flex-1 bg-white dark:bg-gray-900" />
              <ChatComposer onSend={session.send} sending={session.sending} blocked={session.blocked} quota={session.quota} draft={draft} setDraft={setDraft} autoFocus={isOpen} />
            </>
          )}
        </div>

        <div className="px-4 pb-4 pt-2 text-center text-[11px] text-[#94a3b8] bg-white dark:bg-gray-900">
          <Link to="/ai-mentor" className="font-medium hover:text-[#D09B1D]"><Fa icon="fa-brands fa-openai" className="mr-1" />Powered by GoEdu AI</Link>
        </div>
      </div>
    </div>
  );
}
