import { useQuery } from '@tanstack/react-query';
import Seo from '../components/common/Seo';
import Hero from '../components/home/Hero';
import TrustedSection from '../components/home/TrustedSection';
import BundleSection from '../components/home/BundleSection';
import PopularCourses from '../components/home/PopularCourses';
import InstructorsSection from '../components/home/InstructorsSection';
import WhyTrustSection from '../components/home/WhyTrustSection';
import TopPicksSection from '../components/home/TopPicksSection';
import AiCtaSection from '../components/home/AiCtaSection';
import BlogSection from '../components/home/BlogSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import { CourseApi, SiteApi } from '../services/api';

export default function Home() {
  const home = useQuery({ queryKey: ['home'], queryFn: SiteApi.home });
  const picks = useQuery({ queryKey: ['top-picks'], queryFn: () => CourseApi.topPicks(12) });

  return (
    <>
      <Seo />
      <Hero />
      <TrustedSection />
      <BundleSection featured={home.data?.featured_bundle} bundles={home.data?.bundles || []} />
      <PopularCourses />
      <InstructorsSection instructors={home.data?.instructors || []} />
      <WhyTrustSection />
      <TopPicksSection courses={picks.data?.results || []} loading={picks.isLoading} />
      <AiCtaSection />
      <BlogSection articles={home.data?.articles || []} loading={home.isLoading} />
      <TestimonialsSection testimonials={home.data?.testimonials || []} loading={home.isLoading} />
    </>
  );
}
