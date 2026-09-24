import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, BookOpen, Building2, ShieldCheck } from 'lucide-react';
import Seo from '../components/common/Seo';
import ContentLoader from '../components/common/ContentLoader';
import CourseCard from '../components/common/CourseCard';
import { EmptyState } from '../components/common/ui';
import { InstructorApi } from '../services/api';
import { img } from '../utils/format';

export default function InstructorProfile() {
  const { slug } = useParams();
  const q = useQuery({ queryKey: ['instructor', slug], queryFn: () => InstructorApi.detail(slug) });
  const i = q.data?.instructor;
  if (q.isLoading) return <ContentLoader />;
  if (!i) return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">Instructor not found</h1><Link to="/courses" className="text-[#F3AC08] font-semibold">Browse courses</Link></div>;
  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-20 md:pt-24 pb-16">
      <Seo title={i.name} description={i.about || `${i.name} - instructor on GoEdu`} image={i.photo} />
      <section className="relative mt-5 overflow-hidden bg-gradient-to-b from-[#FFF4D3] to-[#FCD53F] dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
          <img src={img(i.photo)} alt={i.name} className="w-36 h-36 md:w-44 md:h-44 rounded-3xl object-cover bg-white shadow-xl border-4 border-white" />
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">{i.name} {i.is_featured && <ShieldCheck className="w-6 h-6 text-[#b57d05]" />}</h1>
            <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">{i.designation}{i.institute_name ? ` · ${i.institute_name}` : ''}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-gray-800 px-3 py-1.5 rounded-full"><Award className="w-4 h-4 text-[#b57d05]" /> {i.total_student_enrolled} Students</span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-gray-800 px-3 py-1.5 rounded-full"><BookOpen className="w-4 h-4 text-[#b57d05]" /> {i.total_course} Courses</span>
              {i.institute_name && <span className="flex items-center gap-1.5 bg-white/70 dark:bg-gray-800 px-3 py-1.5 rounded-full"><Building2 className="w-4 h-4 text-[#b57d05]" /> {i.institute_name}</span>}
            </div>
            {i.is_mentor && <Link to={`/mentorship/${i.slug}`} className="inline-block mt-5 px-6 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-bold">Book a 1:1 session</Link>}
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">About</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{i.about || `${i.name} teaches on GoEdu, Bangladesh's GEAC accredited online course platform.`}</p>
            {i.specialties.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{i.specialties.map((s) => <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-gray-700 text-[#b57d05] dark:text-amber-300">{s}</span>)}</div>}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Courses by {i.name} ({i.courses.length})</h2>
          {i.courses.length ? <div className="grid sm:grid-cols-2 gap-6">{i.courses.map((c) => <CourseCard key={c.id} course={c} />)}</div> : <EmptyState icon={BookOpen} title="No published courses yet" />}
        </div>
      </div>
    </div>
  );
}
