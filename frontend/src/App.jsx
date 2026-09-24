import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import PageLoader from './components/common/PageLoader';

const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Bundles = lazy(() => import('./pages/Bundles'));
const BundleDetail = lazy(() => import('./pages/BundleDetail'));
const Mentorship = lazy(() => import('./pages/Mentorship'));
const MentorDetail = lazy(() => import('./pages/MentorDetail'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const About = lazy(() => import('./pages/About'));
const Authentication = lazy(() => import('./pages/Authentication'));
const AiMentor = lazy(() => import('./pages/AiMentor'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const InstructorProfile = lazy(() => import('./pages/InstructorProfile'));
const BecomeInstructor = lazy(() => import('./pages/BecomeInstructor'));
const Contact = lazy(() => import('./pages/Contact'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));

const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const MyLearning = lazy(() => import('./pages/dashboard/MyLearning'));
const CoursePlayer = lazy(() => import('./pages/dashboard/CoursePlayer'));
const Orders = lazy(() => import('./pages/dashboard/Orders'));
const Wishlist = lazy(() => import('./pages/dashboard/Wishlist'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Bookings = lazy(() => import('./pages/dashboard/Bookings'));
const SubscriptionResources = lazy(() => import('./pages/dashboard/SubscriptionResources'));
const VideoLibrary = lazy(() => import('./pages/dashboard/VideoLibrary'));

/** goedu.ac serves localized urls (/en/..., /bn/...) - strip the prefix. */
function LocaleRedirect() {
  const { pathname, search } = useLocation();
  const stripped = pathname.replace(/^\/(en|bn)(\/|$)/, '/');
  return <Navigate to={(stripped || '/') + search} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/en/*" element={<LocaleRedirect />} />
          <Route path="/bn/*" element={<LocaleRedirect />} />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:slug" element={<CourseDetail />} />
            <Route path="bundles" element={<Bundles />} />
            <Route path="bundles/:slug" element={<BundleDetail />} />
            <Route path="mentorship" element={<Mentorship />} />
            <Route path="mentorship-all" element={<Navigate to="/mentorship" replace />} />
            <Route path="mentorship/:slug" element={<MentorDetail />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="about-us" element={<About />} />
            <Route path="authentication" element={<Authentication />} />
            <Route path="ai-mentor" element={<AiMentor />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="payment/:outcome" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
            <Route path="instructor/:slug" element={<InstructorProfile />} />
            <Route path="become-an-instructor" element={<BecomeInstructor />} />
            <Route path="become-a-teacher" element={<BecomeInstructor />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<StaticPage slug="privacy-policy" />} />
            <Route path="terms-and-conditions" element={<StaticPage slug="terms-and-conditions" />} />
            <Route path="refund-policy" element={<StaticPage slug="refund-policy" />} />
            <Route path="accreditations" element={<StaticPage slug="accreditations" />} />
            <Route path="user-guidelines" element={<StaticPage slug="user-guidelines" />} />
            <Route path="diu-osol-program" element={<StaticPage slug="diu-osol-program" />} />
            <Route path="pages/:slug" element={<StaticPage />} />

            <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="my-learning" element={<MyLearning />} />
              <Route path="learn/:slug" element={<CoursePlayer />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="profile" element={<Profile />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="subscription-resources" element={<SubscriptionResources />} />
              <Route path="video-library" element={<VideoLibrary />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
