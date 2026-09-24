import axios from 'axios';

/**
 * Axios instance for the GoEdu REST API.
 * In dev, Vite proxies /api -> http://localhost:5000. In production the Express
 * server serves both the API and the built frontend from the same origin.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'goedu-token';
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const data = err.response?.data;
    const error = new Error(data?.message || err.message || 'Network error');
    error.status = err.response?.status;
    error.details = data?.details;
    error.data = data;
    return Promise.reject(error);
  }
);

export default api;

/* ---------------- typed helpers ---------------- */
export const CourseApi = {
  list: (params) => api.get('/courses', { params }),
  search: (q) => api.get('/courses/search', { params: { q } }),
  popular: (params) => api.get('/courses/popular', { params }),
  topPicks: (limit = 12) => api.get('/courses/top-picks', { params: { limit } }),
  detail: (slug) => api.get(`/courses/${slug}`),
  related: (slug) => api.get(`/courses/${slug}/related`),
};

export const SiteApi = {
  settings: () => api.get('/site/settings'),
  home: () => api.get('/site/home'),
  categories: (params) => api.get('/categories', { params }),
  testimonials: (page = 'home') => api.get('/site/testimonials', { params: { page } }),
  page: (slug) => api.get(`/site/pages/${slug}`),
  newsletter: (email, website = '') => api.post('/site/newsletter', { email, website }),
  contact: (payload) => api.post('/site/contact', payload),
  applyInstructor: (payload) => api.post('/site/apply-instructor', payload),
};

export const AuthApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.put('/auth/password', payload),
  dashboard: () => api.get('/users/dashboard'),
};

export const BundleApi = {
  list: (params) => api.get('/bundles', { params }),
  detail: (slug) => api.get(`/bundles/${slug}`),
};

export const ArticleApi = {
  list: (params) => api.get('/articles', { params }),
  categories: () => api.get('/articles/categories'),
  trending: () => api.get('/articles/trending'),
  detail: (slug) => api.get(`/articles/${slug}`),
  comment: (slug, body) => api.post(`/articles/${slug}/comments`, { body }),
};

export const InstructorApi = {
  list: (params) => api.get('/instructors', { params }),
  detail: (slug) => api.get(`/instructors/${slug}`),
};

export const MentorshipApi = {
  mentors: (params) => api.get('/mentorship/mentors', { params }),
  categories: () => api.get('/mentorship/categories'),
  detail: (slug) => api.get(`/mentorship/mentors/${slug}`),
  book: (payload) => api.post('/mentorship/bookings', payload),
  myBookings: () => api.get('/mentorship/bookings'),
};

export const SubscriptionApi = {
  packages: () => api.get('/subscription/packages'),
  library: () => api.get('/subscription/library'),
  status: () => api.get('/subscription/status'),
  subscribe: (package_id) => api.post('/subscription/subscribe', { package_id }),
  cancel: () => api.post('/subscription/cancel'),
};

export const CartApi = {
  get: () => api.get('/cart'),
  add: (payload) => api.post('/cart', payload),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

export const WishlistApi = {
  list: () => api.get('/wishlist'),
  toggle: (course_id) => api.post('/wishlist/toggle', { course_id }),
};

export const OrderApi = {
  list: () => api.get('/orders'),
  checkout: (payload) => api.post('/orders/checkout', payload),
  enrollFree: (course_id) => api.post('/orders/enroll-free', { course_id }),
};

export const LearningApi = {
  mine: () => api.get('/learning'),
  player: (slug) => api.get(`/learning/${slug}`),
  progress: (slug, payload) => api.post(`/learning/${slug}/progress`, payload),
};

export const ReviewApi = {
  submit: (payload) => api.post('/reviews', payload),
};

export const ChatApi = {
  status: () => api.get('/chat/status'),
  history: (conversation_id) => api.get('/chat/history', { params: conversation_id ? { conversation_id } : {} }),
  newConversation: () => api.post('/chat/new'),
  send: (message, conversation_id) => api.post('/chat', { message, conversation_id }),
};
