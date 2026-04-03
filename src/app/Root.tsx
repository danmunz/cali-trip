import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { tripMeta } from '../data/trip-meta.generated';

const navLinks = [
  { path: '/', label: 'Overview' },
  { path: '/lodging', label: 'Lodging' },
  { path: '/itinerary', label: 'Experience' },
  { path: '/full-itinerary', label: 'Full Itinerary' },
  { path: '/now', label: 'Now', live: true },
] as const;

export default function Root() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu when viewport crosses the sm breakpoint (hamburger becomes hidden)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-base tracking-tight text-gray-900 font-semibold">
                {tripMeta.title}
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-8">
              {navLinks.map(({ path, label, ...rest }) => (
                <Link
                  key={path}
                  to={path}
                  className={`text-xs tracking-wider uppercase transition-colors font-medium inline-flex items-center gap-1.5 ${
                    isActive(path)
                      ? 'text-[#b8956d]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {'live' in rest && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8956d] opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b8956d]" />
                    </span>
                  )}
                  {label}
                </Link>
              ))}
            </div>

            {/* Hamburger button */}
            <button
              className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={`sm:hidden overflow-hidden transition-all duration-200 ease-in-out bg-white/95 backdrop-blur-sm border-t border-gray-100 ${
            menuOpen ? 'max-h-80' : 'max-h-0'
          }`}
        >
          <div className="px-6 py-4 space-y-1">
            {navLinks.map(({ path, label, ...rest }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 py-3 text-sm tracking-wider uppercase font-medium transition-colors ${
                  isActive(path)
                    ? 'text-[#b8956d]'
                    : 'text-gray-600 active:text-gray-900'
                }`}
              >
                {'live' in rest && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8956d] opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b8956d]" />
                  </span>
                )}
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <Outlet />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-12 sm:py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-lg mb-2 font-medium">{tripMeta.title}</p>
          <p className="text-sm text-gray-400">{tripMeta.subtitle.replace(' | ', ' \u2022 ')}</p>
        </div>
      </footer>
    </div>
  );
}
