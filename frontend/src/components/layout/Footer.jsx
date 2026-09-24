import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SiteApi } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const toRoute = (link = '') => {
  if (/^https?:/i.test(link)) return link;
  const l = link.replace(/\/$/, '');
  return l.startsWith('/') ? l : `/${l}`;
};

export default function Footer() {
  const { settings, footerLinks } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const res = await SiteApi.newsletter(email);
      toast.success(res.message || 'Subscribed!');
      setEmail('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const social = [
    { href: settings.social_facebook, label: 'Facebook', Icon: Facebook },
    { href: settings.social_linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: settings.social_youtube, label: 'YouTube', Icon: Youtube },
    { href: settings.social_instagram, label: 'Instagram', Icon: Instagram },
  ].filter((s) => s.href);

  const columns = [
    { title: 'Company', links: footerLinks.left },
    { title: 'Resources', links: footerLinks.middle },
    { title: 'Legal', links: footerLinks.right },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8 lg:gap-4">
          <div className="xl:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative h-10 w-32">
                <img src="/logo.webp" alt="GoEdu" className="object-contain h-full w-full" />
              </div>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{settings.footer_description}</p>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Newsletter</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subscribe to get updates on new courses and educational content</p>
              <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2">
                <input type="text" className="absolute opacity-0 pointer-events-none" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  required
                  maxLength={254}
                />
                <button type="submit" disabled={busy} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium min-w-[120px]">
                  Subscribe {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.id}>
                    {/^https?:/i.test(l.link) ? (
                      <a href={l.link} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors duration-200">{l.title}</a>
                    ) : (
                      <Link to={toRoute(l.link)} className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors duration-200">{l.title}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors duration-200">{settings.contact_email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a href={`tel:${settings.contact_phone}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors duration-200">{settings.contact_phone}</a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{settings.contact_address}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Follow Us</h4>
              <div className="flex items-center gap-3">
                {social.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 hover:text-amber-600 transition-all duration-200">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4 sm:pt-0">
        <div className="w-full flex justify-center items-center bg-transparent rounded-xl p-4">
          <img src="/images/SSLCommerz.png" alt="SSLCommerz Payment Methods" width="1000" height="150" className="w-full max-w-5xl h-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:rounded-xl dark:p-2" />
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">© {new Date().getFullYear()} GoEdu. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Powered by GoEdu</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
