import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ChatWidget from '../chat/ChatWidget';
import BackToTop from './BackToTop';

export default function Layout() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  // the full-page assistant already is the chat: no floating bubble there (any screen size)
  const isAiMentor = pathname.startsWith('/ai-mentor');
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF6] dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isDashboard && <Footer />}
      <CartDrawer />
      {!isAiMentor && <ChatWidget />}
      <BackToTop />
    </div>
  );
}
