import { Helmet } from 'react-helmet-async';

const SITE = 'GoEdu';
const DEFAULT_DESC =
  'Get the best accredited professional online courses in Bangladesh. Learn at your pace, build skills, and get certified! 250+ online courses in Bengali.';

export default function Seo({ title, description = DEFAULT_DESC, image = '/images/og-image.jpg', type = 'website', noIndex = false }) {
  const full = title ? (title.includes(SITE) ? title : `${title} | ${SITE}`) : 'GoEdu: Online Courses in Bangladesh with Certificates';
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
