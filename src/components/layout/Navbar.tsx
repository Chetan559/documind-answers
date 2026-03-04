import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

const Navbar = () => {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-sm border-b border-border/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-display text-xl text-primary">DocuMind</span>
        </Link>

        {isLanding && (
          <div className="hidden md:flex items-center gap-8">
            {['features', 'pricing', 'reviews'].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize font-body"
                aria-label={`Scroll to ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/upload"
            className="text-sm px-5 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95 font-body"
            aria-label="Get Started Free"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
