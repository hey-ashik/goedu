import { useChat } from '../../context/ChatContext';

export default function AiCtaSection() {
  const { openChat } = useChat();
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-[url('/images/home/cta-bg.svg')] bg-cover bg-center bg-[#2a1d0d]">
          <div className="relative z-10 px-8 py-20 sm:px-12 sm:py-28 lg:py-36 text-center">
            <div className="flex justify-center mb-8">
              <img className="w-[99px]" src="/images/home/ai-icon.png" alt="" width={198} height={198} />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-white mb-6 leading-tight">Not Sure Where to Begin? Let GoEdu AI Guide You.</h2>
            <div className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
              <p>GoEdu’s smart recommendation system analyzes your goals, background, and interests to suggest the most relevant courses for you. Save time, avoid confusion, and start with a clear, personalized learning path.</p>
            </div>
            <button
              onClick={() => openChat('Help me find my best-fit course. Ask me about my goals and background.')}
              className="inline-block px-10 py-3.5 bg-[#594226]/40 border border-[#BC995D] text-white rounded-full text-base font-medium transition-all hover:scale-105"
              style={{ boxShadow: '0px 0px 70px 0px rgba(241, 220, 196, 0.8)' }}
            >
              Find My Best‑fit Course with AI
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
