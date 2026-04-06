import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { tripMeta } from '../data/trip-meta.generated';
import { ChevronDown } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Overview' },
  { path: '/lodging', label: 'Lodging' },
  { path: '/itinerary', label: 'Experience' },
  { path: '/full-itinerary', label: 'Full Itinerary' },
  {
    path: '/drives',
    label: 'Drives',
    children: [
      { path: '/drives/napa-to-yosemite', label: 'Napa → Yosemite' },
      { path: '/drives/yosemite-to-carmel', label: 'Yosemite → Carmel' },
    ],
  },
  { path: '/now', label: 'Now', live: true },
] as const;

export default function Root() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drivesOpen, setDrivesOpen] = useState(false);
  const [mobileDrivesOpen, setMobileDrivesOpen] = useState(false);
  const drivesRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDrivesOpen(false);
    setMobileDrivesOpen(false);
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

  // Close drives dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (drivesRef.current && !drivesRef.current.contains(e.target as Node)) {
        setDrivesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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

  const linkClasses = (path: string) =>
    `text-xs tracking-wider uppercase transition-colors font-medium inline-flex items-center gap-1.5 ${
      isActive(path) ? 'text-[#b8956d]' : 'text-gray-600 hover:text-gray-900'
    }`;

  const mobileLinkClasses = (path: string) =>
    `flex items-center gap-2 py-3 text-sm tracking-wider uppercase font-medium transition-colors ${
      isActive(path) ? 'text-[#b8956d]' : 'text-gray-600 active:text-gray-900'
    }`;

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
              {navLinks.map((item) => {
                if ('children' in item) {
                  // Drives dropdown
                  return (
                    <div key={item.path} ref={drivesRef} className="relative">
                      <button
                        onClick={() => setDrivesOpen(!drivesOpen)}
                        className={`${linkClasses(item.path)} cursor-pointer`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${drivesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {drivesOpen && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                isActive(child.path)
                                  ? 'text-[#b8956d] bg-amber-50/50'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={linkClasses(item.path)}
                  >
                    {'live' in item && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8956d] opacity-60" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b8956d]" />
                      </span>
                    )}
                    {item.label}
                  </Link>
                );
              })}
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
            menuOpen ? 'max-h-[32rem]' : 'max-h-0'
          }`}
        >
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((item) => {
              if ('children' in item) {
                return (
                  <div key={item.path}>
                    <button
                      onClick={() => setMobileDrivesOpen(!mobileDrivesOpen)}
                      className={`${mobileLinkClasses(item.path)} w-full justify-between cursor-pointer`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${mobileDrivesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        mobileDrivesOpen ? 'max-h-40' : 'max-h-0'
                      }`}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block pl-5 py-2.5 text-sm font-medium transition-colors ${
                            isActive(child.path)
                              ? 'text-[#b8956d]'
                              : 'text-gray-500 active:text-gray-900'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={mobileLinkClasses(item.path)}
                >
                  {'live' in item && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8956d] opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b8956d]" />
                    </span>
                  )}
                  {item.label}
                </Link>
              );
            })}
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
