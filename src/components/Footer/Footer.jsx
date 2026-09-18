/** src/components/Footer/Footer.jsx */
import { FOOTER_LINKS } from '../../constants/footer';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="28" height="28" rx="7" fill="url(#footerLogoGrad)"/>
                  <path d="M8 9h12M8 14h8M8 19h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="20" cy="19" r="2.5" fill="none" stroke="#5eead4" strokeWidth="1.5"/>
                  <defs>
                    <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="28" y2="28">
                      <stop stopColor="#0d9488"/>
                      <stop offset="1" stopColor="#059669"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="footer__logo-text">Question<span>Hub</span></span>
            </div>
            <p className="footer__tagline">
              One centralised platform for interview preparation — from question creation to employee readiness.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div className="footer__links-group" key={group}>
              <h4 className="footer__group-title">{group}</h4>
              <ul className="footer__link-list">
                {links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="footer__link">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} QuestionHub. Internal Interview Preparation Platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
