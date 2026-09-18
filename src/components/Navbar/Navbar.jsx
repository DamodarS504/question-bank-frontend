/** src/components/Navbar/Navbar.jsx */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features',     href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Roles',        href: '#roles' },
    { label: 'Dashboard',    href: '#dashboard' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="container navbar__inner">
        <a href="#" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="url(#logoGrad)" />
              <path d="M8 9h12M8 14h8M8 19h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="20" cy="19" r="2.5" fill="none" stroke="#5eead4" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#0d9488"/>
                  <stop offset="1" stopColor="#059669"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar__logo-text">Question<span>Hub</span></span>
        </a>

        <ul className="navbar__links">
          {navLinks.map(link => (
            <li key={link.label}>
              <a href={link.href} className="navbar__link">{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          <Link to="/login" className="btn-primary navbar__cta" id="nav-get-started">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="nav-hamburger"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`navbar__mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <a key={link.label} href={link.href} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
        <div className="navbar__mobile-auth">
          <Link to="/login" className="btn-primary" onClick={() => setMenuOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
