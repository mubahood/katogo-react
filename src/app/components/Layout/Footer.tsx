// src/app/components/Layout/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { APP_LINKS, SOCIAL_MEDIA, COMPANY_INFO } from "../../constants";
import { usePwaInstall, isIos } from "../../hooks/usePwaInstall";
import { Download, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

/* ── Social icons ──────────────────────────────────────────────────────── */
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z" />
  </svg>
);

const PlayStoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3.18 23.58c.3.16.63.24.97.24.37 0 .74-.1 1.06-.29L16.4 17 13 13.6 3.18 23.58zM20.49 9.02l-2.78-1.6-3.96 3.96 3.96 3.97 2.8-1.61c.8-.46 1.28-1.28 1.28-2.17 0-.9-.47-1.77-1.3-2.55zM2.13 1.01C2.05 1.24 2 1.5 2 1.78v20.44c0 .28.05.54.13.78l.09.08 11.45-11.45v-.27L2.22.93l-.09.08zM16.4 7l-11.19-6.46-.09-.08 9.88 9.88L16.4 7z" />
  </svg>
);

const AppStoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

/* ── Nav sections ──────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    title: "Explore",
    links: [
      { label: "Movies",    to: "/movies" },
      { label: "Shop",      to: "/products" },
      { label: "Trending",  to: "/movies?sort=trending" },
      { label: "New Arrivals", to: "/movies?sort=new" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard",      to: "/account/dashboard" },
      { label: "Subscriptions",  to: "/account/subscriptions" },
      { label: "My Orders",      to: "/account/orders" },
      { label: "Settings",       to: "/account/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",    to: "/about" },
      { label: "Contact",     to: "/contact" },
      { label: "FAQ",         to: "/faq" },
      { label: "Help Center", to: "/help" },
    ],
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */
const Footer: React.FC = () => {
  const { canInstall, installed, install } = usePwaInstall();
  const ios = isIos();

  return (
    <footer className="bg-[#09090b] border-t border-white/[0.05]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top section ─────────────────────────────────────────────── */}
        <div className="pt-12 pb-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 border-b border-white/[0.05]">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/" className="no-underline inline-block mb-4">
              <img
                src="/media/logos/logo-2.svg"
                alt="UgFlix"
                className="h-8 w-auto"
                style={{ maxWidth: 160 }}
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.nextElementSibling?.removeAttribute("style");
                }}
              />
              <span
                style={{ display: "none" }}
                className="text-white font-bold text-xl tracking-tight"
              >
                UgFlix
              </span>
            </Link>

            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[260px] mb-6">
              Uganda's home for Luganda-translated movies and quality electronics. Stream, shop, enjoy.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <a
                href={`mailto:${COMPANY_INFO.EMAIL}`}
                className="no-underline flex items-center gap-2 text-[12px] text-gray-500 hover:text-gray-300 transition-colors group"
              >
                <Mail size={13} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                {COMPANY_INFO.EMAIL}
              </a>
              <a
                href={`tel:${COMPANY_INFO.PHONE}`}
                className="no-underline flex items-center gap-2 text-[12px] text-gray-500 hover:text-gray-300 transition-colors group"
              >
                <Phone size={13} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                {COMPANY_INFO.PHONE}
              </a>
              <span className="flex items-center gap-2 text-[12px] text-gray-600">
                <MapPin size={13} className="flex-shrink-0" />
                {COMPANY_INFO.ADDRESS}
              </span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {[
                { href: SOCIAL_MEDIA.TWITTER,   Icon: TwitterIcon,   label: "Twitter / X" },
                { href: SOCIAL_MEDIA.FACEBOOK,  Icon: FacebookIcon,  label: "Facebook" },
                { href: SOCIAL_MEDIA.INSTAGRAM, Icon: InstagramIcon, label: "Instagram" },
                { href: SOCIAL_MEDIA.TIKTOK,    Icon: TikTokIcon,    label: "TikTok" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="no-underline w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.06] text-gray-500 hover:text-white transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">
                {section.title}
              </p>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {section.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="no-underline text-[13px] text-gray-500 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── App download row ─────────────────────────────────────────── */}
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-white/[0.05]">
          <p className="text-[12px] text-gray-600">
            Get the app — stream and shop on the go
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Google Play */}
            <a
              href={APP_LINKS.ANDROID}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg px-3.5 py-2 transition-all duration-200 group"
            >
              <PlayStoreIcon />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-gray-500 uppercase tracking-wide">Get it on</span>
                <span className="text-[12px] font-semibold text-gray-300 group-hover:text-white transition-colors">Google Play</span>
              </div>
            </a>

            {/* App Store */}
            <a
              href={APP_LINKS.IOS}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg px-3.5 py-2 transition-all duration-200 group"
            >
              <AppStoreIcon />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-gray-500 uppercase tracking-wide">Download on the</span>
                <span className="text-[12px] font-semibold text-gray-300 group-hover:text-white transition-colors">App Store</span>
              </div>
            </a>

            {/* PWA install */}
            {canInstall && !installed && !ios && (
              <button
                onClick={() => install()}
                className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg px-3.5 py-2 transition-all duration-200 group cursor-pointer"
              >
                <Download size={15} className="text-gray-500 group-hover:text-white transition-colors" />
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-[9px] text-gray-500 uppercase tracking-wide">Install as</span>
                  <span className="text-[12px] font-semibold text-gray-300 group-hover:text-white transition-colors">Web App</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────────── */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-gray-600 order-2 sm:order-1">
            © {new Date().getFullYear()} {COMPANY_INFO.NAME}. All rights reserved.
          </p>

          <div className="flex items-center gap-4 order-1 sm:order-2">
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms of Service", to: "/terms" },
              { label: "Contact", to: "/contact" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="no-underline text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
