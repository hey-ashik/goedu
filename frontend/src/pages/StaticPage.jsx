import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Seo from '../components/common/Seo';
import ContentLoader from '../components/common/ContentLoader';
import { PageHero } from '../components/common/ui';
import { SiteApi } from '../services/api';

export default function StaticPage({ slug: fixedSlug }) {
  const params = useParams();
  const slug = fixedSlug || params.slug;
  const q = useQuery({ queryKey: ['page', slug], queryFn: () => SiteApi.page(slug) });
  if (q.isLoading) return <ContentLoader />;
  if (!q.data?.page) return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">Page not found</h1><Link to="/" className="text-[#F3AC08] font-semibold">Go home</Link></div>;
  const page = q.data.page;
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <Seo title={page.title} />
      <PageHero title={page.title} crumbs={[{ label: page.title }]} />
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 md:p-12">
            <div className="rich-content max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
          </article>
        </div>
      </section>
    </div>
  );
}
