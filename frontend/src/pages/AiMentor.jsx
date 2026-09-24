import { useState } from 'react';
import Seo from '../components/common/Seo';
import { ASSISTANT_NAME, ChatComposer, Fa, MessageList, PreChatForm, QuotaBadge, SessionsPanel, useChatSession } from '../components/chat/ChatWidget';

const PROMPTS = [
  'I am a fresh graduate. Which courses will help me get my first job?',
  'Build me a 3-month learning path for digital marketing',
  'What is the difference between buying courses and Learner Plus?',
  'Recommend free courses to improve my communication skills',
  'I want to become a freelancer - where should I start?',
  'Which AI courses are good for a non-technical person?',
];

export default function AiMentor() {
  const session = useChatSession();
  const [draft, setDraft] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const subtitle = session.visitor?.name ? `Chatting with ${session.visitor.name}` : 'Personalised course guidance';
  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-[92px] sm:pt-24 pb-6 sm:pb-10">
      <Seo title="AI Assistant" description="Get personalised course recommendations and a learning path from the GoEdu AI Assistant." />
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* ---------- chat card ---------- */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-9rem)] min-h-[440px] lg:min-h-[520px]">
          <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-br from-[#F5B622] to-[#D09B1D] text-white">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="h-9 w-9 sm:h-12 sm:w-12 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-base sm:text-xl"><Fa icon="fa-brands fa-openai" /></span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight text-sm sm:text-base truncate">{ASSISTANT_NAME}</p>
                <p className="text-[11px] text-white/80 flex items-center gap-1 truncate"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300 animate-pulse" /> <span className="truncate">{subtitle}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="hidden md:inline-flex"><QuotaBadge quota={session.quota} /></span>
              {session.identified && (
                <>
                  <button onClick={() => setShowSessions(true)} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" title="All sessions" aria-label="All sessions"><Fa icon="fa-solid fa-clock-rotate-left" /></button>
                  <button onClick={session.reset} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" title="Start new chat" aria-label="Start new chat"><Fa icon="fa-solid fa-plus" /></button>
                </>
              )}
            </div>
          </div>
          {/* quota on small screens sits under the header instead of squeezing the title */}
          {session.quota && (
            <div className="md:hidden flex justify-end px-3 py-1.5 bg-amber-50/70 dark:bg-gray-900/60 border-b border-amber-100 dark:border-gray-700"><QuotaBadge quota={session.quota} /></div>
          )}
          <div className="relative flex-1 flex flex-col min-h-0">
            {showSessions && <SessionsPanel session={session} onBack={() => setShowSessions(false)} onPick={async (id) => { await session.switchSession(id); setShowSessions(false); }} />}
            {!session.ready ? (
              <div className="flex-1 flex items-center justify-center text-gray-400"><Fa icon="fa-solid fa-spinner fa-spin" className="text-2xl" /></div>
            ) : !session.identified ? (
              <PreChatForm onSubmit={session.identify} compact />
            ) : (
              <>
                <MessageList messages={session.messages} sending={session.sending} className="flex-1 bg-white dark:bg-gray-900" />
                <ChatComposer onSend={session.send} sending={session.sending} blocked={session.blocked} quota={session.quota} draft={draft} setDraft={setDraft} id="ai-mentor-input" />
              </>
            )}
          </div>
        </div>

        {/* ---------- sidebar (stacks under the chat on phones and tablets) ---------- */}
        <aside className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 mb-3"><Fa icon="fa-solid fa-wand-magic-sparkles" className="text-[#F3AC08]" /> Try asking</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { session.send(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={!session.identified || session.blocked || session.sending}
                  className="w-full text-left text-sm px-4 py-3 rounded-xl bg-amber-50/70 dark:bg-gray-900 border border-amber-100 dark:border-gray-700 hover:border-[#F3AC08] text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#111827] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-sm space-y-2">
            <p className="font-bold flex items-center gap-2"><Fa icon="fa-brands fa-openai" /> How it works</p>
            <p className="text-gray-300">The GoEdu AI Assistant knows the GoEdu catalogue and recommends real courses with links. Each learner gets <strong className="text-white">10 messages</strong>, then a <strong className="text-white">30 minute</strong> break before the next batch.</p>
            <p className="text-gray-400 text-xs">Recommendations are suggestions - always check the course page for details, price and curriculum.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
