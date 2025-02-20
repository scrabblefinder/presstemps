
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-paper-light border-t border-paper-dark mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-ink-light text-sm">
            © {currentYear} PressTemps. All rights reserved.
          </div>
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <Link to="/about" className="text-sm text-ink-light hover:text-ink-dark transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-ink-light hover:text-ink-dark transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-ink-light hover:text-ink-dark transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
