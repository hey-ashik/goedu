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
  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-24 pb-10">
      <Seo title="AI Assistant" description="Get personalised course recommendations and a learning path from the GoEdu AI Assistant." />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-9rem)] min-h-[520px]">
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-[#F5B622] to-[#D09B1D] text-white">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-xl"><Fa icon="fa-brands fa-openai" /></span>
              <div>
                <p className="font-semibold leading-tight">{ASSISTANT_NAME}</p>
                <p className="text-[11px] text-white/80 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> {session.visitor?.name ? `Chatting with ${session.visitor.name}` : 'Personalised course guidance'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <QuotaBadge quota={session.quota} />
              {session.identified && (
                <>
                  <button onClick={() => setShowSessions(true)} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" title="All sessions" aria-label="All sessions"><Fa icon="fa-solid fa-clock-rotate-left" /></button>
                  <button onClick={session.reset} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" title="Start new chat" aria-label="Start new chat"><Fa icon="fa-solid fa-plus" /></button>
                </>
              )}
            </div>
          </div>
          <div className="relative flex-1 flex flex-col min-h-0">
            {showSessions && <SessionsPanel session={session} onBack={() => setShowSessions(false)} onPick={async (id) => { await session.switchSession(id); setShowSessions(false); }} />}
            {!session.ready ? (
              <div className="flex-1 flex items-center justify-center text-gray-400"><Fa icon="fa-solid fa-spinner fa-spin" className="text-2xl" /></div>
            ) : !session.identified ? (
              <PreChatForm onSubmit={session.identify} />
            ) : (
              <>
                <MessageList messages={session.messages} sending={session.sending} className="flex-1 bg-white dark:bg-gray-900" />
                <ChatComposer onSend={session.send} sending={session.sending} blocked={session.blocked} quota={session.quota} draft={draft} setDraft={setDraft} id="ai-mentor-input" />
              </>
            )}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 mb-3"><Fa icon="fa-solid fa-wand-magic-sparkles" className="text-[#F3AC08]" /> Try asking</h2>
            <div className="space-y-2">
              {PROMPTS.map((p) => <button key={p} onClick={() => session.send(p)} disabled={!session.identified || session.blocked || session.sending} className="w-full text-left text-sm px-4 py-3 rounded-xl bg-amber-50/70 dark:bg-gray-900 border border-amber-100 dark:border-gray-700 hover:border-[#F3AC08] text-gray-700 dark:text-gray-200 disabled:opacity-50">{p}</button>)}
            </div>
          </div>
          <div className="bg-[#111827] text-white rounded-3xl p-6 text-sm space-y-2">
            <p className="font-bold flex items-center gap-2"><Fa icon="fa-brands fa-openai" /> How it works</p>
            <p className="text-gray-300">The GoEdu AI Assistant knows the GoEdu catalogue and recommends real courses with links. Each learner gets <strong className="text-white">10 messages</strong>, then a <strong className="text-white">30 minute</strong> break before the next batch.</p>
            <p className="text-gray-400 text-xs">Recommendations are suggestions - always check the course page for details, price and curriculum.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
