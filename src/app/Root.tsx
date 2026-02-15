import { Outlet, Link, useLocation } from 'react-router';

export default function Root() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]" style={{ fontFamily: "'Crimson Pro', serif" }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-base tracking-tight text-gray-900 font-semibold" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                Susan's 70th
              </span>
            </Link>
            <div className="flex items-center gap-8">
              {[
                { path: '/', label: 'Overview' },
                { path: '/lodging', label: 'Lodging' },
                { path: '/itinerary', label: 'Itinerary' },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`text-xs tracking-wider uppercase transition-colors font-medium ${
                    isActive(path)
                      ? 'text-[#b8956d]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  );
}