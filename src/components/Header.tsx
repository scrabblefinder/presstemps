
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const categories = [
  { name: "All", slug: "all" },
  { name: "Politics", slug: "politics" },
  { name: "US", slug: "us" },
  { name: "World News", slug: "world" },
  { name: "Sports", slug: "sports" },
  { name: "Business", slug: "business" },
  { name: "Technology", slug: "technology" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Science", slug: "science" },
  { name: "Lifestyle", slug: "lifestyle" }
];

interface HeaderProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

export function Header({ onCategoryChange, activeCategory }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCategoryClick = (slug: string) => {
    onCategoryChange(slug);
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full bg-paper-light border-b border-paper-dark" role="banner">
      <div className="container mx-auto px-4">
        <div className="relative py-6">
          <button 
            onClick={() => handleCategoryClick('all')}
            className="block text-center w-full"
            aria-label="Go to homepage"
          >
            <h1 
              className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-ink-dark hover:text-ink transition-colors"
              itemProp="headline"
            >
              PressTemps
            </h1>
            <p 
              className="mt-2 text-ink-light font-inter text-xs md:text-sm tracking-wider"
              itemProp="description"
            >
              YOUR SOURCE FOR LATEST NEWS
            </p>
          </button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden border-t border-paper-dark py-3 flex justify-center">
          <button
            onClick={toggleMenu}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white shadow-sm text-ink-dark"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <>
                <X className="h-5 w-5" />
                <span>Close Menu</span>
              </>
            ) : (
              <>
                <Menu className="h-5 w-5" />
                <span>Browse Categories</span>
              </>
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-4 bg-white rounded-lg shadow-md mb-4">
            <ul className="flex flex-col">
              {categories.map((category) => (
                <li key={category.slug}>
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className={`w-full text-left px-6 py-3 font-inter text-sm transition-all
                      ${activeCategory === category.slug 
                        ? 'text-blue-600 font-medium bg-blue-50' 
                        : 'text-ink-light hover:text-ink-dark hover:bg-gray-50'}`}
                    aria-current={activeCategory === category.slug ? 'page' : undefined}
                    aria-label={`View ${category.name} news`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Desktop menu */}
        <nav 
          className="hidden md:block py-4 border-y border-paper-dark"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  onClick={() => onCategoryChange(category.slug)}
                  className={`font-inter text-sm md:text-base uppercase tracking-wide transition-all
                    ${activeCategory === category.slug 
                      ? 'text-blue-600 font-medium' 
                      : 'text-ink-light hover:text-ink-dark hover:font-bold'}
                    relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 
                    after:bg-blue-600 after:transform after:scale-x-0 hover:after:scale-x-100 
                    after:transition-transform after:duration-300 after:origin-left pb-1`}
                  aria-current={activeCategory === category.slug ? 'page' : undefined}
                  aria-label={`View ${category.name} news`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
