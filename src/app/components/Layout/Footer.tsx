// src/app/components/Layout/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 text-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="inline-block mb-3">
              <img
                src="/media/logos/logo.png"
                alt="Katogo"
                className="h-8 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[180px]">
              Uganda's home for Luganda-translated movies, series, live TV and more.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Facebook size={17} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Twitter size={17} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Youtube size={17} />
              </a>
            </div>
          </div>

          {/* Watch */}
          <div>
            <h4 className="text-white font-semibold mb-3">Watch</h4>
            <ul className="space-y-2">
              <li><Link to="/movies" className="hover:text-white transition-colors">Movies</Link></li>
              <li><Link to="/series" className="hover:text-white transition-colors">Series</Link></li>
              <li><Link to="/live" className="hover:text-white transition-colors">Live TV</Link></li>
              <li><Link to="/account/watch-history" className="hover:text-white transition-colors">Watch History</Link></li>
              <li><Link to="/account/watchlist" className="hover:text-white transition-colors">My Watchlist</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-3">Info</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Shop</Link></li>
            </ul>
          </div>

          {/* Get the App */}
          <div>
            <h4 className="text-white font-semibold mb-3">Get the App</h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-[9px] text-gray-400 leading-none">Download on the</div>
                  <div className="text-xs font-semibold text-white leading-tight">App Store</div>
                </div>
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d="M3.18 23.58c.3.16.63.24.97.24.37 0 .74-.1 1.06-.29L16.4 17 13 13.6 3.18 23.58zM20.49 9.02l-2.78-1.6-3.96 3.96 3.96 3.97 2.8-1.61c.8-.46 1.28-1.28 1.28-2.17 0-.9-.47-1.77-1.3-2.55zM2.13 1.01C2.05 1.24 2 1.5 2 1.78v20.44c0 .28.05.54.13.78l.09.08 11.45-11.45v-.27L2.22.93l-.09.08zM16.4 7l-11.19-6.46-.09-.08 9.88 9.88L16.4 7z" />
                </svg>
                <div>
                  <div className="text-[9px] text-gray-400 leading-none">Get it on</div>
                  <div className="text-xs font-semibold text-white leading-tight">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {year} Katogo. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
