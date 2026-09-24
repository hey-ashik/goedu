import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import './index.css';

// After a redeploy the old hashed chunks no longer exist; reload once so the
// browser picks up the new index.html instead of showing an empty page.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  try {
    if (sessionStorage.getItem('goedu-chunk-reload') === '1') return;
    sessionStorage.setItem('goedu-chunk-reload', '1');
  } catch { /* ignore */ }
  window.location.reload();
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ChatProvider>
                  <App />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 3500,
                      style: { borderRadius: '12px', background: '#111827', color: '#fff', fontSize: '14px' },
                      success: { iconTheme: { primary: '#F3AC08', secondary: '#fff' } },
                    }}
                  />
                </ChatProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
