import { useQuery } from '@tanstack/react-query';
import Seo from '../components/common/Seo';
import { PageHero } from '../components/common/ui';
import { SiteApi } from '../services/api';

const FALLBACK = `<p>GoEdu is an online course platform offering professional online self-paced courses in Bangladesh. GoEdu aims to contribute to developing personal and professional skills, abilities, and traits of individuals by offering online self-paced courses. GoEdu understands that it is tough for learners to only depend on their academic institutions to fully equip them for their careers and profession. GoEdu with its courses tries to create a bridge to cover the gap that lies between the latest industry requirements and the actual skills and knowledge of the professional people and adult learners. Since it is based in Bangladesh, GoEdu focuses on equipping the local professionals preferably with their own language.</p><p>GoEdu is also helping people develop the skills and knowledge necessary to create and run an online course in just a few clicks. It’s a modern and affordable way for anyone to earn a living doing what they love and is open to everyone.</p><h2>Our Values</h2><p>We believe in and, therefore, value instructor success because we know that if instructors succeed in helping learners learn new skills or knowledge effectively, our main stakeholders, the learners will automatically value the organization. We keep the learners in mind and ensure the best support to them so that they can effectively learn new knowledge, skills, and abilities through our platform.</p>`;

export default function About() {
  const q = useQuery({ queryKey: ['page', 'about-us'], queryFn: () => SiteApi.page('about-us') });
  const content = q.data?.page?.content || FALLBACK;
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <Seo title="About Us" description="GoEdu is an online course platform offering professional online self-paced courses in Bangladesh." />
      <PageHero title="About Us" crumbs={[{ label: 'About Us' }]} />
      <section className="py-8 md:py-12 lg:py-16 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <article className="overflow-hidden transition-colors duration-300">
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="rich-content prose-p:text-[15px] max-w-none font-poppins [&_h2]:text-center [&_h2]:relative [&_h2]:font-bold" dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
