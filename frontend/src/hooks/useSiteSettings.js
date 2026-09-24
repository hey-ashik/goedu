import { useQuery } from '@tanstack/react-query';
import { SiteApi } from '../services/api';

const DEFAULTS = {
  footer_description:
    'GoEdu is your trusted partner for online learning in Bangladesh, offering accredited courses, expert instructors, and flexible study options for students, job seekers, and working professionals. Learn from anywhere, build in‑demand skills, and transform your future with certificates that matter.',
  contact_email: 'info@goedu.ac',
  contact_phone: '+8801811458830',
  contact_address: '102/1 Shukrabad, Mirpur Road, Dhanmondi, Dhaka -1207.',
  social_facebook: 'https://www.facebook.com/goedu.ac',
  social_linkedin: 'https://www.linkedin.com/company/goedu/',
  social_youtube: 'https://www.youtube.com/@GoEduOnlineCourses',
  social_instagram: 'https://www.instagram.com/goeducourses/',
  review_google: 'https://share.google/rICEisIFIOluFxzob',
  review_trustpilot: 'https://www.trustpilot.com/review/goedu.ac',
  review_facebook: 'https://www.facebook.com/goedu.ac/reviews/?id=100063819511857&sk=reviews',
  stats_courses: '286',
  stats_learners: '100,000',
  stats_instructors: '204',
  stats_satisfaction: '96',
};

const FALLBACK_LINKS = {
  left: [
    { id: 'l1', title: 'About Us', link: '/about-us' },
    { id: 'l2', title: 'Accreditations', link: '/accreditations' },
    { id: 'l3', title: 'News & articles', link: '/blog' },
  ],
  middle: [
    { id: 'm1', title: 'Become and Instructor', link: '/become-a-teacher' },
    { id: 'm2', title: 'User Guidelines', link: '/user-guidelines' },
    { id: 'm3', title: 'DIU OSOL Program', link: '/diu-osol-program' },
  ],
  right: [
    { id: 'r1', title: 'Privacy Policy', link: '/privacy-policy' },
    { id: 'r2', title: 'Terms and Conditions', link: '/terms-and-conditions' },
    { id: 'r3', title: 'Refund Policy', link: '/refund-policy' },
  ],
};

export function useSiteSettings() {
  const { data } = useQuery({ queryKey: ['site-settings'], queryFn: SiteApi.settings, staleTime: 10 * 60 * 1000 });
  return {
    settings: { ...DEFAULTS, ...(data?.settings || {}) },
    footerLinks: data?.footer_links && (data.footer_links.left.length || data.footer_links.right.length) ? data.footer_links : FALLBACK_LINKS,
    languages: data?.languages || [],
  };
}
